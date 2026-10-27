# Update 12 (sudah mencakup Update 10 & 11)

## SQL yang dijalankan — Supabase SQL Editor, BERURUTAN, satu file satu kali Run (aman diulang)
Syarat lama (sudah pernah dijalankan): koin-usdt-1…8, katalog-pesan-baru.sql, katalog-kategori.sql, havsell.sql, farmsell.sql, supply*.sql.

| # | File | Isi | Asal |
|---|------|-----|------|
| 1 | `sql/koin-usdt-9-farm-foto.sql` | foto + deskripsi akun Farm Sell | Update 10 (lewati bila sudah) |
| 2 | `sql/bot-order-tagar-pelanggan.sql` | daftar tagar bot order untuk pelanggan | Update 10 (lewati bila sudah) |
| 3 | `sql/koin-usdt-10-hav-catalog.sql` | harga & penjualan Hav Token | Update 11 |
| 4 | `sql/koin-usdt-11-harga-item.sql` | tabel & menu admin harga custom semua item | **baru** |
| 5 | `sql/koin-usdt-11b-harga-item-pelanggan.sql` | harga custom berlaku di Farm/Hav/Katalog/Product | **baru** |
| 6 | `sql/koin-usdt-12-preorder.sql` | Pre Order: tabel + sisi admin | **baru** |
| 7 | `sql/koin-usdt-12b-preorder-pelanggan.sql` | Pre Order: sisi pelanggan + daftar harga | **baru** |

Jangan menjalankan #3 SESUDAH #5 (akan menimpa fungsi Hav dengan versi lama).

## Isi update
1. **Custom Price & Harga Pelanggan untuk semua item** — di form kedua menu muncul blok "Harga Item Lain" (Farm, Hav Token, Product tiap tier,
   Koin/Voucher/kategori lain, Pre Order). Daftar dibaca langsung dari database: barang/harga baru otomatis muncul.
   Custom Price = tersembunyi (tampil sebagai harga biasa); Harga Pelanggan = harga umum dicoret. Pembayaran memakai harga yang dilihat pelanggan.
2. **Pre Order** — admin: Supply & Stock → tab Pre Order (nama, harga koin per barang, deskripsi, foto, isi per farm, batas per batch);
   pesanan masuk: Order → Pre Order. Pelanggan: Catalog → Pre Order, format `tagar | jumlah` (jumlah = request farm, 1 request = 100 barang;
   `1k` otomatis jadi 10), maks 10 tagar & 10.000 barang per batch, bisa tambah batch (maks 5 sekali kirim).
