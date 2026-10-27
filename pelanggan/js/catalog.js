/**
 * CATALOG (pelanggan) — menu tersendiri di samping Bot Order. Isinya kotak-kotak yang bisa dibuka (dropdown):
 *   🌱 Farm (dari Farm Sell admin)  ·  🔑 Hav Token (dari HAV Sell admin)  ·  📦 Product (dari Supply & Stock admin)
 *   🪙 Koin  ·  🎟 Voucher (+ kategori lain buatan admin) — diisi admin di menu "Koin & Voucher".
 * Semua dibayar dengan koin akun. Farm & Hav Token: token/key otomatis dikirim setelah koin dipotong dan tersimpan di
 * Riwayat Pembelian. Koin & Voucher: diproses manual admin -> pelanggan diminta konfirmasi ke admin lewat WhatsApp.
 * Butuh: katalog-pesan-baru.sql, katalog-kategori.sql, koin-usdt-6/7/9/10 (.sql).
 */
Object.assign(TRANSLATIONS.id, {
    cat_tab_stock: "Stok", cat_tab_catalog: "Katalog", cat_title: "Katalog", cat_koin: "Koin", cat_voucher: "Voucher", cat_farm: "Farm",
    cat_ready: "Ready", cat_not_ready: "Tidak Ready", cat_empty: "Belum ada item di kategori ini.", cat_order: "Pesan via WhatsApp",
    cat_wa_text: "Halo admin, saya {u} ingin memesan: {item} ({kat})."
});
Object.assign(TRANSLATIONS.en, {
    cat_tab_stock: "Stock", cat_tab_catalog: "Catalog", cat_title: "Catalog", cat_koin: "Coins", cat_voucher: "Vouchers", cat_farm: "Farm",
    cat_ready: "Ready", cat_not_ready: "Not Ready", cat_empty: "No items in this category yet.", cat_order: "Order via WhatsApp",
    cat_wa_text: "Hello admin, I'm {u} and I'd like to order: {item} ({kat})."
});

