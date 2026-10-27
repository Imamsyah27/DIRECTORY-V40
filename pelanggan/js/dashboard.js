let allOrders = [];
let listFilter = "all";   // all | limit | tomorrow
let listView = (() => { try { return localStorage.getItem("cu_list_view") === "box" ? "box" : "table"; } catch (e) { return "table"; } })();   // table | box

function setListView(v) {
    listView = v;
    try { localStorage.setItem("cu_list_view", v); } catch (e) {}
    renderOrders();
}
let searchQuery = "";

function normalizeTag(str) {
    return String(str || "").toLowerCase().replaceAll("#", "").trim();
}
let sessionToken = null;

function getUTCDate() {
    return new Date().toISOString().split("T")[0];
}

function getOrderStatus(terkirim, total) {
    if (total <= 0) return { key: "proses", labelKey: "status_proses", badgeClass: "badge-proses", icon: "⏳", barClass: "" };
    const ratio = terkirim / total;
    if (terkirim >= total) return { key: "selesai", labelKey: "status_selesai", badgeClass: "badge-done", icon: "✅", barClass: "done" };
    if (ratio >= 0.8) return { key: "mendekati", labelKey: "status_mendekati", badgeClass: "badge-warn", icon: "⚠️", barClass: "warn" };
    return { key: "proses", labelKey: "status_proses", badgeClass: "badge-proses", icon: "⏳", barClass: "" };
}

function isLimitReached(o) {
    return o.paket_total > 0 && o.paket_terkirim >= o.paket_total;
}

/**
 * "Akan limit besok" = setelah pencatatan hari ini, sisa hari tinggal 1.
 * - Sudah dicatat hari ini  -> sisa sekarang harus 1.
 * - Belum dicatat hari ini  -> pencatatan hari ini akan mengurangi sisa 1 hari,
 *   jadi sisa sekarang harus 2. (Kalau sisa sekarang 1 dan belum dicatat,
 *   limit tercapai HARI INI saat dicatat, bukan besok.)
 */
function willReachLimitTomorrow(o, todayUTC) {
    if (isLimitReached(o)) return false;
    const sisa = o.paket_total - o.paket_terkirim;
    const sudahHariIni = o.last_check_utc === todayUTC;
    return (sudahHariIni ? sisa : sisa - 1) === 1;
}

document.addEventListener("DOMContentLoaded", async () => {
    sessionToken = requireSessionOrRedirect();
    if (!sessionToken) return;

    updateGreeting();

    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await supabaseClient.rpc("customer_logout", { p_session_token: sessionToken });
        clearSession();
        window.location.href = "index.html";
    });

    document.getElementById("gantiPwToggleBtn").addEventListener("click", () => {
        const panel = document.getElementById("gantiPwPanel");
        panel.style.display = panel.style.display === "none" ? "block" : "none";
    });

    document.getElementById("simpanPwBtn").addEventListener("click", handleChangePassword);

    document.getElementById("cardLimit").addEventListener("click", () => setListFilter(listFilter === "limit" ? "all" : "limit"));
    document.getElementById("cardTomorrow").addEventListener("click", () => setListFilter(listFilter === "tomorrow" ? "all" : "tomorrow"));
    document.getElementById("viewSwitch").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-view]");
        if (b) setListView(b.dataset.view);
    });
    document.getElementById("filterTabs").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-f]");
        if (b) setListFilter(b.dataset.f);
    });

    const searchInput = document.getElementById("tagSearchInput");
    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value;
        document.getElementById("tagSearchClear").style.display = searchQuery ? "inline-flex" : "none";
        renderOrders();
    });
    document.getElementById("tagSearchClear").addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        document.getElementById("tagSearchClear").style.display = "none";
        renderOrders();
        searchInput.focus();
    });

    document.getElementById("modalOverlay").addEventListener("click", (e) => {
        if (e.target.id === "modalOverlay") closeModal();
    });

    document.addEventListener("langchange", () => {
        updateGreeting();
        renderOrders();
        if (document.getElementById("modalOverlay").classList.contains("show")) {
            openTomorrowModal();
        }
    });

    await loadMyOrders();
});

function updateGreeting() {
    const username = (isAdminView() ? sessionStorage.getItem("admin_view_name") : localStorage.getItem("pelanggan_username")) || "";
    document.getElementById("greetTitle").textContent = `${t("greet_prefix")}, ${username} 👋`;
}

