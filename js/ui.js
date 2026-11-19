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

// =====================================================================
// INIT
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Always trigger loader early so progress begins immediately
  try {
    initAppLoader();
  } catch (e) {
    console.warn('initAppLoader early launch error:', e);
  }

  try {
    // Populate provinsi dropdowns
    ['provinsiTujuan', 'provinsiTujuan1', 'provinsiTujuan2'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel || typeof sbmData === 'undefined' || !Array.isArray(sbmData)) return;
      sbmData.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = typeof formatProvinsi === 'function' ? formatProvinsi(s.provinsi) : s.provinsi;
        sel.appendChild(opt);
      });
    });
    if (typeof renderEmployeeList === 'function') renderEmployeeList();
    const datePill = document.getElementById('datePill');
    if (datePill) {
      datePill.textContent = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
    }
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const elTglST = document.getElementById('tglST'); if (elTglST && !elTglST.value) elTglST.value = today;
    const elTglSPD = document.getElementById('tglSPD'); if (elTglSPD && !elTglSPD.value) elTglSPD.value = today;
    const elTglBerangkat = document.getElementById('tglBerangkat'); if (elTglBerangkat && !elTglBerangkat.value) elTglBerangkat.value = today;
    const elTglKembali = document.getElementById('tglKembali'); if (elTglKembali && !elTglKembali.value) elTglKembali.value = today;

    if (typeof hitungLama === 'function') hitungLama();
    if (typeof toggleUHFields === 'function') toggleUHFields();
    if (typeof toggleHotelFields === 'function') toggleHotelFields();
    if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
    if (typeof setupRealtimeValidation === 'function') setupRealtimeValidation();
    if (typeof updateKKPBadgesAndNav === 'function') updateKKPBadgesAndNav();
    if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();
    if (typeof syncJenisPerjalananFromMak === 'function') syncJenisPerjalananFromMak();
  } catch (err) {
    console.error('PerdinKu initialization error:', err);
  }
});

// =====================================================================
// FORM VALIDATION & REQUIRED INDICATORS (!)
// =====================================================================
const REQUIRED_FIELDS = [
  { id: 'noST', label: 'Nomor Surat Tugas (ST)' },
  { id: 'tglST', label: 'Tanggal Surat Tugas' },
  { id: 'tglSPD', label: 'Tanggal SPD' },
  { id: 'tglBerangkat', label: 'Tanggal Berangkat' },
  { id: 'tglKembali', label: 'Tanggal Kembali' },
  { id: 'provinsiTujuan', label: 'Provinsi Tujuan' },
  { id: 'kotaTujuan', label: 'Kota / Kabupaten Tujuan' },
  { id: 'agenda', label: 'Agenda Perjalanan Dinas' },
  { id: 'kodeKegiatan', label: 'Kode Kegiatan' },
  { id: 'kodeSubKegiatan', label: 'Kode Sub Kegiatan' },
  { id: 'mak', label: 'MAK' }
];

let valToastTimer = null;