Object.assign(TRANSLATIONS.id, {
    cat_coin_order: "Pesan dengan Koin", cat_qty: "Jumlah", cat_note_label: "Catatan untuk admin (mis. ID Hay Day / akun tujuan)", cat_ordered: "Pesanan terkirim — menunggu admin memproses",
    cat_my_orders: "Pesanan Katalog Saya", cat_st_pending: "⏳ Menunggu admin", cat_st_done: "✅ Selesai", cat_st_rejected: "✖ Ditolak (koin dikembalikan)", cat_confirm: "Konfirmasi Pesanan", cat_send: "Pesan & Bayar Koin",
    farm_buy: "Beli", farm_stock: "Stok", farm_unit: "/ token", farm_bought: "Pembelian Berhasil", farm_sent: "{n} token farm sudah dikirim ke akun Anda:", farm_copy_all: "Salin semua", farm_copied: "Tersalin",
    farm_my: "Pembelian Farm Saya", farm_empty_stock: "Stok habis", farm_err_stock: "Stok farm tidak cukup", farm_err_na: "Farm tidak tersedia", cat_err_ready: "Item sedang tidak ready", cat_err_price: "Harga koin item belum diatur admin"
});
Object.assign(TRANSLATIONS.en, {
    cat_coin_order: "Order with Coins", cat_qty: "Qty", cat_note_label: "Note for admin (e.g. Hay Day ID / target account)", cat_ordered: "Order sent — waiting for the admin to process it",
    cat_my_orders: "My Catalog Orders", cat_st_pending: "⏳ Awaiting admin", cat_st_done: "✅ Done", cat_st_rejected: "✖ Rejected (coins refunded)", cat_confirm: "Confirm Order", cat_send: "Order & Pay Coins",
    farm_buy: "Buy", farm_stock: "Stock", farm_unit: "/ token", farm_bought: "Purchase Successful", farm_sent: "{n} farm tokens have been delivered to your account:", farm_copy_all: "Copy all", farm_copied: "Copied",
    farm_my: "My Farm Purchases", farm_empty_stock: "Out of stock", farm_err_stock: "Not enough farm stock", farm_err_na: "Farm not available", cat_err_ready: "This item is not ready", cat_err_price: "This item's coin price has not been set"
});
Object.assign(TRANSLATIONS.id, {
    farm_cf_item: "Akun / Farm", farm_cf_qty: "Jumlah × harga", farm_pay_btn: "Bayar {n} Koin & Beli",
    farm_pay_note: "🌱 Setelah koin dipotong, token langsung dikirim otomatis dan tersimpan di Riwayat Pembelian → Pembelian Farm Saya (menu Catalog). Pembelian tidak bisa dibatalkan.",
    farm_saved_hist: "Token juga tersimpan di Riwayat Pembelian → Pembelian Farm Saya.", farm_view_hist: "Lihat Riwayat Pembelian", farm_desc_title: "Deskripsi akun"
});
Object.assign(TRANSLATIONS.en, {
    farm_cf_item: "Account / Farm", farm_cf_qty: "Qty × price", farm_pay_btn: "Pay {n} Coins & Buy",
    farm_pay_note: "🌱 Once the coins are deducted, the tokens are delivered automatically and saved in Purchase History → My Farm Purchases (Catalog menu). Purchases cannot be cancelled.",
    farm_saved_hist: "The tokens are also saved in Purchase History → My Farm Purchases.", farm_view_hist: "View Purchase History", farm_desc_title: "Account description"
});
/* ---- menu Catalog, Hav Token, Product, konfirmasi ke admin ---- */
Object.assign(TRANSLATIONS.id, {
    cat_menu: "Catalog", cat_menu_sub: "Pilih kotak di bawah untuk melihat pilihannya. Semua pembayaran memakai koin akun Anda.",
    cat_hav: "Hav Token", cat_product: "Product", cat_hist_title: "Riwayat Pembelian",
    hav_unit: "/ key", hav_stock_unit: "key", hav_my: "Pembelian Hav Token Saya", hav_bought: "Pembelian Berhasil", hav_sent: "{n} key Hav Token sudah dikirim ke akun Anda:",
    hav_cf_item: "Hav Token", hav_pay_btn: "Bayar {n} Koin & Beli",
    hav_pay_note: "🔑 Setelah koin dipotong, key Hav Token langsung dikirim otomatis dan tersimpan di Riwayat Pembelian → Pembelian Hav Token Saya (menu Catalog). Pembelian tidak bisa dibatalkan.",
    hav_saved_hist: "Key juga tersimpan di Riwayat Pembelian → Pembelian Hav Token Saya.", hav_err_stock: "Stok Hav Token tidak cukup", hav_err_na: "Hav Token tidak tersedia",
    cat_pay_note: "📩 Pesanan ini diproses manual oleh admin. Setelah membayar, konfirmasi ke admin lewat WhatsApp supaya segera diproses. Jika ditolak admin, koin dikembalikan.",
    cat_ordered_title: "Pesanan Terkirim", cat_ordered_text: "Pesanan #{id} ({item}) sudah dibuat. Konfirmasi ke admin lewat WhatsApp agar segera diproses.",
    cat_confirm_admin: "Konfirmasi ke Admin (WhatsApp)",
    cat_wa_confirm: "Halo admin, saya {u} sudah memesan {item} (total 🪙 {total}) — Pesanan #{id}. Mohon diproses."
});
Object.assign(TRANSLATIONS.en, {
    cat_menu: "Catalog", cat_menu_sub: "Tap a box below to see its options. Every payment uses your account coins.",
    cat_hav: "Hav Token", cat_product: "Product", cat_hist_title: "Purchase History",
    hav_unit: "/ key", hav_stock_unit: "keys", hav_my: "My Hav Token Purchases", hav_bought: "Purchase Successful", hav_sent: "{n} Hav Token keys have been delivered to your account:",
    hav_cf_item: "Hav Token", hav_pay_btn: "Pay {n} Coins & Buy",
    hav_pay_note: "🔑 Once the coins are deducted, the Hav Token keys are delivered automatically and saved in Purchase History → My Hav Token Purchases (Catalog menu). Purchases cannot be cancelled.",
    hav_saved_hist: "The keys are also saved in Purchase History → My Hav Token Purchases.", hav_err_stock: "Not enough Hav Token stock", hav_err_na: "Hav Token not available",
    cat_pay_note: "📩 This order is processed manually by the admin. After paying, please confirm with the admin on WhatsApp so it is processed quickly. If the admin rejects it, your coins are refunded.",
    cat_ordered_title: "Order Sent", cat_ordered_text: "Order #{id} ({item}) has been created. Please confirm with the admin on WhatsApp so it is processed quickly.",
    cat_confirm_admin: "Confirm to Admin (WhatsApp)",
    cat_wa_confirm: "Hello admin, I'm {u} and I have ordered {item} (total 🪙 {total}) — Order #{id}. Please process it."
});
/* ---- Pre Order + harga pelanggan ---- */
Object.assign(TRANSLATIONS.id, {
    cat_pre: "Pre Order", po_btn: "Pre Order", po_per_farm: "1 request farm = {pf} barang", po_price_unit: "/ 10.000 barang",
    po_rule: "1 request farm = {pf} barang · 🪙 {p} / 10.000 barang · maks. {mx} barang & {tg} tagar per batch",
    po_format: "Tulis satu tagar per baris dengan format: tagar | jumlah. Jumlah = jumlah request farm (1 request = {pf} barang), mis. 1k barang = {kreq} request. Boleh juga ditulis 1k / 2.5k, otomatis dikonversi.",
    po_batch: "Batch {n}", po_add_batch: "Tambah Batch", po_rm: "Hapus batch", po_ph: "#tagar1 | 10\n#tagar2 | 5",
    po_sum: "{t} tagar · {f} farm = {b} barang · 🪙 {k}", po_total: "Total ({b} barang)", po_note_label: "Catatan untuk admin (opsional)", po_continue: "Lanjut Bayar",
    po_err_line: "Baris {l}: format harus tagar | jumlah", po_err_num: "Baris {l}: jumlah harus angka bulat (mis. 10) atau dalam k (mis. 1k)",
    po_err_k: "Baris {l}: {v} barang tidak habis dibagi {pf} per request farm", po_err_dup: "Baris {l}: tagar {tg} tertulis dobel", po_err_zero: "Baris {l}: jumlah minimal 1 request",
    po_err_tags: "Batch {n}: maksimal {m} tagar", po_err_max: "Batch {n}: maksimal {mx} barang per batch (sekarang {b}). Lanjutkan di batch berikutnya.",
    po_err_empty: "Isi minimal 1 baris: tagar | jumlah", po_err_5: "Maksimal 5 batch per pemesanan", po_err_na: "Pre Order tidak tersedia", po_err_many: "Terlalu banyak Pre Order yang masih menunggu",
    po_pay_note: "📝 Koin dipotong sekarang. Admin memproses Pre Order Anda secara manual — status ada di Riwayat Pembelian → Pre Order Saya. Jika ditolak admin, koin dikembalikan. Setelah membayar, konfirmasi ke admin lewat WhatsApp agar cepat diproses.",
    po_pay_btn: "Bayar {n} Koin & Pre Order", po_cf_batch: "Batch × barang", po_ok_title: "Pre Order Terkirim",
    po_ok_text: "{n} batch ({b} barang) untuk {item} sudah dibuat. Konfirmasi ke admin lewat WhatsApp agar segera diproses.",
    po_wa: "Halo admin, saya {u} sudah Pre Order {item}: {n} batch, {b} barang (total 🪙 {total}). Mohon diproses.",
    po_my: "Pre Order Saya", po_batch_of: "Batch {a}/{b}", po_items: "{n} barang", po_copy: "Salin tagar | jumlah", po_saved_hist: "Tersimpan di Riwayat Pembelian → Pre Order Saya."
});
Object.assign(TRANSLATIONS.en, {
    cat_pre: "Pre Order", po_btn: "Pre Order", po_per_farm: "1 farm request = {pf} items", po_price_unit: "/ 10,000 items",
    po_rule: "1 farm request = {pf} items · 🪙 {p} / 10,000 items · max. {mx} items & {tg} tags per batch",
    po_format: "Write one tag per line in the format: tag | quantity. Quantity = number of farm requests (1 request = {pf} items), e.g. 1k items = {kreq} requests. You can also write 1k / 2.5k and it is converted automatically.",
    po_batch: "Batch {n}", po_add_batch: "Add Batch", po_rm: "Remove batch", po_ph: "#tag1 | 10\n#tag2 | 5",
    po_sum: "{t} tags · {f} farms = {b} items · 🪙 {k}", po_total: "Total ({b} items)", po_note_label: "Note for admin (optional)", po_continue: "Continue to Pay",
    po_err_line: "Line {l}: the format must be tag | quantity", po_err_num: "Line {l}: the quantity must be a whole number (e.g. 10) or in k (e.g. 1k)",
    po_err_k: "Line {l}: {v} items is not divisible by {pf} per farm request", po_err_dup: "Line {l}: the tag {tg} is listed twice", po_err_zero: "Line {l}: the quantity must be at least 1 request",
    po_err_tags: "Batch {n}: at most {m} tags", po_err_max: "Batch {n}: at most {mx} items per batch (currently {b}). Continue in the next batch.",
    po_err_empty: "Enter at least 1 line: tag | quantity", po_err_5: "At most 5 batches per order", po_err_na: "Pre Order not available", po_err_many: "Too many Pre Orders are still waiting",
    po_pay_note: "📝 Coins are deducted now. The admin processes your Pre Order manually — see its status in Purchase History → My Pre Orders. If the admin rejects it, your coins are refunded. After paying, confirm with the admin on WhatsApp so it is processed quickly.",
    po_pay_btn: "Pay {n} Coins & Pre Order", po_cf_batch: "Batches × items", po_ok_title: "Pre Order Sent",
    po_ok_text: "{n} batch(es) ({b} items) for {item} have been created. Please confirm with the admin on WhatsApp so it is processed quickly.",
    po_wa: "Hello admin, I'm {u} and I placed a Pre Order for {item}: {n} batch(es), {b} items (total 🪙 {total}). Please process it.",
    po_my: "My Pre Orders", po_batch_of: "Batch {a}/{b}", po_items: "{n} items", po_copy: "Copy tag | quantity", po_saved_hist: "Saved in Purchase History → My Pre Orders."
});
Object.assign(SERVER_ERROR_MAP, { "Stok farm tidak cukup": "farm_err_stock", "Farm tidak tersedia": "farm_err_na", "Item sedang tidak ready": "cat_err_ready", "Harga koin item belum diatur admin": "cat_err_price",
    "Stok Hav Token tidak cukup": "hav_err_stock", "Hav Token tidak tersedia": "hav_err_na",
    "Pre Order tidak tersedia": "po_err_na", "Harga Pre Order belum diatur admin": "cat_err_price", "Isi minimal 1 batch": "po_err_empty",
    "Maksimal 5 batch per pemesanan": "po_err_5", "Terlalu banyak Pre Order yang masih menunggu": "po_err_many" });

