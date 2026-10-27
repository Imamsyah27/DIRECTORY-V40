/**
 * KATALOG Supply & Stock (admin) — sql/katalog-pesan-baru.sql
 * Kategori: Koin / Voucher / Farm. Tiap item: nama, gambar, harga (teks bebas, opsional), deskripsi,
 * dan status Ready / Tidak Ready. TIDAK ada stok. Gambar ikut terhapus saat item dihapus.
 */
let ctItems = [], ctCats = [], ctKat = "koin", ctBound = false;
const ctImgCache = {};   // "id:versi" -> dataURL

async function ctImgUrl(it) {
    if (!it || !it.img_v) return null;
    const k = it.id + ":" + it.img_v;
    if (ctImgCache[k]) return ctImgCache[k];
    const { data, error } = await spRpc("ct_get_image", { p_id: it.id });
    if (error || !data) return null;
    return (ctImgCache[k] = `data:${data.mime};base64,${data.data}`);
}
async function ctSaveImage(id, st) {
    if (!st) return true;
    if (st.dataUrl) {
        const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(st.dataUrl);
        if (!m) { showToast("Gambar tidak valid", "danger"); return false; }
        const { error } = await spRpc("ct_set_image", { p_id: id, p_mime: m[1], p_data: m[2] });
        return !error;
    }
    if (st.remove) { const { error } = await spRpc("ct_delete_image", { p_id: id }); return !error; }
    return true;
}

function ctInit() {
    if (!ctBound) {
        ctBound = true;
        spEl("ctTabs").addEventListener("click", e => { const b = e.target.closest("button[data-kat]"); if (b) { ctKat = b.dataset.kat; ctRender(); } });
        spEl("ctNewBtn").addEventListener("click", ctNew);
        spEl("ctCatAdd").addEventListener("click", ctCatNew);
        spEl("ctCatEdit").addEventListener("click", ctCatEdit);
        spEl("ctCatDel").addEventListener("click", ctCatDelete);
    }
    ctLoad();
}
async function ctLoad() {
    const [a, b] = await Promise.all([spRpc("ct_list", {}), spRpc("ct_cat_list", {})]);
    if (a.error) return;
    if (b.error) { showToast("Jalankan dulu sql/katalog-kategori.sql di Supabase SQL Editor", "danger"); return; }
    ctItems = a.data || []; ctCats = b.data || [];
    if (!ctCats.some(c => c.slug === ctKat)) ctKat = ctCats.length ? ctCats[0].slug : "";
    ctRender();
}
function ctRender() {
    spEl("ctTabs").innerHTML = ctCats.map(c => `<button type="button" class="tab ${c.slug === ctKat ? "active" : ""}" data-kat="${escapeHtml(c.slug)}">${escapeHtml(c.ikon)} ${escapeHtml(c.nama)} <i>${ctItems.filter(x => x.kategori === c.slug).length}</i></button>`).join("");
    const has = !!ctKat;
    ["ctCatEdit", "ctCatDel", "ctNewBtn"].forEach(id => spEl(id).style.display = has ? "" : "none");
    const list = ctItems.filter(x => x.kategori === ctKat);
    spEl("ctEmpty").style.display = list.length ? "none" : "flex";
    spEl("ctGrid").innerHTML = list.map(it => `
        <article class="ct-card ${it.ready ? "" : "is-off"}">
            <div class="ct-media" data-ct-img="${it.id}"><span>${it.img_v ? "⏳" : "🛍"}</span></div>
            <div class="ct-body">
                <div class="ct-name">${escapeHtml(it.nama)}</div>
                ${it.harga ? `<div class="ct-price">${escapeHtml(it.harga)}</div>` : ""}
                ${it.harga_koin > 0 ? `<div class="ct-price">🪙 ${Number(it.harga_koin).toLocaleString("id-ID")} koin</div>` : (it.kategori !== "farm" ? `<div class="ct-desc">🪙 harga koin belum diatur (pesan via WhatsApp)</div>` : "")}
                ${it.deskripsi ? `<div class="ct-desc">${linkify(it.deskripsi)}</div>` : ""}
                <div class="ct-actions">
                    <button type="button" class="ct-ready ${it.ready ? "on" : ""}" onclick="ctToggle(${it.id})" title="Klik untuk ubah status">${it.ready ? "● Ready" : "○ Tidak Ready"}</button>
                    <button type="button" class="btn btn-ghost btn-icon" onclick="ctEdit(${it.id})" title="Ubah">✏️</button>
                    <button type="button" class="btn btn-danger btn-icon" onclick="ctDelete(${it.id})" title="Hapus">🗑</button>
                </div>
            </div>
        </article>`).join("");
    spEl("ctGrid").querySelectorAll("[data-ct-img]").forEach(async el => {
        const it = ctItems.find(x => x.id === Number(el.dataset.ctImg)); const u = await ctImgUrl(it);
        if (u) el.innerHTML = `<img src="${u}" alt="${escapeHtml(it.nama)}">`;
    });
}

const ctKatNama = k => (ctCats.find(x => x.slug === k) || { nama: k }).nama;

