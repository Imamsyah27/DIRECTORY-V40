/**
 * KOIN & VOUCHER (admin) — tempat memasukkan item Koin / Voucher (dan kategori katalog lain selain Farm)
 * yang tampil di menu Catalog pelanggan. Memakai tabel & fungsi katalog yang sudah ada
 * (sql/katalog-pesan-baru.sql, katalog-kategori.sql, koin-usdt-6-katalog.sql). Pesanan pelanggan masuk ke menu Order.
 */
let kvItems = [], kvCats = [], kvKat = "koin", kvBound = false;
const kvEl = id => document.getElementById(id);
const kvPinNow = () => sessionStorage.getItem("akun_admin_pin");

function initKvPage() {
    if (!kvBound) {
        kvBound = true;
        const submit = async () => {
            const pin = kvEl("kvPinInput").value;
            if (!pin) { showToast("Masukkan PIN admin", "danger"); return; }
            const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
            if (error) { showToast("Error database: " + error.message, "danger"); return; }
            if (!data) { showToast("PIN admin salah", "danger"); return; }
            sessionStorage.setItem("akun_admin_pin", pin); kvEl("kvPinInput").value = ""; kvShow();
        };
        kvEl("kvPinSubmit").addEventListener("click", submit);
        kvEl("kvPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        kvEl("kvTabs").addEventListener("click", e => { const b = e.target.closest("button[data-kat]"); if (b) { kvKat = b.dataset.kat; kvRender(); } });
        kvEl("kvNewBtn").addEventListener("click", kvNew);
        kvEl("kvGrid").addEventListener("click", e => {
            const b = e.target.closest("[data-kv]"); if (!b) return;
            const id = Number(b.dataset.id);
            if (b.dataset.kv === "ready") kvToggle(id); else if (b.dataset.kv === "edit") kvEdit(id); else if (b.dataset.kv === "del") kvDelete(id);
        });
    }
    if (kvPinNow()) kvShow(); else { kvEl("kvPinGate").style.display = "block"; kvEl("kvContent").style.display = "none"; }
}
async function kvShow() {
    spPin = kvPinNow();     // pakai fungsi spRpc / ctImgUrl / ctSaveImage / spForm dari Supply & Stock
    kvEl("kvPinGate").style.display = "none"; kvEl("kvContent").style.display = "block";
    const [a, b] = await Promise.all([spRpc("ct_list", {}), spRpc("ct_cat_list", {})]);
    if (a.error) return;
    if (b.error) { showToast("Jalankan dulu sql/katalog-kategori.sql di Supabase SQL Editor", "danger"); return; }
    kvItems = a.data || []; kvCats = (b.data || []).filter(c => c.slug !== "farm");   // Farm dikelola di menu Farm Sell
    if (!kvCats.some(c => c.slug === kvKat)) kvKat = kvCats.length ? kvCats[0].slug : "";
    kvRender();
}
function kvRender() {
    kvEl("kvTabs").innerHTML = kvCats.map(c => `<button type="button" class="tab ${c.slug === kvKat ? "active" : ""}" data-kat="${escapeHtml(c.slug)}">${escapeHtml(c.ikon)} ${escapeHtml(c.nama)} <i>${kvItems.filter(x => x.kategori === c.slug).length}</i></button>`).join("");
    kvEl("kvNewBtn").style.display = kvKat ? "" : "none";
    const list = kvItems.filter(x => x.kategori === kvKat);
    kvEl("kvEmpty").style.display = list.length ? "none" : "flex";
    kvEl("kvGrid").innerHTML = list.map(it => `
        <article class="ct-card ${it.ready ? "" : "is-off"}">
            <div class="ct-media" data-kv-img="${it.id}"><span>${it.img_v ? "⏳" : "🛍"}</span></div>
            <div class="ct-body">
                <div class="ct-name">${escapeHtml(it.nama)}</div>
                ${it.harga_koin > 0 ? `<div class="ct-price">🪙 ${Number(it.harga_koin).toLocaleString("id-ID")} koin</div>` : `<div class="ct-desc">🪙 harga koin belum diatur (pelanggan pesan via WhatsApp)</div>`}
                ${it.deskripsi ? `<div class="ct-desc">${linkify(it.deskripsi)}</div>` : ""}
                <div class="ct-actions">
                    <button type="button" class="ct-ready ${it.ready ? "on" : ""}" data-kv="ready" data-id="${it.id}" title="Klik untuk ubah status">${it.ready ? "● Ready" : "○ Tidak Ready"}</button>
                    <button type="button" class="btn btn-ghost btn-icon" data-kv="edit" data-id="${it.id}" title="Ubah">✏️</button>
                    <button type="button" class="btn btn-danger btn-icon" data-kv="del" data-id="${it.id}" title="Hapus">🗑</button>
                </div>
            </div>
        </article>`).join("");
    kvEl("kvGrid").querySelectorAll("[data-kv-img]").forEach(async el => {
        const it = kvItems.find(x => x.id === Number(el.dataset.kvImg)); const u = await ctImgUrl(it);
        if (u) el.innerHTML = `<img src="${u}" alt="${escapeHtml(it.nama)}">`;
    });
}
const kvKatNama = k => (kvCats.find(x => x.slug === k) || { nama: k }).nama;

function kvNew() {
    spPin = kvPinNow();
    spForm("Item Baru — " + kvKatNama(kvKat), "🪙", [
        { id: "nama", label: "Nama Item", placeholder: "mis. Paket 1000 Koin Hay Day" },
        { id: "harga_koin", label: "Harga koin akun (1 koin = Rp 1)", type: "number", placeholder: "mis. 25000" },
        { id: "deskripsi", label: "Deskripsi (opsional)", placeholder: "keterangan singkat" },
        { id: "gambar", label: "Gambar (opsional)", type: "image" }
    ], async v => {
        if (!v.nama) { showToast("Nama item wajib diisi", "danger"); return; }
        const hk = parseInt(v.harga_koin, 10) || 0;
        if (hk <= 0) { showToast("Isi harga koin agar pelanggan bisa memesan", "danger"); return; }
        const { data, error } = await spRpc("ct_save", { p_id: null, p_kategori: kvKat, p_nama: v.nama, p_deskripsi: v.deskripsi, p_harga: "", p_ready: true });
        if (error) return;
        await spRpc("ct_set_harga_koin", { p_id: data, p_harga: hk });
        const ok = await ctSaveImage(data, v.gambar);
        showToast(ok ? "Item ditambahkan" : "Item ditambahkan, tetapi gambar gagal disimpan", ok ? "success" : "danger");
        kvShow();
    });
}
async function kvEdit(id) {
    const it = kvItems.find(x => x.id === id); if (!it) return;
    spPin = kvPinNow();
    const cur = await ctImgUrl(it);
    spForm("Ubah Item", "✏️", [
        { id: "nama", label: "Nama Item", value: it.nama },
        { id: "harga_koin", label: "Harga koin akun (1 koin = Rp 1)", type: "number", value: it.harga_koin || "" },
        { id: "deskripsi", label: "Deskripsi (opsional)", value: it.deskripsi },
        { id: "gambar", label: "Gambar", type: "image", value: cur || "" }
    ], async v => {
        if (!v.nama) { showToast("Nama item wajib diisi", "danger"); return; }
        const { error } = await spRpc("ct_save", { p_id: id, p_kategori: it.kategori, p_nama: v.nama, p_deskripsi: v.deskripsi, p_harga: it.harga || "", p_ready: it.ready });
        if (error) return;
        await spRpc("ct_set_harga_koin", { p_id: id, p_harga: parseInt(v.harga_koin, 10) || 0 });
        if (!(await ctSaveImage(id, v.gambar))) showToast("Gambar gagal disimpan", "danger");
        kvShow();
    });
}
async function kvToggle(id) {
    const it = kvItems.find(x => x.id === id); if (!it) return;
    spPin = kvPinNow(); it.ready = !it.ready; kvRender();
    const { error } = await spRpc("ct_set_ready", { p_id: id, p_ready: it.ready });
    if (error) { it.ready = !it.ready; kvRender(); }
}
function kvDelete(id) {
    const it = kvItems.find(x => x.id === id); if (!it) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus Item?", body: `<b>${escapeHtml(it.nama)}</b> beserta gambarnya dihapus permanen.`, confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { spPin = kvPinNow(); const { error } = await spRpc("ct_delete", { p_id: id }); if (!error) { showToast("Item dihapus", "danger"); kvShow(); } } });
}
