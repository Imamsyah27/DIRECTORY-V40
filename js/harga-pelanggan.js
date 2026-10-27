/**
 * Menu "Harga Pelanggan" (PRICE): harga istimewa per akun (harian Rp + USDT + Bot) yang TERLIHAT pelanggan, harga normal dicoret.
 * Untuk harga tersembunyi (menaikkan harga) lihat js/custom-price.js.
 * Rupiah = harga yang dibayar (koin); USDT = pembanding yang tampil di Daftar Harga pelanggan tersebut.
 * Butuh sql/koin-usdt-1…7 (7 bagian) dan -11 (harga item lain, lihat js/price-items.js).
 */
const hpEl = id => document.getElementById(id);
const hpPin = () => sessionStorage.getItem("akun_admin_pin");
const hpRp = n => "Rp " + Number(n || 0).toLocaleString("id-ID");
let hpBound = false, hpData = null;

async function hpRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: hpPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (m.includes("PIN admin salah")) { sessionStorage.removeItem("akun_admin_pin"); hpEl("hpPinGate").style.display = "block"; hpEl("hpContent").style.display = "none"; showToast("PIN admin tidak valid, masukkan ulang", "danger"); }
        else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/koin-usdt-1…7 (7 bagian) di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}
function initHargaPelangganPage() {
    if (!hpBound) {
        hpBound = true;
        const submit = () => { const pin = hpEl("hpPinInput").value; if (!pin) { showToast("Masukkan PIN admin", "danger"); return; } sessionStorage.setItem("akun_admin_pin", pin); hpEl("hpPinInput").value = ""; hpLoad(); };
        hpEl("hpPinSubmit").addEventListener("click", submit);
        hpEl("hpPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        hpEl("hpAdd").addEventListener("click", () => hpForm(null));
    }
    if (hpPin()) hpLoad(); else { hpEl("hpPinGate").style.display = "block"; hpEl("hpContent").style.display = "none"; }
}
async function hpLoad() {
    hpEl("hpPinGate").style.display = "none"; hpEl("hpContent").style.display = "block";
    const { data, error } = await hpRpc("pr_special_list", {});
    if (error || !data) return;
    await piMergeRows(data.special, "special");      // + akun yang hanya punya harga item lain
    hpData = data; hpRender();
}
function hpRender() {
    const s = hpData.settings, list = hpData.special;
    const cell = (idr, usdt, bot, defIdr, defUsdt, defBot) => {
        const a = idr ? `<b>${hpRp(idr)}</b>` : `<span class="pr-def">default ${hpRp(defIdr)}</span>`;
        const b = usdt ? `<b>${usdt} USDT</b>` : (defUsdt > 0 ? `<span class="pr-def">default ${defUsdt} USDT</span>` : `<span class="pr-def">— USDT</span>`);
        const c = bot ? `<b>${hpRp(bot)}</b> / tagar` : `<span class="pr-def">default ${hpRp(defBot)}</span>`;
        return `<div>${a}</div><div class="hp-usdt">${b}</div><div class="hp-usdt">🤖 ${c}</div>`;
    };
    hpEl("hpEmpty").style.display = list.length ? "none" : "flex";
    hpEl("hpBody").innerHTML = list.map(r => `<tr><td><b>${escapeHtml(r.username)}</b></td>
        <td>${cell(r.bem, r.usdt_bem, r.bot_bem, s.bem, s.usdt_bem, s.bot_bem)}</td><td>${cell(r.sem, r.usdt_sem, r.bot_sem, s.sem, s.usdt_sem, s.bot_sem)}</td><td>${cell(r.lem, r.usdt_lem, r.bot_lem, s.lem, s.usdt_lem, s.bot_lem)}</td>
        <td>${piCell(r._n)}</td><td>${escapeHtml(r.catatan || "")}</td>
        <td><div class="actions-cell"><button type="button" class="btn btn-ghost btn-icon" onclick="hpForm(${r.customer_id})" title="Ubah">✏️</button>
        <button type="button" class="btn btn-danger btn-icon" onclick="hpDelete(${r.customer_id})" title="Hapus">🗑</button></div></td></tr>`).join("");
}
async function hpForm(customerId) {
    const cur = customerId ? hpData.special.find(x => x.customer_id === customerId) : null;
    let options = "";
    if (!cur) {
        const { data, error } = await supabaseClient.rpc("admin_list_customer_accounts", { p_admin_pin: hpPin() });
        if (error) { showToast(error.message || "Gagal memuat pelanggan", "danger"); return; }
        const taken = new Set(hpData.special.map(x => x.customer_id));
        const avail = (data || []).filter(c => !taken.has(c.id)).sort((a, b) => a.username.localeCompare(b.username));
        if (!avail.length) { showToast("Semua akun pelanggan sudah ada di daftar", "info"); return; }
        options = avail.map(c => `<option value="${c.id}">${escapeHtml(c.username)}</option>`).join("");
    }
    const pi = await piFetch("special", customerId);
    const s = hpData.settings, v = (x) => x ? x : "";
    const row = (n, k) => `<div class="hp-form-row"><b>${n}</b>
        <input type="number" id="hpI${n}" min="0" inputmode="numeric" placeholder="${s[k]}" value="${v(cur && cur[k])}">
        <input type="number" id="hpU${n}" min="0" step="0.0001" inputmode="decimal" placeholder="${s["usdt_" + k] || "-"}" value="${v(cur && cur["usdt_" + k])}">
        <input type="number" id="hpB${n}" min="0" inputmode="numeric" placeholder="${s["bot_" + k] || "-"}" value="${v(cur && cur["bot_" + k])}"></div>`;
    modalBox.innerHTML = `<div class="modal-icon info">⭐</div><div class="modal-title">${cur ? "Ubah" : "Tambah"} Harga Pelanggan</div>
        <div class="modal-form">
            <div class="field"><label>Pelanggan</label>${cur ? `<input type="text" value="${escapeHtml(cur.username)}" disabled>` : `<select id="hpCust">${options}</select>`}</div>
            <div class="hp-form-head"><span></span><span>Harian Rp/hari</span><span>USDT/hari</span><span>🤖 Bot Rp/tagar</span></div>
            ${row("BEM", "bem")}${row("SEM", "sem")}${row("LEM", "lem")}
            <div class="pr-imghint">Angka abu-abu = harga umum. Kosongkan kolom yang ingin memakai harga umum. Pelanggan melihat harga normal dicoret. Harga harian &amp; bot dibayar dengan koin (tanpa diskon umum); USDT hanya pembanding.</div>
            ${piHtml(pi, "special")}
            <div class="field"><label for="hpNote">Catatan (opsional)</label><input type="text" id="hpNote" maxlength="200" value="${escapeHtml(cur ? cur.catatan || "" : "")}"></div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="hpNo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="hpYes">Simpan</button></div>`;
    modalOverlay.classList.add("show"); piBind();
    hpEl("hpNo").addEventListener("click", closeModal);
    hpEl("hpYes").addEventListener("click", async () => {
        const gi = id => parseInt(hpEl(id).value, 10) || 0, gu = id => parseFloat(hpEl(id).value) || 0;
        const id = cur ? cur.customer_id : Number(hpEl("hpCust").value);
        const { error } = await hpRpc("pr_special_save", { p_customer_id: id, p_bem: gi("hpIBEM"), p_sem: gi("hpISEM"), p_lem: gi("hpILEM"),
            p_catatan: hpEl("hpNote").value.trim(), p_usdt_bem: gu("hpUBEM"), p_usdt_sem: gu("hpUSEM"), p_usdt_lem: gu("hpULEM"),
            p_bot_bem: gi("hpBBEM"), p_bot_sem: gi("hpBSEM"), p_bot_lem: gi("hpBLEM") });
        if (error) return;
        const pr = await piSave("special", id); if (pr.error) return;
        closeModal(); showToast("Daftar harga pelanggan disimpan", "success"); hpLoad();
    });
}
function hpDelete(id) {
    const r = hpData.special.find(x => x.customer_id === id); if (!r) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus daftar harga?", body: `<b>${escapeHtml(r.username)}</b> kembali memakai harga default dan bisa mendapat diskon umum.`, confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await hpRpc("pr_special_delete", { p_customer_id: id }); await piRpc("pi_delete", { p_kind: "special", p_customer_id: id }); if (!error) { showToast("Daftar harga dihapus", "danger"); hpLoad(); } } });
}
