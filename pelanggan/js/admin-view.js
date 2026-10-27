/**
 * Mode admin di portal pelanggan: banner, ganti pelanggan, tombol kembali ke admin, dan mode LIHAT SAJA.
 * Aktif hanya jika halaman dibuka dari dashboard admin (token lihat di sessionStorage).
 */
(function () {
    if (!isAdminView()) return;

    // Mode lihat saja: aksi yang mengubah data pelanggan diblokir di browser
    const BLOCK = new Set(["cu_place_supply_order", "cu_place_supply_order_k", "cu_cancel_supply_order", "cu_request_renewal", "cu_request_new_order", "cu_request_renewal_k", "cu_request_new_order_k", "cu_cancel_renewal", "customer_set_order_label", "customer_change_password", "cu_archive_mark_seen", "cu_request_bot_order", "cu_request_bulk_order", "cu_buy_farm", "cu_buy_hav", "cu_order_catalog", "cu_place_preorder"]);
    const _rpc = supabaseClient.rpc.bind(supabaseClient);
    const pendingErrs = [];
    const showErr = (name, msg) => {
        const el = document.getElementById("avErr"), txt = `⚠ ${name}: ${msg}`;
        if (el) { el.textContent = txt; el.style.display = "block"; } else pendingErrs.push(txt);
    };
    // semua panggilan database dicatat: kalau gagal, pesan error aslinya tampil di bar admin (bukan loading terus)
    supabaseClient.rpc = (name, params) => {
        if (BLOCK.has(name)) return Promise.resolve({ data: null, error: { message: "Mode admin: hanya lihat, tidak bisa mengubah data pelanggan" } });
        return Promise.resolve(_rpc(name, params)).then(
            r => { if (r && r.error && name !== "admin_list_customer_accounts") showErr(name, r.error.message || r.error.code || "error"); return r; },
            e => { showErr(name, (e && e.message) || "gagal terhubung"); throw e; });
    };

    const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    function exitView() {
        const back = adminReturnUrl();
        ["admin_view_token", "admin_view_name", "admin_view_id", "admin_view_back", "admin_view_return"].forEach(k => sessionStorage.removeItem(k));
        window.location.href = back;
    }

    document.addEventListener("DOMContentLoaded", async () => {
        document.body.classList.add("admin-view");
        const name = sessionStorage.getItem("admin_view_name") || "pelanggan", curId = sessionStorage.getItem("admin_view_id");
        const bar = document.createElement("div");
        bar.className = "av-bar";
        bar.innerHTML = `<div class="av-info">👁 <b>Mode Admin</b><span>— melihat sebagai <b>${esc(name)}</b> (hanya lihat)</span></div>
            <div class="av-actions"><select id="avSwitch" title="Ganti pelanggan" style="display:none;"></select>
            <button type="button" class="btn btn-primary" id="avBack">← Kembali ke Admin</button></div>`;
        document.body.prepend(bar);
        const errEl = document.createElement("div"); errEl.id = "avErr"; errEl.className = "av-err"; errEl.style.display = "none"; bar.after(errEl);
        if (pendingErrs.length) { errEl.textContent = pendingErrs[pendingErrs.length - 1]; errEl.style.display = "block"; }
        // kalau masih "memuat" setelah 12 detik, beri petunjuk
        setTimeout(() => { const ls = document.getElementById("loadingState");
            if (ls && ls.style.display !== "none" && errEl.style.display === "none") { errEl.textContent = "⚠ Data pelanggan belum termuat. Pastikan sql/admin-view.sql sudah dijalankan TERAKHIR di Supabase, lalu muat ulang halaman."; errEl.style.display = "block"; } }, 12000);
        // sapaan: tampilkan nama pelanggan yang sedang dilihat
        const gt = document.getElementById("greetTitle"); if (gt) gt.textContent = `${gt.textContent.split(",")[0]}, ${name} 👋`;
        document.getElementById("avBack").addEventListener("click", exitView);

        // tombol "Keluar" pelanggan -> kembali ke admin (hapus listener logout bawaan)
        const lo = document.getElementById("logoutBtn");
        if (lo) { const c = lo.cloneNode(true); c.removeAttribute("data-i18n"); c.textContent = "← Kembali ke Admin"; c.className = "btn btn-outline"; lo.replaceWith(c); c.addEventListener("click", exitView); }

        // ganti pelanggan tanpa kembali ke admin (butuh PIN admin di sessionStorage = domain yang sama)
        const pin = sessionStorage.getItem("akun_admin_pin");
        if (!pin) return;
        const { data } = await _rpc("admin_list_customer_accounts", { p_admin_pin: pin });
        if (!data || !data.length) return;
        const sel = document.getElementById("avSwitch");
        const rows = data.slice().sort((a, b) => (b.jumlah_pesanan_aktif - a.jumlah_pesanan_aktif) || a.username.localeCompare(b.username));
        sel.innerHTML = rows.map(c => `<option value="${c.id}" ${String(c.id) === curId ? "selected" : ""}>${esc(c.username)}${c.jumlah_pesanan_aktif ? ` (${c.jumlah_pesanan_aktif})` : ""}</option>`).join("");
        sel.style.display = "inline-block";
        sel.addEventListener("change", async () => {
            const c = rows.find(x => String(x.id) === sel.value);
            const r = await _rpc("admin_view_open", { p_pin: pin, p_customer_id: Number(sel.value) });
            if (r.error || !r.data) { showToast(r.error?.message || "Gagal pindah pelanggan", "danger"); return; }
            sessionStorage.setItem("admin_view_token", r.data); sessionStorage.setItem("admin_view_name", c.username); sessionStorage.setItem("admin_view_id", String(c.id));
            location.reload();
        });
    });
})();