function validateTripForm() {
  const missing = [];

  REQUIRED_FIELDS.forEach(f => {
    if (f.id === 'provinsiTujuan' && typeof isMultiProvActive === 'function' && isMultiProvActive()) {
      const p1 = document.getElementById('provinsiTujuan1');
      const p2 = document.getElementById('provinsiTujuan2');
      const g1 = p1?.closest('.form-group');
      const g2 = p2?.closest('.form-group');
      const v1 = (p1?.value || '').trim();
      const v2 = (p2?.value || '').trim();
      if (!v1) {
        if (g1) g1.classList.add('has-error');
        missing.push({ el: p1, label: 'Provinsi Tujuan 1', id: 'provinsiTujuan1' });
      } else if (g1) {
        g1.classList.remove('has-error');
      }
      if (!v2) {
        if (g2) g2.classList.add('has-error');
        missing.push({ el: p2, label: 'Provinsi Tujuan 2', id: 'provinsiTujuan2' });
      } else if (g2) {
        g2.classList.remove('has-error');
      }
      return;
    }

    const el = document.getElementById(f.id);
    if (!el) return;
    const val = (el.value || '').trim();
    const group = el.closest('.form-group');
    if (!val) {
      if (group) group.classList.add('has-error');
      missing.push({ el, label: f.label, id: f.id });
    } else {
      if (group) group.classList.remove('has-error');
    }
  });

  // Cek tanggal kembali >= tanggal berangkat
  const tgl1 = document.getElementById('tglBerangkat')?.value;
  const tgl2 = document.getElementById('tglKembali')?.value;
  let dateMismatch = false;
  if (tgl1 && tgl2 && tgl2 < tgl1) {
    const group = document.getElementById('tglKembali')?.closest('.form-group');
    if (group) group.classList.add('has-error');
    missing.push({
      el: document.getElementById('tglKembali'),
      label: 'Tanggal Kembali (harus \u2265 Tanggal Berangkat)',
      id: 'tglKembali',
      customError: true
    });
    dateMismatch = true;
  }

  // Cek multi-provinsi pembagian hari
  if (typeof isMultiProvActive === 'function' && isMultiProvActive()) {
    const totalDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
    const h1 = parseInt(document.getElementById('hariProvinsi1')?.value) || 0;
    const h2 = parseInt(document.getElementById('hariProvinsi2')?.value) || 0;
    if (totalDays > 1 && (h1 <= 0 || h2 <= 0 || (h1 + h2 !== totalDays))) {
      missing.push({
        el: document.getElementById('hariProvinsi1'),
        label: `Pembagian hari (${h1} hr + ${h2} hr) harus sesuai total lama tugas (${totalDays} Hari)`,
        id: 'hariProvinsi1',
        customError: true
      });
    }
  }

  // Cek minimal 1 pegawai
  const selBox = document.getElementById('selectedBox');
  const empErr = document.getElementById('empErrorMsg');
  if (selectedEmpIds.size === 0) {
    if (selBox) selBox.classList.add('has-error');
    if (empErr) empErr.classList.add('is-visible');
    missing.push({
      el: selBox || document.getElementById('empSearch'),
      label: 'Minimal 1 Pegawai Ditugaskan',
      id: 'selectedBox'
    });
  } else {
    if (selBox) selBox.classList.remove('has-error');
    if (empErr) empErr.classList.remove('is-visible');
  }

  if (valToastTimer) clearTimeout(valToastTimer);
  valToastTimer = setTimeout(() => {
    hideValidationToast();
  }, 5000);

  // Return validation result so callers can check validity
  return { valid: missing.length === 0, missing, dateMismatch };
}

function showValidationToast(missingList, customMsg) {
  const toast = document.getElementById('valToast');
  if (!toast) return;
  const title = document.getElementById('valToastTitle');
  const desc = document.getElementById('valToastDesc');
  if (title) title.textContent = 'Isian Wajib Belum Lengkap';
  if (desc) {
    if (customMsg) {
      desc.textContent = customMsg;
    } else if (missingList && missingList.length > 0) {
      const names = missingList.slice(0, 3).map(m => m.label).join(', ');
      const more = missingList.length > 3 ? ` (+${missingList.length - 3} lainnya)` : '';
      desc.textContent = `Mohon lengkapi: ${names}${more}`;
    } else {
      desc.textContent = 'Mohon lengkapi semua isian bertanda (!) sebelum membuat dokumen.';
    }
  }
  toast.classList.add('is-show');
  if (valToastTimer) clearTimeout(valToastTimer);
  valToastTimer = setTimeout(() => {
    hideValidationToast();
  }, 5000);
}

function hideValidationToast() {
  const toast = document.getElementById('valToast');
  if (toast) toast.classList.remove('is-show');
  if (valToastTimer) {
    clearTimeout(valToastTimer);
    valToastTimer = null;
  }
}

let refreshToastTimer = null;

