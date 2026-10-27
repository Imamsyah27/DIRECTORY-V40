/**
 * Hubungi Admin: pesan otomatis diteruskan ke WhatsApp atau Messenger admin.
 * - WhatsApp: pesan langsung terisi (wa.me?text=).
 * - Messenger: pesan disalin ke clipboard lalu Messenger dibuka (Messenger tidak selalu mendukung isi otomatis) -> tinggal tempel.
 */
Object.assign(TRANSLATIONS.id, {
    ct_btn: "Hubungi Admin", ct_title: "Hubungi Admin", ct_sub: "Tulis pesan Anda, lalu kirim lewat WhatsApp atau Messenger.",
    ct_msg_ph: "Tulis pesan untuk admin...", ct_default: "Halo admin, saya {u}. ", ct_wa: "WhatsApp", ct_msgr: "Messenger",
    ct_copied: "Pesan disalin. Tempel (paste) di Messenger lalu kirim.", ct_close: "Tutup"
});
Object.assign(TRANSLATIONS.en, {
    ct_btn: "Contact Admin", ct_title: "Contact Admin", ct_sub: "Write your message, then send it via WhatsApp or Messenger.",
    ct_msg_ph: "Write a message for the admin...", ct_default: "Hello admin, I'm {u}. ", ct_wa: "WhatsApp", ct_msgr: "Messenger",
    ct_copied: "Message copied. Paste it in Messenger and send.", ct_close: "Close"
});

const contactUser = () => sessionStorage.getItem("admin_view_name") || localStorage.getItem("pelanggan_username") || "";
const waUrl = (text, num) => `https://wa.me/${num || ADMIN_WA_INTL}` + (text ? `?text=${encodeURIComponent(text)}` : "");
/** Nomor WhatsApp dari menu Panel admin (kosong = pakai nomor bawaan). wa_bukti = bukti pembayaran; wa_supply = order supply & stock. */
let cuPanel = { wa_bukti: "", wa_supply: "" };
const waProof = text => waUrl(text, cuPanel.wa_bukti);
const waSupply = text => waUrl(text, cuPanel.wa_supply);
async function loadPanel() {
    const { data } = await cuRpc("cu_panel_info");
    if (data) { cuPanel = { wa_bukti: data.wa_bukti || "", wa_supply: data.wa_supply || "" }; if (typeof renderSupplyChat === "function") renderSupplyChat(); }
}
document.addEventListener("DOMContentLoaded", () => { loadPanel(); setInterval(() => { if (!document.hidden) loadPanel(); }, 120000); });
const msgrUrl = (text) => ADMIN_MESSENGER_URL + (text ? `?text=${encodeURIComponent(text)}` : "");

/** Dua tombol (WhatsApp + Messenger) dengan pesan otomatis. */
function contactButtonsHtml(text, extraClass) {
    return `<div class="contact-row ${extraClass || ""}">
        <a class="btn btn-wa" href="${waUrl(text)}" target="_blank" rel="noopener noreferrer">💬 ${escapeHtml(t("ct_wa"))}</a>
        <a class="btn btn-msgr" href="${msgrUrl(text)}" target="_blank" rel="noopener noreferrer" data-copy="${escapeHtml(text)}">🟦 ${escapeHtml(t("ct_msgr"))}</a>
    </div>`;
}

/** Jendela "Hubungi Admin" dengan kotak pesan yang bisa diedit. */
function openContactModal(prefill) {
    const text = prefill || t("ct_default", { u: contactUser() });
    $("modalBox").innerHTML = `
        <div class="rn-head"><div class="rn-icon">📞</div>
            <div><div class="modal-title" style="margin:0">${escapeHtml(t("ct_title"))}</div><div class="rn-sub">${escapeHtml(t("ct_sub"))}</div></div></div>
        <textarea id="ctMsg" class="ct-msg" rows="5" placeholder="${escapeHtml(t("ct_msg_ph"))}">${escapeHtml(text)}</textarea>
        <div id="ctLinks"></div>
        <button type="button" class="btn btn-ghost btn-block" id="ctClose" style="margin-top:8px">${escapeHtml(t("ct_close"))}</button>`;
    $("modalOverlay").classList.add("show");
    const draw = () => { $("ctLinks").innerHTML = contactButtonsHtml($("ctMsg").value.trim(), "block"); };
    $("ctMsg").addEventListener("input", draw); draw();
    $("ctClose").addEventListener("click", closeModal);
    $("ctMsg").focus(); $("ctMsg").setSelectionRange($("ctMsg").value.length, $("ctMsg").value.length);
}

document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-copy]");           // Messenger: salin pesan lebih dulu
    if (c && navigator.clipboard) navigator.clipboard.writeText(c.dataset.copy).then(() => showToast(t("ct_copied"), "success")).catch(() => {});
    const o = e.target.closest("[data-contact-text]");   // tombol yang membuka jendela Hubungi Admin
    if (o) openContactModal(o.dataset.contactText || "");
});
document.addEventListener("DOMContentLoaded", () => {
    const b = $("contactAdminBtn"); if (b) b.addEventListener("click", () => openContactModal(""));
});
