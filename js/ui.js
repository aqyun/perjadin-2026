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
function bootPerdinKu() {
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
    if (typeof initViewerSbmCockpit === 'function') initViewerSbmCockpit();
    if (typeof renderDashboardModule === 'function') renderDashboardModule();
    if (typeof renderTripHistory === 'function') renderTripHistory();
    if (typeof updateKKPBadgesAndNav === 'function') updateKKPBadgesAndNav();
    if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();
    if (typeof syncJenisPerjalananFromMak === 'function') syncJenisPerjalananFromMak();
    if (typeof updateStSuffixOptions === 'function') updateStSuffixOptions();
    const curNoST = document.getElementById('noST')?.value;
    if (curNoST && typeof syncInputsFromFullNoST === 'function') {
      syncInputsFromFullNoST(curNoST);
    } else if (typeof syncNoSTFromInputs === 'function') {
      syncNoSTFromInputs();
    }
    if (typeof initAutoSaveAndProtection === 'function') {
      initAutoSaveAndProtection();
    }
  } catch (err) {
    console.error('PerdinKu initialization error:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPerdinKu);
} else {
  bootPerdinKu();
}

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

// =====================================================================
// NOMOR SURAT TUGAS (ST) PREFIX & SUFFIX HANDLER
// =====================================================================
function getStYear() {
  const tgl = document.getElementById('tglST')?.value;
  if (tgl) {
    const yr = new Date(tgl + 'T00:00:00').getFullYear();
    if (yr && !isNaN(yr)) return yr;
  }
  return 2026;
}

function updateStSuffixOptions() {
  const yr = getStYear();
  const sel = document.getElementById('noSTSuffix');
  const opt1Val = `/ST/Sj.07/${yr}`;
  const opt2Val = `/ST/Sj/${yr}`;

  if (sel && sel.options && sel.options.length >= 2) {
    const curVal = sel.value;
    const isSjOnly = curVal.includes('/ST/Sj/') && !curVal.includes('/ST/Sj.');
    sel.options[0].value = opt1Val;
    sel.options[0].textContent = opt1Val;
    sel.options[1].value = opt2Val;
    sel.options[1].textContent = opt2Val;
    sel.value = isSjOnly ? opt2Val : opt1Val;
  }
}

function setStSuffix(suffixPattern) {
  const yr = getStYear();
  const sel = document.getElementById('noSTSuffix');
  const actualSuffix = suffixPattern.replace(/\/\d{4}$/, `/${yr}`);
  if (sel) {
    sel.value = actualSuffix;
    onStSuffixSelectChange();
  }
}

function onStSuffixSelectChange() {
  syncNoSTFromInputs();
}

function syncNoSTFromInputs() {
  const numInput = document.getElementById('noSTNum');
  const suffixSel = document.getElementById('noSTSuffix');
  const fullInput = document.getElementById('noST');
  if (!fullInput) return;

  const num = (numInput?.value || '').trim();
  const suffix = suffixSel?.value || '/ST/Sj.07/2026';

  if (!num) {
    fullInput.value = '';
  } else if (num.includes('/')) {
    fullInput.value = num;
  } else {
    fullInput.value = `${num}${suffix}`;
  }

  const group = fullInput.closest('.form-group');
  if (group) {
    if (fullInput.value) {
      group.classList.remove('has-error');
      const wrap = group.querySelector('.st-prefix-wrap');
      if (wrap) wrap.classList.remove('has-error');
    }
  }
}

function syncInputsFromFullNoST(fullVal) {
  const numInput = document.getElementById('noSTNum');
  const suffixSel = document.getElementById('noSTSuffix');
  const fullInput = document.getElementById('noST');
  if (!fullInput) return;

  const raw = String(fullVal || '').trim();
  fullInput.value = raw;

  if (!numInput || !suffixSel) return;
  if (!raw) {
    numInput.value = '';
    return;
  }

  const match = raw.match(/^([^\/]+)(\/.*)$/);
  if (match) {
    numInput.value = match[1].trim();
    const matchedSuffix = match[2].trim();
    let found = false;
    for (let i = 0; i < suffixSel.options.length; i++) {
      if (suffixSel.options[i].value === matchedSuffix) {
        suffixSel.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = matchedSuffix;
      opt.textContent = matchedSuffix;
      suffixSel.appendChild(opt);
      suffixSel.value = matchedSuffix;
    }
  } else {
    numInput.value = raw;
  }
  onStSuffixSelectChange();
}

window.getStYear = getStYear;
window.updateStSuffixOptions = updateStSuffixOptions;
window.setStSuffix = setStSuffix;
window.onStSuffixSelectChange = onStSuffixSelectChange;
window.syncNoSTFromInputs = syncNoSTFromInputs;
window.syncInputsFromFullNoST = syncInputsFromFullNoST;

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

  const stNum = document.getElementById('noSTNum');
  if (stNum) {
    ['input', 'change'].forEach(evt => {
      stNum.addEventListener(evt, () => {
        syncNoSTFromInputs();
      });
    });
    stNum.addEventListener('blur', () => {
      syncNoSTFromInputs();
      const el = document.getElementById('noST');
      const group = el?.closest('.form-group');
      if (group && !(el?.value || '').trim()) {
        group.classList.add('has-error');
      }
    });
  }

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

  // Hanya tampilkan sambutan jika user sudah login (tidak terkunci di gerbang login)
  if (!isDismissed && !document.body.classList.contains('auth-locked')) {
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
  dashboard: ['Dashboard Eksekutif', 'Portal Pemantau'],
  riwayat: ['Riwayat Perjalanan Dinas', 'Arsip & Berkas'],
  sbm: ['Kamus & Cek Tarif SBM 2026', 'Standar Biaya Masukan'],
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
  const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  const isViewer = !canEdit && !!window.currentAuthUser;
  const viewerAllowedTabs = ['dashboard', 'riwayat', 'sbm'];
  if (isViewer && !viewerAllowedTabs.includes(name)) {
    name = 'dashboard';
  }
  const currentActive = document.querySelector('.tab-content.active');
  if (currentActive && currentActive.id === 'tab-' + name) {
    return;
  }
  if (!['input', 'pengaturan', 'dashboard', 'riwayat', 'sbm'].includes(name)) {
    const val = validateTripForm();
    if (!val.valid) {
      showValidationToast(val.missing, val.dateMismatch ? 'Tanggal kembali tidak boleh sebelum tanggal berangkat!' : null);
      return;
    }
  }
  triggerTabProgress();
  showPageTransitionLoader(name, () => {
    switchTabPanel(name);
    if (name === 'dashboard' && typeof renderDashboardModule === 'function') {
      renderDashboardModule();
    } else if (name === 'sbm' && typeof initViewerSbmCockpit === 'function') {
      initViewerSbmCockpit();
    } else if (name === 'riwayat' && typeof renderTripHistory === 'function') {
      renderTripHistory();
    }
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
  if (name === 'dashboard' && typeof renderDashboardModule === 'function') renderDashboardModule();
  if (name === 'sbm' && typeof initViewerSbmCockpit === 'function') initViewerSbmCockpit();
  if (name === 'riwayat' && typeof renderTripHistory === 'function') renderTripHistory();
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
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
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
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function addEmpSegment(id) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.push({ start: '', end: '' });
  empTripSegments.set(id, segs);
  renderTripDates();
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function updateEmpSegment(id, index, field, value) {
  const segs = [...(empTripSegments.get(id) || [])];
  if (!segs[index]) return;
  segs[index][field] = value;
  if (field === 'start' && (!segs[index].end || segs[index].end < value)) segs[index].end = value;
  if (field === 'end' && segs[index].start && value && value < segs[index].start) segs[index].start = value;
  empTripSegments.set(id, segs);
  renderTripDates();
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function removeEmpSegment(id, index) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.splice(index, 1);
  if (segs.length) empTripSegments.set(id, segs);
  else empTripSegments.delete(id);
  renderTripDates();
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function resetEmpDates(id) {
  empTripSegments.delete(id);
  renderTripDates();
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
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
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

// =====================================================================
// AUTOSAVE DRAFT & ACCIDENTAL REFRESH / UNLOAD PROTECTION
// =====================================================================
const PERJADIN_DRAFT_KEY = 'perdinku_active_draft_v1';
let autoSaveTimer = null;
window._isResetting = false;

function isPerjadinDraftDirty() {
  const noST = (document.getElementById('noSTNum')?.value || document.getElementById('noST')?.value || '').trim();
  const agenda = (document.getElementById('agenda')?.value || '').trim();
  const prov = (document.getElementById('provinsiTujuan')?.value || '').trim();
  const kota = (document.getElementById('kotaTujuan')?.value || '').trim();
  const tglST = (document.getElementById('tglST')?.value || '').trim();
  const empCount = (typeof selectedEmpIds !== 'undefined' && selectedEmpIds) ? selectedEmpIds.size : 0;
  return Boolean(noST || agenda || (prov && prov !== '-') || kota || empCount > 0);
}

function updateAutosaveIndicator(state) {
  const badge = document.getElementById('autosaveStatus');
  if (!badge) return;
  const textEl = badge.querySelector('.autosave-text');
  badge.classList.remove('is-saving', 'is-saved', 'is-clean');

  if (state === 'saving') {
    badge.classList.add('is-saving');
    if (textEl) textEl.textContent = 'Menyimpan...';
    badge.title = 'Sedang menyimpan perubahan draft ke browser...';
  } else if (state === 'saved') {
    badge.classList.add('is-saved');
    if (textEl) textEl.textContent = 'Draft Tersimpan';
    badge.title = 'Draft tersimpan otomatis di browser lokal Anda (aman dari refresh).';
  } else {
    badge.classList.add('is-clean');
    if (textEl) textEl.textContent = 'Draft Otomatis Aktif';
    badge.title = 'Penyimpanan otomatis aktif. Form siap digunakan.';
  }
}

function collectPerjadinDraftData() {
  const fields = {};
  const fieldIds = [
    'noST', 'noSTNum', 'noSTSuffix',
    'tglST', 'tglSPD', 'tglBerangkat', 'tglKembali', 'lamaTugas',
    'provinsiTujuan', 'kotaTujuan', 'agenda', 'kodeKegiatan', 'kodeSubKegiatan', 'mak',
    'cbUH', 'cbHotel', 'cbDPR', 'cbTiket',
    'persenUH', 'jenisKegiatan', 'cbKonsumsi',
    'jmlMakanRapat', 'jmlSnackRapat', 'tarifMakan', 'tarifSnack', 'cbTarifMakanManual',
    'cbMultiProvinsi', 'provinsiTujuan1', 'provinsiTujuan2', 'kotaTujuan1', 'kotaTujuan2',
    'hariProvinsi1', 'hariProvinsi2', 'cbKonsumsiBiasa', 'manualMakanMode', 'metodePembayaran',
    'lk_tanggalMasuk', 'lk_pelaksana', 'lk_nomorSPM', 'lk_nomorSPD', 'lk_jenisPerjalanan', 'lk_metodePembayaran'
  ];

  if (typeof EXCEL_SETTING_FIELDS !== 'undefined') {
    EXCEL_SETTING_FIELDS.forEach(([, id]) => {
      if (id && !fieldIds.includes(id)) fieldIds.push(id);
    });
  }

  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') {
      fields[id] = el.checked;
    } else {
      fields[id] = el.value;
    }
  });

  const empIds = (typeof selectedEmpIds !== 'undefined' && selectedEmpIds) ? [...selectedEmpIds] : [];
  const segments = [];
  if (typeof empTripSegments !== 'undefined' && empTripSegments) {
    empTripSegments.forEach((segs, id) => {
      segments.push([id, segs]);
    });
  }
  const spdMap = (typeof spdPerEmployee !== 'undefined' && spdPerEmployee) ? { ...spdPerEmployee } : {};
  const costCfg = (typeof employeeCostConfig !== 'undefined' && employeeCostConfig) ? employeeCostConfig : {};
  const transports = (typeof employeeTransports !== 'undefined' && employeeTransports) ? employeeTransports : {};

  const hotels = [];
  document.querySelectorAll('#hotelList .hotel-row').forEach(row => {
    hotels.push({
      name: row.querySelector('.hotel-name')?.value || '',
      nights: Number(row.querySelector('.hotel-nights')?.value) || 0,
      price: row.querySelector('.hotel-price')?.value || '',
      guestIds: [...row.querySelectorAll('.hotel-guest-check:checked')].map(cb => Number(cb.dataset.employeeId))
    });
  });

  const customCosts = [];
  document.querySelectorAll('.custom-cost-row').forEach(row => {
    let amounts = {};
    try { amounts = JSON.parse(row.dataset.amounts || '{}'); } catch(e) {}
    customCosts.push({
      name: row.querySelector('.custom-cost-name')?.value || '',
      kind: row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other',
      pickup: row.querySelector('.custom-cost-pickup')?.value || '',
      dropoff: row.querySelector('.custom-cost-dropoff')?.value || '',
      amounts
    });
  });

  const manualMeals = [];
  const mealTbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
  if (mealTbody) {
    const rows = mealTbody.querySelectorAll ? mealTbody.querySelectorAll('.manual-meal-row') : mealTbody.children;
    rows.forEach(row => {
      const day = row.querySelector('.manual-meal-day')?.value || '';
      const session = row.querySelector('.manual-meal-session')?.value || '';
      const price = row.querySelector('.manual-meal-price')?.value || '';
      if (day || session || price) {
        manualMeals.push({ day, session, price });
      }
    });
  }

  return {
    version: 1,
    savedAt: Date.now(),
    fields,
    empIds,
    segments,
    spdMap,
    costCfg,
    transports,
    hotels,
    customCosts,
    manualMeals
  };
}

function restorePerjadinDraftData(data) {
  if (!data || !data.fields) return false;

  Object.keys(data.fields).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = data.fields[id];
    if (el.type === 'checkbox') {
      el.checked = !!val;
    } else {
      el.value = val ?? '';
    }
  });

  if (data.fields.noST) {
    if (typeof syncInputsFromFullNoST === 'function') {
      syncInputsFromFullNoST(data.fields.noST);
    }
  } else if (data.fields.noSTNum) {
    const numEl = document.getElementById('noSTNum');
    if (numEl) numEl.value = data.fields.noSTNum;
    const sfxEl = document.getElementById('noSTSuffix');
    if (sfxEl && data.fields.noSTSuffix) sfxEl.value = data.fields.noSTSuffix;
    if (typeof syncNoSTFromInputs === 'function') syncNoSTFromInputs();
  }

  if (data.fields.provinsiTujuan && typeof changeProvince === 'function') {
    changeProvince();
  }

  if (typeof selectedEmpIds !== 'undefined' && Array.isArray(data.empIds)) {
    selectedEmpIds.clear();
    data.empIds.forEach(id => selectedEmpIds.add(Number(id)));
  }

  if (typeof empTripSegments !== 'undefined' && Array.isArray(data.segments)) {
    empTripSegments.clear();
    data.segments.forEach(([id, segs]) => {
      empTripSegments.set(Number(id), segs);
    });
  }

  if (typeof spdPerEmployee !== 'undefined' && data.spdMap) {
    spdPerEmployee = { ...data.spdMap };
  }

  if (typeof employeeCostConfig !== 'undefined' && data.costCfg) {
    employeeCostConfig = { ...data.costCfg };
  }
  if (typeof employeeTransports !== 'undefined' && data.transports) {
    employeeTransports = { ...data.transports };
  }

  if (typeof renderEmployeeList === 'function') renderEmployeeList();
  if (typeof renderSelectedTags === 'function') renderSelectedTags();
  if (typeof renderTripDates === 'function') renderTripDates();

  const hotelList = document.getElementById('hotelList');
  if (hotelList) {
    hotelList.innerHTML = '';
    if (Array.isArray(data.hotels) && data.hotels.length > 0) {
      data.hotels.forEach(h => {
        if (typeof addHotelRow === 'function') {
          addHotelRow(h.nights || 1);
          const row = hotelList.lastElementChild;
          if (row) {
            const nameEl = row.querySelector('.hotel-name');
            if (nameEl) nameEl.value = h.name || '';
            const priceEl = row.querySelector('.hotel-price');
            if (priceEl) priceEl.value = h.price || '';
            const nightsEl = row.querySelector('.hotel-nights');
            if (nightsEl && h.nights) nightsEl.value = h.nights;
            if (Array.isArray(h.guestIds)) {
              row.querySelectorAll('.hotel-guest-check').forEach(cb => {
                cb.checked = h.guestIds.includes(Number(cb.dataset.employeeId));
              });
            }
            if (typeof updateHotelSummary === 'function') updateHotelSummary(row);
          }
        }
      });
    }
  }

  const customCostList = document.getElementById('customCostList');
  if (customCostList) {
    customCostList.innerHTML = '';
    if (Array.isArray(data.customCosts) && data.customCosts.length > 0) {
      data.customCosts.forEach(c => {
        if (typeof addCustomCost === 'function') {
          addCustomCost();
          const row = customCostList.lastElementChild;
          if (row) {
            row.dataset.kindAuto = '0';
            const nameEl = row.querySelector('.custom-cost-name');
            if (nameEl) nameEl.value = c.name || '';
            if (typeof applyCustomCostKind === 'function') applyCustomCostKind(row, c.kind || 'other');
            const pickEl = row.querySelector('.custom-cost-pickup');
            if (pickEl) pickEl.value = c.pickup || '';
            const dropEl = row.querySelector('.custom-cost-dropoff');
            if (dropEl) dropEl.value = c.dropoff || '';
            row.dataset.amounts = JSON.stringify(c.amounts || {});
            if (typeof renderCustomCostAssignments === 'function') renderCustomCostAssignments(row);
          }
        }
      });
    }
  }

  if (Array.isArray(data.manualMeals) && data.manualMeals.length > 0 && typeof addManualMealRow === 'function') {
    const list = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
    if (list) {
      list.innerHTML = '';
      data.manualMeals.forEach(m => {
        addManualMealRow(m.day, m.session, m.price);
      });
    }
  }

  if (typeof toggleMultiProvinsi === 'function') toggleMultiProvinsi();
  if (typeof toggleUHFields === 'function') toggleUHFields();
  if (typeof toggleHotelFields === 'function') toggleHotelFields();
  if (typeof toggleKonsumsiFields === 'function') toggleKonsumsiFields();
  if (typeof toggleTarifMakanManual === 'function') toggleTarifMakanManual();
  if (typeof hitungLama === 'function') hitungLama();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();
  if (typeof renderRincianTransportEditor === 'function') renderRincianTransportEditor();
  if (typeof refreshHotelSummaries === 'function') refreshHotelSummaries();

  return true;
}

function scheduleAutoSaveDraft() {
  // Tidak otomatis insert/push ke database riwayat saat sedang mengetik untuk mencegah duplikasi data
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  updateAutosaveIndicator('clean');
}

function resetPerjadinForm(isSilent = false) {
  window._isResetting = true;
  try {
    localStorage.removeItem(PERJADIN_DRAFT_KEY);
  } catch (e) {}
  window._activeEditingTrip = null;
  if (typeof updateRevisionBanner === 'function') updateRevisionBanner(null);

  if (typeof selectedEmpIds !== 'undefined' && selectedEmpIds) {
    selectedEmpIds.clear();
  }
  if (typeof empTripSegments !== 'undefined' && empTripSegments) {
    empTripSegments.clear();
  }
  if (typeof spdPerEmployee !== 'undefined') {
    spdPerEmployee = {};
  }
  if (typeof employeeCostConfig !== 'undefined') {
    employeeCostConfig = {};
  }
  if (typeof employeeTransports !== 'undefined') {
    employeeTransports = {};
  }

  const noSTNum = document.getElementById('noSTNum');
  if (noSTNum) noSTNum.value = '';
  const noST = document.getElementById('noST');
  if (noST) noST.value = '';
  const noSTSuffix = document.getElementById('noSTSuffix');
  if (noSTSuffix && noSTSuffix.options.length) noSTSuffix.selectedIndex = 0;

  const agenda = document.getElementById('agenda');
  if (agenda) agenda.value = '';
  const mak = document.getElementById('mak');
  if (mak) mak.value = '';

  const prov = document.getElementById('provinsiTujuan');
  if (prov) prov.value = '';
  const kota = document.getElementById('kotaTujuan');
  if (kota) kota.value = '';

  const today = new Date().toISOString().split('T')[0];
  ['tglST', 'tglSPD', 'tglBerangkat', 'tglKembali'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });

  const lamaTugas = document.getElementById('lamaTugas');
  if (lamaTugas) lamaTugas.value = '1 Hari';

  const cbMulti = document.getElementById('cbMultiProvinsi');
  if (cbMulti) cbMulti.checked = false;
  const sec = document.getElementById('multiProvSection');
  if (sec) sec.style.display = 'none';
  const mainProvGroup = document.getElementById('mainProvinsiGroup');
  if (mainProvGroup) mainProvGroup.style.display = '';
  ['provinsiTujuan1', 'provinsiTujuan2', 'kotaTujuan1', 'kotaTujuan2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['hariProvinsi1', 'hariProvinsi2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = 1;
  });

  const cbDPR = document.getElementById('cbDPR'); if (cbDPR) cbDPR.checked = true;
  const cbTiket = document.getElementById('cbTiket'); if (cbTiket) cbTiket.checked = false;
  const cbKonsumsi = document.getElementById('cbKonsumsi'); if (cbKonsumsi) cbKonsumsi.checked = false;
  const cbKonsumsiBiasa = document.getElementById('cbKonsumsiBiasa'); if (cbKonsumsiBiasa) cbKonsumsiBiasa.checked = false;
  const persenUH = document.getElementById('persenUH'); if (persenUH) persenUH.value = '100%';
  const jenisKegiatan = document.getElementById('jenisKegiatan'); if (jenisKegiatan) jenisKegiatan.value = 'biasa';
  const jmlMakan = document.getElementById('jmlMakanRapat'); if (jmlMakan) jmlMakan.value = 0;
  const jmlSnack = document.getElementById('jmlSnackRapat'); if (jmlSnack) jmlSnack.value = 0;

  const hotelList = document.getElementById('hotelList');
  if (hotelList) hotelList.innerHTML = '';
  const customCostList = document.getElementById('customCostList');
  if (customCostList) customCostList.innerHTML = '';
  const mealTbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
  if (mealTbody) mealTbody.innerHTML = '';

  document.querySelectorAll('.field-error-msg.is-visible').forEach(m => m.classList.remove('is-visible'));
  document.querySelectorAll('.field-control.has-error').forEach(c => c.classList.remove('has-error'));
  document.querySelectorAll('.is-filled').forEach(el => el.classList.remove('is-filled'));
  const selBox = document.getElementById('selectedBox');
  if (selBox) selBox.classList.remove('has-error');
  if (typeof hideValidationToast === 'function') hideValidationToast();

  if (typeof hitungLama === 'function') hitungLama();
  if (typeof renderEmployeeList === 'function') renderEmployeeList();
  if (typeof renderSelectedTags === 'function') renderSelectedTags();
  if (typeof renderTripDates === 'function') renderTripDates();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  if (typeof changeProvince === 'function') changeProvince();
  if (typeof toggleUHFields === 'function') toggleUHFields();
  if (typeof toggleHotelFields === 'function') toggleHotelFields();
  if (typeof renderTripHistory === 'function') renderTripHistory();

  if (typeof showTab === 'function') showTab('input');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window._isResetting = false;

  if (!isSilent && typeof showRefreshToast === 'function') {
    showRefreshToast(
      'Formulir Dikosongkan',
      'Data sebelumnya tersimpan di tab Riwayat. Formulir kini siap untuk input perjalanan baru.'
    );
  }
}

