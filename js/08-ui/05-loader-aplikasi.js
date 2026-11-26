// =====================================================================
// APP SPLASH LOADER (5 DETIK) & TAB LAZY LOADING
// =====================================================================
function initAppLoader() {
  const loader = document.getElementById('appLoader');
  if (!loader) return;
  // Guard against running multiple times
  if (loader.dataset.loaderStarted === '1') return;
  loader.dataset.loaderStarted = '1';

  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  const status = document.getElementById('loaderStatus');

  const duration = 2800; // ~3 detik total
  const startTime = performance.now();
  let isDone = false;
  let timer = null;

  const stages = [
    { threshold: 18, text: 'Memuat modul dan komponen sistem...' },
    { threshold: 38, text: 'Sinkronisasi tarif PMK SBM 2026...' },
    { threshold: 62, text: 'Menyiapkan template dokumen & SPPD...' },
    { threshold: 82, text: 'Menginisialisasi modul kuitansi & nominatif...' },
    { threshold: 99, text: 'Memuat antarmuka pengguna...' },
    { threshold: 100, text: 'Aplikasi siap digunakan!' }
  ];

  function dismissLoader() {
    if (isDone) return;
    isDone = true;
    if (timer) clearInterval(timer);
    if (fill) fill.style.width = '100%';
    if (pct) pct.textContent = '100%';
    loader.setAttribute('aria-valuenow', '100');
    setTimeout(() => {
      loader.classList.add('is-hidden');
      initWelcomeModalAfterLoader();
    }, 250);
  }

  // Click or keypress on splash screen skips immediately
  loader.style.cursor = 'pointer';
  loader.title = 'Klik untuk langsung masuk ke aplikasi';
  loader.addEventListener('click', dismissLoader);

  function step() {
    if (isDone) return;
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const currentPct = Math.min(100, Math.round(ease * 100));

    if (fill) fill.style.width = currentPct + '%';
    if (pct) pct.textContent = currentPct + '%';
    loader.setAttribute('aria-valuenow', String(currentPct));

    const stage = stages.find(s => currentPct <= s.threshold) || stages[stages.length - 1];
    if (status && stage) status.textContent = stage.text;

    if (progress >= 1) {
      dismissLoader();
    }
  }

  // Interval guarantees execution even if tab is in background or rAF is throttled
  timer = setInterval(step, 25);
  step();

  // Safety hard timeout (3.5 detik) - guarantees splash screen NEVER gets stuck
  setTimeout(() => {
    if (!isDone) dismissLoader();
  }, 3500);
}

let pageLoaderTimer = null;

function showPageTransitionLoader(targetName, onSwitch) {
  const loader = document.getElementById('pageLoader');
  const textEl = document.getElementById('pageLoaderText');

  if (textEl) {
    const meta = tabMeta[targetName];
    const pageName = meta ? meta[0] : 'Halaman';
    textEl.textContent = `Memuat ${pageName}...`;
  }

  if (!loader) {
    if (onSwitch) onSwitch();
    return;
  }

  loader.classList.add('is-active');

  if (pageLoaderTimer) clearTimeout(pageLoaderTimer);
  pageLoaderTimer = setTimeout(() => {
    if (onSwitch) onSwitch();
    setTimeout(() => {
      loader.classList.remove('is-active');
    }, 100);
  }, 420);
}

function triggerTabProgress(callback) {
  const bar = document.getElementById('tabProgress');
  if (!bar) {
    if (callback) callback();
    return;
  }
  bar.classList.remove('is-done');
  bar.classList.add('is-loading');

  setTimeout(() => {
    if (callback) callback();
    bar.classList.remove('is-loading');
    bar.classList.add('is-done');
    setTimeout(() => {
      bar.classList.remove('is-done');
    }, 450);
  }, 220);
}

function initWelcomeModalAfterLoader() {
  let isDismissed = false;
  try {
    isDismissed = localStorage.getItem('perdinku_welcome_dismissed') === '1';
  } catch (e) {}

  // Hanya tampilkan sambutan jika user sudah login (tidak terkunci di gerbang login)
  if (!isDismissed && !document.body.classList.contains('auth-locked')) {
    setTimeout(() => {
      openWelcome();
    }, 300);
  }
}

