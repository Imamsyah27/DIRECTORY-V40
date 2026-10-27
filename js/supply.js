/**
 * SUPPLY & STOCK (admin) + PENGUMUMAN — sql/supply.sql
 * - Batch stok (mis. "Batch 1 (jagung)") berisi beberapa akun; stok tiap akun bisa diedit, total dihitung otomatis.
 * - Order dari pelanggan masuk ke tab "Order"; admin mencentang jika sudah dikirim.
 */
let spPin = sessionStorage.getItem("akun_admin_pin") || null;
let spBatches = [], spOrders = [], spTab = "stok", spOrderFilter = "pending", spInited = false;

const spEl = id => document.getElementById(id);
const spNum = n => Number(n || 0).toLocaleString("id-ID");
const spWaktu = iso => iso ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

async function spRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: spPin, ...params });
    if (res.error) {
        console.error(res.error);
        const m = res.error.message || "";
        if (m.includes("PIN admin salah")) {
            spPin = null; sessionStorage.removeItem("akun_admin_pin");
            ["spPinGate", "anPinGate"].forEach(i => spEl(i) && (spEl(i).style.display = "block"));
            ["spContent", "anContent"].forEach(i => spEl(i) && (spEl(i).style.display = "none"));
            showToast("PIN admin tidak valid, masukkan ulang", "danger");
        } else if (/does not exist|schema cache/i.test(m)) {
            showToast("Jalankan dulu sql/supply.sql di Supabase SQL Editor", "danger");
        } else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}

/* ---- gambar produk per batch ---- */
const spImgCache = {};   // "id:versi" -> dataURL
const SP_IMG_MAX_SIDE = 960, SP_IMG_MAX_BYTES = 450 * 1024;

/* kompres di browser: sisi terpanjang maks 960px, JPEG, <= ~450 KB */
function spCompressImage(file) {
    return new Promise((resolve, reject) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { reject(new Error("Format gambar harus JPG, PNG, atau WebP")); return; }
        const url = URL.createObjectURL(file), img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            let scale = Math.min(1, SP_IMG_MAX_SIDE / Math.max(img.width, img.height)), q = 0.85, out = "";
            for (let i = 0; i < 6; i++) {
                const c = document.createElement("canvas");
                c.width = Math.max(1, Math.round(img.width * scale)); c.height = Math.max(1, Math.round(img.height * scale));
                const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
                out = c.toDataURL("image/jpeg", q);
                if ((out.length * 3) / 4 <= SP_IMG_MAX_BYTES) break;
                q = Math.max(0.55, q - 0.08); scale *= 0.85;
            }
            resolve(out);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("File gambar tidak bisa dibaca")); };
        img.src = url;
    });
}
async function spImgUrl(b) {
    if (!b || !b.img_v) return null;
    const k = b.id + ":" + b.img_v;
    if (spImgCache[k]) return spImgCache[k];
    const { data, error } = await spRpc("sp_get_batch_image", { p_batch_id: b.id });
    if (error || !data) return null;
    return (spImgCache[k] = `data:${data.mime};base64,${data.data}`);
}
async function spSaveImage(batchId, st) {
    if (!st) return true;
    if (st.dataUrl) {
        const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(st.dataUrl);
        if (!m) { showToast("Gambar tidak valid", "danger"); return false; }
        const { error } = await spRpc("sp_set_batch_image", { p_batch_id: batchId, p_mime: m[1], p_data: m[2] });
        return !error;
    }
    if (st.remove) { const { error } = await spRpc("sp_delete_batch_image", { p_batch_id: batchId }); return !error; }
    return true;
}
function spHydrateImages() {
    document.querySelectorAll("#spBatches [data-img-batch]").forEach(async el => {
        const b = spFindBatch(Number(el.dataset.imgBatch)); const u = await spImgUrl(b);
        if (u) el.innerHTML = `<img src="${u}" alt="${escapeHtml(b.nama)}">`;
    });
}