async function handleChangePassword() {
    clearFormMsg("gantiPwMsg");
    const lama = document.getElementById("pwLama").value;
    const baru = document.getElementById("pwBaru").value;

    if (!lama || !baru) {
        showFormMsg("gantiPwMsg", t("err_fill_both_passwords"), "error");
        return;
    }
    if (baru.length < 6) {
        showFormMsg("gantiPwMsg", t("err_password_min"), "error");
        return;
    }

    const { error } = await supabaseClient.rpc("customer_change_password", {
        p_session_token: sessionToken,
        p_old_password: lama,
        p_new_password: baru
    });

    if (error) {
        showFormMsg("gantiPwMsg", translateServerError(error.message) || t("err_change_password_failed"), "error");
        return;
    }

    showFormMsg("gantiPwMsg", t("success_password_changed"), "success");
    document.getElementById("pwLama").value = "";
    document.getElementById("pwBaru").value = "";
    showToast(t("success_password_changed"), "success");
}

async function loadMyOrders() {
    document.getElementById("loadingState").style.display = "block";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("orderList").innerHTML = "";

    const { data, error } = await supabaseClient.rpc("get_my_orders", { p_session_token: sessionToken });

    document.getElementById("loadingState").style.display = "none";

    if (error) {
        console.error(error);
        if ((error.message || "").toLowerCase().includes("sesi") && !isAdminView()) {
            showToast(t("err_session_expired"), "danger");
            clearSession();
            setTimeout(() => window.location.href = "index.html", 1200);
            return;
        }
        showToast(t("err_load_orders_failed"), "danger");
        return;
    }

    allOrders = data || [];
    renderOrders();
    if (typeof onOrdersLoaded === "function") onOrdersLoaded();
}