function showRefreshToast(title = 'Dokumen Berhasil Diperbarui', desc = 'Kalkulasi dan tampilan dokumen telah disegarkan.') {
  const toast = document.getElementById('refreshToast');
  if (!toast) return;
  const titleEl = document.getElementById('refreshToastTitle');
  const descEl = document.getElementById('refreshToastDesc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  toast.classList.add('is-show');
  if (refreshToastTimer) clearTimeout(refreshToastTimer);
  refreshToastTimer = setTimeout(() => {
    hideRefreshToast();
  }, 3500);
}

function hideRefreshToast() {
  const toast = document.getElementById('refreshToast');
  if (toast) toast.classList.remove('is-show');
  if (refreshToastTimer) {
    clearTimeout(refreshToastTimer);
    refreshToastTimer = null;
  }
}

function refreshDocument(btn, renderFnName) {
  if (!btn) {
    const activeTab = document.querySelector('.tab-content.active');
    btn = activeTab ? activeTab.querySelector('.btn-primary') : null;
  }
  if (!btn) return;
  if (btn.dataset.isRefreshing === 'true') return; // Cegah double-click selama durasi 3 detik
  btn.dataset.isRefreshing = 'true';
  btn.disabled = true;
  btn.classList.add('is-refreshing');

  const origHTML = btn.innerHTML;

  // Temukan elemen kontainer dokumen di tab yang sedang aktif
  const tabPane = btn.closest('.tab-content') || document.querySelector('.tab-content.active');
  const docContainer = tabPane ? (tabPane.querySelector('.doc-page, [id$="Out"], .doc-preview-wrap, .kuitansi-area, .sppd-sheet, .kendali-page, .rekap-page') || tabPane) : null;
  if (docContainer) {
    docContainer.classList.add('doc-refresh-loading');
  }

  // Pra-sinkronisasi data & kalkulasi sebelum render
  try {
    if (typeof syncJenisPerjalananFromMak === 'function') syncJenisPerjalananFromMak();
    if (typeof updateDPRInput === 'function') updateDPRInput();
    if (typeof hitungBiaya === 'function' && typeof selectedEmpIds !== 'undefined' && typeof employees !== 'undefined') {
      [...selectedEmpIds].forEach(id => {
        const emp = employees.find(e => e.id === id);
        if (emp) hitungBiaya(emp);
      });
    }
  } catch (err) {
    console.warn('Sync on refresh error:', err);
  }

  // Tampilkan spinner dan status menyegarkan (durasi 1 detik)
  btn.innerHTML = `<svg class="ico is-refresh-spin"><use href="#i-refresh"></use></svg><span>Menyegarkan...</span>`;

  // Jalankan setelah tepat 1.000 ms (1 detik)
  setTimeout(() => {
    // Eksekusi fungsi render spesifik tab dokumen
    try {
      if (renderFnName === 'renderKuitansiPerorangan') {
        const sel = document.getElementById('kuitansiPeroranganPegawai');
        if (!sel || !sel.value) {
          if (typeof populateKuitansiPeroranganSelect === 'function') populateKuitansiPeroranganSelect();
          else if (typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
        } else {
          if (typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
        }
      } else if (renderFnName === 'renderSPPDPerorangan') {
        const sel = document.getElementById('sppdPegawai');
        if (!sel || !sel.value) {
          if (typeof populateSPPDSelect === 'function') populateSPPDSelect();
          else if (typeof renderSPPDPerorangan === 'function') renderSPPDPerorangan();
        } else {
          if (typeof renderSPPDPerorangan === 'function') renderSPPDPerorangan();
        }
      } else if (renderFnName === 'renderRincian') {
        const sel = document.getElementById('rincianPegawai') || document.getElementById('rincianBiayaPegawai');
        if (!sel || !sel.value) {
          if (typeof populateRincianSelect === 'function') populateRincianSelect();
          else if (typeof renderRincian === 'function') renderRincian();
        } else {
          if (typeof renderRincian === 'function') renderRincian();
        }
      } else if (renderFnName === 'renderDPR') {
        const sel = document.getElementById('dprPegawai');
        if (!sel || !sel.value) {
          if (typeof populateDPRSelect === 'function') populateDPRSelect();
          else if (typeof renderDPR === 'function') renderDPR();
        } else {
          if (typeof renderDPR === 'function') renderDPR();
        }
      } else if (typeof window[renderFnName] === 'function') {
        window[renderFnName]();
      } else if (typeof renderFnName === 'function') {
        renderFnName();
      }
    } catch (err) {
      console.error('Render on refresh error:', err);
    }

    // Hilangkan efek visual loading pada dokumen
    if (docContainer) {
      docContainer.classList.remove('doc-refresh-loading');
    }

    // Tampilkan state sukses pada tombol
    btn.innerHTML = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;display:inline-block;"><polyline points="20 6 9 17 4 12"/></svg><span>Diperbarui!</span>`;

    // Tentukan label dokumen untuk toast
    let docLabel = 'Dokumen';
    const fnStr = String(renderFnName);
    if (fnStr.includes('Nominatif')) docLabel = 'Daftar Nominatif';
    else if (fnStr.includes('RekapKuitansi')) docLabel = 'Rekap Kuitansi';
    else if (fnStr.includes('KuitansiPerorangan')) docLabel = 'Kuitansi Perorangan';
    else if (fnStr.includes('SPPD')) docLabel = 'SPPD Perorangan';
    else if (fnStr.includes('LembarKendali')) docLabel = 'Lembar Kendali';
    else if (fnStr.includes('RekapRincian')) docLabel = 'Rekap Rincian';
    else if (fnStr.includes('RekapSPT')) docLabel = 'Rekap SPT';
    else if (fnStr.includes('Rincian')) docLabel = 'Rincian Biaya';
    else if (fnStr.includes('DPR')) docLabel = 'Lembar DPR';

    showRefreshToast(`${docLabel} Berhasil Diperbarui`, `Data kalkulasi dan tampilan dokumen telah disegarkan.`);

    // Kembalikan tombol ke keadaan semula setelah 800ms
    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.disabled = false;
      btn.classList.remove('is-refreshing');
      btn.dataset.isRefreshing = 'false';
    }, 800);
  }, 1000);
}

window.showRefreshToast = showRefreshToast;
window.hideRefreshToast = hideRefreshToast;
window.refreshDocument = refreshDocument;

function updateFieldFilledStatus(el) {
  if (!el) return;
  const ctrl = el.closest('.field-control');
  if (!ctrl) return;
  const icon = ctrl.querySelector('.field-inner-icon');
  const val = (el.value || '').trim();
  if (val) {
    ctrl.classList.add('is-filled');
    if (icon) {
      icon.style.display = 'none';
      icon.textContent = '';
      icon.title = '';
    }
  } else {
    ctrl.classList.remove('is-filled');
    if (icon) {
      icon.style.display = 'inline-flex';
      icon.textContent = '!';
      icon.title = 'Wajib diisi';
    }
  }
}

function setupRealtimeValidation() {
  REQUIRED_FIELDS.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el) return;
    const group = el.closest('.form-group');
    // Set initial status
    updateFieldFilledStatus(el);

    ['input', 'change'].forEach(evt => {
      el.addEventListener(evt, () => {
        updateFieldFilledStatus(el);
        if ((el.value || '').trim()) {
          if (group) group.classList.remove('has-error');
        }
      });
    });
    el.addEventListener('blur', () => {
      updateFieldFilledStatus(el);
      if (!(el.value || '').trim()) {
        if (group) group.classList.add('has-error');
      }
    });
  });

  ['provinsiTujuan1', 'provinsiTujuan2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const group = el.closest('.form-group');
    updateFieldFilledStatus(el);
    ['input', 'change'].forEach(evt => {
      el.addEventListener(evt, () => {
        updateFieldFilledStatus(el);
        if ((el.value || '').trim()) {
          if (group) group.classList.remove('has-error');
        }
      });
    });
    el.addEventListener('blur', () => {
      updateFieldFilledStatus(el);
      if (!(el.value || '').trim() && typeof isMultiProvActive === 'function' && isMultiProvActive()) {
        if (group) group.classList.add('has-error');
      }
    });
  });
}

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

  if (!isDismissed) {
    setTimeout(() => {
      openWelcome();
    }, 300);
  }
}

