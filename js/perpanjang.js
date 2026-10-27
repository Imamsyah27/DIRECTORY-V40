/**
 * PERMINTAAN PERPANJANGAN (admin) — sql/perpanjang.sql
 * Permintaan dari pelanggan muncul di tab paket yang dipesan (BEM/SEM/LEM).
 * Setujui -> langganan baru masuk Dashboard Aktif paket itu, langganan lama
 * yang sudah limit pindah ke Arsip. Tolak -> status Ditolak (+ catatan).
 * Memakai PIN admin yang sama dengan menu Akun Pelanggan (sessionStorage).
 */
let rnAll = [], rnFilter = "pending", rnLoadedOnce = false;
const rnEl = id => document.getElementById(id);
const rnPin = () => sessionStorage.getItem("akun_admin_pin");
const rnWaktu = iso => iso ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

async function rnRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: rnPin(), ...params });
    if (res.error) {
        const m = res.error.message || "";
        console.error(res.error);
        if (m.includes("PIN admin salah")) { sessionStorage.removeItem("akun_admin_pin"); renderRenewals(); showToast("PIN admin tidak valid, masukkan ulang", "danger"); }
        else if (/does not exist|schema cache/i.test(m)) showToast("Jalankan dulu sql/perpanjang.sql di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}

async function loadRenewals() {
    if (!rnEl("rnPanel")) return;
    if (!rnPin()) { rnAll = []; renderRenewals(); return; }
    const { data, error } = await rnRpc("rn_list", {});
    if (error) return;
    rnAll = data || [];
    renderRenewals();
}

// pesanan 1 hari masuk tab Fast; selain itu tab biasa
const rnTabOf = r => (Number(r.hari) === 1 ? "FAST-" : "") + r.dashboard_baru;
function renderRenewals() {
    const dash = currentDashboard;
    const pending = rnAll.filter(r => r.status === "pending");
    // warna notifikasi: ada yang "kirim hari ini" = MERAH BERCAHAYA; semua "kirim besok" = BIRU; selain itu warna biasa
    const kirimCls = (el, list) => {
        el.classList.remove("kirim-now", "kirim-later");
        if (list.some(r => r.kirim_waktu === "hari_ini")) el.classList.add("kirim-now");
        else if (list.length && list.every(r => r.kirim_waktu === "besok")) el.classList.add("kirim-later");
    };
    ["BEM", "LEM", "SEM", "FAST-BEM", "FAST-SEM", "FAST-LEM"].forEach(d => {
        const sub = pending.filter(r => rnTabOf(r) === d), n = sub.length;
        const b = rnEl("rnTab" + d);
        if (b) { b.textContent = n; b.style.display = n ? "inline-block" : "none"; kirimCls(b, sub); }
    });
    const nb = rnEl("rnNavBadge");
    if (nb) { nb.textContent = pending.length; nb.style.display = pending.length ? "inline-block" : "none"; kirimCls(nb, pending); }

    rnEl("rnDashLabel").textContent = dash;
    const gate = rnEl("rnGate"), body = rnEl("rnBody");
    if (!rnPin()) { gate.style.display = "flex"; body.style.display = "none"; rnEl("rnCount").style.display = "none"; return; }
    gate.style.display = "none"; body.style.display = "block";

    const mine = rnAll.filter(r => rnTabOf(r) === dash);
    const nPend = mine.filter(r => r.status === "pending").length;
    const cnt = rnEl("rnCount"); cnt.textContent = nPend; cnt.style.display = nPend ? "inline-block" : "none"; kirimCls(cnt, mine.filter(r => r.status === "pending"));

    document.querySelectorAll("#rnFilter button").forEach(b => {
        const k = b.dataset.f;
        b.classList.toggle("on", k === rnFilter);
        b.querySelector("i").textContent = mine.filter(r => r.status === k).length;
    });

    const list = mine.filter(r => r.status === rnFilter);
    rnEl("rnEmpty").style.display = list.length ? "none" : "block";
    rnEl("rnEmpty").textContent = rnFilter === "pending" ? "Tidak ada permintaan (perpanjangan / pesanan baru) yang menunggu di " + dash + "." : "Belum ada data.";

    rnEl("rnList").innerHTML = list.map(r => {
        const waD = String(r.nomor_whatsapp || "").replace(/[^0-9]/g, "");
        const pkgBerubah = r.source !== "new" && r.dashboard_lama && r.dashboard_lama !== r.dashboard_baru;
        const msg = `Halo ${r.nomor_pesanan}, permintaan perpanjangan tagar ${r.tagar_baru} (${r.dashboard_baru}, ${r.hari} hari) `;
        return `<div class="rn-req ${r.status}${r.status === "pending" && r.kirim_waktu === "hari_ini" ? " kirim-now" : r.status === "pending" && r.kirim_waktu === "besok" ? " kirim-later" : ""}">
            <div class="rn-req-main">
                <div class="rn-req-name">${escapeHtml(r.nomor_pesanan)} <span class="rn-req-user">@${escapeHtml(r.username)}</span></div>
                <div class="rn-req-tag">${r.source === "new" ? `${(r.tagar_list && r.tagar_list.length ? r.tagar_list : [r.tagar_baru]).map(g => `<b class="rn-new rn-tagchip">${escapeHtml(g)}</b>`).join(" ")} <span class="rn-flag">🆕 PESANAN BARU${r.tagar_list && r.tagar_list.length > 1 ? " · " + r.tagar_list.length + " TAGAR" : ""}</span>` : r.tagar_diganti ? `<s>${escapeHtml(r.tagar_lama)}</s> <span class="rn-arrow">➜</span> <b class="rn-new">${escapeHtml(r.tagar_baru)}</b> <span class="rn-flag">TAGAR BARU</span>` : `<b>${escapeHtml(r.tagar_baru)}</b> <span class="rn-same">tagar tetap</span>`}</div>
                <div class="rn-req-meta">
                    <span class="rn-chip-days">H0/H${r.hari} · ${r.hari} hari</span>
                    ${r.kirim_waktu === "hari_ini" ? `<span class="rn-kirim now">🔥 KIRIM HARI INI</span>` : r.kirim_waktu === "besok" ? `<span class="rn-kirim later">📅 Kirim besok</span>` : ""}
                    <span class="rn-chip-pkg">${pkgBerubah ? escapeHtml(r.dashboard_lama) + " ➜ " : ""}${escapeHtml(r.dashboard_baru)}</span>
                    <span class="rn-req-time">${rnWaktu(r.created_at)}</span>
                    ${r.status === "approved" ? `<span class="badge badge-done">✅ Disetujui</span>` : r.status === "rejected" ? `<span class="badge badge-danger">✖ Ditolak</span>` : `<span class="badge badge-wait">⏳ Menunggu</span>`}
                </div>
                ${r.total_harga != null && r.total_harga > 0 ? `<div class="rn-req-note rn-price">💰 <b>Rp ${Number(r.total_harga).toLocaleString("id-ID")}</b> · ${r.jumlah_item > 1 ? r.jumlah_item + " tagar × " : ""}${r.hari} hari × ${r.harga_normal_hari && r.harga_normal_hari !== r.harga_hari ? `<s>Rp ${Number(r.harga_normal_hari).toLocaleString("id-ID")}</s> ` : ""}Rp ${Number(r.harga_hari || 0).toLocaleString("id-ID")}${r.kode_referal ? ` · 🎟 ${escapeHtml(r.kode_referal)} (− Rp ${Number(r.diskon_referral || 0).toLocaleString("id-ID")})` : ""}</div>` : ""}
                ${r.catatan_pelanggan ? `<div class="rn-req-note">📝 Catatan pelanggan: ${linkify(r.catatan_pelanggan)}</div>` : ""}
                ${r.catatan_admin ? `<div class="rn-req-note">💬 ${escapeHtml(r.catatan_admin)}</div>` : ""}
            </div>
            <div class="rn-req-actions">
                ${waD ? `<a class="btn btn-outline btn-icon" target="_blank" rel="noopener" title="Chat pelanggan" href="https://wa.me/${waD}">💬</a>` : ""}
                ${r.status === "pending"
                    ? `<button type="button" class="btn btn-success btn-wrap" onclick="rnApprove(${r.id})">✅ Setujui</button>
                       <button type="button" class="btn btn-danger btn-wrap" onclick="rnReject(${r.id})">✖ Tolak</button>`
                    : `<button type="button" class="btn btn-ghost btn-icon" title="Hapus riwayat" onclick="rnDelete(${r.id})">🗑</button>`}
            </div>
        </div>`;
    }).join("");
}

function rnApprove(id) {
    const r = rnAll.find(x => x.id === id); if (!r) return;
    openConfirmModal({
        icon: "✅", iconClass: "success", title: r.source === "new" ? "Setujui Pesanan Baru?" : "Setujui Perpanjangan?",
        body: `<b>${escapeHtml(r.nomor_pesanan)}</b> akan masuk ke <b>Dashboard Aktif ${escapeHtml(rnTabOf(r))}</b> sebagai langganan baru:<br>
               ${r.source === "new" && r.tagar_list && r.tagar_list.length > 1 ? `<b>${r.tagar_list.length} tagar</b> (${r.tagar_list.map(escapeHtml).join(", ")}) masing-masing menjadi 1 langganan` : `tagar <b>${escapeHtml(r.tagar_baru)}</b>`} · <b>H0/H${r.hari}</b>.<br>
               ${r.source === "order" ? "Langganan lama yang sudah limit otomatis dipindah ke <b>Arsip</b>." : ""}${Number(r.hari) === 1 ? "<br>⚡ <b>Fast Order</b>: otomatis masuk Arsip setelah dikirim &amp; dicentang." : ""}`,
        confirmText: "Ya, Setujui", confirmClass: "btn-success",
        onConfirm: async () => {
            const { error } = await rnRpc("rn_approve", { p_id: id });
            if (error) { loadRenewals(); return; }
            showToast((r.source === "new" ? "Pesanan baru disetujui" : "Perpanjangan disetujui") + " — masuk ke dashboard " + rnTabOf(r), "success");
            loadData();   // memuat ulang tabel + panel ini
        }
    });
}

function rnReject(id) {
    const r = rnAll.find(x => x.id === id); if (!r) return;
    modalBox.innerHTML = `<div class="modal-icon danger">✖</div><div class="modal-title">Tolak Permintaan?</div>
        <div class="modal-body">Permintaan <b>${escapeHtml(r.nomor_pesanan)}</b> (${escapeHtml(r.tagar_baru)}, ${r.hari} hari) akan ditandai Ditolak.</div>
        <div class="modal-form"><div class="field"><label for="rnAlasan">Catatan untuk pelanggan (opsional)</label><input type="text" id="rnAlasan" maxlength="200" placeholder="cth. Stok tagar penuh, hubungi admin"></div></div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="modalCancelBtn">Batal</button><button type="button" class="btn btn-danger btn-wrap" id="rnRejectYes">Tolak</button></div>`;
    modalOverlay.classList.add("show");
    rnEl("modalCancelBtn").addEventListener("click", closeModal);
    rnEl("rnRejectYes").addEventListener("click", async () => {
        const catatan = rnEl("rnAlasan").value.trim();
        closeModal();
        const { error } = await rnRpc("rn_reject", { p_id: id, p_catatan: catatan });
        if (!error) showToast("Permintaan ditolak", "danger");
        loadRenewals();
    });
}

function rnDelete(id) {
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus Riwayat?", body: "Riwayat permintaan ini dihapus dari daftar.", confirmText: "Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { await rnRpc("rn_delete", { p_id: id }); loadRenewals(); } });
}

document.addEventListener("DOMContentLoaded", () => {
    const go = async () => {
        const pin = rnEl("rnPinInput").value;
        if (!pin) { showToast("Masukkan PIN admin", "danger"); return; }
        const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
        if (error) { showToast("Gagal verifikasi PIN (cek sql/customer_portal_fixed.sql)", "danger"); return; }
        if (!data) { showToast("PIN admin salah", "danger"); return; }
        sessionStorage.setItem("akun_admin_pin", pin);
        rnEl("rnPinInput").value = "";
        loadRenewals();
    };
    rnEl("rnPinBtn").addEventListener("click", go);
    rnEl("rnPinInput").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    document.querySelectorAll("#rnFilter button").forEach(b => b.addEventListener("click", () => { rnFilter = b.dataset.f; renderRenewals(); }));
    // ganti tab BEM/LEM/SEM -> loadData() -> loadRenewals() (lihat dashboard.js)
});
