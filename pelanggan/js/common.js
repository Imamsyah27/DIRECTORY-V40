function showToast(message, type = "info") {
    let stack = document.getElementById("toastStack");
    if (!stack) {
        stack = document.createElement("div");
        stack.id = "toastStack";
        stack.className = "toast-stack";
        document.body.appendChild(stack);
    }
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    stack.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity .2s ease";
        setTimeout(() => toast.remove(), 200);
    }, 2800);
}

function showFormMsg(elId, message, type) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = message;
    el.className = `form-msg show ${type}`;
}

function clearFormMsg(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.className = "form-msg";
}

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function togglePasswordField(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        btnEl.textContent = "🙈";
    } else {
        input.type = "password";
        btnEl.textContent = "👁️";
    }
}

/* ---- Mode admin: admin masuk dari dashboard admin lewat #av=<token lihat> ---- */
(function () {
    const h = location.hash || "";
    const m = /[#&]av=([0-9a-fA-F-]{36})/.exec(h);
    if (!m) return;
    const n = /[&]n=([^&]*)/.exec(h), id = /[&]id=(\d+)/.exec(h);
    sessionStorage.setItem("admin_view_token", m[1]);
    sessionStorage.setItem("admin_view_name", n ? decodeURIComponent(n[1]) : "");
    sessionStorage.setItem("admin_view_id", id ? id[1] : "");
    sessionStorage.setItem("admin_view_back", "1");
    const b = /[&]b=([^&]*)/.exec(h);
    if (b) sessionStorage.setItem("admin_view_return", decodeURIComponent(b[1]));   // alamat dashboard admin (bisa beda domain)
    history.replaceState(null, "", location.pathname + location.search);
})();
function adminReturnUrl() { return sessionStorage.getItem("admin_view_return") || "../index.html"; }
function isAdminView() { return !!sessionStorage.getItem("admin_view_token"); }

function getSession() {
    return sessionStorage.getItem("admin_view_token") || localStorage.getItem("pelanggan_session_token");
}

function requireSessionOrRedirect() {
    const token = getSession();
    if (!token) {
        window.location.href = "index.html";
        return null;
    }
    return token;
}

function clearSession() {
    sessionStorage.removeItem("admin_view_token");   // token lihat kedaluwarsa -> auth.js mengembalikan admin ke dashboard admin
    localStorage.removeItem("pelanggan_session_token");
    localStorage.removeItem("pelanggan_username");
}

/* Ubah URL di teks menjadi link yang bisa diklik (aman: teks di-escape dulu). Mendukung https://, www., chat.whatsapp.com, wa.me, t.me */
function linkify(raw) {
    const safe = escapeHtml(raw);
    return safe.replace(/((?:https?:\/\/|www\.)(?:(?!&quot;|&#39;|&lt;|&gt;)[^\s<])+|(?:chat\.whatsapp\.com|wa\.me|t\.me)\/(?:(?!&quot;|&#39;|&lt;|&gt;)[^\s<])+)/gi, (m) => {
        let url = m, tail = "";
        const t = url.match(/[.,;:!?)\]}]+$/);
        if (t) { tail = t[0]; url = url.slice(0, -tail.length); }
        const href = /^https?:\/\//i.test(url) ? url : "https://" + url;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="auto-link">${url}</a>${tail}`;
    });
}
