/**
 * Menu "Kurs IDR ≈ USDT" (admin): kurs Rupiah per 1 USDT + harga USDT per hari BEM / SEM / LEM.
 * HANYA pembanding untuk pelanggan — pembayaran tetap koin (Rupiah). Butuh sql/koin-usdt-1…7 (7 bagian).
 */
const usEl = id => document.getElementById(id);
const usPin = () => sessionStorage.getItem("akun_admin_pin");
let usBound = false, usSet = null;

async function usRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: usPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (m.includes("PIN admin salah")) {
            sessionStorage.removeItem("akun_admin_pin"); usEl("usPinGate").style.display = "block"; usEl("usContent").style.display = "none";
            showToast("PIN admin tidak valid, masukkan ulang", "danger");
        } else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/koin-usdt-1…7 (7 bagian) di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}
function initUsdtPage() {
    if (!usBound) {
        usBound = true;
        const submit = () => { const pin = usEl("usPinInput").value; if (!pin) { showToast("Masukkan PIN admin", "danger"); return; } sessionStorage.setItem("akun_admin_pin", pin); usEl("usPinInput").value = ""; usShow(); };
        usEl("usPinSubmit").addEventListener("click", submit);
        usEl("usPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        usEl("usSave").addEventListener("click", usSave);
        ["usRate", "usBem", "usSem", "usLem"].forEach(i => usEl(i).addEventListener("input", usPreview));
    }
    if (usPin()) usShow(); else { usEl("usPinGate").style.display = "block"; usEl("usContent").style.display = "none"; }
}
async function usShow() {
    usEl("usPinGate").style.display = "none"; usEl("usContent").style.display = "block";
    const { data, error } = await usRpc("pr_get", {});
    if (error || !data) return;
    usSet = data.settings;
    usEl("usRate").value = Number(usSet.usdt_rate || 0) || "";
    usEl("usBem").value = Number(usSet.usdt_bem || 0) || ""; usEl("usSem").value = Number(usSet.usdt_sem || 0) || ""; usEl("usLem").value = Number(usSet.usdt_lem || 0) || "";
    usPreview();
}
function usPreview() {
    if (!usSet) return;
    const num = id => parseFloat(usEl(id).value) || 0, rp = n => "Rp " + Number(n).toLocaleString("id-ID");
    usEl("usPreview").innerHTML = [["BEM", usSet.bem, "usBem"], ["SEM", usSet.sem, "usSem"], ["LEM", usSet.lem, "usLem"]].map(([n, idr, id]) => {
        const u = num(id), implied = u > 0 ? Math.round(idr / u) : 0;
        return `<span><b>${n}</b> ${rp(idr)} / hari ${u ? `⇄ ${u} USDT${implied ? ` (setara kurs ${rp(implied)})` : ""}` : "— USDT belum diisi"}</span>`;
    }).join("");
}
async function usSave() {
    const num = id => parseFloat(usEl(id).value) || 0;
    const { error } = await usRpc("pr_save_usdt", { p_rate: num("usRate"), p_bem: num("usBem"), p_sem: num("usSem"), p_lem: num("usLem") });
    if (!error) { showToast("Kurs & harga USDT disimpan", "success"); usShow(); }
}