// =====================================================================
// TABS
// =====================================================================
const tabMeta = {
  input: ['Input Perjalanan', 'Formulir'],
  nominatif: ['Daftar Nominatif', 'Rekapitulasi'],
  'rekap-kuitansi': ['Rekap Kuitansi', 'Rekapitulasi'],
  'kuitansi-perorangan': ['Kuitansi Perorangan', 'Dokumen'],
  'sppd-perorangan': ['SPPD Perorangan', 'Dokumen'],
  'lembar-kendali': ['Lembar Kendali', 'Rekapitulasi'],
  'rekap-rincian': ['Rekap Rincian', 'Rekapitulasi'],
  'rekap-spt': ['Rekap Surat Tugas', 'Rekapitulasi'],
  rincian: ['Rincian per Orang', 'Dokumen'],
  dpr: ['DPR Perorangan', 'Dokumen'],
  pengaturan: ['Pengaturan', 'Sistem']
};

function showTab(name) {
  const currentActive = document.querySelector('.tab-content.active');
  if (currentActive && currentActive.id === 'tab-' + name) {
    return;
  }
  if (name !== 'input' && name !== 'pengaturan') {
    const val = validateTripForm();
    if (!val.valid) {
      showValidationToast(val.missing, val.dateMismatch ? 'Tanggal kembali tidak boleh sebelum tanggal berangkat!' : null);
      return;
    }
  }
  triggerTabProgress();
  showPageTransitionLoader(name, () => {
    switchTabPanel(name);
  });
}

