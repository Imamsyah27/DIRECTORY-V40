/**
 * BSL PROFIT (admin) — sql/bsl-profit.sql
 * Omset, modal, profit. 1 hari = 1 tag.
 * Otomatis: pesanan baru dari Dashboard + permintaan yang disetujui. Manual: tombol "Catat Pemasukan".
 */
let bpData = null, bpInited = false, bpMonth = "all", bpJenis = "all", bpCharts = {};
const bpEl = id => document.getElementById(id);
const bpPin = () => sessionStorage.getItem("akun_admin_pin");
const bpRp = n => (Number(n) < 0 ? "− " : "") + "Rp " + Math.abs(Number(n) || 0).toLocaleString("id-ID");
const bpInt = id => parseInt(bpEl(id).value, 10) || 0;
const bpToday = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const BP_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const bpMonthLabel = ym => BP_MONTHS[Number(ym.slice(5, 7)) - 1] + " " + ym.slice(0, 4);
const bpNotReady = m => /does not exist|schema cache|Could not find the function/i.test(m || "");

async function bpRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: bpPin(), ...params });
    if (res.error) {
        const m = res.error.message || "";
        if (m.includes("PIN admin salah")) {
            sessionStorage.removeItem("akun_admin_pin");
            if (bpEl("bpPinGate")) { bpEl("bpPinGate").style.display = "block"; bpEl("bpContent").style.display = "none"; }
            showToast("PIN admin tidak valid, masukkan ulang", "danger");
        } else if (bpNotReady(m)) showToast("Jalankan dulu sql/bsl-profit.sql, sql/bot-order.sql dan sql/koin-usdt-14, 14b, 14c (modal) di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}

/** Pastikan PIN admin tersedia (minta lewat popup bila belum). Mengembalikan PIN atau null. */
function bpEnsurePin() {
    if (bpPin()) return Promise.resolve(bpPin());
    return new Promise(resolve => {
        modalBox.innerHTML = `<div class="modal-icon info">🔒</div><div class="modal-title">PIN Admin</div>
            <div class="modal-form"><div class="field"><label for="bpAskPin">Masukkan PIN admin untuk mencatat ke BSL Profit</label>
            <input type="password" id="bpAskPin" autocomplete="off" placeholder="PIN admin"></div></div>
            <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="bpAskNo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="bpAskYes">Lanjut</button></div>`;
        modalOverlay.classList.add("show");
        const input = bpEl("bpAskPin"); input.focus();
        const submit = async () => {
            const pin = input.value; if (!pin) return;
            const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
            if (error) { showToast("Error database: " + error.message, "danger"); return; }
            if (!data) { showToast("PIN admin salah", "danger"); return; }
            sessionStorage.setItem("akun_admin_pin", pin); closeModal(); resolve(pin);
        };
        bpEl("bpAskYes").addEventListener("click", submit);
        input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        bpEl("bpAskNo").addEventListener("click", () => { closeModal(); resolve(null); });
    });
}

/* ---------------- Form "Tambah Pesanan" di Dashboard ---------------- */
let _bpHintSeq = 0, _bpHintTimer = null;
function bpScheduleHint() { clearTimeout(_bpHintTimer); _bpHintTimer = setTimeout(bpRefreshHint, 300); }
async function bpRefreshHint() {
    const box = bpEl("orderPriceHint"); if (!box) return;
    if (!bpPin()) { box.textContent = "Harga otomatis dari pricelist (PIN admin diminta saat menambah). Isi kolom harga untuk custom."; return; }
    const mine = ++_bpHintSeq;
    const { data, error } = await supabaseClient.rpc("bp_suggest", { p_pin: bpPin(), p_dashboard: currentDashboard, p_nama: bpEl("orderNumber").value.trim() });
    if (mine !== _bpHintSeq) return;
    if (error || !data) { box.textContent = bpNotReady(error && error.message) ? "Jalankan sql/bsl-profit.sql dulu." : ""; return; }
    const hari = parseInt(bpEl("packageTotal").value, 10) || 0, custom = parseInt(bpEl("orderPrice").value, 10) || 0;
    const harga = custom > 0 ? custom : data.harga_hari, modal = data.modal_hari || 0;
    const src = custom > 0 ? "harga custom" : data.istimewa ? "harga istimewa " + escapeHtml(data.akun || "") : data.jenis === "diskon" ? "pricelist + diskon" : "pricelist";
    box.innerHTML = `${currentDashboard}: <b>${bpRp(harga)}</b>/hari (${src}) · modal ${bpRp(modal)}`
        + (hari ? ` · total <b>${bpRp(harga * hari)}</b> · profit <b style="color:var(--${harga - modal >= 0 ? "success" : "danger"})">${bpRp((harga - modal) * hari)}</b>` : "");
}
function bpInitOrderForm() {
    ["orderNumber", "packageTotal", "orderPrice"].forEach(id => { const el = bpEl(id); if (el) el.addEventListener("input", bpScheduleHint); });
    document.querySelectorAll("#dashboardTabs .tab").forEach(b => b.addEventListener("click", () => setTimeout(bpRefreshHint, 50)));
    bpRefreshHint();
}

/** Dipanggil app.js sebelum pesanan disimpan. Mengembalikan { pin, harga, catat } atau null bila dibatalkan. */
async function bpBeforeAddOrder() {
    const cb = bpEl("orderRecordProfit");
    if (cb && !cb.checked) return { catat: false };
    const pin = await bpEnsurePin();
    if (!pin) { showToast("PIN dibatalkan — pesanan tidak ditambahkan", "danger"); return null; }
    return { catat: true, harga: bpInt("orderPrice") };
}
/** Dipanggil app.js setelah pesanan berhasil disimpan. */
async function bpAfterAddOrder(ctx, o) {
    if (!ctx || !ctx.catat) return;
    const { data, error } = await bpRpc("bp_add_sale", { p_dashboard: o.dashboard, p_nama: o.nama, p_hari: o.hari, p_jumlah: 1, p_harga_hari: ctx.harga || null, p_tanggal: bpToday(), p_keterangan: o.tagar });
    if (error) { showToast("Pesanan tersimpan, tetapi gagal dicatat ke BSL Profit", "danger"); return; }
    showToast(`Tercatat di BSL Profit: ${bpRp(data.omset)} (profit ${bpRp(data.profit)})`, "success");
    bpEl("orderPrice").value = ""; bpRefreshHint();
}

/* ---------------- Halaman BSL Profit ---------------- */
function initBslPage() {
    if (!bpInited) {
        bpInited = true;
        const submit = async () => {
            const pin = bpEl("bpPinInput").value; if (!pin) return;
            const { data, error } = await supabaseClient.rpc("admin_verify_pin", { p_pin: pin });
            if (error) { showToast("Error database: " + error.message, "danger"); return; }
            if (!data) { showToast("PIN admin salah", "danger"); return; }
            sessionStorage.setItem("akun_admin_pin", pin); bpEl("bpPinInput").value = ""; bpShow();
        };
        bpEl("bpPinSubmit").addEventListener("click", submit);
        bpEl("bpPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        bpEl("bpGoModal").addEventListener("click", mdGoModal);
        bpEl("bpAddItem").addEventListener("click", bpItemForm);
        bpEl("bpAddManual").addEventListener("click", () => bpEntryForm(null));
        bpEl("bpAddBot").addEventListener("click", bpBotForm);
        bpEl("bpFMonth").addEventListener("change", e => { bpMonth = e.target.value; bpRender(); });
        bpEl("bpFJenis").addEventListener("change", e => { bpJenis = e.target.value; bpRender(); });
    }
    if (bpPin()) bpShow();
    else { bpEl("bpPinGate").style.display = "block"; bpEl("bpContent").style.display = "none"; }
}
async function bpShow() {
    bpEl("bpPinGate").style.display = "none"; bpEl("bpContent").style.display = "block";
    await bpLoad();
}
async function bpLoad() {
    const { data, error } = await bpRpc("bp_get", {});
    if (error) return;
    bpData = data;
    bpRender();
}

function bpFiltered() {
    return bpData.entries.filter(e => (bpMonth === "all" || e.tanggal.slice(0, 7) === bpMonth) && (bpJenis === "all" || e.jenis === bpJenis));
}
function bpRender() {
    const months = [...new Set(bpData.entries.map(e => e.tanggal.slice(0, 7)))].sort().reverse();
    const cur = bpToday().slice(0, 7);
    if (!months.includes(cur)) months.unshift(cur);
    if (bpMonth !== "all" && !months.includes(bpMonth)) bpMonth = "all";
    bpEl("bpFMonth").innerHTML = `<option value="all">Semua waktu</option>` + months.map(m => `<option value="${m}" ${m === bpMonth ? "selected" : ""}>${bpMonthLabel(m)}</option>`).join("");
    bpEl("bpFJenis").value = bpJenis;

    const list = bpFiltered();
    const sum = k => list.reduce((a, e) => a + Number(e[k] || 0), 0);
    const omset = sum("omset"), modal = sum("modal"), profit = omset - modal;
    bpEl("bpKOmset").textContent = bpRp(omset);
    bpEl("bpKModal").textContent = bpRp(modal);
    bpEl("bpKProfit").textContent = bpRp(profit);
    bpEl("bpKProfit").style.color = profit < 0 ? "var(--danger)" : "";
    bpEl("bpKMargin").textContent = omset ? Math.round(profit / omset * 100) + "%" : "–";

    bpRenderModalPreview(); bpRenderModalBotPreview(); bpRenderTable(list); bpRenderCharts();
}

function bpRenderModalPreview() {
    const h = bpData.harga || {};
    bpEl("bpModalPreview").innerHTML = [["BEM", "bem"], ["SEM", "sem"], ["LEM", "lem"]].map(([n, k]) => {
        const harga = Number(h[k] || 0), m = Number((bpData.settings || {})["modal_" + k] || 0), p = harga - m;
        return `<span><b>${n}</b> harga ${bpRp(harga)} − modal ${bpRp(m)} = <b style="color:var(--${p >= 0 ? "success" : "danger"})">${bpRp(p)}</b> / tag / hari</span>`;
    }).join("");
}
function bpRenderModalBotPreview() {
    const h = bpData.harga || {};
    bpEl("bpModalBotPreview").innerHTML = [["BEM Bot", "bot_bem"], ["SEM Bot", "bot_sem"], ["LEM Bot", "bot_lem"]].map(([n, k]) => {
        const harga = Number(h[k] || 0), m = Number((bpData.settings || {})["modal_" + k] || 0), p = harga - m;
        return `<span><b>${n}</b> harga ${bpRp(harga)} − modal ${bpRp(m)} = <b style="color:var(--${p >= 0 ? "success" : "danger"})">${bpRp(p)}</b> / tagar</span>`;
    }).join("");
}
function bpRenderTable(list) {
    bpEl("bpEmpty").style.display = list.length ? "none" : "flex";
    const pill = { langganan: ["Langganan", "lg"], request: ["Request", "rq"], bot: ["Bot", "lg"], manual: ["Manual", "mn"] };
    bpEl("bpBody").innerHTML = list.slice(0, 500).map(e => {
        const [pl, cls] = e.item_key ? ["Barang", "lg"] : (pill[e.jenis] || [e.jenis, "mn"]);
        const detail = e.item_key ? `${e.qty || 1} × ${bpRp(e.harga_satuan)} (modal ${bpRp(e.modal_satuan)})` : e.jenis === "bot" ? `${e.jumlah_tagar || 1} tagar × ${bpRp(e.harga_hari)}` : e.hari ? `${e.jumlah_tagar || 1} tag × ${e.hari} hari × ${bpRp(e.harga_hari)}` : "";
        return `<tr>
            <td>${new Date(e.tanggal + "T00:00:00").toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
            <td><span class="bp-pill ${cls}">${pl}</span></td>
            <td><b>${escapeHtml(e.kategori)}</b></td>
            <td>${escapeHtml(e.pelanggan || "-")}<div class="bp-sub">${escapeHtml(e.keterangan || "")}</div></td>
            <td class="bp-sub">${detail}</td>
            <td class="num">${bpRp(e.omset)}</td><td class="num">${bpRp(e.modal)}</td>
            <td class="num"><b style="color:var(--${Number(e.profit) >= 0 ? "success" : "danger"})">${bpRp(e.profit)}</b></td>
            <td><div class="actions-cell">
                <button type="button" class="btn btn-ghost btn-icon" onclick="bpEntryForm(${e.id})" title="Ubah">✏️</button>
                <button type="button" class="btn btn-danger btn-icon" onclick="bpEntryDelete(${e.id})" title="Hapus">🗑</button></div></td></tr>`;
    }).join("");
    bpEl("bpMore").style.display = list.length > 500 ? "block" : "none";
}

/* ---------------- Grafik ---------------- */
function bpRenderCharts() {
    if (typeof Chart === "undefined") return;
    const _tc = themeChartColors();
    Chart.defaults.color = _tc.text; Chart.defaults.font.family = "Inter, sans-serif";
    const rp = v => Math.abs(v) >= 1e6 ? (v / 1e6) + " jt" : Math.abs(v) >= 1e3 ? (v / 1e3) + " rb" : v;
    const draw = (id, cfg) => { if (bpCharts[id]) bpCharts[id].destroy(); bpCharts[id] = new Chart(bpEl(id), cfg); };

    // 12 bulan terakhir (selalu, tidak terpengaruh filter bulan)
    const now = new Date(), keys = [];
    for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); keys.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")); }
    const agg = Object.fromEntries(keys.map(k => [k, { omset: 0, profit: 0 }]));
    bpData.entries.forEach(e => { if (bpJenis !== "all" && e.jenis !== bpJenis) return; const a = agg[e.tanggal.slice(0, 7)]; if (a) { a.omset += Number(e.omset); a.profit += Number(e.profit); } });
    const labels = keys.map(k => BP_MONTHS[Number(k.slice(5)) - 1] + " " + k.slice(2, 4));
    const tip = { callbacks: { label: c => " " + c.dataset.label + ": " + bpRp(c.parsed.y) } };
    draw("bpChartBulan", { type: "bar", data: { labels, datasets: [
        { label: "Omset", data: keys.map(k => agg[k].omset), backgroundColor: _tc.gold, borderRadius: 4 },
        { label: "Profit", data: keys.map(k => agg[k].profit), backgroundColor: _tc.success, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: "bottom" }, tooltip: tip },
            scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: _tc.grid }, ticks: { callback: rp } } } } });

    // Komposisi profit per kategori (mengikuti filter)
    const byCat = {};
    bpFiltered().forEach(e => { byCat[e.kategori] = (byCat[e.kategori] || 0) + Number(e.profit); });
    const cats = Object.keys(byCat).filter(k => byCat[k] > 0);
    const pal = [_tc.gold, _tc.info, _tc.danger, _tc.success, _tc.text];
    draw("bpChartKomposisi", { type: "doughnut", data: { labels: cats, datasets: [{ data: cats.map(k => byCat[k]), backgroundColor: cats.map((_, i) => pal[i % pal.length]), borderColor: _tc.surface, borderWidth: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: c => " " + c.label + ": " + bpRp(c.parsed) } } } } });
}

