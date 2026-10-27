/**
 * PRE ORDER (admin).
 *  1) Supply & Stock → tab "Pre Order": admin mengisi barang pre order (nama, harga koin per barang, deskripsi, foto,
 *     isi barang per 1 request farm, batas barang per pemesanan).
 *  2) Order → tab "Pre Order": pesanan dari pelanggan (tagar | jumlah request farm), tandai Selesai / Tolak (koin kembali).
 * Pelanggan memesan di menu Catalog → Pre Order. Butuh sql/koin-usdt-12-preorder.sql dan 12b.
 */
const poEl = id => document.getElementById(id);
const poPin = () => sessionStorage.getItem("akun_admin_pin");
const poCost = (barang, harga10k) => Math.ceil(Number(barang || 0) * Number(harga10k || 0) / 10000);
const poNum = n => Number(n || 0).toLocaleString("id-ID");
const poWaktu = iso => iso ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
let poItems = [], poBound = false, poOrders = [], poFilter = "pending", poOrdBound = false;
const poImgCache = {};

async function poRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: poPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (m.includes("PIN admin salah")) { sessionStorage.removeItem("akun_admin_pin"); showToast("PIN admin tidak valid, masukkan ulang", "danger"); }
        else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/koin-usdt-12-preorder.sql dan koin-usdt-12b-preorder-pelanggan.sql di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}

/* ---------------- 1) Barang Pre Order (Supply & Stock) ---------------- */
function poInit() {
    if (!poBound) {
        poBound = true;
        poEl("poNewBtn").addEventListener("click", () => poForm(null));
        poEl("poGrid").addEventListener("click", e => {
            const b = e.target.closest("[data-po]"); if (!b) return;
            const id = Number(b.dataset.id);
            if (b.dataset.po === "aktif") poToggle(id); else if (b.dataset.po === "edit") poForm(id); else if (b.dataset.po === "del") poDelete(id);
        });
    }
    poLoadItems();
}
async function poLoadItems() {
    const { data, error } = await poRpc("po_list_items", {});
    if (error) return;
    poItems = data || []; poRenderItems();
}
async function poImgUrl(it) {
    if (!it || !it.img_v) return null;
    const k = it.id + ":" + it.img_v; if (poImgCache[k]) return poImgCache[k];
    const { data, error } = await poRpc("po_get_image", { p_item_id: it.id });
    if (error || !data) return null;
    return (poImgCache[k] = `data:${data.mime};base64,${data.data}`);
}
async function poSaveImage(id, st) {
    if (!st) return true;
    if (st.dataUrl) {
        const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(st.dataUrl);
        if (!m) { showToast("Gambar tidak valid", "danger"); return false; }
        const { error } = await poRpc("po_set_image", { p_item_id: id, p_mime: m[1], p_data: m[2] }); return !error;
    }
    if (st.remove) { const { error } = await poRpc("po_delete_image", { p_item_id: id }); return !error; }
    return true;
}
function poRenderItems() {
    poEl("poEmpty").style.display = poItems.length ? "none" : "flex";
    poEl("poGrid").innerHTML = poItems.map(it => `
        <article class="ct-card ${it.aktif ? "" : "is-off"}">
            <div class="ct-media" data-po-img="${it.id}"><span>${it.img_v ? "⏳" : "📝"}</span></div>
            <div class="ct-body">
                <div class="ct-name">${escapeHtml(it.nama)}</div>
                <div class="ct-price">${it.harga_koin > 0 ? `🪙 ${poNum(it.harga_koin)} / 10.000 barang` : "🪙 harga belum diatur"}</div>
                <div class="ct-desc">1 request farm = ${poNum(it.per_farm)} barang · 🪙 ${poNum(poCost(it.per_farm, it.harga_koin))} / farm<br>Maks ${poNum(it.max_barang)} barang · ${it.max_tagar} tagar per batch${it.pending ? `<br><b>⏳ ${it.pending} pesanan menunggu</b>` : ""}</div>
                ${it.deskripsi ? `<div class="ct-desc">${escapeHtml(it.deskripsi)}</div>` : ""}
                <div class="ct-actions">
                    <button type="button" class="ct-ready ${it.aktif ? "on" : ""}" data-po="aktif" data-id="${it.id}" title="Klik untuk ubah status">${it.aktif ? "● Aktif" : "○ Nonaktif"}</button>
                    <button type="button" class="btn btn-ghost btn-icon" data-po="edit" data-id="${it.id}" title="Ubah">✏️</button>
                    <button type="button" class="btn btn-danger btn-icon" data-po="del" data-id="${it.id}" title="Hapus">🗑</button>
                </div>
            </div>
        </article>`).join("");
    poEl("poGrid").querySelectorAll("[data-po-img]").forEach(async el => {
        const it = poItems.find(x => x.id === Number(el.dataset.poImg)); const u = await poImgUrl(it);
        if (u) el.innerHTML = `<img src="${u}" alt="${escapeHtml(it.nama)}">`;
    });
}
async function poForm(id) {
    const it = id ? poItems.find(x => x.id === id) : null;
    const cur = it ? await poImgUrl(it) : null;
    spForm(it ? "Ubah Barang Pre Order" : "Barang Pre Order Baru", "📝", [
        { id: "nama", label: "Nama barang", value: it ? it.nama : "", placeholder: "mis. Jagung Pre Order" },
        { id: "harga", label: "Harga koin per 10.000 BARANG (1 koin = Rp 1)", type: "number", value: it ? it.harga_koin : "", placeholder: "mis. 200000" },
        { id: "per_farm", label: "Isi barang tiap 1 request farm", type: "number", value: it ? it.per_farm : 100, placeholder: "100" },
        { id: "max_barang", label: "Maks. barang per pemesanan (per batch)", type: "number", value: it ? it.max_barang : 10000, placeholder: "10000" },
        { id: "deskripsi", label: "Deskripsi", value: it ? it.deskripsi : "", placeholder: "keterangan singkat untuk pelanggan" },
        { id: "gambar", label: "Foto", type: "image", value: cur || "" }
    ], async v => {
        const harga = parseInt(v.harga, 10) || 0, pf = parseInt(v.per_farm, 10) || 100, mx = parseInt(v.max_barang, 10) || 10000;
        if (!v.nama) { showToast("Nama barang wajib diisi", "danger"); return; }
        if (harga <= 0) { showToast("Isi harga koin per 10.000 barang agar pelanggan bisa memesan", "danger"); return; }
        const { data, error } = await poRpc("po_save_item", { p_id: id, p_nama: v.nama, p_deskripsi: v.deskripsi, p_harga: harga, p_per_farm: pf, p_max_barang: mx, p_aktif: it ? it.aktif : true });
        if (error) return;
        const ok = await poSaveImage(data, v.gambar);
        showToast(ok ? "Barang Pre Order disimpan" : "Barang disimpan, tetapi foto gagal disimpan", ok ? "success" : "danger");
        poLoadItems();
    });
}
async function poToggle(id) {
    const it = poItems.find(x => x.id === id); if (!it) return;
    it.aktif = !it.aktif; poRenderItems();
    const { error } = await poRpc("po_set_aktif", { p_id: id, p_aktif: it.aktif });
    if (error) { it.aktif = !it.aktif; poRenderItems(); }
}
function poDelete(id) {
    const it = poItems.find(x => x.id === id); if (!it) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus barang Pre Order?", body: `<b>${escapeHtml(it.nama)}</b> beserta fotonya dihapus. Riwayat pesanan lama tetap ada.`, confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await poRpc("po_delete_item", { p_id: id }); if (!error) { showToast("Barang dihapus", "danger"); poLoadItems(); } } });
}