function switchTabPanel(name) {
  const panel = document.getElementById('tab-' + name);
  if (!panel) return;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  panel.classList.add('active');
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  const meta = tabMeta[name] || ['Perjalanan Dinas', 'Menu'];
  const titleEl = document.getElementById('pageTitle');
  const eyebrowEl = document.getElementById('pageEyebrow');
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  if (titleEl) {
    if (name === 'dpr' && isKKP) titleEl.textContent = 'DPR KKP Perorangan';
    else if (name === 'rekap-kuitansi' && isKKP) titleEl.textContent = 'Rekap Kuitansi KKP';
    else if (name === 'kuitansi-perorangan' && isKKP) titleEl.textContent = 'Kuitansi KKP Perorangan';
    else titleEl.textContent = meta[0];
  }
  if (eyebrowEl) eyebrowEl.textContent = meta[1];
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'rincian') populateRincianSelect();
  if (name === 'dpr') populateDPRSelect();
  if (name === 'nominatif') renderNominatif();
  if (name === 'rekap-kuitansi') renderRekapKuitansi();
  if (name === 'kuitansi-perorangan') populateKuitansiPeroranganSelect();
  if (name === 'sppd-perorangan') populateSPPDSelect();
  if (name === 'lembar-kendali') renderLembarKendali();
  if (name === 'rekap-rincian') renderRekapRincian();
  if (name === 'rekap-spt') renderRekapSPT();
}

function onMetodePembayaranChange(val) {
  const f1 = document.getElementById('metodePembayaran');
  const f2 = document.getElementById('lk_metodePembayaran');
  if (f1 && f1.value !== val) f1.value = val;
  if (f2 && f2.value !== val) f2.value = val;
  updateKKPBadgesAndNav();
  if (typeof renderCurrentTab === 'function') {
    renderCurrentTab();
  } else {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
      const tabId = activeTab.id.replace(/^tab-/, '');
      if (tabId === 'lembar-kendali' && typeof renderLembarKendali === 'function') renderLembarKendali();
      if (tabId === 'rekap-kuitansi' && typeof renderRekapKuitansi === 'function') renderRekapKuitansi();
      if (tabId === 'kuitansi-perorangan' && typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
      if (tabId === 'dpr' && typeof renderDPR === 'function') renderDPR();
    }
  }
}