function setListFilter(f) {
    listFilter = f;
    renderOrders();
    const box = document.getElementById("orderList");
    if (f !== "all" && box) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function cuAddDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function renderOrders() {
    const todayUTC = getUTCDate();
    const list = document.getElementById("orderList");
    const empty = document.getElementById("emptyState");

    const limitList = allOrders.filter(isLimitReached);
    const tomorrowList = allOrders.filter(o => willReachLimitTomorrow(o, todayUTC));

    // Ringkasan & hitungan filter selalu dari SEMUA data (bukan hasil filter)
    document.getElementById("sumJumlah").textContent = allOrders.length;
    document.getElementById("sumLimit").textContent = limitList.length;
    document.getElementById("sumTomorrow").textContent = tomorrowList.length;
    document.getElementById("fcAll").textContent = allOrders.length;
    document.getElementById("fcLimit").textContent = limitList.length;
    document.getElementById("fcTomorrow").textContent = tomorrowList.length;

    document.getElementById("cardLimit").classList.toggle("active", listFilter === "limit");
    document.getElementById("cardTomorrow").classList.toggle("active", listFilter === "tomorrow");
    document.querySelectorAll("#filterTabs button").forEach(b => b.classList.toggle("on", b.dataset.f === listFilter));
    document.querySelectorAll("#viewSwitch button").forEach(b => b.classList.toggle("on", b.dataset.view === listView));

    let visible = listFilter === "limit" ? limitList : listFilter === "tomorrow" ? tomorrowList : allOrders;

    // Pencarian tagar: jawab "tagar ini sudah terdata atau belum?"
    const q = normalizeTag(searchQuery);
    const resultBox = document.getElementById("tagSearchResult");
    if (q) {
        const matched = allOrders.filter(o => normalizeTag(o.tagar).includes(q));
        visible = visible.filter(o => normalizeTag(o.tagar).includes(q));
        resultBox.style.display = "block";
        resultBox.className = "search-result " + (matched.length > 0 ? "found" : "none");
        resultBox.textContent = matched.length > 0
            ? t("search_found", { n: matched.length })
            : t("search_none", { q: searchQuery.trim() });
    } else {
        resultBox.style.display = "none";
    }

    list.innerHTML = "";

    if (visible.length === 0 && q) {
        empty.style.display = "none";
        return;
    }

    if (visible.length === 0) {
        const titleEl = document.getElementById("emptyTitle");
        const subEl = document.getElementById("emptySub");
        const k = listFilter === "limit" ? ["empty_filter_title", "empty_filter_sub"]
            : listFilter === "tomorrow" ? ["empty_tomorrow_title", "empty_tomorrow_sub"]
            : ["empty_orders_title", "empty_orders_sub"];
        titleEl.dataset.i18n = k[0]; subEl.dataset.i18n = k[1];
        titleEl.textContent = t(k[0]); subEl.textContent = t(k[1]);
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    if (listView === "box") {
        list.innerHTML = `<div class="order-box-list">` + visible.map(o => {
            const status = getOrderStatus(o.paket_terkirim, o.paket_total);
            const limit = isLimitReached(o);
            const percent = o.paket_total > 0 ? Math.min(100, Math.round((o.paket_terkirim / o.paket_total) * 100)) : 0;
            const sudahHariIni = o.last_check_utc === todayUTC;
            const sisa = o.paket_total - o.paket_terkirim;
            return `<div class="order-card${limit ? " is-limit" : ""}">
                <div class="initial-row" data-order-id="${o.id}">${buildInitialView(o)}</div>
                <div class="row1"><span class="tagar-name">${escapeHtml(o.tagar)}</span><span class="dash-chip">${escapeHtml(o.dashboard)}</span></div>
                <div class="progress-track"><div class="progress-fill ${status.barClass}" style="width:${percent}%;"></div></div>
                <div class="row2"><span>${t("day_progress", { a: o.paket_terkirim, b: o.paket_total, p: percent })}</span>
                    <span class="badge ${status.badgeClass}">${status.icon} ${t(status.labelKey)}</span></div>
                <div class="row2" style="margin-top:8px;"><span>${sudahHariIni ? "✅ " + t("checked_today") : "⏳ " + t("not_checked_today")}</span>
                    <span>${sisa > 0 ? t("remaining_days", { n: sisa }) : t("done_label")}</span></div>
                ${limit && typeof renewalActionHtml === "function" ? `<div class="renew-row">${renewalActionHtml("order", o)}</div>` : ""}
            </div>`;
        }).join("") + `</div>`;
        list.querySelectorAll(".initial-row").forEach(bindInitialRow);
        return;
    }

    const rows = visible.map((o, i) => {
        const status = getOrderStatus(o.paket_terkirim, o.paket_total);
        const limit = isLimitReached(o);
        const percent = o.paket_total > 0 ? Math.min(100, Math.round((o.paket_terkirim / o.paket_total) * 100)) : 0;
        const sudahHariIni = o.last_check_utc === todayUTC;
        const sisa = Math.max(0, o.paket_total - o.paket_terkirim);
        const mulai = o.created_at ? new Date(o.created_at) : null;
        const est = limit ? null : cuAddDays(new Date(), Math.max(0, sisa - (sudahHariIni ? 0 : 1)));
        const sisaClass = limit ? "sisa-done" : (sisa <= 1 ? "sisa-danger" : (sisa <= 3 ? "sisa-warn" : "sisa-ok"));
        const renew = limit && typeof renewalActionHtml === "function" ? renewalActionHtml("order", o) : "";
        return `<tr class="${limit ? "is-limit" : ""}">
            <td class="cu-no">${i + 1}</td>
            <td><div class="initial-row" data-order-id="${o.id}">${buildInitialView(o)}</div></td>
            <td><span class="tagar-name">${escapeHtml(o.tagar)}</span></td>
            <td><span class="dash-chip">${escapeHtml(o.dashboard)}</span></td>
            <td><span class="badge ${status.badgeClass}">${status.icon} ${escapeHtml(t(status.labelKey))}</span></td>
            <td class="cu-prog"><div class="cu-prog-text">H${o.paket_terkirim}/H${o.paket_total} <span>${percent}%</span></div>
                <div class="progress-track"><div class="progress-fill ${status.barClass}" style="width:${percent}%;"></div></div></td>
            <td class="cu-date">${mulai ? fmtDate(mulai) : "-"}</td>
            <td class="cu-date">${est ? fmtDate(est) : "-"}</td>
            <td><span class="sisa-pill ${sisaClass}">${limit ? escapeHtml(t("done_label")) : escapeHtml(t("remaining_days", { n: sisa }))}</span></td>
            <td class="cu-today">${sudahHariIni ? "✅ " + escapeHtml(t("checked_today")) : "⏳ " + escapeHtml(t("not_checked_today"))}</td>
            <td class="cu-aksi"><div class="renew-row">${renew || "—"}</div></td>
        </tr>`;
    }).join("");

    list.innerHTML = `<div class="cu-table-wrap"><table class="cu-table"><thead><tr>
        <th>${escapeHtml(t("col_no"))}</th><th>${escapeHtml(t("col_initial"))}</th><th>${escapeHtml(t("col_tagar"))}</th>
        <th>${escapeHtml(t("col_dashboard"))}</th><th>${escapeHtml(t("col_status"))}</th><th>${escapeHtml(t("col_progress"))}</th>
        <th>${escapeHtml(t("col_start"))}</th><th>${escapeHtml(t("col_est_end"))}</th><th>${escapeHtml(t("col_remaining"))}</th>
        <th>${escapeHtml(t("col_today"))}</th><th class="cu-aksi">${escapeHtml(t("col_action"))}</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;

    list.querySelectorAll(".initial-row").forEach(bindInitialRow);
}

/* ---------------- Nama inisial (label pribadi di atas tagar) ---------------- */

function buildInitialView(o) {
    if (o.inisial) {
        return `<span class="initial-badge">${escapeHtml(o.inisial)}</span>
                <button type="button" class="initial-edit-btn" data-action="edit" title="${escapeHtml(t("initial_edit_title"))}">✏️</button>`;
    }
    return `<button type="button" class="initial-add-btn" data-action="edit">${escapeHtml(t("initial_add"))}</button>`;
}

function bindInitialRow(row) {
    const orderId = Number(row.dataset.orderId);
    const order = allOrders.find(x => x.id === orderId);
    const editBtn = row.querySelector('[data-action="edit"]');
    if (editBtn) editBtn.addEventListener("click", () => showInitialEditor(row, order));
}

function showInitialEditor(row, order) {
    row.innerHTML = `
        <input type="text" class="initial-input" maxlength="30" value="${escapeHtml(order.inisial || "")}" placeholder="${escapeHtml(t("initial_placeholder"))}">
        <button type="button" class="btn btn-primary initial-save-btn">${escapeHtml(t("initial_save"))}</button>
        <button type="button" class="btn btn-ghost initial-cancel-btn">${escapeHtml(t("initial_cancel"))}</button>
    `;
    const input = row.querySelector(".initial-input");
    input.focus();

    const cancel = () => {
        row.innerHTML = buildInitialView(order);
        bindInitialRow(row);
    };
    const save = async () => {
        const value = input.value.trim();
        const { error } = await supabaseClient.rpc("customer_set_order_label", {
            p_session_token: sessionToken,
            p_order_id: order.id,
            p_inisial: value
        });
        if (error) {
            console.error(error);
            showToast(translateServerError(error.message) || t("initial_failed"), "danger");
            return;
        }
        order.inisial = value || null;
        showToast(t("initial_saved"), "success");
        renderOrders();
    };

    row.querySelector(".initial-save-btn").addEventListener("click", save);
    row.querySelector(".initial-cancel-btn").addEventListener("click", cancel);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
    });
}

/* ---------------- Modal: daftar yang akan limit besok ---------------- */

function openTomorrowModal() {
    const todayUTC = getUTCDate();
    const list = allOrders.filter(o => willReachLimitTomorrow(o, todayUTC));

    let body;
    if (list.length === 0) {
        body = `<div class="state-block" style="padding:24px 8px;"><div class="icon">🎉</div><div>${escapeHtml(t("modal_tomorrow_empty"))}</div></div>`;
    } else {
        body = `
            <div class="table-scroll">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>${escapeHtml(t("col_initial"))}</th>
                            <th>${escapeHtml(t("col_tagar"))}</th>
                            <th>${escapeHtml(t("col_dashboard"))}</th>
                            <th>${escapeHtml(t("col_progress"))}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(o => `
                            <tr>
                                <td>${o.inisial ? `<span class="initial-badge">${escapeHtml(o.inisial)}</span>` : "-"}</td>
                                <td><b>${escapeHtml(o.tagar)}</b></td>
                                <td>${escapeHtml(o.dashboard)}</td>
                                <td>H${o.paket_terkirim} / H${o.paket_total}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>`;
    }

    document.getElementById("modalBox").innerHTML = `
        <div class="modal-title">⏰ ${escapeHtml(t("modal_tomorrow_title"))}</div>
        <div class="modal-sub">${escapeHtml(t("modal_tomorrow_sub"))}</div>
        ${body}
        <button type="button" class="btn btn-primary btn-block" id="modalCloseBtn" style="margin-top:16px;">${escapeHtml(t("modal_close"))}</button>
    `;
    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
    document.getElementById("modalOverlay").classList.add("show");
}

function closeModal() {
    document.getElementById("modalOverlay").classList.remove("show");
}
