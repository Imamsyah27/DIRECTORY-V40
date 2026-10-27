# Update 11 (menumpuk di atas Update 10)

## Jalankan SQL (Supabase SQL Editor, aman diulang)
- `sql/koin-usdt-10-hav-catalog.sql` — harga & penjualan Hav Token + riwayat pembelian Hav
(Koin & Voucher memakai SQL katalog yang sudah ada; Update 10 yang belum dijalankan: `koin-usdt-9-farm-foto.sql`, `bot-order-tagar-pelanggan.sql`.)

## Isi update
1. **Menu Catalog** (tab di samping Bot Order). Kotak dropdown: 🌱 Farm · 🔑 Hav Token · 📦 Product · 🪙 Koin · 🎟 Voucher (+ kategori lain buatan admin).
   Tab "Katalog" lama di dalam Supply & Stock dipindahkan ke sini; tab Supply & Stock tetap ada (stok + pesanan supply).
   Riwayat Pembelian (pesanan katalog, Farm, Hav Token) ada di bawah kotak.
2. **Isi Catalog dari admin**: Farm ← Farm Sell · Hav Token ← HAV Sell · Product ← Supply & Stock · Koin & Voucher ← menu baru **Koin & Voucher**.
   Pesanan Koin/Voucher masuk ke menu Order seperti sebelumnya.
3. **Harga Hav Token**: HAV Sell → pilih batch → "Jual di Catalog pelanggan" + harga koin / key. Setelah pembayaran koin berhasil, key otomatis dikirim
   (keluar dari Daftar Key → Arsip Key) dan tersimpan di Riwayat Pembelian. Catatan di jendela bayar memberi tahu pelanggan di mana key berada.
4. **Catatan konfirmasi Koin & Voucher**: jendela bayar memuat catatan "konfirmasi ke admin"; setelah order muncul tombol WhatsApp konfirmasi (nomor dari menu Panel).
5. **Bahasa**: Vietnam, Arab, Turki, Inggris, Indonesia sekarang lengkap (391 teks per bahasa) — `lang-vi.js`, `lang-ar.js`, `lang-tr.js`.
   Format angka & tanggal mengikuti bahasa.
6. Mode "lihat sebagai pelanggan" (admin) kini juga memblokir beli Farm / Hav Token / pesan Katalog.
