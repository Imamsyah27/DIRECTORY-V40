/**
 * PRICE (admin) — sql/price.sql
 * Harga default BEM/SEM/LEM per hari, diskon semua pelanggan, pelanggan istimewa, kode referal.
 */
let prData = null, prInited = false, prSpDraft = null;
const prRp = n => (n == null || n === "") ? "-" : "Rp " + Number(n).toLocaleString("id-ID");
const prEl = id => document.getElementById(id);
const prPin = () => sessionStorage.getItem("akun_admin_pin");

async function prRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: prPin(), ...params });
    if (res.error) {
        const m = res.error.message || "";
        if (m.includes("PIN admin salah")) {
            sessionStorage.removeItem("akun_admin_pin");
            prEl("prPinGate").style.display = "block"; prEl("prContent").style.display = "none";
            showToast("PIN admin tidak valid, masukkan ulang", "danger");
        } else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/price.sql, sql/bot-order.sql, dan sql/fast-payment-arsip.sql, sql/koin-usdt-1…7 (7 bagian) dan sql/koin-usdt-15-bulk-order.sql di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}

function initPricePage() {
    if (!prInited) {
        prInited = true;
        const submit = async () => {
            const pin = prEl("prPinInput").value; if (!pin) return;
            const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
            if (error) { showToast("Error database: " + error.message, "danger"); return; }
            if (!data) { showToast("PIN admin salah", "danger"); return; }
            sessionStorage.setItem("akun_admin_pin", pin); prEl("prPinInput").value = ""; prShow();
        };
        prEl("prPinSubmit").addEventListener("click", submit);
        prEl("prPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        prEl("prSaveDefault").addEventListener("click", prSaveDefault);
        prEl("prSaveDiskon").addEventListener("click", prSaveDiskon);
        prEl("prSaveBot").addEventListener("click", prSaveBot);
        prEl("prSaveBulk").addEventListener("click", prSaveBulk);
        prInitFold();
        prEl("prSaveAvail").addEventListener("click", prSaveAvail);
        prEl("paySave").addEventListener("click", () => prPaySave(false));
        prEl("payQrisDel").addEventListener("click", () => prPaySave(true));
        prEl("payQris").addEventListener("change", prPayPickFile);
        prEl("prCdAdd").addEventListener("click", () => prCodeForm(null));
        ["prBem", "prSem", "prLem"].forEach(i => prEl(i).addEventListener("input", prRenderPreview));
    }
    if (prPin()) prShow();
    else { prEl("prPinGate").style.display = "block"; prEl("prContent").style.display = "none"; }
}
async function prShow() {
    prEl("prPinGate").style.display = "none"; prEl("prContent").style.display = "block";
    await prLoad();
}
async function prLoad() {
    const { data, error } = await prRpc("pr_get", {});
    if (error) return;
    prData = data; prRender();
    prPayLoad();
}

/* ---------------- Metode pembayaran (QRIS, Binance, DANA, PayPal) ---------------- */
let prPayNew = null;   // { mime, data } foto QRIS baru yang belum disimpan
function prPayShowQris(mime, data) {
    prEl("payQrisPreview").innerHTML = data ? `<img src="data:${mime};base64,${data}" alt="QRIS" style="max-width:220px;width:100%;border-radius:12px;border:1px solid var(--border);background:#fff;">` : `<span class="muted-note">Belum ada foto QRIS.</span>`;
}
async function prPayLoad() {
    const { data, error } = await prRpc("pr_pay_get", {});
    if (error || !data) return;
    prEl("payBinance").value = data.binance_id || ""; prEl("payDana").value = data.dana_number || "";
    prEl("payDanaName").value = data.dana_name || ""; prEl("payPaypal").value = data.paypal || "";
    prPayNew = null; prEl("payQris").value = "";
    prPayShowQris(data.qris_mime, data.qris_data);
    prEl("payQrisDel").style.display = data.qris_data ? "inline-flex" : "none";
}
/** Foto dikecilkan (maks 900px, JPEG) di browser supaya ringan disimpan dan dimuat pelanggan. */
function prPayPickFile() {
    const f = prEl("payQris").files[0]; if (!f) { prPayNew = null; return; }
    if (!/^image\//.test(f.type)) { showToast("File harus berupa gambar", "danger"); prEl("payQris").value = ""; return; }
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => {
        const k = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        const dataUrl = c.toDataURL("image/jpeg", 0.85), b64 = dataUrl.split(",")[1];
        prPayNew = { mime: "image/jpeg", data: b64 };
        prPayShowQris("image/jpeg", b64);
        showToast("Foto dipilih — klik Simpan Metode Pembayaran", "success");
    };
    img.onerror = () => { URL.revokeObjectURL(url); showToast("Gambar tidak bisa dibaca", "danger"); };
    img.src = url;
}
async function prPaySave(hapusQris) {
    const { error } = await prRpc("pr_pay_save", {
        p_binance: prEl("payBinance").value, p_dana: prEl("payDana").value, p_dana_name: prEl("payDanaName").value, p_paypal: prEl("payPaypal").value,
        p_qris_mime: prPayNew ? prPayNew.mime : null, p_qris_data: prPayNew ? prPayNew.data : null, p_hapus_qris: !!hapusQris
    });
    if (!error) { showToast(hapusQris ? "Foto QRIS dihapus" : "Metode pembayaran disimpan", "success"); prPayLoad(); }
}

function prRender() {
    const s = prData.settings;
    prEl("prBem").value = s.bem; prEl("prSem").value = s.sem; prEl("prLem").value = s.lem;
    prEl("prDAktif").checked = s.diskon_aktif; prEl("prDPersen").value = s.diskon_persen; prEl("prDLabel").value = s.diskon_label || "";
    prEl("prDBem").checked = s.diskon_bem; prEl("prDSem").checked = s.diskon_sem; prEl("prDLem").checked = s.diskon_lem;
    prEl("prBBem").value = s.bot_bem || 0; prEl("prBSem").value = s.bot_sem || 0; prEl("prBLem").value = s.bot_lem || 0;
    const av = { prAvBem: s.avail_bem, prAvSem: s.avail_sem, prAvLem: s.avail_lem, prAvBBem: s.avail_bot_bem, prAvBSem: s.avail_bot_sem, prAvBLem: s.avail_bot_lem };
    Object.entries(av).forEach(([id, v]) => { prEl(id).checked = v !== false; });
    PR_BULK_KEYS.forEach(k => { prEl("prBk_" + k).value = s["bulk_" + k] || 0; });
    prEl("prAvBulk").checked = s.avail_bulk !== false;
    prRenderPreview(); prRenderCodes();
}
const PR_BULK_KEYS = ["t1", "t2", "t3", "t4"].flatMap(t => ["bem", "sem", "lem"].map(d => t + "_" + d));
async function prSaveBulk() {
    const prices = {};
    PR_BULK_KEYS.forEach(k => { prices[k] = parseInt(prEl("prBk_" + k).value, 10) || 0; });
    const { error } = await prRpc("pr_save_bulk", { p_prices: prices, p_avail: prEl("prAvBulk").checked });
    if (!error) { showToast("Harga Bulk Order disimpan", "success"); prLoad(); }
}

/* ---------------- Panel Price bisa di-minimize (status diingat di browser) ---------------- */
const PR_FOLD_KEY = "pr_fold_v1";
function prFoldLoad() { try { return JSON.parse(localStorage.getItem(PR_FOLD_KEY) || "{}"); } catch (_) { return {}; } }
function prFoldSave(m) { try { localStorage.setItem(PR_FOLD_KEY, JSON.stringify(m)); } catch (_) {} }
function prInitFold() {
    const state = prFoldLoad();
    const panels = [...document.querySelectorAll("#prContent > section.pr-panel")];
    const keyOf = p => p.dataset.fk;
    const apply = (p, folded) => {
        p.classList.toggle("pr-folded", folded);
        const t = p.querySelector(".panel-title"); t.setAttribute("aria-expanded", String(!folded));
    };
    panels.forEach(p => {
        const t = p.querySelector(".panel-title"); if (!t) return;
        p.dataset.fk = (t.childNodes[0].textContent || "").trim();
        t.classList.add("pr-fold-title"); t.setAttribute("role", "button"); t.tabIndex = 0;
        const chev = document.createElement("span"); chev.className = "pr-chev"; chev.textContent = "▾"; t.prepend(chev);
        const toggle = () => { const f = !p.classList.contains("pr-folded"); apply(p, f); const m = prFoldLoad(); m[keyOf(p)] = f; prFoldSave(m); };
        t.addEventListener("click", toggle);
        t.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
        apply(p, !!state[keyOf(p)]);
    });
    const all = f => { const m = {}; panels.forEach(p => { apply(p, f); m[keyOf(p)] = f; }); prFoldSave(m); };
    prEl("prFoldAll").addEventListener("click", () => all(true));
    prEl("prUnfoldAll").addEventListener("click", () => all(false));
}
async function prSaveAvail() {
    const c = id => prEl(id).checked;
    const { error } = await prRpc("pr_save_avail", { p_bem: c("prAvBem"), p_sem: c("prAvSem"), p_lem: c("prAvLem"), p_bot_bem: c("prAvBBem"), p_bot_sem: c("prAvBSem"), p_bot_lem: c("prAvBLem") });
    if (!error) { showToast("Ketersediaan paket disimpan", "success"); prLoad(); }
}
function prRenderPreview() {
    const g = id => parseInt(prEl(id).value, 10) || 0;
    prEl("prPreview").innerHTML = [["BEM", "prBem"], ["SEM", "prSem"], ["LEM", "prLem"]]
        .map(([n, id]) => `<span><b>${n}</b> 30 hari = ${prRp(g(id) * 30)}</span>`).join("");
}

async function prSaveDefault() {
    const g = id => parseInt(prEl(id).value, 10);
    const { error } = await prRpc("pr_save_default", { p_bem: g("prBem"), p_sem: g("prSem"), p_lem: g("prLem") });
    if (!error) { showToast("Harga default disimpan", "success"); prLoad(); }
}
async function prSaveBot() {
    const g = id => parseInt(prEl(id).value, 10);
    const { error } = await prRpc("pr_save_bot", { p_bem: g("prBBem"), p_sem: g("prBSem"), p_lem: g("prBLem") });
    if (!error) { showToast("Harga bot order disimpan", "success"); prLoad(); }
}
async function prSaveDiskon() {
    const { error } = await prRpc("pr_save_diskon", {
        p_aktif: prEl("prDAktif").checked, p_persen: parseInt(prEl("prDPersen").value, 10) || 0, p_label: prEl("prDLabel").value.trim(),
        p_bem: prEl("prDBem").checked, p_sem: prEl("prDSem").checked, p_lem: prEl("prDLem").checked
    });
    if (!error) { showToast(prEl("prDAktif").checked ? "Diskon disimpan dan aktif" : "Diskon disimpan (nonaktif)", "success"); prLoad(); }
}

/* ---------------- Kode referal ---------------- */
function prCodeStatus(c) {
    if (!c.aktif) return ["Nonaktif", "off"];
    if (c.expires_at && new Date(c.expires_at) < new Date()) return ["Kedaluwarsa", "off"];
    if (c.used_count >= c.max_uses) return ["Habis", "off"];
    return ["Aktif", "on"];
}
function prRenderCodes() {
    const list = prData.codes;
    prEl("prCdEmpty").style.display = list.length ? "none" : "flex";
    prEl("prCdBody").innerHTML = list.map(c => {
        const [st, cls] = prCodeStatus(c), pct = Math.min(100, Math.round(c.used_count / c.max_uses * 100));
        return `<tr>
            <td><b class="pr-code">${escapeHtml(c.kode)}</b></td>
            <td>${c.tipe === "persen" ? c.nilai + "%" : prRp(c.nilai)}</td>
            <td><div class="pr-use" title="${escapeHtml(c.pengguna ? "Dipakai oleh: " + c.pengguna : "Belum dipakai")}"><span>${c.used_count} / ${c.max_uses}</span><div class="pr-bar"><i style="width:${pct}%"></i></div></div></td>
            <td>${c.expires_at ? new Date(c.expires_at).toLocaleDateString("id-ID") : "—"}</td>
            <td><span class="pr-status ${cls}">${st}</span></td>
            <td><div class="actions-cell">
                <button type="button" class="btn btn-ghost btn-icon" onclick="prCodeToggle(${c.id})" title="${c.aktif ? "Nonaktifkan" : "Aktifkan"}">${c.aktif ? "⏸" : "▶️"}</button>
                <button type="button" class="btn btn-ghost btn-icon" onclick="prCodeForm(${c.id})" title="Ubah">✏️</button>
                <button type="button" class="btn btn-danger btn-icon" onclick="prCodeDelete(${c.id})" title="Hapus">🗑</button></div></td></tr>`;
    }).join("");
}
const prGenCode = () => "LS" + Math.random().toString(36).slice(2, 8).toUpperCase();
const prSaveCode = (c, over) => prRpc("pr_code_save", { p_id: c.id, p_kode: c.kode, p_tipe: c.tipe, p_nilai: c.nilai, p_max_uses: c.max_uses, p_aktif: c.aktif, p_expires: c.expires_at, ...over });

async function prCodeToggle(id) {
    const c = prData.codes.find(x => x.id === id); if (!c) return;
    const { error } = await prSaveCode(c, { p_aktif: !c.aktif });
    if (!error) prLoad();
}
function prCodeForm(id) {
    const c = id ? prData.codes.find(x => x.id === id) : null;
    const exp = c && c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 10) : "";
    modalBox.innerHTML = `<div class="modal-icon info">🎟</div><div class="modal-title">${c ? "Ubah" : "Kode Referal Baru"}</div>
        <div class="modal-form">
            <div class="field"><label for="prCdKode">Kode</label>
                <div class="pr-inline"><input type="text" id="prCdKode" maxlength="32" value="${escapeHtml(c ? c.kode : prGenCode())}" autocapitalize="characters" autocomplete="off"><button type="button" class="btn btn-ghost" id="prCdGen" title="Buat kode acak">🎲</button></div></div>
            <div class="pr-grid">
                <div class="field"><label for="prCdTipe">Jenis potongan</label><select id="prCdTipe"><option value="persen" ${c && c.tipe === "persen" ? "selected" : ""}>Persen (%)</option><option value="nominal" ${c && c.tipe === "nominal" ? "selected" : ""}>Nominal (Rp)</option></select></div>
                <div class="field"><label for="prCdNilai">Nilai</label><input type="number" id="prCdNilai" min="1" inputmode="numeric" value="${c ? c.nilai : ""}"></div>
                <div class="field"><label for="prCdMax">Batas pemakaian (kali)</label><input type="number" id="prCdMax" min="1" inputmode="numeric" value="${c ? c.max_uses : 10}"></div>
            </div>
            <div class="field"><label for="prCdExp">Berlaku sampai (opsional)</label><input type="date" id="prCdExp" value="${exp}"></div>
            <label class="pr-check"><input type="checkbox" id="prCdAktif" ${!c || c.aktif ? "checked" : ""}> <span>Aktif</span></label>
            <div class="pr-imghint">Berlaku untuk pesanan BEM / SEM / LEM. <b>Tiap pelanggan hanya bisa memakai kode ini 1 kali</b> (batas pemakaian = jumlah pelanggan berbeda). Tiap pemakaian mengurangi jatah; jika permintaan dibatalkan atau ditolak, jatahnya kembali.</div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="prCdNo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="prCdYes">Simpan</button></div>`;
    modalOverlay.classList.add("show");
    prEl("prCdGen").addEventListener("click", () => { prEl("prCdKode").value = prGenCode(); });
    prEl("prCdNo").addEventListener("click", closeModal);
    prEl("prCdYes").addEventListener("click", async () => {
        const e = prEl("prCdExp").value;
        const { error } = await prRpc("pr_code_save", {
            p_id: c ? c.id : null, p_kode: prEl("prCdKode").value.trim(), p_tipe: prEl("prCdTipe").value,
            p_nilai: parseInt(prEl("prCdNilai").value, 10) || 0, p_max_uses: parseInt(prEl("prCdMax").value, 10) || 0,
            p_aktif: prEl("prCdAktif").checked, p_expires: e ? new Date(e + "T23:59:59").toISOString() : null
        });
        if (error) return;
        closeModal(); showToast("Kode referal disimpan", "success"); prLoad();
    });
}
function prCodeDelete(id) {
    const c = prData.codes.find(x => x.id === id); if (!c) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus Kode Referal?", body: `Kode <b>${escapeHtml(c.kode)}</b> dihapus. Pesanan yang sudah memakainya tidak berubah.`, confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await prRpc("pr_code_delete", { p_id: id }); if (!error) { showToast("Kode referal dihapus", "danger"); prLoad(); } } });
}