/* ---------------- Tambah Bot Order (manual) ---------------- */
function bpBotForm() {
    modalBox.innerHTML = `<div class="modal-icon info">📦</div><div class="modal-title">Tambah Bot Order</div>
        <div class="modal-form">
            <div class="bp-grid2">
                <div class="field"><label for="bpBPaket">Paket</label><select id="bpBPaket"><option value="BEM">BEM Bot</option><option value="SEM">SEM Bot</option><option value="LEM">LEM Bot</option></select></div>
                <div class="field"><label for="bpBJumlah">Jumlah tagar</label><input type="number" id="bpBJumlah" min="1" inputmode="numeric" placeholder="mis. 50"></div>
            </div>
            <div class="bp-grid2">
                <div class="field"><label for="bpBTgl">Tanggal</label><input type="date" id="bpBTgl" value="${bpToday()}"></div>
                <div class="field"><label for="bpBHarga">Harga / tagar (opsional)</label><input type="number" id="bpBHarga" min="0" inputmode="numeric" placeholder="otomatis dari Price"></div>
            </div>
            <div class="field"><label for="bpBPel">Pelanggan (opsional)</label><input type="text" id="bpBPel" maxlength="120"></div>
            <div class="field"><label for="bpBKet">Keterangan (opsional)</label><input type="text" id="bpBKet" maxlength="200"></div>
            <div class="bp-hint" id="bpBHint"></div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="bpBNo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="bpBYes">Simpan</button></div>`;
    modalOverlay.classList.add("show");
    const upd = () => {
        const k = bpEl("bpBPaket").value.toLowerCase(), n = bpInt("bpBJumlah");
        const harga = bpInt("bpBHarga") || Number((bpData.harga || {})["bot_" + k] || 0);
        const modal = Number((bpData.settings || {})["modal_bot_" + k] || 0);
        const omset = harga * n, mod = modal * n, p = omset - mod;
        bpEl("bpBHint").innerHTML = `Harga ${bpRp(harga)} / tagar · modal ${bpRp(modal)} / tagar<br>Omset <b>${bpRp(omset)}</b> − modal <b>${bpRp(mod)}</b> = profit <b style="color:var(--${p >= 0 ? "success" : "danger"})">${bpRp(p)}</b>`
            + (harga ? "" : `<br><span style="color:var(--danger)">Harga bot belum diisi di halaman Price.</span>`);
    };
    ["bpBPaket", "bpBJumlah", "bpBHarga"].forEach(i => { bpEl(i).addEventListener("input", upd); bpEl(i).addEventListener("change", upd); }); upd();
    bpEl("bpBNo").addEventListener("click", closeModal);
    bpEl("bpBYes").addEventListener("click", async () => {
        if (bpInt("bpBJumlah") < 1) { showToast("Isi jumlah tagar", "danger"); return; }
        const { data, error } = await bpRpc("bp_add_bot", { p_paket: bpEl("bpBPaket").value, p_jumlah: bpInt("bpBJumlah"), p_pelanggan: bpEl("bpBPel").value.trim(),
            p_keterangan: bpEl("bpBKet").value.trim(), p_tanggal: bpEl("bpBTgl").value || bpToday(), p_harga_tagar: bpInt("bpBHarga") || null });
        if (error) return;
        closeModal(); showToast(`Bot order tercatat: ${bpRp(data.omset)} (profit ${bpRp(data.profit)})`, "success"); bpLoad();
    });
}