function confirmResetPerjadinDraft() {
  const dirty = typeof isPerjadinDraftDirty === 'function' ? isPerjadinDraftDirty() : false;
  const msg = dirty
    ? 'Apakah Anda yakin ingin mengosongkan formulir?\n\nSemua isian formulir saat ini akan dikosongkan untuk memulai perjalanan baru. Data yang pernah disimpan tetap aman di tab Riwayat.'
    : 'Kosongkan formulir dan mulai perjalanan baru?';

  if (!confirm(msg)) return;

  resetPerjadinForm(false);
}

function initAutoSaveAndProtection() {
  // Setiap kali halaman baru dibuka / di-refresh / web dibuka ulang: auto-clear draft formulir lama
  // Data perjalanan yang sudah disimpan tetap aman di database & tab Riwayat Perjalanan untuk dipulihkan kapan saja.
  window._activeEditingTrip = null;
  try {
    localStorage.removeItem(PERJADIN_DRAFT_KEY);
  } catch (e) {}

  const clearDraftOnLeave = () => {
    try {
      localStorage.removeItem(PERJADIN_DRAFT_KEY);
    } catch (e) {}
  };

  window.addEventListener('pagehide', clearDraftOnLeave);

  if (typeof updateRevisionBanner === 'function') {
    updateRevisionBanner(null);
  }
  updateAutosaveIndicator('clean');
}

