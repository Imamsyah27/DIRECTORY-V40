/**
 * Order KATALOG (admin): Koin Hayday & Voucher dari katalog pelanggan (dibayar koin akun, menunggu admin)
 * + riwayat penjualan Farm (otomatis, token langsung terkirim). Butuh sql/koin-usdt-6-katalog.sql & 7-farm-panel.sql.
 */
const kcPin = () => sessionStorage.getItem("akun_admin_pin");
const kcNum = n => Number(n || 0).toLocaleString("id-ID");
const kcWaktu = iso => iso ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
const KC = { koin: { all: [], filter: "pending", bound: false, title: "🌾 Order Koin Hayday" }, voucher: { all: [], filter: "pending", bound: false, title: "🎟 Order Voucher" } };

async function kcRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: kcPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (m.includes("PIN admin salah")) { sessionStorage.removeItem("akun_admin_pin"); showToast("PIN admin tidak valid, masukkan ulang", "danger"); ["koin", "voucher", "farm"].forEach(k => ordRenderGate(k)); }
        else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/koin-usdt-6-katalog.sql dan koin-usdt-7-farm-panel.sql di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}
/** Kotak PIN di dalam panel (dipakai bila PIN admin belum dimasukkan di sesi ini). */
function ordRenderGate(kind, onOk) {
    const pane = document.getElementById("ordPane-" + kind);
    pane.innerHTML = `<section class="panel"><div class="panel-title">🔒 Masukkan PIN Admin</div>
        <div class="field-grid" style="max-width:360px;"><div class="field"><input type="password" id="ordPin-${kind}" placeholder="PIN admin" autocomplete="off"></div></div>
        <div style="margin-top:12px;"><button class="btn btn-primary" id="ordPinBtn-${kind}">Buka</button></div></section>`;
    const go = async () => {
        const pin = document.getElementById("ordPin-" + kind).value; if (!pin) return;
        const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
        if (error || data === false) { showToast("PIN admin tidak valid", "danger"); return; }
        sessionStorage.setItem("akun_admin_pin", pin); (onOk || (() => ordShow(kind)))();
    };
    document.getElementById("ordPinBtn-" + kind).addEventListener("click", go);
    document.getElementById("ordPin-" + kind).addEventListener("keydown", e => { if (e.key === "Enter") go(); });
}

