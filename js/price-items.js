/**
 * HARGA ITEM LAIN untuk menu "Custom Price" dan "Harga Pelanggan".
 * Selain BEM / SEM / LEM + Bot, SEMUA item berkoin ikut bisa diberi harga khusus per pelanggan:
 * Farm, Hav Token, Product (Supply & Stock, tiap tier), Katalog (Koin / Voucher / kategori lain) dan Pre Order.
 * Daftar item dibaca langsung dari database (pi_catalog), jadi barang baru otomatis muncul di kedua menu.
 * Butuh sql/koin-usdt-11-harga-item.sql (+ 11b) dan koin-usdt-12 (untuk Pre Order).
 */
const piPin = () => sessionStorage.getItem("akun_admin_pin");
let piWarned = false;

/** Panggilan RPC tanpa toast berisik; satu peringatan bila SQL belum dijalankan. */
async function piRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: piPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (/does not exist|schema cache|Could not find the function/i.test(m)) {
            if (!piWarned) { piWarned = true; showToast("Jalankan dulu sql/koin-usdt-11-harga-item.sql (+ 11b, 12) di Supabase SQL Editor untuk harga item lain", "danger"); }
        } else if (!m.includes("PIN admin salah")) showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}
/** Gabungkan daftar akun (price_custom / price_special) dengan akun yang HANYA punya harga item. */
async function piMergeRows(rows, kind) {
    const { data } = await piRpc("pi_summary", { p_kind: kind });
    const sum = new Map((data || []).map(r => [r.customer_id, r]));
    rows.forEach(r => { r._n = sum.has(r.customer_id) ? sum.get(r.customer_id).n : 0; sum.delete(r.customer_id); });
    sum.forEach(r => rows.push({ customer_id: r.customer_id, username: r.username, bem: null, sem: null, lem: null, bot_bem: null, bot_sem: null, bot_lem: null,
        usdt_bem: null, usdt_sem: null, usdt_lem: null, catatan: "", _n: r.n }));
    rows.sort((a, b) => a.username.localeCompare(b.username));
    return rows;
}
const piCell = n => n ? `<span class="pi-count">📦 ${n} item</span>` : `<span class="pr-def">—</span>`;

async function piFetch(kind, customerId) {
    const [c, g] = await Promise.all([piRpc("pi_catalog", {}), customerId ? piRpc("pi_get", { p_kind: kind, p_customer_id: customerId }) : Promise.resolve({ data: [] })]);
    return { items: (c.data || []), mine: Object.fromEntries((g.data || []).map(r => [r.key, r.harga])), failed: !!c.error };
}
/** Blok HTML daftar item (dikelompokkan, ada pencarian). kind: "custom" | "special" */
function piHtml(pi, kind) {
    if (pi.failed) return `<div class="pi-box"><div class="pi-head"><b>📦 Harga Item Lain</b></div><div class="pr-imghint">Daftar item belum bisa dimuat — jalankan dulu sql/koin-usdt-11-harga-item.sql (+ 11b, 12).</div></div>`;
    const groups = [];
    pi.items.forEach(it => { let g = groups.find(x => x.nama === it.grup); if (!g) groups.push(g = { nama: it.grup, ikon: it.ikon, rows: [] }); g.rows.push(it); });
    const hint = kind === "custom" ? "Isi untuk mengubah harga akun ini (tersembunyi, tampil sebagai harga biasa)." : "Isi untuk memberi harga istimewa (harga umum dicoret di tampilan pelanggan).";
    return `<div class="pi-box"><div class="pi-head"><b>📦 Harga Item Lain</b><span>Farm, Hav Token, Product, Katalog, Pre Order — item baru otomatis muncul di sini</span></div>
        <div class="pr-imghint">${hint} Angka abu-abu = harga umum (koin). Kosong = ikut harga umum.</div>
        ${pi.items.length ? `<input type="search" class="pi-search" id="piSearch" placeholder="Cari item…">
        <div class="pi-list" id="piList">${groups.map(g => `<div class="pi-group"><div class="pi-gname">${escapeHtml(g.ikon)} ${escapeHtml(g.nama)}</div>
            ${g.rows.map(it => `<label class="pi-row" data-q="${escapeHtml((g.nama + " " + it.nama).toLowerCase())}"><span class="pi-n">${escapeHtml(it.nama)}<i>umum 🪙 ${Number(it.harga).toLocaleString("id-ID")} ${escapeHtml(it.satuan)}</i></span>
            <input type="number" min="0" inputmode="numeric" data-pikey="${escapeHtml(it.key)}" placeholder="${it.harga}" value="${pi.mine[it.key] || ""}"></label>`).join("")}</div>`).join("")}</div>`
        : `<div class="pr-imghint">Belum ada item berkoin yang dijual (Farm, Hav Token, Product, Katalog, Pre Order).</div>`}</div>`;
}
function piBind() {
    const s = document.getElementById("piSearch"); if (!s) return;
    s.addEventListener("input", () => {
        const q = s.value.trim().toLowerCase();
        document.querySelectorAll("#piList .pi-row").forEach(r => { r.style.display = !q || r.dataset.q.includes(q) ? "" : "none"; });
        document.querySelectorAll("#piList .pi-group").forEach(g => { g.style.display = [...g.querySelectorAll(".pi-row")].some(r => r.style.display !== "none") ? "" : "none"; });
    });
}
/** {key: harga} dari semua kolom terisi */
function piCollect() {
    const o = {};
    document.querySelectorAll("#piList [data-pikey]").forEach(i => { const v = parseInt(i.value, 10); if (v > 0) o[i.dataset.pikey] = v; });
    return o;
}
async function piSave(kind, customerId) { return piRpc("pi_save", { p_kind: kind, p_customer_id: customerId, p_items: piCollect() }); }
