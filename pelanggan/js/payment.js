/**
 * Portal pelanggan — (1) langkah PEMBAYARAN sebelum pesanan masuk antrian, (2) DAFTAR HARGA (harian + bot).
 * Data metode bayar diisi admin di Price (sql/fast-payment-arsip.sql).
 */
Object.assign(TRANSLATIONS.id, {
    pay_title: "Pembayaran", pay_sub: "Bayar sesuai total, lalu kirim bukti pembayaran ke chat admin. Setelah itu tekan OK agar pesanan masuk antrian.",
    pay_total: "Total bayar", pay_qris: "QRIS", pay_binance: "Binance Pay ID", pay_dana: "DANA", pay_paypal: "PayPal",
    pay_paypal_ff: "WAJIB kirim lewat Family & Friends (bukan Goods & Services).", pay_copy: "Salin", pay_copied: "Tersalin",
    pay_proof_btn: "Kirim bukti bayar ke Admin", pay_ok: "OK, saya sudah bayar & kirim bukti", pay_back: "Kembali",
    pay_warn: "Pesanan baru diproses admin setelah bukti pembayaran diterima.",
    pay_wa_text: "Halo Admin, saya sudah membayar pesanan {pkg} {hari} hari ({n} tagar) sebesar {total}. Berikut bukti pembayarannya:",
    pl_title: "Daftar Harga", pl_daily: "Langganan Harian", pl_daily_sub: "harga per hari per tagar", pl_bot: "Bot Order", pl_bot_sub: "harga per tagar",
    pl_fast: "⚡ Pesanan 1 hari otomatis masuk Fast Order (langsung diarsipkan setelah dikirim).", pl_bot_ask: "Belum tersedia.",
    arc_notice: "{n} tagar Anda telah diarsipkan", arc_notice_more: "+{n} lainnya", arc_notice_btn: "Lihat Arsip",
    arc_notice_sub: "Langganan yang sudah mencapai limit dipindahkan ke menu Arsip."
});
Object.assign(TRANSLATIONS.en, {
    pay_title: "Payment", pay_sub: "Pay the total, then send the payment proof to the admin chat. After that press OK so your order enters the queue.",
    pay_total: "Total to pay", pay_qris: "QRIS", pay_binance: "Binance Pay ID", pay_dana: "DANA", pay_paypal: "PayPal",
    pay_paypal_ff: "MUST be sent as Family & Friends (not Goods & Services).", pay_copy: "Copy", pay_copied: "Copied",
    pay_proof_btn: "Send payment proof to Admin", pay_ok: "OK, I have paid & sent the proof", pay_back: "Back",
    pay_warn: "Your order is processed by the admin once the payment proof is received.",
    pay_wa_text: "Hello Admin, I have paid for my order {pkg} {hari} days ({n} tags), total {total}. Here is my payment proof:",
    pl_title: "Price List", pl_daily: "Daily Subscription", pl_daily_sub: "price per day per tag", pl_bot: "Bot Order", pl_bot_sub: "price per tag",
    pl_fast: "⚡ 1-day orders go to Fast Order (archived right after delivery).", pl_bot_ask: "Not available yet.",
    arc_notice: "{n} of your tags have been archived", arc_notice_more: "+{n} more", arc_notice_btn: "View Archive",
    arc_notice_sub: "Subscriptions that reached their limit are moved to the Archive menu."
});

/* ---------------- Langkah pembayaran ---------------- */
Object.assign(TRANSLATIONS.id, {
    coin_pay_title: "Bayar dengan Koin", coin_pay_sub: "Total pesanan dipotong dari saldo koin Anda (1 koin = Rp 1).",
    coin_total: "Total", coin_balance: "Saldo koin", coin_after: "Sisa saldo", coin_missing: "Kekurangan",
    coin_pay_btn: "Bayar {n} Koin & Kirim Pesanan", coin_short_msg: "Saldo koin tidak cukup. Top up dulu lewat admin, lalu pesan lagi.", coin_topup_btn: "Top Up Koin", coin_back: "Kembali",
    coin_refund_note: "Jika pesanan ditolak admin atau Anda batalkan sebelum diproses, koin dikembalikan."
});
Object.assign(TRANSLATIONS.en, {
    coin_pay_title: "Pay with Coins", coin_pay_sub: "The order total is deducted from your coin balance (1 coin = Rp 1).",
    coin_total: "Total", coin_balance: "Coin balance", coin_after: "Remaining balance", coin_missing: "Shortfall",
    coin_pay_btn: "Pay {n} Coins & Send Order", coin_short_msg: "Not enough coins. Please top up via the admin, then order again.", coin_topup_btn: "Top Up Coins", coin_back: "Back",
    coin_refund_note: "If the admin rejects your order or you cancel it before it is processed, the coins are refunded."
});

