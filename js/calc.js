// =====================================================================
// SBM & PERHITUNGAN BIAYA (PerdinKu)
// Perhitungan uang harian, hotel, transportasi, DPR, dan tarif SBM
// =====================================================================

// =====================================================================
// SBM & LAMA TUGAS
// =====================================================================
function isKepulauanSeribuTarget(sbmObj, kotaTeks, agendaTeks) {
  if (sbmObj && sbmObj.isKepulauanSeribu) return true;
  if (sbmObj && sbmObj.sekitarJakarta && sbmObj.sekitarJakarta.id === 'kep_seribu') return true;
  const kota = String(kotaTeks !== undefined ? kotaTeks : (typeof document !== 'undefined' ? (document.getElementById('kotaTujuan')?.value || '') : '')).trim();
  const agenda = String(agendaTeks !== undefined ? agendaTeks : (typeof document !== 'undefined' ? (document.getElementById('agenda')?.value || '') : '')).trim();
  return /seribu|pulau\s+seribu|pramuka|tidung|pari|kelapa|harapan|lancang/i.test(`${kota} ${agenda}`);
}

function adjustSbmForSekitarJakarta(sbm) {
  const kotaTujuan = typeof document !== 'undefined' ? (document.getElementById('kotaTujuan')?.value || '') : '';
  const agenda = typeof document !== 'undefined' ? (document.getElementById('agenda')?.value || '') : '';
  const isKepSeribu = isKepulauanSeribuTarget(sbm, kotaTujuan, agenda);
  const sekitar = typeof getSbmSekitarJakarta === 'function' ? getSbmSekitarJakarta(kotaTujuan) : null;

  if (isKepSeribu) {
    const baseSbm = (sbm && sbm.provinsi === 'DKI JAKARTA') ? sbm : (typeof sbmData !== 'undefined' ? (sbmData.find(s => s.id === 13) || sbm) : sbm);
    const kepSeribuSekitar = sekitar || (typeof sbmTransportSekitarJakarta !== 'undefined' ? sbmTransportSekitarJakarta.find(item => item.id === 'kep_seribu') : null);
    if (!baseSbm) return null;
    return {
      ...baseSbm,
      isSekitarJakarta: true,
      sekitarJakarta: kepSeribuSekitar,
      isKepulauanSeribu: true,
      uh: 210000,              // Khusus Kepulauan Seribu: Uang Harian Rp 210.000
      jktPP: kepSeribuSekitar ? kepSeribuSekitar.pp : 772000,
      taxi: 0,
      dpr: kepSeribuSekitar ? kepSeribuSekitar.pp : 772000,
      dprOneWay: kepSeribuSekitar ? kepSeribuSekitar.oneWay : 386000
    };
  }

  if (sekitar) {
    const baseSbm = sbm || (typeof sbmData !== 'undefined' ? sbmData.find(s => s.id === sekitar.provId) : null);
    if (!baseSbm) return null;
    return {
      ...baseSbm,
      isSekitarJakarta: true,
      sekitarJakarta: sekitar,
      uh: baseSbm.uh,
      jktPP: sekitar.pp,       // SBM Transport Jakarta - Daerah Sekitar PP (One Way x 2)
      taxi: 0,                 // Termasuk dalam rute PP
      dpr: sekitar.pp,         // Batas SBM Transport / DPR = One Way x 2
      dprOneWay: sekitar.oneWay
    };
  }

  return sbm;
}

function getSBM() {
  if (isMultiProvActive()) {
    const id1 = parseInt(document.getElementById('provinsiTujuan1')?.value || document.getElementById('provinsiTujuan')?.value);
    const s1 = (typeof sbmData !== 'undefined' && Array.isArray(sbmData)) ? sbmData.find(s => s.id === id1) : null;
    if (s1) return adjustSbmForSekitarJakarta(s1);
  }
  const id = parseInt(document.getElementById('provinsiTujuan')?.value);
  const s = (typeof sbmData !== 'undefined' && Array.isArray(sbmData)) ? (sbmData.find(item => item.id === id) || null) : null;
  return adjustSbmForSekitarJakarta(s);
}

const PROVINSI_AKRONIM = new Set(['DKI', 'D.I.']);

