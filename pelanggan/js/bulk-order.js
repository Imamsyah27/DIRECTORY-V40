/**
 * BULK ORDER — pelanggan: BEM + SEM + LEM dalam 1 pesanan (maks. 100 tagar total). Butuh sql/koin-usdt-15-bulk-order.sql.
 * Harga per tagar dibedakan per tier (1–5, 6–10, 11–50, 51–100 tagar total) dan diatur admin di menu Price.
 * Pesanan masuk antrian Bot Order admin (tagar per paket + catatan), dibayar dengan koin seperti Bot Order.
 */
Object.assign(TRANSLATIONS.id, {
    bk_btn: "Pesan Bulk Order", bk_title: "Bulk Order", bk_sub: "BEM, SEM, dan LEM dalam 1 pesanan (maks. 100 tagar). Makin banyak tagar, makin murah per tagar.",
    bk_tags_hint: "Satu tagar per baris atau pisahkan dengan koma. Kosongkan paket yang tidak dipesan.", bk_note: "Catatan untuk admin (opsional)",
    bk_total_tags: "Total tagar", bk_tier: "Tier harga", bk_total: "Total", bk_tiers: "Daftar harga per tagar", bk_tag_range: "{a}–{b} tagar",
    bk_none: "Isi tagar untuk melihat total harga.", bk_unset: "Harga Bulk Order belum diatur admin.", bk_off: "Bulk Order sedang tidak tersedia.",
    bk_send: "Lanjut ke Pembayaran", bk_sent_title: "Bulk Order Terkirim", bk_sent_text: "Pesanan {n} tagar sebesar {total} sudah masuk antrian admin.",
    bk_err_empty: "Isi minimal 1 tagar", bk_err_max: "Bulk Order maksimal 100 tagar per pesanan", bk_err_price: "Harga Bulk Order belum diatur admin",
    bk_wa_text: "Halo Admin, saya sudah membayar Bulk Order ({n} tagar) sebesar {total}. Berikut bukti pembayarannya:",
    bk_line: "{pkg}: {n} × {p}", bk_label: "Bulk"
});
Object.assign(TRANSLATIONS.en, {
    bk_btn: "Order Bulk", bk_title: "Bulk Order", bk_sub: "BEM, SEM and LEM in 1 order (max. 100 tags). The more tags, the cheaper per tag.",
    bk_tags_hint: "One tag per line or separate with commas. Leave a package empty if you do not need it.", bk_note: "Note for admin (optional)",
    bk_total_tags: "Total tags", bk_tier: "Price tier", bk_total: "Total", bk_tiers: "Price per tag list", bk_tag_range: "{a}–{b} tags",
    bk_none: "Enter tags to see the total price.", bk_unset: "Bulk Order price has not been set by the admin.", bk_off: "Bulk Order is currently unavailable.",
    bk_send: "Continue to Payment", bk_sent_title: "Bulk Order Sent", bk_sent_text: "Your order of {n} tags totaling {total} is now in the admin queue.",
    bk_err_empty: "Enter at least 1 tag", bk_err_max: "Bulk Order allows at most 100 tags per order", bk_err_price: "Bulk Order price has not been set by the admin",
    bk_wa_text: "Hello Admin, I have paid for Bulk Order ({n} tags), total {total}. Here is my payment proof:",
    bk_line: "{pkg}: {n} × {p}", bk_label: "Bulk"
});
Object.assign(SERVER_ERROR_MAP, {
    "Harga Bulk Order belum diatur admin": "bk_err_price", "Bulk Order maksimal 100 tagar per pesanan": "bk_err_max",
    "Bulk Order sedang tidak tersedia": "bk_off"
});

const BK_PKGS = ["BEM", "SEM", "LEM"];
const bkTierOf = n => n >= 1 && n <= 5 ? 1 : n <= 10 ? 2 : n <= 50 ? 3 : n <= 100 ? 4 : 0;

