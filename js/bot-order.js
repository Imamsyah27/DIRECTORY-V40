/**
 * Antrian BOT ORDER (admin). Pelanggan memesan BEM/SEM/LEM Bot lewat portal pelanggan.
 * 1 pesanan (berapa pun jumlah tagarnya) = 1 baris. Daftar tagar lengkap tidak ditampilkan
 * kecuali admin membukanya (hemat ruang UI). Butuh sql/bot-order.sql.
 * SETUJUI -> otomatis tercatat di BSL Profit.
 */
const boEl = id => document.getElementById(id);
const boPin = () => sessionStorage.getItem("akun_admin_pin");
const boRp = n => "Rp " + Number(n || 0).toLocaleString("id-ID");
const boWaktu = iso => iso ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
const boIsBulk = r => r.dashboard === "BULK";
const boBulkLabel = r => `BEM ${r.n_bem} · SEM ${r.n_sem} · LEM ${r.n_lem}`;
const boTierLabel = r => ({ 1: "1–5", 2: "6–10", 3: "11–50", 4: "51–100" })[r.bulk_tier] || "";
/* daftar tagar di cache: array (bot biasa) atau {bem, sem, lem} (bulk) */
const boFlat = d => Array.isArray(d) ? d : [...(d.bem || []), ...(d.sem || []), ...(d.lem || [])];
function boTagsHtml(r, d) {
    const head = (n, txt, copyKey) => `<div class="bo-tags-head"><b>${txt}</b> <button class="btn btn-ghost mini" data-act="copy" data-id="${r.id}" data-part="${copyKey}">📋 Salin${copyKey === "all" ? " semua" : ""}</button></div>`;
    if (Array.isArray(d)) return `${head(d.length, d.length + " tagar", "all")}<ol class="bo-tags">${d.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ol>`;
    const part = (k, name) => (d[k] || []).length ? `<div class="bo-bulk-part"><div class="bo-tags-head"><b>${name} · ${d[k].length} tagar</b> <button class="btn btn-ghost mini" data-act="copy" data-id="${r.id}" data-part="${k}">📋 Salin ${name}</button></div><ol class="bo-tags">${d[k].map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ol></div>` : "";
    return `${head(0, "🧺 " + boFlat(d).length + " tagar total", "all")}${part("bem", "BEM")}${part("sem", "SEM")}${part("lem", "LEM")}`;
}
let boKind = "bot";   // tab aktif: "bot" (Bot Order biasa) atau "bulk" (Bulk Order) — daftar dipisah supaya tidak tertukar
function boSetKind(k) {
    boKind = k === "bulk" ? "bulk" : "bot";
    const bulk = boKind === "bulk";
    boEl("boTitle").textContent = bulk ? "🧺 Antrian Bulk Order" : "🤖 Antrian Bot Order";
    boEl("boNote").innerHTML = bulk ? "Bulk Order = BEM + SEM + LEM dalam 1 pesanan. Saat <b>Setujui</b>, otomatis dicatat di <b>BSL Profit</b> (omset = total bayar, modal = modal bot tiap paket × jumlah tagarnya)."
        : "Saat Anda menekan <b>Setujui</b>, pesanan otomatis dicatat di <b>BSL Profit</b> (omset = total bayar, modal = modal bot × jumlah tagar).";
    boEl("boThPkg").textContent = bulk ? "Isi per paket" : "Paket";
    boEl("boThHarga").textContent = bulk ? "Tier" : "Harga/tagar";
    boEl("boEmpty").textContent = bulk ? "Belum ada bulk order." : "Belum ada bot order.";
    boEl("boPinSubmit").textContent = bulk ? "Buka Bulk Order" : "Buka Bot Order";
    if (boAll.length) boRender();
}
let boAll = [], boFilter = "pending", boOpen = new Set(), boTagCache = {}, boBound = false;

