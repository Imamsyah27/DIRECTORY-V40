/**
 * Pesan BOT ORDER (BEM / SEM / LEM Bot) — pelanggan. Butuh sql/bot-order.sql.
 * Harga per tagar diatur admin (Price). Banyak tagar dalam 1 pesanan = 1 pesanan.
 * Alur: isi tagar -> pembayaran (QRIS/Binance/DANA/PayPal) -> OK -> antrian admin -> disetujui.
 */
Object.assign(TRANSLATIONS.id, {
    bo_btn: "Pesan Bot Order", bo_title: "Pesan Bot Order", bo_sub: "Pilih paket bot dan masukkan tagar. Harga dihitung per tagar.",
    bo_pkg: "Paket Bot", bo_per_tag: "/tagar", bo_tags_label: "Tagar (boleh banyak)", bo_tags_hint: "Satu tagar per baris atau pisahkan dengan koma. Tagar kembar otomatis diabaikan.",
    bo_tag_ph: "#tagar1\n#tagar2\n#tagar3", bo_note_label: "Catatan untuk admin (opsional)", bo_price_title: "Harga", bo_calc: "{n} tagar × {p}", bo_total: "Total",
    bo_unset: "Harga bot order belum diatur admin.", bo_send: "Lanjut ke Pembayaran", bo_sending: "Mengirim…",
    bo_info: "Setelah pembayaran dikonfirmasi, pesanan Anda berstatus Menunggu Konfirmasi sampai admin memprosesnya.",
    bo_sent_title: "Bot Order Terkirim", bo_sent_text: "Pesanan {n} tagar ({pkg}) sebesar {total} sudah masuk antrian admin.", bo_close: "Tutup",
    bo_err_tag: "Isi minimal 1 tagar", bo_err_max: "Maksimal 500 tagar per pesanan", bo_err_price: "Harga Bot Order belum diatur admin",
    bo_list_title: "Bot Order Saya", bo_st_pending: "⏳ Menunggu konfirmasi", bo_st_approved: "✅ Disetujui", bo_st_rejected: "✖ Ditolak", bo_tags_n: "{n} tagar",
    bo_wa_text: "Halo Admin, saya sudah membayar Bot Order {pkg} ({n} tagar) sebesar {total}. Berikut bukti pembayarannya:"
});
Object.assign(TRANSLATIONS.en, {
    bo_btn: "Order Bot", bo_title: "Order Bot", bo_sub: "Choose a bot package and enter your tags. Priced per tag.",
    bo_pkg: "Bot Package", bo_per_tag: "/tag", bo_tags_label: "Tags (as many as you like)", bo_tags_hint: "One tag per line or separate with commas. Duplicate tags are ignored.",
    bo_tag_ph: "#tag1\n#tag2\n#tag3", bo_note_label: "Note for admin (optional)", bo_price_title: "Price", bo_calc: "{n} tags × {p}", bo_total: "Total",
    bo_unset: "Bot order price has not been set by the admin.", bo_send: "Continue to Payment", bo_sending: "Sending…",
    bo_info: "After your payment is confirmed, your order is marked Awaiting Confirmation until the admin processes it.",
    bo_sent_title: "Bot Order Sent", bo_sent_text: "Your order of {n} tags ({pkg}) totaling {total} is now in the admin queue.", bo_close: "Close",
    bo_err_tag: "Enter at least 1 tag", bo_err_max: "Maximum 500 tags per order", bo_err_price: "Bot order price has not been set by the admin",
    bo_list_title: "My Bot Orders", bo_st_pending: "⏳ Awaiting confirmation", bo_st_approved: "✅ Approved", bo_st_rejected: "✖ Rejected", bo_tags_n: "{n} tags",
    bo_wa_text: "Hello Admin, I have paid for Bot Order {pkg} ({n} tags), total {total}. Here is my payment proof:"
});
Object.assign(TRANSLATIONS.id, {
    bo_tab: "Bot Order", bo_list_empty: "Belum ada bot order.", bo_f_active: "Aktif", bo_f_archive: "Arsip",
    bo_st_kirim: "📮 Disetujui — sedang diproses", bo_st_sent: "✅ Sudah dikirim", bo_sent_on: "Dikirim {d}", bo_arch_tag: "Arsip"
});
Object.assign(TRANSLATIONS.en, {
    bo_tab: "Bot Orders", bo_list_empty: "No bot orders yet.", bo_f_active: "Active", bo_f_archive: "Archive",
    bo_st_kirim: "📮 Approved — being processed", bo_st_sent: "✅ Delivered", bo_sent_on: "Delivered {d}", bo_arch_tag: "Archived"
});
Object.assign(TRANSLATIONS.id, { bo_kind_bot: "Bot" });
Object.assign(TRANSLATIONS.en, { bo_kind_bot: "Bot" });
Object.assign(TRANSLATIONS.id, {
    bo_tags_view: "Lihat daftar tagar", bo_tags_loading: "Memuat daftar tagar…", bo_tags_copy: "Salin semua tagar", bo_tags_copied_toast: "Daftar tagar disalin", bo_tags_err: "Gagal memuat daftar tagar"
});
Object.assign(TRANSLATIONS.en, {
    bo_tags_view: "View tag list", bo_tags_loading: "Loading tag list…", bo_tags_copy: "Copy all tags", bo_tags_copied_toast: "Tag list copied", bo_tags_err: "Failed to load the tag list"
});
Object.assign(SERVER_ERROR_MAP, {
    "Harga Bot Order belum diatur admin": "bo_err_price", "Maksimal 500 tagar per pesanan": "bo_err_max", "Tagar wajib diisi": "bo_err_tag"
});