async function openBulkOrderModal() {
    const { data: info, error: ie } = await cuRpc("cu_bulk_info");
    if (ie || !info) { showToast(/does not exist|schema cache|Could not find the function/i.test((ie && ie.message) || "") ? t("rn_err_not_ready") : t("rn_err_generic"), "danger"); return; }
    if (info.avail === false) { showToast(t("bk_off"), "danger"); return; }
    const price = (tier, pkg) => Number(((info.tiers || []).find(x => x.tier === tier) || {})[pkg] || 0);

    $("modalBox").innerHTML = `
        <div class="rn-head"><div class="rn-icon">🧺</div>
            <div><div class="modal-title" style="margin:0">${escapeHtml(t("bk_title"))}</div><div class="rn-sub">${escapeHtml(t("bk_sub"))}</div></div></div>
        ${BK_PKGS.map(p => `<div class="rn-block"><label class="rn-label" for="bk${p}">${p} <span class="no-count" id="bkC${p}"></span></label>
            <textarea id="bk${p}" class="no-area" rows="3" placeholder="#tagar1&#10;#tagar2" autocomplete="off"></textarea></div>`).join("")}
        <div class="rn-hint" style="margin-top:-6px;margin-bottom:10px;">${escapeHtml(t("bk_tags_hint"))}</div>
        <div class="rn-block"><label class="rn-label" for="bkNote">${escapeHtml(t("bk_note"))}</label><textarea id="bkNote" class="no-area" rows="2" maxlength="500"></textarea></div>
        <div class="rn-block price-box"><div class="rn-label">💰 ${escapeHtml(t("bk_total"))}</div><div class="price-lines" id="bkLines"></div></div>
        <details class="rn-block"><summary class="rn-label" style="cursor:pointer;">${escapeHtml(t("bk_tiers"))}</summary>
            <div class="price-lines" id="bkTiers" style="margin-top:6px;"></div></details>
        <div class="rn-info">ℹ️ ${escapeHtml(t("bo_info"))}</div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" id="bkNo">${escapeHtml(t("rn_cancel"))}</button><button type="button" class="btn btn-gold" id="bkYes">${escapeHtml(t("bk_send"))}</button></div>`;
    $("modalOverlay").classList.add("show");

    const read = () => { const o = {}; BK_PKGS.forEach(p => { o[p] = parseTags($("bk" + p).value); }); return o; };
    const calc = () => {
        const L = read(), n = BK_PKGS.reduce((a, p) => a + L[p].length, 0), tier = bkTierOf(n);
        let total = 0, unset = false; const rows = [];
        BK_PKGS.forEach(p => { if (!L[p].length) return; const pr = tier ? price(tier, p) : 0; if (!pr) unset = true; total += pr * L[p].length; rows.push([p, L[p].length, pr]); });
        return { L, n, tier, total, unset, rows };
    };
    const sync = () => {
        const c = calc();
        BK_PKGS.forEach(p => { $("bkC" + p).textContent = c.L[p].length ? "· " + t("bo_tags_n", { n: c.L[p].length }) : ""; });
        let html;
        if (!c.n) html = `<div class="price-none">${escapeHtml(t("bk_none"))}</div>`;
        else if (c.n > info.max) html = `<div class="price-none">${escapeHtml(t("bk_err_max"))}</div>`;
        else html = `<div class="price-row sub"><span>${escapeHtml(t("bk_total_tags"))}</span><span>${c.n} · ${escapeHtml(t("bk_tier"))} ${escapeHtml(t("bk_tag_range", { a: [0, 1, 6, 11, 51][c.tier], b: [0, 5, 10, 50, 100][c.tier] }))}</span></div>`
            + c.rows.map(([p, k, pr]) => `<div class="price-row sub"><span>${escapeHtml(t("bk_line", { pkg: p, n: k, p: pr ? fmtRp(pr) : "-" }))}</span><span>${pr ? fmtRp(pr * k) : "-"}</span></div>`).join("")
            + (c.unset ? `<div class="price-none">${escapeHtml(t("bk_unset"))}</div>` : `<div class="price-row total"><span>${escapeHtml(t("bk_total"))}</span><b>${fmtRp(c.total)}</b></div>`);
        $("bkLines").innerHTML = html;
        $("bkTiers").innerHTML = (info.tiers || []).map(x => `<div class="price-row sub${c.tier === x.tier ? " total" : ""}"><span>${escapeHtml(t("bk_tag_range", { a: x.min, b: x.max }))}</span><span>${BK_PKGS.map(p => p + " " + (Number(x[p]) ? fmtRp(x[p]) : "-")).join(" · ")}</span></div>`).join("");
    };
    BK_PKGS.forEach(p => $("bk" + p).addEventListener("input", sync));
    $("bkNo").addEventListener("click", closeModal);
    sync();

    $("bkYes").addEventListener("click", async () => {
        const c = calc();
        if (!c.n) { showToast(t("bk_err_empty"), "danger"); return; }
        if (c.n > info.max) { showToast(t("bk_err_max"), "danger"); return; }
        if (c.unset || c.total <= 0) { showToast(t("bk_err_price"), "danger"); return; }
        const note = $("bkNote").value.trim();
        if (!(await payStep({ pkg: "BEM", jumlah: c.n, total: c.total,
            lines: [[t("bk_label"), t("bo_tags_n", { n: c.n })], ...c.rows.map(([p, k, pr]) => [p, `${k} × ${fmtRp(pr)}`])],
            waText: (tot) => t("bk_wa_text", { n: c.n, total: tot }) }))) return;
        const btn = $("bkYes"); btn.disabled = true; btn.textContent = t("bo_sending");
        const { data, error } = await cuRpc("cu_request_bulk_order", { p_bem: c.L.BEM, p_sem: c.L.SEM, p_lem: c.L.LEM, p_catatan: note || null });
        if (error) {
            btn.disabled = false; btn.textContent = t("bk_send");
            const m = error.message || "";
            showToast(/does not exist|schema cache|Could not find the function/i.test(m) ? t("rn_err_not_ready") : (translateServerError(m) || t("rn_err_generic")), "danger");
            return;
        }
        if (typeof loadBotOrders === "function") loadBotOrders(); if (typeof loadCoin === "function") loadCoin();
        $("modalBox").innerHTML = `<div class="modal-icon success">🧺</div><div class="modal-title">${escapeHtml(t("bk_sent_title"))}</div>
            <div class="modal-sub">${escapeHtml(t("bk_sent_text", { n: data.jumlah, total: fmtRp(data.total) }))}</div>
            <div class="modal-actions"><button type="button" class="btn btn-primary" id="bkDone">${escapeHtml(t("bo_close"))}</button></div>`;
        $("bkDone").addEventListener("click", closeModal);
    });
}
document.addEventListener("click", (e) => { if (e.target.closest("[data-bulk-order]")) openBulkOrderModal(); });