function _payCopy(text, btn) {
    const done = () => { const o = btn.textContent; btn.textContent = "✓ " + t("pay_copied"); setTimeout(() => btn.textContent = o, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
    else { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done(); }
}
/** Daftar metode bayar dari admin (QRIS, Binance, DANA, PayPal F&F). */
function payMethodsHtml(p) {
    const row = (label, value, extra) => value ? `<div class="pay-row"><div><div class="pay-label">${escapeHtml(label)}</div><div class="pay-val">${escapeHtml(value)}</div>${extra || ""}</div>
        <button type="button" class="btn btn-ghost mini" data-copy="${escapeHtml(value)}">${escapeHtml(t("pay_copy"))}</button></div>` : "";
    return `${p.qris_data ? `<div class="pay-qris"><div class="pay-label">${escapeHtml(t("pay_qris"))}</div><img src="data:${p.qris_mime};base64,${p.qris_data}" alt="QRIS"></div>` : ""}
        ${row(t("pay_binance"), p.binance_id)}
        ${row(t("pay_dana"), p.dana_number, p.dana_name ? `<div class="pay-note">a.n. ${escapeHtml(p.dana_name)}</div>` : "")}
        ${row(t("pay_paypal"), p.paypal, `<div class="pay-note warn">⚠️ ${escapeHtml(t("pay_paypal_ff"))}</div>`)}`;
}
function payBindCopy(root) { root.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => _payCopy(b.dataset.copy, b))); }

async function _payTotal({ pkg, hari, jumlah, kode, total }) {
    if (total != null) return total;
    const q = await cuRpc("cu_price_quote", { p_dashboard: pkg, p_hari: hari, p_jumlah: Math.max(1, jumlah || 1), p_kode: kode || null });
    return q.data && q.data.total > 0 ? q.data.total : 0;
}

/**
 * Pembayaran sebelum pesanan dikirim. Mengembalikan Promise<boolean>: true = lanjut kirim pesanan.
 * - Sistem koin aktif (sql/koin-usdt-1…7 (7 bagian)): bayar dengan koin. Saldo kurang = tidak bisa memesan,
 *   pelanggan diarahkan Top Up lewat admin. Koin dipotong otomatis di server saat pesanan dibuat.
 * - Sistem koin belum dipasang: alur lama (QRIS / Binance / DANA / PayPal + kirim bukti).
 */
async function payStep(opts) {
    const coin = typeof loadCoin === "function" ? await loadCoin() : null;
    if (!coin) return legacyPayStep(opts);
    const total = await _payTotal(opts);
    if (total <= 0) return true;
    return coinPayOverlay(total, Number(coin.koin) || 0, opts);
}