async function boRpc(name, params) {
    const res = await supabaseClient.rpc(name, { p_pin: boPin(), ...params });
    if (res.error) {
        const m = res.error.message || "";
        console.error(res.error);
        if (m.includes("PIN admin salah")) {
            sessionStorage.removeItem("akun_admin_pin");
            boEl("boPinGate").style.display = "block"; boEl("boContent").style.display = "none";
            showToast("PIN admin tidak valid, masukkan ulang", "danger");
        } else if (/does not exist|schema cache|Could not find the function/i.test(m)) showToast("Jalankan dulu sql/bot-order.sql, sql/bot-order-kirim-arsip.sql dan sql/koin-usdt-15-bulk-order.sql di Supabase SQL Editor", "danger");
        else showToast(m || "Terjadi kesalahan", "danger");
    }
    return res;
}

function initBotOrderPage() {
    if (!boBound) {
        boBound = true;
        const submit = () => {
            const pin = boEl("boPinInput").value; if (!pin) { showToast("Masukkan PIN admin", "danger"); return; }
            sessionStorage.setItem("akun_admin_pin", pin); boEl("boPinInput").value = ""; boShow();
        };
        boEl("boPinSubmit").addEventListener("click", submit);
        boEl("boPinInput").addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        boEl("boFilter").addEventListener("click", e => { const b = e.target.closest("button[data-f]"); if (b) { boFilter = b.dataset.f; boRender(); } });
        boEl("boBody").addEventListener("click", boOnClick);
        boEl("boBody").addEventListener("change", boOnChange);
        boEl("boArchiveSent").addEventListener("click", boArchiveSent);
        const goBot = boEl("dashBotTab"); if (goBot) goBot.addEventListener("click", () => { document.querySelector('#pageNav button[data-page="order"]').click(); if (typeof ordShow === "function") ordShow("bot"); });
    }
    if (boPin()) boShow();
    else { boEl("boPinGate").style.display = "block"; boEl("boContent").style.display = "none"; }
}
async function boShow() {
    boEl("boPinGate").style.display = "none"; boEl("boContent").style.display = "block";
    await boLoad();
}
async function boLoad() {
    if (!boPin()) return;
    const { data, error } = await boRpc("bot_list", {});
    if (error) return;
    boAll = data || []; boRender();
}
/* status turunan: pending | rejected | kirim (disetujui, belum dikirim) | sent (sudah dikirim) */
const boState = r => r.status === "approved" ? (r.dikirim_at ? "sent" : "kirim") : r.status;
function boBadge() {
    const open = r => !r.arsip && (r.status === "pending" || boState(r) === "kirim");
    const nBulk = boAll.filter(r => boIsBulk(r) && open(r)).length, nBot = boAll.filter(r => !boIsBulk(r) && open(r)).length;
    [["boNavBadge", nBot], ["bkNavBadge", nBulk], ["boDashBadge", nBot + nBulk]].forEach(([id, n]) => { const b = boEl(id); if (b) { b.textContent = n; b.style.display = n ? "inline-block" : "none"; } });
}

