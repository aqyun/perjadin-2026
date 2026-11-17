// =====================================================================
// EKSPOR & IMPOR EXCEL (PerdinKu)
// Penyimpanan data dan pembacaan ulang berkas spreadsheet perjalanan
// =====================================================================

// =====================================================================
// SIMPAN / MUAT EXCEL
// =====================================================================
const EXCEL_TRIP_FIELDS = [
  ['Nomor Surat Tugas (ST)', 'noST', 'text'],
  ['Tanggal Surat Tugas', 'tglST', 'date'],
  ['Tanggal SPD', 'tglSPD', 'date'],
  ['Tanggal Berangkat', 'tglBerangkat', 'date'],
  ['Tanggal Kembali', 'tglKembali', 'date'],
  ['Provinsi Tujuan', 'provinsiTujuan', 'select'],
  ['Kota / Kabupaten Tujuan', 'kotaTujuan', 'text'],
  ['Agenda / Maksud Perjalanan', 'agenda', 'text'],
  ['Kode Kegiatan', 'kodeKegiatan', 'text'],
  ['Kode Sub Kegiatan', 'kodeSubKegiatan', 'text'],
  ['MAK', 'mak', 'text'],
  ['Biaya Uang Harian', 'cbUH', 'check'],
  ['Biaya Hotel', 'cbHotel', 'check'],
  ['Biaya DPR', 'cbDPR', 'check'],
  ['Biaya Tiket Pesawat PP', 'cbTiket', 'check'],
  ['Persentase Uang Harian', 'uhPersentase', 'select'],
  ['Nominal DPR Manual', 'dprManual', 'number'],
  ['Jenis Kegiatan', 'jenisKegiatan', 'select'],
  ['Tarif Makan SBM', 'tarifMakan', 'text'],
  ['Hari Disediakan Makan', 'hariMakan', 'number'],
  ['Makan Disediakan per Hari', 'jumlahMakan', 'number'],
  ['Tarif Snack SBM', 'tarifSnack', 'text'],
  ['Hari Disediakan Snack', 'hariSnack', 'number'],
  ['Snack Disediakan per Hari', 'jumlahSnack', 'number'],
  ['Multi-Provinsi', 'cbMultiProvinsi', 'check'],
  ['Provinsi Tujuan 1', 'provinsiTujuan1', 'select'],
  ['Hari di Provinsi 1', 'hariProvinsi1', 'number'],
  ['Provinsi Tujuan 2', 'provinsiTujuan2', 'select'],
  ['Hari di Provinsi 2', 'hariProvinsi2', 'number'],
  ['Konsumsi Perjalanan Biasa', 'cbKonsumsiBiasa', 'check'],
  ['Tarif Makan Manual', 'cbTarifMakanManual', 'check'],
  ['Mode Tarif Makan Manual', 'manualMakanMode', 'text'],
  ['Metode Pembayaran', 'metodePembayaran', 'select'],
  ['Lembar Kendali - Tanggal Masuk Berkas', 'lk_tanggalMasuk', 'date'],
  ['Lembar Kendali - Pelaksana', 'lk_pelaksana', 'text'],
  ['Lembar Kendali - Nomor SPM', 'lk_nomorSPM', 'text'],
  ['Lembar Kendali - Nomor SPD', 'lk_nomorSPD', 'text'],
  ['Lembar Kendali - Jenis Perjalanan', 'lk_jenisPerjalanan', 'select'],
  ['Lembar Kendali - Metode Pembayaran', 'lk_metodePembayaran', 'select']
];