/* opts (opsional): lines = [[label, nilai], ...] baris rincian di atas Total, note = catatan tambahan, payBtnKey = kunci teks tombol bayar */
function coinPayOverlay(total, saldo, opts) {
    opts = opts || {};
    return new Promise(resolve => {
        const ov = document.createElement("div"); ov.className = "pay-overlay";
        const enough = saldo >= total, num = n => Number(n).toLocaleString(numLocale());
        const extra = (opts.lines || []).map(([k, v]) => `<div class="coin-line"><span>${escapeHtml(k)}</span><b>${escapeHtml(v)}</b></div>`).join("");
        ov.innerHTML = `<div class="pay-box" role="dialog" aria-modal="true">
            <div class="modal-title">🪙 ${escapeHtml(t("coin_pay_title"))}</div>
            <div class="modal-sub">${escapeHtml(t("coin_pay_sub"))}</div>
            <div class="coin-lines">
                ${extra}
                <div class="coin-line"><span>${escapeHtml(t("coin_total"))}</span><b>🪙 ${num(total)}${cuCoinUsd(total) ? `<small class="coin-usd">${escapeHtml(cuCoinUsd(total))}</small>` : ""}</b></div>
                <div class="coin-line"><span>${escapeHtml(t("coin_balance"))}</span><b>🪙 ${num(saldo)}${cuCoinUsd(saldo) ? `<small class="coin-usd">${escapeHtml(cuCoinUsd(saldo))}</small>` : ""}</b></div>
                <div class="coin-line ${enough ? "ok" : "bad"}"><span>${escapeHtml(t(enough ? "coin_after" : "coin_missing"))}</span><b>🪙 ${num(Math.abs(saldo - total))}</b></div>
            </div>
            ${enough ? `${opts.note ? `<div class="pay-warn pay-note-info">${escapeHtml(opts.note)}</div>` : `<div class="pay-warn">ℹ️ ${escapeHtml(t("coin_refund_note"))}</div>`}
                <button type="button" class="btn btn-primary btn-block" id="coinOk">✅ ${escapeHtml(t(opts.payBtnKey || "coin_pay_btn", { n: num(total) }))}</button>`
                : `<div class="pay-warn bad">⚠️ ${escapeHtml(t("coin_short_msg"))}</div>
                <button type="button" class="btn btn-primary btn-block" id="coinTopup">🪙 ${escapeHtml(t("coin_topup_btn"))}</button>`}
            <button type="button" class="btn btn-ghost btn-block" id="coinBack" style="margin-top:8px;">${escapeHtml(t("coin_back"))}</button></div>`;
        document.body.appendChild(ov);
        const close = v => { ov.remove(); resolve(v); };
        if (enough) ov.querySelector("#coinOk").addEventListener("click", () => close(true));
        else ov.querySelector("#coinTopup").addEventListener("click", () => openTopupModal(total - saldo));
        ov.querySelector("#coinBack").addEventListener("click", () => close(false));
    });
}

/* Alur lama (tanpa koin): metode bayar + kirim bukti ke admin */
async function legacyPayStep({ pkg, hari, jumlah, kode, total: totalOverride, waText }) {
    const n = Math.max(1, jumlah || 1);
    const [info, total] = await Promise.all([cuRpc("cu_payment_info"), _payTotal({ pkg, hari, jumlah: n, kode, total: totalOverride })]);
    const p = info.data;
    if (info.error || !p || !p.configured) return true;

    return new Promise(resolve => {
        const ov = document.createElement("div");
        ov.className = "pay-overlay";
        const wa = waProof(waText ? waText(total ? fmtRp(total) : "-") : t("pay_wa_text", { pkg, hari, n, total: total ? fmtRp(total) : "-" }));
        const usdt = "";
        ov.innerHTML = `<div class="pay-box" role="dialog" aria-modal="true">
            <div class="modal-title">💳 ${escapeHtml(t("pay_title"))}</div>
            <div class="modal-sub">${escapeHtml(t("pay_sub"))}</div>
            ${total ? `<div class="pay-total"><span>${escapeHtml(t("pay_total"))}</span><b>${escapeHtml(fmtRp(total))}${usdt ? `<small class="pay-usdt">≈ ${escapeHtml(usdt)}</small>` : ""}</b></div>` : ""}
            ${payMethodsHtml(p)}
            <div class="pay-warn">📲 ${escapeHtml(t("pay_warn"))}</div>
            <a class="btn btn-wa btn-block" href="${wa}" target="_blank" rel="noopener">💬 ${escapeHtml(t("pay_proof_btn"))}</a>
            <button type="button" class="btn btn-primary btn-block" id="payOk" style="margin-top:8px;">✅ ${escapeHtml(t("pay_ok"))}</button>
            <button type="button" class="btn btn-ghost btn-block" id="payBack" style="margin-top:8px;">${escapeHtml(t("pay_back"))}</button>
        </div>`;
        document.body.appendChild(ov);
        const close = (v) => { ov.remove(); resolve(v); };
        payBindCopy(ov);
        ov.querySelector("#payOk").addEventListener("click", () => close(true));
        ov.querySelector("#payBack").addEventListener("click", () => close(false));
    });
}

