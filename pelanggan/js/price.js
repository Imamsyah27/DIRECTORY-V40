/**
 * Harga otomatis di form Pesan Baru & Perpanjang (hitungan dari server — sql/price.sql).
 * Harga default dicoret bila pelanggan punya harga istimewa atau ada diskon; kode referal opsional.
 */
Object.assign(TRANSLATIONS.id, {
    price_title: "Harga", price_unset: "Harga belum diatur oleh admin.", price_per_day: "/hari", price_special: "⭐ Harga Istimewa",
    price_discount: "🏷 Diskon", price_tags: "tagar", price_total: "Total", price_code_ph: "Kode referal (opsional)", price_apply: "Terapkan",
    price_code_ok: "Kode referal dipakai", price_ref_line: "Potongan referal", price_code_clear: "Hapus kode",
    ref_err_notfound: "Kode referal tidak ditemukan", ref_err_inactive: "Kode referal tidak aktif", ref_err_expired: "Kode referal sudah kedaluwarsa", ref_err_used: "Kode referal sudah habis dipakai", ref_err_mine: "Kode referal ini sudah pernah Anda pakai (1 kali per pelanggan)"
});
Object.assign(TRANSLATIONS.en, {
    price_title: "Price", price_unset: "Price has not been set by the admin.", price_per_day: "/day", price_special: "⭐ Special Price",
    price_discount: "🏷 Discount", price_tags: "tags", price_total: "Total", price_code_ph: "Referral code (optional)", price_apply: "Apply",
    price_code_ok: "Referral code applied", price_ref_line: "Referral discount", price_code_clear: "Remove code",
    ref_err_notfound: "Referral code not found", ref_err_inactive: "Referral code is not active", ref_err_expired: "Referral code has expired", ref_err_used: "Referral code has been fully used", ref_err_mine: "You have already used this referral code (once per customer)"
});
Object.assign(SERVER_ERROR_MAP, {
    "Kode referal tidak ditemukan": "ref_err_notfound", "Kode referal tidak aktif": "ref_err_inactive",
    "Kode referal sudah kedaluwarsa": "ref_err_expired", "Kode referal sudah habis dipakai": "ref_err_used",
    "Kode referal ini sudah pernah Anda pakai": "ref_err_mine"
});

Object.assign(TRANSLATIONS.id, {
    av_off: "Tidak tersedia", av_err_pkg: "Paket ini sedang tidak tersedia", av_err_bot: "Bot Order ini sedang tidak tersedia",
    coin_err_short: "Saldo koin tidak cukup. Top up dulu lewat admin.", supply_price_unset: "Harga item belum diatur admin",
    coin_topup_min: "Minimal top up 1.000 koin", coin_topup_many: "Terlalu banyak top up yang masih menunggu ACC", coin_line: "🪙 Saldo koin", coin_line_short: "kurang {n}"
});
Object.assign(TRANSLATIONS.en, {
    av_off: "Unavailable", av_err_pkg: "This package is currently unavailable", av_err_bot: "This Bot Order is currently unavailable",
    coin_err_short: "Not enough coins. Please top up via the admin first.", supply_price_unset: "This item's price has not been set by the admin",
    coin_topup_min: "Minimum top up is 1,000 coins", coin_topup_many: "Too many top ups are still awaiting approval", coin_line: "🪙 Coin balance", coin_line_short: "short {n}"
});
Object.assign(SERVER_ERROR_MAP, { "Saldo koin tidak cukup": "coin_err_short", "Harga item belum diatur admin": "supply_price_unset",
    "Minimal top up 1.000 koin": "coin_topup_min", "Terlalu banyak top up yang masih menunggu": "coin_topup_many" });
["BEM", "SEM", "LEM"].forEach(p => { SERVER_ERROR_MAP[`Paket ${p} sedang tidak tersedia`] = "av_err_pkg"; SERVER_ERROR_MAP[`Bot Order ${p} sedang tidak tersedia`] = "av_err_bot"; });

let cuPriceInfo = null, _priceLoading = null, cuCoin = null;   // cuCoin = { koin, riwayat } (diisi coin.js)