/* ---------------- Catat penjualan barang (harga etalase + modal dari menu Modal) ---------------- */
async function bpItemForm() {
    const items = await mdLoadSellable();
    if (!items.length) { showToast("Belum ada barang di etalase", "danger"); return; }
    modalBox.innerHTML = `<div class="modal-icon info">🛒</div><div class="modal-title">Catat Penjualan Barang</div>
        <div class="modal-form">
            <div class="bp-grid2">
                <div class="field"><label for="bpICat">Kategori</label><select id="bpICat"></select></div>
                <div class="field"><label for="bpIItem">Barang</label><select id="bpIItem"></select></div>
            </div>
            <div class="bp-grid2">
                <div class="field"><label for="bpIQty">Jumlah</label><input type="number" id="bpIQty" min="1" inputmode="numeric" value="1"></div>
                <div class="field"><label for="bpIHarga">Harga jual / satuan (Rp)</label><input type="number" id="bpIHarga" min="0" inputmode="numeric"></div>
            </div>
            <div class="bp-grid2">
                <div class="field"><label for="bpITgl">Tanggal</label><input type="date" id="bpITgl" value="${bpToday()}"></div>
                <div class="field"><label for="bpIPel">Pelanggan (opsional)</label><input type="text" id="bpIPel" maxlength="120"></div>
            </div>
            <div class="bp-hint" id="bpIHint"></div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="bpINo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="bpIYes">Simpan</button></div>`;
    modalOverlay.classList.add("show");
    const cur = () => items.find(i => i.key === bpEl("bpIItem").value);
    const fillPrice = () => { const it = cur(); bpEl("bpIHarga").value = it && Number(it.harga) > 0 ? it.harga : ""; upd(); };
    const upd = () => {
        const it = cur(), q = bpInt("bpIQty"), harga = bpInt("bpIHarga"), m = it ? Number(it.modal) : 0, omset = harga * q, mod = m * q, p = omset - mod;
        bpEl("bpIHint").innerHTML = `Harga ${bpRp(harga)} · modal ${bpRp(m)} / ${escapeHtml(it ? it.satuan.replace(/^\/\s*/, "") : "satuan")}<br>Omset <b>${bpRp(omset)}</b> − modal <b>${bpRp(mod)}</b> = profit <b style="color:var(--${p >= 0 ? "success" : "danger"})">${bpRp(p)}</b>`
            + (it && !it.diisi ? `<br><span style="color:var(--danger)">Modal barang ini belum diisi di menu Modal.</span>` : "");
    };
    mdBindPicker(bpEl("bpICat"), bpEl("bpIItem"), items, { onChange: fillPrice });
    ["bpIQty", "bpIHarga"].forEach(i => bpEl(i).addEventListener("input", upd));
    fillPrice();
    bpEl("bpINo").addEventListener("click", closeModal);
    bpEl("bpIYes").addEventListener("click", async () => {
        if (bpInt("bpIQty") < 1) { showToast("Isi jumlah", "danger"); return; }
        if (bpInt("bpIHarga") < 1) { showToast("Harga jual belum ada, isi harga jual", "danger"); return; }
        const { data, error } = await bpRpc("bp_add_item_sale", { p_key: bpEl("bpIItem").value, p_qty: bpInt("bpIQty"), p_harga: bpInt("bpIHarga"),
            p_pelanggan: bpEl("bpIPel").value.trim(), p_keterangan: null, p_tanggal: bpEl("bpITgl").value || bpToday() });
        if (error) return;
        closeModal(); showToast(`Tercatat: ${bpRp(data.omset)} (profit ${bpRp(data.profit)})`, "success"); bpLoad();
    });
}