let myCatalog = [], myCatCats = [], myFarmShop = [], myHavShop = [], myCatOrders = [], myFarmSales = [], myHavSales = [], myPre = [], myPreOrders = [];
const catOpen = new Set();          // kotak yang sedang terbuka (dropdown)
const CAT_DEFAULT = [{ slug: "koin", nama: "Koin", ikon: "🪙" }, { slug: "voucher", nama: "Voucher", ikon: "🎟" }, { slug: "farm", nama: "Farm", ikon: "🌱" }];
const _catImg = {};   // "id:versi" -> dataURL
const catKey = c => c.id + ":" + c.img_v;
const farmKey = f => "farm" + f.id + ":" + f.img_v;
/** harga akhir + harga normal dicoret (hanya untuk "Harga Pelanggan"; Custom Price tampil sebagai harga biasa) */
const catOld = (normal, final) => normal && Number(normal) > Number(final) ? `<s class="cat-old">🪙 ${fmtNum(normal)}</s> ` : "";
const catName = c => (c.slug === "koin" || c.slug === "voucher" || c.slug === "farm") ? t("cat_" + c.slug) : c.nama;

async function loadCatalog() {
    const [a, b, fs, hv, co, fsl, hsl, pre, pro] = await Promise.all([cuRpc("cu_catalog"), cuRpc("cu_catalog_cats"), cuRpc("cu_farm_shop"), cuRpc("cu_hav_shop"),
        cuRpc("cu_my_catalog_orders"), cuRpc("cu_my_farm_sales"), cuRpc("cu_my_hav_sales"), cuRpc("cu_preorder_items"), cuRpc("cu_my_preorders")]);
    myCatalog = a.data || [];
    const ok = r => (!r.error && r.data) || [];
    myFarmShop = ok(fs); myHavShop = ok(hv); myCatOrders = ok(co); myFarmSales = ok(fsl); myHavSales = ok(hsl); myPre = ok(pre); myPreOrders = ok(pro);
    myCatCats = (!b.error && b.data && b.data.length) ? b.data : CAT_DEFAULT;   // SQL kategori belum dijalankan -> 3 kategori bawaan
    renderCatalog();
}