/* form modal generik: fields = [{id,label,type,value,placeholder}]; type "image" = pilih gambar */
function spForm(title, icon, fields, onSave) {
    const img = {};   // state tiap field gambar: { dataUrl, remove }
    modalBox.innerHTML = `<div class="modal-icon info">${icon}</div><div class="modal-title">${escapeHtml(title)}</div>
        <div class="modal-form">${fields.map(f => f.type === "image" ? `<div class="field"><label>${escapeHtml(f.label)}</label>
            <div class="sp-imgpick"><div class="sp-imgprev" id="spf_prev_${f.id}">${f.value ? `<img src="${f.value}" alt="">` : "<span>🖼</span>"}</div>
            <div class="sp-imgbtns"><label class="btn btn-outline btn-wrap sp-filebtn">📷 Pilih Gambar<input type="file" accept="image/jpeg,image/png,image/webp" id="spf_${f.id}" hidden></label>
            <button type="button" class="btn btn-ghost btn-wrap" id="spf_rm_${f.id}" style="display:${f.value ? "inline-flex" : "none"};">🗑 Hapus Gambar</button></div></div>
            <div class="sp-imghint">JPG / PNG / WebP — otomatis dikecilkan agar ringan.</div></div>`
            : `<div class="field"><label for="spf_${f.id}">${escapeHtml(f.label)}</label>
            <input type="${f.type || "text"}" id="spf_${f.id}" value="${escapeHtml(f.value ?? "")}" placeholder="${escapeHtml(f.placeholder || "")}" ${f.type === "number" ? 'min="0"' : ""}></div>`).join("")}</div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="modalCancelBtn">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="spfSave">Simpan</button></div>`;
    modalOverlay.classList.add("show");
    const first = fields.find(f => f.type !== "image"); if (first) spEl("spf_" + first.id).focus();
    let busy = 0;
    fields.filter(f => f.type === "image").forEach(f => {
        img[f.id] = { dataUrl: null, remove: false };
        const prev = spEl("spf_prev_" + f.id), rm = spEl("spf_rm_" + f.id);
        spEl("spf_" + f.id).addEventListener("change", async e => {
            const file = e.target.files[0]; if (!file) return;
            busy++; spEl("spfSave").disabled = true; prev.innerHTML = "<span>⏳</span>";
            try {
                const u = await spCompressImage(file);
                img[f.id] = { dataUrl: u, remove: false }; prev.innerHTML = `<img src="${u}" alt="">`; rm.style.display = "inline-flex";
            } catch (err) { showToast(err.message, "danger"); prev.innerHTML = f.value ? `<img src="${f.value}" alt="">` : "<span>🖼</span>"; }
            busy--; if (!busy) spEl("spfSave").disabled = false;
        });
        rm.addEventListener("click", () => {
            img[f.id] = { dataUrl: null, remove: !!f.value }; prev.innerHTML = "<span>🖼</span>"; rm.style.display = "none"; spEl("spf_" + f.id).value = "";
        });
    });
    const save = () => {
        if (busy) return;
        const v = {}; fields.forEach(f => v[f.id] = f.type === "image" ? img[f.id] : spEl("spf_" + f.id).value.trim());
        closeModal(); onSave(v);
    };
    spEl("modalCancelBtn").addEventListener("click", closeModal);
    spEl("spfSave").addEventListener("click", save);
    modalBox.querySelectorAll("input:not([type=file])").forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") save(); }));
}

function initSupplyPage() {
    if (!spInited) { spInited = true; spBind(); }
    spPin = sessionStorage.getItem("akun_admin_pin") || spPin;
    if (spPin) spShow();
    else { spEl("spPinGate").style.display = "block"; spEl("spContent").style.display = "none"; }
}

