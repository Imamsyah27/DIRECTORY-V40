/**
 * Waiting list ORDER KOIN (admin). Pelanggan memesan top up dari portal; admin menekan ACC
 * setelah menerima pembayaran -> koin otomatis masuk ke akun pelanggan. Butuh sql/koin-usdt-4-topup.sql.
 */
const kmEl = id => document.getElementById(id);
const kmPin = () => sessionStorage.getItem("akun_admin_pin");
const kmNum = n => Number(n || 0).toLocaleString("id-ID");
const kmWaktu = iso => iso ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
let kmAll = [], kmFilter = "pending", kmBound = false, kmRate = 0;

async function kmRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: kmPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (m.includes("PIN admin salah")) { sessionStorage.removeItem("akun_admin_pin"); kmEl("kmPinGate").style.display = "block"; kmEl("kmContent").style.display = "none"; showToast("PIN admin tidak valid, masukkan ulang", "danger"); }
        else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/koin-usdt-4-topup.sql di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}
function initKoinOrderPage() {
    if (!kmBound) {
        kmBound = true;
        const submit = () => { const pin = kmEl("kmPinInput").value; if (!pin) { showToast("Masukkan PIN admin", "danger"); return; } sessionStorage.setItem("akun_admin_pin", pin); kmEl("kmPinInput").value = ""; kmShow(); };
        kmEl("kmPinSubmit").addEventListener("click", submit);
        kmEl("kmPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        kmEl("kmFilter").addEventListener("click", e => { const b = e.target.closest("button[data-f]"); if (b) { kmFilter = b.dataset.f; kmRender(); } });
        kmEl("kmBody").addEventListener("click", kmOnClick);
    }
    if (kmPin()) kmShow(); else { kmEl("kmPinGate").style.display = "block"; kmEl("kmContent").style.display = "none"; }
}
async function kmShow() { kmEl("kmPinGate").style.display = "none"; kmEl("kmContent").style.display = "block"; await kmLoad(); }
async function kmLoad() {
    if (!kmPin()) return;
    const { data, error } = await kmRpc("topup_list", {});
    if (error) return;
    kmAll = data || [];
    const pr = await supabaseClient.rpc("pr_get", { p_pin: kmPin() });
    kmRate = pr.data && pr.data.settings ? Number(pr.data.settings.usdt_rate || 0) : 0;
    kmRender();
}
function kmBadge() {
    const n = kmAll.filter(r => r.status === "pending").length, b = kmEl("kmNavBadge");
    if (b) { b.textContent = n; b.style.display = n ? "inline-block" : "none"; }
}
function kmRender() {
    kmBadge();
    const cnt = k => k === "all" ? kmAll.length : kmAll.filter(r => r.status === k).length;
    kmEl("kmFilter").querySelectorAll("button").forEach(b => { b.classList.toggle("on", b.dataset.f === kmFilter); b.querySelector("i").textContent = cnt(b.dataset.f); });
    const rows = kmAll.filter(r => kmFilter === "all" || r.status === kmFilter);
    kmEl("kmEmpty").style.display = rows.length ? "none" : "block";
    const pill = { pending: ["⏳ Menunggu ACC", "bp-pill mn"], approved: ["✅ Disetujui", "bp-pill rq"], rejected: ["✖ Ditolak", "bp-pill mn"] };
    kmEl("kmBody").innerHTML = rows.map(r => {
        const st = pill[r.status] || [r.status, "bp-pill mn"], wa = String(r.whatsapp || "").replace(/[^0-9]/g, "");
        const usd = kmRate ? `<div class="cell-sub">≈ ${(r.jumlah / kmRate).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</div>` : "";
        const acts = r.status === "pending"
            ? `<button class="btn btn-success mini" data-act="ok" data-id="${r.id}">✅ ACC</button> <button class="btn btn-ghost mini" data-act="no" data-id="${r.id}">Tolak</button>`
            : `<button class="btn btn-ghost mini" data-act="del" data-id="${r.id}">Hapus</button>`;
        return `<tr><td>${kmWaktu(r.created_at)}<br><small>#${r.id}</small></td>
            <td><b>${escapeHtml(r.username)}</b>${wa ? `<br><a href="https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.username}, top up ${kmNum(r.jumlah)} koin `)}" target="_blank" rel="noopener"><small>💬 WhatsApp</small></a>` : ""}</td>
            <td><b>🪙 ${kmNum(r.jumlah)}</b><div class="cell-sub">= Rp ${kmNum(r.jumlah)}</div>${usd}</td>
            <td>🪙 ${kmNum(r.saldo)}</td>
            <td><span class="${st[1]}">${st[0]}</span>${r.catatan_admin ? `<br><small>${escapeHtml(r.catatan_admin)}</small>` : ""}${r.processed_at ? `<br><small>${kmWaktu(r.processed_at)}</small>` : ""}</td>
            <td style="white-space:nowrap;">${acts}</td></tr>`;
    }).join("");
}
function kmOnClick(e) {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = Number(b.dataset.id), act = b.dataset.act, r = kmAll.find(x => x.id === id); if (!r) return;
    if (act === "ok") {
        openConfirmModal({ icon: "✅", iconClass: "success", title: "ACC Top Up Koin?",
            body: `<b>${escapeHtml(r.username)}</b> — <b>🪙 ${kmNum(r.jumlah)}</b> (Rp ${kmNum(r.jumlah)}).<br>Pastikan pembayaran sudah diterima. Koin langsung masuk ke akun pelanggan.`,
            confirmText: "Ya, ACC & Isi Koin", confirmClass: "btn-success",
            onConfirm: async () => { const { data, error } = await kmRpc("topup_approve", { p_id: id }); if (error) { kmLoad(); return; } showToast(`Koin masuk — saldo ${r.username}: 🪙 ${kmNum(data.saldo)}`, "success"); kmLoad(); } });
    } else if (act === "no") {
        openConfirmModal({ icon: "✖", iconClass: "danger", title: "Tolak top up?", body: `Top up <b>#${id}</b> dari <b>${escapeHtml(r.username)}</b> akan ditolak (tidak ada koin yang masuk).`, confirmText: "Ya, Tolak", confirmClass: "btn-danger",
            onConfirm: async () => { const { error } = await kmRpc("topup_reject", { p_id: id }); if (!error) { showToast("Top up ditolak", "danger"); kmLoad(); } } });
    } else if (act === "del") {
        openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus dari daftar?", body: "Koin yang sudah masuk tidak ditarik. Koreksi saldo lewat menu Akun Pelanggan.", confirmText: "Hapus", confirmClass: "btn-danger",
            onConfirm: async () => { const { error } = await kmRpc("topup_delete", { p_id: id }); if (!error) kmLoad(); } });
    }
}
async function kmRefreshBadge() {
    if (!kmPin() || document.hidden) return;
    const { data, error } = await supabaseClient.rpc("topup_list", { p_pin: kmPin() });
    if (!error && data) { kmAll = data; kmBadge(); }
}
document.addEventListener("DOMContentLoaded", () => { setTimeout(kmRefreshBadge, 1800); setInterval(kmRefreshBadge, 60000); });