const BO_PKGS = ["BEM", "SEM", "LEM"];
const boPrice = (pkg) => Number((cuPriceInfo && cuPriceInfo.bot && cuPriceInfo.bot[pkg]) || 0);

async function openBotOrderModal() {
    cuPriceInfo = null; await ensurePriceInfo();      // harga terbaru
    const st = { pkg: BO_PKGS.find(p => boPrice(p) > 0 && pkgAvail(p, true)) || BO_PKGS.find(p => boPrice(p) > 0) || "BEM" };
    $("modalBox").innerHTML = `
        <div class="rn-head"><div class="rn-icon">🤖</div>
            <div><div class="modal-title" style="margin:0">${escapeHtml(t("bo_title"))}</div><div class="rn-sub">${escapeHtml(t("bo_sub"))}</div></div></div>
        <div class="rn-block"><div class="rn-label">${escapeHtml(t("bo_pkg"))}</div>
            <div class="rn-pkgs" id="boPkgs">${BO_PKGS.map(p => `<button type="button" class="rn-pkg" data-pkg="${p}"><b>${p} Bot</b><small class="rn-pkg-price">${boPrice(p) ? "<b>" + fmtRp(boPrice(p)) + "</b>" + escapeHtml(t("bo_per_tag")) : "-"}</small></button>`).join("")}</div></div>
        <div class="rn-block"><label class="rn-label" for="boTags">${escapeHtml(t("bo_tags_label"))} <span class="no-count" id="boCount"></span></label>
            <textarea id="boTags" class="no-area" rows="5" placeholder="${escapeHtml(t("bo_tag_ph"))}" autocomplete="off"></textarea>
            <div class="rn-hint">${escapeHtml(t("bo_tags_hint"))}</div></div>
        <div class="rn-block"><label class="rn-label" for="boNote">${escapeHtml(t("bo_note_label"))}</label><textarea id="boNote" class="no-area" rows="2" maxlength="500"></textarea></div>
        <div class="rn-block price-box"><div class="rn-label">💰 ${escapeHtml(t("bo_price_title"))}</div><div class="price-lines" id="boPriceLines"></div></div>
        <div class="rn-info">ℹ️ ${escapeHtml(t("bo_info"))}</div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" id="boNo">${escapeHtml(t("rn_cancel"))}</button><button type="button" class="btn btn-gold" id="boYes">${escapeHtml(t("bo_send"))}</button></div>`;
    $("modalOverlay").classList.add("show");

    const sync = () => {
        $("boPkgs").querySelectorAll(".rn-pkg").forEach(c => c.classList.toggle("on", c.dataset.pkg === st.pkg));
        const n = parseTags($("boTags").value).length, p = boPrice(st.pkg);
        $("boCount").textContent = n ? "· " + t("bo_tags_n", { n }) : "";
        $("boPriceLines").innerHTML = !p ? `<div class="price-none">${escapeHtml(t("bo_unset"))}</div>`
            : `<div class="price-row sub"><span>${escapeHtml(t("bo_calc", { n: n || 0, p: fmtRp(p) }))}</span><span>${fmtRp(p * n)}</span></div>
               <div class="price-row total"><span>${escapeHtml(t("bo_total"))}</span><b>${fmtRp(p * n)}</b></div>${priceExtraHtml(p * n)}`;
    };
    markPkgAvail($("boPkgs"), true);
    $("boPkgs").addEventListener("click", e => { const c = e.target.closest(".rn-pkg"); if (c && !c.disabled) { st.pkg = c.dataset.pkg; sync(); } });
    $("boTags").addEventListener("input", sync);
    $("boNo").addEventListener("click", closeModal);
    sync();

    $("boYes").addEventListener("click", async () => {
        const tags = parseTags($("boTags").value), note = $("boNote").value.trim(), p = boPrice(st.pkg);
        if (!p) { showToast(t("bo_err_price"), "danger"); return; }
        if (!pkgAvail(st.pkg, true)) { showToast(t("av_err_bot"), "danger"); return; }
        if (!tags.length) { showToast(t("bo_err_tag"), "danger"); $("boTags").focus(); return; }
        if (tags.length > 500) { showToast(t("bo_err_max"), "danger"); return; }
        const total = p * tags.length;

        if (!(await payStep({ pkg: st.pkg, jumlah: tags.length, total,
            waText: (tot) => t("bo_wa_text", { pkg: st.pkg + " Bot", n: tags.length, total: tot }) }))) return;

        const btn = $("boYes"); btn.disabled = true; btn.textContent = t("bo_sending");
        const { data, error } = await cuRpc("cu_request_bot_order", { p_dashboard: st.pkg, p_tagar_list: tags, p_catatan: note || null });
        if (error) {
            btn.disabled = false; btn.textContent = t("bo_send");
            const m = error.message || "";
            showToast(/does not exist|schema cache|Could not find the function/i.test(m) ? t("rn_err_not_ready") : (translateServerError(m) || t("rn_err_generic")), "danger");
            return;
        }
        loadBotOrders(); if (typeof loadCoin === "function") loadCoin();
        $("modalBox").innerHTML = `<div class="modal-icon success">🤖</div><div class="modal-title">${escapeHtml(t("bo_sent_title"))}</div>
            <div class="modal-sub">${escapeHtml(t("bo_sent_text", { n: data.jumlah, pkg: st.pkg + " Bot", total: fmtRp(data.total) }))}</div>
            <div class="modal-actions"><button type="button" class="btn btn-primary" id="boDone">${escapeHtml(t("bo_close"))}</button></div>`;
        $("boDone").addEventListener("click", closeModal);
    });
}