function spBind() {
    const submit = async () => {
        const pin = spEl("spPinInput").value;
        if (!pin) { showToast("Masukkan PIN admin", "danger"); return; }
        const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
        if (error) { showToast("Error database: " + error.message, "danger"); return; }
        if (!data) { showToast("PIN admin salah", "danger"); return; }
        spPin = pin; sessionStorage.setItem("akun_admin_pin", pin); spEl("spPinInput").value = "";
        spShow();
    };
    spEl("spPinSubmit").addEventListener("click", submit);
    spEl("spPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
    document.querySelectorAll("#spTabs .tab").forEach(t => t.addEventListener("click", () => {
        document.querySelectorAll("#spTabs .tab").forEach(x => x.classList.remove("active"));
        t.classList.add("active"); spTab = t.dataset.tab;
        spEl("spStokWrap").style.display = spTab === "stok" ? "block" : "none";
        spEl("spOrderWrap").style.display = spTab === "order" ? "block" : "none";
        spEl("spKatalogWrap").style.display = spTab === "katalog" ? "block" : "none";
        spEl("spPreWrap").style.display = spTab === "pre" ? "block" : "none";
        if (spTab === "katalog") ctInit();
        if (spTab === "pre") poInit();
    }));
    spEl("spNewBatchBtn").addEventListener("click", () => spForm("Batch Stok Baru", "📦", [
        { id: "nama", label: "Nama Batch", placeholder: "mis. Batch 1" },
        { id: "item", label: "Nama Barang", placeholder: "mis. Jagung" },
        { id: "satuan", label: "Satuan", value: "pcs", placeholder: "pcs / kg / karung" },
        { id: "jumlah", label: "Jumlah Akun (bisa ditambah / dihapus nanti)", type: "number", value: "4" },
        { id: "gambar", label: "Gambar Produk (opsional)", type: "image" }
    ], async v => {
        const { data, error } = await spRpc("sp_create_batch", { p_nama: v.nama, p_item: v.item, p_satuan: v.satuan, p_jumlah_akun: parseInt(v.jumlah, 10) || 4 });
        if (!error) {
            const ok = await spSaveImage(data, v.gambar);
            showToast(ok ? "Batch dibuat" : "Batch dibuat, tetapi gambar gagal disimpan", ok ? "success" : "danger"); spLoad();
        }
    }));
    document.querySelectorAll("#spOrderFilter button").forEach(b => b.addEventListener("click", () => {
        document.querySelectorAll("#spOrderFilter button").forEach(x => x.classList.remove("active"));
        b.classList.add("active"); spOrderFilter = b.dataset.f; spLoadOrders();
    }));
}

async function spShow() {
    spEl("spPinGate").style.display = "none"; spEl("spContent").style.display = "block";
    await spLoad();
}
async function spLoad() { await Promise.all([spLoadBatches(), spLoadOrders(), spLoadPendingCount()]); }

async function spLoadBatches() {
    const { data, error } = await spRpc("sp_list_batches", {});
    if (error) return;
    spBatches = data || [];
    spEl("spKpiBatch").textContent = spBatches.length;
    spEl("spNoBatch").style.display = spBatches.length ? "none" : "flex";
    spEl("spBatches").innerHTML = spBatches.map(b => `
        <section class="panel sp-batch">
            <div class="cf-batch-head">
                <div class="sp-headleft"><button type="button" class="sp-thumb" data-img-batch="${b.id}" title="Ubah gambar" onclick="spEditBatch(${b.id})"><span>${b.img_v ? "⏳" : "📷"}</span></button>
                <div><h2>${escapeHtml(b.nama)}${b.item ? ` <span class="sp-item">(${escapeHtml(b.item)})</span>` : ""}</h2>
                    <div class="cf-batch-meta"><span>Satuan: ${escapeHtml(b.satuan)}</span><span>${b.visible ? "👁 Tampil ke pelanggan" : "🙈 Disembunyikan dari pelanggan"}</span>${b.p100 === undefined ? "" : `<span>💰 ${[[100, b.p100], [500, b.p500], [1000, b.p1000]].filter(x => x[1] > 0).map(([q, p]) => `${q} = Rp ${spNum(p)}`).join(" · ") || "harga belum diatur"}</span>`}</div></div></div>
                <div class="cf-batch-actions">
                    <button class="btn btn-outline" onclick="spToggleVisible(${b.id})">${b.visible ? "🙈 Sembunyikan" : "👁 Tampilkan"}</button>
                    <button class="btn btn-outline" onclick="spEditBatch(${b.id})">✏️ Ubah</button>
                    <button class="btn btn-danger btn-icon" title="Hapus batch" onclick="spDeleteBatch(${b.id})">🗑</button>
                </div>
            </div>
            <div class="table-wrap aksi-pinned">
                <table style="min-width:460px;">
                    <thead><tr><th>No</th><th>Akun</th><th class="num">Stok (${escapeHtml(b.satuan)})</th><th>Diubah</th><th class="col-aksi">Aksi</th></tr></thead>
                    <tbody>${b.accounts.map((a, i) => `
                        <tr><td class="col-no">${i + 1}</td><td><b>${escapeHtml(a.nama)}</b></td>
                        <td class="num"><input type="number" min="0" class="sp-input" id="spS${a.id}" value="${a.stok}" onkeydown="if(event.key==='Enter')spSaveStok(${a.id})"></td>
                        <td>${spWaktu(a.updated_at)}</td>
                        <td class="col-aksi"><div class="actions-cell">
                            <button class="btn btn-success btn-icon" title="Simpan stok" onclick="spSaveStok(${a.id})">💾</button>
                            <button class="btn btn-outline btn-icon" title="Ganti nama akun" onclick="spRenameAcc(${a.id})">✏️</button>
                            <button class="btn btn-danger btn-icon" title="Hapus akun" onclick="spDeleteAcc(${a.id})">🗑</button>
                        </div></td></tr>`).join("")}</tbody>
                    <tfoot><tr><td></td><td><b>TOTAL</b></td><td class="num sp-total">${spNum(b.total)}</td><td></td><td class="col-aksi"></td></tr></tfoot>
                </table>
            </div>
            <div style="margin-top:12px;"><button class="btn btn-outline" onclick="spAddAcc(${b.id})">➕ Tambah Akun</button></div>
        </section>`).join("");
    spHydrateImages();
}

const spFindBatch = id => spBatches.find(b => b.id === id);
const spFindAcc = id => { for (const b of spBatches) { const a = b.accounts.find(x => x.id === id); if (a) return a; } return null; };

async function spSaveStok(id) {
    const v = parseInt(spEl("spS" + id).value, 10);
    if (isNaN(v) || v < 0) { showToast("Stok harus angka 0 atau lebih", "danger"); return; }
    const { error } = await spRpc("sp_update_account", { p_id: id, p_nama: null, p_stok: v });
    if (!error) { showToast("Stok disimpan", "success"); spLoadBatches(); }
}
function spRenameAcc(id) { const a = spFindAcc(id); if (a) spForm("Ganti Nama Akun", "✏️", [{ id: "nama", label: "Nama Akun", value: a.nama }], async v => {
    const { error } = await spRpc("sp_update_account", { p_id: id, p_nama: v.nama, p_stok: null }); if (!error) spLoadBatches(); }); }
function spAddAcc(batchId) { spForm("Tambah Akun", "➕", [{ id: "nama", label: "Nama Akun", placeholder: "mis. Akun 5" }], async v => {
    const { error } = await spRpc("sp_add_account", { p_batch_id: batchId, p_nama: v.nama }); if (!error) spLoadBatches(); }); }
function spDeleteAcc(id) { const a = spFindAcc(id); if (!a) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: `Hapus ${a.nama}?`, body: "Stok akun ini tidak akan dihitung lagi di total.", confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await spRpc("sp_delete_account", { p_id: id }); if (!error) spLoadBatches(); } }); }
async function spToggleVisible(id) { const b = spFindBatch(id); if (!b) return;
    const { error } = await spRpc("sp_update_batch", { p_id: id, p_nama: null, p_item: null, p_satuan: null, p_visible: !b.visible }); if (!error) spLoadBatches(); }
