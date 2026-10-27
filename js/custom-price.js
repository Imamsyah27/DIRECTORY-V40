/**
 * Menu "Custom Price" (SETTING): harga BEM / SEM / LEM harian + Bot yang TERSEMBUNYI per akun pelanggan,
 * biasanya lebih mahal dari harga umum. Pelanggan melihatnya sebagai harga biasa (tanpa coretan / label).
 * Beda dengan "Harga Pelanggan" (harga istimewa yang terlihat). Butuh sql/koin-usdt-1 (tabel price_custom), -8, dan -11 (harga item lain, lihat js/price-items.js).
 */
const cpEl = id => document.getElementById(id);
const cpPin = () => sessionStorage.getItem("akun_admin_pin");
const cpRp = n => "Rp " + Number(n || 0).toLocaleString("id-ID");
let cpBound = false, cpData = null;

async function cpRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: cpPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (m.includes("PIN admin salah")) { sessionStorage.removeItem("akun_admin_pin"); cpEl("cpPinGate").style.display = "block"; cpEl("cpContent").style.display = "none"; showToast("PIN admin tidak valid, masukkan ulang", "danger"); }
        else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/koin-usdt-1 dan koin-usdt-8 di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}
function initCustomPricePage() {
    if (!cpBound) {
        cpBound = true;
        const submit = () => { const pin = cpEl("cpPinInput").value; if (!pin) { showToast("Masukkan PIN admin", "danger"); return; } sessionStorage.setItem("akun_admin_pin", pin); cpEl("cpPinInput").value = ""; cpLoad(); };
        cpEl("cpPinSubmit").addEventListener("click", submit);
        cpEl("cpPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        cpEl("cpAdd").addEventListener("click", () => cpForm(null));
    }
    if (cpPin()) cpLoad(); else { cpEl("cpPinGate").style.display = "block"; cpEl("cpContent").style.display = "none"; }
}
async function cpLoad() {
    cpEl("cpPinGate").style.display = "none"; cpEl("cpContent").style.display = "block";
    const { data, error } = await cpRpc("cp_list", {});
    if (error || !data) return;
    await piMergeRows(data.custom, "custom");      // + akun yang hanya punya harga item lain
    cpData = data; cpRender();
}
/** selisih terhadap harga umum, hanya untuk admin: "+25%" / "-10%" */
const cpDelta = (v, base) => { if (!v || !base) return ""; const p = Math.round((v - base) / base * 100); return `<span class="cp-delta ${p > 0 ? "up" : p < 0 ? "down" : ""}">${p > 0 ? "+" : ""}${p}%</span>`; };
function cpRender() {
    const s = cpData.settings, list = cpData.custom;
    const cell = (day, bot, usdt, baseDay, baseBot) => {
        const a = day ? `<b>${cpRp(day)}</b> / hari ${cpDelta(day, baseDay)}` : `<span class="pr-def">umum ${cpRp(baseDay)}</span>`;
        const b = bot ? `🤖 <b>${cpRp(bot)}</b> / tagar ${cpDelta(bot, baseBot)}` : `<span class="pr-def">🤖 umum ${cpRp(baseBot)}</span>`;
        return `<div>${a}</div><div class="hp-usdt">${b}</div>${usdt ? `<div class="hp-usdt">${usdt} USDT</div>` : ""}`;
    };
    cpEl("cpEmpty").style.display = list.length ? "none" : "flex";
    cpEl("cpBody").innerHTML = list.map(r => `<tr><td><b>${escapeHtml(r.username)}</b></td>
        <td>${cell(r.bem, r.bot_bem, r.usdt_bem, s.bem, s.bot_bem)}</td><td>${cell(r.sem, r.bot_sem, r.usdt_sem, s.sem, s.bot_sem)}</td><td>${cell(r.lem, r.bot_lem, r.usdt_lem, s.lem, s.bot_lem)}</td>
        <td>${piCell(r._n)}</td><td>${escapeHtml(r.catatan || "")}</td>
        <td><div class="actions-cell"><button type="button" class="btn btn-ghost btn-icon" onclick="cpForm(${r.customer_id})" title="Ubah">✏️</button>
        <button type="button" class="btn btn-danger btn-icon" onclick="cpDelete(${r.customer_id})" title="Hapus">🗑</button></div></td></tr>`).join("");
}
async function cpForm(customerId) {
    const cur = customerId ? cpData.custom.find(x => x.customer_id === customerId) : null;
    let options = "";
    if (!cur) {
        const { data, error } = await supabaseClient.rpc("admin_list_customer_accounts", { p_admin_pin: cpPin() });
        if (error) { showToast(error.message || "Gagal memuat pelanggan", "danger"); return; }
        const taken = new Set(cpData.custom.map(x => x.customer_id));
        const avail = (data || []).filter(c => !taken.has(c.id)).sort((a, b) => a.username.localeCompare(b.username));
        if (!avail.length) { showToast("Semua akun pelanggan sudah punya Custom Price", "info"); return; }
        options = avail.map(c => `<option value="${c.id}">${escapeHtml(c.username)}</option>`).join("");
    }
    const pi = await piFetch("custom", customerId);
    const s = cpData.settings, v = x => x ? x : "";
    const row = (n, k) => `<div class="cp-form-row"><b>${n}</b>
        <input type="number" id="cpD${n}" min="0" inputmode="numeric" placeholder="${s[k]}" value="${v(cur && cur[k])}">
        <input type="number" id="cpB${n}" min="0" inputmode="numeric" placeholder="${s["bot_" + k] || "-"}" value="${v(cur && cur["bot_" + k])}">
        <input type="number" id="cpU${n}" min="0" step="0.0001" inputmode="decimal" placeholder="USDT" value="${v(cur && cur["usdt_" + k])}"></div>`;
    modalBox.innerHTML = `<div class="modal-icon info">🔐</div><div class="modal-title">${cur ? "Ubah" : "Tambah"} Custom Price</div>
        <div class="modal-form">
            <div class="field"><label>Akun pelanggan</label>${cur ? `<input type="text" value="${escapeHtml(cur.username)}" disabled>` : `<select id="cpCust">${options}</select>`}</div>
            <div class="cp-form-head"><span></span><span>Harian Rp/hari</span><span>🤖 Bot Rp/tagar</span><span>USDT/hari</span></div>
            ${row("BEM", "bem")}${row("SEM", "sem")}${row("LEM", "lem")}
            <div class="pr-imghint">Angka abu-abu = harga umum. Isi lebih besar untuk menaikkan harga. Kolom kosong = akun ini memakai harga umum untuk paket itu. USDT hanya pembanding — kosongkan agar pembanding USDT paket itu disembunyikan dari akun ini.</div>
            ${piHtml(pi, "custom")}
            <div class="field"><label for="cpNote">Catatan internal (tidak terlihat pelanggan)</label><input type="text" id="cpNote" maxlength="200" value="${escapeHtml(cur ? cur.catatan || "" : "")}"></div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="cpNo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="cpYes">Simpan</button></div>`;
    modalOverlay.classList.add("show"); piBind();
    cpEl("cpNo").addEventListener("click", closeModal);
    cpEl("cpYes").addEventListener("click", async () => {
        const gi = id => parseInt(cpEl(id).value, 10) || 0, gu = id => parseFloat(cpEl(id).value) || 0;
        const id = cur ? cur.customer_id : Number(cpEl("cpCust").value);
        const { error } = await cpRpc("cp_save", { p_customer_id: id, p_bem: gi("cpDBEM"), p_sem: gi("cpDSEM"), p_lem: gi("cpDLEM"),
            p_bot_bem: gi("cpBBEM"), p_bot_sem: gi("cpBSEM"), p_bot_lem: gi("cpBLEM"), p_usdt_bem: gu("cpUBEM"), p_usdt_sem: gu("cpUSEM"), p_usdt_lem: gu("cpULEM"), p_catatan: cpEl("cpNote").value.trim() });
        if (error) return;
        const pr = await piSave("custom", id); if (pr.error) return;
        closeModal(); showToast("Custom Price disimpan", "success"); cpLoad();
    });
}
function cpDelete(id) {
    const r = cpData.custom.find(x => x.customer_id === id); if (!r) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus Custom Price?", body: `<b>${escapeHtml(r.username)}</b> kembali melihat dan membayar harga umum.`, confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await cpRpc("cp_delete", { p_customer_id: id }); await piRpc("pi_delete", { p_kind: "custom", p_customer_id: id }); if (!error) { showToast("Custom Price dihapus", "danger"); cpLoad(); } } });
}
