/**
 * Portal pelanggan — tambahan: tab, pengumuman, Supply & Stock (lihat + pesan),
 * arsip pribadi, dan grafik. Butuh sql/supply.sql di Supabase.
 */
let myArchives = [], mySupply = [], mySupplyOrders = [], _cuCharts = {};
const LOCALE = { id: "id-ID", en: "en-GB", vi: "vi-VN", ar: "ar", tr: "tr-TR" };
const loc = () => LOCALE[currentLang] || "id-ID";
const fmtDate = (iso, opt) => iso ? new Date(iso).toLocaleDateString(loc(), opt || { day: "2-digit", month: "short", year: "numeric" }) : "-";
const fmtNum = n => Number(n || 0).toLocaleString(loc());
const $ = id => document.getElementById(id);

async function cuRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_session_token: getSession(), ...(params || {}) });
    if (res.error) {
        console.error(res.error);
        const m = res.error.message || "";
        if (m.toLowerCase().includes("sesi") && !isAdminView()) { clearSession(); window.location.href = "index.html"; }
        else if (/does not exist|schema cache/i.test(m)) console.warn("Jalankan sql/supply.sql di Supabase");
    }
    return res;
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#pTabs button").forEach(b => b.addEventListener("click", () => {
        document.querySelectorAll("#pTabs button").forEach(x => x.classList.toggle("active", x === b));
        document.querySelectorAll(".p-tab").forEach(p => p.style.display = p.id === "ptab-" + b.dataset.ptab ? "block" : "none");
        if (b.dataset.ptab === "arsip") markArchiveSeen();
        if (b.dataset.ptab === "home" || b.dataset.ptab === "grafik") setTimeout(() => { renderCharts(); Object.values(_cuCharts).forEach(c => c.resize()); }, 50);
    }));
    document.addEventListener("themechange", () => renderCharts());
    document.addEventListener("langchange", () => { renderArchiveNotice(); renderAnnouncements(); renderSupply(); renderSupplyOrders(); renderArchive(); renderCharts(); });
    loadAnnouncements(); loadSupply();
    setInterval(pollArchiveNotice, 60000);
});

