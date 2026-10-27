/**
 * Perpanjang langganan (pelanggan) — butuh sql/perpanjang.sql di Supabase.
 * Pelanggan memilih jumlah hari, paket BEM/SEM/LEM, dan boleh mengganti tagar.
 * Setelah dikirim, status = Menunggu Konfirmasi dan pelanggan diminta
 * menghubungi admin lewat WhatsApp.
 */
Object.assign(TRANSLATIONS.id, {
    rn_btn: "Perpanjang", rn_tab: "Perpanjangan", rn_modal_title: "Perpanjang Langganan",
    rn_current: "{a} dari {b} hari terkirim · limit tercapai",
    rn_days_label: "Berapa hari?", rn_days_hint: "Isi bebas 1–365 hari, atau pilih cepat:", rn_days_unit: "hari",
    rn_pkg_label: "Pilih paket", rn_pkg_current: "Paket saat ini",
    rn_tag_label: "Tagar", rn_tag_keep: "Tetap pakai tagar lama", rn_tag_change: "Ganti tagar baru", rn_tag_new_ph: "cth. #tagarbaru",
    rn_info_wait: "Setelah dikirim, status permintaan Anda adalah Menunggu Konfirmasi sampai admin memprosesnya.",
    rn_cancel: "Batal", rn_send: "Kirim Permintaan", rn_sending: "Mengirim...",
    rn_err_days: "Jumlah hari harus 1 sampai 365", rn_err_tag: "Isi tagar baru terlebih dahulu",
    rn_err_generic: "Gagal mengirim permintaan", rn_err_not_ready: "Fitur perpanjangan belum aktif. Hubungi admin.",
    rn_err_not_limit: "Perpanjangan hanya bisa diajukan untuk langganan yang sudah limit",
    rn_err_dup: "Permintaan untuk langganan ini masih menunggu konfirmasi",
    rn_err_taglen: "Tagar maksimal 100 karakter", rn_err_notfound: "Langganan tidak ditemukan",
    rn_sent_title: "Permintaan Terkirim",
    rn_status_pending: "Menunggu Konfirmasi", rn_status_approved: "Disetujui", rn_status_rejected: "Ditolak",
    rn_notify: "Silakan hubungi admin melalui nomor WhatsApp {wa} agar permintaan Anda segera diproses.",
    rn_wa_btn: "Hubungi Admin via WhatsApp", rn_close: "Tutup",
    rn_sum_tag: "Tagar", rn_sum_pkg: "Paket", rn_sum_days: "Durasi",
    rn_list_title: "Permintaan Perpanjangan Saya", rn_list_empty: "Belum ada permintaan perpanjangan.",
    rn_list_empty_sub: "Langganan yang sudah limit punya tombol Perpanjang.",
    rn_cancel_req: "Batalkan", rn_cancel_q: "Batalkan permintaan perpanjangan ini?", rn_cancel_yes: "Ya, Batalkan", rn_cancelled_ok: "Permintaan dibatalkan",
    rn_admin_note: "Catatan admin", rn_tag_changed: "Tagar diganti", rn_renewed: "Sudah diperpanjang",
    rn_banner: "Ada {n} permintaan menunggu konfirmasi. Hubungi admin di WhatsApp {wa}.",
    rn_wa_text: "Halo admin, saya {u} mengajukan perpanjangan langganan.\nTagar: {tag}\nPaket: {pkg}\nDurasi: {d} hari\nMohon dikonfirmasi. (ID #{id})",
    rn_wa_chat: "Chat Admin", rn_days_short: "{n} hari"
});
Object.assign(TRANSLATIONS.en, {
    rn_btn: "Renew", rn_tab: "Renewals", rn_modal_title: "Renew Subscription",
    rn_current: "{a} of {b} days delivered · limit reached",
    rn_days_label: "How many days?", rn_days_hint: "Enter any 1–365 days, or pick quickly:", rn_days_unit: "days",
    rn_pkg_label: "Choose package", rn_pkg_current: "Current package",
    rn_tag_label: "Tag", rn_tag_keep: "Keep the current tag", rn_tag_change: "Use a new tag", rn_tag_new_ph: "e.g. #newtag",
    rn_info_wait: "After sending, your request is marked Awaiting Confirmation until the admin processes it.",
    rn_cancel: "Cancel", rn_send: "Send Request", rn_sending: "Sending...",
    rn_err_days: "Days must be between 1 and 365", rn_err_tag: "Please enter the new tag",
    rn_err_generic: "Failed to send request", rn_err_not_ready: "Renewal feature is not active yet. Contact admin.",
    rn_err_not_limit: "Renewal can only be requested for subscriptions that reached the limit",
    rn_err_dup: "A request for this subscription is still awaiting confirmation",
    rn_err_taglen: "Tag must be at most 100 characters", rn_err_notfound: "Subscription not found",
    rn_sent_title: "Request Sent",
    rn_status_pending: "Awaiting Confirmation", rn_status_approved: "Approved", rn_status_rejected: "Rejected",
    rn_notify: "Please contact the admin via WhatsApp {wa} so your request is processed quickly.",
    rn_wa_btn: "Contact Admin on WhatsApp", rn_close: "Close",
    rn_sum_tag: "Tag", rn_sum_pkg: "Package", rn_sum_days: "Duration",
    rn_list_title: "My Renewal Requests", rn_list_empty: "No renewal requests yet.",
    rn_list_empty_sub: "Subscriptions that reached the limit have a Renew button.",
    rn_cancel_req: "Cancel", rn_cancel_q: "Cancel this renewal request?", rn_cancel_yes: "Yes, Cancel", rn_cancelled_ok: "Request cancelled",
    rn_admin_note: "Admin note", rn_tag_changed: "Tag changed", rn_renewed: "Renewed",
    rn_banner: "{n} request(s) awaiting confirmation. Contact admin on WhatsApp {wa}.",
    rn_wa_text: "Hello admin, I'm {u} and I'd like to renew my subscription.\nTag: {tag}\nPackage: {pkg}\nDuration: {d} days\nPlease confirm. (ID #{id})",
    rn_wa_chat: "Chat Admin", rn_days_short: "{n} days"
});
Object.assign(SERVER_ERROR_MAP, {
    "Perpanjangan hanya bisa diajukan untuk langganan yang sudah limit": "rn_err_not_limit",
    "Permintaan perpanjangan untuk langganan ini masih menunggu konfirmasi": "rn_err_dup",
    "Jumlah hari harus antara 1 dan 365": "rn_err_days",
    "Tagar maksimal 100 karakter": "rn_err_taglen",
    "Langganan tidak ditemukan": "rn_err_notfound"
});