/* ---------------- Daftar bot order pelanggan (tab "Bot Order") ---------------- */
let myBotOrders = [], botFilter = "aktif", botKind = "all";   // botKind: all | bot | bulk (dipisah supaya tidak tertukar)
const botTagOpen = new Set(), botTagCache = {};   // daftar tagar lengkap dimuat hanya saat dibuka (seperti di dashboard admin)
const botFlat = d => Array.isArray(d) ? d : [...(d.bem || []), ...(d.sem || []), ...(d.lem || [])];
const botState = r => r.status === "approved" ? (r.dikirim_at ? "sent" : "kirim") : r.status;

async function loadBotOrders() {
    if (!$("botOrderList")) return;
    const { data, error } = await cuRpc("cu_my_bot_orders");
    myBotOrders = (!error && data) ? data : [];
    renderBotOrders();
}
function renderBotOrders() {
    const box = $("botOrderList"); if (!box) return;
    const loc = numLocale();
    const fmt = (iso, withTime) => new Date(iso).toLocaleString(loc, withTime ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "short" });
    const kindOk = r => botKind === "all" || (botKind === "bulk") === (r.dashboard === "BULK");
    document.querySelectorAll("#botKind button").forEach(b => b.classList.toggle("on", b.dataset.bk === botKind));
    const match = (r, f) => kindOk(r) && (f === "all" ? true : f === "arsip" ? !!r.arsip : !r.arsip);
    document.querySelectorAll("#botFilter button").forEach(b => { b.classList.toggle("on", b.dataset.bf === botFilter); b.querySelector("i").textContent = myBotOrders.filter(r => match(r, b.dataset.bf)).length; });

    // badge tab: pesanan yang masih berjalan (menunggu / disetujui belum dikirim)
    const open = myBotOrders.filter(r => !r.arsip && (r.status === "pending" || botState(r) === "kirim")).length, bd = $("botTabBadge");
    if (bd) { bd.textContent = open; bd.style.display = open ? "inline-block" : "none"; }

    const list = myBotOrders.filter(r => match(r, botFilter));
    $("botEmpty").style.display = list.length ? "none" : "block";
    const stl = { pending: "bo_st_pending", kirim: "bo_st_kirim", sent: "bo_st_sent", rejected: "bo_st_rejected" };
    box.innerHTML = list.map(r => { const k = botState(r), open = botTagOpen.has(r.id); return `
        <div class="bo-item bo-s-${k}"><div><b>${r.dashboard === "BULK" ? "🧺 " + escapeHtml(t("bk_label")) : escapeHtml(r.dashboard) + " Bot"}</b> · <button type="button" class="bo-count" data-botags="${r.id}" aria-expanded="${open}" title="${escapeHtml(t("bo_tags_view"))}">${open ? "▾" : "▸"} ${escapeHtml(t("bo_tags_n", { n: r.jumlah }))}</button>${r.arsip ? ` <span class="bo-arch">🗂️ ${escapeHtml(t("bo_arch_tag"))}</span>` : ""}
            <div class="bo-item-sub">${r.dashboard === "BULK" ? `BEM ${r.n_bem} · SEM ${r.n_sem} · LEM ${r.n_lem}` : escapeHtml(r.tagar_pertama || "") + (r.jumlah > 1 ? " …" : "")} · ${fmt(r.created_at, false)}</div>
            ${r.dikirim_at ? `<div class="bo-item-sub">${escapeHtml(t("bo_sent_on", { d: fmt(r.dikirim_at, true) }))}</div>` : ""}
            ${r.catatan_admin ? `<div class="bo-item-sub">💬 ${escapeHtml(r.catatan_admin)}</div>` : ""}</div>
            <div style="text-align:right;"><b>${fmtRp(r.total_harga)}</b><div class="bo-item-sub bo-st">${escapeHtml(t(stl[k] || "bo_st_pending"))}</div></div></div>${open ? botTagsPanel(r) : ""}`; }).join("");
}
function botTagsPanel(r) {
    const d = botTagCache[r.id];
    if (!d) return `<div class="bo-tags-panel"><div class="bo-item-sub">${escapeHtml(t("bo_tags_loading"))}</div></div>`;
    const copyBtn = part => `<button type="button" class="btn btn-ghost mini" data-botcopy="${r.id}" data-part="${part}">📋 ${escapeHtml(t("bo_tags_copy"))}</button>`;
    if (Array.isArray(d)) return `<div class="bo-tags-panel"><div class="bo-tags-head"><b>${escapeHtml(t("bo_tags_n", { n: d.length }))}</b> ${copyBtn("all")}</div>
        <ol class="bo-tags">${d.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ol></div>`;
    const part = (k, name) => (d[k] || []).length ? `<div class="bo-bulk-part"><div class="bo-tags-head"><b>${name} · ${escapeHtml(t("bo_tags_n", { n: d[k].length }))}</b></div><ol class="bo-tags">${d[k].map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ol></div>` : "";
    return `<div class="bo-tags-panel"><div class="bo-tags-head"><b>${escapeHtml(t("bo_tags_n", { n: botFlat(d).length }))}</b> ${copyBtn("all")}</div>${part("bem", "BEM")}${part("sem", "SEM")}${part("lem", "LEM")}</div>`;
}
/* klik "N tagar" -> buka/tutup daftar tagar pesanan ini; tombol salin menyalin semuanya */
document.addEventListener("click", async (e) => {
    const c = e.target.closest("[data-botcopy]");
    if (c) { const d = botTagCache[Number(c.dataset.botcopy)]; if (d) _payCopy(botFlat(d).join("\n"), c); return; }
    const b = e.target.closest("[data-botags]"); if (!b) return;
    const id = Number(b.dataset.botags);
    if (botTagOpen.has(id)) { botTagOpen.delete(id); renderBotOrders(); return; }
    botTagOpen.add(id); renderBotOrders();
    if (!botTagCache[id]) {
        const { data, error } = await cuRpc("cu_bot_tags", { p_id: id });
        if (error || !data) {
            botTagOpen.delete(id); renderBotOrders();
            const m = (error && error.message) || "";
            showToast(/does not exist|schema cache|Could not find the function/i.test(m) ? t("rn_err_not_ready") : t("bo_tags_err"), "danger");
            return;
        }
        botTagCache[id] = data; renderBotOrders();
    }
});
document.addEventListener("click", (e) => { const k = e.target.closest("#botKind button[data-bk]"); if (k) { botKind = k.dataset.bk; renderBotOrders(); } });
document.addEventListener("click", (e) => { const f = e.target.closest("#botFilter button[data-bf]"); if (f) { botFilter = f.dataset.bf; renderBotOrders(); } });
document.addEventListener("click", (e) => { if (e.target.closest("[data-bot-order]")) openBotOrderModal(); });
document.addEventListener("DOMContentLoaded", () => { loadBotOrders(); setInterval(() => { if (!document.hidden) loadBotOrders(); }, 60000); });
document.addEventListener("langchange", renderBotOrders);