window.isPerjadinDraftDirty = isPerjadinDraftDirty;
window.collectPerjadinDraftData = collectPerjadinDraftData;
window.restorePerjadinDraftData = restorePerjadinDraftData;
window.scheduleAutoSaveDraft = scheduleAutoSaveDraft;
window.confirmResetPerjadinDraft = confirmResetPerjadinDraft;
window.updateAutosaveIndicator = updateAutosaveIndicator;
window.initAutoSaveAndProtection = initAutoSaveAndProtection;

// =====================================================================
// RIWAYAT PERJALANAN (TRIP HISTORY & REVISION ARCHIVE)
// =====================================================================
const TRIP_HISTORY_KEY = 'perdinku_trip_history_v1';

function getTripHistoryList() {
  try {
    const raw = localStorage.getItem(TRIP_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Gagal membaca riwayat perjalanan:', e);
    return [];
  }
}

function saveTripHistoryList(list) {
  try {
    localStorage.setItem(TRIP_HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Gagal menyimpan riwayat perjalanan:', e);
  }
}

function getCurrentRevisionActor() {
  const user = (typeof getCurrentAuthUser === 'function' ? getCurrentAuthUser() : null) || window.currentAuthUser || null;
  if (!user) {
    return { id: null, nama: 'Pengguna Lokal', email: '-', role: 'local', roleLabel: 'Lokal' };
  }
  const role = String(user.role || 'viewer').toLowerCase().trim();
  let roleLabel = 'Viewer';
  if (role === 'admin') roleLabel = 'Admin';
  else if (role === 'operator' || role === 'editor') roleLabel = 'Role Khusus';
  return {
    id: user.id || null,
    nama: user.nama || (user.email ? user.email.split('@')[0] : 'Pengguna'),
    email: user.email || '-',
    role: (role === 'editor' ? 'operator' : role),
    roleLabel
  };
}

function normalizeTripNoStKey(noST) {
  const s = String(noST || '').trim();
  if (!s) return '';
  const low = s.toLowerCase();
  if (low === 'tanpa nomor st' || low === 'tanpa no st' || low === '-') return '';
  return low;
}

function computeTripDraftSignature(item) {
  if (!item) return '';
  const d = item.draft || {};
  try {
    return JSON.stringify({
      noST: item.noST || '',
      agenda: item.agenda || '',
      prov: item.provinsiTujuan || '',
      kota: item.kotaTujuan || '',
      tglBerangkat: item.tglBerangkat || '',
      tglKembali: item.tglKembali || '',
      empCount: item.empCount || 0,
      totalBiaya: Number(item.totalBiaya) || 0,
      fields: d.fields || {},
      empIds: d.empIds || [],
      segments: d.segments || [],
      spdMap: d.spdMap || {},
      costCfg: d.costCfg || {},
      transports: d.transports || {},
      hotels: d.hotels || [],
      customCosts: d.customCosts || [],
      manualMeals: d.manualMeals || []
    });
  } catch (e) {
    return `${item.noST}|${item.totalBiaya}|${item.empCount}`;
  }
}

function buildRevisionSummaryNote(oldItem, newItem) {
  if (!oldItem || !newItem) return 'Revisi data perjalanan dinas';
  const diffs = [];
  if (normalizeTripNoStKey(oldItem.noST) !== normalizeTripNoStKey(newItem.noST)) {
    diffs.push(`No. ST (${oldItem.noST} → ${newItem.noST})`);
  }
  if ((oldItem.agenda || '').trim() !== (newItem.agenda || '').trim()) {
    diffs.push('Agenda');
  }
  if ((oldItem.kotaTujuan || '').trim() !== (newItem.kotaTujuan || '').trim() || (oldItem.provinsiTujuan || '').trim() !== (newItem.provinsiTujuan || '').trim()) {
    diffs.push('Tujuan');
  }
  if ((oldItem.tglBerangkat || '') !== (newItem.tglBerangkat || '') || (oldItem.tglKembali || '') !== (newItem.tglKembali || '')) {
    diffs.push('Jadwal');
  }
  if ((Number(oldItem.empCount) || 0) !== (Number(newItem.empCount) || 0)) {
    diffs.push(`Pelaksana (${oldItem.empCount || 0} → ${newItem.empCount || 0} org)`);
  }
  if ((Number(oldItem.totalBiaya) || 0) !== (Number(newItem.totalBiaya) || 0)) {
    const oldRp = (typeof rp === 'function') ? rp(oldItem.totalBiaya) : oldItem.totalBiaya;
    const newRp = (typeof rp === 'function') ? rp(newItem.totalBiaya) : newItem.totalBiaya;
    diffs.push(`Total Biaya (${oldRp} → ${newRp})`);
  }
  return diffs.length > 0 ? `Revisi: ${diffs.join(', ')}` : 'Revisi rincian berkas perjalanan dinas';
}

function updateRevisionBanner(editTrip) {
  const banner = document.getElementById('activeRevisionBanner');
  if (!banner) return;
  if (!editTrip) {
    banner.style.display = 'none';
    banner.innerHTML = '';
    return;
  }
  const safeNo = (typeof escapeHtml === 'function') ? escapeHtml(editTrip.origNoST || editTrip.noST || 'Berkas Terpilih') : (editTrip.origNoST || 'Berkas Terpilih');
  banner.style.display = 'flex';
  banner.innerHTML = `
    <div class="rev-banner-left">
      <span class="rev-banner-pill">MODE REVISI</span>
      <span class="rev-banner-text">Sedang merevisi berkas <strong>${safeNo}</strong> &bull; Perubahan akan memperbarui data yang sudah ada dan tercatat di <strong>Log Revisi</strong> (tidak membuat data ganda).</span>
    </div>
    <button type="button" class="btn btn-secondary btn-sm rev-banner-cancel" onclick="cancelActiveRevision()" title="Batalkan revisi dan mulai form baru">
      <span>Batal / Buat Baru</span>
    </button>
  `;
}

function cancelActiveRevision() {
  window._activeEditingTrip = null;
  resetPerjadinForm(false);
}
window.cancelActiveRevision = cancelActiveRevision;

function toggleTripRevisionLog(tripId, event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const safeId = (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') ? CSS.escape(tripId) : tripId;
  const panel = document.getElementById(`revLog-${tripId}`) || document.querySelector(`[data-rev-log="${safeId}"]`);
  const btn = event?.currentTarget || panel?.previousElementSibling;
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (btn) btn.classList.toggle('is-open', !isOpen);
}
window.toggleTripRevisionLog = toggleTripRevisionLog;

function saveCurrentTripToHistory(isManual = false, customCsvData = null) {
  if (window._isExportingFromHistory) return null;

  const draft = (typeof collectPerjadinDraftData === 'function') ? collectPerjadinDraftData() : null;
  if (!draft || !draft.fields) {
    if (isManual) alert('Formulir masih kosong.');
    return null;
  }

  const noST = (draft.fields.noST || draft.fields.noSTNum || '').trim();
  const agenda = (draft.fields.agenda || '').trim();
  const prov = (draft.fields.provinsiTujuan || '').trim();
  const empIds = draft.empIds || [];

  if (!noST && !agenda && empIds.length === 0) {
    if (isManual) alert('Formulir masih kosong. Silakan isi data perjalanan dinas terlebih dahulu.');
    return null;
  }

  let totalBiaya = 0;
  try {
    const emps = (typeof employees !== 'undefined' && Array.isArray(employees))
      ? empIds.map(id => employees.find(e => e.id === id)).filter(Boolean)
      : [];
    if (typeof hitungBiaya === 'function') {
      totalBiaya = emps.reduce((tot, emp) => tot + (hitungBiaya(emp)?.total || 0), 0);
    }
  } catch (e) {
    console.warn('Gagal menghitung total estimasi biaya:', e);
  }

  const empList = empIds.map(id => {
    const emp = (typeof employees !== 'undefined') ? employees.find(e => e.id === id) : null;
    return emp ? { id: emp.id, nama: emp.nama, jabatan: emp.jabatan, nip: emp.nip, golongan: emp.golongan || emp.gol } : { id };
  });

  const activeEdit = window._activeEditingTrip || null;
  const stKey = normalizeTripNoStKey(noST);
  const tripId = (activeEdit && activeEdit.id)
    ? activeEdit.id
    : ('trip_' + (stKey ? noST.replace(/[^a-zA-Z0-9]/g, '_') : Date.now()));

  let provTeks = '';
  if (draft.fields.cbMultiProvinsi) {
    const p1 = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(draft.fields.provinsiTujuan1) : draft.fields.provinsiTujuan1;
    const p2 = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(draft.fields.provinsiTujuan2) : draft.fields.provinsiTujuan2;
    provTeks = [p1, p2].filter(Boolean).join(' & ');
  } else {
    provTeks = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(prov) : prov;
  }

  // Siapkan konversi CSV otomatis di latar belakang untuk integrasi database Supabase
  let csvStr = (typeof customCsvData === 'string' && customCsvData) ? customCsvData : '';
  if (!csvStr && typeof generatePerjadinCsvString === 'function') {
    try {
      csvStr = generatePerjadinCsvString(null, {
        noST, agenda, tglST: draft.fields.tglST,
        tglBerangkat: draft.fields.tglBerangkat, tglKembali: draft.fields.tglKembali,
        lamaTugas: draft.fields.lamaTugas, provinsiTujuan: provTeks,
        kotaTujuan: draft.fields.kotaTujuan, mak: draft.fields.mak,
        employees: empList, totalBiaya, draft
      });
    } catch (csvGenErr) {
      console.warn('Otomatisasi pembuatan CSV riwayat:', csvGenErr);
    }
  }

  const nowIso = new Date().toISOString();
  const actor = getCurrentRevisionActor();

  const historyItem = {
    id: tripId,
    noST: noST || 'Tanpa Nomor ST',
    agenda: agenda || 'Tanpa Agenda Perjalanan',
    tglST: draft.fields.tglST || '',
    tglBerangkat: draft.fields.tglBerangkat || '',
    tglKembali: draft.fields.tglKembali || '',
    lamaTugas: draft.fields.lamaTugas || '',
    provinsiTujuan: provTeks || '',
    kotaTujuan: draft.fields.kotaTujuan || '',
    mak: draft.fields.mak || '',
    empCount: empIds.length,
    employees: empList,
    totalBiaya: totalBiaya,
    status_berkas: (activeEdit && activeEdit.status_berkas) || 'diproses',
    savedAt: nowIso,
    createdAt: nowIso,
    createdBy: actor,
    revision_log: [],
    draft: draft,
    csv_data: csvStr
  };

  let list = getTripHistoryList();
  // Cari entri yang sudah ada berdasarkan context revisi aktif, cloudId, id, atau nomor ST (anti-duplikat)
  const existingIdx = list.findIndex(item => {
    if (!item) return false;
    if (activeEdit) {
      if (activeEdit.id && item.id === activeEdit.id) return true;
      if (activeEdit.cloudId && item.cloudId && item.cloudId === activeEdit.cloudId) return true;
    }
    if (item.id === historyItem.id) return true;
    if (stKey && normalizeTripNoStKey(item.noST) === stKey) return true;
    return false;
  });

  let isRevisionRecorded = false;

  if (existingIdx >= 0) {
    const existing = list[existingIdx];
    historyItem.id = existing.id;
    if (existing.cloudId) {
      historyItem.cloudId = existing.cloudId;
      historyItem.isCloud = true;
    } else if (activeEdit && activeEdit.cloudId) {
      historyItem.cloudId = activeEdit.cloudId;
      historyItem.isCloud = true;
    }
    if (existing.status_berkas) {
      historyItem.status_berkas = existing.status_berkas;
    }
    if (!historyItem.csv_data && existing.csv_data) {
      historyItem.csv_data = existing.csv_data;
    }
    historyItem.createdAt = existing.createdAt || existing.savedAt || nowIso;
    historyItem.createdBy = existing.createdBy || actor;

    const prevLogs = Array.isArray(existing.revision_log) ? [...existing.revision_log] : [];
    const oldSig = computeTripDraftSignature(existing);
    const newSig = computeTripDraftSignature(historyItem);

    // Catat log revisi apabila isi/data berkas berubah atau direvisi dari Mode Revisi
    if (oldSig !== newSig || activeEdit) {
      const revEntry = {
        id: 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        at: nowIso,
        actorId: actor.id,
        actorName: actor.nama,
        actorEmail: actor.email,
        actorRole: actor.role,
        actorRoleLabel: actor.roleLabel,
        action: 'revisi',
        note: buildRevisionSummaryNote(existing, historyItem)
      };
      // Cegah dobel log identik dalam 2 detik jika ter-klik beruntun
      const latestRev = prevLogs[0];
      const isRapidDup = latestRev
        && latestRev.note === revEntry.note
        && latestRev.actorEmail === revEntry.actorEmail
        && Math.abs(new Date(nowIso).getTime() - new Date(latestRev.at || 0).getTime()) < 2000;
      if (!isRapidDup) {
        prevLogs.unshift(revEntry);
        isRevisionRecorded = true;
      }
    }
    historyItem.revision_log = prevLogs;
    list[existingIdx] = historyItem;

    // Bersihkan jika sempat ada baris duplikat lain di lokal untuk noST/id/cloudId ini
    list = list.filter((it, idx) => {
      if (idx === existingIdx) return true;
      if (!it) return false;
      if (it.id === historyItem.id) return false;
      if (historyItem.cloudId && it.cloudId === historyItem.cloudId) return false;
      if (stKey && normalizeTripNoStKey(it.noST) === stKey) return false;
      return true;
    });
  } else {
    list.unshift(historyItem);
  }

  saveTripHistoryList(list);

  if (typeof renderTripHistory === 'function') {
    renderTripHistory();
  }

  // Auto-integrasi langsung 1x ke Cloud Database Supabase (tabel riwayat_perjadin)
  if (typeof uploadTripToCloud === 'function') {
    uploadTripToCloud(historyItem).then(cloudId => {
      if (cloudId) {
        historyItem.cloudId = cloudId;
        historyItem.isCloud = true;
        const curList = getTripHistoryList();
        const curIdx = curList.findIndex(x => x.id === historyItem.id || (stKey && normalizeTripNoStKey(x.noST) === stKey));
        if (curIdx >= 0) {
          curList[curIdx] = { ...curList[curIdx], ...historyItem, cloudId, isCloud: true };
        }
        saveTripHistoryList(curList);
        if (typeof renderTripHistory === 'function') renderTripHistory();
        if (isManual && typeof showRefreshToast === 'function') {
          showRefreshToast(
            isRevisionRecorded ? 'Revisi Tersimpan & Dicatat di Log' : 'Tersimpan & Terintegrasi ke Database',
            isRevisionRecorded
              ? `Revisi "${historyItem.noST}" oleh ${actor.nama} (${actor.roleLabel}) berhasil diperbarui ke database.`
              : `Data perjalanan "${historyItem.noST}" telah tersimpan dan masuk ke database cloud Supabase.`
          );
        }
      } else if (isManual && typeof showRefreshToast === 'function') {
        showRefreshToast(
          isRevisionRecorded ? 'Revisi Tersimpan ke Riwayat' : 'Perjalanan Tersimpan ke Riwayat',
          `Data perjalanan "${historyItem.noST}" berhasil dicatat ke riwayat.`
        );
      }
    }).catch(err => {
      console.warn('Gagal auto-integrasi ke Supabase:', err);
      if (isManual && typeof showRefreshToast === 'function') {
        showRefreshToast(
          'Perjalanan Tersimpan ke Riwayat',
          `Data perjalanan "${historyItem.noST}" berhasil dicatat ke riwayat.`
        );
      }
    });
  } else if (isManual && typeof showRefreshToast === 'function') {
    showRefreshToast(
      'Perjalanan Tersimpan ke Riwayat',
      `Data perjalanan "${historyItem.noST}" berhasil dicatat ke riwayat.`
    );
  }

  return historyItem;
}

function loadTripFromHistory(id, event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) {
    alert('Data riwayat perjalanan tidak ditemukan.');
    return;
  }

  const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  const isViewer = !canEdit && !!window.currentAuthUser;

  if (isViewer) {
    openTripPdfModal(id);
    return;
  }

  window._activeEditingTrip = {
    id: item.id,
    cloudId: item.cloudId || null,
    isCloud: !!item.isCloud,
    origNoST: item.noST || '',
    status_berkas: item.status_berkas || 'diproses',
    revision_log: Array.isArray(item.revision_log) ? [...item.revision_log] : []
  };

  if (typeof restorePerjadinDraftData === 'function') {
    restorePerjadinDraftData(item.draft);
  }

  // Jangan simpan PERJADIN_DRAFT_KEY ke localStorage agar refresh/tutup web tetap auto-clear form
  updateRevisionBanner(window._activeEditingTrip);
  showTab('input');

  setTimeout(() => {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Perjalanan Dimuat untuk Revisi',
        `Data "${item.noST}" siap direvisi. Saat disimpan nanti akan memperbarui data yang ada dan tercatat di Log Revisi.`
      );
    }
  }, 250);
}

