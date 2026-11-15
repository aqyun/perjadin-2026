// =====================================================================
// SBM & PERHITUNGAN BIAYA (PerdinKu)
// Perhitungan uang harian, hotel, transportasi, DPR, dan tarif SBM
// =====================================================================

// =====================================================================
// SBM & LAMA TUGAS
// =====================================================================
function getSBM() {
  const id = parseInt(document.getElementById('provinsiTujuan').value);
  return sbmData.find(s => s.id === id) || null;
}

const PROVINSI_AKRONIM = new Set(['DKI', 'D.I.']);

function formatProvinsi(nama) {
  return String(nama || '')
    .split(/\s+/)
    .map(word => PROVINSI_AKRONIM.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
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

function changeProvince() {
  saveProvinceFoodRates();
  currentRateProvinceId = document.getElementById('provinsiTujuan').value;
  const rates = provinceFoodRates[currentRateProvinceId] || {};
  document.getElementById('tarifMakan').value = rates.makan || 0;
  document.getElementById('tarifSnack').value = rates.snack || 0;
  document.getElementById('dprManual').value = '';
  const cbDPR = document.getElementById('cbDPR');
  if (getSBM()?.provinsi === 'DKI JAKARTA' && !cbDPR.checked) {
    cbDPR.checked = true;
    dprAutoCheckedForDki = true;
  } else if (getSBM()?.provinsi !== 'DKI JAKARTA' && dprAutoCheckedForDki) {
    cbDPR.checked = false;
    dprAutoCheckedForDki = false;
  }
  updateDPRInput();
  updateSBMPreview();
  updateSbmWarnings();
}

function markDPRManual() {
  dprAutoCheckedForDki = false;
}

function updateDPRInput() {
  const sbm = getSBM();
  const isDkiJakarta = sbm?.provinsi === 'DKI JAKARTA';
  const isDprChecked = document.getElementById('cbDPR').checked;
  document.getElementById('dprManualField').style.display = isDprChecked && sbm && !isDkiJakarta ? 'block' : 'none';
}

function saveProvinceFoodRates() {
  if (!currentRateProvinceId) return;
  provinceFoodRates[currentRateProvinceId] = {
    makan: Math.max(0, Number(document.getElementById('tarifMakan').value) || 0),
    snack: Math.max(0, Number(document.getElementById('tarifSnack').value) || 0)
  };
  localStorage.setItem('provinceFoodRates', JSON.stringify(provinceFoodRates));
}

function toggleKonsumsiFields() {
  document.getElementById('konsumsiFields').style.display =
    document.getElementById('jenisKegiatan').value === 'rapat' ? 'grid' : 'none';
}

function toggleHotelFields() {
  const checked = document.getElementById('cbHotel').checked;
  document.getElementById('hotelFields').style.display = checked ? 'grid' : 'none';
  if (checked && !document.querySelectorAll('#hotelList .hotel-row').length) {
    addHotelRow(getDays().nights || 1);
  }
}

function addHotelRow(nights = 1) {
  const row = document.createElement('div');
  row.className = 'hotel-row';
  row.innerHTML = `
    <label class="hotel-field"><span>Nama hotel (opsional)</span><input type="text" class="hotel-name" placeholder="Contoh: Hotel Nusa Dua"></label>
    <label class="hotel-field hotel-field-nights"><span>Malam</span><input type="number" class="hotel-nights" min="0" step="1" value="${nights}"></label>
    <label class="hotel-field"><span>Harga per malam (Rp)</span><input type="number" class="hotel-price" min="0" step="1000" placeholder="Isi harga manual"></label>
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
  const el = row.querySelector('.hotel-summary');
  if (!el) return;
  const nights = Math.max(0, Number(row.querySelector('.hotel-nights').value) || 0);
  const price = Math.max(0, Number(row.querySelector('.hotel-price').value) || 0);
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
    name: row.querySelector('.hotel-name').value.trim(),
    nights: Math.max(0, Number(row.querySelector('.hotel-nights').value) || 0),
    price: Math.max(0, Number(row.querySelector('.hotel-price').value) || 0),
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
    <div class="form-group">
      <label>Nama biaya</label>
      <input type="text" class="custom-cost-name" placeholder="Contoh: Grab, Tol, atau Tiket kapal" oninput="detectCustomCostKind(this)">
      <div class="custom-kind" role="group" aria-label="Kelompok biaya">
        <button type="button" class="custom-kind-btn active" data-kind="other" aria-pressed="true" onclick="setCustomCostKind(this)">Biaya lain</button>
        <button type="button" class="custom-kind-btn" data-kind="tiket" aria-pressed="false" onclick="setCustomCostKind(this)">Tiket</button>
        <button type="button" class="custom-kind-btn" data-kind="transport" aria-pressed="false" onclick="setCustomCostKind(this)">Transport PP</button>
      </div>
      <div class="custom-route">
        <span class="custom-route-title">Keterangan rute (opsional)</span>
        <div class="custom-route-fields">
          <label class="custom-route-field custom-route-pickup"><span class="custom-route-label-pickup">Titik jemput</span><input type="text" class="custom-cost-pickup" placeholder="Contoh: Stasiun Gambir"></label>
          <label class="custom-route-field custom-route-dropoff"><span class="custom-route-label-dropoff">Titik antar</span><input type="text" class="custom-cost-dropoff" placeholder="Contoh: Rumah"></label>
        </div>
      </div>
    </div>
    <div class="custom-cost-assignees"></div>
    <button class="btn btn-warn btn-sm" type="button" onclick="removeCustomCostRow(this)">Hapus</button>
  `;
  document.getElementById('customCostList').appendChild(row);
  renderCustomCostAssignments(row);
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

  dropoffField.style.display = isToll ? 'none' : '';
  fields.classList.toggle('single', isToll);
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
    currentAmounts[input.dataset.employeeId] = input.value;
  });
  row.dataset.amounts = JSON.stringify(currentAmounts);

  if (selectedEmpIds.size === 0) {
    assignments.innerHTML = '<div class="custom-cost-empty">Pilih pegawai untuk mengatur nominal per orang.</div>';
    return;
  }

  assignments.innerHTML = [...selectedEmpIds].map(id => {
    const emp = employees.find(employee => employee.id === id);
    return `
      <label class="custom-cost-assignee">
        <span>${emp.nama}</span>
        <input type="number" class="custom-cost-amount" data-employee-id="${id}" min="0" step="1000" value="${currentAmounts[id] ?? 0}" oninput="updateCustomCostAmount(this)" aria-label="Biaya ${row.querySelector('.custom-cost-name').value || 'tambahan'} untuk ${emp.nama}">
      </label>
    `;
  }).join('');
}