/* ---------------- Daftar harga (harian + bot) ---------------- */
function renderPriceList() {
    const box = $("priceList"); if (!box) return;
    const i = cuPriceInfo;
    if (!i) { box.innerHTML = ""; return; }
    const daily = ["BEM", "SEM", "LEM"].map(k => {
        const x = i[k]; if (!x || !x.normal) return "";
        const price = (x.final < x.normal ? `<s>${fmtRp(x.normal)}</s> <b>${fmtRp(x.final)}</b>` : `<b>${fmtRp(x.final)}</b>`) + (cuUsdtPrice(k) ? `<small class="pl-usdt">≈ ${escapeHtml(cuUsdtPrice(k))}</small>` : "");
        const off = !pkgAvail(k) ? `<span class="price-tag off">${escapeHtml(t("av_off"))}</span>` : "";
        const tag = x.jenis === "istimewa" ? `<span class="price-tag sp">${escapeHtml(t("price_special"))}</span>` : x.jenis === "diskon" ? `<span class="price-tag ds">${escapeHtml(t("price_discount"))} ${x.persen}%</span>` : "";
        return `<div class="pl-row"><span class="pl-name">${k}</span><span>${price} ${tag} ${off}</span></div>`;
    }).join("");
    const bot = i.bot ? ["BEM", "SEM", "LEM"].filter(k => i.bot[k] > 0).map(k => `<div class="pl-row"><span class="pl-name">${k} Bot</span><span>${i.bot_normal && i.bot_normal[k] > i.bot[k] ? `<s>${fmtRp(i.bot_normal[k])}</s> ` : ""}<b>${fmtRp(i.bot[k])}</b>${i.bot_normal && i.bot_normal[k] !== i.bot[k] ? ` <span class="price-tag sp">${escapeHtml(t("price_special"))}</span>` : ""}${!pkgAvail(k, true) ? `<span class="price-tag off">${escapeHtml(t("av_off"))}</span>` : ""}</span></div>`).join("") : "";
    if (!daily && !bot) { box.innerHTML = ""; return; }
    let folded = false; try { folded = localStorage.getItem("cu_price_fold") !== "0"; } catch (e) {}
    box.innerHTML = `<div class="panel pl-panel${folded ? " collapsed" : ""}" id="plPanel">
        <button type="button" class="fold-head" id="plFoldBtn" aria-expanded="${!folded}"><span>💰 ${escapeHtml(t("pl_title"))}</span><span class="fold-caret">▾</span></button>
        <div class="fold-body pl-body"><div class="pl-grid">
            <div class="pl-col"><div class="pl-head">${escapeHtml(t("pl_daily"))} <small>${escapeHtml(t("pl_daily_sub"))}</small></div>${daily || "<div class='pl-empty'>-</div>"}</div>
            <div class="pl-col"><div class="pl-head">${escapeHtml(t("pl_bot"))} <small>${escapeHtml(t("pl_bot_sub"))}</small></div>${bot || `<div class='pl-empty'>${escapeHtml(t("pl_bot_ask"))}</div>`}</div>
        </div>
        <div class="pl-note">${escapeHtml(t("pl_fast"))}</div>
        <div style="margin-top:10px;"><button type="button" class="btn btn-primary" data-bot-order>🤖 ${escapeHtml(t("bo_btn"))}</button></div></div></div>`;
    $("plFoldBtn").addEventListener("click", () => {
        const p = $("plPanel"), c = !p.classList.contains("collapsed");
        p.classList.toggle("collapsed", c); $("plFoldBtn").setAttribute("aria-expanded", String(!c));
        try { localStorage.setItem("cu_price_fold", c ? "1" : "0"); } catch (e) {}
    });
}
document.addEventListener("DOMContentLoaded", () => { ensurePriceInfo().then(renderPriceList); });
document.addEventListener("langchange", renderPriceList);

/* ---------------- Bar kurs IDR ≈ USDT (paling atas) ---------------- */
Object.assign(TRANSLATIONS.id, { rate_bar: "Kurs IDR ≈ USDT" });
Object.assign(TRANSLATIONS.en, { rate_bar: "IDR ≈ USDT rate" });
function renderRateBar() {
    const el = $("rateBar"); if (!el) return;
    const r = cuRate();
    el.innerHTML = r ? `<div class="rate-bar">💵 <b>${escapeHtml(t("rate_bar"))}</b> · 1 USDT ≈ <b>${escapeHtml(fmtRp(Math.round(r)))}</b></div>` : "";
}
document.addEventListener("DOMContentLoaded", () => { ensurePriceInfo().then(renderRateBar); setInterval(() => { if (!document.hidden) { cuPriceInfo = null; ensurePriceInfo().then(() => { renderRateBar(); renderPriceList(); }); } }, 120000); });
document.addEventListener("langchange", renderRateBar);
