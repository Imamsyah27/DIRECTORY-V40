// Sama persis dengan project Supabase yang dipakai dashboard admin Anda.
// Jika Anda mengganti Supabase project di /config.js utama, ganti juga di sini.

const SUPABASE_URL = "https://drryamosodluupxbbtee.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycnlhbW9zb2RsdXVweGJidGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzEwMTgsImV4cCI6MjA5ODgwNzAxOH0.q_Dq4w3Ugv7rCq3NeEXSIYEuNCbsG19Ghsj2vo0_TOc";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Kontak admin untuk konfirmasi perpanjangan langganan
const ADMIN_WA_DISPLAY = "085269368022";
const ADMIN_WA_INTL = "6285269368022";

// Messenger admin (tombol "Hubungi Admin" & pesan otomatis). Format: https://m.me/<id atau username>
const ADMIN_MESSENGER_URL = "https://m.me/100075166710833";
