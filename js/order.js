/**
 * Menu "Order" (menu utama Directory): satu tempat untuk semua pesanan masuk —
 * Bot Order, Bulk Order, Koin Akun (top up), Koin Hayday, Voucher, riwayat Farm, dan Pre Order.
 */
let ordCur = "bot", ordBound = false;
function initOrderPage() {
    if (!ordBound) {
        ordBound = true;
        document.getElementById("ordTabs").addEventListener("click", e => { const b = e.target.closest("button[data-ord]"); if (b) ordShow(b.dataset.ord); });
        const upd = () => {
            const n = ["boNavBadge", "bkNavBadge", "kmNavBadge", "coBadge-koin", "coBadge-voucher", "coBadge-pre"].reduce((a, id) => { const el = document.getElementById(id); return a + (el && el.style.display !== "none" ? parseInt(el.textContent, 10) || 0 : 0); }, 0);
            const nb = document.getElementById("ordNavBadge"); if (nb) { nb.textContent = n; nb.style.display = n ? "inline-block" : "none"; }
        };
        new MutationObserver(upd).observe(document.getElementById("ordTabs"), { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["style"] });
        upd();
    }
    ordShow(ordCur);
}
function ordShow(k) {
    ordCur = k;
    document.querySelectorAll("#ordTabs button[data-ord]").forEach(b => b.classList.toggle("on", b.dataset.ord === k));
    document.querySelectorAll(".ord-pane").forEach(p => { p.style.display = p.id === "ordPane-" + (k === "bulk" ? "bot" : k) ? "block" : "none"; });
    if (k === "bot" || k === "bulk") { boSetKind(k); initBotOrderPage(); }
    else if (k === "akun") initKoinOrderPage();
    else if (k === "koin" || k === "voucher") kcInit(k);
    else if (k === "farm") fmInit();
    else if (k === "pre") poOrderInit();
}
// badge menu "Order" tetap terisi walau halaman Order belum dibuka
document.addEventListener("DOMContentLoaded", () => {
    const upd = () => {
        const n = ["boNavBadge", "bkNavBadge", "kmNavBadge", "coBadge-koin", "coBadge-voucher", "coBadge-pre"].reduce((a, id) => { const el = document.getElementById(id); return a + (el && el.style.display !== "none" ? parseInt(el.textContent, 10) || 0 : 0); }, 0);
        const nb = document.getElementById("ordNavBadge"); if (nb) { nb.textContent = n; nb.style.display = n ? "inline-block" : "none"; }
    };
    setTimeout(upd, 3500); setInterval(upd, 15000);
});