function duplicateTripFromHistory(id, event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) return;

  window._activeEditingTrip = null;
  updateRevisionBanner(null);

  const clonedDraft = JSON.parse(JSON.stringify(item.draft));
  clonedDraft.fields.noST = '';
  clonedDraft.fields.noSTNum = '';

  if (typeof restorePerjadinDraftData === 'function') {
    restorePerjadinDraftData(clonedDraft);
  }

  showTab('input');

  setTimeout(() => {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Perjalanan Berhasil Diduplikasi',
        `Isian pegawai dan rute telah dimuat. Silakan masukkan Nomor Surat Tugas baru untuk perjalanan ini.`
      );
    }
  }, 250);
}

function deleteTripFromHistory(id, event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item) return;

  if (typeof isCurrentUserAdmin === 'function' && !isCurrentUserAdmin() && window.currentAuthUser) {
    alert('Akun Viewer hanya memiliki izin baca. Anda tidak memiliki wewenang menghapus data riwayat.');
    return;
  }

  if (!confirm(`Hapus perjalanan "${item.noST}" dari riwayat?`)) return;

  if (window._activeEditingTrip && window._activeEditingTrip.id === id) {
    window._activeEditingTrip = null;
    updateRevisionBanner(null);
  }

  if (item.cloudId && typeof removeTripFromCloud === 'function' && typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin()) {
    removeTripFromCloud(item.cloudId);
  }

  const updated = list.filter(x => x.id !== id);
  saveTripHistoryList(updated);
  renderTripHistory();

  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Riwayat Dihapus', `Perjalanan "${item.noST}" telah dihapus dari riwayat.`);
  }
}

function exportExcelFromHistory(id, mode = 'excel', event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) return;

  window._isExportingFromHistory = true;
  try {
    if (typeof restorePerjadinDraftData === 'function') {
      restorePerjadinDraftData(item.draft);
    }
    if (typeof exportPerjadinExcel === 'function') {
      exportPerjadinExcel(mode);
    }
  } finally {
    window._isExportingFromHistory = false;
  }
}

function formatHistoryDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const pad = n => String(n).padStart(2, '0');
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
  } catch (e) {
    return isoStr;
  }
}

let currentTripStatusFilter = 'all';

function setTripStatusFilter(filter) {
  currentTripStatusFilter = filter;
  const filterMap = { all: 'btnFilterAll', diproses: 'btnFilterDiproses', dicairkan: 'btnFilterDicairkan' };
  ['all', 'diproses', 'dicairkan'].forEach(f => {
    const btn = document.querySelector(`.btn-filter-pill[data-filter="${f}"]`) || document.getElementById(filterMap[f]);
    if (btn) btn.classList.toggle('active', f === filter);
  });
  renderTripHistory();
}

