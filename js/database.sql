create table orders (
    id bigint generated always as identity primary key,

    dashboard text not null,
    nomor_pesanan text not null,

    tagar text not null,

    nomor_whatsapp text,

    paket_total integer not null,
    paket_terkirim integer default 0,

    last_check_utc text default '',

    keterangan text default '',

    created_at timestamptz default now()
);

alter table orders enable row level security;

create policy "public_select"
on orders
for select
using (true);

create policy "public_insert"
on orders
for insert
with check (true);

create policy "public_update"
on orders
for update
using (true);

create policy "public_delete"
on orders
for delete
using (true);

-- ====================================================================
-- TABEL PRODUK (menu "Produk": Akun 10 BOX / Akun 9 BOX x BEM/LEM/SEM)
-- ====================================================================

create table products (
    id bigint generated always as identity primary key,

    kategori text not null,        -- '10BOX' atau '9BOX'
    dashboard text not null,       -- 'BEM' / 'LEM' / 'SEM'

    nama_produk text not null,     -- cth. 'NEW BEM VOL 2'

    jumlah_akun integer not null,  -- kapasitas total, cth. 100
    terpakai integer default 0,    -- akun sudah terpakai, cth. 24

    daftar_error text default '',  -- daftar tagar/nomor akun error (satu per baris)
    list_tagar text default '',    -- daftar tagar akun (satu per baris, tersembunyi di tabel, dibuka lewat tombol 🏷️)

    isi_ulang boolean,             -- null = belum diputuskan, true = isi ulang, false = tidak diisi ulang
    keterangan text default '',

    created_at timestamptz default now()
);

alter table products enable row level security;

create policy "public_select"
on products
for select
using (true);

create policy "public_insert"
on products
for insert
with check (true);

create policy "public_update"
on products
for update
using (true);

create policy "public_delete"
on products
for delete
using (true);

-- ====================================================================
-- TABEL TAGAR_BATCHES (menu "Tagar": input massal + auto-bagi tabel)
-- ====================================================================
-- Setiap kali tombol "Input & Bagi Tagar" diklik, satu baris baru
-- dibuat menyimpan seluruh hasil pemrosesan: daftar grup/tabel hasil
-- pembagian (kolom `groups`, format JSON array-of-array) dan daftar
-- tagar duplikat yang terdeteksi (kolom `duplicates`).

create table tagar_batches (
    id bigint generated always as identity primary key,

    raw_input text not null,          -- teks asli yang ditempel/diketik
    total_tagar integer not null default 0,
    unique_tagar integer not null default 0,
    duplicate_count integer not null default 0,
    group_count integer not null default 0,

    groups jsonb not null default '[]',      -- [["#tag1","#tag2",...], [...]]
    duplicates jsonb not null default '[]',  -- [{"tagar":"#tag1","count":2,"positions":[3,9]}]

    created_at timestamptz default now()
);

alter table tagar_batches enable row level security;

create policy "public_select"
on tagar_batches
for select
using (true);

create policy "public_insert"
on tagar_batches
for insert
with check (true);

create policy "public_delete"
on tagar_batches
for delete
using (true);