async function spEditBatch(id) {
    const b = spFindBatch(id); if (!b) return;
    const cur = await spImgUrl(b);
    spForm("Ubah Batch", "📦", [
        { id: "nama", label: "Nama Batch", value: b.nama }, { id: "item", label: "Nama Barang", value: b.item }, { id: "satuan", label: "Satuan", value: b.satuan },
        { id: "p100", label: "Harga 100 pcs (Rp, 0 = tidak dijual)", type: "number", value: b.p100 || "" },
        { id: "p500", label: "Harga 500 pcs (Rp)", type: "number", value: b.p500 || "" },
        { id: "p1000", label: "Harga 1000 pcs (Rp)", type: "number", value: b.p1000 || "" },
        { id: "gambar", label: "Gambar Produk", type: "image", value: cur || "" }],
        async v => {
            const { error } = await spRpc("sp_update_batch", { p_id: id, p_nama: v.nama, p_item: v.item, p_satuan: v.satuan, p_visible: null });
            if (error) return;
            if (b.p100 !== undefined) {   // harga bertingkat (butuh koin-usdt-5-supply.sql)
                const pr = await spRpc("sp_set_batch_price", { p_id: id, p_100: parseInt(v.p100, 10) || 0, p_500: parseInt(v.p500, 10) || 0, p_1000: parseInt(v.p1000, 10) || 0 });
                if (pr.error) return;
            }
            const ok = await spSaveImage(id, v.gambar);
            if (!ok) showToast("Gambar gagal disimpan", "danger");
            spLoadBatches();
        });
}
function spDeleteBatch(id) { const b = spFindBatch(id); if (!b) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: `Hapus ${b.nama}?`, body: "Semua akun, order, dan gambar untuk batch ini ikut terhapus permanen dari server.", confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await spRpc("sp_delete_batch", { p_id: id }); if (!error) spLoad(); } }); }