let myRenewals = [];
const RN_PKGS = ["BEM", "SEM", "LEM"];
const RN_QUICK = [7, 14, 30, 60, 90];
const rnWaLink = (text) => `https://wa.me/${ADMIN_WA_INTL}` + (text ? `?text=${encodeURIComponent(text)}` : "");
const rnNorm = (s) => String(s || "").toLowerCase().replaceAll("#", "").trim();

function rnPending(source, id) {
    return myRenewals.find(r => r.status === "pending" && r.source === source && Number(r.source_id) === Number(id));
}
function rnDone(source, row) {
    return myRenewals.some(r => r.status === "approved" && (
        (r.source === source && Number(r.source_id) === Number(row.id)) ||
        (source === "archive" && r.source === "order" && row.order_id != null && Number(r.source_id) === Number(row.order_id))));
}

/** Dipanggil dari dashboard.js (kartu langganan) & portal-extra.js (arsip). */
function renewalActionHtml(source, row) {
    if (!(row.paket_total > 0 && row.paket_terkirim >= row.paket_total)) return "";
    if (rnPending(source, row.id)) return `<span class="badge badge-wait">⏳ ${escapeHtml(t("rn_status_pending"))}</span>`;
    if (rnDone(source, row)) return `<span class="badge badge-done">✅ ${escapeHtml(t("rn_renewed"))}</span>`;
    return `<button type="button" class="btn btn-renew" data-renew-source="${source}" data-renew-id="${row.id}">🔄 ${escapeHtml(t("rn_btn"))}</button>`;
}

async function loadRenewals() {
    const { data, error } = await cuRpc("cu_my_renewals");
    if (error) return;
    myRenewals = data || [];
    rnRefreshAll();
}
function rnRefreshAll() {
    if (typeof renderOrders === "function") renderOrders();
    if (typeof renderArchive === "function") renderArchive();
    renderRenewalList();
}

document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-renew-source]");
    if (!b) return;
    const source = b.dataset.renewSource, id = Number(b.dataset.renewId);
    const row = (source === "archive" ? myArchives : allOrders).find(x => Number(x.id) === id);
    if (row) openRenewModal(source, row);
});