function formatProvinsi(nama) {
  return String(nama || '')
    .split(/\s+/)
    .map(word => PROVINSI_AKRONIM.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function getProvShortName(provName) {
  if (!provName) return '';
  const up = String(provName).toUpperCase();
  if (up.includes('BARAT') && up.includes('NUSA TENGGARA')) return 'NTB';
  if (up.includes('TIMUR') && up.includes('NUSA TENGGARA')) return 'NTT';
  if (up === 'DKI JAKARTA') return 'DKI Jakarta';
  if (up === 'D.I. YOGYAKARTA' || up === 'DI YOGYAKARTA' || up === 'DAERAH ISTIMEWA YOGYAKARTA') return 'D.I. Yogyakarta';
  return formatProvinsi(provName);
}

function isMultiProvActive() {
  return !!document.getElementById('cbMultiProvinsi')?.checked;
}

function getMultiProvData() {
  if (!isMultiProvActive()) return null;
  const id1 = parseInt(document.getElementById('provinsiTujuan1')?.value || document.getElementById('provinsiTujuan')?.value);
  const id2 = parseInt(document.getElementById('provinsiTujuan2')?.value);
  const sbm1 = sbmData.find(s => s.id === id1) || null;
  const sbm2 = sbmData.find(s => s.id === id2) || null;
  if (!sbm1 || !sbm2) return null;

  const totalDays = getDays().days || 1;
  let d1 = parseInt(document.getElementById('hariProvinsi1')?.value);
  let d2 = parseInt(document.getElementById('hariProvinsi2')?.value);

  if (isNaN(d1) || d1 <= 0) d1 = Math.max(1, Math.floor(totalDays / 2));
  if (isNaN(d2) || d2 <= 0) d2 = Math.max(1, totalDays - d1);

  return {
    sbm1,
    sbm2,
    days1: d1,
    days2: d2
  };
}

function toggleMultiProvinsi() {
  const isChecked = !!document.getElementById('cbMultiProvinsi')?.checked;
  const sec = document.getElementById('multiProvSection');
  const mainProvGroup = document.getElementById('mainProvinsiGroup') || document.querySelector('[data-field="provinsiTujuan"]');
  if (sec) sec.style.display = isChecked ? 'block' : 'none';
  if (mainProvGroup) {
    mainProvGroup.style.display = isChecked ? 'none' : '';
    if (isChecked) mainProvGroup.classList.remove('has-error');
  }

  if (isChecked) {
    const mainProv = document.getElementById('provinsiTujuan')?.value;
    const prov1 = document.getElementById('provinsiTujuan1');
    if (prov1 && mainProv && !prov1.value) {
      prov1.value = mainProv;
    }
    const totalDays = getDays().days || 1;
    const elDays1 = document.getElementById('hariProvinsi1');
    const elDays2 = document.getElementById('hariProvinsi2');
    if (elDays1 && (!elDays1.value || parseInt(elDays1.value) <= 0)) {
      elDays1.value = Math.max(1, Math.floor(totalDays / 2));
    }
    if (elDays2 && (!elDays2.value || parseInt(elDays2.value) <= 0)) {
      elDays2.value = Math.max(1, totalDays - parseInt(elDays1.value || 1));
    }
    const lblTotal = document.getElementById('multiProvTotalLama');
    if (lblTotal) lblTotal.textContent = `${totalDays} Hari`;
  } else {
    const prov1Val = document.getElementById('provinsiTujuan1')?.value;
    const mainProv = document.getElementById('provinsiTujuan');
    if (mainProv && prov1Val && !mainProv.value) {
      mainProv.value = prov1Val;
      changeProvince();
    }
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function onMultiProvChange(idx) {
  const p1 = document.getElementById('provinsiTujuan1');
  const p2 = document.getElementById('provinsiTujuan2');
  const main = document.getElementById('provinsiTujuan');
  if (p1 && p1.value && main) {
    main.value = p1.value;
  }
  if (p1 && typeof updateFieldFilledStatus === 'function') updateFieldFilledStatus(p1);
  if (p2 && typeof updateFieldFilledStatus === 'function') updateFieldFilledStatus(p2);
  const sbm = getSBM();
  if (sbm) {
    const makanRate = sbm.makan || 0;
    const snackRate = sbm.snack || 0;
    const isManualMakan = !!document.getElementById('cbTarifMakanManual')?.checked;
    const elMakan = document.getElementById('tarifMakan');
    if (elMakan && !isManualMakan) elMakan.value = makanRate ? rp(makanRate) : '0';
    const elSnack = document.getElementById('tarifSnack');
    if (elSnack) elSnack.value = snackRate ? rp(snackRate) : '0';
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function onMultiProvDaysChange(idx) {
  const totalDays = getDays().days || 1;
  const el1 = document.getElementById('hariProvinsi1');
  const el2 = document.getElementById('hariProvinsi2');
  if (!el1 || !el2) return;

  if (idx === 1) {
    let d1 = parseInt(el1.value);
    if (!isNaN(d1)) {
      if (d1 >= totalDays && totalDays > 1) {
        d1 = totalDays - 1;
        el1.value = d1;
      }
      if (d1 > 0) {
        el2.value = Math.max(1, totalDays - d1);
      }
    }
  } else if (idx === 2) {
    let d2 = parseInt(el2.value);
    if (!isNaN(d2)) {
      if (d2 >= totalDays && totalDays > 1) {
        d2 = totalDays - 1;
        el2.value = d2;
      }
      if (d2 > 0) {
        el1.value = Math.max(1, totalDays - d2);
      }
    }
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function kotaDenganProvinsi(kota) {
  const text = String(kota || '').trim();
  const sbm = getSBM();
  if (!text || !sbm) return text;
  const provinsi = formatProvinsi(sbm.provinsi);
  const lower = text.toLowerCase();
  if (lower.includes(sbm.provinsi.toLowerCase()) || lower.includes(provinsi.toLowerCase())) return text;
  return `${text}, ${provinsi}`;
}

function getTujuanDisplay(kotaTeks) {
  const text = String(kotaTeks || '').trim();
  const multi = getMultiProvData();
  if (multi) {
    const p1 = formatProvinsi(multi.sbm1.provinsi);
    const p2 = formatProvinsi(multi.sbm2.provinsi);
    if (text) return `${text} (${p1} & ${p2})`;
    return `${p1} & ${p2}`;
  }
  if (text) return kotaDenganProvinsi(text);
  const sbm = getSBM();
  return sbm ? `${sbm.ibukota}, ${formatProvinsi(sbm.provinsi)}` : '-';
}

function changeProvince() {
  currentRateProvinceId = document.getElementById('provinsiTujuan').value;
  const sbm = getSBM();
  const makanRate = sbm ? (sbm.makan || 0) : 0;
  const snackRate = sbm ? (sbm.snack || 0) : 0;
  const isManualMakan = !!document.getElementById('cbTarifMakanManual')?.checked;
  const elMakan = document.getElementById('tarifMakan');
  if (elMakan && !isManualMakan) elMakan.value = makanRate ? rp(makanRate) : '0';
  const elSnack = document.getElementById('tarifSnack');
  if (elSnack) elSnack.value = snackRate ? rp(snackRate) : '0';
  const elDpr = document.getElementById('dprManual');
  if (elDpr) elDpr.value = '';
  const isDki = sbm && sbm.provinsi === 'DKI JAKARTA';
  const cbDPR = document.getElementById('cbDPR');
  if (cbDPR) cbDPR.checked = isDki;
  dprAutoCheckedForDki = isDki;
  const noteJkt = document.getElementById('noteJakartaDPR');
  if (noteJkt) noteJkt.style.display = isDki ? 'block' : 'none';
  updateDPRInput();
  updateSBMPreview();
  updateSbmWarnings();
  if (typeof renderRincianTransportEditor === 'function') {
    renderRincianTransportEditor();
  }
}

function markDPRManual() {
  dprAutoCheckedForDki = false;
}

function updateDPRInput() {
  const el = document.getElementById('dprManualField');
  if (el) el.style.display = 'none';
}

function saveProvinceFoodRates() {
  if (!currentRateProvinceId) return;
  provinceFoodRates[currentRateProvinceId] = {
    makan: Math.max(0, parseNumber(document.getElementById('tarifMakan')?.value) || 0),
    snack: Math.max(0, parseNumber(document.getElementById('tarifSnack')?.value) || 0)
  };
  localStorage.setItem('provinceFoodRates', JSON.stringify(provinceFoodRates));
}

function toggleTarifMakanManual() {
  const cb = document.getElementById('cbTarifMakanManual');
  const input = document.getElementById('tarifMakan');
  const label = document.getElementById('labelTarifMakan');
  const jmMakan = document.getElementById('jumlahMakan');
  const cbKonsumsiBiasa = document.getElementById('cbKonsumsiBiasa');
  const toggleWrap = document.getElementById('manualMealModeToggle');
  const wrapDetail = document.getElementById('manualMealDetailWrap');
  const gTarif = document.getElementById('tarifMakanGroup');
  const gHari = document.getElementById('hariMakanGroup');
  const gJumlah = document.getElementById('jumlahMakanGroup');
  if (!input) return;

  const isManual = !!cb?.checked;
  if (isManual) {
    if (toggleWrap) toggleWrap.style.display = 'inline-flex';
    input.removeAttribute('readonly');
    input.classList.remove('is-readonly');
    if (label) label.textContent = 'Tarif Makan Manual (Rp/kali)';

    if (cbKonsumsiBiasa && !cbKonsumsiBiasa.checked) {
      cbKonsumsiBiasa.checked = true;
      const kf = document.getElementById('konsumsiFields');
      if (kf) kf.style.display = 'grid';
    }

    if (jmMakan && (Number(jmMakan.value) <= 0 || !jmMakan.value)) {
      jmMakan.value = '1';
    }

    const mode = document.getElementById('manualMakanMode')?.value || 'flat';
    setManualMealMode(mode);
  } else {
    if (toggleWrap) toggleWrap.style.display = 'none';
    if (wrapDetail) wrapDetail.style.display = 'none';
    if (gTarif) gTarif.style.display = '';
    if (gHari) gHari.style.display = '';
    if (gJumlah) gJumlah.style.display = '';

    input.setAttribute('readonly', 'readonly');
    input.classList.add('is-readonly');
    if (label) label.textContent = 'Tarif Makan SBM (Rp/kali)';
    const sbm = getSBM();
    const makanRate = sbm ? (sbm.makan || 0) : 0;
    input.value = makanRate ? rp(makanRate) : '0';
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function setManualMealMode(mode) {
  const modeInput = document.getElementById('manualMakanMode');
  if (modeInput) modeInput.value = mode;

  const btnFlat = document.getElementById('btnMealModeFlat');
  const btnDetail = document.getElementById('btnMealModeDetail');
  const wrapDetail = document.getElementById('manualMealDetailWrap');
  const gTarif = document.getElementById('tarifMakanGroup');
  const gHari = document.getElementById('hariMakanGroup');
  const gJumlah = document.getElementById('jumlahMakanGroup');

  if (mode === 'detail') {
    if (btnFlat) btnFlat.classList.remove('is-active');
    if (btnDetail) btnDetail.classList.add('is-active');
    if (gTarif) gTarif.style.display = 'none';
    if (gHari) gHari.style.display = 'none';
    if (gJumlah) gJumlah.style.display = 'none';
    if (wrapDetail) wrapDetail.style.display = 'block';

    const tbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
    if (tbody && tbody.children.length === 0) {
      const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
      for (let i = 1; i <= tripDays; i++) {
        addManualMealRow(`Hari ${i}`, 'Makan Siang');
      }
    }
  } else {
    // flat
    if (btnFlat) btnFlat.classList.add('is-active');
    if (btnDetail) btnDetail.classList.remove('is-active');
    if (wrapDetail) wrapDetail.style.display = 'none';
    if (gTarif) gTarif.style.display = '';
    if (gHari) gHari.style.display = '';
    if (gJumlah) gJumlah.style.display = '';
  }

  onManualMealRowChange();
}

function toggleDetailMakanSection(forceState) {
  setManualMealMode(forceState !== false ? 'detail' : 'flat');
}

function setManualMakanMode(mode) {
  setManualMealMode(mode);
}

function getManualMealDayOptions(selectedDay = 'Hari 1') {
  const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
  const count = Math.max(1, tripDays);
  let options = '';
  for (let i = 1; i <= count; i++) {
    const val = `Hari ${i}`;
    const sel = val === selectedDay ? 'selected' : '';
    options += `<option value="${val}" ${sel}>${val}</option>`;
  }
  const selMatch = selectedDay && selectedDay.match(/Hari\s+(\d+)/i);
  if (selMatch && parseInt(selMatch[1]) > count) {
    options += `<option value="${selectedDay}" selected>${selectedDay}</option>`;
  }
  return options;
}

const MANUAL_MEAL_SESSIONS = ['Makan Siang', 'Makan Malam', 'Makan Pagi', 'Makan Lainnya'];

function getManualMealSessionOptions(selectedSession = 'Makan Siang') {
  return MANUAL_MEAL_SESSIONS.map(s => `<option value="${s}" ${s === selectedSession ? 'selected' : ''}>${s}</option>`).join('');
}

function openMealDuplicateModal(day, session) {
  const overlay = document.getElementById('mealDuplicateOverlay');
  const msgEl = document.getElementById('mealDuplicateMsg');
  const titleEl = document.getElementById('mealDuplicateTitle');
  const sessionName = session || 'Makan Siang';
  const dayName = day || 'hari tersebut';

  if (day === 'seluruh hari') {
    if (titleEl) titleEl.textContent = 'Semua Sesi Makan Sudah Diinput';
    if (msgEl) {
      const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
      msgEl.textContent = `Semua sesi makan untuk ${tripDays} hari perjalanan dinas sudah diinput lengkap. Tidak ada sesi makan yang dapat ditambahkan lagi.`;
    }
  } else {
    if (titleEl) titleEl.textContent = 'Sesi Makan Sudah Diinput';
    if (msgEl) {
      msgEl.textContent = `Sesi ${sessionName} untuk ${dayName} sudah diinput sebelumnya. Tidak bisa menambahkan atau memilih sesi makan yang sama dua kali pada hari yang sama.`;
    }
  }

  if (overlay) {
    overlay.classList.add('is-open');
  } else {
    alert(`Sesi ${sessionName} untuk ${dayName} sudah diinput sebelumnya!`);
  }

  if (typeof showValidationToast === 'function') {
    showValidationToast(null, `Sesi ${sessionName} untuk ${dayName} sudah diinput sebelumnya!`);
  }
}

function closeMealDuplicateModal() {
  const overlay = document.getElementById('mealDuplicateOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function handleMealDuplicateBackdrop(event) {
  if (event.target && event.target.id === 'mealDuplicateOverlay') {
    closeMealDuplicateModal();
  }
}

function getMaxMealRateForDay(dayStr) {
  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  let defaultRate = sbm ? (sbm.makan || 0) : 0;

  if (typeof isMultiProvActive === 'function' && isMultiProvActive()) {
    const mpData = typeof getMultiProvData === 'function' ? getMultiProvData() : null;
    if (mpData && dayStr) {
      const m = String(dayStr).match(/Hari\s+(\d+)/i);
      const dayNum = m ? parseInt(m[1]) : 1;
      const d1 = parseInt(document.getElementById('hariProvinsi1')?.value) || 0;
      if (dayNum > d1 && mpData.sbm2 && mpData.sbm2.makan) {
        return mpData.sbm2.makan;
      } else if (mpData.sbm1 && mpData.sbm1.makan) {
        return mpData.sbm1.makan;
      }
    }
  }
  return defaultRate;
}

function openSbmLimitModal(componentOrOptions, maxRate, provName) {
  let title = 'Melebihi Batas SBM Daerah';
  let component = 'Biaya';
  let limitRate = maxRate;
  let province = provName;
  let customMsg = '';

  if (typeof componentOrOptions === 'object' && componentOrOptions !== null) {
    title = componentOrOptions.title || title;
    component = componentOrOptions.component || component;
    limitRate = componentOrOptions.maxRate !== undefined ? componentOrOptions.maxRate : maxRate;
    province = componentOrOptions.provName || provName;
    customMsg = componentOrOptions.msg || '';
  } else if (typeof componentOrOptions === 'string') {
    component = componentOrOptions;
  }

  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  if (!province && sbm) {
    province = typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi;
  }

  const overlay = document.getElementById('mealLimitOverlay');
  const titleEl = document.getElementById('mealLimitTitle');
  const msgEl = document.getElementById('mealLimitMsg');
  const maxFormatted = typeof rp === 'function' ? rp(limitRate) : `Rp ${Number(limitRate || 0).toLocaleString('id-ID')}`;

  if (titleEl) titleEl.textContent = title;
  if (msgEl) {
    if (customMsg) {
      msgEl.innerHTML = customMsg;
    } else {
      const provLabel = province ? ` untuk provinsi <strong>${province}</strong>` : '';
      msgEl.innerHTML = `Komponen <strong>${component}</strong>${provLabel} tidak boleh melebihi ketentuan Standar Biaya Masukan (SBM) sebesar <strong>${maxFormatted}</strong>. Nilai otomatis disesuaikan ke batas maksimum SBM.`;
    }
  }

  if (overlay) {
    overlay.classList.add('is-open');
  } else {
    alert(`⚠️ MELEBIHI BATAS SBM\n\nKomponen ${component}${province ? ' untuk ' + province : ''} tidak boleh melebihi batas SBM sebesar ${maxFormatted}. Nilai otomatis disesuaikan ke batas maksimum.`);
  }

  if (typeof showValidationToast === 'function') {
    showValidationToast(null, `${component} melebihi batas SBM ${maxFormatted}! Otomatis disesuaikan.`);
  }
}

function openMealLimitModal(dayName, maxRate) {
  const dayLabel = dayName ? ` untuk ${dayName}` : '';
  openSbmLimitModal({
    title: 'Melebihi Batas SBM Daerah',
    component: `Tarif Makan Riil${dayLabel}`,
    maxRate: maxRate,
    msg: `Tarif makan riil per orang${dayLabel} tidak boleh melebihi Standar Biaya Masukan (SBM) daerah tujuan sebesar <strong>${typeof rp === 'function' ? rp(maxRate) : 'Rp ' + maxRate}</strong>. Nilai otomatis disesuaikan ke batas maksimal SBM.`
  });
}

function closeMealLimitModal() {
  const overlay = document.getElementById('mealLimitOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function handleMealLimitBackdrop(event) {
  if (event.target && event.target.id === 'mealLimitOverlay') {
    closeMealLimitModal();
  }
}

function handleManualMealSelectChange(selectEl) {
  if (!selectEl) return;
  if (!selectEl.dataset) selectEl.dataset = {};
  const row = selectEl.closest ? selectEl.closest('.manual-meal-row') : selectEl.parentElement?.closest('.manual-meal-row');
  if (!row) return;

  const daySel = row.querySelector('.manual-meal-day');
  const sessionSel = row.querySelector('.manual-meal-session');
  if (!daySel || !sessionSel) return;

  const currentDay = daySel.value;
  const currentSession = sessionSel.value;

  const allRows = document.querySelectorAll('.manual-meal-row');
  let duplicateFound = false;

  allRows.forEach(otherRow => {
    if (otherRow === row) return;
    const otherDay = otherRow.querySelector('.manual-meal-day')?.value;
    const otherSession = otherRow.querySelector('.manual-meal-session')?.value;
    if (otherDay === currentDay && otherSession === currentSession) {
      duplicateFound = true;
    }
  });

  if (duplicateFound) {
    const prevVal = selectEl.dataset.prevValue;
    if (prevVal) {
      selectEl.value = prevVal;
    }
    openMealDuplicateModal(currentDay, currentSession);
    return;
  }

  selectEl.dataset.prevValue = selectEl.value;

  if (selectEl.classList.contains('manual-meal-day')) {
    const priceInput = row.querySelector('.manual-meal-price');
    if (priceInput) {
      const curVal = parseNumber(priceInput.value);
      const newMax = getMaxMealRateForDay(currentDay);
      if (newMax > 0 && curVal > newMax) {
        priceInput.value = rp(newMax);
        openMealLimitModal(currentDay, newMax);
      }
    }
  }

  onManualMealRowChange();
}

function addManualMealRow(day = null, session = null, price = '') {
  const tbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
  if (!tbody) return null;

  const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
  const currentCount = tbody.children.length;

  const takenSet = new Set();
  const existingRows = tbody.querySelectorAll ? tbody.querySelectorAll('.manual-meal-row') : (tbody.children || []);
  Array.from(existingRows).forEach(r => {
    const d = r.querySelector ? r.querySelector('.manual-meal-day')?.value : null;
    const s = r.querySelector ? r.querySelector('.manual-meal-session')?.value : null;
    if (d && s) takenSet.add(`${d}||${s}`);
  });

  if (!day || !session) {
    let candidateDay = null;
    let candidateSession = null;
    const standardSessions = ['Makan Siang', 'Makan Malam', 'Makan Pagi', 'Makan Lainnya'];

    for (const s of standardSessions) {
      for (let d = 1; d <= tripDays; d++) {
        const key = `Hari ${d}||${s}`;
        if (!takenSet.has(key)) {
          candidateDay = `Hari ${d}`;
          candidateSession = s;
          break;
        }
      }
      if (candidateDay) break;
    }

    if (!candidateDay) {
      openMealDuplicateModal('seluruh hari', 'Semua sesi makan');
      return null;
    }

    day = candidateDay;
    session = candidateSession;
  } else {
    const key = `${day}||${session}`;
    if (takenSet.has(key)) {
      openMealDuplicateModal(day, session);
      return null;
    }
  }

  const maxRate = getMaxMealRateForDay(day);
  let effectivePrice = (price !== null && price !== '' && price !== undefined) ? parseNumber(price) : maxRate;
  if (maxRate > 0 && effectivePrice > maxRate) {
    effectivePrice = maxRate;
  }

  const row = document.createElement('tr');
  row.className = 'manual-meal-row';
  row.innerHTML = `
    <td class="tc manual-meal-row-num">${currentCount + 1}</td>
    <td>
      <select class="manual-meal-day" onfocus="this.dataset.prevValue=this.value" onchange="handleManualMealSelectChange(this)">
        ${getManualMealDayOptions(day)}
      </select>
    </td>
    <td>
      <select class="manual-meal-session" onfocus="this.dataset.prevValue=this.value" onchange="handleManualMealSelectChange(this)">
        ${getManualMealSessionOptions(session)}
      </select>
    </td>
    <td>
      <input type="text" class="manual-meal-price" value="${effectivePrice > 0 ? (typeof rp === 'function' ? rp(effectivePrice) : effectivePrice) : ''}" placeholder="Rp 0" oninput="formatManualMealPriceInput(this); onManualMealRowChange();">
    </td>
    <td class="tc">
      <button type="button" class="manual-meal-btn-del" onclick="removeManualMealRow(this)" title="Hapus sesi makan ini">✕</button>
    </td>
  `;
  tbody.appendChild(row);

  const daySel = row.querySelector('.manual-meal-day');
  if (daySel) {
    daySel.value = day;
    if (!daySel.dataset) daySel.dataset = {};
    daySel.dataset.prevValue = day;
  }
  const sessionSel = row.querySelector('.manual-meal-session');
  if (sessionSel) {
    sessionSel.value = session;
    if (!sessionSel.dataset) sessionSel.dataset = {};
    sessionSel.dataset.prevValue = session;
  }

  reindexManualMealRows();
  onManualMealRowChange();
  return row;
}

function refreshManualMealDayOptions() {
  const tbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
  if (!tbody) return;
  const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;

  const rows = [...(tbody.querySelectorAll ? tbody.querySelectorAll('.manual-meal-row') : (tbody.children || []))];
  rows.forEach(row => {
    const dayVal = row.querySelector ? row.querySelector('.manual-meal-day')?.value : null;
    const m = dayVal && dayVal.match(/Hari\s+(\d+)/i);
    if (m && parseInt(m[1]) > tripDays && tripDays > 0) {
      if (typeof row.remove === 'function') row.remove();
    }
  });

  const daySelects = tbody.querySelectorAll ? tbody.querySelectorAll('.manual-meal-day') : [];
  daySelects.forEach(sel => {
    const currentVal = sel.value;
    sel.innerHTML = getManualMealDayOptions(currentVal);
    sel.value = currentVal;
    if (!sel.dataset) sel.dataset = {};
    sel.dataset.prevValue = currentVal;
  });

  reindexManualMealRows();
  onManualMealRowChange();
}

function removeManualMealRow(btn) {
  const row = btn.closest('.manual-meal-row');
  if (row) {
    row.remove();
    reindexManualMealRows();
    onManualMealRowChange();
  }
}

function reindexManualMealRows() {
  const rows = document.querySelectorAll('.manual-meal-row');
  rows.forEach((row, idx) => {
    const numEl = row.querySelector('.manual-meal-row-num');
    if (numEl) numEl.textContent = idx + 1;
  });
}

function formatManualMealPriceInput(input) {
  const row = input.closest ? input.closest('.manual-meal-row') : input.parentElement?.closest('.manual-meal-row');
  const dayVal = row?.querySelector ? row.querySelector('.manual-meal-day')?.value : null;
  const maxRate = getMaxMealRateForDay(dayVal);
  const num = parseNumber(input.value);

  if (maxRate > 0 && num > maxRate) {
    input.value = typeof rp === 'function' ? rp(maxRate) : `Rp ${maxRate}`;
    openMealLimitModal(dayVal, maxRate);
    return;
  }

  if (num > 0) {
    input.value = typeof rp === 'function' ? rp(num) : `Rp ${num}`;
  } else if (input.value.trim() !== '') {
    input.value = '';
  }
}

function getManualMealEntries() {
  const rows = document.querySelectorAll('.manual-meal-row');
  const entries = [];
  rows.forEach((row, idx) => {
    const day = row.querySelector('.manual-meal-day')?.value || `Hari ${idx + 1}`;
    const session = row.querySelector('.manual-meal-session')?.value || 'Makan Siang';
    const price = parseNumber(row.querySelector('.manual-meal-price')?.value) || 0;
    if (price > 0) {
      entries.push({ id: idx + 1, day, session, price });
    }
  });
  return entries;
}

function updateManualMealSummary() {
  const sumEl = document.getElementById('manualMealSummary');
  if (!sumEl) return;
  const entries = getManualMealEntries();
  const total = entries.reduce((s, e) => s + e.price, 0);
  sumEl.textContent = `Total Potongan: ${entries.length} kali makan = ${rp(total)}`;
}

function onManualMealRowChange() {
  updateManualMealSummary();
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function onTarifMakanManualInput() {
  const cb = document.getElementById('cbTarifMakanManual');
  if (!cb?.checked) return;
  const jmMakan = document.getElementById('jumlahMakan');
  if (jmMakan && (Number(jmMakan.value) <= 0 || !jmMakan.value)) {
    jmMakan.value = '1';
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function onKonsumsiInputChange() {
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function toggleKonsumsiFields() {
  const jenis = document.getElementById('jenisKegiatan')?.value || 'biasa';
  const optBiasaWrap = document.getElementById('optKonsumsiBiasaWrap');
  const konsumsiFields = document.getElementById('konsumsiFields');
  const cbKonsumsiBiasa = document.getElementById('cbKonsumsiBiasa');
  const jmMakan = document.getElementById('jumlahMakan');

  if (jenis === 'rapat') {
    if (optBiasaWrap) optBiasaWrap.style.display = 'none';
    if (konsumsiFields) konsumsiFields.style.display = 'grid';
    if (jmMakan && (Number(jmMakan.value) <= 0 || !jmMakan.value)) {
      jmMakan.value = '1';
    }
  } else if (jenis === 'biasa') {
    if (optBiasaWrap) optBiasaWrap.style.display = 'flex';
    if (konsumsiFields) {
      konsumsiFields.style.display = cbKonsumsiBiasa?.checked ? 'grid' : 'none';
      if (cbKonsumsiBiasa?.checked) {
        if (jmMakan && (Number(jmMakan.value) <= 0 || !jmMakan.value)) {
          jmMakan.value = '1';
        }
      }
    }
  } else {
    // fullboard or diklat
    if (optBiasaWrap) optBiasaWrap.style.display = 'none';
    if (konsumsiFields) konsumsiFields.style.display = 'none';
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function toggleUHFields() {
  const cb = document.getElementById('cbUH');
  const uhFields = document.getElementById('uhFields');
  if (!cb) return;

  const isChecked = !!cb.checked;
  if (uhFields) {
    uhFields.style.display = isChecked ? 'block' : 'none';
  }

  if (isChecked) {
    toggleKonsumsiFields();
  }

  updateSBMPreview();
  updateSbmWarnings();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function toggleHotelFields() {
  const checked = document.getElementById('cbHotel').checked;
  document.getElementById('hotelFields').style.display = checked ? 'grid' : 'none';
  if (checked && !document.querySelectorAll('#hotelList .hotel-row').length) {
    addHotelRow(getDays().nights || 1);
  }
}

function formatHotelPriceInput(input) {
  const num = parseNumber(input.value);
  if (num > 0) {
    input.value = typeof rp === 'function' ? rp(num) : `Rp ${num}`;
  } else if (input.value.trim() !== '') {
    input.value = '';
  }
}

function addHotelRow(nights = 1, price = '') {
  const row = document.createElement('div');
  row.className = 'hotel-row';
  const displayPrice = price ? (typeof rp === 'function' ? rp(price) : price) : '';
  row.innerHTML = `
    <label class="hotel-field"><span>Nama hotel (opsional)</span><input type="text" class="hotel-name" placeholder="Contoh: Hotel Nusa Dua"></label>
    <label class="hotel-field hotel-field-nights"><span>Malam</span><input type="number" class="hotel-nights" min="0" step="1" value="${nights}"></label>
    <label class="hotel-field"><span>Harga per malam (Rp)</span><input type="text" class="hotel-price" value="${displayPrice}" placeholder="Isi harga manual" oninput="formatHotelPriceInput(this); updateHotelSummary(this.closest('.hotel-row'))"></label>
    <button class="btn btn-warn btn-sm" type="button" onclick="removeHotelRow(this)">Hapus</button>
    <div class="hotel-guests"></div>
    <div class="hotel-summary"></div>
  `;
  document.getElementById('hotelList').appendChild(row);
  renderHotelGuests(row);
  updateSbmWarnings();
}

function renderHotelGuests(row) {
  const box = row.querySelector('.hotel-guests');
  if (!box) return;
  if (selectedEmpIds.size === 0) {
    box.innerHTML = '<div class="hotel-guests-empty">Pilih pegawai dulu untuk menentukan yang dibebani biaya kamar.</div>';
    return;
  }
  const existing = [...row.querySelectorAll('.hotel-guest-check')];
  const knownIds = existing.map(cb => Number(cb.dataset.employeeId));
  const checkedIds = existing.filter(cb => cb.checked).map(cb => Number(cb.dataset.employeeId));
  const selected = [...selectedEmpIds];
  box.innerHTML = `
    <span class="hotel-guests-title">Pegawai yang menanggung kamar — biaya kamar penuh per pegawai</span>
    <div class="hotel-guest-list">
      ${selected.map(id => {
        const emp = employees.find(e => e.id === id);
        const isChecked = existing.length ? checkedIds.includes(id) || !knownIds.includes(id) : true;
        return `<label class="hotel-guest"><input type="checkbox" class="hotel-guest-check" data-employee-id="${id}" ${isChecked ? 'checked' : ''}><span>${emp.nama}</span></label>`;
      }).join('')}
    </div>
  `;
  updateHotelSummary(row);
}

function updateHotelSummary(row) {
  if (!row) return;
  const el = row.querySelector('.hotel-summary');
  if (!el) return;
  const nights = Math.max(0, Number(row.querySelector('.hotel-nights')?.value) || 0);
  const price = Math.max(0, parseNumber(row.querySelector('.hotel-price')?.value) || 0);
  const roomTotal = nights * price;
  if (roomTotal <= 0) {
    el.textContent = '';
    return;
  }
  const count = row.querySelectorAll('.hotel-guest-check:checked').length;
  el.textContent = count
    ? `Total kamar ${rp(roomTotal)} — ${rp(roomTotal)} per pegawai × ${count} pegawai = ${rp(roomTotal * count)}`
    : `Total kamar ${rp(roomTotal)} — belum ada pegawai dicentang, biaya belum masuk rincian.`;
}

function refreshHotelSummaries() {
  document.querySelectorAll('#hotelList .hotel-row').forEach(updateHotelSummary);
}

function refreshHotelGuests() {
  document.querySelectorAll('#hotelList .hotel-row').forEach(renderHotelGuests);
}

function removeHotelRow(button) {
  button.closest('.hotel-row').remove();
  updateSbmWarnings();
}

function getHotelEntries() {
  return [...document.querySelectorAll('#hotelList .hotel-row')].map(row => ({
    name: row.querySelector('.hotel-name')?.value.trim() || '',
    nights: Math.max(0, Number(row.querySelector('.hotel-nights')?.value) || 0),
    price: Math.max(0, parseNumber(row.querySelector('.hotel-price')?.value) || 0),
    employeeIds: [...row.querySelectorAll('.hotel-guest-check:checked')].map(cb => Number(cb.dataset.employeeId))
  })).filter(item => item.name || item.price > 0);
}

const TRANSPORT_COST_RE = /\b(grab|grabcar|gojek|goride|gocar|grabbike|ojek|ojol|maxim|toll|tol|bensin|bbm|pertamax|pertalite|solar|parkir|taxi|taksi|angkot|mrt|krl|lrt|commuterline|tj|transjakarta|busway|transport)\b/i;
const TOLL_COST_RE = /\b(toll|tol)\b/i;
const TICKET_COST_RE = /\b(tiket|kereta|whoosh|pesawat|kapal|ferry|feri|speedboat)\b/i;
const TICKET_CATEGORY_RULES = [
  { re: /\b(kereta|kai)\b/i, label: 'Tiket Kereta' },
  { re: /\b(pesawat|penerbangan|flight)\b/i, label: 'Tiket Pesawat' },
  { re: /\bwhoosh\b/i, label: 'Tiket Whoosh' },
  { re: /\b(kapal|ferry|feri|speedboat|pelni)\b/i, label: 'Tiket Kapal' },
  { re: /\b(bus|travel|shuttle|damri)\b/i, label: 'Tiket Bus/Travel' }
];

function getTicketCostLabel(name) {
  if (!name) return 'Tiket Perjalanan';
  const rule = TICKET_CATEGORY_RULES.find(item => item.re.test(name));
  if (rule) return rule.label;
  let cleaned = name
    .replace(/\s*[\(\[]?\s*(pp|pulang\s*pergi|pergi|berangkat|pulang)\s*[\)\]]?\s*/gi, ' ')
    .replace(/\s*-\s*(pp|pulang\s*pergi|pergi|berangkat|pulang)\s*$/gi, '')
    .trim();
  if (!cleaned.toLowerCase().startsWith('tiket')) {
    cleaned = 'Tiket ' + cleaned;
  }
  return cleaned || 'Tiket Perjalanan';
}

function addCustomCost() {
  if (typeof isTripToDki === 'function' && isTripToDki()) {
    openDkiTransportModal();
    return;
  }
  const row = document.createElement('div');
  row.className = 'custom-cost-row';
  row.dataset.kindAuto = '1';
  row.innerHTML = `
    <div class="custom-cost-top">
      <div class="custom-cost-field custom-cost-name-field">
        <label class="custom-cost-label">Nama Biaya</label>
        <input type="text" class="custom-cost-name" placeholder="Contoh: Grab, Tol, Tiket kapal, atau Bensin" oninput="detectCustomCostKind(this)">
      </div>
      <div class="custom-cost-field custom-cost-kind-field">
        <label class="custom-cost-label">Kategori</label>
        <div class="custom-kind" role="group" aria-label="Kelompok biaya">
          <button type="button" class="custom-kind-btn active" data-kind="other" aria-pressed="true" onclick="setCustomCostKind(this)">Biaya lain</button>
          <button type="button" class="custom-kind-btn" data-kind="tiket" aria-pressed="false" onclick="setCustomCostKind(this)">Tiket</button>
          <button type="button" class="custom-kind-btn" data-kind="transport" aria-pressed="false" onclick="setCustomCostKind(this)">Transport PP</button>
        </div>
      </div>
      <div class="custom-cost-field custom-cost-del-field">
        <label class="custom-cost-label custom-cost-del-label" aria-hidden="true">&nbsp;</label>
        <button class="btn btn-warn custom-cost-del-btn" type="button" onclick="removeCustomCostRow(this)">Hapus</button>
      </div>
    </div>
    <div class="custom-route">
      <span class="custom-route-title">Keterangan Rute (Opsional)</span>
      <div class="custom-route-fields">
        <label class="custom-route-field custom-route-pickup"><span class="custom-route-label-pickup">Titik jemput</span><input type="text" class="custom-cost-pickup" placeholder="Contoh: Stasiun Gambir"></label>
        <label class="custom-route-field custom-route-dropoff"><span class="custom-route-label-dropoff">Titik antar</span><input type="text" class="custom-cost-dropoff" placeholder="Contoh: Rumah"></label>
      </div>
    </div>
    <div class="custom-cost-assignees-box">
      <div class="custom-cost-assignees-header">
        <span class="custom-cost-assignees-title">Nominal Biaya per Pegawai</span>
        <span class="custom-cost-assignees-tip">Diisi sesuai pembagian biaya untuk masing-masing pegawai</span>
      </div>
      <div class="custom-cost-assignees"></div>
    </div>
  `;
  document.getElementById('customCostList').appendChild(row);
  renderCustomCostAssignments(row);
  updateCustomCostRouteFields(row);
}

function removeCustomCostRow(button) {
  button.closest('.custom-cost-row').remove();
  updateSbmWarnings();
}

function setCustomCostKind(button) {
  const row = button.closest('.custom-cost-row');
  row.dataset.kindAuto = '0';
  applyCustomCostKind(row, button.dataset.kind);
}

function detectCustomCostKind(input) {
  const row = input.closest('.custom-cost-row');
  if (row.dataset.kindAuto === '0') return;
  const value = input.value;
  const kind = TICKET_COST_RE.test(value) ? 'tiket' : TRANSPORT_COST_RE.test(value) ? 'transport' : 'other';
  applyCustomCostKind(row, kind);
}

function applyCustomCostKind(row, kind) {
  row.querySelectorAll('.custom-kind-btn').forEach(btn => {
    const active = btn.dataset.kind === kind;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  updateCustomCostRouteFields(row);
  updateSbmWarnings();
}

function updateCustomCostRouteFields(row) {
  const kind = row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other';
  const name = row.querySelector('.custom-cost-name')?.value || '';
  const isTicket = kind === 'tiket';
  const isToll = kind === 'transport' && TOLL_COST_RE.test(name);
  const pickupLabel = row.querySelector('.custom-route-label-pickup');
  const dropoffLabel = row.querySelector('.custom-route-label-dropoff');
  const pickupInput = row.querySelector('.custom-cost-pickup');
  const dropoffInput = row.querySelector('.custom-cost-dropoff');
  const dropoffField = row.querySelector('.custom-route-dropoff');
  const fields = row.querySelector('.custom-route-fields');
  const routeBox = row.querySelector('.custom-route');

  if (pickupLabel && dropoffLabel && pickupInput && dropoffInput) {
    if (isTicket) {
      pickupLabel.textContent = 'Keberangkatan';
      dropoffLabel.textContent = 'Kedatangan';
      pickupInput.placeholder = 'Contoh: Stasiun Gambir';
      dropoffInput.placeholder = 'Contoh: Bandung';
    } else if (isToll) {
      pickupLabel.textContent = 'Keterangan tol';
      pickupInput.placeholder = 'Contoh: Tol Cipularang';
    } else {
      pickupLabel.textContent = 'Titik jemput';
      dropoffLabel.textContent = 'Titik antar';
      pickupInput.placeholder = 'Contoh: Stasiun Gambir';
      dropoffInput.placeholder = 'Contoh: Rumah';
    }
  }

  if (dropoffField) dropoffField.style.display = isToll ? 'none' : '';
  if (fields) fields.classList.toggle('single', isToll);
  if (routeBox) {
    const hasRouteVal = !!(pickupInput?.value?.trim() || dropoffInput?.value?.trim());
    routeBox.style.display = (kind === 'other' && !hasRouteVal) ? 'none' : '';
  }
}

function formatCustomCostAmountInput(input) {
  const num = parseNumber(input.value);
  if (num > 0) {
    input.value = typeof rp === 'function' ? rp(num) : `Rp ${num}`;
  } else if (input.value.trim() !== '') {
    input.value = '';
  }
}

function renderCustomCostAssignments(row) {
  const assignments = row.querySelector('.custom-cost-assignees');
  let currentAmounts = {};
  try {
    currentAmounts = JSON.parse(row.dataset.amounts || '{}');
  } catch (error) {
    currentAmounts = {};
  }
  row.querySelectorAll('.custom-cost-amount').forEach(input => {
    const val = parseNumber(input.value);
    if (val > 0) {
      currentAmounts[input.dataset.employeeId] = val;
    }
  });
  row.dataset.amounts = JSON.stringify(currentAmounts);

  if (selectedEmpIds.size === 0) {
    assignments.innerHTML = '<div class="custom-cost-empty">Pilih pegawai di Langkah 1 untuk mengatur nominal per orang.</div>';
    return;
  }

  assignments.innerHTML = [...selectedEmpIds].map(id => {
    const emp = employees.find(employee => employee.id === id);
    const rawVal = currentAmounts[id];
    const numVal = parseNumber(rawVal);
    const displayVal = numVal > 0 ? (typeof rp === 'function' ? rp(numVal) : 'Rp ' + numVal) : '';
    return `
      <label class="custom-cost-assignee">
        <span title="${emp ? emp.nama : ''}">${emp ? emp.nama : ''}</span>
        <input type="text" class="custom-cost-amount" data-employee-id="${id}" placeholder="Rp 0" value="${displayVal}" oninput="formatCustomCostAmountInput(this); updateCustomCostAmount(this)" aria-label="Biaya ${row.querySelector('.custom-cost-name')?.value || 'tambahan'} untuk ${emp ? emp.nama : ''}">
      </label>
    `;
  }).join('');
}

function updateCustomCostAmount(input) {
  const row = input.closest('.custom-cost-row');
  if (!row) return;
  let amounts = {};
  try {
    amounts = JSON.parse(row.dataset.amounts || '{}');
  } catch (error) {
    amounts = {};
  }
  const num = parseNumber(input.value);
  if (num > 0) {
    amounts[input.dataset.employeeId] = num;
  } else {
    delete amounts[input.dataset.employeeId];
  }
  row.dataset.amounts = JSON.stringify(amounts);
}

function refreshCustomCostAssignments() {
  document.querySelectorAll('.custom-cost-row').forEach(renderCustomCostAssignments);
}

function getCustomCosts() {
  return [...document.querySelectorAll('.custom-cost-row')].map(row => {
    const name = row.querySelector('.custom-cost-name')?.value.trim() || '';
    const kind = row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other';
    const isToll = kind === 'transport' && TOLL_COST_RE.test(name);
    return {
      name,
      kind,
      pickup: row.querySelector('.custom-cost-pickup')?.value.trim() || '',
      dropoff: isToll ? '' : row.querySelector('.custom-cost-dropoff')?.value.trim() || '',
      amounts: Object.fromEntries([...row.querySelectorAll('.custom-cost-amount')].map(input => [
        input.dataset.employeeId,
        Math.max(0, parseNumber(input.value) || 0)
      ]))
    };
  }).filter(item => item.name);
}

function updateSBMPreview() {
  const sbm = getSBM();
  const pv = document.getElementById('sbmPreview');
  if (!pv) return;
  if (!sbm) { pv.style.display = 'none'; return; }
  pv.style.display = 'block';
  const isKepSeribu = typeof isKepulauanSeribuTarget === 'function' ? isKepulauanSeribuTarget(sbm) : !!(sbm.isKepulauanSeribu || (sbm.sekitarJakarta && sbm.sekitarJakarta.id === 'kep_seribu'));
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';
  const isDkiNoUh = isDkiJakarta && !isKepSeribu;
  const multi = getMultiProvData();
  const cbUH = document.getElementById('cbUH');
  const isUHActive = !cbUH || cbUH.checked;

  const elUH = document.getElementById('sbm_uh');
  if (elUH) {
    if (!isUHActive) {
      elUH.textContent = `${rp(0)} (tidak dipilih)`;
    } else if (multi) {
      const p1 = getProvShortName(multi.sbm1.provinsi);
      const p2 = getProvShortName(multi.sbm2.provinsi);
      elUH.textContent = `${rp(multi.sbm1.uh)} (${p1}) & ${rp(multi.sbm2.uh)} (${p2})`;
    } else if (isKepSeribu) {
      elUH.textContent = rp(210000);
    } else {
      elUH.textContent = isDkiNoUh ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.uh);
    }
  }
  const elDiklat = document.getElementById('sbm_diklat');
  if (elDiklat) elDiklat.textContent = !isUHActive ? `${rp(0)} (tidak dipilih)` : (isDkiNoUh ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.diklat || 110000));
  const elFullboard = document.getElementById('sbm_fullboard');
  if (elFullboard) elFullboard.textContent = !isUHActive ? `${rp(0)} (tidak dipilih)` : (isDkiNoUh ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.fullboard || 130000));
  const isManualMakan = !!document.getElementById('cbTarifMakanManual')?.checked;
  const wrapDetail = document.getElementById('manualMealDetailWrap');
  const isDetailOpen = wrapDetail && wrapDetail.style.display !== 'none';
  const modeVal = document.getElementById('manualMakanMode')?.value || 'flat';
  const isDetailMode = modeVal === 'detail' || isDetailOpen;
  const manualMealEntries = isManualMakan ? getManualMealEntries() : [];
  const useDetail = isManualMakan && isDetailMode && manualMealEntries.length > 0;
  const manualMakanRate = parseNumber(document.getElementById('tarifMakan')?.value);
  const elMakan = document.getElementById('sbm_makan');
  if (elMakan) {
    if (isManualMakan) {
      if (useDetail) {
        const total = manualMealEntries.reduce((s, e) => s + e.price, 0);
        elMakan.textContent = `${rp(total)} (${manualMealEntries.length}x makan riil)`;
      } else {
        elMakan.textContent = `${rp(manualMakanRate)} (Manual)`;
      }
    } else {
      elMakan.textContent = rp(sbm.makan || 0);
    }
  }
  const elSnack = document.getElementById('sbm_snack');
  if (elSnack) elSnack.textContent = rp(sbm.snack || 0);
  document.getElementById('sbm_h4').textContent = rp(sbm.h4);
  document.getElementById('sbm_h3').textContent = rp(sbm.h3);

  if (sbm.isSekitarJakarta && sbm.sekitarJakarta) {
    document.getElementById('sbm_jkt').textContent = `${rp(sbm.jktPP)} (PP)`;
    document.getElementById('sbm_taxi').textContent = '- (termasuk rute PP)';
    document.getElementById('sbm_dpr').textContent = `${rp(sbm.dpr)} (PP: ${rp(sbm.dprOneWay)} x 2)`;
  } else {
    document.getElementById('sbm_jkt').textContent = sbm.jktPP ? rp(sbm.jktPP) : '(tidak ada/dalam kota)';
    document.getElementById('sbm_taxi').textContent = sbm.taxi ? rp(sbm.taxi) : '-';
    document.getElementById('sbm_dpr').textContent = isDkiJakarta ? `${rp(170000)} (otomatis)` : '- (hanya DKI Jakarta)';
  }
  document.getElementById('sbm_tiket').textContent = sbm.tiket ? rp(sbm.tiket) : '(tidak ada tiket pesawat)';

  const isDkiTarget = isDkiNoUh || (multi && ((multi.sbm1 && multi.sbm1.provinsi === 'DKI JAKARTA') || (multi.sbm2 && multi.sbm2.provinsi === 'DKI JAKARTA')));
  const noteJkt = document.getElementById('noteJakartaDPR');
  if (noteJkt) {
    if (sbm.isSekitarJakarta && sbm.sekitarJakarta) {
      noteJkt.style.display = 'block';
      if (isKepSeribu) {
        noteJkt.innerHTML = `*Transport Jakarta &harr; ${sbm.sekitarJakarta.nama}: ${rp(sbm.dprOneWay)} (One Way) &times; 2 = <strong>${rp(sbm.dpr)} PP</strong> <span class="note-link">(PMK Hal 68 ↗)</span>. Uang Harian Dalam Kota Jakarta: <strong>${rp(sbm.uh || 210000)}/hari</strong>.`;
      } else {
        noteJkt.innerHTML = `*Transport Jakarta &harr; ${sbm.sekitarJakarta.nama}: ${rp(sbm.dprOneWay)} (One Way) &times; 2 = <strong>${rp(sbm.dpr)} PP</strong> <span class="note-link">(Cek PMK Hal 68 ↗)</span>`;
      }
      noteJkt.setAttribute('onclick', 'openPmkModal(68)');
      noteJkt.setAttribute('title', 'Klik untuk membuka dokumen resmi PMK Hal 68 (Transport Jakarta ke Daerah Sekitar)');
    } else if (isDkiTarget) {
      noteJkt.style.display = 'block';
      noteJkt.innerHTML = `*Khusus DKI Jakarta tidak mendapatkan uang harian. Tetapi, DPR yang dibayarkan sebesar Rp170.000 <span class="note-link">(Cek PMK Hal 69 ↗)</span>`;
      noteJkt.setAttribute('onclick', 'openPmkModal(69)');
      noteJkt.setAttribute('title', 'Klik untuk membuka dokumen resmi PMK Hal 69');
    } else {
      noteJkt.style.display = 'none';
    }
  }
}

function escHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function updateSbmWarnings() {
  const box = document.getElementById('sbmWarnings');
  if (!box) return;
  const sbm = getSBM();
  const items = [];
  if (sbm) {
    const selected = [...selectedEmpIds];
    const cbHotel = document.getElementById('cbHotel').checked;
    const cbTiket = document.getElementById('cbTiket').checked;
    const customCosts = getCustomCosts();
    const isDki = sbm.provinsi === 'DKI JAKARTA';
    const dprBase = isDki ? 170000 : 0;
    const cbDPR = isDki;

    if (cbHotel) {
      getHotelEntries().forEach(item => {
        if (item.price <= 0) return;
        item.employeeIds.forEach(id => {
          const emp = employees.find(e => e.id === id);
          if (!emp) return;
          const rate = getHotelRate(sbm, emp.gol);
          if (rate && item.price > rate) {
            items.push({
              title: `Penginapan — ${item.name || 'Hotel'} (${emp.nama.split(',')[0]})`,
              text: `${rp(item.price)}/malam melebihi SBM Gol ${emp.gol} sebesar ${rp(item.price - rate)}. SBM ${rp(rate)}/malam.`
            });
          }
        });
      });
    }

    if (sbm.dpr > 0 && (dprBase > 0 || customCosts.some(item => item.kind === 'transport'))) {
      selected.forEach(id => {
        const emp = employees.find(e => e.id === id);
        const transportExtra = customCosts.reduce((total, item) => total + (item.kind === 'transport' ? item.amounts[String(id)] || 0 : 0), 0);
        const total = dprBase + transportExtra;
        if (total > sbm.dpr) {
          const detailNote = sbm.isSekitarJakarta ? ` (One Way ${rp(sbm.dprOneWay)} x 2 PP)` : '';
          items.push({
            title: `Transport — ${emp.nama.split(',')[0]}`,
            text: `${rp(total)} melebihi SBM DPR ${rp(sbm.dpr)}${detailNote} sebesar ${rp(total - sbm.dpr)}.`
          });
        }
      });
    }

    if (sbm.tiket > 0) {
      const ticketGroups = new Map();
      const planeLabel = 'Tiket Pesawat';
      if (cbTiket) ticketGroups.set(planeLabel, []);
      customCosts.forEach(item => {
        if (item.kind !== 'tiket') return;
        const label = getTicketCostLabel(item.name);
        if (!ticketGroups.has(label)) ticketGroups.set(label, []);
        ticketGroups.get(label).push(item);
      });
      ticketGroups.forEach((list, label) => {
        selected.forEach(id => {
          const emp = employees.find(e => e.id === id);
          const ticketExtra = list.reduce((total, item) => total + (item.amounts[String(id)] || 0), 0);
          const total = ticketExtra + (label === planeLabel && cbTiket ? sbm.tiket : 0);
          if (total > sbm.tiket) {
            items.push({
              sptjm: true,
              title: `${label} — ${emp.nama.split(',')[0]}`,
              text: `${rp(total)} melebihi SBM sebesar ${rp(total - sbm.tiket)}.`
            });
          }
        });
      });
    }
  }

  if (!items.length) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }
  box.style.display = 'grid';
  box.innerHTML = items.map(item => `
    <div class="sbm-warning${item.sptjm ? ' is-sptjm' : ''}">
      <span class="sbm-warning-ico" aria-hidden="true">!</span>
      <div class="sbm-warning-body">
        <strong>${escHtml(item.title)}</strong>
        <span>${escHtml(item.text)}</span>
      </div>
      <span class="sbm-warning-badge${item.sptjm ? '' : ' is-soft'}">${item.sptjm ? 'Buatkan SPTJM' : 'Info SBM'}</span>
    </div>`).join('');
}

function syncTglSPD() {
  const tglST = document.getElementById('tglST').value;
  if (tglST) document.getElementById('tglSPD').value = tglST;
  if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();
}

function hitungLama() {
  const tgl1 = document.getElementById('tglBerangkat').value;
  const tgl2 = document.getElementById('tglKembali').value;
  if (!tgl1 || !tgl2) {
    if (typeof renderTripDates === 'function') renderTripDates();
    return;
  }
  const d1 = new Date(tgl1), d2 = new Date(tgl2);
  const diffDays = Math.round((d2 - d1) / 86400000) + 1;
  document.getElementById('lamaTugas').value = diffDays <= 0 ? 'Tanggal tidak valid' : `${diffDays} Hari`;
  const elHariMakan = document.getElementById('hariMakan');
  if (elHariMakan && !elHariMakan.value && diffDays > 0) {
    elHariMakan.placeholder = `${diffDays} (default)`;
  }
  const elHariSnack = document.getElementById('hariSnack');
  if (elHariSnack && !elHariSnack.value && diffDays > 0) {
    elHariSnack.placeholder = `${diffDays} (default)`;
  }
  const lblMultiTotal = document.getElementById('multiProvTotalLama');
  if (lblMultiTotal && diffDays > 0) {
    lblMultiTotal.textContent = `${diffDays} Hari`;
  }
  if (isMultiProvActive() && diffDays > 0) {
    const el1 = document.getElementById('hariProvinsi1');
    const el2 = document.getElementById('hariProvinsi2');
    if (el1 && el2) {
      const d1 = parseInt(el1.value) || 0;
      const d2 = parseInt(el2.value) || 0;
      if (d1 <= 0 || d2 <= 0 || (d1 + d2 !== diffDays)) {
        el1.value = Math.max(1, Math.floor(diffDays / 2));
        el2.value = Math.max(1, diffDays - parseInt(el1.value));
      }
    }
  }
  if (typeof renderTripDates === 'function') renderTripDates();
  if (typeof refreshManualMealDayOptions === 'function') refreshManualMealDayOptions();
}

function getDays() {
  const tgl1 = document.getElementById('tglBerangkat').value;
  const tgl2 = document.getElementById('tglKembali').value;
  if (!tgl1 || !tgl2) return { days: 0, nights: 0 };
  const d1 = new Date(tgl1), d2 = new Date(tgl2);
  const days = Math.max(0, Math.round((d2 - d1) / 86400000) + 1);
  return { days, nights: Math.max(0, days - 1) };
}

const empTripSegments = new Map();

function daySpan(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
}

function getEmpSegments(empId) {
  const custom = empTripSegments.get(empId);
  if (custom && custom.length) {
    return custom.filter(s => s.start && s.end).map(s => ({
      start: s.start,
      end: s.end < s.start ? s.start : s.end
    }));
  }
  const tgl1 = document.getElementById('tglBerangkat').value;
  const tgl2 = document.getElementById('tglKembali').value;
  return tgl1 && tgl2 ? [{ start: tgl1, end: tgl2 }] : [];
}

function getEmpDays(empId) {
  let days = 0, nights = 0;
  getEmpSegments(empId).forEach(seg => {
    const span = daySpan(seg.start, seg.end);
    days += span;
    nights += Math.max(0, span - 1);
  });
  return { days, nights };
}

function expandTripDays(segments) {
  const pad = n => String(n).padStart(2, '0');
  const days = new Set();
  segments.forEach(seg => {
    const cur = new Date(seg.start);
    const end = new Date(seg.end);
    while (cur <= end) {
      days.add(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
      cur.setDate(cur.getDate() + 1);
    }
  });
  return [...days].sort();
}

function formatTanggalList(isoDates) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const groups = [];
  isoDates.forEach(iso => {
    const d = new Date(iso);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.days.push(d.getDate());
    else groups.push({ key, days: [d.getDate()], month: months[d.getMonth()], year: d.getFullYear() });
  });
  return groups.map(g => `${g.days.join(', ')} ${g.month} ${g.year}`).join(', ');
}

// =====================================================================
// PENGATURAN KOMPONEN BIAYA PERORANGAN (Rincian per Orang Cockpit)
// =====================================================================
let employeeCostConfig = {};
let employeeTransports = {};
let currentCockpitTab = 'uh';

function getDefaultCostConfig(empId) {
  const isMealManual = !!document.getElementById('cbTarifMakanManual')?.checked;
  const isMeeting = document.getElementById('jenisKegiatan')?.value === 'rapat';
  const isBiasaWithKonsumsi = document.getElementById('jenisKegiatan')?.value === 'biasa' && !!document.getElementById('cbKonsumsiBiasa')?.checked;
  const hasKonsumsi = isMeeting || isBiasaWithKonsumsi || isMealManual;
  const rawMealDays = Number(document.getElementById('hariMakan')?.value);
  const rawMealCount = Number(document.getElementById('jumlahMakan')?.value);
  const rawSnackCount = Number(document.getElementById('jumlahSnack')?.value);
  const rawHotelNights = Number(document.getElementById('rc_hotelNights')?.value);
  const rawHotelPrice = (typeof parseNumber === 'function' ? parseNumber(document.getElementById('rc_hotelPrice')?.value) : Number(document.getElementById('rc_hotelPrice')?.value)) || 0;

  return {
    isCustomized: false,
    uhActive: document.getElementById('cbUH') ? document.getElementById('cbUH').checked : true,
    uhPercent: Number(document.getElementById('uhPersentase')?.value) || 1,
    jenisKeg: document.getElementById('jenisKegiatan')?.value || 'biasa',
    hasKonsumsi: hasKonsumsi,
    mealMode: isMealManual ? 'manual' : 'sbm',
    mealDays: (!isNaN(rawMealDays) && rawMealDays > 0) ? rawMealDays : null,
    mealCount: (!isNaN(rawMealCount) && rawMealCount > 0) ? rawMealCount : (isMealManual ? 1 : 0),
    snackCount: (!isNaN(rawSnackCount) && rawSnackCount > 0) ? rawSnackCount : 0,
    manualMeals: (typeof getManualMealEntries === 'function') ? getManualMealEntries() : [],
    hotelActive: document.getElementById('cbHotel') ? document.getElementById('cbHotel').checked : false,
    hotelMode: 'sbm',
    hotelName: '',
    hotelNights: rawHotelNights || 1,
    hotelPrice: rawHotelPrice,
    tickets: []
  };
}

function getEmployeeCostConfig(empId) {
  const key = String(empId);
  if (!employeeCostConfig[key] || !employeeCostConfig[key].isCustomized) {
    employeeCostConfig[key] = getDefaultCostConfig(empId);
  }
  return employeeCostConfig[key];
}

function setEmployeeCostConfig(empId, cfg) {
  const key = String(empId);
  employeeCostConfig[key] = cfg;
}

function clearEmployeeCostConfig() {
  employeeCostConfig = {};
}

function copyCurrentRincianConfigToAll() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Pilih pegawai terlebih dahulu.');
    return;
  }
  const currentEmpId = Number(select.value);
  if (isNaN(currentEmpId)) {
    alert('Pilih pegawai terlebih dahulu.');
    return;
  }
  const currentEmp = employees.find(e => e.id === currentEmpId);
  const currentName = currentEmp ? currentEmp.nama.split(',')[0] : 'pegawai ini';

  const cfg = getEmployeeCostConfig(currentEmpId);
  const trans = getEmployeeTransports(currentEmpId);

  let count = 0;
  [...selectedEmpIds].forEach(id => {
    if (id === currentEmpId) return;
    const cloned = JSON.parse(JSON.stringify(cfg));
    cloned.isCustomized = true;
    employeeCostConfig[String(id)] = cloned;
    employeeTransports[String(id)] = JSON.parse(JSON.stringify(trans));
    count++;
  });

  renderRincianEmpPills();
  renderRincianCockpit(currentEmpId);
  if (typeof renderRincian === 'function') renderRincian();

  alert(`✓ Pengaturan komponen biaya ${currentName} berhasil diterapkan ke seluruh (${count}) pegawai lainnya.`);
}

function switchRincianCockpitTab(tabKey) {
  currentCockpitTab = tabKey;
  document.querySelectorAll('.rincian-cockpit-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabKey);
  });
  document.querySelectorAll('.rincian-cockpit-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `pane_${tabKey}`);
  });
}

function renderRincianEmpPills() {
  const container = document.getElementById('rincianEmpPills');
  if (!container) return;
  const select = document.getElementById('rincianPegawai');
  const currentEmpId = (select && select.value !== '') ? Number(select.value) : null;

  if (selectedEmpIds.size === 0) {
    container.innerHTML = '<span class="empty-hint" style="padding:10px;color:var(--text-sub);">Belum ada pegawai dipilih</span>';
    return;
  }

  container.innerHTML = [...selectedEmpIds].map(id => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return '';
    const isActive = emp.id === currentEmpId;
    const b = hitungBiaya(emp);
    const shortName = emp.nama.split(',')[0];
    const initials = shortName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const fullSpd = (spdPerEmployee[emp.id] || '').trim();
    const spdPrefix = typeof getSpdNumberPrefix === 'function' ? getSpdNumberPrefix(fullSpd) : fullSpd.split('/')[0];
    const spdLabel = spdPrefix ? `SPD: ${spdPrefix}` : 'SPD: Kosong';
    const spdClass = spdPrefix ? 'is-set' : 'is-empty';

    return `
      <button type="button" class="rincian-emp-chip ${isActive ? 'active' : ''}" onclick="switchRincianEmployee(${emp.id})">
        <span class="emp-chip-avatar">${initials}</span>
        <div class="emp-chip-info">
          <div class="emp-chip-row-top">
            <span class="emp-chip-name">${typeof escHtml === 'function' ? escHtml(shortName) : shortName}</span>
            <span class="chip-spd-tag ${spdClass}">${spdLabel}</span>
          </div>
          <div class="emp-chip-row-bottom">
            <span class="emp-chip-sub">Gol. ${typeof escHtml === 'function' ? escHtml(emp.gol || '-') : (emp.gol || '-')}</span>
            <span class="emp-chip-total">${typeof rp === 'function' ? rp(b.total) : 'Rp ' + b.total}</span>
          </div>
        </div>
      </button>
    `;
  }).join('');
}

function switchRincianEmployee(empId) {
  const select = document.getElementById('rincianPegawai');
  if (select) {
    select.value = String(empId);
  }
  if (typeof loadRincianSPD === 'function') loadRincianSPD();
  renderRincianEmpPills();
  renderRincianCockpit(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function updateCockpitKpi(targetEmpId) {
  const select = document.getElementById('rincianPegawai');
  const empId = targetEmpId !== undefined ? Number(targetEmpId) : ((select && select.value !== '') ? Number(select.value) : null);
  if (empId === null || isNaN(empId)) return;

  const emp = employees.find(e => e.id === empId);
  if (!emp) return;
  const b = hitungBiaya(emp);

  const kpiTotalEl = document.getElementById('rincianKpiTotal');
  const kpiSubEl = document.getElementById('rincianKpiSub');
  const kpiUhVal = document.getElementById('kpiUhVal');
  const kpiHotelVal = document.getElementById('kpiHotelVal');
  const kpiTiketVal = document.getElementById('kpiTiketVal');
  const kpiTransportVal = document.getElementById('kpiTransportVal');

  if (kpiTotalEl) kpiTotalEl.textContent = typeof rp === 'function' ? rp(b.total) : 'Rp ' + b.total;
  if (kpiSubEl) kpiSubEl.innerHTML = `<strong>${typeof escHtml === 'function' ? escHtml(emp.nama) : emp.nama}</strong> &bull; ${emp.nip ? 'NIP ' + (typeof escHtml === 'function' ? escHtml(emp.nip) : emp.nip) : 'Gol. ' + (typeof escHtml === 'function' ? escHtml(emp.gol) : emp.gol)}`;
  if (kpiUhVal) kpiUhVal.textContent = typeof rp === 'function' ? rp(b.uh) : 'Rp ' + b.uh;
  if (kpiHotelVal) kpiHotelVal.textContent = typeof rp === 'function' ? rp(b.hotel) : 'Rp ' + b.hotel;
  const ticketTotal = b.tiket + (b.customCosts.filter(c => c.isTicket).reduce((s, c) => s + c.amount, 0));
  if (kpiTiketVal) kpiTiketVal.textContent = typeof rp === 'function' ? rp(ticketTotal) : 'Rp ' + ticketTotal;
  const transTotal = b.dpr + (b.customCosts.filter(c => c.isTransport).reduce((s, c) => s + c.amount, 0));
  if (kpiTransportVal) kpiTransportVal.textContent = typeof rp === 'function' ? rp(transTotal) : 'Rp ' + transTotal;

  if (typeof renderRincianEmpPills === 'function') renderRincianEmpPills();
}

function renderRincianCockpit(targetEmpId) {
  const select = document.getElementById('rincianPegawai');
  const empId = targetEmpId !== undefined ? Number(targetEmpId) : ((select && select.value !== '') ? Number(select.value) : null);
  if (empId === null || isNaN(empId)) return;

  const emp = employees.find(e => e.id === empId);
  if (!emp) return;

  const cfg = getEmployeeCostConfig(empId);
  const sbm = getSBM();
  const { days, nights } = getEmpDays(empId);
  const b = hitungBiaya(emp);

  // Update Spotlight Card
  const activeAvatarEl = document.getElementById('activeEmpAvatar');
  const activeNameEl = document.getElementById('activeEmpName');
  const activeMetaEl = document.getElementById('activeEmpMeta');
  const activeTipEl = document.getElementById('activeSpdTip');
  const shortName = emp.nama.split(',')[0];
  const initials = shortName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const fullSpd = (spdPerEmployee[emp.id] || '').trim();
  const spdPrefix = typeof getSpdNumberPrefix === 'function' ? getSpdNumberPrefix(fullSpd) : fullSpd.split('/')[0];

  if (activeAvatarEl) activeAvatarEl.textContent = initials;
  if (activeNameEl) activeNameEl.textContent = emp.nama;
  if (activeMetaEl) activeMetaEl.innerHTML = `Gol. <strong>${typeof escHtml === 'function' ? escHtml(emp.gol || '-') : (emp.gol || '-')}</strong> &bull; ${emp.nip ? 'NIP ' + (typeof escHtml === 'function' ? escHtml(emp.nip) : emp.nip) : (emp.jabatan ? (typeof escHtml === 'function' ? escHtml(emp.jabatan) : emp.jabatan) : 'Pegawai')}`;
  if (activeTipEl) {
    activeTipEl.textContent = fullSpd ? `Format lengkap: ${fullSpd}` : `Format: [Nomor] + ${typeof getSpdSuffix === 'function' ? getSpdSuffix() : '/SPD/Birkom/...'}`;
  }

  // Update input SPD value for active employee
  const spdInputEl = document.getElementById('rincianNoSPD');
  if (spdInputEl) spdInputEl.value = spdPrefix || '';
  if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();

  // Update KPI Overview
  updateCockpitKpi(empId);

  // Pane 1: Uang Harian
  const uhActiveEl = document.getElementById('rc_uhActive');
  const uhBodyEl = document.getElementById('rc_uhBody');
  const uhRateEl = document.getElementById('rc_uhRateHighlight');
  const uhPercentEl = document.getElementById('rc_uhPercent');
  const jenisKegEl = document.getElementById('rc_jenisKeg');
  const hasKonsumsiEl = document.getElementById('rc_hasKonsumsi');
  const konsumsiBodyEl = document.getElementById('rc_konsumsiBody');

  if (uhActiveEl) uhActiveEl.checked = !!cfg.uhActive;
  if (uhBodyEl) uhBodyEl.style.display = cfg.uhActive ? 'block' : 'none';
  if (uhRateEl) uhRateEl.textContent = `Tarif SBM: ${typeof rp === 'function' ? rp(sbm ? sbm.uh : 0) : 'Rp ' + (sbm ? sbm.uh : 0)} / hari (${days} hari)`;
  if (uhPercentEl) uhPercentEl.value = String(cfg.uhPercent ?? 1);
  if (jenisKegEl) jenisKegEl.value = cfg.jenisKeg || 'biasa';
  if (hasKonsumsiEl) hasKonsumsiEl.checked = !!cfg.hasKonsumsi;
  if (konsumsiBodyEl) konsumsiBodyEl.style.display = cfg.hasKonsumsi ? 'block' : 'none';

  // Meal submode
  const btnMealSbm = document.getElementById('rc_btnMealSbm');
  const btnMealManual = document.getElementById('rc_btnMealManual');
  const mealSbmWrap = document.getElementById('rc_mealSbmWrap');
  const mealManualWrap = document.getElementById('rc_mealManualWrap');
  const isManualMeal = cfg.mealMode === 'manual';

  if (btnMealSbm) btnMealSbm.classList.toggle('active', !isManualMeal);
  if (btnMealManual) btnMealManual.classList.toggle('active', isManualMeal);
  const radMealSbm = typeof document.querySelector === 'function' ? document.querySelector('input[name="rc_mealMode"][value="sbm"]') : null;
  const radMealManual = typeof document.querySelector === 'function' ? document.querySelector('input[name="rc_mealMode"][value="manual"]') : null;
  if (radMealSbm) radMealSbm.checked = !isManualMeal;
  if (radMealManual) radMealManual.checked = isManualMeal;

  if (mealSbmWrap) mealSbmWrap.style.display = isManualMeal ? 'none' : 'grid';
  if (mealManualWrap) mealManualWrap.style.display = isManualMeal ? 'block' : 'none';

  const mealDaysEl = document.getElementById('rc_mealDays') || document.getElementById('rc_hariMakan');
  const mealCountEl = document.getElementById('rc_mealCount') || document.getElementById('rc_makanCount');
  const snackCountEl = document.getElementById('rc_snackCount');
  if (mealDaysEl) mealDaysEl.value = cfg.mealDays ?? days;
  if (mealCountEl) mealCountEl.value = cfg.mealCount ?? (isManualMeal ? 1 : 0);
  if (snackCountEl) snackCountEl.value = cfg.snackCount ?? 0;

  renderCockpitManualMeals(empId);

  const deductSummaryEl = document.getElementById('rc_deductionSummary');
  const deductAmountEl = document.getElementById('rc_deductionAmount');
  const netUhAmountEl = document.getElementById('rc_netUhAmount');
  const totalDeduct = (b.mealDeduction || 0) + (b.snackDeduction || 0);

  if (deductAmountEl) deductAmountEl.textContent = typeof rp === 'function' ? (totalDeduct > 0 ? '- ' + rp(totalDeduct) : 'Rp 0') : (totalDeduct > 0 ? '- Rp ' + totalDeduct : 'Rp 0');
  if (netUhAmountEl) netUhAmountEl.textContent = typeof rp === 'function' ? rp(b.uh) : 'Rp ' + b.uh;
  if (deductSummaryEl && !deductAmountEl) {
    deductSummaryEl.innerHTML = `Total Potongan Konsumsi: <strong>${typeof rp === 'function' ? rp(totalDeduct) : 'Rp ' + totalDeduct}</strong>`;
  }

  // Update UH Effective Rate summary card
  const uhEffectiveRateEl = document.getElementById('rc_uhEffectiveRate');
  const uhEffectiveSubEl = document.getElementById('rc_uhEffectiveSub');
  if (uhEffectiveRateEl) {
    const effRate = Math.round((sbm ? sbm.uh : 0) * (cfg.uhPercent ?? 1));
    uhEffectiveRateEl.textContent = typeof rp === 'function' ? rp(effRate) : 'Rp ' + effRate;
  }
  if (uhEffectiveSubEl) {
    const persenText = (cfg.uhPercent === 0.6) ? '60% (Kendaraan Dinas)' : '100% (Standar Penuh)';
    uhEffectiveSubEl.textContent = `${persenText} • ${days} hari dinas`;
  }

  // Meal & snack rate badges
  const mealRateBadge = document.getElementById('rc_mealRateBadge');
  const snackRateBadge = document.getElementById('rc_snackRateBadge');
  if (mealRateBadge) mealRateBadge.textContent = `@ ${typeof rp === 'function' ? rp(sbm ? sbm.makan : 0) : 'Rp ' + (sbm ? sbm.makan : 0)}`;
  if (snackRateBadge) snackRateBadge.textContent = `@ ${typeof rp === 'function' ? rp(sbm ? sbm.snack : 0) : 'Rp ' + (sbm ? sbm.snack : 0)}`;

  // Pane 2: Hotel
  const hotelActiveEl = document.getElementById('rc_hotelActive');
  const hotelBodyEl = document.getElementById('rc_hotelBody');
  const btnHotelSbm = document.getElementById('rc_btnHotelSbm');
  const btnHotelManual = document.getElementById('rc_btnHotelManual');
  const hotelSbmCard = document.getElementById('rc_hotelSbmCard');
  const hotelManualCard = document.getElementById('rc_hotelManualCard');
  const isManualHotel = cfg.hotelMode === 'manual';

  if (hotelActiveEl) hotelActiveEl.checked = !!cfg.hotelActive;
  if (hotelBodyEl) hotelBodyEl.style.display = cfg.hotelActive ? 'block' : 'none';
  if (btnHotelSbm) btnHotelSbm.classList.toggle('active', !isManualHotel);
  if (btnHotelManual) btnHotelManual.classList.toggle('active', isManualHotel);
  const radHotelSbm = typeof document.querySelector === 'function' ? document.querySelector('input[name="rc_hotelMode"][value="sbm"]') : null;
  const radHotelManual = typeof document.querySelector === 'function' ? document.querySelector('input[name="rc_hotelMode"][value="manual"]') : null;
  if (radHotelSbm) radHotelSbm.checked = !isManualHotel;
  if (radHotelManual) radHotelManual.checked = isManualHotel;

  if (hotelSbmCard) hotelSbmCard.style.display = isManualHotel ? 'none' : 'block';
  if (hotelManualCard) hotelManualCard.style.display = isManualHotel ? 'grid' : 'none';

  const sbmRate = sbm ? getHotelRate(sbm, emp.gol) : 0;
  const hotelGolLabel = document.getElementById('rc_hotelGolLabel');
  const hotelSbmRate = document.getElementById('rc_hotelSbmRate');
  const hotelRatePerNight = document.getElementById('rc_hotelRatePerNight');
  const hotelNightsLabel = document.getElementById('rc_hotelNightsLabel');
  const hotelSbmNights = document.getElementById('rc_hotelSbmNights');
  const hotelSbmTotal = document.getElementById('rc_hotelSbmTotal');
  const hotelProvNameEl = document.getElementById('rc_hotelProvName');

  const activeNights = (cfg.hotelNights > 0) ? cfg.hotelNights : (nights > 0 ? nights : 1);

  if (hotelGolLabel) hotelGolLabel.textContent = `Gol. ${emp.gol || '-'}`;
  if (hotelSbmRate) hotelSbmRate.textContent = typeof rp === 'function' ? rp(sbmRate) : 'Rp ' + sbmRate;
  if (hotelRatePerNight) hotelRatePerNight.textContent = typeof rp === 'function' ? rp(sbmRate) : 'Rp ' + sbmRate;
  if (hotelNightsLabel) hotelNightsLabel.textContent = `${activeNights} malam`;
  if (hotelSbmNights) hotelSbmNights.value = activeNights;
  if (hotelSbmTotal) hotelSbmTotal.textContent = typeof rp === 'function' ? rp(sbmRate * activeNights) : 'Rp ' + (sbmRate * activeNights);
  if (hotelProvNameEl) hotelProvNameEl.textContent = `PMK SBM 2026 • ${sbm ? (typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi) : 'Provinsi Tujuan'}`;

  const hotelNameEl = document.getElementById('rc_hotelName') || document.getElementById('rc_hotelNameSbm');
  const hotelNameManualEl = document.getElementById('rc_hotelNameManual');
  if (hotelNameEl) hotelNameEl.value = cfg.hotelName || '';
  if (hotelNameManualEl) hotelNameManualEl.value = cfg.hotelName || '';

  const hotelNightsEl = document.getElementById('rc_hotelNights') || document.getElementById('rc_hotelNightsManual');
  if (hotelNightsEl && hotelNightsEl.tagName === 'INPUT') hotelNightsEl.value = cfg.hotelNights || nights || 1;

  const hotelPriceEl = document.getElementById('rc_hotelPrice') || document.getElementById('rc_hotelRateManual');
  if (hotelPriceEl) hotelPriceEl.value = cfg.hotelPrice ? (typeof rp === 'function' ? rp(cfg.hotelPrice) : 'Rp ' + cfg.hotelPrice) : '';

  // Pane 3: Tiket
  renderCockpitTickets(empId);

  // Pane 4: Transport
  renderRincianTransportEditor(empId);

  // Keep active cockpit tab visible
  if (typeof switchCockpitTab === 'function') {
    switchCockpitTab(currentCockpitTab || 'uh');
  }
}

function onCockpitUHChange(isBlur = false) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.uhActive = !!document.getElementById('rc_uhActive')?.checked;
  cfg.uhPercent = Number(document.getElementById('rc_uhPercent')?.value) || 1;
  cfg.jenisKeg = document.getElementById('rc_jenisKeg')?.value || 'biasa';
  const mealDaysEl = document.getElementById('rc_mealDays') || document.getElementById('rc_hariMakan');
  const mealCountEl = document.getElementById('rc_mealCount') || document.getElementById('rc_makanCount');
  const snackCountEl = document.getElementById('rc_snackCount');

  cfg.mealDays = Number(mealDaysEl?.value) || null;
  cfg.mealCount = Number(mealCountEl?.value) || 0;
  cfg.snackCount = Number(snackCountEl?.value) || 0;

  const uhBodyEl = document.getElementById('rc_uhBody');
  if (uhBodyEl) uhBodyEl.style.display = cfg.uhActive ? 'block' : 'none';

  const deductSummaryEl = document.getElementById('rc_deductionSummary');
  if (deductSummaryEl) {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const b = hitungBiaya(emp);
      const totalDeduct = (b.mealDeduction || 0) + (b.snackDeduction || 0);
      deductSummaryEl.innerHTML = `Total Potongan Konsumsi: <strong>${typeof rp === 'function' ? rp(totalDeduct) : 'Rp ' + totalDeduct}</strong>`;
    }
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function onCockpitKonsumsiToggle() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.hasKonsumsi = !!document.getElementById('rc_hasKonsumsi')?.checked;

  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function setCockpitMealMode(mode) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.mealMode = mode;

  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function renderCockpitManualMeals(empId) {
  const tbody = document.getElementById('rc_manualMealList') || document.getElementById('rc_manualMealRows');
  if (!tbody) return;

  const cfg = getEmployeeCostConfig(empId);
  const meals = cfg.manualMeals || [];
  const { days } = getEmpDays(empId);

  if (meals.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:12px; color:var(--text-sub);">
          Belum ada sesi makan riil. Klik <strong>+ Tambah Sesi Makan</strong> di bawah.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = meals.map((m, idx) => {
    let dayOptions = '';
    const maxDays = Math.max(days || 1, 1);
    for (let d = 1; d <= maxDays; d++) {
      const selected = m.day == d ? 'selected' : '';
      dayOptions += `<option value="${d}" ${selected}>Hari ${d}</option>`;
    }

    const dispAmount = m.price > 0 ? (typeof rp === 'function' ? rp(m.price) : 'Rp ' + m.price) : '';

    return `
      <tr data-idx="${idx}">
        <td style="text-align:center;">${idx + 1}</td>
        <td>
          <select class="cockpit-meal-day form-input-sm" onchange="onCockpitManualMealChange(this, ${idx}, true)">
            ${dayOptions}
          </select>
        </td>
        <td>
          <select class="cockpit-meal-session form-input-sm" onchange="onCockpitManualMealChange(this, ${idx}, true)">
            <option value="Makan Pagi" ${m.session === 'Makan Pagi' ? 'selected' : ''}>Makan Pagi</option>
            <option value="Makan Siang" ${m.session === 'Makan Siang' ? 'selected' : ''}>Makan Siang</option>
            <option value="Makan Malam" ${m.session === 'Makan Malam' ? 'selected' : ''}>Makan Malam</option>
          </select>
        </td>
        <td>
          <input type="text" class="cockpit-meal-price form-input-sm" placeholder="Rp 0" value="${dispAmount}" onfocus="this.select()" oninput="onCockpitManualMealChange(this, ${idx}, false)" onblur="onCockpitManualMealChange(this, ${idx}, true)">
        </td>
        <td style="text-align:center;">
          <button type="button" class="manual-meal-btn-del btn-del-sm" onclick="removeCockpitManualMealRow(${idx})" title="Hapus sesi makan" aria-label="Hapus sesi makan">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function addCockpitManualMealRow() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (!cfg.manualMeals) cfg.manualMeals = [];

  const { days } = getEmpDays(empId);
  const maxDays = Math.max(days || 1, 1);

  let targetDay = 1;
  let targetSession = 'Makan Siang';
  const sessions = ['Makan Pagi', 'Makan Siang', 'Makan Malam'];

  let found = false;
  for (let d = 1; d <= maxDays; d++) {
    for (const s of sessions) {
      const exists = cfg.manualMeals.some(m => m.day == d && m.session === s);
      if (!exists) {
        targetDay = d;
        targetSession = s;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    alert(`Seluruh sesi makan untuk durasi perjalanan (${maxDays} hari) sudah terinput.`);
    return;
  }

  cfg.manualMeals.push({
    day: targetDay,
    session: targetSession,
    price: 0
  });

  renderCockpitManualMeals(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function removeCockpitManualMealRow(idx) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (cfg.manualMeals && cfg.manualMeals[idx]) {
    cfg.manualMeals.splice(idx, 1);
  }

  renderCockpitManualMeals(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function onCockpitManualMealChange(el, idx, isBlur = false) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  if (!cfg.manualMeals || !cfg.manualMeals[idx]) return;

  const row = el.closest ? el.closest('tr') : el.parentElement?.closest('tr');
  if (!row) return;

  const dayVal = Number(row.querySelector('.cockpit-meal-day')?.value) || 1;
  const sessionVal = row.querySelector('.cockpit-meal-session')?.value || 'Makan Siang';
  let priceVal = (typeof parseNumber === 'function' ? parseNumber(row.querySelector('.cockpit-meal-price')?.value) : Number(row.querySelector('.cockpit-meal-price')?.value)) || 0;

  if (isBlur) {
    const isDuplicate = cfg.manualMeals.some((m, i) => i !== idx && m.day == dayVal && m.session === sessionVal);
    if (isDuplicate) {
      alert(`Perhatian: Hari ${dayVal} untuk sesi ${sessionVal} sudah pernah diinput.`);
    }

    const sbm = typeof getSBM === 'function' ? getSBM() : null;
    if (sbm && sbm.makan > 0 && priceVal > sbm.makan) {
      priceVal = sbm.makan;
      const priceInput = row.querySelector('.cockpit-meal-price');
      if (priceInput) priceInput.value = typeof rp === 'function' ? rp(sbm.makan) : `Rp ${sbm.makan}`;
      openMealLimitModal(`Hari ${dayVal}`, sbm.makan);
    } else {
      const priceInput = row.querySelector('.cockpit-meal-price');
      if (priceInput && priceVal > 0) {
        priceInput.value = typeof rp === 'function' ? rp(priceVal) : `Rp ${priceVal}`;
      }
    }
  }

  cfg.isCustomized = true;
  cfg.manualMeals[idx].day = dayVal;
  cfg.manualMeals[idx].session = sessionVal;
  cfg.manualMeals[idx].price = priceVal;

  const deductSummaryEl = document.getElementById('rc_deductionSummary');
  if (deductSummaryEl) {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const b = hitungBiaya(emp);
      const totalDeduct = (b.mealDeduction || 0) + (b.snackDeduction || 0);
      deductSummaryEl.innerHTML = `Total Potongan Konsumsi: <strong>${typeof rp === 'function' ? rp(totalDeduct) : 'Rp ' + totalDeduct}</strong>`;
    }
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function switchCockpitTab(tabKey) {
  if (!tabKey) tabKey = 'uh';
  currentCockpitTab = tabKey;

  // Update tabs
  const tabs = (typeof document.querySelectorAll === 'function') ? (document.querySelectorAll('.rincian-cockpit-tab') || []) : [];
  tabs.forEach(btn => {
    const isTarget = typeof btn.getAttribute === 'function' ? (btn.getAttribute('data-tab') === tabKey) : (btn.dataset && btn.dataset.tab === tabKey);
    btn.classList.toggle('active', isTarget);
    if (typeof btn.setAttribute === 'function') {
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    }
  });

  // Update panes
  const panes = (typeof document.querySelectorAll === 'function') ? (document.querySelectorAll('.rincian-cockpit-pane') || []) : [];
  panes.forEach(pane => {
    pane.classList.remove('active');
  });
  const targetPane = document.getElementById('pane_' + tabKey);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Ensure content in active pane is rendered
  const select = document.getElementById('rincianPegawai');
  const empId = select && select.value !== '' ? Number(select.value) : null;
  if (empId !== null && !isNaN(empId)) {
    if (tabKey === 'tiket') {
      if (typeof renderCockpitTickets === 'function') renderCockpitTickets(empId);
    } else if (tabKey === 'transport') {
      if (typeof renderRincianTransportEditor === 'function') renderRincianTransportEditor(empId);
    }
  }
}

function onCockpitHotelModeChange(mode) {
  setCockpitHotelMode(mode);
}

function onCockpitMealModeChange(mode) {
  setCockpitMealMode(mode);
}

function onCockpitHotelChange(isBlur = false, inputEl = null) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  const emp = employees.find(e => e.id === empId);
  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.hotelActive = !!document.getElementById('rc_hotelActive')?.checked;

  const hotelBodyEl = document.getElementById('rc_hotelBody');
  if (hotelBodyEl) hotelBodyEl.style.display = cfg.hotelActive ? 'block' : 'none';

  if (cfg.hotelMode === 'manual') {
    const nameEl = document.getElementById('rc_hotelNameManual') || document.getElementById('rc_hotelName');
    const nightsEl = document.getElementById('rc_hotelNights') || document.getElementById('rc_hotelNightsManual');
    const priceEl = document.getElementById('rc_hotelPrice') || document.getElementById('rc_hotelRateManual');

    if (nameEl) cfg.hotelName = nameEl.value || '';
    if (nightsEl && nightsEl.tagName === 'INPUT') cfg.hotelNights = Number(nightsEl.value) || 1;
    if (priceEl) {
      cfg.hotelPrice = (typeof parseNumber === 'function' ? parseNumber(priceEl.value) : Number(priceEl.value)) || 0;
    }
  } else {
    const nameEl = document.getElementById('rc_hotelName') || document.getElementById('rc_hotelNameManual') || document.getElementById('rc_hotelNameSbm');
    const sbmNightsEl = document.getElementById('rc_hotelSbmNights');
    if (nameEl) cfg.hotelName = nameEl.value || '';
    if (sbmNightsEl && sbmNightsEl.tagName === 'INPUT') cfg.hotelNights = Number(sbmNightsEl.value) || 1;
    const sbmRate = sbm ? getHotelRate(sbm, emp ? emp.gol : '') : 0;
    const hotelSbmTotal = document.getElementById('rc_hotelSbmTotal');
    if (hotelSbmTotal) {
      const activeNights = cfg.hotelNights || 1;
      hotelSbmTotal.textContent = typeof rp === 'function' ? rp(sbmRate * activeNights) : 'Rp ' + (sbmRate * activeNights);
    }
  }

  if (isBlur) {
    const priceEl = document.getElementById('rc_hotelPrice') || document.getElementById('rc_hotelRateManual');
    if (sbm && emp && cfg.hotelMode === 'manual') {
      const sbmHotelRate = typeof getHotelRate === 'function' ? getHotelRate(sbm, emp.gol) : 0;
      if (sbmHotelRate > 0 && cfg.hotelPrice > sbmHotelRate) {
        cfg.hotelPrice = sbmHotelRate;
        if (priceEl) priceEl.value = typeof rp === 'function' ? rp(sbmHotelRate) : `Rp ${sbmHotelRate}`;
        openSbmLimitModal({
          title: 'Melebihi Batas Plafon SBM Hotel',
          component: `Tarif Hotel Golongan ${emp.gol}`,
          maxRate: sbmHotelRate,
          provName: sbm.provinsi,
          msg: `Tarif hotel per malam untuk <strong>Golongan ${emp.gol}</strong> di <strong>${typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi}</strong> tidak boleh melebihi batas Standar Biaya Masukan (SBM) sebesar <strong>${typeof rp === 'function' ? rp(sbmHotelRate) : 'Rp ' + sbmHotelRate}</strong> / malam. Nilai otomatis disesuaikan ke pagu maksimal SBM.`
        });
      }
    }
    if (priceEl && cfg.hotelPrice > 0) {
      priceEl.value = typeof rp === 'function' ? rp(cfg.hotelPrice) : `Rp ${cfg.hotelPrice}`;
    }
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function setCockpitHotelMode(mode) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.hotelMode = mode;

  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function stepHotelSbmNights(delta) {
  const el = document.getElementById('rc_hotelSbmNights');
  if (!el) return;
  const curr = parseInt(el.value, 10) || 1;
  const next = Math.max(1, curr + delta);
  el.value = next;
  onCockpitHotelChange(false, el);
}

function stepHotelManualNights(delta) {
  const el = document.getElementById('rc_hotelNights');
  if (!el) return;
  const curr = parseInt(el.value, 10) || 1;
  const next = Math.max(1, curr + delta);
  el.value = next;
  onCockpitHotelChange(false, el);
}

function renderCockpitTickets(empId) {
  const container = document.getElementById('rc_ticketList');
  const totalBadge = document.getElementById('rc_ticketTotalBadge');
  if (!container) return;

  const cfg = getEmployeeCostConfig(empId);
  const tickets = cfg.tickets || [];
  let total = 0;

  if (tickets.length === 0) {
    container.innerHTML = `
      <div class="emp-trans-empty">
        Belum ada tiket perjalanan untuk pegawai ini.
        Gunakan tombol <strong>+ Kereta Api</strong>, <strong>+ Pesawat</strong>, atau <strong>+ Tiket Terpisah</strong> di atas.
      </div>`;
  } else {
    container.innerHTML = tickets.map((t, idx) => {
      total += (t.amount || 0);
      const dispAmount = t.amount > 0 ? (typeof rp === 'function' ? rp(t.amount) : 'Rp ' + t.amount) : '';
      const dir = t.direction || 'pp';
      return `
        <div class="emp-trans-row" data-idx="${idx}">
          <div class="emp-trans-col emp-trans-name-col">
            <label class="emp-trans-label">Jenis Tiket</label>
            <input type="text" class="cockpit-ticket-name" placeholder="Tiket Kereta Api / Pesawat..." value="${typeof escHtml === 'function' ? escHtml(t.name || '') : (t.name || '')}" oninput="onCockpitTicketChange(this, ${idx}, false)" onblur="onCockpitTicketChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-dir-col">
            <label class="emp-trans-label">Perjalanan / Arah</label>
            <select class="cockpit-ticket-direction" onchange="onCockpitTicketDirectionChange(this, ${idx})">
              <option value="pp" ${dir === 'pp' ? 'selected' : ''}>Pulang-Pergi (PP)</option>
              <option value="pergi" ${dir === 'pergi' ? 'selected' : ''}>Berangkat (Pergi)</option>
              <option value="pulang" ${dir === 'pulang' ? 'selected' : ''}>Pulang Saja</option>
            </select>
          </div>
          <div class="emp-trans-col emp-trans-route-col">
            <label class="emp-trans-label">Rute Perjalanan</label>
            <input type="text" class="cockpit-ticket-route" placeholder="Contoh: Jakarta - Yogyakarta (PP)" value="${typeof escHtml === 'function' ? escHtml(t.route || '') : (t.route || '')}" oninput="onCockpitTicketChange(this, ${idx}, false)" onblur="onCockpitTicketChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-amount-col">
            <label class="emp-trans-label">Harga Tiket (Rp)</label>
            <input type="text" class="cockpit-ticket-amount" placeholder="Rp 0" value="${dispAmount}" onfocus="this.select()" oninput="onCockpitTicketChange(this, ${idx}, false)" onblur="onCockpitTicketChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-del-col">
            <label class="emp-trans-label">&nbsp;</label>
            <button type="button" class="btn btn-warn emp-trans-del-btn" onclick="removeCockpitTicket(${idx})">Hapus</button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (totalBadge) {
    totalBadge.innerHTML = `Total Tiket: <strong>${typeof rp === 'function' ? rp(total) : 'Rp ' + total}</strong>`;
  }
}

function onCockpitTicketDirectionChange(selectEl, idx) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  if (!cfg.tickets || !cfg.tickets[idx]) return;

  const dir = selectEl.value || 'pp';
  cfg.isCustomized = true;
  cfg.tickets[idx].direction = dir;

  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const kotaTujuan = document.getElementById('kotaTujuan')?.value || '';

  let newRoute = '';
  if (dir === 'pp') {
    newRoute = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan} (PP)` : '';
  } else if (dir === 'pergi') {
    newRoute = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan}` : '';
  } else if (dir === 'pulang') {
    newRoute = (kotaAsal && kotaTujuan) ? `${kotaTujuan} - ${kotaAsal}` : '';
  }

  if (newRoute) {
    cfg.tickets[idx].route = newRoute;
    const row = selectEl.closest ? selectEl.closest('.emp-trans-row') : selectEl.parentElement?.closest('.emp-trans-row');
    const routeInput = row ? row.querySelector('.cockpit-ticket-route') : null;
    if (routeInput) routeInput.value = newRoute;
  }

  // Update suggested name if generic
  let currentName = cfg.tickets[idx].name || '';
  const baseName = currentName.replace(/\s*\((Berangkat|Pulang|PP|Pergi)\)\s*/gi, '').trim();
  if (baseName) {
    let suggestedName = baseName;
    if (dir === 'pergi') suggestedName = `${baseName} (Berangkat)`;
    else if (dir === 'pulang') suggestedName = `${baseName} (Pulang)`;
    else if (dir === 'pp') suggestedName = baseName;

    cfg.tickets[idx].name = suggestedName;
    const row = selectEl.closest ? selectEl.closest('.emp-trans-row') : selectEl.parentElement?.closest('.emp-trans-row');
    const nameInput = row ? row.querySelector('.cockpit-ticket-name') : null;
    if (nameInput) nameInput.value = suggestedName;
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function addCockpitTicketPreset(name, direction = 'pp') {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (!cfg.tickets) cfg.tickets = [];

  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const kotaTujuan = document.getElementById('kotaTujuan')?.value || '';

  let defaultRoute = '';
  if (direction === 'pergi') {
    defaultRoute = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan}` : '';
  } else if (direction === 'pulang') {
    defaultRoute = (kotaAsal && kotaTujuan) ? `${kotaTujuan} - ${kotaAsal}` : '';
  } else {
    defaultRoute = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan} (PP)` : '';
  }

  cfg.tickets.push({
    id: 'tkt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: name,
    direction: direction,
    route: defaultRoute,
    amount: 0
  });

  renderCockpitTickets(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function addCockpitSeparateTicketsPreset(name = 'Tiket Kereta Api') {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (!cfg.tickets) cfg.tickets = [];

  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const kotaTujuan = document.getElementById('kotaTujuan')?.value || '';

  const rutePergi = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan}` : '';
  const rutePulang = (kotaAsal && kotaTujuan) ? `${kotaTujuan} - ${kotaAsal}` : '';

  cfg.tickets.push({
    id: 'tkt_' + Date.now() + '_dep_' + Math.random().toString(36).substr(2, 4),
    name: `${name} (Berangkat)`,
    direction: 'pergi',
    route: rutePergi,
    amount: 0
  });

  cfg.tickets.push({
    id: 'tkt_' + Date.now() + '_ret_' + Math.random().toString(36).substr(2, 4),
    name: `${name} (Pulang)`,
    direction: 'pulang',
    route: rutePulang,
    amount: 0
  });

  renderCockpitTickets(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function removeCockpitTicket(idx) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (cfg.tickets && cfg.tickets[idx]) {
    cfg.tickets.splice(idx, 1);
  }

  renderCockpitTickets(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function onCockpitTicketChange(inputEl, idx, isBlur = false) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  if (!cfg.tickets || !cfg.tickets[idx]) return;

  const row = inputEl.closest ? inputEl.closest('.emp-trans-row') : inputEl.parentElement?.closest('.emp-trans-row');
  if (!row) return;

  const nameVal = row.querySelector('.cockpit-ticket-name')?.value || '';
  const dirVal = row.querySelector('.cockpit-ticket-direction')?.value || cfg.tickets[idx].direction || 'pp';
  const routeVal = row.querySelector('.cockpit-ticket-route')?.value || '';
  let amountVal = (typeof parseNumber === 'function' ? parseNumber(row.querySelector('.cockpit-ticket-amount')?.value) : Number(row.querySelector('.cockpit-ticket-amount')?.value)) || 0;

  cfg.isCustomized = true;
  cfg.tickets[idx].name = nameVal;
  cfg.tickets[idx].direction = dirVal;
  cfg.tickets[idx].route = routeVal;
  cfg.tickets[idx].amount = amountVal;

  const sbm = typeof getSBM === 'function' ? getSBM() : null;

  if (isBlur) {
    if (sbm) {
      let maxTicket = (sbm.tiket && sbm.tiket > 0) ? sbm.tiket : (sbm.dpr > 0 ? Math.max(sbm.dpr, 1000000) : 2500000);
      if (dirVal === 'pergi' || dirVal === 'pulang') {
        maxTicket = Math.round(maxTicket / 2);
      }
      if (amountVal > maxTicket) {
        // Sesuai PMK: Tiket diperkenankan melebihi SBM kebutuhan riil dengan melampirkan SPTJM
        const dirLabel = dirVal === 'pp' ? 'Tiket Perjalanan (PP)' : (dirVal === 'pergi' ? 'Tiket Berangkat' : 'Tiket Pulang');
        openSbmLimitModal({
          title: 'Perhatian: Tiket Melebihi Pagu SBM (Wajib SPTJM)',
          component: dirLabel,
          maxRate: maxTicket,
          provName: sbm.provinsi,
          msg: `Harga ${dirLabel} sebesar <strong>${typeof rp === 'function' ? rp(amountVal) : 'Rp ' + amountVal}</strong> melebihi pagu Standar Biaya Masukan (SBM) untuk tujuan <strong>${typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi}</strong> (Pagu SBM: <strong>${typeof rp === 'function' ? rp(maxTicket) : 'Rp ' + maxTicket}</strong>).<br><br>⚠️ <em>Catatan Pertanggungjawaban (PMK):</em><br>Pengeluaran tiket yang melebihi standar biaya diperkenankan sesuai harga riil, <strong>namun jangan lupa untuk membuat dan melampirkan Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)</strong> dari PPK / Pelaksana Perjalanan Dinas.<br><br><em>Nominal riil Rp ${Number(amountVal).toLocaleString('id-ID')} tetap dipertahankan dan dihitung penuh ke dalam kuitansi &amp; rincian biaya.</em>`
        });
      }
    }
    const amtInput = row.querySelector('.cockpit-ticket-amount');
    if (amtInput && amountVal > 0) {
      amtInput.value = typeof rp === 'function' ? rp(amountVal) : `Rp ${amountVal}`;
    }
    if (typeof renderRincian === 'function') renderRincian();
  }

  const totalBadge = document.getElementById('rc_ticketTotalBadge');
  if (totalBadge) {
    const total = (cfg.tickets || []).reduce((sum, t) => sum + (t.amount || 0), 0);
    totalBadge.innerHTML = `Total Tiket: <strong>${typeof rp === 'function' ? rp(total) : 'Rp ' + total}</strong>`;
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

// =====================================================================
// TRANSPORT LOKAL / DPR PERORANGAN (Rincian per Orang)
// =====================================================================
function isTripToDki() {
  const kotaTujuan = typeof document !== 'undefined' ? (document.getElementById('kotaTujuan')?.value || '') : '';
  const sekitar = typeof getSbmSekitarJakarta === 'function' ? getSbmSekitarJakarta(kotaTujuan) : null;
  // Jika tujuan adalah salah satu daerah sekitar Jakarta (termasuk Kepulauan Seribu),
  // maka bukan perjalanan dalam kota Jakarta flat Rp 170.000, melainkan tarif SBM Sekitar Jakarta (One Way x 2 = PP)
  if (sekitar) {
    return false;
  }
  if (typeof isMultiProvActive === 'function' && isMultiProvActive()) {
    const multi = typeof getMultiProvData === 'function' ? getMultiProvData() : null;
    if (multi && ((multi.sbm1 && multi.sbm1.provinsi === 'DKI JAKARTA') || (multi.sbm2 && multi.sbm2.provinsi === 'DKI JAKARTA'))) {
      return true;
    }
  }
  const id = parseInt(document.getElementById('provinsiTujuan')?.value);
  const sbm = (typeof sbmData !== 'undefined' && Array.isArray(sbmData)) ? (sbmData.find(s => s.id === id) || null) : null;
  return !!(sbm && sbm.provinsi === 'DKI JAKARTA');
}

function openDkiTransportModal() {
  const overlay = document.getElementById('dkiTransportOverlay');
  if (overlay) {
    overlay.classList.add('is-open');
  } else {
    alert('⚠️ PERJALANAN DINAS DKI JAKARTA\n\nUntuk kegiatan perjalanan dinas di DKI Jakarta, komponen transport menggunakan tarif tetap Daftar Pengeluaran Riil (DPR) sebesar Rp 170.000 / orang secara default/otomatis sesuai ketentuan SBM, sehingga tidak dapat ditambah atau diedit dengan rincian transport manual.');
  }
}

function closeDkiTransportModal() {
  const overlay = document.getElementById('dkiTransportOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function handleDkiTransportBackdrop(e) {
  if (e.target && e.target.id === 'dkiTransportOverlay') {
    closeDkiTransportModal();
  }
}

function getEmployeeTransports(empId) {
  const key = String(empId);
  if (!employeeTransports[key]) {
    employeeTransports[key] = [];
  }
  return employeeTransports[key];
}

function setEmployeeTransports(empId, list) {
  const key = String(empId);
  employeeTransports[key] = Array.isArray(list) ? list : [];
}

function clearEmployeeTransports() {
  employeeTransports = {};
}

function getTransportDateColor(empId, date = '') {
  const cfg = typeof getEmployeeCostConfig === 'function' ? getEmployeeCostConfig(empId) : null;
  if (!cfg) return '#fef3c7';
  if (date && cfg.transportDateColors && cfg.transportDateColors[date]) {
    return cfg.transportDateColors[date];
  }
  return cfg.transportDateColor || '#fef3c7';
}

function setTransportDateColor(empId, color) {
  const cfg = typeof getEmployeeCostConfig === 'function' ? getEmployeeCostConfig(empId) : null;
  if (!cfg) return;
  cfg.transportDateColor = color;
  cfg.isCustomized = true;
  setEmployeeCostConfig(empId, cfg);
  renderRincianTransportEditor(empId);
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof renderDPR === 'function') renderDPR();
}

function setTransportDateColorForDate(empId, date, color) {
  const cfg = typeof getEmployeeCostConfig === 'function' ? getEmployeeCostConfig(empId) : null;
  if (!cfg) return;
  if (!cfg.transportDateColors) cfg.transportDateColors = {};
  cfg.transportDateColors[date] = color;
  cfg.isCustomized = true;
  setEmployeeCostConfig(empId, cfg);
  renderRincianTransportEditor(empId);
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof renderDPR === 'function') renderDPR();
}

function renderRincianTransportEditor(targetEmpId) {
  const select = document.getElementById('rincianPegawai');
  const rowsContainer = document.getElementById('rincianTransportRows');
  const summaryEl = document.getElementById('rincianTransportSummary');
  if (!rowsContainer) return;

  const empId = targetEmpId !== undefined ? Number(targetEmpId) : ((select && select.value !== '') ? Number(select.value) : null);
  if (empId === null || isNaN(empId)) {
    rowsContainer.innerHTML = '';
    return;
  }

  // Jika tujuan DKI JAKARTA: Transport otomatis tarif tetap DPR Rp 170.000
  if (isTripToDki()) {
    rowsContainer.innerHTML = `
      <div class="emp-trans-dki-notice" style="background: linear-gradient(135deg, rgba(37,99,235,0.06), rgba(59,130,246,0.12)); border: 1.5px solid rgba(59,130,246,0.35); border-radius: 12px; padding: 18px 20px; margin: 10px 0;">
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <span style="font-size: 28px; line-height: 1;">🏛️</span>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #1e40af; margin-bottom: 5px;">Perjalanan Dinas Dalam Kota DKI Jakarta (Tarif Tetap DPR)</div>
            <p style="margin: 0 0 8px 0; font-size: 12.5px; color: #1e3a8a; line-height: 1.5;">
              Sesuai ketentuan SBM TA 2026, biaya transport kegiatan di DKI Jakarta telah ditetapkan berupa <strong>Daftar Pengeluaran Riil (DPR) sebesar Rp 170.000 / orang</strong> secara default/otomatis.
            </p>
            <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 6px;">
              🔒 Transport Terkunci: Default Rp 170.000 (Otomatis)
            </div>
          </div>
        </div>
      </div>
    `;
    if (summaryEl) {
      summaryEl.innerHTML = `Transport DKI: <strong>Rp 170.000 (DPR Otomatis)</strong>`;
    }
    return;
  }

  const emp = employees.find(e => e.id === empId);
  const list = getEmployeeTransports(empId);
  let total = 0;

  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  const isSekitar = sbm && sbm.isSekitarJakarta && sbm.sekitarJakarta;
  const sekitarBannerHtml = isSekitar ? `
    <div class="emp-trans-sekitar-banner">
      <div class="emp-trans-sekitar-text">
        <span class="sekitar-label">🚆 SBM Transport Jakarta &harr; ${sbm.sekitarJakarta.nama} (PP):</span>
        <span class="sekitar-detail">Tarif SBM One Way <strong>${rp(sbm.dprOneWay)}</strong> &times; 2 = Maks DPR <strong>${rp(sbm.dpr)} PP</strong></span>
      </div>
      <div class="emp-trans-sekitar-actions">
        <button type="button" class="btn-isi-sbm-pp" onclick="addSekitarJakartaTransportPreset()" title="Isi otomatis 1 baris transport tarif penuh SBM (${rp(sbm.dpr)})">+ Isi SBM PP (${rp(sbm.dpr)})</button>
        <button type="button" class="btn-pmk-hal-link" onclick="openPmkModal(68)" title="Cek Dokumen Resmi PMK Hal 68">PMK Hal 68 ↗</button>
      </div>
    </div>
  ` : '';

  const currentColor = getTransportDateColor(empId);
  const colorToolbarHtml = `
    <div class="transport-toolbar-row">
      <div class="transport-color-picker-wrap">
        <span class="trans-toolbar-label">🎨 Warna Header Tanggal (DPR):</span>
        <div class="trans-color-presets">
          <button type="button" class="trans-color-swatch ${currentColor==='#fef3c7'?'active':''}" style="background:#fef3c7" onclick="setTransportDateColor('${empId}', '#fef3c7')" title="Kuning Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#e0f2fe'?'active':''}" style="background:#e0f2fe" onclick="setTransportDateColor('${empId}', '#e0f2fe')" title="Biru Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#f1f5f9'?'active':''}" style="background:#f1f5f9" onclick="setTransportDateColor('${empId}', '#f1f5f9')" title="Abu-abu Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#dcfce7'?'active':''}" style="background:#dcfce7" onclick="setTransportDateColor('${empId}', '#dcfce7')" title="Hijau Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#ede9fe'?'active':''}" style="background:#ede9fe" onclick="setTransportDateColor('${empId}', '#ede9fe')" title="Ungu Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#ffffff'?'active':''}" style="background:#ffffff; border:1px solid #cbd5e1;" onclick="setTransportDateColor('${empId}', '#ffffff')" title="Putih/Tanpa Warna"></button>
          <label class="trans-color-custom-btn" title="Pilih warna kustom bebas">
            <input type="color" value="${currentColor}" onchange="setTransportDateColor('${empId}', this.value)">
            <span>Kustom</span>
          </label>
        </div>
      </div>
      <div class="trans-hint-text">
        <small style="color:var(--text-muted, #64748b);">💡 Baris dengan tanggal sama akan otomatis dikelompokkan</small>
      </div>
    </div>
  `;

  if (list.length === 0) {
    rowsContainer.innerHTML = sekitarBannerHtml + colorToolbarHtml + `
      <div class="emp-trans-empty">
        Belum ada rincian transport untuk ${emp ? emp.nama.split(',')[0] : 'pegawai ini'}.
        Gunakan tombol <strong>+ Grab</strong>, <strong>+ Gojek</strong>, <strong>+ MRT</strong>, <strong>+ KRL</strong>, dll. di atas atau klik <strong>Tambah Baris Transport</strong>.
      </div>`;
  } else {
    rowsContainer.innerHTML = sekitarBannerHtml + colorToolbarHtml + list.map((item, idx) => {
      total += (item.amount || 0);
      const dispAmount = item.amount > 0 ? (typeof rp === 'function' ? rp(item.amount) : 'Rp ' + item.amount) : '';
      return `
        <div class="emp-trans-row" data-idx="${idx}">
          <div class="emp-trans-col emp-trans-date-col">
            <label class="emp-trans-label">Tanggal</label>
            <input type="date" class="emp-trans-date" value="${item.date || ''}" onchange="onEmployeeTransportRowChange(this, ${idx}, true)" oninput="onEmployeeTransportRowChange(this, ${idx}, false)">
          </div>
          <div class="emp-trans-col emp-trans-name-col">
            <label class="emp-trans-label">Jenis / Moda</label>
            <input type="text" class="emp-trans-name" placeholder="Grab, MRT, Tol..." value="${typeof escHtml === 'function' ? escHtml(item.name || '') : (item.name || '')}" list="listTransportPresets" oninput="onEmployeeTransportRowChange(this, ${idx}, false)" onblur="onEmployeeTransportRowChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-pickup-col">
            <label class="emp-trans-label">Titik Jemput</label>
            <input type="text" class="emp-trans-pickup" placeholder="Contoh: Rumah / Stasiun Gambir" value="${typeof escHtml === 'function' ? escHtml(item.pickup || '') : (item.pickup || '')}" oninput="onEmployeeTransportRowChange(this, ${idx}, false)" onblur="onEmployeeTransportRowChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-dropoff-col">
            <label class="emp-trans-label">Titik Antar</label>
            <input type="text" class="emp-trans-dropoff" placeholder="Contoh: Stasiun Halim / Kantor" value="${typeof escHtml === 'function' ? escHtml(item.dropoff || '') : (item.dropoff || '')}" oninput="onEmployeeTransportRowChange(this, ${idx}, false)" onblur="onEmployeeTransportRowChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-amount-col">
            <label class="emp-trans-label">Biaya / Tarif (Rp)</label>
            <input type="text" class="emp-trans-amount" placeholder="Rp 0" value="${dispAmount}" onfocus="this.select()" oninput="onEmployeeTransportRowChange(this, ${idx}, false)" onblur="onEmployeeTransportRowChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-del-col">
            <label class="emp-trans-label">&nbsp;</label>
            <button type="button" class="btn btn-warn emp-trans-del-btn" onclick="removeEmployeeTransportRow(${idx})">Hapus</button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (summaryEl) {
    const sbmDprLimit = (sbm && sbm.dpr > 0) ? sbm.dpr : 0;
    const limitLabel = sbmDprLimit > 0 ? ` <span style="font-weight: normal; color: #64748b;">(Maks SBM: ${typeof rp === 'function' ? rp(sbmDprLimit) : 'Rp ' + sbmDprLimit} PP)</span>` : '';
    summaryEl.innerHTML = `Total Transport: <strong>${typeof rp === 'function' ? rp(total) : 'Rp ' + total}</strong>${limitLabel}`;
  }
}

function addSekitarJakartaTransportPreset() {
  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  if (!sbm || !sbm.isSekitarJakarta) return;
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  const empId = Number(select.value);
  if (isNaN(empId)) return;
  const list = getEmployeeTransports(empId);
  const lastDate = (list.length > 0 && list[list.length - 1].date)
    ? list[list.length - 1].date
    : (document.getElementById('tglBerangkat')?.value || '');
  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';

  const currentTotal = list.reduce((sum, it) => sum + (it.amount || 0), 0);
  const remainingPagu = Math.max(0, sbm.dpr - currentTotal);
  const amountToFill = list.length === 0 ? sbm.dpr : remainingPagu;

  list.push({
    id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    date: lastDate,
    name: `Transport ${kotaAsal} - ${sbm.sekitarJakarta.nama} (PP)`,
    pickup: 'Rumah / Kantor',
    dropoff: `Lokasi Tugas (${sbm.sekitarJakarta.nama})`,
    amount: amountToFill
  });
  setEmployeeTransports(empId, list);
  renderRincianTransportEditor(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
}

function onKotaTujuanChange() {
  const val = (document.getElementById('kotaTujuan')?.value || '').trim();
  const sekitar = typeof getSbmSekitarJakarta === 'function' ? getSbmSekitarJakarta(val) : null;
  if (sekitar) {
    const provSel = document.getElementById('provinsiTujuan');
    if (provSel && String(provSel.value) !== String(sekitar.provId)) {
      provSel.value = sekitar.provId;
      if (typeof changeProvince === 'function') {
        changeProvince();
        return;
      }
    }
  }
  if (typeof updateSBMPreview === 'function') updateSBMPreview();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  if (typeof renderRincianTransportEditor === 'function') {
    const sel = document.getElementById('rincianPegawai');
    if (sel && sel.value) renderRincianTransportEditor(sel.value);
  }
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof renderDPR === 'function') renderDPR();
}

function addEmployeeTransportPreset(presetName) {
  if (isTripToDki()) {
    openDkiTransportModal();
    return;
  }
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  const empId = Number(select.value);
  if (isNaN(empId)) {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  addEmployeeTransportRow(presetName);
}

function addEmployeeTransportRow(presetName = '') {
  if (isTripToDki()) {
    openDkiTransportModal();
    return;
  }
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  const empId = Number(select.value);
  if (isNaN(empId)) {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  const list = getEmployeeTransports(empId);
  const lastDate = (list.length > 0 && list[list.length - 1].date)
    ? list[list.length - 1].date
    : (document.getElementById('tglBerangkat')?.value || '');
  list.push({
    id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    date: lastDate,
    name: presetName,
    pickup: '',
    dropoff: '',
    amount: 0
  });
  setEmployeeTransports(empId, list);
  renderRincianTransportEditor(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
}

function removeEmployeeTransportRow(idx) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;
  const list = getEmployeeTransports(empId);
  if (list[idx]) {
    list.splice(idx, 1);
    setEmployeeTransports(empId, list);
    renderRincianTransportEditor(empId);
    renderRincianCockpit(empId);
    renderRincianEmpPills();
    if (typeof renderRincian === 'function') renderRincian();
    if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  }
}

function onEmployeeTransportRowChange(el, idx, isBlur = false) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;
  const list = getEmployeeTransports(empId);
  const row = el.closest ? el.closest('.emp-trans-row') : el.parentElement?.closest('.emp-trans-row');
  if (!row || !list[idx]) return;

  const dateVal = row.querySelector('.emp-trans-date')?.value || '';
  const nameVal = row.querySelector('.emp-trans-name')?.value || '';
  const pickupVal = row.querySelector('.emp-trans-pickup')?.value || '';
  const dropoffVal = row.querySelector('.emp-trans-dropoff')?.value || '';
  let amountVal = (typeof parseNumber === 'function' ? parseNumber(row.querySelector('.emp-trans-amount')?.value) : Number(row.querySelector('.emp-trans-amount')?.value)) || 0;

  list[idx].date = dateVal;
  list[idx].name = nameVal;
  list[idx].pickup = pickupVal;
  list[idx].dropoff = dropoffVal;
  list[idx].amount = amountVal;
  setEmployeeTransports(empId, list);

  const sbm = typeof getSBM === 'function' ? getSBM() : null;

  if (isBlur) {
    if (sbm && sbm.dpr > 0) {
      const maxDpr = sbm.dpr;
      const otherRowsTotal = list.reduce((sum, item, i) => i === idx ? sum : sum + (item.amount || 0), 0);
      const maxAllowedForRow = Math.max(0, maxDpr - otherRowsTotal);

      if (amountVal > maxAllowedForRow) {
        amountVal = maxAllowedForRow;
        list[idx].amount = maxAllowedForRow;
        setEmployeeTransports(empId, list);
        const amtInput = row.querySelector('.emp-trans-amount');
        if (amtInput) amtInput.value = maxAllowedForRow > 0 ? (typeof rp === 'function' ? rp(maxAllowedForRow) : `Rp ${maxAllowedForRow}`) : '';

        const areaName = sbm.isSekitarJakarta ? `rute Jakarta &harr; ${sbm.sekitarJakarta.nama} (PP)` : (typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi);
        const detailCalculation = sbm.isSekitarJakarta ? ` (One Way ${typeof rp === 'function' ? rp(sbm.dprOneWay) : sbm.dprOneWay} &times; 2 = ${typeof rp === 'function' ? rp(maxDpr) : maxDpr} PP sesuai PMK SBM Hal 68)` : '';

        openSbmLimitModal({
          title: 'Melebihi Batas SBM Transport / DPR',
          component: 'Biaya Transportasi',
          maxRate: maxDpr,
          provName: sbm.provinsi,
          msg: `Total biaya transport/DPR untuk pegawai ini pada <strong>${areaName}</strong> tidak boleh melebihi batas SBM DPR sebesar <strong>${typeof rp === 'function' ? rp(maxDpr) : 'Rp ' + maxDpr}</strong>${detailCalculation}. Nilai baris ini otomatis disesuaikan ke sisa pagu maksimal (<strong>${typeof rp === 'function' ? rp(maxAllowedForRow) : 'Rp ' + maxAllowedForRow}</strong>).`
        });
      }
    }
    const amtInput = row.querySelector('.emp-trans-amount');
    if (amtInput && amountVal > 0) {
      amtInput.value = typeof rp === 'function' ? rp(amountVal) : `Rp ${amountVal}`;
    }
    if (typeof renderRincian === 'function') renderRincian();
    if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  }

  const summaryEl = document.getElementById('rincianTransportSummary');
  if (summaryEl) {
    const total = list.reduce((sum, it) => sum + (it.amount || 0), 0);
    const limitLabel = (sbm && sbm.dpr > 0) ? ` <span style="font-weight: normal; color: #64748b;">(Maks SBM: ${typeof rp === 'function' ? rp(sbm.dpr) : 'Rp ' + sbm.dpr} PP)</span>` : '';
    summaryEl.innerHTML = `Total Transport: <strong>${typeof rp === 'function' ? rp(total) : 'Rp ' + total}</strong>${limitLabel}`;
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function getHotelRate(sbm, gol) {
  if (!sbm) return 0;
  if (gol.startsWith('IV')) return sbm.h4;
  if (gol === 'I' || gol === 'II') return sbm.h2;
  return sbm.h3; // Gol III, IX, VIII, VII, dll → rate Eselon IV/Gol III
}

function hitungBiaya(emp) {
  const sbm = getSBM();
  const cfg = getEmployeeCostConfig(emp.id);

  // Tickets for this employee
  const employeeTickets = (cfg.tickets || []).filter(t => t && t.amount > 0).map(t => ({
    name: t.name || 'Tiket Perjalanan',
    amount: t.amount,
    isTransport: false,
    isTicket: true,
    pickup: '',
    dropoff: t.route || ''
  }));

  // Individual Transports for this employee
  const indTransports = (getEmployeeTransports(emp.id) || [])
    .filter(t => t && t.name && t.amount > 0)
    .map(t => ({
      name: t.name,
      amount: t.amount,
      isTransport: true,
      isTicket: false,
      pickup: t.pickup || '',
      dropoff: t.dropoff || '',
      date: t.date || ''
    }));

  // Global custom costs (if any configured from customCostList)
  const globalCustomCosts = (typeof getCustomCosts === 'function' ? getCustomCosts() : []).map(item => ({
    name: item.name,
    amount: (item.amounts && item.amounts[emp.id]) ? item.amounts[emp.id] : 0,
    isTransport: item.kind === 'transport',
    isTicket: item.kind === 'tiket',
    pickup: item.pickup,
    dropoff: item.dropoff
  })).filter(c => c.amount > 0);

  const isDkiTarget = typeof isTripToDki === 'function' ? isTripToDki() : (sbm && sbm.provinsi === 'DKI JAKARTA');
  const allowedTransports = isDkiTarget ? [] : indTransports;
  const allowedGlobals = isDkiTarget ? globalCustomCosts.filter(c => !c.isTransport) : globalCustomCosts;

  const customCosts = [...allowedGlobals, ...employeeTickets, ...allowedTransports];
  const customTotal = customCosts.reduce((total, item) => total + item.amount, 0);

  const jenisKeg = cfg.jenisKeg || document.getElementById('jenisKegiatan')?.value || 'biasa';

  if (!sbm) {
    return {
      uh: 0,
      uhGross: 0,
      uhBaseRate: 0,
      uhTitle: 'Uang Harian',
      effectivePercent: 1,
      jenisKeg,
      isMealManual: cfg.mealMode === 'manual',
      mealDeduction: 0,
      snackDeduction: 0,
      mealRate: 0,
      mealCount: 0,
      snackRate: 0,
      snackCount: 0,
      hotel: 0,
      hotelDetails: [],
      representatif: 0,
      representatifRate: 0,
      dpr: 0,
      tiket: 0,
      customCosts,
      total: customTotal
    };
  }

  const { days, nights } = getEmpDays(emp.id);
  const cbUH = cfg.uhActive;
  const cbHotel = cfg.hotelActive;
  const uhPercent = cfg.uhPercent ?? (Number(document.getElementById('uhPersentase')?.value) || 1);
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';
  const isKepSeribu = typeof isKepulauanSeribuTarget === 'function' ? isKepulauanSeribuTarget(sbm) : !!(sbm.isKepulauanSeribu || (sbm.sekitarJakarta && sbm.sekitarJakarta.id === 'kep_seribu'));
  const isDkiNoUh = isDkiJakarta && !isKepSeribu;

  let uhBaseRate = 0;
  let uhTitle = '';
  let effectivePercent = 1;

  if (jenisKeg === 'diklat') {
    uhBaseRate = sbm.diklat || 110000;
    uhTitle = 'Uang Harian Diklat';
    effectivePercent = 1;
  } else if (jenisKeg === 'fullboard') {
    uhBaseRate = sbm.fullboard || 130000;
    uhTitle = 'Uang Harian Fullboard';
    effectivePercent = 1;
  } else {
    uhBaseRate = isKepSeribu ? 210000 : sbm.uh;
    effectivePercent = uhPercent;
    uhTitle = `Uang Harian ${Math.round(uhPercent * 100)}%`;
  }

  const multiProv = typeof getMultiProvData === 'function' ? getMultiProvData() : null;
  const isMultiProv = !!multiProv;
  let uhGross1 = 0, uhGross2 = 0;
  let uhRate1 = 0, uhRate2 = 0;
  let days1 = 0, days2 = 0;
  let sbm1 = null, sbm2 = null;

  if (isMultiProv) {
    sbm1 = multiProv.sbm1;
    sbm2 = multiProv.sbm2;
    days1 = multiProv.days1;
    days2 = multiProv.days2;

    if (jenisKeg === 'diklat') {
      uhRate1 = sbm1.diklat || 110000;
      uhRate2 = sbm2.diklat || 110000;
    } else if (jenisKeg === 'fullboard') {
      uhRate1 = sbm1.fullboard || 130000;
      uhRate2 = sbm2.fullboard || 130000;
    } else {
      uhRate1 = sbm1.uh || 0;
      uhRate2 = sbm2.uh || 0;
    }
    uhGross1 = cbUH ? Math.round(uhRate1 * days1 * effectivePercent) : 0;
    uhGross2 = cbUH ? Math.round(uhRate2 * days2 * effectivePercent) : 0;
  }

  const uhGross = isMultiProv
    ? (uhGross1 + uhGross2)
    : (cbUH && !isDkiNoUh ? Math.round(uhBaseRate * days * effectivePercent) : 0);

  const hasKonsumsi = cbUH && cfg.hasKonsumsi;
  const isMealManual = cfg.mealMode === 'manual';
  const manualMealEntries = (cfg.manualMeals || []).filter(m => m && m.price > 0);
  const useDetail = hasKonsumsi && isMealManual && manualMealEntries.length > 0;

  let mealRate = 0;
  let mealCount = 0;
  let mealDays = 0;
  let mealRequested = 0;

  if (useDetail) {
    mealRequested = manualMealEntries.reduce((sum, item) => sum + item.price, 0);
    mealCount = manualMealEntries.length;
    mealDays = new Set(manualMealEntries.map(e => e.day)).size;
    mealRate = mealCount > 0 ? Math.round(mealRequested / mealCount) : 0;
  } else if (hasKonsumsi) {
    const rawManualMeal = (typeof parseNumber === 'function' ? parseNumber(document.getElementById('tarifMakan')?.value) : Number(document.getElementById('tarifMakan')?.value)) || 0;
    mealRate = isMealManual ? Math.max(0, rawManualMeal) : (sbm?.makan || (isMultiProv ? sbm1?.makan : 0) || 0);
    const rawCount = Number(document.getElementById('jumlahMakan')?.value);
    mealCount = cfg.mealCount || ((!isNaN(rawCount) && rawCount > 0) ? rawCount : (isMealManual && rawManualMeal > 0 ? 1 : 0));
    const rawDays = Number(document.getElementById('hariMakan')?.value);
    mealDays = (cfg.mealDays && cfg.mealDays > 0) ? cfg.mealDays : ((!isNaN(rawDays) && rawDays > 0) ? rawDays : days);
    mealRequested = mealRate * mealCount * mealDays;
  }

  const snackRate = sbm?.snack || (isMultiProv ? sbm1?.snack : 0) || 0;
  const snackCount = cfg.snackCount || 0;
  const snackDays = days;
  const snackRequested = (hasKonsumsi && snackCount > 0) ? snackRate * snackCount * snackDays : 0;

  const mealDeduction = Math.min(uhGross, mealRequested);
  const snackDeduction = Math.min(Math.max(0, uhGross - mealDeduction), snackRequested);
  const uh = uhGross - mealDeduction - snackDeduction;

  // Hotel
  let hotel = 0;
  const hotelDetails = [];
  if (cbHotel) {
    if (cfg.hotelMode === 'manual') {
      const hNights = (cfg.hotelNights > 0) ? cfg.hotelNights : nights;
      const hPrice = cfg.hotelPrice || 0;
      const hTotal = hNights * hPrice;
      if (hTotal > 0) {
        hotel = hTotal;
        hotelDetails.push({ name: cfg.hotelName || 'Penginapan / Hotel', nights: hNights, price: hPrice, total: hTotal });
      }
    } else {
      const hotelEntries = typeof getHotelEntries === 'function' ? getHotelEntries() : [];
      if (hotelEntries.length) {
        hotelEntries.forEach(item => {
          if (!item.employeeIds.includes(emp.id)) return;
          const roomTotal = item.nights * item.price;
          if (roomTotal <= 0) return;
          hotel += roomTotal;
          hotelDetails.push({ name: item.name, nights: item.nights, price: item.price, total: roomTotal });
        });
      } else {
        const hRate = getHotelRate(sbm, emp.gol);
        const hNights = (cfg.hotelNights > 0) ? cfg.hotelNights : (nights > 0 ? nights : 1);
        hotel = hRate * hNights;
        if (hotel > 0) {
          const hName = cfg.hotelName ? `${cfg.hotelName} (Gol. ${emp.gol})` : `Tarif SBM (Gol. ${emp.gol})`;
          hotelDetails.push({ name: hName, nights: hNights, price: hRate, total: hotel });
        }
      }
    }
  }

  const isKepalaBiro = /kepala biro/i.test(emp.jabatan || '');
  const representatifRate = isKepalaBiro ? (isDkiJakarta ? 75000 : 150000) : 0;
  const representatif = representatifRate * days;

  // DPR otomatis Rp 170.000 hanya jika tujuan DKI JAKARTA
  const dprVal = isDkiTarget ? 170000 : 0;
  const tiketVal = (document.getElementById('cbTiket')?.checked && sbm) ? sbm.tiket : 0;

  return {
    uh,
    uhGross,
    uhBaseRate,
    uhTitle,
    effectivePercent,
    jenisKeg,
    isMealManual,
    mealDeduction,
    snackDeduction,
    mealRate,
    mealCount,
    mealDays,
    manualMode: useDetail ? 'detail' : 'flat',
    mealDetails: useDetail ? manualMealEntries : [],
    snackRate,
    snackCount,
    snackDays,
    hotel,
    hotelDetails,
    representatif,
    representatifRate,
    dpr: dprVal,
    tiket: tiketVal,
    customCosts,
    total: uh + hotel + representatif + dprVal + tiketVal + customTotal,
    isMultiProv,
    multiProvData: isMultiProv ? {
      sbm1,
      sbm2,
      days1,
      days2,
      uhRate1,
      uhRate2,
      uhGross1,
      uhGross2,
      title1: `Uang Harian ${typeof getProvShortName === 'function' ? getProvShortName(sbm1.provinsi) : sbm1.provinsi}`,
      title2: `Uang Harian ${typeof getProvShortName === 'function' ? getProvShortName(sbm2.provinsi) : sbm2.provinsi}`
    } : null
  };
}

if (typeof window !== 'undefined') {
  window.openSbmLimitModal = openSbmLimitModal;
  window.openMealLimitModal = openMealLimitModal;
  window.closeMealLimitModal = closeMealLimitModal;
  window.handleMealLimitBackdrop = handleMealLimitBackdrop;
  window.updateCockpitKpi = updateCockpitKpi;
  window.onCockpitTicketChange = onCockpitTicketChange;
  window.onEmployeeTransportRowChange = onEmployeeTransportRowChange;
  window.onCockpitHotelChange = onCockpitHotelChange;
  window.onCockpitManualMealChange = onCockpitManualMealChange;
  window.onCockpitUHChange = onCockpitUHChange;
  window.switchCockpitTab = switchCockpitTab;
}