function renderDashboardModule(passedList = null) {
  const list = passedList || getTripHistoryList();
  const totalAll = list.length;
  const diprosesItems = list.filter(x => (x.status_berkas || 'diproses') !== 'dicairkan');
  const dicairkanItems = list.filter(x => x.status_berkas === 'dicairkan');
  const totalDiproses = diprosesItems.length;
  const totalDicairkan = dicairkanItems.length;
  const sumNominalDicairkan = dicairkanItems.reduce((acc, cur) => acc + (Number(cur.totalBiaya) || 0), 0);

  // Update KPI cards
  const elCountDiproses = document.getElementById('kpiCountDiproses');
  if (elCountDiproses) elCountDiproses.textContent = totalDiproses;

  const elCountDicairkan = document.getElementById('kpiCountDicairkan');
  if (elCountDicairkan) elCountDicairkan.textContent = totalDicairkan;

  const elNominalDicairkan = document.getElementById('kpiNominalDicairkan');
  if (elNominalDicairkan) {
    const formattedNominal = (typeof rp === 'function') ? rp(sumNominalDicairkan) : 'Rp ' + sumNominalDicairkan.toLocaleString('id-ID');
    elNominalDicairkan.textContent = `Total Dana: ${formattedNominal}`;
  }

  const elCountTotal = document.getElementById('kpiCountTotal');
  if (elCountTotal) elCountTotal.textContent = totalAll;

  // Update Progress Bar
  const pct = totalAll > 0 ? Math.round((totalDicairkan / totalAll) * 100) : 0;
  const fill = document.getElementById('dashboardProgressFill');
  if (fill) fill.style.width = pct + '%';

  const progressTxt = document.getElementById('dashboardProgressText');
  if (progressTxt) progressTxt.textContent = `${totalDicairkan} dari ${totalAll} Berkas Telah Dicairkan (${totalDiproses} Sedang Diproses)`;

  const progressPct = document.getElementById('dashboardProgressPct');
  if (progressPct) progressPct.textContent = `${pct}% Tuntas`;

  // Render recent 5 trips on dashboard
  const recentContainer = document.getElementById('dashboardRecentList');
  if (recentContainer) {
    if (list.length === 0) {
      recentContainer.innerHTML = `
        <div style="text-align:center; padding:28px 16px; color:var(--text-muted, #64748b);">
          Belum ada perjalanan dinas yang tercatat.
        </div>
      `;
    } else {
      const recentFive = list.slice(0, 5);
      recentContainer.innerHTML = `
        <table class="dashboard-recent-table">
          <colgroup>
            <col class="col-st-w">
            <col class="col-agenda-w">
            <col class="col-emp-w">
            <col class="col-cost-w">
            <col class="col-status-w">
            <col class="col-act-w">
          </colgroup>
          <thead>
            <tr>
              <th>Nomor ST</th>
              <th>Maksud &amp; Tujuan</th>
              <th>Pelaksana</th>
              <th style="text-align:right;">Total Biaya</th>
              <th style="text-align:center;">Status Satker</th>
              <th style="text-align:right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${recentFive.map(item => {
              const status = item.status_berkas || 'diproses';
              const isDicairkan = (status === 'dicairkan');
              const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
              const statusBadge = isDicairkan
                ? `<span class="history-status-badge status-dicairkan" ${canEdit ? `onclick="toggleTripStatus('${item.id}', event)" style="font-size:11px;padding:3px 9px;cursor:pointer;" title="Klik untuk mengubah status kembali ke Diproses ke Satker"` : 'style="font-size:11px;padding:3px 9px;"'}><svg class="ico" style="width:12px;height:12px;"><use href="#i-check"></use></svg>Dicairkan</span>`
                : `<span class="history-status-badge status-diproses" ${canEdit ? `onclick="toggleTripStatus('${item.id}', event)" style="font-size:11px;padding:3px 9px;cursor:pointer;" title="Klik untuk menandai berkas Sudah Dicairkan"` : 'style="font-size:11px;padding:3px 9px;"'}><svg class="ico" style="width:12px;height:12px;"><use href="#i-clipboard"></use></svg>Diproses</span>`;
              const cost = item.totalBiaya > 0 ? ((typeof rp === 'function') ? rp(item.totalBiaya) : 'Rp ' + Number(item.totalBiaya).toLocaleString('id-ID')) : 'Rp 0';
              const safeNo = (typeof escapeHtml === 'function') ? escapeHtml(item.noST || '-') : (item.noST || '-');
              const safeAgenda = (typeof escapeHtml === 'function') ? escapeHtml(item.agenda || '-') : (item.agenda || '-');
              const empCount = item.empCount || (item.employees || []).length || 1;
              return `
                <tr>
                  <td class="col-st">
                    <span class="recent-st-badge" title="${safeNo}">${safeNo}</span>
                  </td>
                  <td class="col-agenda">
                    <div class="recent-agenda-text" title="${safeAgenda}">${safeAgenda}</div>
                  </td>
                  <td class="col-emp">
                    <span class="recent-pelaksana-badge">
                      <svg class="ico" style="width:13px;height:13px;"><use href="#i-user"></use></svg>
                      <span>${empCount} Orang</span>
                    </span>
                  </td>
                  <td class="col-cost" style="text-align:right;">
                    <span class="recent-cost-val">${cost}</span>
                  </td>
                  <td class="col-status" style="text-align:center;">
                    ${statusBadge}
                  </td>
                  <td class="col-act" style="text-align:right;">
                    <button type="button" class="btn-recent-pdf" onclick="openTripPdfModal('${item.id}', event)" title="Buka berkas PDF lengkap per pelaksana">
                      <svg class="ico" style="width:13px;height:13px;"><use href="#i-file-lines"></use></svg>
                      <span>Berkas PDF</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }
}

function renderRevisionLogHtml(item) {
  const revs = Array.isArray(item.revision_log) ? item.revision_log : [];
  if (revs.length === 0) return '';

  const esc = (s) => (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s);
  const latest = revs[0];
  const latestName = esc(latest.actorName || latest.actorEmail || 'Pengguna');
  const latestRoleKey = (latest.actorRole === 'admin') ? 'admin' : ((latest.actorRole === 'operator' || latest.actorRole === 'editor') ? 'operator' : 'viewer');
  const latestRoleLabel = esc(latest.actorRoleLabel || (latestRoleKey === 'admin' ? 'Admin' : (latestRoleKey === 'operator' ? 'Role Khusus' : 'Pengguna')));
  const latestTime = esc(formatHistoryDate(latest.at));

  const timelineRows = revs.map((rev, idx) => {
    const revNum = revs.length - idx;
    const roleKey = (rev.actorRole === 'admin') ? 'admin' : ((rev.actorRole === 'operator' || rev.actorRole === 'editor') ? 'operator' : 'viewer');
    const roleLbl = esc(rev.actorRoleLabel || (roleKey === 'admin' ? 'Admin' : (roleKey === 'operator' ? 'Role Khusus' : 'Pengguna')));
    const actorName = esc(rev.actorName || rev.actorEmail || 'Pengguna');
    const actorEmail = (rev.actorEmail && rev.actorEmail !== '-') ? ` (${esc(rev.actorEmail)})` : '';
    const note = esc(rev.note || 'Revisi data berkas');
    const timeStr = esc(formatHistoryDate(rev.at));

    return `
      <div class="rev-log-entry">
        <div class="rev-log-marker">#${revNum}</div>
        <div class="rev-log-content">
          <div class="rev-log-meta">
            <strong class="rev-log-actor">${actorName}</strong><span class="rev-log-email">${actorEmail}</span>
            <span class="rev-role-tag rev-role-${roleKey}">${roleLbl}</span>
            <span class="rev-log-time">&bull; ${timeStr}</span>
          </div>
          <div class="rev-log-note">${note}</div>
        </div>
      </div>
    `;
  }).join('');

  const safeTripId = esc(item.id);
  return `
    <div class="history-revision-box" onclick="event.stopPropagation()">
      <button type="button" class="history-revision-toggle" onclick="toggleTripRevisionLog('${safeTripId}', event)" title="Klik untuk melihat riwayat log revisi lengkap">
        <span class="rev-badge-count">🕒 ${revs.length}x Revisi</span>
        <span class="rev-latest-summary">
          Terakhir: <strong>${latestName}</strong>
          <span class="rev-role-tag rev-role-${latestRoleKey}">${latestRoleLabel}</span>
          <span class="rev-latest-time">&bull; ${latestTime}</span>
        </span>
        <span class="rev-chevron">▾</span>
      </button>
      <div class="history-revision-timeline" id="revLog-${safeTripId}" data-rev-log="${safeTripId}" style="display:none;">
        ${timelineRows}
      </div>
    </div>
  `;
}

function renderTripHistory(filterText = '') {
  const container = document.getElementById('historyListContainer');
  const countBadge = document.getElementById('historyCountBadge');
  if (!container) return;

  const list = getTripHistoryList();

  // Hitung metrik KPI real-time untuk Dashboard & Filter Pills (tanpa auto-push ulang agar tidak ada duplikat DB)
  const totalAll = list.length;
  const diprosesItems = list.filter(x => (x.status_berkas || 'diproses') !== 'dicairkan');
  const dicairkanItems = list.filter(x => x.status_berkas === 'dicairkan');
  const totalDiproses = diprosesItems.length;
  const totalDicairkan = dicairkanItems.length;

  const elPillAll = document.getElementById('filterCountAll');
  if (elPillAll) elPillAll.textContent = totalAll;
  const elPillDiproses = document.getElementById('filterCountDiproses');
  if (elPillDiproses) elPillDiproses.textContent = totalDiproses;
  const elPillDicairkan = document.getElementById('filterCountDicairkan');
  if (elPillDicairkan) elPillDicairkan.textContent = totalDicairkan;

  // Sinkronkan data ke Dashboard Eksekutif
  renderDashboardModule(list);

  const q = String(filterText || document.getElementById('historySearchInput')?.value || '').trim().toLowerCase();

  const filtered = list.filter(item => {
    const status = item.status_berkas || 'diproses';
    if (currentTripStatusFilter === 'diproses' && status === 'dicairkan') return false;
    if (currentTripStatusFilter === 'dicairkan' && status !== 'dicairkan') return false;

    if (!q) return true;
    const provDisplay = (typeof getProvinsiDisplayName === 'function')
      ? getProvinsiDisplayName(item.provinsiTujuan)
      : (item.provinsiTujuan || '');
    const searchTarget = [
      item.noST,
      item.agenda,
      provDisplay,
      item.kotaTujuan,
      item.mak,
      item.status_berkas || 'diproses',
      ...(item.employees || []).map(e => e.nama || '')
    ].join(' ').toLowerCase();
    return searchTarget.includes(q);
  });

  if (countBadge) {
    countBadge.textContent = `${list.length} Riwayat Tersimpan`;
  }

  const searchWrap = document.querySelector('.history-search-wrap');
  if (searchWrap) {
    searchWrap.classList.toggle('has-val', !!q);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="history-empty-card">
        <div class="history-empty-icon">
          <svg class="ico"><use href="#i-history"></use></svg>
        </div>
        <h3>Belum Ada Riwayat Perjalanan</h3>
        <p>Setiap kali Anda mengklik <strong>Simpan Data</strong> (unduh Excel) atau tombol <strong>Simpan ke Riwayat</strong>, arsip perjalanan dinas akan otomatis tersimpan di sini agar dapat Anda buka dan revisi kembali kapan saja.</p>
        <button type="button" class="btn btn-primary" onclick="showTab('input')">
          <svg class="ico"><use href="#i-edit"></use></svg>
          <span>Buka Formulir Input Perjalanan</span>
        </button>
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    const safeQ = (typeof escapeHtml === 'function') ? escapeHtml(q) : q;
    container.innerHTML = `
      <div class="history-empty-card">
        <div class="history-empty-icon">
          <svg class="ico"><use href="#i-search"></use></svg>
        </div>
        <h3>Tidak Ditemukan Hasil</h3>
        <p>Tidak ada riwayat yang cocok dengan kata kunci <em>"${safeQ}"</em>.</p>
        <button type="button" class="btn btn-secondary" onclick="clearHistorySearch()">
          <span>Bersihkan Pencarian</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const costFormatted = item.totalBiaya > 0
      ? ((typeof rp === 'function') ? rp(item.totalBiaya) : 'Rp ' + Number(item.totalBiaya).toLocaleString('id-ID'))
      : 'Rp 0';

    const tglTeks = (item.tglBerangkat && item.tglKembali)
      ? `${(typeof formatTgl === 'function' ? formatTgl(item.tglBerangkat) : item.tglBerangkat)} s.d. ${(typeof formatTgl === 'function' ? formatTgl(item.tglKembali) : item.tglKembali)}`
      : item.tglBerangkat || 'Tanggal belum diisi';

    const durationTeks = item.lamaTugas ? ` (${item.lamaTugas})` : '';
    const provDisplay = (typeof getProvinsiDisplayName === 'function')
      ? getProvinsiDisplayName(item.provinsiTujuan)
      : (item.provinsiTujuan || '');
    const kota = (item.kotaTujuan || '').trim();
    let destinationTeks = 'Belum ditentukan';
    if (kota && provDisplay) {
      if (kota.toLowerCase().includes(provDisplay.toLowerCase())) {
        destinationTeks = kota;
      } else {
        destinationTeks = `${kota}, ${provDisplay}`;
      }
    } else if (kota) {
      destinationTeks = kota;
    } else if (provDisplay) {
      destinationTeks = provDisplay;
    }
    const emps = item.employees || [];

    const safeNoST = (typeof escapeHtml === 'function') ? escapeHtml(item.noST) : item.noST;
    const safeMak = (typeof escapeHtml === 'function') ? escapeHtml(item.mak) : item.mak;
    const safeAgenda = (typeof escapeHtml === 'function') ? escapeHtml(item.agenda) : item.agenda;
    const safeDest = (typeof escapeHtml === 'function') ? escapeHtml(destinationTeks) : destinationTeks;
    const safeTgl = (typeof escapeHtml === 'function') ? escapeHtml(tglTeks) : tglTeks;
    const safeDuration = (typeof escapeHtml === 'function') ? escapeHtml(durationTeks) : durationTeks;

    const empPillsHtml = emps.slice(0, 5).map(e => {
      const shortName = (e.nama || '').split(',')[0];
      const safeName = (typeof escapeHtml === 'function') ? escapeHtml(shortName) : shortName;
      return `<span class="emp-pill">${safeName}</span>`;
    }).join('');

    const morePillHtml = emps.length > 5 ? `<span class="emp-pill more">+${emps.length - 5} lainnya</span>` : '';
    const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
    const isViewer = !canEdit && !!window.currentAuthUser;
    const isCloud = !!item.isCloud;
    const storagePill = isCloud
      ? '<span class="history-cloud-pill" title="Tersimpan di Cloud Database Supabase">☁️ Cloud</span>'
      : '<span class="history-local-pill" title="Tersimpan di Penyimpanan Lokal Browser">💾 Lokal</span>';

    const status = item.status_berkas || 'diproses';
    const isDicairkan = status === 'dicairkan';
    const statusBadge = isDicairkan
      ? `<span class="history-status-badge status-dicairkan" ${canEdit ? `onclick="toggleTripStatus('${item.id}', event)" style="cursor:pointer;" title="Klik untuk mengubah status kembali ke Diproses ke Satker"` : 'title="Berkas telah diverifikasi dan dana dicairkan"'}><svg class="ico" style="width:14px;height:14px;"><use href="#i-check"></use></svg>Sudah Dicairkan</span>`
      : `<span class="history-status-badge status-diproses" ${canEdit ? `onclick="toggleTripStatus('${item.id}', event)" style="cursor:pointer;" title="Klik untuk menandai berkas Sudah Dicairkan"` : 'title="Berkas sedang dalam verifikasi &amp; pengujian Satker"'}><svg class="ico" style="width:14px;height:14px;"><use href="#i-clipboard"></use></svg>Diproses ke Satker</span>`;

    const statusToggleBtn = canEdit ? `
      <button type="button" class="btn btn-status-toggle ${isDicairkan ? 'is-diproses' : 'is-dicairkan'}" onclick="toggleTripStatus('${item.id}', event)" title="Perbarui status progres berkas ke Satker / Pencairan">
        <svg class="ico"><use href="${isDicairkan ? '#i-refresh' : '#i-check'}"></use></svg>
        <span>${isDicairkan ? 'Ubah ke Diproses' : 'Tandai Dicairkan'}</span>
      </button>
    ` : '';

    const cardActionsHtml = isViewer ? `
      <div class="history-card-actions">
        <button type="button" class="btn btn-primary btn-sm trip-pdf-btn-bundle" onclick="openTripPdfModal('${item.id}', event)" title="Buka dan unduh dokumen PDF lengkap per pelaksana">
          <svg class="ico"><use href="#i-file-lines"></use></svg>
          <span>Buka Dokumen PDF Lengkap</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'excel', event)" title="Unduh file Excel perjalanan ini">
          <svg class="ico"><use href="#i-save"></use></svg>
          <span>Unduh Excel</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'zip', event)" title="Unduh paket ZIP lengkap (Excel + Semua PDF)">
          <svg class="ico"><use href="#i-package"></use></svg>
          <span>Unduh ZIP</span>
        </button>
      </div>
    ` : `
      <div class="history-card-actions">
        ${statusToggleBtn}
        <button type="button" class="btn btn-primary btn-sm" onclick="loadTripFromHistory('${item.id}', event)" title="Muat seluruh data perjalanan ini ke formulir untuk diedit/direvisi">
          <svg class="ico"><use href="#i-edit"></use></svg>
          <span>Edit / Revisi</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm trip-pdf-btn-bundle" onclick="openTripPdfModal('${item.id}', event)" title="Buka dan unduh berkas PDF lengkap per pelaksana">
          <svg class="ico"><use href="#i-file-lines"></use></svg>
          <span>Dokumen PDF</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'excel', event)" title="Unduh file Excel perjalanan ini">
          <svg class="ico"><use href="#i-save"></use></svg>
          <span>Unduh Excel</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'zip', event)" title="Unduh paket ZIP lengkap">
          <svg class="ico"><use href="#i-package"></use></svg>
          <span>Unduh ZIP</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="duplicateTripFromHistory('${item.id}', event)" title="Salin data perjalanan ini untuk membuat perjalanan baru">
          <svg class="ico"><use href="#i-plus"></use></svg>
          <span>Duplikat</span>
        </button>
        ${(typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin()) ? `
        <button type="button" class="btn btn-outline btn-sm" onclick="deleteTripFromHistory('${item.id}', event)" title="Hapus perjalanan ini dari riwayat">
          <svg class="ico"><use href="#i-trash"></use></svg>
          <span>Hapus</span>
        </button>` : ''}
      </div>
    `;

    return `
      <div class="history-card" data-trip-id="${item.id}" onclick="handleTripCardClick(event, '${item.id}')" title="Klik untuk membuka dokumen PDF lengkap perjalanan ini">
        <div class="history-card-top">
          <div class="history-card-st">
            <span class="history-st-badge">${safeNoST}</span>
            ${safeMak ? `<span class="history-mak-pill" title="Mata Anggaran Kegiatan (MAK)">${safeMak}</span>` : ''}
            ${statusBadge}
            ${storagePill}
          </div>
          <div class="history-card-date">
            <svg class="ico"><use href="#i-calendar"></use></svg>
            <span>Disimpan: ${formatHistoryDate(item.savedAt)}</span>
          </div>
        </div>

        <div class="history-card-body">
          <h3 class="history-card-agenda">${safeAgenda}</h3>
          
          <div class="history-meta-grid">
            <div class="history-meta-item">
              <span class="meta-label">Tujuan</span>
              <span class="meta-val">${safeDest}</span>
            </div>
            <div class="history-meta-item">
              <span class="meta-label">Jadwal Pelaksanaan</span>
              <span class="meta-val">${safeTgl}${safeDuration}</span>
            </div>
            <div class="history-meta-item">
              <span class="meta-label">Pelaksana</span>
              <span class="meta-val">${item.empCount} Pegawai</span>
            </div>
            <div class="history-meta-item history-meta-cost">
              <span class="meta-label">Total Estimasi Biaya</span>
              <span class="meta-val cost-text">${costFormatted}</span>
            </div>
          </div>

          ${emps.length > 0 ? `
            <div class="history-emp-pills">
              ${empPillsHtml}
              ${morePillHtml}
            </div>
          ` : ''}

          ${renderRevisionLogHtml(item)}
        </div>

        ${cardActionsHtml}
      </div>
    `;
  }).join('');
}

async function toggleTripStatus(tripId, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  if (!canEdit) {
    alert('Hanya Admin dan Role Khusus yang berhak memperbarui progres berkas.');
    return;
  }
  const list = getTripHistoryList();
  const item = list.find(x => x.id === tripId);
  if (!item) return;

  const currentStatus = item.status_berkas || 'diproses';
  const newStatus = (currentStatus === 'dicairkan') ? 'diproses' : 'dicairkan';
  const oldLabel = (currentStatus === 'dicairkan') ? 'Sudah Dicairkan' : 'Diproses ke Satker';
  const newLabel = (newStatus === 'dicairkan') ? 'Sudah Dicairkan' : 'Diproses ke Satker';
  const nowIso = new Date().toISOString();
  const actor = getCurrentRevisionActor();

  item.status_berkas = newStatus;
  item.savedAt = nowIso;
  const logs = Array.isArray(item.revision_log) ? [...item.revision_log] : [];
  logs.unshift({
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    at: nowIso,
    actorId: actor.id,
    actorName: actor.nama,
    actorEmail: actor.email,
    actorRole: actor.role,
    actorRoleLabel: actor.roleLabel,
    action: 'status',
    note: `Update status berkas: ${oldLabel} → ${newLabel}`
  });
  item.revision_log = logs;

  saveTripHistoryList(list);
  renderTripHistory();
  renderDashboardModule(list);

  if (typeof showRefreshToast === 'function') {
    showRefreshToast(
      'Progres Berkas Diperbarui',
      `Status berkas "${item.noST}" diubah ke [${newLabel}] oleh ${actor.nama} (${actor.roleLabel}).`
    );
  }

  // Update ke database Supabase Cloud jika terhubung
  if (typeof uploadTripToCloud === 'function') {
    uploadTripToCloud(item).then(cloudId => {
      if (cloudId && !item.cloudId) {
        item.cloudId = cloudId;
        item.isCloud = true;
        saveTripHistoryList(list);
      }
    }).catch(e => {
      console.warn('Gagal sinkron status ke Supabase:', e);
    });
  }
}
window.toggleTripStatus = toggleTripStatus;

function filterTripHistory() {
  const input = document.getElementById('historySearchInput');
  renderTripHistory(input?.value || '');
}

function clearHistorySearch() {
  const input = document.getElementById('historySearchInput');
  if (input) input.value = '';
  renderTripHistory('');
}

function toggleSaveMenu(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const group = document.getElementById('saveSplitGroup');
  const menu = document.getElementById('saveSplitMenu');
  const btnArrow = document.querySelector('.btn-split-arrow');
  if (!menu) return;
  const isHidden = menu.style.display === 'none' || !menu.style.display;
  if (isHidden) {
    menu.style.display = 'block';
    if (group) group.classList.add('open');
    if (btnArrow) btnArrow.setAttribute('aria-expanded', 'true');
  } else {
    menu.style.display = 'none';
    if (group) group.classList.remove('open');
    if (btnArrow) btnArrow.setAttribute('aria-expanded', 'false');
  }
}

function closeSaveMenu() {
  const group = document.getElementById('saveSplitGroup');
  const menu = document.getElementById('saveSplitMenu');
  const btnArrow = document.querySelector('.btn-split-arrow');
  if (menu) menu.style.display = 'none';
  if (group) group.classList.remove('open');
  if (btnArrow) btnArrow.setAttribute('aria-expanded', 'false');
}

function selectSaveMode(mode) {
  closeSaveMenu();
  if (typeof exportPerjadinExcel === 'function') {
    exportPerjadinExcel(mode);
  }
}

document.addEventListener('click', function (e) {
  const group = document.getElementById('saveSplitGroup');
  if (group && !group.contains(e.target)) {
    closeSaveMenu();
  }
});

// =====================================================================
// TRIP PDF MODAL (DOKUMEN LENGKAP PER ORANG)
// =====================================================================

function handleTripCardClick(e, tripId) {
  if (e && e.target && e.target.closest('button, a, input, select, .btn-status-toggle, .history-status-badge, .history-revision-box')) {
    return;
  }
  openTripPdfModal(tripId, e);
}

let currentPdfModalTrip = null;
let currentPdfModalTripEmps = [];

function openTripPdfModal(tripId, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === tripId);
  if (!item) {
    alert('Data perjalanan tidak ditemukan.');
    return;
  }
  currentPdfModalTrip = item;

  const overlay = document.getElementById('tripPdfModalOverlay');
  if (!overlay) return;

  const elNoST = document.getElementById('tripPdfModalNoST');
  if (elNoST) elNoST.textContent = item.noST || 'Perjalanan Dinas';

  const elMAK = document.getElementById('tripPdfModalMAK');
  if (elMAK) {
    elMAK.textContent = item.mak || '-';
    elMAK.style.display = item.mak ? 'inline-block' : 'none';
  }

  const elStatus = document.getElementById('tripPdfModalStatus');
  if (elStatus) {
    const isDicairkan = (item.status_berkas === 'dicairkan');
    elStatus.className = `history-status-badge ${isDicairkan ? 'status-dicairkan' : 'status-diproses'}`;
    elStatus.innerHTML = `<svg class="ico" style="width:14px;height:14px;"><use href="${isDicairkan ? '#i-check' : '#i-clipboard'}"></use></svg>${isDicairkan ? 'Sudah Dicairkan' : 'Diproses ke Satker'}`;
    const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
    if (canEdit) {
      elStatus.style.cursor = 'pointer';
      elStatus.title = 'Klik untuk memperbarui progres status berkas (Diproses / Dicairkan)';
      elStatus.onclick = (ev) => {
        if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
        toggleTripStatus(item.id, ev);
        const updated = getTripHistoryList().find(x => x.id === item.id);
        if (updated) {
          const updDicairkan = (updated.status_berkas === 'dicairkan');
          elStatus.className = `history-status-badge ${updDicairkan ? 'status-dicairkan' : 'status-diproses'}`;
          elStatus.innerHTML = `<svg class="ico" style="width:14px;height:14px;"><use href="${updDicairkan ? '#i-check' : '#i-clipboard'}"></use></svg>${updDicairkan ? 'Sudah Dicairkan' : 'Diproses ke Satker'}`;
        }
      };
    } else {
      elStatus.style.cursor = 'default';
      elStatus.onclick = null;
    }
  }

  const elAgenda = document.getElementById('tripPdfModalAgenda');
  if (elAgenda) elAgenda.textContent = item.agenda || 'Tanpa Agenda';

  const provDisplay = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(item.provinsiTujuan) : (item.provinsiTujuan || '');
  const kota = (item.kotaTujuan || '').trim();
  let dest = kota && provDisplay ? (kota.toLowerCase().includes(provDisplay.toLowerCase()) ? kota : `${kota}, ${provDisplay}`) : (kota || provDisplay || '-');
  const elDest = document.getElementById('tripPdfModalDest');
  if (elDest) elDest.textContent = `Tujuan: ${dest}`;

  const tglTeks = (item.tglBerangkat && item.tglKembali)
    ? `${(typeof formatTgl === 'function' ? formatTgl(item.tglBerangkat) : item.tglBerangkat)} s.d. ${(typeof formatTgl === 'function' ? formatTgl(item.tglKembali) : item.tglKembali)}`
    : (item.tglBerangkat || '-');
  const duration = item.lamaTugas ? ` (${item.lamaTugas})` : '';
  const elDates = document.getElementById('tripPdfModalDates');
  if (elDates) elDates.textContent = `Tanggal: ${tglTeks}${duration}`;

  // Temporarily restore draft so hitungBiaya and document builders have exact context
  if (item.draft && typeof restorePerjadinDraftData === 'function') {
    try {
      restorePerjadinDraftData(item.draft);
    } catch (e) {
      console.warn('Draft restoration notice:', e);
    }
  }

  const masterEmps = (typeof employees !== 'undefined' && Array.isArray(employees)) ? employees : [];

  // Determine the exact list of employees assigned to this specific trip
  let tripEmps = [];
  const rawEmpIds = (item.draft && Array.isArray(item.draft.empIds) && item.draft.empIds.length > 0)
    ? item.draft.empIds
    : (Array.isArray(item.employees) && item.employees.length > 0 ? item.employees.map(e => e.id) : []);

  if (rawEmpIds.length > 0) {
    tripEmps = rawEmpIds.map(id => {
      const found = masterEmps.find(e => Number(e.id) === Number(id));
      if (found) return found;
      if (Array.isArray(item.employees)) {
        const itemEmp = item.employees.find(e => Number(e.id) === Number(id));
        if (itemEmp) return itemEmp;
      }
      return null;
    }).filter(Boolean);
  } else if (Array.isArray(item.employees) && item.employees.length > 0) {
    tripEmps = item.employees.map(ie => {
      const found = masterEmps.find(me => Number(me.id) === Number(ie.id));
      return found ? { ...ie, ...found } : ie;
    });
  } else if (typeof selectedEmpIds !== 'undefined' && selectedEmpIds.size > 0) {
    tripEmps = masterEmps.filter(e => selectedEmpIds.has(Number(e.id)));
  }

  currentPdfModalTripEmps = tripEmps;

  // Make sure selectedEmpIds strictly matches this trip's assigned employees
  if (typeof selectedEmpIds !== 'undefined') {
    selectedEmpIds.clear();
    tripEmps.forEach(e => selectedEmpIds.add(Number(e.id)));
  }

  let displayCost = item.totalBiaya;
  if (!displayCost || displayCost <= 0) {
    displayCost = tripEmps.reduce((sum, emp) => sum + (typeof hitungBiaya === 'function' ? (hitungBiaya(emp)?.total || 0) : 0), 0);
  }
  const costFormatted = displayCost > 0 ? ((typeof rp === 'function') ? rp(displayCost) : 'Rp ' + Number(displayCost).toLocaleString('id-ID')) : 'Rp 0';
  const elCost = document.getElementById('tripPdfModalTotalCost');
  if (elCost) elCost.textContent = `Total Biaya: ${costFormatted}`;

  const empContainer = document.getElementById('tripPdfEmpList');
  if (empContainer) {
    if (tripEmps.length === 0) {
      empContainer.innerHTML = `
        <div style="padding:32px 20px; text-align:center; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
          <svg class="ico" style="width:36px;height:36px;stroke:#94a3b8;margin-bottom:8px;"><use href="#i-users"></use></svg>
          <div style="font-weight:600; font-size:15px; color:#334155; margin-bottom:4px;">Tidak Ada Data Pelaksana</div>
          <div style="font-size:13px;">Berkas perjalanan ini tidak memiliki daftar pelaksana yang tersimpan.</div>
        </div>
      `;
    } else {
      const hasDpr = typeof isDPRAvailableForTrip === 'function' ? isDPRAvailableForTrip() : false;

      empContainer.innerHTML = tripEmps.map((emp) => {
        const initial = (emp.nama || 'P').charAt(0).toUpperCase();
        const nipTeks = emp.nip ? `NIP. ${emp.nip}` : 'NIP -';
        const golTeks = emp.golongan ? `Gol. ${emp.golongan}` : (emp.jabatan || '');
        const biaya = typeof hitungBiaya === 'function' ? hitungBiaya(emp) : { total: 0 };
        const costEmp = biaya.total > 0 ? ((typeof rp === 'function') ? rp(biaya.total) : 'Rp ' + Number(biaya.total).toLocaleString('id-ID')) : 'Rp 0';

        const safeName = (typeof escapeHtml === 'function') ? escapeHtml(emp.nama || 'Pegawai') : (emp.nama || 'Pegawai');
        const safeNip = (typeof escapeHtml === 'function') ? escapeHtml(nipTeks) : nipTeks;
        const safeGol = (typeof escapeHtml === 'function') ? escapeHtml(golTeks) : golTeks;

        return `
          <div class="trip-pdf-emp-card">
            <div class="trip-pdf-emp-main">
              <div class="trip-pdf-emp-profile">
                <div class="trip-pdf-avatar">${initial}</div>
                <div class="trip-pdf-emp-details">
                  <div class="trip-pdf-emp-name">${safeName}</div>
                  <div class="trip-pdf-emp-sub">
                    <span>${safeNip}</span>
                    ${safeGol ? `<span>&bull;</span><span>${safeGol}</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="trip-pdf-cost-badge">
                <span class="trip-pdf-cost-label">Total Biaya Riil</span>
                <span class="trip-pdf-cost-val">${costEmp}</span>
              </div>
            </div>

            <div class="trip-pdf-doc-pills">
              <span class="doc-pill">✓ Kuitansi Perorangan</span>
              <span class="doc-pill">✓ Rincian Biaya Riil</span>
              <span class="doc-pill">✓ SPPD Perorangan</span>
              ${hasDpr ? '<span class="doc-pill">✓ DPR Perorangan</span>' : ''}
            </div>

            <div class="trip-pdf-emp-actions">
              <div class="trip-pdf-quick-links">
                <button type="button" class="btn-mini-doc" onclick="downloadSingleDocFromModal(${emp.id}, 'kuitansi')" title="Unduh file Kuitansi saja">
                  <span>🧾 Kuitansi</span>
                </button>
                <button type="button" class="btn-mini-doc" onclick="downloadSingleDocFromModal(${emp.id}, 'rincian')" title="Unduh file Rincian Biaya saja">
                  <span>📋 Rincian</span>
                </button>
                <button type="button" class="btn-mini-doc" onclick="downloadSingleDocFromModal(${emp.id}, 'sppd')" title="Unduh file SPPD saja">
                  <span>📑 SPPD</span>
                </button>
                ${hasDpr ? `
                <button type="button" class="btn-mini-doc" onclick="downloadSingleDocFromModal(${emp.id}, 'dpr')" title="Unduh file DPR saja">
                  <span>📝 DPR</span>
                </button>` : ''}
              </div>

              <div style="display:flex; gap:8px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="previewCompleteEmpPdfFromModal(${emp.id}, this)" title="Lihat dan cetak dokumen lengkap pegawai ini">
                  <svg class="ico"><use href="#i-receipt"></use></svg>
                  <span>Pratinjau / Cetak</span>
                </button>
                <button type="button" class="btn btn-primary btn-sm trip-pdf-btn-bundle" onclick="downloadCompleteEmpPdfFromModal(${emp.id}, this)" title="Unduh berkas PDF gabungan lengkap (Kuitansi + Rincian + DPR + SPPD)">
                  <svg class="ico"><use href="#i-load"></use></svg>
                  <span>Unduh PDF Lengkap</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  overlay.classList.add('is-open');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeTripPdfModal() {
  const overlay = document.getElementById('tripPdfModalOverlay');
  if (overlay) {
    overlay.classList.remove('is-open');
    overlay.style.display = 'none';
  }
  document.body.style.overflow = '';
}

function handleTripPdfBackdrop(e) {
  if (e && e.target && e.target.id === 'tripPdfModalOverlay') {
    closeTripPdfModal();
  }
}

// Global listener untuk tombol Escape agar modal menutup dan scroll layar pulih aman
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTripPdfModal();
    if (typeof closeWelcomeOverlay === 'function') closeWelcomeOverlay();
    if (typeof closePMKOverlay === 'function') closePMKOverlay();
    document.body.style.overflow = '';
  }
});

async function getEmpMergedPdfBlob(empId) {
  if (!currentPdfModalTrip) throw new Error('Data perjalanan belum dimuat.');
  const masterEmps = (typeof employees !== 'undefined' && Array.isArray(employees)) ? employees : [];
  const emp = (currentPdfModalTripEmps || []).find(e => Number(e.id) === Number(empId))
           || masterEmps.find(e => Number(e.id) === Number(empId));
  if (!emp) throw new Error('Data pegawai tidak ditemukan.');

  const hasDpr = typeof isDPRAvailableForTrip === 'function' ? isDPRAvailableForTrip() : false;
  const kuitansiHtml = typeof buildKuitansiHtml === 'function' ? buildKuitansiHtml(emp) : '';
  const rincianHtml = typeof buildRincianHtml === 'function' ? buildRincianHtml(emp) : '';
  const dprHtml = (hasDpr && typeof buildDPRHtml === 'function') ? buildDPRHtml(emp) : '';
  const sppdHtml = typeof buildSPPDHtml === 'function' ? buildSPPDHtml(emp) : '';

  const blobs = [];
  if (kuitansiHtml && typeof generatePdfBlobFromHtml === 'function') {
    blobs.push(await generatePdfBlobFromHtml(kuitansiHtml));
  }
  if (rincianHtml && typeof generatePdfBlobFromHtml === 'function') {
    blobs.push(await generatePdfBlobFromHtml(rincianHtml));
  }
  if (dprHtml && typeof generatePdfBlobFromHtml === 'function') {
    blobs.push(await generatePdfBlobFromHtml(dprHtml));
  }
  if (sppdHtml && typeof generatePdfBlobFromHtml === 'function') {
    blobs.push(await generatePdfBlobFromHtml(sppdHtml));
  }

  let mergedBlob = null;
  if (typeof mergePdfBlobs === 'function') {
    try {
      mergedBlob = await mergePdfBlobs(blobs);
    } catch (err) {
      console.warn('mergePdfBlobs fallback:', err);
    }
  }

  if (!mergedBlob) {
    const allDocsHtml = typeof buildAllDocsHtmlForEmp === 'function' ? buildAllDocsHtmlForEmp(emp) : '';
    if (allDocsHtml && typeof generatePdfBlobFromHtml === 'function') {
      mergedBlob = await generatePdfBlobFromHtml(allDocsHtml);
    }
  }

  return { emp, blob: mergedBlob };
}

async function downloadCompleteEmpPdfFromModal(empId, btnEl) {
  const origHtml = btnEl ? btnEl.innerHTML : '';
  try {
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<span>⏳ Menyiapkan PDF...</span>';
    }
    const { emp, blob } = await getEmpMergedPdfBlob(empId);
    if (!blob) throw new Error('Gagal mengompilasi PDF.');

    const cleanSt = (currentPdfModalTrip.noST || 'Perjadin').replace(/[\/\\:*?"<>|]/g, '_');
    const cleanNama = (emp.nama || 'Pegawai').split(',')[0].replace(/[\/\\:*?"<>|]/g, '_');
    const fileName = `${cleanSt} - ${cleanNama} - Dokumen Lengkap.pdf`;

    if (typeof downloadBlob === 'function') {
      downloadBlob(blob, fileName);
    }
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Unduh PDF Berhasil', `Berkas lengkap "${fileName}" berhasil diunduh.`);
    }
  } catch (err) {
    console.error('Download PDF error:', err);
    alert('Gagal membuat dokumen PDF: ' + (err.message || err));
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = origHtml;
    }
  }
}

async function previewCompleteEmpPdfFromModal(empId, btnEl) {
  const origHtml = btnEl ? btnEl.innerHTML : '';
  try {
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<span>⏳ Membuka...</span>';
    }
    const { emp, blob } = await getEmpMergedPdfBlob(empId);
    if (!blob) throw new Error('Gagal mengompilasi PDF.');

    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (err) {
    console.error('Preview PDF error:', err);
    alert('Gagal membuka pratinjau PDF: ' + (err.message || err));
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = origHtml;
    }
  }
}

async function downloadSingleDocFromModal(empId, docType) {
  if (!currentPdfModalTrip) return;
  const masterEmps = (typeof employees !== 'undefined' && Array.isArray(employees)) ? employees : [];
  const emp = (currentPdfModalTripEmps || []).find(e => Number(e.id) === Number(empId))
           || masterEmps.find(e => Number(e.id) === Number(empId));
  if (!emp) return;

  let html = '';
  let label = 'Dokumen';
  if (docType === 'kuitansi') {
    html = typeof buildKuitansiHtml === 'function' ? buildKuitansiHtml(emp) : '';
    label = 'Kuitansi';
  } else if (docType === 'rincian') {
    html = typeof buildRincianHtml === 'function' ? buildRincianHtml(emp) : '';
    label = 'Rincian Biaya';
  } else if (docType === 'sppd') {
    html = typeof buildSPPDHtml === 'function' ? buildSPPDHtml(emp) : '';
    label = 'SPPD';
  } else if (docType === 'dpr') {
    html = typeof buildDPRHtml === 'function' ? buildDPRHtml(emp) : '';
    label = 'DPR';
  }

  if (!html) {
    alert('Dokumen tidak tersedia.');
    return;
  }

  try {
    if (typeof generatePdfBlobFromHtml === 'function') {
      const blob = await generatePdfBlobFromHtml(html);
      const cleanSt = (currentPdfModalTrip.noST || 'Perjadin').replace(/[\/\\:*?"<>|]/g, '_');
      const cleanNama = (emp.nama || 'Pegawai').split(',')[0].replace(/[\/\\:*?"<>|]/g, '_');
      if (typeof downloadBlob === 'function') {
        downloadBlob(blob, `${cleanSt} - ${cleanNama} - ${label}.pdf`);
      }
    }
  } catch (e) {
    alert('Gagal membuat PDF: ' + e.message);
  }
}

async function downloadTripRincianPdfFromModal() {
  if (!currentPdfModalTrip) return;
  const btn = document.getElementById('btnTripPdfRincian') || document.getElementById('btnTripPdfNominatif');
  const origHtml = btn ? btn.innerHTML : '';
  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Menyiapkan Rincian...</span>';
    }
    if (typeof renderRekapRincian === 'function') renderRekapRincian();
    const el = document.getElementById('rekapRincianOut');
    const html = el ? el.innerHTML : '';
    if (!html || html.includes('alert-warn')) throw new Error('Data rincian biaya belum lengkap.');

    if (typeof generatePdfBlobFromHtml === 'function') {
      const blob = await generatePdfBlobFromHtml(html, {
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      });
      const cleanSt = (currentPdfModalTrip.noST || 'Perjadin').replace(/[\/\\:*?"<>|]/g, '_');
      if (typeof downloadBlob === 'function') {
        downloadBlob(blob, `${cleanSt} - Rekap Rincian Biaya Riil.pdf`);
      }
    }
  } catch (e) {
    alert('Gagal mengunduh Rekap Rincian: ' + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}
window.downloadTripRincianPdfFromModal = downloadTripRincianPdfFromModal;
window.downloadTripNominatifPdfFromModal = downloadTripRincianPdfFromModal;

function downloadTripZipFromModal() {
  if (!currentPdfModalTrip) return;
  exportExcelFromHistory(currentPdfModalTrip.id, 'zip');
}

window.handleTripCardClick = handleTripCardClick;
window.openTripPdfModal = openTripPdfModal;
window.closeTripPdfModal = closeTripPdfModal;
window.handleTripPdfBackdrop = handleTripPdfBackdrop;
window.downloadCompleteEmpPdfFromModal = downloadCompleteEmpPdfFromModal;
window.previewCompleteEmpPdfFromModal = previewCompleteEmpPdfFromModal;
window.downloadSingleDocFromModal = downloadSingleDocFromModal;
window.downloadTripNominatifPdfFromModal = downloadTripNominatifPdfFromModal;
window.downloadTripZipFromModal = downloadTripZipFromModal;

window.toggleSaveMenu = toggleSaveMenu;
window.closeSaveMenu = closeSaveMenu;
window.selectSaveMode = selectSaveMode;

window.saveTripToHistory = saveCurrentTripToHistory;
window.saveCurrentTripToHistory = saveCurrentTripToHistory;
window.getTripHistoryList = getTripHistoryList;
window.loadTripFromHistory = loadTripFromHistory;
window.duplicateTripFromHistory = duplicateTripFromHistory;
window.deleteTripFromHistory = deleteTripFromHistory;
window.exportExcelFromHistory = exportExcelFromHistory;
window.resetPerjadinForm = resetPerjadinForm;
window.renderDashboardModule = renderDashboardModule;
window.setTripStatusFilter = setTripStatusFilter;
window.renderTripHistory = renderTripHistory;
window.filterTripHistory = filterTripHistory;
window.clearHistorySearch = clearHistorySearch;