/** Harga USDT per hari (diisi admin, HANYA pembanding; pembayaran tetap koin/Rupiah). */
function cuUsdtPrice(p) {
    const v = Number((cuPriceInfo && cuPriceInfo.usdt && cuPriceInfo.usdt[p]) || 0);
    return v > 0 ? v.toLocaleString(numLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + " USDT" : "";
}
const cuRate = () => Number((cuPriceInfo && cuPriceInfo.usdt_rate) || 0);
/** Pratinjau koin (1 koin = Rp 1) ke USDT memakai kurs admin. Hanya perkiraan. */
function cuCoinUsd(coins) {
    const r = cuRate(); if (!r || !coins) return "";
    const x = coins / r;
    return "≈ " + x.toLocaleString(numLocale(), { minimumFractionDigits: 2, maximumFractionDigits: x < 1 ? 4 : 2 }) + " USDT";
}
/** Paket tersedia? bot=true untuk Bot Order. */
function pkgAvail(p, bot) { const a = cuPriceInfo && cuPriceInfo.avail; return !a || a[(bot ? "BOT_" : "") + p] !== false; }
function markPkgAvail(root, bot) {
    if (!root) return;
    root.querySelectorAll(".rn-pkg[data-pkg]").forEach(b => {
        const off = !pkgAvail(b.dataset.pkg, bot);
        b.disabled = off; b.classList.toggle("off", off);
        let s = b.querySelector(".rn-pkg-off");
        if (off && !s) { s = document.createElement("small"); s.className = "rn-pkg-off"; b.appendChild(s); }
        if (s) s.textContent = off ? t("av_off") : "";
    });
}
const fmtRp = (n) => "Rp " + Number(n || 0).toLocaleString(numLocale());

function ensurePriceInfo() {
    if (cuPriceInfo) return Promise.resolve(cuPriceInfo);
    if (!_priceLoading) _priceLoading = cuRpc("cu_price_info").then(({ data, error }) => { if (!error && data) cuPriceInfo = data; _priceLoading = null; return cuPriceInfo; });
    return _priceLoading;
}

/** Harga per hari di tombol paket (normal dicoret bila ada harga khusus / diskon). */
function pkgPriceHtml(p) {
    const i = cuPriceInfo && cuPriceInfo[p];
    if (!i || !i.normal) return "";
    return i.final < i.normal ? `<s>${fmtRp(i.normal)}</s> <b>${fmtRp(i.final)}</b>` : `<b>${fmtRp(i.final)}</b>`;
}
function fillPkgPrices(root) {
    ensurePriceInfo().then(() => { root.querySelectorAll("[data-pkgprice]").forEach(el => { el.innerHTML = pkgPriceHtml(el.dataset.pkgprice); }); markPkgAvail(root, false); });
}

/** Baris tambahan di bawah total: perkiraan USDT + saldo koin (bila sistem koin aktif). */
function priceExtraHtml(total) {
    let h = "";
    const u = cuCoinUsd(total);
    if (u) h += `<div class="price-row usdt"><span>💵 USDT</span><span>${escapeHtml(u)}</span></div>`;
    if (cuCoin && total > 0) {
        const short = total - cuCoin.koin;
        h += `<div class="price-row coin${short > 0 ? " short" : ""}"><span>${escapeHtml(t("coin_line"))}</span><span>${Number(cuCoin.koin).toLocaleString()}${short > 0 ? " · " + escapeHtml(t("coin_line_short", { n: short.toLocaleString() })) : ""}</span></div>`;
    }
    return h;
}

function priceBoxHtml(prefix) {
    return `<div class="rn-block price-box">
        <div class="rn-label">💰 ${escapeHtml(t("price_title"))}</div>
        <div class="price-lines" id="${prefix}PriceLines"></div>
        <div class="ref-row"><input type="text" id="${prefix}Kode" maxlength="32" placeholder="${escapeHtml(t("price_code_ph"))}" autocomplete="off" autocapitalize="characters">
            <button type="button" class="btn btn-ghost" id="${prefix}KodeBtn">${escapeHtml(t("price_apply"))}</button></div>
        <div class="ref-msg" id="${prefix}KodeMsg"></div>
    </div>`;
}

/** Pasang perilaku kotak harga. getState() -> { pkg, hari, jumlah }. Mengembalikan { schedule, kode }. */
function bindPriceBox(prefix, getState) {
    const L = $(prefix + "PriceLines"), K = $(prefix + "Kode"), M = $(prefix + "KodeMsg"), B = $(prefix + "KodeBtn");
    let applied = "", timer = null, seq = 0;

    const render = (q) => {
        if (!q.normal_hari) { L.innerHTML = `<div class="price-none">${escapeHtml(t("price_unset"))}</div>`; return; }
        const tag = q.jenis === "istimewa" ? `<span class="price-tag sp">${escapeHtml(t("price_special"))}</span>`
            : q.jenis === "diskon" ? `<span class="price-tag ds">${escapeHtml(t("price_discount"))} ${q.diskon_persen}%${q.diskon_label ? " · " + escapeHtml(q.diskon_label) : ""}</span>` : "";
        const perDay = q.jenis ? `<s>${fmtRp(q.normal_hari)}</s> <b>${fmtRp(q.harga_hari)}</b>` : `<b>${fmtRp(q.harga_hari)}</b>`;
        const calc = `${q.jumlah > 1 ? q.jumlah + " " + escapeHtml(t("price_tags")) + " × " : ""}${q.hari} ${escapeHtml(t("rn_days_unit"))} × ${fmtRp(q.harga_hari)}`;
        L.innerHTML = `<div class="price-row"><span>${perDay}<small>${escapeHtml(t("price_per_day"))}</small></span>${tag}</div>
            <div class="price-row sub"><span>${calc}</span><span>${fmtRp(q.subtotal)}</span></div>
            ${q.referral > 0 ? `<div class="price-row ref"><span>🎟 ${escapeHtml(q.kode)} · ${escapeHtml(t("price_ref_line"))}</span><span>− ${fmtRp(q.referral)}</span></div>` : ""}
            <div class="price-row total"><span>${escapeHtml(t("price_total"))}</span><b>${fmtRp(q.total)}</b></div>${priceExtraHtml(q.total)}`;
    };

    async function refresh() {
        const s = getState();
        if (!s.hari || s.hari < 1 || s.hari > 365) { L.innerHTML = ""; return; }
        const mine = ++seq;
        const { data, error } = await cuRpc("cu_price_quote", { p_dashboard: s.pkg, p_hari: s.hari, p_jumlah: Math.max(1, s.jumlah || 1), p_kode: applied || null });
        if (mine !== seq) return;
        if (error || !data) { L.innerHTML = ""; return; }
        if (applied && data.kode_ok === false) {
            M.className = "ref-msg bad"; M.textContent = translateServerError(data.kode_pesan) || data.kode_pesan; applied = "";
            return refresh();                      // tampilkan harga tanpa kode
        }
        if (applied && data.kode_ok) { M.className = "ref-msg ok"; M.textContent = "✅ " + t("price_code_ok") + (data.kode_tipe === "persen" ? " (" + data.kode_nilai + "%)" : ""); }
        render(data);
    }
    const schedule = () => { clearTimeout(timer); timer = setTimeout(refresh, 250); };

    B.addEventListener("click", () => {
        if (applied) { applied = ""; K.value = ""; K.disabled = false; B.textContent = t("price_apply"); M.textContent = ""; M.className = "ref-msg"; refresh(); return; }
        const v = K.value.trim().toUpperCase(); if (!v) return;
        applied = v; K.value = v; M.textContent = ""; refresh();
        K.disabled = true; B.textContent = t("price_code_clear");
    });
    K.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); B.click(); } });
    // kode ditolak -> buka kembali kolom kode
    const mo = new MutationObserver(() => { if (!applied && K.disabled) { K.disabled = false; B.textContent = t("price_apply"); } });
    mo.observe(M, { childList: true, characterData: true, subtree: true });

    schedule();
    return { schedule, kode: () => applied };
}

document.addEventListener("DOMContentLoaded", () => ensurePriceInfo());
