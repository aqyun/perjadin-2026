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

  if (isDkiNoUh) {
    uhBaseRate = 0;
    uhTitle = 'Uang Harian DKI (Tidak Dibayarkan)';
    effectivePercent = 0;
  } else if (jenisKeg === 'diklat') {
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
    uhTitle = Math.round((uhPercent ?? 1) * 100) === 100 ? 'Uang Harian' : `Uang Harian ${Math.round((uhPercent ?? 1) * 100)}%`;
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

    const isDki1 = sbm1 && sbm1.provinsi === 'DKI JAKARTA' && !(typeof isKepulauanSeribuTarget === 'function' ? isKepulauanSeribuTarget(sbm1) : false);
    const isDki2 = sbm2 && sbm2.provinsi === 'DKI JAKARTA' && !(typeof isKepulauanSeribuTarget === 'function' ? isKepulauanSeribuTarget(sbm2) : false);

    if (jenisKeg === 'diklat') {
      uhRate1 = isDki1 ? 0 : (sbm1.diklat || 110000);
      uhRate2 = isDki2 ? 0 : (sbm2.diklat || 110000);
    } else if (jenisKeg === 'fullboard') {
      uhRate1 = isDki1 ? 0 : (sbm1.fullboard || 130000);
      uhRate2 = isDki2 ? 0 : (sbm2.fullboard || 130000);
    } else {
      uhRate1 = isDki1 ? 0 : (sbm1.uh || 0);
      uhRate2 = isDki2 ? 0 : (sbm2.uh || 0);
    }
    uhGross1 = (cbUH && !isDki1) ? Math.round(uhRate1 * days1 * effectivePercent) : 0;
    uhGross2 = (cbUH && !isDki2) ? Math.round(uhRate2 * days2 * effectivePercent) : 0;
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
  if (cbHotel && !isDkiNoUh) {
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