function updateCustomCostAmount(input) {
  const row = input.closest('.custom-cost-row');
  let amounts = {};
  try {
    amounts = JSON.parse(row.dataset.amounts || '{}');
  } catch (error) {
    amounts = {};
  }
  amounts[input.dataset.employeeId] = input.value;
  row.dataset.amounts = JSON.stringify(amounts);
}

function refreshCustomCostAssignments() {
  document.querySelectorAll('.custom-cost-row').forEach(renderCustomCostAssignments);
}

function getCustomCosts() {
  return [...document.querySelectorAll('.custom-cost-row')].map(row => {
    const name = row.querySelector('.custom-cost-name').value.trim();
    const kind = row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other';
    const isToll = kind === 'transport' && TOLL_COST_RE.test(name);
    return {
      name,
      kind,
      pickup: row.querySelector('.custom-cost-pickup')?.value.trim() || '',
      dropoff: isToll ? '' : row.querySelector('.custom-cost-dropoff')?.value.trim() || '',
      amounts: Object.fromEntries([...row.querySelectorAll('.custom-cost-amount')].map(input => [
        input.dataset.employeeId,
        Math.max(0, Number(input.value) || 0)
      ]))
    };
  }).filter(item => item.name);
}

function updateSBMPreview() {
  const sbm = getSBM();
  const pv = document.getElementById('sbmPreview');
  if (!sbm) { pv.style.display = 'none'; return; }
  pv.style.display = 'block';
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';
  document.getElementById('sbm_uh').textContent = isDkiJakarta ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.uh);
  document.getElementById('sbm_h4').textContent = rp(sbm.h4);
  document.getElementById('sbm_h3').textContent = rp(sbm.h3);
  document.getElementById('sbm_jkt').textContent = sbm.jktPP ? rp(sbm.jktPP) : '(tidak ada/dalam kota)';
  document.getElementById('sbm_taxi').textContent = sbm.taxi ? rp(sbm.taxi) : '-';
  const manualDpr = Number(document.getElementById('dprManual').value) || 0;
  document.getElementById('sbm_dpr').textContent = isDkiJakarta ? `${rp(170000)} (otomatis)` : manualDpr ? rp(manualDpr) : '(isi manual)';
  document.getElementById('sbm_tiket').textContent = sbm.tiket ? rp(sbm.tiket) : '(tidak ada tiket pesawat)';
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
    const cbDPR = document.getElementById('cbDPR').checked;
    const cbTiket = document.getElementById('cbTiket').checked;
    const customCosts = getCustomCosts();
    const dprBase = cbDPR ? (sbm.provinsi === 'DKI JAKARTA' ? 170000 : Number(document.getElementById('dprManual').value) || 0) : 0;

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
  if (typeof renderTripDates === 'function') renderTripDates();
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
  if (!sbm) return { uh: 0, uhGross: 0, mealDeduction: 0, snackDeduction: 0, hotel: 0, representatif: 0, representatifRate: 0, dpr: 0, tiket: 0, customCosts, total: customTotal };
  const { days, nights } = getEmpDays(emp.id);
  const cbUH = document.getElementById('cbUH').checked;
  const cbHotel = document.getElementById('cbHotel').checked;
  const cbDPR = document.getElementById('cbDPR').checked;
  const cbTiket = document.getElementById('cbTiket').checked;
  const uhPercent = Number(document.getElementById('uhPersentase').value) || 1;
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';
  const uhGross = cbUH && !isDkiJakarta ? sbm.uh * days * uhPercent : 0;
  const isMeeting = document.getElementById('jenisKegiatan').value === 'rapat';
  const mealRequested = isMeeting ? (Number(document.getElementById('tarifMakan').value) || 0) * (Number(document.getElementById('jumlahMakan').value) || 0) * days : 0;
  const snackRequested = isMeeting ? (Number(document.getElementById('tarifSnack').value) || 0) * (Number(document.getElementById('jumlahSnack').value) || 0) * days : 0;
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
  const dprVal = cbDPR ? (isDkiJakarta ? 170000 : Number(document.getElementById('dprManual').value) || 0) : 0;
  const tiketVal = cbTiket ? sbm.tiket : 0;
  return { uh, uhGross, mealDeduction, snackDeduction, hotel, hotelDetails, representatif, representatifRate, dpr: dprVal, tiket: tiketVal, customCosts, total: uh + hotel + representatif + dprVal + tiketVal + customTotal };
}