/* ---------------- Koin Hayday / Voucher ---------------- */
async function kcInit(kind) {
    if (!kcPin()) { ordRenderGate(kind); return; }
    const S = KC[kind], pane = document.getElementById("ordPane-" + kind);
    if (!S.bound) {
        S.bound = true;
        pane.innerHTML = `<section class="panel table-section"><div class="panel-title">${S.title} <span class="panel-hint">dibayar koin akun · tandai Selesai setelah dikirim</span></div>
            <div class="rn-filter" id="kcFilter-${kind}">
                <button type="button" data-f="pending" class="on">⏳ Menunggu <i>0</i></button><button type="button" data-f="done">✅ Selesai <i>0</i></button>
                <button type="button" data-f="rejected">✖ Ditolak <i>0</i></button><button type="button" data-f="all">Semua <i>0</i></button></div>
            <div class="table-wrap"><table style="min-width:820px;"><thead><tr><th>Waktu</th><th>Pelanggan</th><th>Item</th><th>Jumlah</th><th>Total Koin</th><th>Catatan pelanggan</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody id="kcBody-${kind}"></tbody></table></div><div class="rn-empty" id="kcEmpty-${kind}" style="display:none;">Belum ada pesanan.</div></section>`;
        document.getElementById("kcFilter-" + kind).addEventListener("click", e => { const b = e.target.closest("button[data-f]"); if (b) { S.filter = b.dataset.f; kcRender(kind); } });
        document.getElementById("kcBody-" + kind).addEventListener("click", e => kcOnClick(kind, e));
    }
    await kcLoad(kind);
}
async function kcLoad(kind) {
    const { data, error } = await kcRpc("co_list", { p_kind: kind });
    if (error) return;
    KC[kind].all = data || []; kcRender(kind);
}
function kcBadge(kind) {
    const n = KC[kind].all.filter(r => r.status === "pending").length, b = document.getElementById("coBadge-" + kind);
    if (b) { b.textContent = n; b.style.display = n ? "inline-block" : "none"; }
}
function kcRender(kind) {
    const S = KC[kind]; kcBadge(kind);
    const cnt = k => k === "all" ? S.all.length : S.all.filter(r => r.status === k).length;
    document.getElementById("kcFilter-" + kind).querySelectorAll("button").forEach(b => { b.classList.toggle("on", b.dataset.f === S.filter); b.querySelector("i").textContent = cnt(b.dataset.f); });
    const rows = S.all.filter(r => S.filter === "all" || r.status === S.filter);
    document.getElementById("kcEmpty-" + kind).style.display = rows.length ? "none" : "block";
    const pill = { pending: ["⏳ Menunggu", "bp-pill mn"], done: ["✅ Selesai", "bp-pill rq"], rejected: ["✖ Ditolak", "bp-pill mn"] };
    document.getElementById("kcBody-" + kind).innerHTML = rows.map(r => {
        const st = pill[r.status] || [r.status, "bp-pill mn"], wa = String(r.whatsapp || "").replace(/[^0-9]/g, "");
        const acts = r.status === "pending" ? `<button class="btn btn-success mini" data-act="done" data-id="${r.id}">✅ Selesai</button> <button class="btn btn-ghost mini" data-act="no" data-id="${r.id}">Tolak</button>` : `<button class="btn btn-ghost mini" data-act="del" data-id="${r.id}">Hapus</button>`;
        return `<tr><td>${kcWaktu(r.created_at)}<br><small>#${r.id}</small></td>
            <td><b>${escapeHtml(r.username)}</b>${wa ? `<br><a href="https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.username}, pesanan ${r.item_nama} `)}" target="_blank" rel="noopener"><small>💬 WhatsApp</small></a>` : ""}</td>
            <td><b>${escapeHtml(r.item_nama)}</b><div class="cell-sub">${escapeHtml(r.kategori)}</div></td><td>${kcNum(r.qty)}</td>
            <td><b>🪙 ${kcNum(r.total)}</b></td><td>${r.catatan ? `<div class="bo-note-inline">📝 ${escapeHtml(r.catatan)}</div>` : "-"}</td>
            <td><span class="${st[1]}">${st[0]}</span>${r.catatan_admin ? `<br><small>${escapeHtml(r.catatan_admin)}</small>` : ""}</td><td style="white-space:nowrap;">${acts}</td></tr>`;
    }).join("");
}
function kcOnClick(kind, e) {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = Number(b.dataset.id), act = b.dataset.act, r = KC[kind].all.find(x => x.id === id); if (!r) return;
    if (act === "done") openConfirmModal({ icon: "✅", iconClass: "success", title: "Tandai selesai?", body: `<b>${escapeHtml(r.item_nama)}</b> × ${kcNum(r.qty)} untuk <b>${escapeHtml(r.username)}</b> sudah dikirim?`, confirmText: "Ya, Selesai", confirmClass: "btn-success",
        onConfirm: async () => { const { error } = await kcRpc("co_done", { p_id: id }); if (!error) { showToast("Pesanan selesai", "success"); kcLoad(kind); } } });
    else if (act === "no") openConfirmModal({ icon: "✖", iconClass: "danger", title: "Tolak pesanan?", body: `Koin <b>🪙 ${kcNum(r.total)}</b> dikembalikan ke <b>${escapeHtml(r.username)}</b>.`, confirmText: "Ya, Tolak", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await kcRpc("co_reject", { p_id: id }); if (!error) { showToast("Ditolak, koin dikembalikan", "danger"); kcLoad(kind); } } });
    else if (act === "del") openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus dari daftar?", body: "Pesanan yang sudah diproses hanya dihapus dari daftar.", confirmText: "Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await kcRpc("co_delete", { p_id: id }); if (!error) kcLoad(kind); } });
}

/* ---------------- Farm (riwayat penjualan otomatis) ---------------- */
async function fmInit() {
    const pane = document.getElementById("ordPane-farm");
    if (!kcPin()) { ordRenderGate("farm"); return; }
    const { data, error } = await kcRpc("fs_sales_list", {});
    if (error) return;
    const rows = data || [];
    pane.innerHTML = `<section class="panel table-section"><div class="panel-title">🌱 Penjualan Farm <span class="panel-hint">otomatis — token langsung terkirim saat koin cukup. Atur etalase di menu Farm Sell.</span></div>
        <div class="table-wrap"><table style="min-width:640px;"><thead><tr><th>Waktu</th><th>Pelanggan</th><th>Farm</th><th>Jumlah</th><th>Harga / token</th><th>Total Koin</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${kcWaktu(r.created_at)}<br><small>#${r.id}</small></td><td><b>${escapeHtml(r.username)}</b></td><td>${escapeHtml(r.batch_nama)}</td><td>${kcNum(r.qty)} token</td><td>🪙 ${kcNum(r.harga_satuan)}</td><td><b>🪙 ${kcNum(r.total)}</b></td></tr>`).join("")}
        </tbody></table></div>${rows.length ? "" : '<div class="rn-empty">Belum ada penjualan farm.</div>'}</section>`;
}
async function kcRefreshBadges() {
    if (!kcPin() || document.hidden) return;
    for (const kind of ["koin", "voucher"]) { const { data, error } = await supabaseClient.rpc("co_list", { p_pin: kcPin(), p_kind: kind }); if (!error && data) { KC[kind].all = data; kcBadge(kind); } }
}
document.addEventListener("DOMContentLoaded", () => { setTimeout(kcRefreshBadges, 2200); setInterval(kcRefreshBadges, 60000); });
