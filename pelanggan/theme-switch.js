/**
 * Ganti tema warna: putih / hitam / biru / pink.
 * - Bagian pertama dijalankan di <head> supaya tema langsung terpasang (tanpa kedip).
 * - Pilihan disimpan di localStorage (kunci = data-key pada tag <script>).
 * - Memicu event "themechange" agar grafik digambar ulang dengan warna baru.
 */
(function () {
    const KEY = (document.currentScript && document.currentScript.dataset.key) || "app_theme";
    const THEMES = ["putih", "hitam", "biru", "pink"];
    const LABEL = { putih: "Putih", hitam: "Hitam", biru: "Biru Muda", pink: "Pink" };
    const DEFAULT = "biru";
    const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
    let cur = THEMES.includes(get()) ? get() : DEFAULT;
    document.documentElement.setAttribute("data-theme", cur);

    function apply(name, announce) {
        if (!THEMES.includes(name)) return;
        cur = name;
        document.documentElement.setAttribute("data-theme", name);
        try { localStorage.setItem(KEY, name); } catch (e) {}
        const mc = document.querySelector('meta[name="theme-color"]');
        if (mc) mc.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
        document.querySelectorAll(".theme-switch button").forEach(b => {
            b.classList.toggle("active", b.dataset.themeSet === name);
            b.setAttribute("aria-pressed", String(b.dataset.themeSet === name));
        });
        if (announce) document.dispatchEvent(new CustomEvent("themechange", { detail: name }));
    }

    function build() {
        if (typeof TRANSLATIONS !== "undefined") {
            Object.assign(TRANSLATIONS.id, { theme_putih: "Putih", theme_hitam: "Hitam", theme_biru: "Biru Muda", theme_pink: "Pink", theme_title: "Warna tampilan" });
            Object.assign(TRANSLATIONS.en, { theme_putih: "White", theme_hitam: "Black", theme_biru: "Light Blue", theme_pink: "Pink", theme_title: "Theme color" });
        }
        const sw = document.createElement("div");
        sw.className = "theme-switch";
        sw.setAttribute("role", "group");
        sw.setAttribute("aria-label", "Warna tampilan");
        sw.innerHTML = THEMES.map(n =>
            `<button type="button" data-theme-set="${n}"><span class="dot"></span><span data-i18n="theme_${n}">${LABEL[n]}</span></button>`).join("");
        sw.addEventListener("click", e => { const b = e.target.closest("button[data-theme-set]"); if (b) apply(b.dataset.themeSet, true); });

        const lang = document.querySelector(".lang-switch");
        if (lang) {                       // portal pelanggan: sebaris dengan tombol bahasa
            const row = document.createElement("div");
            row.className = "switch-row";
            row.style.marginBottom = lang.style.marginBottom;
            lang.style.marginBottom = "0";
            lang.parentNode.insertBefore(row, lang);
            row.appendChild(sw); row.appendChild(lang);
        } else {                          // admin: di header
            const h = document.querySelector("header.app-header");
            if (h) h.appendChild(sw); else document.body.appendChild(sw);
        }
        apply(cur, false);
    }
    document.addEventListener("DOMContentLoaded", build);

    /** Warna untuk Chart.js, dibaca dari tema yang sedang aktif. */
    window.themeChartColors = function () {
        const s = getComputedStyle(document.documentElement);
        const v = n => s.getPropertyValue(n).trim();
        const rgb = n => v(n).replace(/\s/g, "");
        return {
            gold: v("--primary"), goldSoft: `rgba(${rgb("--primary-rgb")},.16)`, info: v("--info"), danger: v("--danger"),
            warning: v("--warning"), success: v("--success"), text: v("--text-secondary"), grid: v("--chart-grid"), surface: v("--surface")
        };
    };
})();
