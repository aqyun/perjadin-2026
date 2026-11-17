// =====================================================================
// SBM & PERHITUNGAN BIAYA (PerdinKu)
// Perhitungan uang harian, hotel, transportasi, DPR, dan tarif SBM
// =====================================================================

// =====================================================================
// SBM & LAMA TUGAS
// =====================================================================
function getSBM() {
  if (isMultiProvActive()) {
    const id1 = parseInt(document.getElementById('provinsiTujuan1')?.value || document.getElementById('provinsiTujuan')?.value);
    const s1 = sbmData.find(s => s.id === id1);
    if (s1) return s1;
  }
  const id = parseInt(document.getElementById('provinsiTujuan')?.value);
  return sbmData.find(s => s.id === id) || null;
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

function openMealLimitModal(dayName, maxRate) {
  const overlay = document.getElementById('mealLimitOverlay');
  const titleEl = document.getElementById('mealLimitTitle');
  const msgEl = document.getElementById('mealLimitMsg');
  const maxFormatted = typeof rp === 'function' ? rp(maxRate) : `Rp ${maxRate.toLocaleString('id-ID')}`;

  if (titleEl) titleEl.textContent = 'Melebihi Batas SBM Daerah';
  if (msgEl) {
    const dayLabel = dayName ? ` untuk ${dayName}` : '';
    msgEl.innerHTML = `Tarif makan riil per orang${dayLabel} tidak boleh melebihi Standar Biaya Masukan (SBM) daerah tujuan sebesar <strong>${maxFormatted}</strong>. Nilai otomatis disesuaikan ke batas maksimal SBM.`;
  }

  if (overlay) {
    overlay.classList.add('is-open');
  } else {
    alert(`Tarif makan tidak boleh melebihi Standar Biaya Masukan (SBM) daerah tujuan sebesar ${maxFormatted}!`);
  }

  if (typeof showValidationToast === 'function') {
    showValidationToast(null, `Tarif makan melebihi batas SBM ${maxFormatted}! Otomatis disesuaikan.`);
  }
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
  const selected = [...selectedEmpIds].sort((a, b) => a - b);
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

const TRANSPORT_COST_RE = /\b(grab|grabcar|gojek|goride|gocar|grabbike|ojek|ojol|maxim|toll|tol|bensin|bbm|pertamax|pertalite|solar|parkir|taxi|taksi|angkot|transport)\b/i;
const TOLL_COST_RE = /\b(toll|tol)\b/i;
const TICKET_COST_RE = /\b(tiket|kereta|whoosh|pesawat|kapal|ferry|feri|speedboat)\b/i;
const TICKET_CATEGORY_RULES = [
  { re: /\b(pesawat|penerbangan|flight)\b/i, label: 'Tiket Pesawat Udara' },
  { re: /\bwhoosh\b/i, label: 'Tiket Whoosh' },
  { re: /\bkereta\b/i, label: 'Tiket Kereta Api' },
  { re: /\b(kapal|ferry|feri|speedboat)\b/i, label: 'Tiket Kapal' }
];

function getTicketCostLabel(name) {
  const rule = TICKET_CATEGORY_RULES.find(item => item.re.test(name));
  return rule ? rule.label : name;
}

function addCustomCost() {
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
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';
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
    } else {
      elUH.textContent = isDkiJakarta ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.uh);
    }
  }
  const elDiklat = document.getElementById('sbm_diklat');
  if (elDiklat) elDiklat.textContent = !isUHActive ? `${rp(0)} (tidak dipilih)` : (isDkiJakarta ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.diklat || 110000));
  const elFullboard = document.getElementById('sbm_fullboard');
  if (elFullboard) elFullboard.textContent = !isUHActive ? `${rp(0)} (tidak dipilih)` : (isDkiJakarta ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.fullboard || 130000));
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
  document.getElementById('sbm_jkt').textContent = sbm.jktPP ? rp(sbm.jktPP) : '(tidak ada/dalam kota)';
  document.getElementById('sbm_taxi').textContent = sbm.taxi ? rp(sbm.taxi) : '-';
  const manualDpr = Number(document.getElementById('dprManual')?.value) || 0;
  document.getElementById('sbm_dpr').textContent = isDkiJakarta ? `${rp(170000)} (otomatis)` : '- (hanya DKI Jakarta)';
  document.getElementById('sbm_tiket').textContent = sbm.tiket ? rp(sbm.tiket) : '(tidak ada tiket pesawat)';
  const isDkiTarget = isDkiJakarta || (multi && ((multi.sbm1 && multi.sbm1.provinsi === 'DKI JAKARTA') || (multi.sbm2 && multi.sbm2.provinsi === 'DKI JAKARTA')));
  const noteJkt = document.getElementById('noteJakartaDPR');
  if (noteJkt) noteJkt.style.display = isDkiTarget ? 'block' : 'none';
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
    const selected = [...selectedEmpIds].sort((a, b) => a - b);
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
          items.push({
            title: `Transport — ${emp.nama.split(',')[0]}`,
            text: `${rp(total)} melebihi SBM DPR ${rp(sbm.dpr)} sebesar ${rp(total - sbm.dpr)}.`
          });
        }
      });
    }

    if (sbm.tiket > 0) {
      const ticketGroups = new Map();
      if (cbTiket) ticketGroups.set('Tiket Pesawat Udara', []);
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
          const total = ticketExtra + (label === 'Tiket Pesawat Udara' && cbTiket ? sbm.tiket : 0);
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

function getHotelRate(sbm, gol) {
  if (!sbm) return 0;
  if (gol.startsWith('IV')) return sbm.h4;
  if (gol === 'I' || gol === 'II') return sbm.h2;
  return sbm.h3; // Gol III, IX, VIII, VII, dll → rate Eselon IV/Gol III
}

function hitungBiaya(emp) {
  const sbm = getSBM();
  const customCosts = getCustomCosts().map(item => ({
    name: item.name,
    amount: item.amounts[emp.id] || 0,
    isTransport: item.kind === 'transport',
    isTicket: item.kind === 'tiket',
    pickup: item.pickup,
    dropoff: item.dropoff
  }));
  const customTotal = customCosts.reduce((total, item) => total + item.amount, 0);
  const jenisKeg = document.getElementById('jenisKegiatan')?.value || 'biasa';
  if (!sbm) {
    return {
      uh: 0,
      uhGross: 0,
      uhBaseRate: 0,
      uhTitle: 'Uang Harian',
      effectivePercent: 1,
      jenisKeg,
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
  const cbUH = document.getElementById('cbUH').checked;
  const cbHotel = document.getElementById('cbHotel').checked;
  const cbDPR = document.getElementById('cbDPR').checked;
  const cbTiket = document.getElementById('cbTiket').checked;
  const uhPercent = Number(document.getElementById('uhPersentase').value) || 1;
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';

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
    // 'biasa', 'rapat', or 'lainnya'
    uhBaseRate = sbm.uh;
    effectivePercent = uhPercent;
    uhTitle = `Uang Harian ${Math.round(uhPercent * 100)}%`;
  }

  const multiProv = getMultiProvData();
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
    : (cbUH && !isDkiJakarta ? Math.round(uhBaseRate * days * effectivePercent) : 0);

  const isMeeting = jenisKeg === 'rapat';
  const isBiasaWithKonsumsi = jenisKeg === 'biasa' && !!document.getElementById('cbKonsumsiBiasa')?.checked;
  const isMealManual = !!document.getElementById('cbTarifMakanManual')?.checked;
  const hasKonsumsi = cbUH && (isMeeting || isBiasaWithKonsumsi || isMealManual);

  const wrapDetail = document.getElementById('manualMealDetailWrap');
  const isDetailOpen = wrapDetail && wrapDetail.style.display !== 'none';
  const modeVal = document.getElementById('manualMakanMode')?.value || 'flat';
  const isDetailMode = modeVal === 'detail' || isDetailOpen;
  const manualMealEntries = (cbUH && isMealManual) ? getManualMealEntries() : [];
  const useDetail = cbUH && isMealManual && isDetailMode && manualMealEntries.length > 0;

  let mealRate = 0;
  let mealCount = 0;
  let mealDays = 0;
  let mealRequested = 0;

  if (useDetail) {
    mealRequested = manualMealEntries.reduce((sum, item) => sum + item.price, 0);
    mealCount = manualMealEntries.length;
    mealDays = new Set(manualMealEntries.map(e => e.day)).size;
    mealRate = mealCount > 0 ? Math.round(mealRequested / mealCount) : 0;
  } else {
    const rawManualMeal = parseNumber(document.getElementById('tarifMakan')?.value);
    mealRate = isMealManual ? Math.max(0, rawManualMeal) : (sbm?.makan || (isMultiProv ? sbm1?.makan : 0) || 0);
    const rawMealCount = Number(document.getElementById('jumlahMakan')?.value);
    mealCount = (!isNaN(rawMealCount) && rawMealCount > 0) ? rawMealCount : 0;
    if (isMealManual && rawManualMeal > 0 && mealCount === 0) {
      mealCount = 1;
    }
    const rawHariMakan = Number(document.getElementById('hariMakan')?.value);
    mealDays = (!isNaN(rawHariMakan) && rawHariMakan > 0) ? rawHariMakan : days;
    mealRequested = (hasKonsumsi && mealCount > 0) ? mealRate * mealCount * mealDays : 0;
  }

  const snackRate = sbm?.snack || (isMultiProv ? sbm1?.snack : 0) || 0;
  const rawSnackCount = Number(document.getElementById('jumlahSnack')?.value);
  const snackCount = (!isNaN(rawSnackCount) && rawSnackCount > 0) ? rawSnackCount : 0;

  const rawHariSnack = Number(document.getElementById('hariSnack')?.value);
  const snackDays = (!isNaN(rawHariSnack) && rawHariSnack > 0) ? rawHariSnack : days;

  const snackRequested = (hasKonsumsi && snackCount > 0) ? snackRate * snackCount * snackDays : 0;
  const mealDeduction = Math.min(uhGross, mealRequested);
  const snackDeduction = Math.min(Math.max(0, uhGross - mealDeduction), snackRequested);
  const uh = uhGross - mealDeduction - snackDeduction;

  const hotelEntries = getHotelEntries();
  let hotel = 0;
  const hotelDetails = [];
  if (cbHotel) {
    if (hotelEntries.length) {
      hotelEntries.forEach(item => {
        if (!item.employeeIds.includes(emp.id)) return;
        const roomTotal = item.nights * item.price;
        if (roomTotal <= 0) return;
        hotel += roomTotal;
        hotelDetails.push({ name: item.name, nights: item.nights, price: item.price, total: roomTotal });
      });
    } else {
      hotel = getHotelRate(sbm, emp.gol) * nights;
    }
  }
  const isKepalaBiro = /kepala biro/i.test(emp.jabatan || '');
  const representatifRate = isKepalaBiro ? (isDkiJakarta ? 75000 : 150000) : 0;
  const representatif = representatifRate * days;
  // DPR otomatis Rp 170.000 hanya jika tujuan DKI JAKARTA, selain Jakarta tidak ada (0)
  const isDkiTarget = isDkiJakarta || (isMultiProv && ((sbm1 && sbm1.provinsi === 'DKI JAKARTA') || (sbm2 && sbm2.provinsi === 'DKI JAKARTA')));
  const dprVal = isDkiTarget ? 170000 : 0;
  const tiketVal = cbTiket ? sbm.tiket : 0;
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
      title1: `Uang Harian ${getProvShortName(sbm1.provinsi)}`,
      title2: `Uang Harian ${getProvShortName(sbm2.provinsi)}`
    } : null
  };
}