/* ---------------- Modal form ---------------- */
function openRenewModal(source, row) {
    const cur = String(row.dashboard || "BEM").toUpperCase();
    const st = { hari: row.paket_total > 0 && row.paket_total <= 365 ? row.paket_total : 30, pkg: RN_PKGS.includes(cur) ? cur : "BEM", change: false };

    $("modalBox").innerHTML = `
        <div class="rn-head"><div class="rn-icon">🔄</div>
            <div><div class="modal-title" style="margin:0">${escapeHtml(t("rn_modal_title"))}</div>
            <div class="rn-sub"><b>${escapeHtml(row.tagar)}</b> · ${escapeHtml(t("rn_current", { a: row.paket_terkirim, b: row.paket_total }))}</div></div></div>

        <div class="rn-block">
            <label class="rn-label" for="rnHari">${escapeHtml(t("rn_days_label"))}</label>
            <div class="rn-days"><input type="number" id="rnHari" min="1" max="365" inputmode="numeric" value="${st.hari}"><span>${escapeHtml(t("rn_days_unit"))}</span></div>
            <div class="rn-hint">${escapeHtml(t("rn_days_hint"))}</div>
            <div class="rn-chips" id="rnChips">${RN_QUICK.map(n => `<button type="button" class="rn-chip" data-n="${n}">${n}</button>`).join("")}</div>
        </div>

        <div class="rn-block">
            <div class="rn-label">${escapeHtml(t("rn_pkg_label"))}</div>
            <div class="rn-pkgs" id="rnPkgs">${RN_PKGS.map(p => `
                <button type="button" class="rn-pkg" data-pkg="${p}"><b>${p}</b><small>${p === cur ? escapeHtml(t("rn_pkg_current")) : "&nbsp;"}</small><small class="rn-pkg-price" data-pkgprice="${p}"></small></button>`).join("")}</div>
        </div>

        <div class="rn-block">
            <div class="rn-label">${escapeHtml(t("rn_tag_label"))}</div>
            <div class="rn-seg" id="rnTagMode">
                <button type="button" data-mode="keep">${escapeHtml(t("rn_tag_keep"))}</button>
                <button type="button" data-mode="change">${escapeHtml(t("rn_tag_change"))}</button>
            </div>
            <div id="rnTagBox" class="rn-tagbox" style="display:none"><input type="text" id="rnTagBaru" maxlength="100" placeholder="${escapeHtml(t("rn_tag_new_ph"))}" autocomplete="off"></div>
        </div>

        ${kirimBlockHtml("rn")}

        ${priceBoxHtml("rn")}

        <div class="rn-info">ℹ️ ${escapeHtml(t("rn_info_wait"))}</div>
        <div class="modal-actions">
            <button type="button" class="btn btn-ghost" id="rnNo">${escapeHtml(t("rn_cancel"))}</button>
            <button type="button" class="btn btn-gold" id="rnYes">${escapeHtml(t("rn_send"))}</button>
        </div>`;
    $("modalOverlay").classList.add("show");

    const getKirim = bindKirim("rn");
    const pb = bindPriceBox("rn", () => ({ pkg: st.pkg, hari: parseInt($("rnHari").value, 10), jumlah: 1 }));
    fillPkgPrices($("modalBox"));
    const sync = () => {
        pb.schedule();
        $("rnChips").querySelectorAll(".rn-chip").forEach(c => c.classList.toggle("on", Number(c.dataset.n) === Number($("rnHari").value)));
        $("rnPkgs").querySelectorAll(".rn-pkg").forEach(c => c.classList.toggle("on", c.dataset.pkg === st.pkg));
        $("rnTagMode").querySelectorAll("button").forEach(c => c.classList.toggle("on", (c.dataset.mode === "change") === st.change));
        $("rnTagBox").style.display = st.change ? "block" : "none";
    };
    $("rnHari").addEventListener("input", sync);
    $("rnChips").addEventListener("click", (e) => { const c = e.target.closest(".rn-chip"); if (c) { $("rnHari").value = c.dataset.n; sync(); } });
    $("rnPkgs").addEventListener("click", (e) => { const c = e.target.closest(".rn-pkg"); if (c) { st.pkg = c.dataset.pkg; sync(); } });
    $("rnTagMode").addEventListener("click", (e) => {
        const c = e.target.closest("button"); if (!c) return;
        st.change = c.dataset.mode === "change"; sync();
        if (st.change) $("rnTagBaru").focus();
    });
    $("rnNo").addEventListener("click", closeModal);
    sync();
    ensurePriceInfo().then(() => { if (!pkgAvail(st.pkg)) { const a = RN_PKGS.find(p => pkgAvail(p)); if (a) { st.pkg = a; sync(); } } });

    $("rnYes").addEventListener("click", async () => {
        const hari = parseInt($("rnHari").value, 10);
        const tagBaru = st.change ? $("rnTagBaru").value.trim() : "";
        if (!hari || hari < 1 || hari > 365) { showToast(t("rn_err_days"), "danger"); return; }
        if (st.change && !tagBaru) { showToast(t("rn_err_tag"), "danger"); return; }
        if (!pkgAvail(st.pkg)) { showToast(t("av_err_pkg"), "danger"); return; }

        if (!(await payStep({ pkg: st.pkg, hari, jumlah: 1, kode: pb.kode() }))) return;

        const btn = $("rnYes"); btn.disabled = true; btn.textContent = t("rn_sending");
        const { data, error } = await cuRpcKirim("cu_request_renewal", {
            p_source: source, p_source_id: row.id, p_dashboard: st.pkg, p_hari: hari, p_tagar_baru: tagBaru || null, p_kode: pb.kode() || null
        }, getKirim());
        if (error) {
            btn.disabled = false; btn.textContent = t("rn_send");
            const m = error.message || "";
            showToast(/does not exist|schema cache/i.test(m) ? t("rn_err_not_ready") : (translateServerError(m) || t("rn_err_generic")), "danger");
            return;
        }
        const id = data && data.id;
        await loadRenewals(); if (typeof loadCoin === "function") loadCoin();
        showRenewSent({ id, tagar: tagBaru && rnNorm(tagBaru) !== rnNorm(row.tagar) ? tagBaru : row.tagar, pkg: st.pkg, hari, total: data && data.total, kode: pb.kode() });
    });
}

