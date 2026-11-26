// =====================================================================
// ANTARMUKA & INTERAKSI PENGGUNA (PerdinKu)
// Tema (Dark/Light), Navigasi Tab, Sidebar, Popup Selamat Datang,
// Pilihan Pegawai, dan Inisialisasi Aplikasi
// =====================================================================

// =====================================================================
// MODE TAMPILAN (terang / gelap / otomatis)
// =====================================================================
const THEME_STORAGE_KEY = 'perjadin-theme';
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');

function getThemeMode() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return ['light', 'dark', 'auto'].includes(saved) ? saved : 'auto';
}

function applyThemeMode(mode) {
  const dark = mode === 'dark' || (mode === 'auto' && themeMedia.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

function markThemeButtons(mode) {
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeMode === mode);
  });
}

function setThemeMode(mode) {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyThemeMode(mode);
  markThemeButtons(mode);
}

function initTheme() {
  const mode = getThemeMode();
  applyThemeMode(mode);
  markThemeButtons(mode);
  const onChange = () => { if (getThemeMode() === 'auto') applyThemeMode('auto'); };
  if (themeMedia.addEventListener) themeMedia.addEventListener('change', onChange);
  else themeMedia.addListener(onChange);
}

initTheme();