/* ---------------- Notifikasi arsip baru (badge di tab Arsip + banner) ---------------- */
let _arcNotice = { count: 0, latest: null, items: [] }, _arcBannerHidden = false;
const arsipTabActive = () => { const b = document.querySelector('#pTabs button[data-ptab="arsip"]'); return !!(b && b.classList.contains("active")); };
async function loadArchiveNotice() {
    const { data, error } = await cuRpc("cu_archive_unseen");
    if (error || !data) return;
    _arcNotice = data; _arcBannerHidden = false;
    if (data.count > 0 && arsipTabActive()) { markArchiveSeen(); return; }   // arsip sedang dibuka -> langsung dianggap dilihat
    renderArchiveNotice();
}
function renderArchiveNotice() {
    const n = _arcNotice.count || 0, badge = $("arsipTabBadge"), box = $("arcNotice");
    if (badge) { badge.textContent = n; badge.style.display = n ? "inline-block" : "none"; }
    if (!box) return;
    if (!n || _arcBannerHidden) { box.innerHTML = ""; return; }
    const items = _arcNotice.items || [], shown = items.slice(0, 5).map(x => `<b>${escapeHtml(x.tagar)}</b>`).join(", ");
    const more = n > 5 ? ` ${escapeHtml(t("arc_notice_more", { n: n - 5 }))}` : "";
    box.innerHTML = `<div class="arc-notice"><div class="arc-notice-main"><div class="arc-notice-title">📥 ${escapeHtml(t("arc_notice", { n }))}</div>
        <div class="arc-notice-list">${shown}${more}</div><div class="arc-notice-sub">${escapeHtml(t("arc_notice_sub"))}</div></div>
        <div class="arc-notice-actions"><button type="button" class="btn btn-primary" id="arcOpen">${escapeHtml(t("arc_notice_btn"))}</button>
        <button type="button" class="ann-x" id="arcHide" aria-label="Tutup">✕</button></div></div>`;
    $("arcOpen").addEventListener("click", () => { const b = document.querySelector('#pTabs button[data-ptab="arsip"]'); if (b) b.click(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    $("arcHide").addEventListener("click", () => { _arcBannerHidden = true; renderArchiveNotice(); });
}
async function markArchiveSeen() {
    const upto = _arcNotice.latest, had = _arcNotice.count > 0;
    _arcNotice = { count: 0, latest: null, items: [] }; renderArchiveNotice();
    if (had && !isAdminView()) await cuRpc("cu_archive_mark_seen", { p_upto: upto });
}
/** Cek berkala: kalau ada arsip baru, muat ulang daftar supaya langsung tampil. */
async function pollArchiveNotice() {
    if (document.hidden) return;
    const { data } = await cuRpc("cu_archive_unseen");
    if (data && data.count > 0 && data.count !== _arcNotice.count) await loadMyOrders();
}

/* ---------------- Pengumuman ---------------- */
let _anns = [];
async function loadAnnouncements() { const { data } = await cuRpc("cu_announcements"); _anns = data || []; renderAnnouncements(); }
function renderAnnouncements() {
    const hidden = JSON.parse(localStorage.getItem("ann_hidden") || "[]");
    const list = _anns.filter(a => !hidden.includes(a.id));
    $("annBox").innerHTML = list.map(a => `
        <div class="ann-card ${a.pinned ? "pinned" : ""}">
            <div class="ann-head"><b>${a.pinned ? "📌 " : "📣 "}${escapeHtml(a.judul)}</b>
                ${a.pinned ? `<span class="ann-tag">${escapeHtml(t("ann_important"))}</span>` : ""}
                <button type="button" class="ann-x" onclick="hideAnn(${a.id})" aria-label="Tutup">✕</button></div>
            ${a.isi ? `<div class="ann-body">${linkify(a.isi).replace(/\n/g, "<br>")}</div>` : ""}
            <div class="ann-date">${fmtDate(a.created_at)}</div>
        </div>`).join("");
}
function hideAnn(id) {
    const h = JSON.parse(localStorage.getItem("ann_hidden") || "[]"); h.push(id);
    localStorage.setItem("ann_hidden", JSON.stringify(h)); renderAnnouncements();
}

/* ---------------- Supply & Stock ---------------- */
Object.assign(TRANSLATIONS.id, { supply_total: "Total", supply_tier: "{q} {u} = {p}", supply_price_none: "Harga belum diatur", supply_wa: "Halo Admin, saya memesan supply {q} {u} ({i}) sebesar {total}." });
Object.assign(TRANSLATIONS.en, { supply_total: "Total", supply_tier: "{q} {u} = {p}", supply_price_none: "Price not set yet", supply_wa: "Hello Admin, I'm ordering {q} {u} of supply ({i}), total {total}." });
Object.assign(TRANSLATIONS.id, { supply_chat: "Chat Admin Supply", supply_chat_text: "Halo admin, saya {u}. Saya ingin order supply & stock." });
Object.assign(TRANSLATIONS.en, { supply_chat: "Chat Supply Admin", supply_chat_text: "Hello admin, I'm {u}. I'd like to order supply & stock." });
function renderSupplyChat() {
    const el = $("supplyChat"); if (!el) return;
    el.innerHTML = `<a class="btn btn-wa" href="${waSupply(t("supply_chat_text", { u: contactUser() }))}" target="_blank" rel="noopener" style="margin-bottom:8px;">💬 ${escapeHtml(t("supply_chat"))}</a>`;
}
document.addEventListener("DOMContentLoaded", renderSupplyChat); document.addEventListener("langchange", renderSupplyChat);
/** Harga bertingkat: tier terbesar <= jumlah, proporsional (sama dengan fungsi supply_price di SQL). null = SQL belum dipasang. */
function supplyPrice(s, q) {
    if (s.p100 === undefined) return null;
    for (const [tq, tp] of [[1000, s.p1000], [500, s.p500], [100, s.p100]]) if (q >= tq && tp > 0) return Math.ceil(q * tp / tq);
    const small = [[100, s.p100], [500, s.p500], [1000, s.p1000]].find(x => x[1] > 0);
    return small ? Math.ceil(q * small[1] / small[0]) : 0;
}
function supplyTiersHtml(s) {
    if (s.p100 === undefined) return "";
    const tiers = [[100, s.p100, s.n100], [500, s.p500, s.n500], [1000, s.p1000, s.n1000]].filter(x => x[1] > 0);
    return tiers.length ? `<div class="supply-tiers">${tiers.map(([q, p, n]) => `<span>${n > p ? `<s class="cat-old">${escapeHtml(fmtRp(n))}</s> ` : ""}${escapeHtml(t("supply_tier", { q: fmtNum(q), u: s.satuan, p: fmtRp(p) }))}</span>`).join("")}</div>`
        : `<div class="supply-tiers none">${escapeHtml(t("supply_price_none"))}</div>`;
}
/* pfx "cp" = kartu Product di menu Catalog (id input cpq{id}, ringkasan cpt{id}); kosong = tab Supply & Stock (sq{id}, sqt{id}) */
const _sqId = (pfx, id) => pfx === "cp" ? "cpq" + id : "sq" + id, _sqtId = (pfx, id) => pfx === "cp" ? "cpt" + id : "sqt" + id;
function onSupplyQty(id, pfx) {
    const s = mySupply.find(x => x.id === id), el = $(_sqtId(pfx, id)); if (!s || !el) return;
    const q = parseInt($(_sqId(pfx, id)).value, 10), tot = q > 0 ? supplyPrice(s, q) : null;
    el.textContent = tot ? `${t("supply_total")}: ${fmtRp(tot)}${cuCoinUsd(tot) ? " · " + cuCoinUsd(tot) : ""}` : "";
}
async function loadSupply() {
    const [a, b] = await Promise.all([cuRpc("cu_supply"), cuRpc("cu_my_supply_orders")]);
    mySupply = a.data || []; mySupplyOrders = b.data || [];
    renderSupply(); renderSupplyOrders(); renderKpi();
    if (typeof renderCatalog === "function") renderCatalog();      // kotak Product di menu Catalog
}
const _supImg = {};   // "id:versi" -> dataURL
const supImgKey = s => s.id + ":" + s.img_v;
function supplyCardHtml(s, pfx) {
    const out = !(s.total > 0), src = s.img_v && _supImg[supImgKey(s)];
    return `
        <article class="shop-card ${out ? "is-out" : ""}">
            <div class="shop-media" ${s.img_v ? `onclick="openSupplyImg(${s.id})"` : ""} data-sid="${s.id}">
                ${src ? `<img src="${src}" alt="${escapeHtml(s.item || s.nama)}">` : `<div class="shop-ph">${s.img_v ? "⏳" : "📦"}</div>`}
                <span class="shop-batch">${escapeHtml(s.nama)}</span>
                ${out ? `<span class="shop-out">${escapeHtml(t("supply_out"))}</span>` : ""}
            </div>
            <div class="shop-body">
                <div class="supply-name">${escapeHtml(s.item || s.nama)}</div>
                <div class="supply-meta">${escapeHtml(t("supply_updated"))}: ${fmtDate(s.updated_at)}</div>
                <div class="shop-stock"><span>${escapeHtml(t("supply_stock"))}</span><b>${out ? "0" : fmtNum(s.total)}</b>${out ? "" : `<small>${escapeHtml(s.satuan)}</small>`}</div>
                ${supplyTiersHtml(s)}
                <div class="supply-order">
                    <input type="number" min="1" max="${s.total}" id="${_sqId(pfx, s.id)}" placeholder="${escapeHtml(t("supply_qty_ph"))}" ${out ? "disabled" : ""} oninput="onSupplyQty(${s.id}, '${pfx || ""}')">
                    <button type="button" class="btn btn-primary" onclick="askOrder(${s.id}, '${pfx || ""}')" ${out ? "disabled" : ""}>${escapeHtml(t("supply_order_btn"))}</button>
                </div>
                <div class="supply-sum" id="${_sqtId(pfx, s.id)}"></div>
            </div>
        </article>`;
}
function renderSupply() {
    $("supplyEmpty").style.display = mySupply.length ? "none" : "block";
    $("supplyList").innerHTML = mySupply.map(s => supplyCardHtml(s, "")).join("");
    hydrateSupplyImages();
}
/* gambar dimuat per batch lalu di-cache; hanya diunduh ulang jika admin mengganti gambarnya */
function hydrateSupplyImages() {
    mySupply.filter(s => s.img_v && !_supImg[supImgKey(s)]).forEach(async s => {
        const { data } = await cuRpc("cu_supply_image", { p_batch_id: s.id });
        if (!data) return;
        _supImg[supImgKey(s)] = `data:${data.mime};base64,${data.data}`;
        document.querySelectorAll(`.shop-media[data-sid="${s.id}"]`).forEach(el => { const ph = el.querySelector(".shop-ph"); if (ph) ph.outerHTML = `<img src="${_supImg[supImgKey(s)]}" alt="${escapeHtml(s.item || s.nama)}">`; });
    });
}
function openSupplyImg(id) {
    const s = mySupply.find(x => x.id === id), src = s && _supImg[supImgKey(s)]; if (!src) return;
    $("modalBox").innerHTML = `<img src="${src}" alt="" class="shop-zoom"><div class="modal-title" style="margin-top:12px;">${escapeHtml(s.item || s.nama)}</div>
        <div class="modal-sub">${escapeHtml(s.nama)}</div>
        <button type="button" class="btn btn-ghost btn-block" id="zoomClose">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show"); $("zoomClose").addEventListener("click", closeModal);
}
function askOrder(batchId, pfx) {
    const s = mySupply.find(x => x.id === batchId); if (!s) return;
    const q = parseInt($(_sqId(pfx, batchId)).value, 10);
    if (!q || q < 1 || q > s.total) { showToast(t("supply_qty_err"), "danger"); return; }
    const total = supplyPrice(s, q);
    if (total === 0) { showToast(t("supply_price_unset"), "danger"); return; }
    $("modalBox").innerHTML = `<div class="modal-title">📦 ${escapeHtml(t("supply_order_btn"))}</div>
        <div class="modal-sub">${escapeHtml(t("supply_confirm", { q: fmtNum(q), u: s.satuan, i: s.item || s.nama }))}</div>
        ${total ? `<div class="coin-lines"><div class="coin-line"><span>${escapeHtml(t("supply_total"))}</span><b>🪙 ${fmtNum(total)}${cuCoinUsd(total) ? `<small class="coin-usd">${escapeHtml(cuCoinUsd(total))}</small>` : ""}</b></div></div>` : ""}
        <div class="sc-block"><label class="sc-label" for="ordContact">📱 ${escapeHtml(t("sc_contact"))}</label>
            <input type="text" id="ordContact" class="sc-input" maxlength="200" autocomplete="off" placeholder="${escapeHtml(t("sc_contact_ph"))}" value="${escapeHtml(localStorage.getItem("sc_contact") || "")}">
            <div class="sc-hint">${escapeHtml(t("sc_contact_hint"))}</div></div>
        <div class="sc-block"><label class="sc-label" for="ordNote">📝 ${escapeHtml(t("sc_note"))}</label>
            <textarea id="ordNote" class="sc-input" rows="3" maxlength="500" placeholder="${escapeHtml(t("sc_note_ph"))}"></textarea></div>
        <button type="button" class="btn btn-primary btn-block" id="ordYes">${escapeHtml(t("supply_order_btn"))}</button>
        <button type="button" class="btn btn-ghost btn-block" id="ordNo" style="margin-top:8px;">${escapeHtml(t("modal_close"))}</button>`;
    $("modalOverlay").classList.add("show");
    $("ordNo").addEventListener("click", closeModal);
    $("ordYes").addEventListener("click", async () => {
        $("ordYes").disabled = true;
        if (total) {   // bayar dengan koin (saldo kurang = tidak bisa memesan)
            const paid = await payStep({ pkg: "SUPPLY", total, waText: tot => t("supply_wa", { q: fmtNum(q), u: s.satuan, i: s.item || s.nama, total: tot }) });
            if (!paid) { $("ordYes").disabled = false; return; }
        }
        const kontak = $("ordContact").value.trim(), catatan = $("ordNote").value.trim();
        try { localStorage.setItem("sc_contact", kontak); } catch (_) {}
        let { error } = await cuRpc("cu_place_supply_order_k", { p_batch_id: batchId, p_qty: q, p_catatan: catatan || null, p_kontak: kontak || null });
        if (error && /does not exist|schema cache|Could not find the function/i.test(error.message || "")) ({ error } = await cuRpc("cu_place_supply_order", { p_batch_id: batchId, p_qty: q }));   // SQL 17 belum dijalankan
        closeModal();
        if (error) { showToast(translateServerError(error.message) || error.message || "Error", "danger"); return; }
        showToast(t("supply_ordered_ok"), "success"); loadSupply(); if (typeof loadCoin === "function") loadCoin();
    });
}
function renderSupplyOrders() {
    $("supplyOrdersEmpty").style.display = mySupplyOrders.length ? "none" : "block";
    $("supplyOrdersTable").style.display = mySupplyOrders.length ? "table" : "none";
    $("supplyOrdersBody").innerHTML = mySupplyOrders.map(o => `
        <tr><td>${fmtDate(o.created_at)}</td><td><b>${escapeHtml(o.item || o.nama)}</b></td><td>${fmtNum(o.qty)} ${escapeHtml(o.satuan)}${o.harga_total ? `<div class="cell-sub">🪙 ${fmtNum(o.harga_total)}</div>` : ""}</td>
        <td><span class="badge ${o.status === "sent" ? "badge-done" : "badge-proses"}">${o.status === "sent" ? "✅ " + escapeHtml(t("supply_status_sent")) : "⏳ " + escapeHtml(t("supply_status_pending"))}</span></td>
        <td>${o.status === "pending" ? `<button type="button" class="btn btn-ghost mini" onclick="cancelOrder(${o.id})">${escapeHtml(t("supply_cancel"))}</button>` : ""}</td></tr>`).join("");
}
async function cancelOrder(id) { const { error } = await cuRpc("cu_cancel_supply_order", { p_id: id }); if (!error) loadSupply(); }

/* ---------------- Arsip pribadi + grafik (dipanggil dashboard.js) ---------------- */
async function onOrdersLoaded() {
    const { data } = await cuRpc("cu_my_archives");
    myArchives = data || [];
    renderArchive(); renderKpi(); renderCharts();
    loadArchiveNotice();
}
function renderArchive() {
    $("arsipEmpty").style.display = myArchives.length ? "none" : "block";
    $("arsipBody").innerHTML = myArchives.map((a, i) => `
        <tr><td>${i + 1}</td><td><b>${escapeHtml(a.tagar)}</b></td><td>${escapeHtml(a.dashboard)}</td>
        <td>H${a.paket_terkirim} / H${a.paket_total}</td><td>${fmtDate(a.archived_at)}</td><td>${typeof renewalActionHtml === "function" ? renewalActionHtml("archive", a) : ""}</td></tr>`).join("");
}
function renderKpi() {
    const all = [...allOrders, ...myArchives];
    const first = all.map(o => o.created_at).filter(Boolean).sort()[0];
    $("kpiAll").textContent = all.length;
    $("kpiSince").textContent = first ? fmtDate(first, { month: "short", year: "numeric" }) : "-";
    $("kpiArsip").textContent = myArchives.length;
    $("kpiSupply").textContent = mySupplyOrders.length;
}
function renderCharts() {
    if (typeof Chart === "undefined") return;
    if ($("chartFold") && $("chartFold").classList.contains("collapsed")) return;   // sedang diminimize
    const all = [...allOrders, ...myArchives].filter(o => o.created_at);
    const key = d => `${d.getFullYear()}-${d.getMonth()}`;
    const now = new Date();
    let start = all.length ? new Date(Math.min(...all.map(o => new Date(o.created_at)))) : now;
    start = new Date(start.getFullYear(), start.getMonth(), 1);
    const minStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    if (start > minStart) start = minStart;
    const maxStart = new Date(now.getFullYear(), now.getMonth() - 23, 1);
    if (start < maxStart) start = maxStart;
    const keys = [], labels = [];
    for (let d = new Date(start); d <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        keys.push(key(d)); labels.push(d.toLocaleDateString(loc(), { month: "short", year: "2-digit" }));
    }
    const per = {}; all.forEach(o => { const k = key(new Date(o.created_at)); per[k] = (per[k] || 0) + 1; });

    const dash = { BEM: 0, SEM: 0, LEM: 0 }; all.forEach(o => { const k = String(o.dashboard || "").toUpperCase().replace(/^FAST-/, ""); if (k in dash) dash[k]++; });
    const st = { proses: 0, mendekati: 0, selesai: 0 }; allOrders.forEach(o => st[getOrderStatus(o.paket_terkirim, o.paket_total).key]++);

    const _tc = themeChartColors(), GOLD = _tc.gold, SILVER = _tc.info, ROSE = _tc.danger, GREEN = _tc.success;
    Chart.defaults.color = _tc.text; Chart.defaults.font.family = "Inter, sans-serif";
    const draw = (id, cfg) => { if (_cuCharts[id]) _cuCharts[id].destroy(); _cuCharts[id] = new Chart($(id), cfg); };
    const base = { responsive: true, maintainAspectRatio: false };
    draw("cuChartBulan", { type: "bar", data: { labels, datasets: [{ data: keys.map(k => per[k] || 0), backgroundColor: GOLD, borderRadius: 4 }] },
        options: { ...base, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: _tc.grid } } } } });
    const donut = (id, lab, data, colors) => draw(id, { type: "doughnut", data: { labels: lab, datasets: [{ data, backgroundColor: colors, borderColor: _tc.surface, borderWidth: 3 }] },
        options: { ...base, cutout: "66%", plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } } } });
    donut("cuChartDash", ["BEM", "SEM", "LEM"], [dash.BEM, dash.SEM, dash.LEM], [GOLD, SILVER, ROSE]);
    donut("cuChartStatus", [t("status_proses"), t("status_mendekati"), t("status_selesai")], [st.proses, st.mendekati, st.selesai], [SILVER, _tc.warning, GREEN]);
}


/* Supply & Stock: kontak + catatan untuk admin (butuh sql/koin-usdt-17-supply-kontak.sql; tanpa SQL itu pesanan tetap jalan) */
Object.assign(TRANSLATIONS.id, {
    sc_contact: "Kontak yang bisa dihubungi admin (opsional)", sc_contact_ph: "No. WhatsApp (mis. 0812…) atau link profil Messenger",
    sc_contact_hint: "Admin akan menghubungi Anda lewat kontak ini bila perlu.", sc_note: "Catatan untuk admin (opsional)", sc_note_ph: "Tulis pesan untuk admin…"
});
Object.assign(TRANSLATIONS.en, {
    sc_contact: "Contact the admin can reach (optional)", sc_contact_ph: "WhatsApp number (e.g. +62812…) or Messenger profile link",
    sc_contact_hint: "The admin will contact you through this if needed.", sc_note: "Note for admin (optional)", sc_note_ph: "Write a message for the admin…"
});