/* Layar sukses: status Menunggu Konfirmasi + arahkan hubungi admin */
function showRenewSent(r) {
    const text = t(r.isNew ? "no_wa_text" : "rn_wa_text", { u: sessionStorage.getItem("admin_view_name") || localStorage.getItem("pelanggan_username") || "", tag: r.tagar, pkg: r.pkg, d: r.hari, id: r.id, n: r.count || 1, note: r.note || "-" }) + (r.total ? "\n" + t("price_total") + ": " + fmtRp(r.total) : "") + (r.kode ? "\n" + r.kode : "");
    $("modalBox").innerHTML = `
        <div class="rn-done-icon">✅</div>
        <div class="modal-title" style="text-align:center">${escapeHtml(t(r.isNew ? "no_sent_title" : "rn_sent_title"))}</div>
        <div style="text-align:center;margin-bottom:14px"><span class="badge badge-wait">⏳ ${escapeHtml(t("rn_status_pending"))}</span></div>
        <div class="rn-sum">
            <div><span>${escapeHtml(t("rn_sum_tag"))}</span><b>${escapeHtml(r.tagar)}</b></div>
            <div><span>${escapeHtml(t("rn_sum_pkg"))}</span><b>${escapeHtml(r.pkg)}</b></div>
            <div><span>${escapeHtml(t("rn_sum_days"))}</span><b>${escapeHtml(t("rn_days_short", { n: r.hari }))}</b></div>
        </div>
        <div class="rn-notify">📲 ${escapeHtml(t("rn_notify", { wa: ADMIN_WA_DISPLAY }))}</div>
        ${contactButtonsHtml(text, "block")}
        <button type="button" class="btn btn-ghost btn-block" id="rnClose" style="margin-top:8px">${escapeHtml(t("rn_close"))}</button>`;
    $("modalOverlay").classList.add("show");
    $("rnClose").addEventListener("click", closeModal);
}

