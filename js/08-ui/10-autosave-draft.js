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
    manualMeals,
    bbmData: (typeof collectBbmFormData === 'function' ? collectBbmFormData() : null)
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

  if (data.bbmData && typeof loadBbmRecordIntoForm === 'function') {
    try {
      loadBbmRecordIntoForm(data.bbmData);
    } catch (e) {
      console.warn('Gagal memuat bbmData bundle ke form BBM:', e);
    }
  }

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