const EXCEL_SETTING_FIELDS = [
  ['Nama Satker', 'cfg_satker'],
  ['Alamat Satker', 'cfg_alamatSatker'],
  ['Kode Satker', 'cfg_kodeSatker'],
  ['Bank dan No. Rekening', 'cfg_bank'],
  ['Nomor Bukti Kuitansi', 'cfg_noBuktiKuitansi'],
  ['Kota Asal', 'cfg_kotaAsal'],
  ['Alamat Kop Kuitansi', 'cfg_alamatKuitansi'],
  ['Output', 'cfg_kegiatan'],
  ['Nama PPK', 'cfg_ppkNama'],
  ['NIP PPK', 'cfg_ppkNip'],
  ['Jabatan PPK', 'cfg_ppkJabatan'],
  ['Nama Bendahara Pengeluaran', 'cfg_bendNama'],
  ['NIP Bendahara', 'cfg_bendNip'],
  ['Nama PP-SPM', 'cfg_ppspmNama'],
  ['NIP PP-SPM', 'cfg_ppspmNip'],
  ['Nama Verifikator PPK', 'cfg_verifikatorNama'],
  ['NIP Verifikator PPK', 'cfg_verifikatorNip'],
  ['Nama Pemegang KKP', 'cfg_kkpNama'],
  ['NIP Pemegang KKP', 'cfg_kkpNip'],
  ['Pangkat/Gol Pemegang KKP', 'cfg_kkpPangkat'],
  ['Jabatan Pemegang KKP', 'cfg_kkpJabatan'],
  ['Unit Kerja Pemegang KKP', 'cfg_kkpUnit'],
  ['Nama di Kartu KKP', 'cfg_kkpKartuNama'],
  ['Nomor Kartu KKP', 'cfg_kkpNomor']
];

const EXCEL_SEGMENT_SLOTS = 5;

function excelPad2(n) {
  return String(n).padStart(2, '0');
}