/* ---------------- Tab "Perpanjangan" ---------------- */
function renderRenewalList() {
    const box = $("rnList"); if (!box) return;
    const pend = myRenewals.filter(r => r.status === "pending");
    const badge = $("rnTabBadge");
    badge.textContent = pend.length; badge.style.display = pend.length ? "inline-block" : "none";

    $("rnBanner").style.display = pend.length ? "block" : "none";
    $("rnBanner").innerHTML = pend.length
        ? `📲 ${escapeHtml(t("rn_banner", { n: pend.length, wa: ADMIN_WA_DISPLAY }))} <button type="button" class="btn btn-wa mini-wa" data-contact-text="">💬 ${escapeHtml(t("rn_wa_chat"))}</button>` : "";
    $("rnEmpty").style.display = myRenewals.length ? "none" : "block";

    const stCls = { pending: "badge-wait", approved: "badge-done", rejected: "badge-danger" };
    const stIco = { pending: "⏳", approved: "✅", rejected: "✖" };
    box.innerHTML = myRenewals.map(r => `
        <div class="rn-card ${r.status}">
            <div class="rn-card-top">
                <div class="rn-card-tag">${r.tagar_diganti ? `<s>${escapeHtml(r.tagar_lama)}</s> → ` : ""}<b>${escapeHtml(r.source === "new" && r.tagar_list && r.tagar_list.length > 1 ? r.tagar_list.join(", ") : r.tagar_baru)}</b>
                    ${r.tagar_diganti ? `<span class="rn-pill">${escapeHtml(t("rn_tag_changed"))}</span>` : ""}${r.source === "new" ? `<span class="rn-pill">🆕 ${escapeHtml(t("no_pill"))}${r.tagar_list && r.tagar_list.length > 1 ? " · " + r.tagar_list.length + "×" : ""}</span>` : ""}</div>${r.total_harga != null && r.total_harga > 0 ? `<div class="rn-card-note">💰 ${escapeHtml(fmtRp(r.total_harga))}${r.kode_referal ? " · 🎟 " + escapeHtml(r.kode_referal) : ""}</div>` : ""}${r.catatan_pelanggan ? `<div class="rn-card-note">📝 ${escapeHtml(r.catatan_pelanggan)}</div>` : ""}
                <span class="badge ${stCls[r.status]}">${stIco[r.status]} ${escapeHtml(t("rn_status_" + r.status))}</span>
            </div>
            <div class="rn-card-meta">
                <span class="dash-chip">${escapeHtml(r.dashboard_baru)}</span>
                <span>${escapeHtml(t("rn_days_short", { n: r.hari }))}</span>
                <span class="rn-date">${fmtDate(r.created_at)}</span>
            </div>
            ${r.catatan_admin ? `<div class="rn-note">💬 ${escapeHtml(t("rn_admin_note"))}: ${linkify(r.catatan_admin)}</div>` : ""}
            ${r.status === "pending" ? `<div class="rn-card-actions">
                <button type="button" class="btn btn-wa mini-wa" data-contact-text="${escapeHtml(t(r.source === "new" ? "no_wa_text" : "rn_wa_text", { u: localStorage.getItem("pelanggan_username") || "", tag: (r.tagar_list && r.tagar_list.length ? r.tagar_list.join(", ") : r.tagar_baru), pkg: r.dashboard_baru, d: r.hari, id: r.id, n: (r.tagar_list && r.tagar_list.length) || 1, note: r.catatan_pelanggan || "-" }))}">💬 ${escapeHtml(t("rn_wa_chat"))}</button>
                <button type="button" class="btn btn-ghost mini" onclick="askCancelRenewal(${r.id})">${escapeHtml(t("rn_cancel_req"))}</button></div>` : ""}
        </div>`).join("");
}

function askCancelRenewal(id) {
    $("modalBox").innerHTML = `<div class="modal-title">${escapeHtml(t("rn_cancel_req"))}</div>
        <div class="modal-sub">${escapeHtml(t("rn_cancel_q"))}</div>
        <button type="button" class="btn btn-danger btn-block" id="rcYes">${escapeHtml(t("rn_cancel_yes"))}</button>
        <button type="button" class="btn btn-ghost btn-block" id="rcNo" style="margin-top:8px">${escapeHtml(t("rn_close"))}</button>`;
    $("modalOverlay").classList.add("show");
    $("rcNo").addEventListener("click", closeModal);
    $("rcYes").addEventListener("click", async () => {
        const { error } = await cuRpc("cu_cancel_renewal", { p_id: id });
        closeModal();
        if (error) { showToast(t("rn_err_generic"), "danger"); return; }
        showToast(t("rn_cancelled_ok"), "success");
        loadRenewals();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("langchange", renderRenewalList);
    loadRenewals();
});