function updateKKPBadgesAndNav() {
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  const dprNav = document.querySelector('.tab-btn[data-tab="dpr"] .nav-text');
  if (dprNav) {
    dprNav.textContent = isKKP ? 'DPR KKP' : 'DPR Perorangan';
  }
  const dprCard = document.querySelector('.action-card[onclick*="showTab(\'dpr\')"] .action-body strong');
  if (dprCard) {
    dprCard.textContent = isKKP ? 'DPR KKP Perorangan' : 'DPR Perorangan';
  }
  const dprCardSub = document.querySelector('.action-card[onclick*="showTab(\'dpr\')"] .action-body small');
  if (dprCardSub) {
    dprCardSub.textContent = isKKP ? 'Daftar pengeluaran riil KKP' : 'Daftar pengeluaran riil';
  }
  const titleEl = document.getElementById('dprCardTitle');
  if (titleEl) {
    titleEl.textContent = isKKP ? 'Pilih Pegawai untuk DPR KKP' : 'Pilih Pegawai untuk DPR';
  }
  const subEl = document.getElementById('dprCardSub');
  if (subEl) {
    subEl.textContent = isKKP ? 'Daftar pengeluaran riil perjalanan dinas jabatan dengan KKP per orang' : 'Daftar pengeluaran riil per orang';
  }
  const btnPrint = document.getElementById('labelPrintDPR');
  if (btnPrint) {
    btnPrint.textContent = isKKP ? 'Cetak DPR KKP' : 'Cetak DPR';
  }
  const btnPrintAll = document.getElementById('labelPrintAllDPR');
  if (btnPrintAll) {
    btnPrintAll.textContent = isKKP ? 'Cetak Semua DPR KKP' : 'Cetak Semua DPR';
  }
}

