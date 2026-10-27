/**
 * Admin -> masuk ke tampilan pelanggan (tanpa login pelanggan). Butuh sql/admin-view.sql.
 * Admin memilih salah satu akun pelanggan; halaman /pelanggan terbuka dengan token lihat sementara.
 * PIN admin tetap tersimpan di sessionStorage, jadi saat kembali ke dashboard admin tidak perlu login lagi.
 */
(function () {
    const $ = id => document.getElementById(id);
    let list = [];

    /* Alamat portal pelanggan: pengaturan tersimpan > PORTAL_PELANGGAN_URL di config.js > folder "pelanggan/" */
    function portalUrl() {
        let base = (localStorage.getItem("portal_url") || (typeof PORTAL_PELANGGAN_URL !== "undefined" ? PORTAL_PELANGGAN_URL : "") || "pelanggan/").trim();
        if (!/\.html?$/i.test(base)) base = base.replace(/\/+$/, "") + "/dashboard.html";
        return new URL(base, location.href);
    }
    // true = halaman ada / tidak bisa dicek (beda domain); false = pasti tidak ada (404 atau bukan halaman portal)
    async function portalReachable(u) {
        if (u.origin !== location.origin) return true;
        try {
            const r = await fetch(u.href, { cache: "no-store" });
            if (!r.ok) return false;
            return (await r.text()).includes("portal-shell");
        } catch (e) { return true; }
    }
    function askPortalUrl(reason) {
        return new Promise(resolve => {
            modalBox.innerHTML = `<div class="modal-icon info">🔗</div><div class="modal-title">Alamat Website Pelanggan</div>
                <div class="modal-sub" style="margin-bottom:10px;">${escapeHtml(reason || "Masukkan alamat website pelanggan Anda.")}</div>
                <div class="modal-form"><div class="field"><label for="vcUrl">URL halaman pelanggan</label>
                <input type="text" id="vcUrl" value="${escapeHtml(localStorage.getItem("portal_url") || "")}" placeholder="https://pelanggan.domainanda.com  atau  https://domainanda.com/pelanggan/" autocomplete="off"></div>
                <div class="vc-hint">Isi alamat tempat folder <b>pelanggan</b> Anda diupload (yang menampilkan halaman login pelanggan). Cukup sekali, tersimpan di browser ini.</div></div>
                <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="vcUrlNo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="vcUrlOk">Simpan &amp; Lanjut</button></div>`;
            modalOverlay.classList.add("show"); $("vcUrl").focus();
            const ok = () => {
                let v = $("vcUrl").value.trim(); if (!v) return;
                if (!/^https?:\/\//i.test(v) && !v.startsWith("/") && !/^[\w.-]+\.[a-z]{2,}/i.test(v)) { /* path relatif, biarkan */ }
                else if (/^[\w.-]+\.[a-z]{2,}/i.test(v) && !/^https?:\/\//i.test(v)) v = "https://" + v;
                localStorage.setItem("portal_url", v); resolve(true);
            };
            $("vcUrlOk").addEventListener("click", ok);
            $("vcUrl").addEventListener("keydown", e => { if (e.key === "Enter") ok(); });
            $("vcUrlNo").addEventListener("click", () => { closeModal(); resolve(false); });
        });
    }

    async function getPin() {
        const saved = sessionStorage.getItem("akun_admin_pin");
        if (saved) return saved;
        return new Promise(resolve => {
            modalBox.innerHTML = `<div class="modal-icon info">🔐</div><div class="modal-title">PIN Admin</div>
                <div class="modal-form"><div class="field"><label for="vcPin">Masukkan PIN admin</label><input type="password" id="vcPin" inputmode="numeric" autocomplete="off"></div></div>
                <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="vcPinNo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="vcPinOk">Lanjut</button></div>`;
            modalOverlay.classList.add("show"); $("vcPin").focus();
            const ok = async () => {
                const pin = $("vcPin").value; if (!pin) return;
                const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
                if (error) { showToast("Error database: " + error.message, "danger"); return; }
                if (!data) { showToast("PIN admin salah", "danger"); return; }
                sessionStorage.setItem("akun_admin_pin", pin); resolve(pin);
            };
            $("vcPinOk").addEventListener("click", ok);
            $("vcPin").addEventListener("keydown", e => { if (e.key === "Enter") ok(); });
            $("vcPinNo").addEventListener("click", () => { closeModal(); resolve(null); });
        });
    }

    async function openPicker() {
        const pin = await getPin(); if (!pin) return;
        const { data, error } = await supabaseClient.rpc("admin_list_customer_accounts", { p_admin_pin: pin });
        if (error) {
            if ((error.message || "").includes("PIN admin salah")) { sessionStorage.removeItem("akun_admin_pin"); showToast("PIN admin tidak valid, coba lagi", "danger"); }
            else showToast(error.message || "Terjadi kesalahan", "danger");
            return;
        }
        list = (data || []).slice().sort((a, b) => (b.jumlah_pesanan_aktif - a.jumlah_pesanan_aktif) || a.username.localeCompare(b.username));
        modalBox.innerHTML = `<div class="modal-icon info">👁</div><div class="modal-title">Lihat sebagai Pelanggan</div>
            <div class="modal-sub" style="margin-bottom:10px;">Pilih pelanggan. Anda masuk tanpa login dan bisa kembali ke admin kapan saja.</div>
            <input type="text" id="vcSearch" class="vc-search" placeholder="🔍 Cari pelanggan..." autocomplete="off">
            <div class="vc-list" id="vcList"></div>
            <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="vcSet">🔗 Alamat Portal</button><button type="button" class="btn btn-ghost btn-wrap" id="vcClose">Tutup</button></div>`;
        modalOverlay.classList.add("show");
        $("vcClose").addEventListener("click", closeModal);
        $("vcSet").addEventListener("click", async () => { if (await askPortalUrl("Ubah alamat website pelanggan.")) openPicker(); else openPicker(); });
        $("vcSearch").addEventListener("input", renderList); renderList(); $("vcSearch").focus();
    }

    function renderList() {
        const q = ($("vcSearch").value || "").toLowerCase().trim();
        const rows = list.filter(c => !q || c.username.toLowerCase().includes(q));
        $("vcList").innerHTML = rows.length ? rows.map(c => `
            <button type="button" class="vc-item ${c.jumlah_pesanan_aktif ? "" : "vc-idle"}" data-id="${c.id}">
                <span class="vc-name">${escapeHtml(c.username)}</span>
                <span class="vc-count">${c.jumlah_pesanan_aktif ? c.jumlah_pesanan_aktif + " pesanan aktif" : "tidak ada pesanan aktif"}</span>
            </button>`).join("") : `<div class="vc-empty">Pelanggan tidak ditemukan</div>`;
        $("vcList").querySelectorAll(".vc-item").forEach(b => b.addEventListener("click", () => enter(Number(b.dataset.id), b)));
    }

    async function enter(id, btn) {
        const c = list.find(x => x.id === id); if (!c) return;
        btn.disabled = true;
        const { data, error } = await supabaseClient.rpc("admin_view_open", { p_pin: sessionStorage.getItem("akun_admin_pin"), p_customer_id: id });
        if (error || !data) {
            btn.disabled = false;
            const m = error?.message || "";
            showToast(/does not exist|schema cache/i.test(m) ? "Jalankan dulu sql/admin-view.sql di Supabase SQL Editor" : (m || "Gagal membuka tampilan pelanggan"), "danger");
            return;
        }
        const back = encodeURIComponent(location.origin + location.pathname);
        let u = portalUrl();
        if (!(await portalReachable(u))) {
            btn.disabled = false;
            if (!(await askPortalUrl(`Halaman pelanggan tidak ditemukan di ${u.origin}${u.pathname} (404). Masukkan alamat yang benar.`))) return;
            u = portalUrl();
            if (!(await portalReachable(u))) { showToast("Halaman pelanggan masih tidak ditemukan di alamat itu", "danger"); return; }
        }
        window.location.href = `${u.origin}${u.pathname}#av=${data}&n=${encodeURIComponent(c.username)}&id=${c.id}&b=${back}`;
    }

    document.addEventListener("DOMContentLoaded", () => { const b = $("viewCustBtn"); if (b) b.addEventListener("click", openPicker); });
})();
