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

