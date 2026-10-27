/**
 * Menu "Panel" (SETTING): nomor WhatsApp admin yang dihubungi pelanggan saat
 * (1) mengirim bukti pembayaran (BEM/SEM/LEM Bot & Top Up Koin), (2) order Supply & Stock.
 * Butuh sql/koin-usdt-7-farm-panel.sql.
 */
const pnEl = id => document.getElementById(id);
const pnPin = () => sessionStorage.getItem("akun_admin_pin");
let pnBound = false;

async function pnRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: pnPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (m.includes("PIN admin salah")) { sessionStorage.removeItem("akun_admin_pin"); pnEl("pnPinGate").style.display = "block"; pnEl("pnContent").style.display = "none"; showToast("PIN admin tidak valid, masukkan ulang", "danger"); }
        else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/koin-usdt-7-farm-panel.sql di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}
function initPanelPage() {
    if (!pnBound) {
        pnBound = true;
        const submit = () => { const pin = pnEl("pnPinInput").value; if (!pin) { showToast("Masukkan PIN admin", "danger"); return; } sessionStorage.setItem("akun_admin_pin", pin); pnEl("pnPinInput").value = ""; pnShow(); };
        pnEl("pnPinSubmit").addEventListener("click", submit);
        pnEl("pnPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        pnEl("pnSave").addEventListener("click", pnSave);
        ["pnBukti", "pnSupply"].forEach(i => pnEl(i).addEventListener("input", pnPreview));
    }
    if (pnPin()) pnShow(); else { pnEl("pnPinGate").style.display = "block"; pnEl("pnContent").style.display = "none"; }
}
async function pnShow() {
    pnEl("pnPinGate").style.display = "none"; pnEl("pnContent").style.display = "block";
    const { data, error } = await pnRpc("pn_get", {});
    if (error || !data) return;
    pnEl("pnBukti").value = data.wa_bukti || ""; pnEl("pnSupply").value = data.wa_supply || ""; pnPreview();
}
const pnNorm = v => { let d = String(v || "").replace(/\D/g, ""); if (d.startsWith("0")) d = "62" + d.slice(1); return d; };
function pnPreview() {
    const row = (label, v) => { const n = pnNorm(v); return `<span><b>${label}</b> ${n ? `→ <a href="https://wa.me/${n}" target="_blank" rel="noopener">wa.me/${n}</a>` : "→ nomor bawaan aplikasi"}</span>`; };
    pnEl("pnPreview").innerHTML = row("Bukti pembayaran", pnEl("pnBukti").value) + row("Order Supply &amp; Stock", pnEl("pnSupply").value);
}
async function pnSave() {
    const { error } = await pnRpc("pn_save", { p_wa_bukti: pnEl("pnBukti").value, p_wa_supply: pnEl("pnSupply").value });
    if (!error) { showToast("Panel disimpan", "success"); pnShow(); }
}
