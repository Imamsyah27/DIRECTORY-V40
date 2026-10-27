/**
 * MODAL (admin) — SATU tempat untuk semua modal barang etalase (Farm, Hav Token, Product, Katalog, Pre Order)
 * + modal BSL (BEM/SEM/LEM harian & Bot). Butuh sql/koin-usdt-14, 14b, 14c (modal).
 * BSL Profit dan CashFlow membaca modal dari sini: pilih barang + jumlah -> omset, modal, profit otomatis.
 */
const mdEl = id => document.getElementById(id);
const mdPin = () => sessionStorage.getItem("akun_admin_pin");
const mdRp = n => (Number(n) < 0 ? "− " : "") + "Rp " + Math.abs(Number(n) || 0).toLocaleString("id-ID");
let mdItems = [], mdInited = false, mdOnlyEmpty = false;

async function mdRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: mdPin(), ...params });
    if (res.error) {
        const m = res.error.message || ""; console.error(res.error);
        if (m.includes("PIN admin salah")) {
            sessionStorage.removeItem("akun_admin_pin");
            if (mdEl("mdPinGate")) { mdEl("mdPinGate").style.display = "block"; mdEl("mdContent").style.display = "none"; }
            showToast("PIN admin tidak valid, masukkan ulang", "danger");
        } else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/koin-usdt-13-preorder-per10k.sql dan koin-usdt-14, 14b, 14c (modal) di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}

/** Daftar barang etalase + modal (dipakai juga oleh BSL Profit & CashFlow). Tanpa item BSL internal. */
async function mdLoadSellable() {
    const { data, error } = await mdRpc("md_catalog", {});
    if (error) return [];
    return (data || []).filter(i => !String(i.key).startsWith("bsl:"));
}
/** Pemilih barang 2 dropdown: Kategori -> Barang (rapi, tidak satu daftar panjang) */
function mdGroups(items) {
    const groups = [];
    items.forEach(i => { let g = groups.find(x => x.nama === i.grup); if (!g) groups.push(g = { nama: i.grup, ikon: i.ikon, rows: [] }); g.rows.push(i); });
    return groups;
}
const mdItemLabel = i => `${i.sub && String(i.key).startsWith("sup:") ? i.sub + " · " : ""}${i.nama} — ${mdRp(i.harga)}`;
/** catSel & itemSel = elemen <select>. opts.manual = sediakan pilihan "ketik manual" (CashFlow). opts.onChange dipanggil saat barang berubah. */
function mdBindPicker(catSel, itemSel, items, opts = {}) {
    const groups = mdGroups(items), manual = !!opts.manual;
    const fillItems = () => {
        const g = groups.find(x => x.nama === catSel.value);
        if (!g) { itemSel.innerHTML = `<option value="">${manual ? "— pilih kategori dulu —" : "—"}</option>`; itemSel.disabled = true; return; }
        itemSel.disabled = false;
        itemSel.innerHTML = (manual ? `<option value="">— pilih barang —</option>` : "") + g.rows.map(i => `<option value="${escapeHtml(i.key)}">${escapeHtml(mdItemLabel(i))}</option>`).join("");
    };
    catSel.innerHTML = (manual ? `<option value="">Ketik manual</option>` : "") + groups.map(g => `<option value="${escapeHtml(g.nama)}">${escapeHtml(g.ikon + " " + g.nama)}</option>`).join("");
    catSel.onchange = () => { fillItems(); if (opts.onChange) opts.onChange(); };      // onchange (bukan addEventListener) agar tidak dobel saat dibind ulang
    itemSel.onchange = () => { if (opts.onChange) opts.onChange(); };
    fillItems();
    return { reset() { catSel.value = manual ? "" : (groups[0] ? groups[0].nama : ""); fillItems(); } };
}
function mdGoModal() { const b = document.querySelector('#pageNav button[data-page="modalitem"]'); if (b) b.click(); }

