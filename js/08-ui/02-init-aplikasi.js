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

