/**
 * Saldo KOIN pelanggan (1 koin = Rp 1). Koin hanya diisi admin (top up lewat admin).
 * Dipakai untuk membayar pesanan BEM / SEM / LEM (langganan baru, perpanjang, bot order).
 * Butuh sql/koin-usdt-1…7 (7 bagian) — bila belum dijalankan, kotak koin tidak tampil dan alur bayar lama dipakai.
 */
Object.assign(TRANSLATIONS.id, {
    coin_title: "Saldo Koin", coin_topup: "Top Up", coin_hist: "Riwayat Koin", coin_hist_empty: "Belum ada riwayat koin.",
    coin_info: "1 koin = Rp 1. Koin dipakai untuk membayar pesanan BEM / SEM / LEM. Isi saldo hanya lewat admin.",
    coin_j_topup: "Top up", coin_j_koreksi: "Koreksi", coin_j_order: "Pesanan", coin_j_refund: "Pengembalian",
    coin_topup_title: "Top Up Koin", coin_topup_sub: "Top up hanya lewat admin: bayar ke salah satu metode di bawah, kirim bukti ke admin, lalu admin akan mengisi koin Anda.",
    coin_amount: "Jumlah koin yang ingin diisi", coin_eq: "= {rp}{usdt}", coin_topup_send: "Kirim bukti ke Admin (WhatsApp)", coin_topup_close: "Tutup",
    coin_topup_none: "Hubungi admin untuk top up koin.",
    coin_topup_wa: "Halo Admin, saya ingin top up {n} koin ({eq}). Akun: {u}. Berikut bukti pembayarannya:"
});
Object.assign(TRANSLATIONS.en, {
    coin_title: "Coin Balance", coin_topup: "Top Up", coin_hist: "Coin History", coin_hist_empty: "No coin history yet.",
    coin_info: "1 coin = Rp 1. Coins pay for BEM / SEM / LEM orders. Balance can only be topped up through the admin.",
    coin_j_topup: "Top up", coin_j_koreksi: "Correction", coin_j_order: "Order", coin_j_refund: "Refund",
    coin_topup_title: "Top Up Coins", coin_topup_sub: "Top up is done through the admin only: pay using one of the methods below, send the proof to the admin, and the admin will credit your coins.",
    coin_amount: "Coins you want to add", coin_eq: "= {rp}{usdt}", coin_topup_send: "Send proof to Admin (WhatsApp)", coin_topup_close: "Close",
    coin_topup_none: "Contact the admin to top up coins.",
    coin_topup_wa: "Hello Admin, I'd like to top up {n} coins ({eq}). Account: {u}. Here is my payment proof:"
});

Object.assign(TRANSLATIONS.id, {
    coin_topup_order: "Pesan Top Up", coin_topup_steps: "Cara: bayar ke salah satu metode di atas → kirim bukti ke admin → tekan Pesan Top Up. Setelah admin ACC, koin masuk otomatis ke akun Anda.",
    coin_topup_sent: "Top up {n} koin dipesan — menunggu ACC admin", coin_pending_line: "Top up {n} koin menunggu ACC admin", coin_cancel: "Batalkan", coin_cancelled: "Top up dibatalkan"
});
Object.assign(TRANSLATIONS.en, {
    coin_topup_order: "Order Top Up", coin_topup_steps: "Steps: pay with one of the methods above → send the proof to the admin → tap Order Top Up. Once the admin approves, the coins are added to your account automatically.",
    coin_topup_sent: "Top up of {n} coins ordered — awaiting admin approval", coin_pending_line: "Top up of {n} coins awaiting admin approval", coin_cancel: "Cancel", coin_cancelled: "Top up cancelled"
});
const coinNum = n => Number(n || 0).toLocaleString(numLocale());
let _coinHistOpen = false;

/** Muat saldo. Mengembalikan { koin, riwayat } atau null bila sistem koin belum dipasang. */
async function loadCoin() {
    const { data, error } = await cuRpc("cu_coin_info");
    if (error || !data) { cuCoin = null; renderCoinBox(); return null; }
    cuCoin = data; renderCoinBox();
    return cuCoin;
}

function renderCoinBox() {
    const box = $("coinBox"); if (!box) return;
    if (!cuCoin) { box.innerHTML = ""; return; }
    const hist = (cuCoin.riwayat || []);
    const loc = numLocale();
    box.innerHTML = `<div class="panel coin-panel">
        <div class="coin-top">
            <div><div class="coin-label">🪙 ${escapeHtml(t("coin_title"))}</div><div class="coin-amount">${coinNum(cuCoin.koin)}</div><div class="coin-sub">≈ ${escapeHtml(fmtRp(cuCoin.koin))}${cuCoinUsd(cuCoin.koin) ? " · " + escapeHtml(cuCoinUsd(cuCoin.koin)) : ""}</div></div>
            <button type="button" class="btn btn-primary" id="coinTopupBtn">➕ ${escapeHtml(t("coin_topup"))}</button>
        </div>
        ${(cuCoin.topup_pending || []).map(p => `<div class="coin-pending">⏳ ${escapeHtml(t("coin_pending_line", { n: coinNum(p.jumlah) }))} <button type="button" class="coin-cancel" data-cancel-topup="${p.id}">${escapeHtml(t("coin_cancel"))}</button></div>`).join("")}
        <div class="coin-note">${escapeHtml(t("coin_info"))}</div>
        <button type="button" class="coin-hist-toggle" id="coinHistBtn">${_coinHistOpen ? "▾" : "▸"} ${escapeHtml(t("coin_hist"))}</button>
        ${_coinHistOpen ? `<div class="coin-hist">${hist.length ? hist.map(h => `<div class="coin-hist-row"><span>${escapeHtml(t("coin_j_" + h.jenis))}${h.keterangan ? " · " + escapeHtml(h.keterangan) : ""}<small>${new Date(h.created_at).toLocaleString(loc, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</small></span><b class="${h.delta > 0 ? "plus" : "minus"}">${h.delta > 0 ? "+" : ""}${coinNum(h.delta)}</b></div>`).join("") : `<div class="coin-hist-empty">${escapeHtml(t("coin_hist_empty"))}</div>`}</div>` : ""}
    </div>`;
    $("coinTopupBtn").addEventListener("click", () => openTopupModal());
    $("coinHistBtn").addEventListener("click", () => { _coinHistOpen = !_coinHistOpen; renderCoinBox(); });
    box.querySelectorAll("[data-cancel-topup]").forEach(b => b.addEventListener("click", async () => {
        const { error } = await cuRpc("cu_cancel_topup", { p_id: Number(b.dataset.cancelTopup) });
        if (!error) { showToast(t("coin_cancelled"), "success"); loadCoin(); }
    }));
}