/* ---------------- 2) Pesanan Pre Order (menu Order) ---------------- */
async function poOrderInit() {
    if (!poPin()) { poOrdBound = false; ordRenderGate("pre"); return; }
    const pane = poEl("ordPane-pre");
    if (!poOrdBound) {
        poOrdBound = true;
        pane.innerHTML = `<section class="panel table-section"><div class="panel-title">📝 Pre Order <span class="panel-hint">dibayar koin akun · 1 batch = 1 baris · tandai Selesai setelah diproses</span></div>
            <div class="rn-filter" id="poFilter">
                <button type="button" data-f="pending" class="on">⏳ Menunggu <i>0</i></button><button type="button" data-f="done">✅ Selesai <i>0</i></button>
                <button type="button" data-f="rejected">✖ Ditolak <i>0</i></button><button type="button" data-f="all">Semua <i>0</i></button></div>
            <div class="table-wrap"><table style="min-width:900px;"><thead><tr><th>Waktu</th><th>Pelanggan</th><th>Barang</th><th>Tagar | jumlah</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody id="poOrdBody"></tbody></table></div><div class="rn-empty" id="poOrdEmpty" style="display:none;">Belum ada pesanan Pre Order.</div></section>`;
        poEl("poFilter").addEventListener("click", e => { const b = e.target.closest("button[data-f]"); if (b) { poFilter = b.dataset.f; poOrdRender(); } });
        poEl("poOrdBody").addEventListener("click", poOrdClick);
    }
    await poOrdLoad();
}
async function poOrdLoad() {
    const { data, error } = await poRpc("po_list_orders", {});
    if (error) return;
    poOrders = data || []; poOrdRender();
}
function poOrdBadge() {
    const n = poOrders.filter(r => r.status === "pending").length, b = poEl("coBadge-pre");
    if (b) { b.textContent = n; b.style.display = n ? "inline-block" : "none"; }
}
const poLinesText = r => (r.lines || []).map(l => `${l.tagar} | ${l.jumlah}`).join("\n");
function poOrdRender() {
    poOrdBadge();
    const cnt = k => k === "all" ? poOrders.length : poOrders.filter(r => r.status === k).length;
    poEl("poFilter").querySelectorAll("button").forEach(b => { b.classList.toggle("on", b.dataset.f === poFilter); b.querySelector("i").textContent = cnt(b.dataset.f); });
    const rows = poOrders.filter(r => poFilter === "all" || r.status === poFilter);
    poEl("poOrdEmpty").style.display = rows.length ? "none" : "block";
    const pill = { pending: ["⏳ Menunggu", "bp-pill mn"], done: ["✅ Selesai", "bp-pill rq"], rejected: ["✖ Ditolak", "bp-pill mn"] };
    poEl("poOrdBody").innerHTML = rows.map(r => {
        const st = pill[r.status] || [r.status, "bp-pill mn"], wa = String(r.whatsapp || "").replace(/[^0-9]/g, "");
        const acts = r.status === "pending" ? `<button class="btn btn-success mini" data-act="done" data-id="${r.id}">✅ Selesai</button> <button class="btn btn-ghost mini" data-act="no" data-id="${r.id}">Tolak</button>` : `<button class="btn btn-ghost mini" data-act="del" data-id="${r.id}">Hapus</button>`;
        return `<tr><td>${poWaktu(r.created_at)}<br><small>#${r.id}</small></td>
            <td><b>${escapeHtml(r.username)}</b>${wa ? `<br><a href="https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.username}, Pre Order ${r.item_nama} #${r.id} `)}" target="_blank" rel="noopener"><small>💬 WhatsApp</small></a>` : ""}</td>
            <td><b>${escapeHtml(r.item_nama)}</b><div class="cell-sub">Batch ${r.batch_no}/${r.batch_total} · 🪙 ${poNum(r.harga_10k || r.harga_satuan * 10000)} / 10.000 barang</div>${r.catatan ? `<div class="bo-note-inline">📝 ${escapeHtml(r.catatan)}</div>` : ""}</td>
            <td><details><summary><b>${(r.lines || []).length} tagar</b> · ${poNum(r.total_farm)} farm</summary><pre class="po-lines">${escapeHtml((r.lines || []).map(l => `${l.tagar} | ${l.jumlah} (${poNum(l.barang)} brg)`).join("\n"))}</pre>
                <button type="button" class="btn btn-ghost mini" data-act="copy" data-id="${r.id}">📋 Salin tagar | jumlah</button></details></td>
            <td><b>${poNum(r.total_barang)} barang</b><div class="cell-sub">🪙 ${poNum(r.total_koin)}</div></td>
            <td><span class="${st[1]}">${st[0]}</span>${r.catatan_admin ? `<br><small>${escapeHtml(r.catatan_admin)}</small>` : ""}</td><td style="white-space:nowrap;">${acts}</td></tr>`;
    }).join("");
}
function poOrdClick(e) {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = Number(b.dataset.id), act = b.dataset.act, r = poOrders.find(x => x.id === id); if (!r) return;
    if (act === "copy") { navigator.clipboard.writeText(poLinesText(r)).then(() => showToast("Disalin", "success")).catch(() => showToast("Gagal menyalin", "danger")); }
    else if (act === "done") openConfirmModal({ icon: "✅", iconClass: "success", title: "Tandai selesai?", body: `<b>${escapeHtml(r.item_nama)}</b> (batch ${r.batch_no}/${r.batch_total}, ${poNum(r.total_barang)} barang) untuk <b>${escapeHtml(r.username)}</b> sudah diproses?`, confirmText: "Ya, Selesai", confirmClass: "btn-success",
        onConfirm: async () => { const { error } = await poRpc("po_done", { p_id: id }); if (!error) { showToast("Pesanan selesai", "success"); poOrdLoad(); } } });
    else if (act === "no") openConfirmModal({ icon: "✖", iconClass: "danger", title: "Tolak pesanan?", body: `Koin <b>🪙 ${poNum(r.total_koin)}</b> dikembalikan ke <b>${escapeHtml(r.username)}</b>.`, confirmText: "Ya, Tolak", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await poRpc("po_reject", { p_id: id }); if (!error) { showToast("Ditolak, koin dikembalikan", "danger"); poOrdLoad(); } } });
    else if (act === "del") openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus dari daftar?", body: "Pesanan yang sudah diproses hanya dihapus dari daftar.", confirmText: "Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await poRpc("po_delete", { p_id: id }); if (!error) poOrdLoad(); } });
}
async function poRefreshBadge() {
    if (!poPin() || document.hidden) return;
    const { data, error } = await supabaseClient.rpc("po_list_orders", { p_pin: poPin() });
    if (!error && data) { poOrders = data; poOrdBadge(); }
}
document.addEventListener("DOMContentLoaded", () => { setTimeout(poRefreshBadge, 2200); setInterval(poRefreshBadge, 60000); });