/* ---- kartu-kartu ---- */
function farmCardHtml(f) {
    return `<article class="shop-card">
        <div class="shop-media" data-fid="${f.id}" ${f.img_v ? `onclick="openFarmImg(${f.id})"` : ""}>${(f.img_v && _catImg[farmKey(f)]) ? `<img src="${_catImg[farmKey(f)]}" alt="${escapeHtml(f.nama)}">` : `<div class="shop-ph">${f.img_v ? "⏳" : "🌱"}</div>`}<span class="cat-state ${f.available ? "ok" : "off"}">${f.available ? "● " + escapeHtml(t("cat_ready")) : "○ " + escapeHtml(t("farm_empty_stock"))}</span></div>
        <div class="shop-body"><div class="supply-name">${escapeHtml(f.nama)}</div>
            ${f.deskripsi ? `<div class="supply-meta farm-desc">${linkify(f.deskripsi)}</div>` : ""}
            <div class="cat-price">${catOld(f.harga_normal, f.harga_koin)}🪙 ${fmtNum(f.harga_koin)} ${escapeHtml(t("farm_unit"))}${cuCoinUsd(f.harga_koin) ? ` <small>${escapeHtml(cuCoinUsd(f.harga_koin))}</small>` : ""}</div>
            <div class="supply-meta">${escapeHtml(t("farm_stock"))}: <b>${fmtNum(f.available)}</b> token</div>
            <div class="supply-order"><input type="number" id="fq${f.id}" min="1" max="${f.available}" inputmode="numeric" placeholder="${escapeHtml(t("cat_qty"))}" ${f.available ? "" : "disabled"} oninput="onFarmQty(${f.id})">
                <button type="button" class="btn btn-primary" onclick="buyFarm(${f.id})" ${f.available ? "" : "disabled"}>${escapeHtml(t("farm_buy"))}</button></div>
            <div class="supply-sum" id="fqt${f.id}"></div></div></article>`;
}
function havCardHtml(h) {
    return `<article class="shop-card">
        <div class="shop-media"><div class="shop-ph">🔑</div><span class="cat-state ${h.available ? "ok" : "off"}">${h.available ? "● " + escapeHtml(t("cat_ready")) : "○ " + escapeHtml(t("farm_empty_stock"))}</span></div>
        <div class="shop-body"><div class="supply-name">${escapeHtml(h.nama)}</div>
            ${h.deskripsi ? `<div class="supply-meta farm-desc">${linkify(h.deskripsi)}</div>` : ""}
            <div class="cat-price">${catOld(h.harga_normal, h.harga_koin)}🪙 ${fmtNum(h.harga_koin)} ${escapeHtml(t("hav_unit"))}${cuCoinUsd(h.harga_koin) ? ` <small>${escapeHtml(cuCoinUsd(h.harga_koin))}</small>` : ""}</div>
            <div class="supply-meta">${escapeHtml(t("farm_stock"))}: <b>${fmtNum(h.available)}</b> ${escapeHtml(t("hav_stock_unit"))}</div>
            <div class="supply-order"><input type="number" id="hq${h.id}" min="1" max="${h.available}" inputmode="numeric" placeholder="${escapeHtml(t("cat_qty"))}" ${h.available ? "" : "disabled"} oninput="onHavQty(${h.id})">
                <button type="button" class="btn btn-primary" onclick="buyHav(${h.id})" ${h.available ? "" : "disabled"}>${escapeHtml(t("farm_buy"))}</button></div>
            <div class="supply-sum" id="hqt${h.id}"></div></div></article>`;
}
function catItemCardHtml(c) {
    const src = c.img_v && _catImg[catKey(c)];
    const kn = catName(myCatCats.find(x => x.slug === c.kategori) || { slug: c.kategori, nama: c.kategori });
    const msg = t("cat_wa_text", { u: contactUser(), item: c.nama, kat: kn }) + (c.harga ? " " + c.harga : "");
    return `<article class="shop-card ${c.ready ? "" : "is-off"}">
        <div class="shop-media" data-cid="${c.id}" ${c.img_v ? `onclick="openCatImg(${c.id})"` : ""}>
            ${src ? `<img src="${src}" alt="${escapeHtml(c.nama)}">` : `<div class="shop-ph">${c.img_v ? "⏳" : "🛍"}</div>`}
            <span class="cat-state ${c.ready ? "ok" : "off"}">${c.ready ? "● " + escapeHtml(t("cat_ready")) : "○ " + escapeHtml(t("cat_not_ready"))}</span>
        </div>
        <div class="shop-body">
            <div class="supply-name">${escapeHtml(c.nama)}</div>
            ${c.harga ? `<div class="cat-price">${escapeHtml(c.harga)}</div>` : ""}
            ${c.deskripsi ? `<div class="supply-meta farm-desc">${linkify(c.deskripsi)}</div>` : ""}
            ${c.ready && c.harga_koin > 0 && c.kategori !== "farm"
                ? `<div class="cat-price">${catOld(c.harga_normal, c.harga_koin)}🪙 ${fmtNum(c.harga_koin)}${cuCoinUsd(c.harga_koin) ? ` <small>${escapeHtml(cuCoinUsd(c.harga_koin))}</small>` : ""}</div>
                   <div class="supply-order"><input type="number" id="cq${c.id}" min="1" max="1000" value="1" inputmode="numeric" placeholder="${escapeHtml(t("cat_qty"))}">
                   <button type="button" class="btn btn-primary" onclick="orderCatalog(${c.id})">${escapeHtml(t("cat_coin_order"))}</button></div>`
                : (c.ready ? contactButtonsHtml(msg, "cat-order") : "")}
        </div>
    </article>`;
}

/* ---- kotak dropdown ---- */
function catSections() {
    const manualFarm = myCatalog.filter(c => c.kategori === "farm");
    const secs = [
        { key: "farm", ico: "🌱", name: t("cat_farm"), n: myFarmShop.length + manualFarm.length, html: () => myFarmShop.map(farmCardHtml).join("") + manualFarm.map(catItemCardHtml).join("") },
        { key: "hav", ico: "🔑", name: t("cat_hav"), n: myHavShop.length, html: () => myHavShop.map(havCardHtml).join("") },
        { key: "product", ico: "📦", name: t("cat_product"), n: typeof mySupply !== "undefined" ? mySupply.length : 0,
            html: () => (typeof mySupply !== "undefined" ? mySupply : []).map(s => supplyCardHtml(s, "cp")).join("") }
    ];
    secs.push({ key: "pre", ico: "📝", name: t("cat_pre"), n: myPre.length, html: () => myPre.map(preCardHtml).join("") });
    myCatCats.filter(c => c.slug !== "farm").forEach(c => {
        const list = myCatalog.filter(x => x.kategori === c.slug);
        secs.push({ key: "c:" + c.slug, ico: c.ikon || "🛍", name: catName(c), n: list.length, html: () => list.map(catItemCardHtml).join("") });
    });
    return secs;
}
function renderCatalog() {
    const box = $("catAccordion"); if (!box) return;
    box.innerHTML = catSections().map(s => {
        const open = catOpen.has(s.key);
        return `<section class="cat-acc ${open ? "open" : ""}" data-key="${escapeHtml(s.key)}">
            <button type="button" class="cat-acc-head" data-acc="${escapeHtml(s.key)}" aria-expanded="${open}"><span class="cat-acc-ic">${escapeHtml(s.ico)}</span><span class="cat-acc-name">${escapeHtml(s.name)}</span><i class="cat-acc-n">${s.n}</i><span class="cat-acc-caret">▾</span></button>
            <div class="cat-acc-body">${s.n ? `<div class="cat-grid">${s.html()}</div>` : `<div class="cat-acc-empty">${escapeHtml(t("cat_empty"))}</div>`}</div>
        </section>`;
    }).join("");
    hydrateCatImages();
    renderMyCatOrders();
}