/**
 * Layar Top Up: 1) isi jumlah, 2) bayar ke metode admin, 3) kirim bukti via WhatsApp,
 * 4) tekan "Pesan Top Up" -> masuk waiting list admin; koin masuk otomatis setelah admin ACC.
 * need = kekurangan koin (opsional, mengisi jumlah awal).
 */
async function openTopupModal(need) {
    const { data: p } = await cuRpc("cu_payment_info");
    await ensurePriceInfo();
    const ov = document.createElement("div"); ov.className = "pay-overlay";
    const start = Math.max(1000, Math.ceil((need || 50000) / 1000) * 1000);
    const user = sessionStorage.getItem("admin_view_name") || localStorage.getItem("pelanggan_username") || "";
    ov.innerHTML = `<div class="pay-box" role="dialog" aria-modal="true">
        <div class="modal-title">🪙 ${escapeHtml(t("coin_topup_title"))}</div>
        <div class="modal-sub">${escapeHtml(t("coin_topup_sub"))}</div>
        <div class="field"><label class="rn-label" for="coinAmt">${escapeHtml(t("coin_amount"))}</label>
            <input type="number" id="coinAmt" min="1000" step="1000" inputmode="numeric" value="${start}">
            <div class="coin-chips">${[10000, 25000, 50000, 100000, 250000].map(n => `<button type="button" class="rn-chip" data-n="${n}">${coinNum(n)}</button>`).join("")}</div>
            <div class="rn-hint" id="coinEq"></div></div>
        ${p && p.configured ? payMethodsHtml(p) : `<div class="pay-warn">${escapeHtml(t("coin_topup_none"))}</div>`}
        <a class="btn btn-wa btn-block" id="coinWa" href="#" target="_blank" rel="noopener" style="margin-top:10px;">💬 ${escapeHtml(t("coin_topup_send"))}</a>
        <button type="button" class="btn btn-primary btn-block" id="coinOrder" style="margin-top:8px;">🪙 ${escapeHtml(t("coin_topup_order"))}</button>
        <div class="coin-steps">${escapeHtml(t("coin_topup_steps"))}</div>
        <button type="button" class="btn btn-ghost btn-block" id="coinTopClose" style="margin-top:8px;">${escapeHtml(t("coin_topup_close"))}</button></div>`;
    document.body.appendChild(ov);
    payBindCopy(ov);
    const upd = () => {
        const n = parseInt(ov.querySelector("#coinAmt").value, 10) || 0, u = cuCoinUsd(n);
        ov.querySelector("#coinEq").textContent = t("coin_eq", { rp: fmtRp(n), usdt: u ? " " + u : "" });
        ov.querySelector("#coinWa").href = waProof(t("coin_topup_wa", { n: coinNum(n), eq: fmtRp(n) + (u ? " " + u : ""), u: user }));
    };
    ov.querySelector("#coinAmt").addEventListener("input", upd);
    ov.querySelector(".coin-chips").addEventListener("click", e => { const c = e.target.closest("[data-n]"); if (c) { ov.querySelector("#coinAmt").value = c.dataset.n; upd(); } });
    ov.querySelector("#coinTopClose").addEventListener("click", () => ov.remove());
    ov.querySelector("#coinOrder").addEventListener("click", async () => {
        const n = parseInt(ov.querySelector("#coinAmt").value, 10) || 0;
        if (n < 1000) { showToast(t("coin_topup_min"), "danger"); return; }
        const btn = ov.querySelector("#coinOrder"); btn.disabled = true;
        const { error } = await cuRpc("cu_request_topup", { p_jumlah: n });
        btn.disabled = false;
        if (error) { const m = error.message || ""; showToast(/does not exist|schema cache|Could not find the function/i.test(m) ? t("rn_err_not_ready") : (translateServerError(m) || t("rn_err_generic")), "danger"); return; }
        ov.remove(); showToast(t("coin_topup_sent", { n: coinNum(n) }), "success"); loadCoin();
    });
    upd();
}

document.addEventListener("DOMContentLoaded", () => { loadCoin(); setInterval(() => { if (!document.hidden) loadCoin(); }, 60000); });
document.addEventListener("langchange", renderCoinBox);