/* ---- order masuk dari pelanggan ---- */
async function spLoadPendingCount() {
    const { data } = await spRpc("sp_list_orders", { p_status: "pending" });
    const n = (data || []).length;
    spEl("spKpiPending").textContent = n;
    spEl("spOrderBadge").textContent = n; spEl("spOrderBadge").style.display = n ? "inline-block" : "none";
}
async function spLoadOrders() {
    const { data, error } = await spRpc("sp_list_orders", { p_status: spOrderFilter });
    if (error) return;
    spOrders = data || [];
    spEl("spOrderEmpty").style.display = spOrders.length ? "none" : "flex";
    spEl("spOrderBody").innerHTML = spOrders.map((o, i) => `
        <tr><td class="col-no">${i + 1}</td><td>${spWaktu(o.created_at)}</td><td><b>${escapeHtml(o.username)}</b>${spContactHtml(o)}</td>
        <td>${escapeHtml(o.item || o.batch)}</td><td class="num"><b>${spNum(o.qty)}</b> ${escapeHtml(o.satuan)}${o.harga_total ? `<div class="cell-sub">🪙 ${spNum(o.harga_total)}</div>` : ""}</td>
        <td>${o.status === "sent" ? `<span class="badge badge-done">✅ Terkirim</span> <span class="cell-sub">${spWaktu(o.sent_at)}</span>` : `<span class="badge badge-proses">⏳ Menunggu</span>`}</td>
        <td class="col-aksi"><div class="actions-cell">
            ${o.status === "sent"
                ? `<button class="btn btn-ghost btn-icon" title="Batalkan centang" onclick="spSetSent(${o.id}, false)">↩️</button>`
                : `<button class="btn btn-success btn-icon" title="Tandai sudah dikirim" onclick="spSetSent(${o.id}, true)">✅</button>`}
            <button class="btn btn-danger btn-icon" title="Hapus order" onclick="spDeleteOrder(${o.id})">🗑</button>
        </div></td></tr>`).join("");
    if (spOrderFilter === "all") spEl("spKpiSent").textContent = spOrders.filter(o => o.status === "sent").length;
    else if (spOrderFilter === "sent") spEl("spKpiSent").textContent = spOrders.length;
    else { const r = await spRpc("sp_list_orders", { p_status: "sent" }); spEl("spKpiSent").textContent = (r.data || []).length; }
}
/** kontak pelanggan (WhatsApp / Messenger) + catatan untuk admin; nomor & link dibuat bisa diklik */
function spContactLink(k) {
    const t = String(k || "").trim(); if (!t) return "";
    if (/^(https?:\/\/)?(www\.|m\.)?(m\.me|facebook\.com|fb\.com|fb\.me|messenger\.com|wa\.me|t\.me)\//i.test(t)) return /^https?:/i.test(t) ? t : "https://" + t;
    const d = t.replace(/[\s()\-.]/g, "");
    if (/^\+?[0-9]{8,15}$/.test(d)) return "https://wa.me/" + d.replace(/^\+/, "").replace(/^0/, "62");
    return "";
}
function spContactHtml(o) {
    if (!o.kontak && !o.catatan) return "";
    const link = spContactLink(o.kontak);
    return `<div class="cell-sub sp-contact">${o.kontak ? `📱 ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(o.kontak)}</a>` : escapeHtml(o.kontak)}` : ""}</div>`
        + (o.catatan ? `<div class="cell-sub sp-note">📝 ${escapeHtml(o.catatan)}</div>` : "");
}
async function spSetSent(id, sent) {
    const { error } = await spRpc("sp_set_order_status", { p_id: id, p_sent: sent });
    if (!error) { showToast(sent ? "Order ditandai terkirim" : "Centang dibatalkan", "success"); spLoadOrders(); spLoadPendingCount(); }
}
function spDeleteOrder(id) {
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus order?", body: "Order ini akan dihapus permanen.", confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await spRpc("sp_delete_order", { p_id: id }); if (!error) { spLoadOrders(); spLoadPendingCount(); } } });
}
