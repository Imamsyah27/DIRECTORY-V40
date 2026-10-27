/**
 * Menu "Grafik": semua grafik dikumpulkan di satu halaman (Statistik, Dashboard Aktif, BSL Profit, CashFlow)
 * supaya halaman lain tidak penuh. Grafik BSL Profit & CashFlow butuh PIN admin.
 */
let gfBound = false;
const gfEl = id => document.getElementById(id);
const gfPin = () => sessionStorage.getItem("akun_admin_pin");

function gfResize() {
    [typeof _stCharts !== "undefined" ? _stCharts : {}, typeof bpCharts !== "undefined" ? bpCharts : {}, typeof _cfCharts !== "undefined" ? _cfCharts : {}]
        .forEach(o => Object.values(o || {}).forEach(c => { try { c.resize(); } catch (e) {} }));
}
async function initGrafikPage() {
    if (!gfBound) {
        gfBound = true;
        const submit = async () => {
            const pin = gfEl("gfPinInput").value; if (!pin) { showToast("Masukkan PIN admin", "danger"); return; }
            const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
            if (error || data === false) { showToast("PIN admin tidak valid", "danger"); return; }
            sessionStorage.setItem("akun_admin_pin", pin); gfEl("gfPinInput").value = ""; gfPrivate();
        };
        gfEl("gfPinSubmit").addEventListener("click", submit);
        gfEl("gfPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
    }
    loadStatistik();
    await gfPrivate();
    setTimeout(gfResize, 80);
}
async function gfPrivate() {
    const pin = gfPin();
    gfEl("gfLock").style.display = pin ? "none" : "block"; gfEl("gfPrivate").style.display = pin ? "block" : "none";
    if (!pin) return;
    if (typeof cfPin !== "undefined") cfPin = pin;
    await Promise.all([typeof bpLoad === "function" ? bpLoad() : null, typeof loadCfBatches === "function" ? loadCfBatches() : null]);
    if (!gfPin()) { gfEl("gfLock").style.display = "block"; gfEl("gfPrivate").style.display = "none"; return; }   // PIN ditolak
    setTimeout(gfResize, 60);
}