/* ---------------- Tambah manual / ubah / hapus ---------------- */
function bpEntryForm(id) {
    const e = id ? bpData.entries.find(x => x.id === id) : null;
    const manual = !e || e.jenis === "manual";
    modalBox.innerHTML = `<div class="modal-icon info">💵</div><div class="modal-title">${e ? "Ubah Catatan" : "Catat Pemasukan Manual"}</div>
        <div class="modal-form">
            <div class="bp-grid2">
                <div class="field"><label for="bpETgl">Tanggal</label><input type="date" id="bpETgl" value="${e ? e.tanggal : bpToday()}"></div>
                <div class="field"><label for="bpEKat">Kategori</label>${manual
                    ? `<input type="text" id="bpEKat" list="bpKatList" maxlength="60" value="${escapeHtml(e ? e.kategori : "Penjualan Akun")}" autocomplete="off"><datalist id="bpKatList"><option value="Penjualan Akun"><option value="Lainnya"></datalist>`
                    : `<input type="text" id="bpEKat" value="${escapeHtml(e.kategori)}" disabled>`}</div>
            </div>
            <div class="field"><label for="bpEPel">Pelanggan / sumber (opsional)</label><input type="text" id="bpEPel" maxlength="120" value="${escapeHtml(e ? e.pelanggan : "")}"></div>
            <div class="field"><label for="bpEKet">Keterangan (opsional)</label><input type="text" id="bpEKet" maxlength="200" value="${escapeHtml(e ? e.keterangan : "")}" placeholder="mis. 2 akun jagung"></div>
            <div class="bp-grid2">
                <div class="field"><label for="bpEOmset">Pendapatan (Rp)</label><input type="number" id="bpEOmset" min="0" inputmode="numeric" value="${e ? e.omset : ""}"></div>
                <div class="field"><label for="bpEModal">Modal (Rp, opsional)</label><input type="number" id="bpEModal" min="0" inputmode="numeric" value="${e ? e.modal : ""}" placeholder="0"></div>
            </div>
            <div class="bp-hint" id="bpEProfit"></div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost btn-wrap" id="bpENo">Batal</button><button type="button" class="btn btn-primary btn-wrap" id="bpEYes">Simpan</button></div>`;
    modalOverlay.classList.add("show");
    const upd = () => { const p = bpInt("bpEOmset") - bpInt("bpEModal"); bpEl("bpEProfit").innerHTML = `Profit: <b style="color:var(--${p >= 0 ? "success" : "danger"})">${bpRp(p)}</b>`; };
    ["bpEOmset", "bpEModal"].forEach(i => bpEl(i).addEventListener("input", upd)); upd();
    bpEl("bpENo").addEventListener("click", closeModal);
    bpEl("bpEYes").addEventListener("click", async () => {
        const kat = bpEl("bpEKat").value.trim();
        if (manual && !kat) { showToast("Kategori wajib diisi", "danger"); return; }
        if (!bpEl("bpEOmset").value) { showToast("Isi pendapatan", "danger"); return; }
        const { error } = await bpRpc("bp_entry_save", { p_id: e ? e.id : null, p_tanggal: bpEl("bpETgl").value || bpToday(), p_kategori: kat, p_pelanggan: bpEl("bpEPel").value.trim(),
            p_keterangan: bpEl("bpEKet").value.trim(), p_omset: bpInt("bpEOmset"), p_modal: bpInt("bpEModal") });
        if (error) return;
        closeModal(); showToast("Catatan disimpan", "success"); bpLoad();
    });
}
function bpEntryDelete(id) {
    const e = bpData.entries.find(x => x.id === id); if (!e) return;
    openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus Catatan?", body: `${escapeHtml(e.kategori)} · ${bpRp(e.omset)} akan dihapus dari BSL Profit.`, confirmText: "Ya, Hapus", confirmClass: "btn-danger",
        onConfirm: async () => { const { error } = await bpRpc("bp_entry_delete", { p_id: id }); if (!error) { showToast("Catatan dihapus", "danger"); bpLoad(); } } });
}

document.addEventListener("DOMContentLoaded", bpInitOrderForm);