/* ---- pesan item katalog (Koin / Voucher / kategori lain) dengan koin: menunggu admin ---- */
function orderCatalog(id) {
    const c = myCatalog.find(x => x.id === id); if (!c) return;
    const q = Math.max(1, parseInt($("cq" + id).value, 10) || 1), total = c.harga_koin * q;
    $("modalBox").innerHTML = `<div class="modal-title">🛍 ${escapeHtml(t("cat_confirm"))}</div>
        <div class="modal-sub">${escapeHtml(c.nama)} × ${fmtNum(q)}</div>
        <div class="coin-lines"><div class="coin-line"><span>${escapeHtml(t("coin_total"))}</span><b>🪙 ${fmtNum(total)}${cuCoinUsd(total) ? `<small class="coin-usd">${escapeHtml(cuCoinUsd(total))}</small>` : ""}</b></div></div>
        <label class="rn-label" for="coNote">${escapeHtml(t("cat_note_label"))}</label><textarea id="coNote" class="no-area" rows="3" maxlength="300"></textarea>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" id="coNo">${escapeHtml(t("rn_cancel"))}</button><button type="button" class="btn btn-primary" id="coYes">${escapeHtml(t("cat_send"))}</button></div>`;
    $("modalOverlay").classList.add("show"); $("coNo").addEventListener("click", closeModal);
    $("coYes").addEventListener("click", async () => {
        $("coYes").disabled = true;
        const paid = await payStep({ pkg: "CATALOG", total, note: t("cat_pay_note"),
            lines: [[t("farm_cf_item"), c.nama], [t("farm_cf_qty"), `${fmtNum(q)} × 🪙 ${fmtNum(c.harga_koin)}`]],
            waText: tot => t("cat_wa_text", { u: contactUser(), item: c.nama + " x" + q, kat: tot }) });
        if (!paid) { $("coYes").disabled = false; return; }
        const { data, error } = await cuRpc("cu_order_catalog", { p_item_id: id, p_qty: q, p_catatan: $("coNote").value.trim() || null });
        closeModal();
        if (error) { showToast(translateServerError(error.message) || error.message || "Error", "danger"); return; }
        loadCatalog(); if (typeof loadCoin === "function") loadCoin();
        showCatOrdered(c, q, data);
    });
}
/** Setelah koin dipotong: ajak pelanggan konfirmasi ke admin lewat WhatsApp. */
function showCatOrdered(c, q, data) {
    const text = t("cat_wa_confirm", { u: contactUser(), item: `${c.nama} ×${q}`, total: fmtNum(data.total), id: data.id });
    $("modalBox").innerHTML = `<div class="modal-icon success">✅</div><div class="modal-title">${escapeHtml(t("cat_ordered_title"))}</div>
        <div class="modal-sub">${escapeHtml(t("cat_ordered_text", { id: data.id, item: `${c.nama} ×${q}` }))}</div>
        <a class="btn btn-wa btn-block" href="${waProof(text)}" target="_blank" rel="noopener noreferrer">💬 ${escapeHtml(t("cat_confirm_admin"))}</a>
        <button type="button" class="btn btn-ghost btn-block" id="catOkClose" style="margin-top:8px;">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show"); $("catOkClose").addEventListener("click", closeModal);
}

/* ---- Farm & Hav Token: beli dengan koin, token/key langsung dikirim ---- */
function onFarmQty(id) {
    const f = myFarmShop.find(x => x.id === id), el = $("fqt" + id); if (!f || !el) return;
    const q = parseInt($("fq" + id).value, 10), tot = q > 0 ? f.harga_koin * q : 0;
    el.textContent = tot ? `${t("supply_total")}: 🪙 ${fmtNum(tot)}${cuCoinUsd(tot) ? " · " + cuCoinUsd(tot) : ""}` : "";
}
function onHavQty(id) {
    const h = myHavShop.find(x => x.id === id), el = $("hqt" + id); if (!h || !el) return;
    const q = parseInt($("hq" + id).value, 10), tot = q > 0 ? h.harga_koin * q : 0;
    el.textContent = tot ? `${t("supply_total")}: 🪙 ${fmtNum(tot)}${cuCoinUsd(tot) ? " · " + cuCoinUsd(tot) : ""}` : "";
}
async function buyFarm(id) {
    const f = myFarmShop.find(x => x.id === id); if (!f) return;
    const q = parseInt($("fq" + id).value, 10);
    if (!q || q < 1) { showToast(t("supply_qty_err"), "danger"); return; }
    if (q > f.available) { showToast(t("farm_err_stock"), "danger"); return; }
    const total = f.harga_koin * q;
    const paid = await payStep({ pkg: "FARM", total, payBtnKey: "farm_pay_btn", note: t("farm_pay_note"),
        lines: [[t("farm_cf_item"), f.nama], [t("farm_cf_qty"), `${fmtNum(q)} × 🪙 ${fmtNum(f.harga_koin)}`]], waText: tot => t("cat_wa_text", { u: contactUser(), item: f.nama + " x" + q, kat: tot }) });
    if (!paid) return;
    const { data, error } = await cuRpc("cu_buy_farm", { p_batch_id: id, p_qty: q });
    if (error) { showToast(translateServerError(error.message) || error.message || "Error", "danger"); return; }
    if (typeof loadCoin === "function") loadCoin();
    await loadCatalog();
    showDelivered({ icon: "🌱", title: "farm_bought", sub: t("farm_sent", { n: data.tokens.length }), saved: "farm_saved_hist", text: data.tokens.map(farmLine).join("\n"), rows: data.tokens.length, histSel: ".farm-sale" });
}
async function buyHav(id) {
    const h = myHavShop.find(x => x.id === id); if (!h) return;
    const q = parseInt($("hq" + id).value, 10);
    if (!q || q < 1) { showToast(t("supply_qty_err"), "danger"); return; }
    if (q > h.available) { showToast(t("hav_err_stock"), "danger"); return; }
    const total = h.harga_koin * q;
    const paid = await payStep({ pkg: "HAV", total, payBtnKey: "hav_pay_btn", note: t("hav_pay_note"),
        lines: [[t("hav_cf_item"), h.nama], [t("farm_cf_qty"), `${fmtNum(q)} × 🪙 ${fmtNum(h.harga_koin)}`]], waText: tot => t("cat_wa_text", { u: contactUser(), item: h.nama + " x" + q, kat: tot }) });
    if (!paid) return;
    const { data, error } = await cuRpc("cu_buy_hav", { p_batch_id: id, p_qty: q });
    if (error) { showToast(translateServerError(error.message) || error.message || "Error", "danger"); return; }
    if (typeof loadCoin === "function") loadCoin();
    await loadCatalog();
    showDelivered({ icon: "🔑", title: "hav_bought", sub: t("hav_sent", { n: data.keys.length }), saved: "hav_saved_hist", text: data.keys.join("\n"), rows: data.keys.length, histSel: ".hav-sale" });
}
const farmLine = tk => `${tk.no},${tk.farm_id},${tk.token}`;
/** Jendela sukses: isi token/key + salin + tombol ke Riwayat Pembelian. */
function showDelivered(o) {
    $("modalBox").innerHTML = `<div class="modal-icon success">${o.icon}</div><div class="modal-title">${escapeHtml(t(o.title))}</div>
        <div class="modal-sub">${escapeHtml(o.sub)}<br><small>${escapeHtml(t(o.saved))}</small></div>
        <textarea class="ct-msg" id="dlvTok" rows="${Math.min(10, o.rows + 1)}" readonly>${escapeHtml(o.text)}</textarea>
        <button type="button" class="btn btn-primary btn-block" id="dlvCopy" style="margin-top:8px;">📋 ${escapeHtml(t("farm_copy_all"))}</button>
        <button type="button" class="btn btn-outline btn-block" id="dlvHist" style="margin-top:8px;">🧾 ${escapeHtml(t("farm_view_hist"))}</button>
        <button type="button" class="btn btn-ghost btn-block" id="dlvClose" style="margin-top:8px;">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show");
    $("dlvClose").addEventListener("click", closeModal);
    $("dlvCopy").addEventListener("click", () => _payCopy(o.text, $("dlvCopy")));
    $("dlvHist").addEventListener("click", () => {
        closeModal();
        const box = document.querySelector("#catMyOrders " + o.histSel); if (box) { box.open = true; box.scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
}

/* ---- Riwayat Pembelian: pesanan katalog + pembelian farm + pembelian hav ---- */
function renderMyCatOrders() {
    const box = $("catMyOrders"); if (!box) return;
    if (!myCatOrders.length && !myFarmSales.length && !myHavSales.length && !myPreOrders.length) { box.innerHTML = ""; return; }
    const stl = { pending: "cat_st_pending", done: "cat_st_done", rejected: "cat_st_rejected" };
    const loc = numLocale(), day = iso => new Date(iso).toLocaleDateString(loc, { day: "2-digit", month: "short" });
    const sale = (cls, s, lines, copyAttr) => `<details class="bo-item ${cls}"><summary><b>${escapeHtml(s.batch_nama)}</b> × ${fmtNum(s.qty)} <span class="bo-item-sub">· 🪙 ${fmtNum(s.total)} · ${day(s.created_at)}</span></summary>
            <textarea class="ct-msg" rows="${Math.min(6, lines.length + 1)}" readonly>${escapeHtml(lines.join("\n"))}</textarea>
            <button type="button" class="btn btn-ghost mini" ${copyAttr} style="margin-top:6px;">📋 ${escapeHtml(t("farm_copy_all"))}</button></details>`;
    box.innerHTML = `<div class="panel bo-panel"><div class="panel-title">🧾 ${escapeHtml(t("cat_hist_title"))}</div>
        ${myCatOrders.length ? `<div class="rn-label" style="margin:2px 0;">🛍 ${escapeHtml(t("cat_my_orders"))}</div>` + myCatOrders.map(o => `<div class="bo-item"><div><b>${escapeHtml(o.item_nama)}</b> × ${fmtNum(o.qty)}<div class="bo-item-sub">${day(o.created_at)}${o.catatan_admin ? " · 💬 " + escapeHtml(o.catatan_admin) : ""}</div></div>
            <div style="text-align:right;"><b>🪙 ${fmtNum(o.total)}</b><div class="bo-item-sub">${escapeHtml(t(stl[o.status] || "cat_st_pending"))}</div></div></div>`).join("") : ""}
        ${myFarmSales.length ? `<div class="rn-label" style="margin:10px 0 2px;">🌱 ${escapeHtml(t("farm_my"))}</div>` + myFarmSales.map(s => sale("farm-sale", s, s.tokens.map(farmLine), `data-farm-copy="${s.id}"`)).join("") : ""}
        ${myPreOrders.length ? `<div class="rn-label" style="margin:10px 0 2px;">📝 ${escapeHtml(t("po_my"))}</div>` + myPreOrders.map(o => `<details class="bo-item po-sale"><summary><b>${escapeHtml(o.item_nama)}</b> · ${escapeHtml(t("po_batch_of", { a: o.batch_no, b: o.batch_total }))} <span class="bo-item-sub">· ${escapeHtml(t("po_items", { n: fmtNum(o.total_barang) }))} · 🪙 ${fmtNum(o.total_koin)} · ${day(o.created_at)} · ${escapeHtml(t(stl[o.status] || "cat_st_pending"))}${o.catatan_admin ? " · 💬 " + escapeHtml(o.catatan_admin) : ""}</span></summary>
            <textarea class="ct-msg" rows="${Math.min(8, o.lines.length + 1)}" readonly>${escapeHtml(o.lines.map(l => `${l.tagar} | ${l.jumlah}`).join("\n"))}</textarea>
            <button type="button" class="btn btn-ghost mini" data-po-copy="${o.id}" style="margin-top:6px;">📋 ${escapeHtml(t("po_copy"))}</button></details>`).join("") : ""}
        ${myHavSales.length ? `<div class="rn-label" style="margin:10px 0 2px;">🔑 ${escapeHtml(t("hav_my"))}</div>` + myHavSales.map(s => sale("hav-sale", s, s.keys, `data-hav-copy="${s.id}"`)).join("") : ""}</div>`;
}

function hydrateFarmImages() {
    myFarmShop.filter(f => f.img_v && !_catImg[farmKey(f)]).forEach(async f => {
        const { data } = await cuRpc("cu_farm_image", { p_batch_id: f.id });
        if (!data) return;
        _catImg[farmKey(f)] = `data:${data.mime};base64,${data.data}`;
        document.querySelectorAll(`#catAccordion .shop-media[data-fid="${f.id}"] .shop-ph`).forEach(ph => ph.outerHTML = `<img src="${_catImg[farmKey(f)]}" alt="${escapeHtml(f.nama)}">`);
    });
}
function openFarmImg(id) {
    const f = myFarmShop.find(x => x.id === id), src = f && _catImg[farmKey(f)]; if (!src) return;
    $("modalBox").innerHTML = `<img src="${src}" alt="" class="shop-zoom"><div class="modal-title" style="margin-top:12px;">${escapeHtml(f.nama)}</div>
        <div class="modal-sub">🪙 ${fmtNum(f.harga_koin)} ${escapeHtml(t("farm_unit"))}</div>
        ${f.deskripsi ? `<div class="farm-desc farm-desc-zoom">${linkify(f.deskripsi)}</div>` : ""}
        <button type="button" class="btn btn-ghost btn-block" id="zoomClose">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show"); $("zoomClose").addEventListener("click", closeModal);
}
function hydrateCatImages() {
    hydrateFarmImages(); hydratePreImages();
    if (typeof hydrateSupplyImages === "function") hydrateSupplyImages();      // gambar Product (cache sama dengan tab Supply & Stock)
    myCatalog.filter(c => c.img_v && !_catImg[catKey(c)]).forEach(async c => {
        const { data } = await cuRpc("cu_catalog_image", { p_id: c.id });
        if (!data) return;
        _catImg[catKey(c)] = `data:${data.mime};base64,${data.data}`;
        document.querySelectorAll(`#catAccordion .shop-media[data-cid="${c.id}"] .shop-ph`).forEach(ph => ph.outerHTML = `<img src="${_catImg[catKey(c)]}" alt="${escapeHtml(c.nama)}">`);
    });
}
function openCatImg(id) {
    const c = myCatalog.find(x => x.id === id), src = c && _catImg[catKey(c)]; if (!src) return;
    $("modalBox").innerHTML = `<img src="${src}" alt="" class="shop-zoom"><div class="modal-title" style="margin-top:12px;">${escapeHtml(c.nama)}</div>
        ${c.harga ? `<div class="modal-sub">${escapeHtml(c.harga)}</div>` : ""}
        <button type="button" class="btn btn-ghost btn-block" id="zoomClose">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show"); $("zoomClose").addEventListener("click", closeModal);
}

/* ---------------- PRE ORDER: tagar | jumlah (request farm), maks 10 tagar & 10k barang per batch ---------------- */
const preCost = (barang, harga) => Math.ceil(Number(barang || 0) * Number(harga || 0) / 10000);
const preKey = p => "pre" + p.id + ":" + p.img_v;
function preCardHtml(p) {
    const src = p.img_v && _catImg[preKey(p)];
    return `<article class="shop-card">
        <div class="shop-media" data-pid="${p.id}" ${p.img_v ? `onclick="openPreImg(${p.id})"` : ""}>${src ? `<img src="${src}" alt="${escapeHtml(p.nama)}">` : `<div class="shop-ph">${p.img_v ? "⏳" : "📝"}</div>`}<span class="cat-state ok">● ${escapeHtml(t("cat_pre"))}</span></div>
        <div class="shop-body"><div class="supply-name">${escapeHtml(p.nama)}</div>
            ${p.deskripsi ? `<div class="supply-meta farm-desc">${linkify(p.deskripsi)}</div>` : ""}
            <div class="cat-price">${catOld(p.harga_normal, p.harga_koin)}🪙 ${fmtNum(p.harga_koin)} ${escapeHtml(t("po_price_unit"))}${cuCoinUsd(p.harga_koin) ? ` <small>${escapeHtml(cuCoinUsd(p.harga_koin))}</small>` : ""}</div>
            <div class="supply-meta">${escapeHtml(t("po_per_farm", { pf: fmtNum(p.per_farm) }))}</div>
            <div class="supply-order"><button type="button" class="btn btn-primary" style="flex:1" onclick="openPre(${p.id})">${escapeHtml(t("po_btn"))}</button></div></div></article>`;
}
/** Baca satu batch: baris "tagar | jumlah". jumlah = request farm; "1k"/"2.5k" = jumlah BARANG, dikonversi ke request. */
function preParse(text, it, bn) {
    const out = { lines: [], errs: [], farm: 0, barang: 0 }, seen = new Set();
    String(text || "").split(/\r?\n/).forEach((raw, i) => {
        const ln = raw.trim(); if (!ln) return;
        const l = i + 1, m = ln.includes("|") ? ln.split("|") : (/^(.*\S)\s+(\S+)$/.exec(ln) || []).slice(1);
        if (m.length !== 2 || !m[0].trim() || !m[1].trim()) { out.errs.push(t("po_err_line", { l })); return; }
        const tag = m[0].trim().slice(0, 100), raw2 = m[1].trim().replace(/\s+/g, "").replace(",", "."), key = tag.toLowerCase().replace(/#/g, "");
        let farm;
        if (/^\d{1,6}$/.test(raw2)) farm = parseInt(raw2, 10);
        else if (/^\d+(\.\d+)?k$/i.test(raw2)) {
            const items = Math.round(parseFloat(raw2) * 1000);
            if (items % it.per_farm) { out.errs.push(t("po_err_k", { l, v: fmtNum(items), pf: fmtNum(it.per_farm) })); return; }
            farm = items / it.per_farm;
        } else { out.errs.push(t("po_err_num", { l })); return; }
        if (farm < 1) { out.errs.push(t("po_err_zero", { l })); return; }
        if (seen.has(key)) { out.errs.push(t("po_err_dup", { l, tg: tag })); return; }
        seen.add(key); out.lines.push({ tagar: tag, jumlah: farm }); out.farm += farm;
    });
    out.barang = out.farm * it.per_farm;
    if (out.lines.length > it.max_tagar) out.errs.push(t("po_err_tags", { n: bn, m: it.max_tagar }));
    if (out.barang > it.max_barang) out.errs.push(t("po_err_max", { n: bn, mx: fmtNum(it.max_barang), b: fmtNum(out.barang) }));
    return out;
}
let preCur = null, preSeq = 0;
function openPre(id) {
    const it = myPre.find(x => x.id === id); if (!it) return; preCur = it; preSeq = 0;
    $("modalBox").innerHTML = `<div class="modal-title">📝 ${escapeHtml(it.nama)}</div>
        <div class="modal-sub">${escapeHtml(t("po_rule", { pf: fmtNum(it.per_farm), p: fmtNum(it.harga_koin), mx: fmtNum(it.max_barang), tg: it.max_tagar }))}</div>
        <div class="po-help">${escapeHtml(t("po_format", { pf: fmtNum(it.per_farm), kreq: fmtNum(Math.round(1000 / it.per_farm * 100) / 100) }))}</div>
        <div id="poBatches"></div>
        <button type="button" class="btn btn-outline btn-block" id="poAddB" style="margin:6px 0 10px;">➕ ${escapeHtml(t("po_add_batch"))}</button>
        <label class="rn-label" for="poNote">${escapeHtml(t("po_note_label"))}</label><textarea id="poNote" class="no-area" rows="2" maxlength="300"></textarea>
        <div class="coin-lines"><div class="coin-line"><span id="poTotL">${escapeHtml(t("coin_total"))}</span><b id="poTot">🪙 0</b></div></div>
        <div class="po-err" id="poErr"></div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" id="poNo">${escapeHtml(t("rn_cancel"))}</button><button type="button" class="btn btn-primary" id="poYes">${escapeHtml(t("po_continue"))}</button></div>`;
    $("modalOverlay").classList.add("show");
    preAddBatch();
    $("poAddB").addEventListener("click", preAddBatch); $("poNo").addEventListener("click", closeModal); $("poYes").addEventListener("click", preSubmit);
    $("poBatches").addEventListener("input", preRecalc);
    $("poBatches").addEventListener("click", e => { const b = e.target.closest("[data-porm]"); if (b) { b.closest(".po-batch").remove(); preRecalc(); } });
}
function preAddBatch() {
    const box = $("poBatches"); if (!box) return;
    if (box.querySelectorAll(".po-batch").length >= 5) { showToast(t("po_err_5"), "danger"); return; }
    const n = ++preSeq, first = box.children.length === 0;
    const d = document.createElement("div"); d.className = "po-batch";
    d.innerHTML = `<div class="po-bhead"><b class="po-bn">${escapeHtml(t("po_batch", { n }))}</b><span class="po-bsum"></span>${first ? "" : `<button type="button" class="btn btn-ghost mini" data-porm="1">🗑 ${escapeHtml(t("po_rm"))}</button>`}</div>
        <textarea class="po-ta no-area" rows="5" placeholder="${escapeHtml(t("po_ph"))}" spellcheck="false"></textarea>`;
    box.appendChild(d);
}
/** Hitung semua batch di form; kembalikan { batches, errs, barang, koin } dan perbarui ringkasan */
function preRecalc() {
    const it = preCur; if (!it) return null;
    const res = { batches: [], errs: [], barang: 0, koin: 0 };
    document.querySelectorAll("#poBatches .po-batch").forEach((d, idx) => {
        const bn = idx + 1, p = preParse(d.querySelector(".po-ta").value, it, bn), sum = d.querySelector(".po-bsum");
        d.querySelector(".po-bn").textContent = t("po_batch", { n: bn });
        sum.textContent = p.lines.length ? t("po_sum", { t: p.lines.length, f: fmtNum(p.farm), b: fmtNum(p.barang), k: fmtNum(preCost(p.barang, it.harga_koin)) }) : "";
        sum.classList.toggle("bad", p.errs.length > 0);
        if (p.errs.length) res.errs.push(...p.errs);
        if (p.lines.length) { res.batches.push(p.lines); res.barang += p.barang; res.koin += preCost(p.barang, it.harga_koin); }
    });
    $("poTot").textContent = "🪙 " + fmtNum(res.koin) + (cuCoinUsd(res.koin) ? " · " + cuCoinUsd(res.koin) : "");
    $("poTotL").textContent = t("po_total", { b: fmtNum(res.barang) });
    $("poErr").innerHTML = res.errs.map(e => `<div>⚠️ ${escapeHtml(e)}</div>`).join("");
    return res;
}
async function preSubmit() {
    const it = preCur, r = preRecalc(); if (!it || !r) return;
    if (r.errs.length) return;
    if (!r.batches.length) { $("poErr").innerHTML = `<div>⚠️ ${escapeHtml(t("po_err_empty"))}</div>`; return; }
    $("poYes").disabled = true;
    const note = $("poNote").value.trim() || null;
    const paid = await payStep({ pkg: "PREORDER", total: r.koin, payBtnKey: "po_pay_btn", note: t("po_pay_note"),
        lines: [[t("farm_cf_item"), it.nama], [t("po_cf_batch"), `${r.batches.length} × ${fmtNum(r.barang)}`], [t("farm_cf_qty"), `${fmtNum(r.barang)} × 🪙 ${fmtNum(it.harga_koin)} ${t("po_price_unit")}`]],
        waText: tot => t("cat_wa_text", { u: contactUser(), item: it.nama + " Pre Order", kat: tot }) });
    if (!paid) { if ($("poYes")) $("poYes").disabled = false; return; }
    const { data, error } = await cuRpc("cu_place_preorder", { p_item_id: it.id, p_batches: r.batches, p_catatan: note });
    closeModal();
    if (error) { showToast(translateServerError(error.message) || error.message || "Error", "danger"); return; }
    if (typeof loadCoin === "function") loadCoin();
    loadCatalog();
    const text = t("po_wa", { u: contactUser(), item: it.nama, n: data.batches, b: fmtNum(r.barang), total: fmtNum(data.total) });
    $("modalBox").innerHTML = `<div class="modal-icon success">✅</div><div class="modal-title">${escapeHtml(t("po_ok_title"))}</div>
        <div class="modal-sub">${escapeHtml(t("po_ok_text", { n: data.batches, b: fmtNum(r.barang), item: it.nama }))}<br><small>${escapeHtml(t("po_saved_hist"))}</small></div>
        <a class="btn btn-wa btn-block" href="${waProof(text)}" target="_blank" rel="noopener noreferrer">💬 ${escapeHtml(t("cat_confirm_admin"))}</a>
        <button type="button" class="btn btn-ghost btn-block" id="poOkClose" style="margin-top:8px;">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show"); $("poOkClose").addEventListener("click", closeModal);
}
function hydratePreImages() {
    myPre.filter(p => p.img_v && !_catImg[preKey(p)]).forEach(async p => {
        const { data } = await cuRpc("cu_preorder_image", { p_item_id: p.id });
        if (!data) return;
        _catImg[preKey(p)] = `data:${data.mime};base64,${data.data}`;
        document.querySelectorAll(`#catAccordion .shop-media[data-pid="${p.id}"] .shop-ph`).forEach(ph => ph.outerHTML = `<img src="${_catImg[preKey(p)]}" alt="${escapeHtml(p.nama)}">`);
    });
}
function openPreImg(id) {
    const p = myPre.find(x => x.id === id), src = p && _catImg[preKey(p)]; if (!src) return;
    $("modalBox").innerHTML = `<img src="${src}" alt="" class="shop-zoom"><div class="modal-title" style="margin-top:12px;">${escapeHtml(p.nama)}</div>
        <div class="modal-sub">🪙 ${fmtNum(p.harga_koin)} ${escapeHtml(t("po_price_unit"))} · ${escapeHtml(t("po_per_farm", { pf: fmtNum(p.per_farm) }))}</div>
        ${p.deskripsi ? `<div class="farm-desc farm-desc-zoom">${linkify(p.deskripsi)}</div>` : ""}
        <button type="button" class="btn btn-ghost btn-block" id="zoomClose">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show"); $("zoomClose").addEventListener("click", closeModal);
}

/* ---- klik kotak = buka / tutup (tanpa render ulang supaya isian jumlah tidak hilang) ---- */
document.addEventListener("click", (e) => {
    const h = e.target.closest("#catAccordion [data-acc]");
    if (h) {
        const k = h.dataset.acc, sec = h.closest(".cat-acc"), open = !sec.classList.contains("open");
        sec.classList.toggle("open", open); h.setAttribute("aria-expanded", String(open));
        open ? catOpen.add(k) : catOpen.delete(k);
        return;
    }
    const f = e.target.closest("[data-farm-copy]");
    if (f) { const s = myFarmSales.find(x => String(x.id) === f.dataset.farmCopy); if (s) _payCopy(s.tokens.map(farmLine).join("\n"), f); return; }
    const pc = e.target.closest("[data-po-copy]");
    if (pc) { const o = myPreOrders.find(x => String(x.id) === pc.dataset.poCopy); if (o) _payCopy(o.lines.map(l => `${l.tagar} | ${l.jumlah}`).join("\n"), pc); return; }
    const v = e.target.closest("[data-hav-copy]");
    if (v) { const s = myHavSales.find(x => String(x.id) === v.dataset.havCopy); if (s) _payCopy(s.keys.join("\n"), v); }
});
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("langchange", renderCatalog);
    loadCatalog();
});