function initModalPage() {
    if (!mdInited) {
        mdInited = true;
        const submit = async () => {
            const pin = mdEl("mdPinInput").value; if (!pin) return;
            const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
            if (error) { showToast("Error database: " + error.message, "danger"); return; }
            if (!data) { showToast("PIN admin salah", "danger"); return; }
            sessionStorage.setItem("akun_admin_pin", pin); mdEl("mdPinInput").value = ""; mdShow();
        };
        mdEl("mdPinSubmit").addEventListener("click", submit);
        mdEl("mdPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        mdEl("mdSearch").addEventListener("input", mdFilter);
        mdEl("mdOnlyEmpty").addEventListener("change", e => { mdOnlyEmpty = e.target.checked; mdFilter(); });
        mdEl("mdSave").addEventListener("click", mdSave);
        mdEl("mdBody").addEventListener("input", e => { const i = e.target.closest("input[data-mdkey]"); if (i) mdRowCalc(i.closest("tr")); mdDirty(); });
    }
    if (mdPin()) mdShow(); else { mdEl("mdPinGate").style.display = "block"; mdEl("mdContent").style.display = "none"; }
}
async function mdShow() {
    mdEl("mdPinGate").style.display = "none"; mdEl("mdContent").style.display = "block";
    const { data, error } = await mdRpc("md_catalog", {});
    if (error) return;
    mdItems = data || []; mdRender();
}
function mdRender() {
    const groups = [];
    mdItems.forEach(i => { let g = groups.find(x => x.nama === i.grup); if (!g) groups.push(g = { nama: i.grup, ikon: i.ikon, rows: [] }); g.rows.push(i); });
    mdEl("mdEmpty").style.display = mdItems.length ? "none" : "flex";
    mdEl("mdBody").innerHTML = groups.map(g => `<tr class="md-grow"><td colspan="5">${escapeHtml(g.ikon)} ${escapeHtml(g.nama)}</td></tr>` + g.rows.map(i => `
        <tr data-q="${escapeHtml((i.grup + " " + (i.sub || "") + " " + i.nama).toLowerCase())}" data-harga="${Number(i.harga)}" data-orig="${Number(i.modal)}" data-diisi="${i.diisi ? 1 : 0}">
            <td data-label="Barang"><b>${escapeHtml(i.nama)}</b>${i.sub && !String(i.key).startsWith("sup:") ? `<div class="bp-sub">${escapeHtml(i.sub)}</div>` : ""}</td>
            <td data-label="Harga jual" class="num">${Number(i.harga) > 0 ? mdRp(i.harga) : `<span class="pr-def">belum diatur</span>`}<div class="bp-sub">${escapeHtml(i.satuan)}</div></td>
            <td data-label="Modal (Rp)" class="num"><input type="number" min="0" inputmode="numeric" class="md-in" data-mdkey="${escapeHtml(i.key)}" value="${i.diisi ? Number(i.modal) : ""}" placeholder="0"></td>
            <td data-label="Profit" class="num md-profit"></td>
            <td data-label="Margin" class="num md-margin"></td>
        </tr>`).join("")).join("");
    mdEl("mdBody").querySelectorAll("tr[data-harga]").forEach(mdRowCalc);
    mdFilter(); mdDirty();
}
function mdRowCalc(tr) {
    const harga = Number(tr.dataset.harga), v = tr.querySelector("input").value, m = Number(v) || 0;
    const p = harga - m, pe = tr.querySelector(".md-profit"), me = tr.querySelector(".md-margin");
    if (!harga) { pe.innerHTML = me.innerHTML = `<span class="pr-def">–</span>`; return; }
    pe.innerHTML = `<b style="color:var(--${p >= 0 ? "success" : "danger"})">${mdRp(p)}</b>`;
    me.textContent = Math.round(p / harga * 100) + "%";
    tr.dataset.diisi = v !== "" ? 1 : 0;
}
function mdFilter() {
    const q = mdEl("mdSearch").value.trim().toLowerCase();
    mdEl("mdBody").querySelectorAll("tr[data-q]").forEach(r => {
        r.style.display = (!q || r.dataset.q.includes(q)) && (!mdOnlyEmpty || r.querySelector("input").value === "") ? "" : "none";
    });
    mdEl("mdBody").querySelectorAll(".md-grow").forEach(g => {
        let n = g.nextElementSibling, vis = false;
        while (n && !n.classList.contains("md-grow")) { if (n.style.display !== "none") vis = true; n = n.nextElementSibling; }
        g.style.display = vis ? "" : "none";
    });
}
function mdChanged() {
    const out = {};
    mdEl("mdBody").querySelectorAll("input[data-mdkey]").forEach(i => {
        const tr = i.closest("tr"), orig = tr.dataset.orig, was = mdItems.find(x => x.key === i.dataset.mdkey);
        if (i.value === "" && !(was && was.diisi)) return;                  // tetap kosong
        if (i.value !== "" && was && was.diisi && String(Number(i.value)) === orig) return;   // tidak berubah
        out[i.dataset.mdkey] = i.value === "" ? 0 : Math.max(0, Math.round(Number(i.value)));
    });
    return out;
}
function mdDirty() {
    const n = Object.keys(mdChanged()).length, empty = mdItems.filter(i => !i.diisi).length;
    mdEl("mdSave").textContent = n ? `💾 Simpan Modal (${n} diubah)` : "💾 Simpan Modal";
    mdEl("mdInfo").textContent = `${mdItems.length} barang · ${empty} belum diisi modalnya`;
}
async function mdSave() {
    const ch = mdChanged();
    if (!Object.keys(ch).length) { showToast("Tidak ada perubahan", "info"); return; }
    const { error } = await mdRpc("md_save", { p_items: ch });
    if (error) return;
    showToast("Modal disimpan (berlaku untuk transaksi berikutnya; transaksi lama tidak berubah)", "success");
    mdShow();
}