function toggleSidebar() {
  document.body.classList.toggle('sidebar-open');
  const btn = document.querySelector('.burger');
  if (btn) btn.setAttribute('aria-expanded', document.body.classList.contains('sidebar-open') ? 'true' : 'false');
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  const btn = document.querySelector('.burger');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

// =====================================================================
// JENDELA / POPUP SELAMAT DATANG (WELCOME MODAL)
// =====================================================================
function openWelcome() {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeWelcome() {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  const checkbox = document.getElementById('welcomeDontShow');
  if (checkbox && checkbox.checked) {
    try {
      localStorage.setItem('perdinku_welcome_dismissed', '1');
    } catch (e) {}
  }
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function handleWelcomeBackdrop(event) {
  if (event.target && event.target.id === 'welcomeOverlay') {
    closeWelcome();
  }
}

function initWelcomeModal() {
  initWelcomeModalAfterLoader();
}

// =====================================================================
// DOKUMEN RESMI PMK SBM 2026 MODAL VIEWER
// =====================================================================
const PMK_FILE_PATH = 'PMK_Nomor_32_Tahun_2025_SBM_2026.pdf';

function openPmkModal(defaultPage) {
  const overlay = document.getElementById('pmkOverlay');
  if (!overlay) return;
  const page = parseInt(defaultPage, 10) || 15;

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  const pill = document.querySelector(`.pmk-pill[data-page="${page}"]`) || document.querySelector('.pmk-pill');
  jumpPmkPage(page, pill);
}

function closePmkModal() {
  const overlay = document.getElementById('pmkOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function handlePmkBackdrop(event) {
  if (event.target && event.target.id === 'pmkOverlay') {
    closePmkModal();
  }
}

function jumpPmkPage(pageNum, btnEl) {
  const page = parseInt(pageNum, 10) || 15;
  const targetUrl = `${PMK_FILE_PATH}#page=${page}&zoom=page-width`;

  // 1. Update pills visual active state
  document.querySelectorAll('.pmk-pill').forEach(btn => {
    const p = parseInt(btn.getAttribute('data-page'), 10);
    btn.classList.toggle('active', p === page);
  });
  if (btnEl) {
    btnEl.classList.add('active');
    try {
      btnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch (e) {}
  }

  // 2. Update page input box if present
  const pageInput = document.getElementById('pmkPageInput');
  if (pageInput) pageInput.value = page;

  // 3. Update "Tab Baru" button href so opening in new tab also goes to this page
  const tabBtn = document.getElementById('pmkNewTabBtn');
  if (tabBtn) tabBtn.href = targetUrl;

  // 4. Force Edge / Chromium PDF re-navigation via fresh iframe element
  const oldIframe = document.getElementById('pmkPdfFrame');
  const container = document.querySelector('.pmk-body');
  if (container) {
    const newIframe = document.createElement('iframe');
    newIframe.id = 'pmkPdfFrame';
    newIframe.className = 'pmk-iframe';
    newIframe.title = 'PDF Viewer PMK SBM 2026';
    newIframe.src = targetUrl;

    if (oldIframe && oldIframe.parentNode) {
      oldIframe.parentNode.replaceChild(newIframe, oldIframe);
    } else {
      container.appendChild(newIframe);
    }
  }
}

function jumpPmkFromInput() {
  const input = document.getElementById('pmkPageInput');
  if (!input) return;
  let p = parseInt(input.value, 10);
  if (isNaN(p) || p < 1) p = 1;
  if (p > 110) p = 110;
  input.value = p;
  const pill = document.querySelector(`.pmk-pill[data-page="${p}"]`);
  jumpPmkPage(p, pill);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeSidebar();
    closeWelcome();
    closePmkModal();
    if (typeof closeMealDuplicateModal === 'function') closeMealDuplicateModal();
  }
});

document.addEventListener('input', (e) => { 
  updateSbmWarnings(); 
  refreshHotelSummaries(); 
  const rincianTab = document.getElementById('tab-rincian');
  if (rincianTab && rincianTab.classList.contains('active')) {
    if (!e.target.closest('#rincianOut') && !e.target.closest('#rincianCockpit')) {
      if (typeof renderRincian === 'function') renderRincian();
    }
  }
});
document.addEventListener('change', (e) => { 
  updateSbmWarnings(); 
  refreshHotelSummaries(); 
  const rincianTab = document.getElementById('tab-rincian');
  if (rincianTab && rincianTab.classList.contains('active')) {
    if (!e.target.closest('#rincianOut') && !e.target.closest('#rincianCockpit')) {
      if (typeof renderRincian === 'function') renderRincian();
    }
  }
});

// =====================================================================
// EMPLOYEE LIST
// =====================================================================
function getInitials(nama) {
  return nama.replace(/[^A-Za-z\s]/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

function renderEmployeeList() {
  const box = document.getElementById('empListBox');
  const q = document.getElementById('empSearch').value.toLowerCase();
  const filtered = employees.filter(e => e.nama.toLowerCase().includes(q) || e.jabatan.toLowerCase().includes(q));
  box.innerHTML = filtered.map(e => `
    <div class="emp-item ${selectedEmpIds.has(e.id)?'selected':''}" onclick="toggleEmployee(${e.id})">
      <input type="checkbox" ${selectedEmpIds.has(e.id)?'checked':''} onclick="event.stopPropagation();toggleEmployee(${e.id})">
      <span class="emp-avatar">${getInitials(e.nama)}</span>
      <div class="emp-text">
        <div class="emp-name">${e.nama}</div>
        <div class="emp-detail">Gol. ${e.gol}<span class="sep">·</span>${e.jabatan}<span class="sep">·</span>NIP: ${e.nip}</div>
      </div>
    </div>
  `).join('') || '<div style="padding:16px;text-align:center;color:#9aabc0;font-size:13px">Tidak ada hasil</div>';
}

function filterEmployees() { renderEmployeeList(); }

function toggleEmployee(id) {
  if (selectedEmpIds.has(id)) { selectedEmpIds.delete(id); empTripSegments.delete(id); }
  else selectedEmpIds.add(id);
  renderEmployeeList();
  renderSelectedTags();
  renderTripDates();
    refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();
}

function renderSelectedTags() {
  const box = document.getElementById('selectedBox');
  const count = document.getElementById('countSelected');
  const empErr = document.getElementById('empErrorMsg');
  if (selectedEmpIds.size === 0) {
    box.innerHTML = '<span class="empty-note">Belum ada pegawai dipilih</span>';
    count.textContent = '0';
    return;
  }
  if (box) box.classList.remove('has-error');
  if (empErr) empErr.classList.remove('is-visible');
  count.textContent = selectedEmpIds.size;
  box.innerHTML = [...selectedEmpIds].map(id => {
    const e = employees.find(x => x.id === id);
    return `<span class="emp-tag">${e.nama.split(',')[0]} <span class="rm" onclick="toggleEmployee(${id})">×</span></span>`;
  }).join('');
}

function renderTripDates() {
  const block = document.getElementById('tripDatesBlock');
  const list = document.getElementById('tripDatesList');
  if (!block || !list) return;
  if (selectedEmpIds.size === 0) { block.style.display = 'none'; list.innerHTML = ''; return; }
  block.style.display = '';
  const g1 = document.getElementById('tglBerangkat').value;
  const g2 = document.getElementById('tglKembali').value;
  const globalText = g1 && g2 ? `${formatTgl(g1)} – ${formatTgl(g2)}` : 'belum diisi';
  list.innerHTML = [...selectedEmpIds].map(id => {
    const e = employees.find(x => x.id === id);
    if (!e) return '';
    const name = e.nama.split(',')[0];
    const segs = empTripSegments.get(id) || [];
    if (!segs.length) {
      return `<div class="trip-row">
        <div class="trip-name" title="${e.nama}">${name}</div>
        <div class="trip-follow">Ikut tanggal perjalanan (${globalText})</div>
        <button type="button" class="trip-btn" onclick="setEmpDates(${id})">Atur tanggal</button>
      </div>`;
    }
    const segHtml = segs.map((s, i) => `
      <span class="trip-seg">
        <input type="date" value="${s.start}" onchange="updateEmpSegment(${id},${i},'start',this.value)">
        <span class="trip-sep">s.d.</span>
        <input type="date" value="${s.end}" onchange="updateEmpSegment(${id},${i},'end',this.value)">
        <button type="button" class="trip-seg-rm" title="Hapus tanggal" onclick="removeEmpSegment(${id},${i})">×</button>
      </span>`).join('');
    return `<div class="trip-row">
      <div class="trip-name" title="${e.nama}">${name}</div>
      <div class="trip-segs">${segHtml}</div>
      <div class="trip-actions">
        <button type="button" class="trip-btn" onclick="addEmpSegment(${id})">+ Tanggal</button>
        <button type="button" class="trip-btn trip-btn-reset" onclick="resetEmpDates(${id})">Ikut global</button>
      </div>
    </div>`;
  }).join('');
}

function setEmpDates(id) {
  const g1 = document.getElementById('tglBerangkat').value;
  const g2 = document.getElementById('tglKembali').value || g1;
  if (!g1) return;
  empTripSegments.set(id, [{ start: g1, end: g2 }]);
  renderTripDates();
  }

function addEmpSegment(id) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.push({ start: '', end: '' });
  empTripSegments.set(id, segs);
  renderTripDates();
  }

function updateEmpSegment(id, index, field, value) {
  const segs = [...(empTripSegments.get(id) || [])];
  if (!segs[index]) return;
  segs[index][field] = value;
  if (field === 'start' && (!segs[index].end || segs[index].end < value)) segs[index].end = value;
  if (field === 'end' && segs[index].start && value && value < segs[index].start) segs[index].start = value;
  empTripSegments.set(id, segs);
  renderTripDates();
  }

function removeEmpSegment(id, index) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.splice(index, 1);
  if (segs.length) empTripSegments.set(id, segs);
  else empTripSegments.delete(id);
  renderTripDates();
  }

function resetEmpDates(id) {
  empTripSegments.delete(id);
  renderTripDates();
  }

function clearAll() {
  selectedEmpIds.clear();
  empTripSegments.clear();
  renderEmployeeList();
  renderSelectedTags();
  renderTripDates();
    refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();
}