function ctNew() {
    spForm("Item Baru — " + ctKatNama(ctKat), "🛍", [
        { id: "nama", label: "Nama Item", placeholder: "mis. Paket 1000 Koin" },
        { id: "harga", label: "Harga (opsional)", placeholder: "mis. Rp 25.000" },
        { id: "harga_koin", label: "Harga koin akun (1 koin = Rp 1; 0 = tidak bisa dipesan pakai koin)", type: "number", placeholder: "mis. 25000" },
        { id: "deskripsi", label: "Deskripsi (opsional)", placeholder: "keterangan singkat / link grup WhatsApp" },
        { id: "gambar", label: "Gambar (opsional)", type: "image" }
    ], async v => {
        if (!v.nama) { showToast("Nama item wajib diisi", "danger"); return; }
        const { data, error } = await spRpc("ct_save", { p_id: null, p_kategori: ctKat, p_nama: v.nama, p_deskripsi: v.deskripsi, p_harga: v.harga, p_ready: true });
        if (error) return;
        if (parseInt(v.harga_koin, 10) > 0) await spRpc("ct_set_harga_koin", { p_id: data, p_harga: parseInt(v.harga_koin, 10) });
        const ok = await ctSaveImage(data, v.gambar);
        showToast(ok ? "Item ditambahkan" : "Item ditambahkan, tetapi gambar gagal disimpan", ok ? "success" : "danger");
        ctLoad();
    });
}
async function ctEdit(id) {
    const it = ctItems.find(x => x.id === id); if (!it) return;
    const cur = await ctImgUrl(it);
    spForm("Ubah Item", "✏️", [
        { id: "nama", label: "Nama Item", value: it.nama },
        { id: "harga", label: "Harga (opsional)", value: it.harga },
        { id: "harga_koin", label: "Harga koin akun (1 koin = Rp 1; 0 = tidak bisa dipesan pakai koin)", type: "number", value: it.harga_koin || "" },
        { id: "deskripsi", label: "Deskripsi (opsional)", value: it.deskripsi },
        { id: "gambar", label: "Gambar", type: "image", value: cur || "" }
    ], async v => {
        if (!v.nama) { showToast("Nama item wajib diisi", "danger"); return; }
        const { error } = await spRpc("ct_save", { p_id: id, p_kategori: it.kategori, p_nama: v.nama, p_deskripsi: v.deskripsi, p_harga: v.harga, p_ready: it.ready });
        if (error) return;
        if (it.harga_koin !== undefined) await spRpc("ct_set_harga_koin", { p_id: id, p_harga: parseInt(v.harga_koin, 10) || 0 });
        if (!(await ctSaveImage(id, v.gambar))) showToast("Gambar gagal disimpan", "danger");
        ctLoad();
    });
}
async function ctToggle(id) {
    const it = ctItems.find(x => x.id === id); if (!it) return;
    it.ready = !it.ready; ctRender();                       // langsung berubah di layar
    const { error } = await spRpc("ct_set_ready", { p_id: id, p_ready: it.ready });
    if (error) { it.ready = !it.ready; ctRender(); }
}
function ctDelete(id) {
    const it = ctItems.find(x => x.id === id); if (!it) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus Item Katalog?", body: `<b>${escapeHtml(it.nama)}</b> beserta gambarnya dihapus permanen dari server.`, confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await spRpc("ct_delete", { p_id: id }); if (!error) { showToast("Item dihapus", "danger"); ctLoad(); } } });
}

/* ---- kelola kategori (tambah / ubah / hapus tab) ---- */
function ctCatNew() {
    spForm("Kategori Baru", "➕", [
        { id: "nama", label: "Nama Kategori", placeholder: "mis. Skin, Paket, Akun" },
        { id: "ikon", label: "Ikon / Emoji (opsional)", placeholder: "mis. 🎁" }
    ], async v => {
        if (!v.nama) { showToast("Nama kategori wajib diisi", "danger"); return; }
        const { data, error } = await spRpc("ct_cat_save", { p_slug: null, p_nama: v.nama, p_ikon: v.ikon });
        if (error) return;
        ctKat = data; showToast("Kategori ditambahkan", "success"); ctLoad();
    });
}
function ctCatEdit() {
    const c = ctCats.find(x => x.slug === ctKat); if (!c) return;
    spForm("Ubah Kategori", "✏️", [
        { id: "nama", label: "Nama Kategori", value: c.nama },
        { id: "ikon", label: "Ikon / Emoji", value: c.ikon }
    ], async v => {
        if (!v.nama) { showToast("Nama kategori wajib diisi", "danger"); return; }
        const { error } = await spRpc("ct_cat_save", { p_slug: c.slug, p_nama: v.nama, p_ikon: v.ikon });
        if (!error) { showToast("Kategori diperbarui", "success"); ctLoad(); }
    });
}
function ctCatDelete() {
    const c = ctCats.find(x => x.slug === ctKat); if (!c) return;
    const n = ctItems.filter(x => x.kategori === c.slug).length;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus Kategori?",
        body: `Kategori <b>${escapeHtml(c.nama)}</b> dihapus${n ? `, termasuk <b>${n} item</b> di dalamnya beserta gambarnya` : ""}. Tindakan ini tidak bisa dibatalkan.`,
        confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await spRpc("ct_cat_delete", { p_slug: c.slug }); if (!error) { showToast("Kategori dihapus", "danger"); ctLoad(); } } });
}