function excelIsoDate(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date && !isNaN(value)) {
    return `${value.getFullYear()}-${excelPad2(value.getMonth() + 1)}-${excelPad2(value.getDate())}`;
  }
  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value);
    return d ? `${d.y}-${excelPad2(d.m)}-${excelPad2(d.d)}` : '';
  }
  const s = String(value).trim().replace(/^'/, '');
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${excelPad2(m[2])}-${excelPad2(m[3])}`;
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) return `${m[3]}-${excelPad2(m[2])}-${excelPad2(m[1])}`;
  const bulan = {
    januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
    juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agu: 8, ags: 8, sep: 9, okt: 10, nov: 11, des: 12
  };
  m = s.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (m && bulan[m[2]]) return `${m[3]}-${excelPad2(bulan[m[2]])}-${excelPad2(m[1])}`;
  return '';
}

function excelNumber(value) {
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function excelBool(value) {
  return ['ya', 'yes', 'true', '1', 'v', 'y', '√', '✓'].includes(String(value ?? '').trim().toLowerCase());
}

function excelOptionText(select) {
  if (!select.value) return '';
  return (select.selectedOptions[0]?.textContent || select.value).trim();
}

function excelSetSelect(selectId, value) {
  const select = document.getElementById(selectId);
  const text = String(value ?? '').trim();
  if (!select || !text) return false;
  const normalized = text.toLowerCase();
  const options = [...select.options];
  const match = options.find(o => o.value === text)
    || options.find(o => o.textContent.trim().toLowerCase() === normalized)
    || options.find(o => o.textContent.toLowerCase().includes(normalized))
    || options.find(o => normalized.includes(o.textContent.trim().toLowerCase()));
  if (!match) return false;
  select.value = match.value;
  return true;
}

function excelFindEmployee(nama, nip) {
  const nipDigits = String(nip ?? '').replace(/\D/g, '');
  if (nipDigits) {
    const byNip = employees.find(e => e.nip.replace(/\D/g, '') === nipDigits);
    if (byNip) return byNip;
  }
  const norm = String(nama ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!norm) return null;
  return employees.find(e => e.nama.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) || null;
}

function excelSheetRows(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
}

function excelAddSheet(wb, name, rows, widths) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (widths) ws['!cols'] = widths.map(wch => ({ wch }));
  XLSX.utils.book_append_sheet(wb, ws, name);
}

function excelGetCustomCostRows() {
  const kindLabel = { other: 'Biaya lain', tiket: 'Tiket', transport: 'Transport PP' };
  return [...document.querySelectorAll('.custom-cost-row')].map(row => {
    let amounts = {};
    try {
      amounts = JSON.parse(row.dataset.amounts || '{}');
    } catch (error) {
      amounts = {};
    }
    row.querySelectorAll('.custom-cost-amount').forEach(input => {
      amounts[input.dataset.employeeId] = Math.max(0, typeof parseNumber === 'function' ? parseNumber(input.value) : Number(input.value) || 0);
    });
    const kind = row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other';
    return {
      name: row.querySelector('.custom-cost-name').value.trim(),
      kind,
      kindLabel: kindLabel[kind] || 'Biaya lain',
      pickup: row.querySelector('.custom-cost-pickup')?.value.trim() || '',
      dropoff: row.querySelector('.custom-cost-dropoff')?.value.trim() || '',
      amounts
    };
  }).filter(item => item.name);
}

function excelGetHotelRows() {
  return [...document.querySelectorAll('#hotelList .hotel-row')].map(row => ({
    name: row.querySelector('.hotel-name').value.trim(),
    nights: Math.max(0, Number(row.querySelector('.hotel-nights').value) || 0),
    price: Math.max(0, typeof parseNumber === 'function' ? parseNumber(row.querySelector('.hotel-price').value) : Number(row.querySelector('.hotel-price').value) || 0),
    guestIds: [...row.querySelectorAll('.hotel-guest-check:checked')].map(cb => Number(cb.dataset.employeeId))
  })).filter(item => item.name || item.price > 0);
}

function exportPerjadinExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Pustaka Excel (xlsx.full.min.js) tidak termuat. Periksa file di folder aplikasi.');
    return;
  }
  const wb = XLSX.utils.book_new();
  const now = new Date();
  const stamp = `${now.getFullYear()}-${excelPad2(now.getMonth() + 1)}-${excelPad2(now.getDate())} ${excelPad2(now.getHours())}:${excelPad2(now.getMinutes())}`;

  excelAddSheet(wb, 'Info', [
    ['Informasi', 'Nilai'],
    ['Aplikasi', 'Perjadin — Setjen Kementerian PKP'],
    ['Versi format', 1],
    ['Dibuat', stamp],
    ['Cara pakai', 'Ubah isian pada sheet Perjalanan, Pegawai, Biaya Lain, dan Hotel, lalu simpan file ini. Buka kembali aplikasi dan klik "Muat Excel".'],
    ['Format tanggal', 'Gunakan YYYY-MM-DD (contoh 2026-11-14).'],
    ['Pegawai', 'Hapus baris pegawai jika tidak ikut. Kosongkan tanggal per pegawai agar mengikuti tanggal global.'],
    ['Biaya Lain', 'Satu baris = satu pegawai. Nominal per pegawai diisi di kolom terakhir.']
  ], [22, 110]);

  excelAddSheet(wb, 'Perjalanan', [
    ['Keterangan', 'Nilai'],
    ...EXCEL_TRIP_FIELDS.map(([label, id, type]) => {
      const el = document.getElementById(id);
      if (!el) return [label, ''];
      if (type === 'check') return [label, el.checked ? 'Ya' : 'Tidak'];
      if (type === 'select') return [label, excelOptionText(el)];
      return [label, el.value];
    })
  ], [42, 70]);

  const empIds = [...selectedEmpIds].sort((a, b) => a - b);
  const empHeader = ['No', 'Nama', 'NIP', 'Gol', 'Jabatan', 'Nomor SPD Pegawai'];
  for (let i = 1; i <= EXCEL_SEGMENT_SLOTS; i++) empHeader.push(`Tgl Berangkat ${i}`, `Tgl Kembali ${i}`);
  const empRows = empIds.map((id, index) => {
    const emp = employees.find(e => e.id === id);
    const segs = (empTripSegments.get(id) || []).filter(s => s.start && s.end).slice(0, EXCEL_SEGMENT_SLOTS);
    const row = [index + 1, emp?.nama || '', emp?.nip || '', emp?.gol || '', emp?.jabatan || '', spdPerEmployee[id] || ''];
    for (let i = 0; i < EXCEL_SEGMENT_SLOTS; i++) {
      const seg = segs[i];
      row.push(seg ? seg.start : '', seg ? seg.end : '');
    }
    return row;
  });
  const empWidths = [5, 42, 22, 8, 52, 26];
  for (let i = 0; i < EXCEL_SEGMENT_SLOTS; i++) empWidths.push(14, 14);
  excelAddSheet(wb, 'Pegawai', [empHeader, ...empRows], empWidths);

  const costRows = [['No', 'Uraian Biaya', 'Jenis', 'Titik Jemput / Keberangkatan', 'Titik Antar / Kedatangan', 'Pegawai', 'Nominal (Rp)']];
  excelGetCustomCostRows().forEach((cost, index) => {
    if (!empIds.length) {
      costRows.push([index + 1, cost.name, cost.kindLabel, cost.pickup, cost.dropoff, '', 0]);
      return;
    }
    empIds.forEach(id => {
      const emp = employees.find(e => e.id === id);
      costRows.push([index + 1, cost.name, cost.kindLabel, cost.pickup, cost.dropoff, emp?.nama || '', cost.amounts[String(id)] || 0]);
    });
  });
  excelAddSheet(wb, 'Biaya Lain', costRows, [5, 30, 14, 28, 28, 38, 16]);

  const hotelRows = [['No', 'Nama Hotel', 'Malam', 'Harga per Malam (Rp)', 'Pegawai (pisah ";")']];
  excelGetHotelRows().forEach((hotel, index) => {
    const names = hotel.guestIds
      .map(id => employees.find(e => e.id === id)?.nama)
      .filter(Boolean)
      .join('; ');
    hotelRows.push([index + 1, hotel.name, hotel.nights, hotel.price, names]);
  });
  excelAddSheet(wb, 'Hotel', hotelRows, [5, 34, 8, 20, 60]);

  if (typeof getManualMealEntries === 'function') {
    const mealRows = [['No', 'Hari', 'Sesi Makan', 'Tarif (Rp)']];
    getManualMealEntries().forEach((m, idx) => {
      mealRows.push([idx + 1, m.day, m.session, m.price]);
    });
    excelAddSheet(wb, 'Rincian Makan', mealRows, [5, 14, 20, 18]);
  }

  excelAddSheet(wb, 'Pengaturan', [
    ['Keterangan', 'Nilai'],
    ...EXCEL_SETTING_FIELDS.map(([label, id]) => [label, document.getElementById(id)?.value || ''])
  ], [32, 80]);

  const kota = document.getElementById('kotaTujuan').value.trim();
  const tgl = document.getElementById('tglBerangkat').value || '';
  const rawName = `Perjadin_${kota || 'Dinas'}_${tgl || stamp.slice(0, 10)}`;
  const safeName = rawName.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '_');
  XLSX.writeFile(wb, `${safeName}.xlsx`);
}

function importPerjadinExcel(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (typeof XLSX === 'undefined') {
    alert('Pustaka Excel (xlsx.full.min.js) tidak termuat. Periksa file di folder aplikasi.');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const wb = XLSX.read(new Uint8Array(event.target.result), { type: 'array', cellDates: true });
      if (!wb.Sheets['Perjalanan'] || !wb.Sheets['Pegawai']) {
        throw new Error('Sheet "Perjalanan" atau "Pegawai" tidak ditemukan. Gunakan file hasil tombol Simpan Excel.');
      }
      const info = applyPerjadinExcel(wb);
      let message = `Data berhasil dimuat dari Excel (${info.employees} pegawai).`;
      if (info.unknown.length) message += `\n\nPegawai tidak dikenali dan dilewati:\n${info.unknown.join(', ')}`;
      alert(message);
    } catch (error) {
      console.error(error);
      alert('Gagal memuat Excel: ' + error.message);
    } finally {
      input.value = '';
    }
  };
  reader.onerror = () => {
    alert('Gagal membaca file Excel.');
    input.value = '';
  };
  reader.readAsArrayBuffer(file);
}

function applyPerjadinExcel(wb) {
  const unknownNames = [];
  const tripRows = excelSheetRows(wb, 'Perjalanan');
  const tripMap = new Map();
  tripRows.slice(1).forEach(row => {
    const label = String(row[0] ?? '').trim();
    if (label) tripMap.set(label, row[1] ?? '');
  });

  selectedEmpIds.clear();
  empTripSegments.clear();
  spdPerEmployee = {};
  document.getElementById('customCostList').innerHTML = '';
  document.getElementById('hotelList').innerHTML = '';

  EXCEL_TRIP_FIELDS.forEach(([label, id, type]) => {
    if (!tripMap.has(label)) return;
    const value = tripMap.get(label);
    const el = document.getElementById(id);
    if (!el) return;
    if (type === 'check') {
      el.checked = excelBool(value);
    } else if (type === 'select') {
      const found = excelSetSelect(id, value);
      if (found && id === 'provinsiTujuan') changeProvince();
    } else if (type === 'date') {
      el.value = excelIsoDate(value);
    } else if (type === 'number') {
      const num = excelNumber(value);
      el.value = String(value).trim() === '' ? '' : String(num);
    } else {
      el.value = String(value ?? '').trim();
    }
  });

  if (typeof toggleMultiProvinsi === 'function') toggleMultiProvinsi();
  if (typeof toggleUHFields === 'function') toggleUHFields();
  if (typeof toggleKonsumsiFields === 'function') toggleKonsumsiFields();
  if (typeof toggleTarifMakanManual === 'function') toggleTarifMakanManual();

  const mealRows = excelSheetRows(wb, 'Rincian Makan');
  if (mealRows.length > 1 && typeof addManualMealRow === 'function') {
    const list = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
    if (list) list.innerHTML = '';
    mealRows.slice(1).forEach(row => {
      const day = String(row[1] ?? '').trim();
      const session = String(row[2] ?? '').trim();
      const price = Number(row[3]) || 0;
      if (day || price) {
        addManualMealRow(day, session, price);
      }
    });
    if (typeof setManualMealMode === 'function') setManualMealMode('detail');
  } else {
    const loadedMode = document.getElementById('manualMakanMode')?.value || 'flat';
    if (typeof setManualMealMode === 'function') setManualMealMode(loadedMode);
  }

  const loadedMetode = document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS';
  if (typeof onMetodePembayaranChange === 'function') onMetodePembayaranChange(loadedMetode);

  excelSheetRows(wb, 'Pengaturan').slice(1).forEach(row => {
    const label = String(row[0] ?? '').trim();
    const field = EXCEL_SETTING_FIELDS.find(([l]) => l === label);
    if (!field) return;
    const el = document.getElementById(field[1]);
    if (el) el.value = String(row[1] ?? '').trim();
  });

  const empRows = excelSheetRows(wb, 'Pegawai');
  const empHeader = (empRows[0] || []).map(cell => String(cell).trim().toLowerCase());
  const col = name => empHeader.indexOf(name.toLowerCase());
  const cols = {
    nama: col('Nama'), nip: col('NIP'), spd: col('Nomor SPD Pegawai')
  };
  const pairs = [];
  for (let i = 1; i <= 10; i++) {
    const b = col(`Tgl Berangkat ${i}`);
    const k = col(`Tgl Kembali ${i}`);
    if (b >= 0 && k >= 0) pairs.push({ start: b, end: k });
  }
  if (cols.nama >= 0) {
    empRows.slice(1).forEach(row => {
      const emp = excelFindEmployee(row[cols.nama], cols.nip >= 0 ? row[cols.nip] : '');
      if (!emp) {
        const unknown = String(row[cols.nama] ?? '').trim();
        if (unknown) unknownNames.push(unknown);
        return;
      }
      selectedEmpIds.add(emp.id);
      const segs = [];
      pairs.forEach(pair => {
        let start = excelIsoDate(row[pair.start]);
        let end = excelIsoDate(row[pair.end]);
        if (!start && !end) return;
        if (!start) start = end;
        if (!end) end = start;
        if (end < start) end = start;
        segs.push({ start, end });
      });
      if (segs.length) empTripSegments.set(emp.id, segs);
      const noSpd = cols.spd >= 0 ? String(row[cols.spd] ?? '').trim() : '';
      if (noSpd) spdPerEmployee[emp.id] = noSpd;
    });
  }

  renderEmployeeList();
  renderSelectedTags();
  renderTripDates();

  document.getElementById('hotelList').innerHTML = '';
  excelSheetRows(wb, 'Hotel').slice(1).forEach(row => {
    const name = String(row[1] ?? '').trim();
    const nights = excelNumber(row[2]);
    const price = excelNumber(row[3]);
    if (!name && !price) return;
    addHotelRow(nights);
    const hotelRow = document.getElementById('hotelList').lastElementChild;
    hotelRow.querySelector('.hotel-name').value = name;
    hotelRow.querySelector('.hotel-price').value = price ? String(price) : '';
    const guestNames = String(row[4] ?? '')
      .split(';')
      .map(part => part.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(Boolean);
    hotelRow.querySelectorAll('.hotel-guest-check').forEach(cb => {
      const emp = employees.find(e => e.id === Number(cb.dataset.employeeId));
      const norm = (emp?.nama || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      cb.checked = guestNames.includes(norm);
    });
    updateHotelSummary(hotelRow);
  });
  toggleHotelFields();

  const costGroups = new Map();
  excelSheetRows(wb, 'Biaya Lain').slice(1).forEach(row => {
    const name = String(row[1] ?? '').trim();
    if (!name) return;
    const groupKey = `${String(row[0] ?? '').trim()}|${name.toLowerCase()}`;
    if (!costGroups.has(groupKey)) {
      costGroups.set(groupKey, {
        name,
        kindText: String(row[2] ?? '').trim().toLowerCase(),
        pickup: String(row[3] ?? '').trim(),
        dropoff: String(row[4] ?? '').trim(),
        amounts: {}
      });
    }
    const emp = excelFindEmployee(row[5], '');
    if (emp) {
      costGroups.get(groupKey).amounts[emp.id] = excelNumber(row[6]);
    }
  });

  costGroups.forEach(cost => {
    addCustomCost();
    const costRow = document.getElementById('customCostList').lastElementChild;
    const kind = cost.kindText.includes('tiket') ? 'tiket'
      : cost.kindText.includes('transport') ? 'transport' : 'other';
    costRow.dataset.kindAuto = '0';
    costRow.querySelector('.custom-cost-name').value = cost.name;
    applyCustomCostKind(costRow, kind);
    costRow.querySelector('.custom-cost-pickup').value = cost.pickup;
    costRow.querySelector('.custom-cost-dropoff').value = cost.dropoff;
    costRow.dataset.amounts = JSON.stringify(cost.amounts || {});
    renderCustomCostAssignments(costRow);
  });

  hitungLama();
  markDPRManual();
  updateDPRInput();
  if (typeof toggleUHFields === 'function') toggleUHFields();
  toggleKonsumsiFields();
  updateSBMPreview();
  refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();

  // Reset semua status error dan update status filled agar tidak ada merah-merah saat import / revisi / baca
  document.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
  document.querySelectorAll('.field-error-msg.is-visible').forEach(m => m.classList.remove('is-visible'));
  const selBox = document.getElementById('selectedBox');
  if (selBox) selBox.classList.remove('has-error');
  const empErr = document.getElementById('empErrorMsg');
  if (empErr) empErr.classList.remove('is-visible');
  if (typeof hideValidationToast === 'function') hideValidationToast();

  if (typeof updateFieldFilledStatus === 'function') {
    REQUIRED_FIELDS.forEach(f => {
      const el = document.getElementById(f.id);
      if (el) updateFieldFilledStatus(el);
    });
    ['provinsiTujuan1', 'provinsiTujuan2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) updateFieldFilledStatus(el);
    });
  }

  const activeTab = document.querySelector('.tab-content.active');
  if (activeTab && activeTab.id.startsWith('tab-')) {
    const tabName = activeTab.id.slice(4);
    if (tabName !== 'input') {
      if (typeof switchTabPanel === 'function') switchTabPanel(tabName);
    }
  }
  return { employees: selectedEmpIds.size, unknown: unknownNames };
}