function boMatch(r, f) {
    if (boIsBulk(r) !== (boKind === "bulk")) return false;      // tab Bot hanya Bot Order, tab Bulk hanya Bulk Order
    if (f === "arsip") return !!r.arsip;
    if (f === "all") return true;
    return !r.arsip && boState(r) === f;
}
function boRender() {
    boBadge();
    boEl("boFilter").querySelectorAll("button").forEach(b => { b.classList.toggle("on", b.dataset.f === boFilter); b.querySelector("i").textContent = boAll.filter(r => boMatch(r, b.dataset.f)).length; });
    const sentN = boAll.filter(r => boMatch(r, "sent")).length;
    boEl("boBulk").style.display = sentN ? "block" : "none"; boEl("boSentN").textContent = sentN;
    const rows = boAll.filter(r => boMatch(r, boFilter));
    boEl("boEmpty").style.display = rows.length ? "none" : "block";
    const pill = { pending: ["⏳ Menunggu", "bp-pill mn"], kirim: ["📮 Perlu dikirim", "bp-pill rq"], sent: ["✅ Terkirim", "bp-pill rq"], rejected: ["✖ Ditolak", "bp-pill mn"] };
    boEl("boBody").innerHTML = rows.map(r => {
        const open = boOpen.has(r.id), stt = boState(r), st = pill[stt] || [r.status, "bp-pill mn"];
        const wa = String(r.whatsapp || "").replace(/[^0-9]/g, "");
        const msg = `Halo ${r.username}, ${boIsBulk(r) ? "bulk order" : "bot order " + r.dashboard} (${r.jumlah} tagar, ${boRp(r.total_harga)}) `;
        let acts;
        if (r.arsip) acts = `<button class="btn btn-ghost mini" data-act="unarsip" data-id="${r.id}">↩ Kembalikan</button> <button class="btn btn-ghost mini" data-act="del" data-id="${r.id}">Hapus</button>`;
        else if (stt === "pending") acts = `<button class="btn btn-success mini" data-act="ok" data-id="${r.id}">Setujui</button> <button class="btn btn-ghost mini" data-act="no" data-id="${r.id}">Tolak</button>`;
        else if (stt === "sent" || stt === "rejected") acts = `<button class="btn btn-ghost mini" data-act="arsip" data-id="${r.id}">📦 Arsipkan</button>`;
        else acts = `<span class="bo-hint">centang “Dikirim” bila sudah</span>`;
        const chk = (stt === "kirim" || stt === "sent") && !r.arsip
            ? `<label class="bo-chk"><input type="checkbox" data-id="${r.id}" ${r.dikirim_at ? "checked" : ""}><span></span></label>${r.dikirim_at ? `<small class="bo-sent-at">${boWaktu(r.dikirim_at)}</small>` : ""}`
            : (r.dikirim_at ? `<small class="bo-sent-at">${boWaktu(r.dikirim_at)}</small>` : "—");
        const tags = open ? `<tr class="bo-tags-row"><td colspan="9">${boTagCache[r.id] ? boTagsHtml(r, boTagCache[r.id]) : "Memuat…"}
            ${r.catatan_pelanggan ? `<div class="bo-note">📝 ${escapeHtml(r.catatan_pelanggan)}</div>` : ""}</td></tr>` : "";
        return `<tr class="${r.arsip ? "bo-archived" : ""}">
            <td>${boWaktu(r.created_at)}<br><small>#${r.id}</small></td>
            <td><b>${escapeHtml(r.username)}</b>${wa ? `<br><a href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener"><small>💬 WhatsApp</small></a>` : ""}</td>
            <td>${boIsBulk(r) ? `<span class="chip">🧺 BULK</span><br><small>${boBulkLabel(r)}</small>` : `<span class="chip">${escapeHtml(r.dashboard)} Bot</span>`}</td>
            <td><button type="button" class="bo-count" data-act="tags" data-id="${r.id}">${open ? "▾" : "▸"} ${r.jumlah} tagar</button><br><small class="bo-first">${escapeHtml(r.tagar_pertama || "")}${r.jumlah > 1 ? " …" : ""}</small>${r.catatan_pelanggan ? `<div class="bo-note-inline">📝 ${escapeHtml(r.catatan_pelanggan)}</div>` : ""}</td>
            <td>${boIsBulk(r) ? `<small>tier ${boTierLabel(r)}</small>` : boRp(r.harga_tagar)}</td><td><b>${boRp(r.total_harga)}</b></td>
            <td><span class="${st[1]}">${st[0]}</span>${r.arsip ? `<br><small>🗂️ arsip</small>` : ""}${r.catatan_admin ? `<br><small>${escapeHtml(r.catatan_admin)}</small>` : ""}</td>
            <td class="bo-sent-cell">${chk}</td>
            <td style="white-space:nowrap;">${acts}</td></tr>${tags}`;
    }).join("");
}

/* centang "Dikirim" */
async function boOnChange(e) {
    const c = e.target.closest('input[type="checkbox"][data-id]'); if (!c) return;
    const id = Number(c.dataset.id), want = c.checked;
    const { error } = await boRpc("bot_set_dikirim", { p_id: id, p_dikirim: want });
    if (error) { c.checked = !want; return; }
    showToast(want ? "Ditandai sudah dikirim" : "Tanda dikirim dilepas", want ? "success" : "info");
    boLoad();
}
function boArchiveSent() {
    const n = boAll.filter(r => boMatch(r, "sent")).length; if (!n) return;
    openConfirmModal({ icon: "📦", iconClass: "info", title: "Arsipkan semua yang terkirim?", body: `<b>${n} bot order</b> yang sudah dikirim dipindah ke Arsip. Masih bisa dikembalikan.`,
        confirmText: "Ya, Arsipkan", confirmClass: "btn-primary",
        onConfirm: async () => { const { data, error } = await boRpc("bot_archive_sent", { p_bulk: boKind === "bulk" }); if (!error) { showToast(`${data} ${boKind === "bulk" ? "bulk" : "bot"} order diarsipkan`, "success"); boLoad(); } } });
}

async function boOnClick(e) {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = Number(b.dataset.id), act = b.dataset.act, r = boAll.find(x => x.id === id); if (!r) return;
    if (act === "tags") {
        if (boOpen.has(id)) { boOpen.delete(id); boRender(); return; }
        boOpen.add(id); boRender();
        if (!boTagCache[id]) { const { data, error } = await boRpc("bot_tags", { p_id: id }); if (error) { boOpen.delete(id); boRender(); return; } boTagCache[id] = data || []; boRender(); }
    } else if (act === "copy") {
        const d = boTagCache[id] || [], part = b.dataset.part;
        const text = (Array.isArray(d) ? d : part && part !== "all" ? (d[part] || []) : boFlat(d)).join("\n");
        try { await navigator.clipboard.writeText(text); showToast("Daftar tagar disalin", "success"); } catch (_) { showToast("Gagal menyalin", "danger"); }
    } else if (act === "ok") {
        openConfirmModal({ icon: "✅", iconClass: "success", title: "Setujui Bot Order?",
            body: boIsBulk(r) ? `<b>${escapeHtml(r.username)}</b> — Bulk Order (${boBulkLabel(r)}), <b>${r.jumlah} tagar</b> = <b>${boRp(r.total_harga)}</b>.<br>Otomatis tercatat di <b>BSL Profit</b>.`
                : `<b>${escapeHtml(r.username)}</b> — ${r.dashboard} Bot, <b>${r.jumlah} tagar</b> × ${boRp(r.harga_tagar)} = <b>${boRp(r.total_harga)}</b>.<br>Otomatis tercatat di <b>BSL Profit</b>.`,
            confirmText: "Ya, Setujui", confirmClass: "btn-success",
            onConfirm: async () => {
                const { data, error } = await boRpc("bot_approve", { p_id: id });
                if (error) { boLoad(); return; }
                showToast(`Disetujui — profit tercatat ${boRp(data.profit)}`, "success"); boLoad();
            } });
    } else if (act === "no") {
        openConfirmModal({ icon: "✖", iconClass: "danger", title: "Tolak Bot Order?", body: `Bot order <b>#${id}</b> dari <b>${escapeHtml(r.username)}</b> akan ditolak.`,
            confirmText: "Ya, Tolak", confirmClass: "btn-danger",
            onConfirm: async () => { const { error } = await boRpc("bot_reject", { p_id: id }); if (!error) { showToast("Bot order ditolak", "danger"); boLoad(); } } });
    } else if (act === "arsip" || act === "unarsip") {
        const { error } = await boRpc("bot_set_arsip", { p_id: id, p_arsip: act === "arsip" });
        if (!error) { showToast(act === "arsip" ? "Diarsipkan" : "Dikembalikan dari arsip", "success"); boLoad(); }
    } else if (act === "del") {
        openConfirmModal({ icon: "🗑", iconClass: "danger", title: "Hapus dari antrian?", body: "Catatan BSL Profit yang sudah tercatat tidak ikut terhapus.",
            confirmText: "Hapus", confirmClass: "btn-danger",
            onConfirm: async () => { const { error } = await boRpc("bot_delete", { p_id: id }); if (!error) { boOpen.delete(id); delete boTagCache[id]; boLoad(); } } });
    }
}

// badge menu: diperbarui otomatis bila PIN sudah pernah dimasukkan
async function boRefreshBadge() {
    if (!boPin() || document.hidden) return;
    const { data, error } = await supabaseClient.rpc("bot_list", { p_pin: boPin() });
    if (!error && data) { boAll = data; boBadge(); }
}
document.addEventListener("DOMContentLoaded", () => { setTimeout(boRefreshBadge, 1500); setInterval(boRefreshBadge, 60000); });
