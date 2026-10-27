# Update 10

## Jalankan SQL (Supabase SQL Editor, urut, aman diulang)
1. `sql/koin-usdt-9-farm-foto.sql`   — foto + deskripsi akun pada Farm Sell
2. `sql/bot-order-tagar-pelanggan.sql` — pelanggan bisa membuka daftar tagar bot order miliknya

(Bahasa Turki tidak butuh SQL.)

## Isi update
1. **Farm Sell — foto & deskripsi**: menu Farm Sell → pilih batch → blok "Foto & Deskripsi Akun".
   Pelanggan melihatnya di kartu Farm (Supply & Stock → Katalog → Farm); klik foto untuk memperbesar.
   Sebelum membeli muncul konfirmasi (akun, jumlah × harga, total, saldo, sisa saldo). Token yang dibeli
   masuk ke **Pembelian Farm Saya** (riwayat lama `farm_sales`, tidak diganti) + tombol Salin.
2. **Bot Order pelanggan**: tab Bot Order → tekan "▸ N tagar" untuk membuka daftar tagar (sama seperti admin), ada tombol Salin semua.
3. **Bahasa Turki (TR)**: tombol TR di login & dashboard pelanggan. Semua teks ada di `pelanggan/js/lang-tr.js`.

## File yang berubah
- admin: `index.html`, `js/farmsell.js`, `theme-dark.css`
- pelanggan: `index.html`, `dashboard.html`, `js/i18n.js`, `js/lang-tr.js` (baru), `js/catalog.js`, `js/payment.js`, `js/bot-order.js`, `js/coin.js`, `js/price.js`, `js/portal-extra.js`, `theme-dark.css`
- sql baru: `koin-usdt-9-farm-foto.sql`, `bot-order-tagar-pelanggan.sql`
