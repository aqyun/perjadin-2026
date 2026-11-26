// =====================================================================
// PERDINKU 2026 - SUPABASE DATABASE & AUTHENTICATION INTEGRATION
// =====================================================================

// Backend sekarang PocketBase (server https://perdinku.thearchiver.my.id).
// Lapisan js/01-shim/01-pocketbase-shim.js meniru antarmuka supabase-js di atas PocketBase.
const DEFAULT_SUPABASE_URL = (typeof window !== 'undefined' && window.location.hostname.includes('thearchiver.my.id'))
  ? window.location.origin
  : 'https://perdinku.thearchiver.my.id';
const DEFAULT_SUPABASE_ANON_KEY = 'pocketbase';
const DEFAULT_SUPABASE_PUB_KEY = '';
const STORAGE_KEY_SB_URL = 'perdinku_sb_url';
const STORAGE_KEY_SB_ANON = 'perdinku_sb_anon_key';

let sbClient = null;
let currentAuthUser = null; // { id, email, nama, role: 'admin' | 'viewer' }

function setCurrentAuthUser(user) {
  currentAuthUser = user;
  window.currentAuthUser = user;
}

function getCurrentAuthUser() {
  return currentAuthUser;
}

// Ambil konfigurasi URL dan Anon Key dari localStorage atau default tertanam
function getSupabaseConfig() {
  let storedUrl = (localStorage.getItem(STORAGE_KEY_SB_URL) || '').trim();
  if (storedUrl.includes('supabase.co')) {
    localStorage.removeItem(STORAGE_KEY_SB_URL);
    storedUrl = '';
  }
  let storedAnon = (localStorage.getItem(STORAGE_KEY_SB_ANON) || '').trim();
  if (storedAnon && (storedAnon.includes('postgres') || storedAnon.includes('secret') || storedAnon.startsWith('eyJhbGci'))) {
    localStorage.removeItem(STORAGE_KEY_SB_ANON);
    storedAnon = '';
  }
  return {
    url: storedUrl || DEFAULT_SUPABASE_URL,
    anonKey: storedAnon || DEFAULT_SUPABASE_ANON_KEY
  };
}

// Inisialisasi Supabase Client
function getSupabaseClient() {
  if (sbClient) return sbClient;
  const cfg = getSupabaseConfig();
  if (!window.supabase || !cfg.url || !cfg.anonKey) return null;
  try {
    sbClient = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return sbClient;
  } catch (err) {
    console.error('Inisialisasi Supabase gagal:', err);
    return null;
  }
}

