/**
 * js/08-ui/13-reimburse-bbm-ui.js
 * Modul Antarmuka (UI) & Manajemen Reimburse BBM Kendaraan Dinas
 * Khusus Administrator dan Operator Biro Komunikasi Publik TA 2026
 */

window.currentBbmRecord = null;
const BBM_STORAGE_KEY = 'perdinku_bbm_records_v1';

function getBbmStorageList() {
  try {
    const raw = localStorage.getItem(BBM_STORAGE_KEY);
    if (!raw) {
      // Inisialisasi awal dengan sampel resmi template Excel Innova B 2577 KRK
      const sample = getDefaultBbmData();
      localStorage.setItem(BBM_STORAGE_KEY, JSON.stringify([sample]));
      return [sample];
    }
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error('Error reading BBM storage:', err);
    return [getDefaultBbmData()];
  }
}

function saveBbmStorageList(list) {
  try {
    localStorage.setItem(BBM_STORAGE_KEY, JSON.stringify(list || []));
  } catch (err) {
    console.error('Error saving BBM storage:', err);
  }
}

function getActiveBbmRecord() {
  if (!window.currentBbmRecord) {
    const list = getBbmStorageList();
    window.currentBbmRecord = list.length ? list[0] : getDefaultBbmData();
  }
  return window.currentBbmRecord;
}

/**
 * Inisialisasi modul BBM saat pertama kali tab dibuka
 */
function initBbmModule() {
  populateBbmPelaksanaDropdown();
  populateBbmKendaraanPresets();

  const record = getActiveBbmRecord();
  loadBbmRecordIntoForm(record);
  renderBbmHistoryTable();
  updateBbmDocPreview();
}

/**
 * Mengisi dropdown Pelaksana Pertanggungjawaban dari masterPegawai
 */
function populateBbmPelaksanaDropdown() {
  const sel = document.getElementById('bbm_select_pegawai');
  if (!sel) return;

  const currentVal = sel.value;
  sel.innerHTML = '<option value="">-- Pilih dari Database Pegawai (Ketik / Cari) --</option>';

  if (typeof masterPegawai !== 'undefined' && Array.isArray(masterPegawai)) {
    masterPegawai.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nama} (${p.gol || '-'}, NIP: ${p.nip || '-'})`;
      sel.appendChild(opt);
    });
  }

  if (currentVal) sel.value = currentVal;
}

/**
 * Dropdown preset kendaraan dinas
 */
function populateBbmKendaraanPresets() {
  const sel = document.getElementById('bbm_preset_kendaraan');
  if (!sel) return;

  const presets = [
    { label: 'TOYOTA INNOVA B 2577 KRK (Mobil Operasional Utama)', nama: 'TOYOTA INNOVA B 2577 KRK', plat: 'B 2577 KRK' },
    { label: 'TOYOTA AVANZA B 1420 PQ', nama: 'TOYOTA AVANZA B 1420 PQ', plat: 'B 1420 PQ' },
    { label: 'TOYOTA HIACE B 7021 KDA', nama: 'TOYOTA HIACE B 7021 KDA', plat: 'B 7021 KDA' },
    { label: 'MITSUBISHI PAJERO SPORT B 1901 PKP', nama: 'MITSUBISHI PAJERO SPORT B 1901 PKP', plat: 'B 1901 PKP' },
    { label: 'KENDARAAN DINAS OPERASIONAL LAINNYA', nama: 'KENDARAAN DINAS OPERASIONAL BIRO KOMPU', plat: '' }
  ];

  sel.innerHTML = '<option value="">-- Pilih Preset Kendaraan Mobil Dinas --</option>';
  presets.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = p.label;
    sel.appendChild(opt);
  });
}

function onBbmPresetKendaraanChange() {
  const sel = document.getElementById('bbm_preset_kendaraan');
  if (!sel || sel.value === '') return;

  const presets = [
    { nama: 'TOYOTA INNOVA B 2577 KRK', plat: 'B 2577 KRK' },
    { nama: 'TOYOTA AVANZA B 1420 PQ', plat: 'B 1420 PQ' },
    { nama: 'TOYOTA HIACE B 7021 KDA', plat: 'B 7021 KDA' },
    { nama: 'MITSUBISHI PAJERO SPORT B 1901 PKP', plat: 'B 1901 PKP' },
    { nama: 'KENDARAAN DINAS OPERASIONAL BIRO KOMPU', plat: '' }
  ];

  const item = presets[parseInt(sel.value, 10)];
  if (item) {
    const elNama = document.getElementById('bbm_kendaraan');
    const elPlat = document.getElementById('bbm_platNomor');
    if (elNama) elNama.value = item.nama;
    if (elPlat) elPlat.value = item.plat;
    updateBbmUraianOtomatis();
  }
}

function onBbmPelaksanaChange() {
  const sel = document.getElementById('bbm_select_pegawai');
  if (!sel || !sel.value) return;

  const empId = parseInt(sel.value, 10);
  if (typeof masterPegawai !== 'undefined' && Array.isArray(masterPegawai)) {
    const p = masterPegawai.find(x => x.id === empId);
    if (p) {
      const elNama = document.getElementById('bbm_pelaksanaNama');
      const elNip = document.getElementById('bbm_pelaksanaNip');
      const elPanggilan = document.getElementById('bbm_pelaksanaPanggilan');
      if (elNama) elNama.value = p.nama;
      if (elNip) elNip.value = p.nip;
      if (elPanggilan) {
        // Ekstrak nama depan/panggilan (misal: Yogi Pakpahan)
        const parts = p.nama.split(/[\s,]+/);
        elPanggilan.value = parts.length > 2 ? `${parts[0]} ${parts[1]}` : parts[0];
      }
    }
  }
  collectBbmFormData();
  updateBbmDocPreview();
}

function updateBbmUraianOtomatis() {
  const kend = document.getElementById('bbm_kendaraan')?.value || 'TOYOTA INNOVA B 2577 KRK';
  const elPekerjaan = document.getElementById('bbm_pekerjaan');
  const elPekerjaanKuitansi = document.getElementById('bbm_pekerjaanKuitansi');

  if (elPekerjaan) {
    elPekerjaan.value = `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas - ${kend}.`;
  }
  if (elPekerjaanKuitansi) {
    elPekerjaanKuitansi.value = `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas - ${kend}, Output: Perawatan Kendaraan Bermotor.`;
  }

  // Perbarui juga item uraian jika masih default
  const rows = document.querySelectorAll('#bbm_items_body tr');
  rows.forEach(tr => {
    const inputUraian = tr.querySelector('.bbm-item-uraian');
    const jenisBbm = tr.querySelector('.bbm-item-jenis')?.value || 'Pertamina Dex';
    if (inputUraian && (!inputUraian.value || inputUraian.value.startsWith('Pengisian Bahan Bakar Minyak'))) {
      inputUraian.value = `Pengisian Bahan Bakar Minyak (BBM) ${jenisBbm} - Mobil ${kend}`;
    }
  });

  collectBbmFormData();
  updateBbmDocPreview();
}

/**
 * Muat data record ke form input
 */
function loadBbmRecordIntoForm(rec) {
  if (!rec) return;
  window.currentBbmRecord = rec;

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = (v ?? ''); };

  setVal('bbm_tanggalMasuk', rec.tanggalMasuk);
  setVal('bbm_tanggalBukti', rec.tanggalBukti);
  setVal('bbm_tanggalKuitansi', rec.tanggalKuitansi);
  setVal('bbm_pelaksanaNama', rec.pelaksanaNama);
  setVal('bbm_pelaksanaNip', rec.pelaksanaNip);
  setVal('bbm_pelaksanaPanggilan', rec.pelaksanaPanggilan);
  setVal('bbm_namaPenyedia', rec.namaPenyedia || 'Biro Komunikasi Publik');
  setVal('bbm_noBukti', rec.noBukti || '-');
  setVal('bbm_noKuitansi', rec.noKuitansi || '            /KW/Bend/Satker-Setjen/2026');
  setVal('bbm_kendaraan', rec.kendaraan);
  setVal('bbm_platNomor', rec.platNomor);
  setVal('bbm_pekerjaan', rec.pekerjaan);
  setVal('bbm_pekerjaanKuitansi', rec.pekerjaanKuitansi);
  setVal('bbm_akun', rec.akun || '146.01.WA.7665.EBA.994.002.0D.523121');
  setVal('bbm_namaAkun', rec.namaAkun || 'Belanja Pemeliharaan Peralatan dan Mesin');
  setVal('bbm_jenisPengadaan', rec.jenisPengadaan || 'Perawatan Kendaraan Bermotor');
  setVal('bbm_catatan', rec.catatan || '');

  // Pejabat
  setVal('bbm_ppkNama', rec.pejabat?.ppkNama || 'Emanuel Pati Libak, S.Pd., M.T.');
  setVal('bbm_ppkNip', rec.pejabat?.ppkNip || '197512072010121001');
  setVal('bbm_ppspmNama', rec.pejabat?.ppspmNama || 'Mala Hayati Rahayu, S.E');
  setVal('bbm_ppspmNip', rec.pejabat?.ppspmNip || '198408012009122003');
  setVal('bbm_bendaharaNama', rec.pejabat?.bendaharaNama || 'Rahmat H');
  setVal('bbm_bendaharaNip', rec.pejabat?.bendaharaNip || '198004022014081001');
  setVal('bbm_kasubbagTuNama', rec.pejabat?.kasubbagTuNama || 'Ahmad Jayadi, S.Hum., MT.');
  setVal('bbm_kasubbagTuNip', rec.pejabat?.kasubbagTuNip || '198702182010121003');

  // Rincian Struk / Item
  renderBbmItemRows(rec.items || []);
  recalcBbmTotal();
}

/**
 * Render baris tabel struk pembelian BBM
 */
function renderBbmItemRows(items) {
  const tbody = document.getElementById('bbm_items_body');
  if (!tbody) return;

  tbody.innerHTML = '';
  const list = (items && items.length) ? items : [
    {
      tanggal: '2026-11-20',
      uraian: 'Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil Innova B 2577 KRK',
      spbu: 'SPBU Pertamina',
      jenisBbm: 'Pertamina Dex',
      liter: 65,
      jumlah: 1000000
    }
  ];

  list.forEach((item, idx) => {
    appendBbmItemRowHtml(item, idx);
  });
}

function appendBbmItemRowHtml(item = {}, idx = 0) {
  const tbody = document.getElementById('bbm_items_body');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.className = 'bbm-item-row';
  tr.innerHTML = `
    <td class="tc bbm-row-no font-bold">${tbody.children.length + 1}</td>
    <td>
      <input type="date" class="form-control bbm-item-tanggal" value="${item.tanggal || '2026-11-20'}" onchange="onBbmRowFieldChange()">
    </td>
    <td>
      <select class="form-control bbm-item-jenis" onchange="onBbmItemJenisChange(this)">
        <option value="Pertamina Dex" ${item.jenisBbm === 'Pertamina Dex' ? 'selected' : ''}>Pertamina Dex</option>
        <option value="Pertamax Turbo" ${item.jenisBbm === 'Pertamax Turbo' ? 'selected' : ''}>Pertamax Turbo</option>
        <option value="Pertamax" ${item.jenisBbm === 'Pertamax' ? 'selected' : ''}>Pertamax</option>
        <option value="Dexlite" ${item.jenisBbm === 'Dexlite' ? 'selected' : ''}>Dexlite</option>
        <option value="Solar" ${item.jenisBbm === 'Solar' ? 'selected' : ''}>Solar</option>
        <option value="Shell V-Power Diesel" ${item.jenisBbm === 'Shell V-Power Diesel' ? 'selected' : ''}>Shell V-Power Diesel</option>
        <option value="Shell V-Power" ${item.jenisBbm === 'Shell V-Power' ? 'selected' : ''}>Shell V-Power</option>
        <option value="Lainnya" ${item.jenisBbm === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
      </select>
    </td>
    <td>
      <input type="text" class="form-control bbm-item-uraian" value="${item.uraian || 'Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex'}" placeholder="Uraian pengisian & SPBU" oninput="onBbmRowFieldChange()">
    </td>
    <td>
      <input type="number" class="form-control bbm-item-liter tr" value="${item.liter || ''}" placeholder="Liter" oninput="onBbmRowFieldChange()">
    </td>
    <td>
      <input type="text" class="form-control bbm-item-jumlah tr font-bold font-mono" value="${Number(item.jumlah || 0).toLocaleString('id-ID')}" placeholder="0" oninput="onBbmJumlahInput(this)">
    </td>
    <td class="tc">
      <button type="button" class="btn-icon-danger" onclick="removeBbmItemRow(this)" title="Hapus baris ini">
        <svg class="ico"><use href="#i-trash"></use></svg>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
}

function addBbmItemRow() {
  const tgl = document.getElementById('bbm_tanggalBukti')?.value || '2026-11-20';
  const kend = document.getElementById('bbm_kendaraan')?.value || 'Innova B 2577 KRK';
  appendBbmItemRowHtml({
    tanggal: tgl,
    uraian: `Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil ${kend}`,
    jenisBbm: 'Pertamina Dex',
    liter: '',
    jumlah: 0
  });
  recalcBbmTotal();
}

function removeBbmItemRow(btn) {
  const tr = btn.closest('tr');
  const tbody = document.getElementById('bbm_items_body');
  if (tbody && tbody.children.length > 1) {
    tr.remove();
    // Re-index
    Array.from(tbody.children).forEach((r, i) => {
      const tdNo = r.querySelector('.bbm-row-no');
      if (tdNo) tdNo.textContent = i + 1;
    });
    recalcBbmTotal();
  } else {
    alert('Minimal harus ada 1 baris pembelian BBM.');
  }
}

function onBbmItemJenisChange(selectEl) {
  const tr = selectEl.closest('tr');
  const kend = document.getElementById('bbm_kendaraan')?.value || 'TOYOTA INNOVA B 2577 KRK';
  const uraianEl = tr.querySelector('.bbm-item-uraian');
  if (uraianEl && selectEl.value) {
    uraianEl.value = `Pengisian Bahan Bakar Minyak (BBM) ${selectEl.value} - Mobil ${kend}`;
  }
  collectBbmFormData();
  updateBbmDocPreview();
}

function onBbmJumlahInput(inputEl) {
  const raw = inputEl.value.replace(/[^0-9]/g, '');
  const val = parseInt(raw, 10) || 0;
  inputEl.value = val ? val.toLocaleString('id-ID') : '0';
  recalcBbmTotal();
}

function onBbmRowFieldChange() {
  collectBbmFormData();
  updateBbmDocPreview();
}

function recalcBbmTotal() {
  let total = 0;
  document.querySelectorAll('#bbm_items_body .bbm-item-jumlah').forEach(inp => {
    const raw = inp.value.replace(/[^0-9]/g, '');
    total += parseInt(raw, 10) || 0;
  });

  const totalEl = document.getElementById('bbm_grand_total');
  const terbilangEl = document.getElementById('bbm_grand_terbilang');
  const kpiEl = document.getElementById('bbm_kpi_total');

  if (totalEl) totalEl.textContent = formatRupiahMurni(total);
  if (kpiEl) kpiEl.textContent = formatRupiahMurni(total);
  if (terbilangEl) {
    const txt = (typeof terbilang === 'function') ? terbilang(total) : 'Rupiah';
    terbilangEl.textContent = `"${txt}"`;
  }

  collectBbmFormData();
  updateBbmDocPreview();
}

/**
 * Membaca seluruh data formulir menjadi objek record BBM
 */
function collectBbmFormData() {
  const getV = id => document.getElementById(id)?.value || '';

  const items = [];
  let sum = 0;
  document.querySelectorAll('#bbm_items_body tr').forEach((tr, i) => {
    const rawJumlah = tr.querySelector('.bbm-item-jumlah')?.value.replace(/[^0-9]/g, '');
    const jumlah = parseInt(rawJumlah, 10) || 0;
    sum += jumlah;
    items.push({
      id: i + 1,
      tanggal: tr.querySelector('.bbm-item-tanggal')?.value || getV('bbm_tanggalBukti'),
      jenisBbm: tr.querySelector('.bbm-item-jenis')?.value || 'Pertamina Dex',
      uraian: tr.querySelector('.bbm-item-uraian')?.value || 'Pengisian BBM',
      liter: parseFloat(tr.querySelector('.bbm-item-liter')?.value) || 0,
      jumlah: jumlah
    });
  });

  const record = {
    id: window.currentBbmRecord?.id || ('bbm_' + Date.now()),
    tanggalMasuk: getV('bbm_tanggalMasuk'),
    tanggalBukti: getV('bbm_tanggalBukti'),
    tanggalKuitansi: getV('bbm_tanggalKuitansi') || 'Desember 2026',
    pelaksanaNama: getV('bbm_pelaksanaNama'),
    pelaksanaNip: getV('bbm_pelaksanaNip'),
    pelaksanaPanggilan: getV('bbm_pelaksanaPanggilan') || getV('bbm_pelaksanaNama'),
    namaPenyedia: getV('bbm_namaPenyedia') || 'Biro Komunikasi Publik',
    noBukti: getV('bbm_noBukti') || '-',
    noKuitansi: getV('bbm_noKuitansi') || '            /KW/Bend/Satker-Setjen/2026',
    kendaraan: getV('bbm_kendaraan'),
    platNomor: getV('bbm_platNomor'),
    pekerjaan: getV('bbm_pekerjaan'),
    pekerjaanKuitansi: getV('bbm_pekerjaanKuitansi'),
    akun: getV('bbm_akun') || '146.01.WA.7665.EBA.994.002.0D.523121',
    namaAkun: getV('bbm_namaAkun') || 'Belanja Pemeliharaan Peralatan dan Mesin',
    outputKegiatan: 'Perawatan Kendaraan Bermotor',
    jenisPengadaan: getV('bbm_jenisPengadaan') || 'Perawatan Kendaraan Bermotor',
    ta: '2026',
    items: items,
    nilaiTotal: sum,
    catatan: getV('bbm_catatan'),
    status: window.currentBbmRecord?.status || 'selesai',
    pejabat: {
      ppkNama: getV('bbm_ppkNama') || 'Emanuel Pati Libak, S.Pd., M.T.',
      ppkNip: getV('bbm_ppkNip') || '197512072010121001',
      ppspmNama: getV('bbm_ppspmNama') || 'Mala Hayati Rahayu, S.E',
      ppspmNip: getV('bbm_ppspmNip') || '198408012009122003',
      bendaharaNama: getV('bbm_bendaharaNama') || 'Rahmat H',
      bendaharaNip: getV('bbm_bendaharaNip') || '198004022014081001',
      kasubbagTuNama: getV('bbm_kasubbagTuNama') || 'Ahmad Jayadi, S.Hum., MT.',
      kasubbagTuNip: getV('bbm_kasubbagTuNip') || '198702182010121003',
      verifikatorNama: '…......…...........…........................................',
      verifikatorNip: ''
    }
  };

  window.currentBbmRecord = record;
  return record;
}

/**
 * Simpan data BBM saat ini ke riwayat penyimpanan lokal
 */
function saveCurrentBbmRecord() {
  const record = collectBbmFormData();
  const list = getBbmStorageList();
  const existingIdx = list.findIndex(x => x.id === record.id);

  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }

  saveBbmStorageList(list);
  renderBbmHistoryTable();

  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Data BBM Disimpan', `Pengajuan BBM untuk ${record.kendaraan} sebesar ${formatRupiahMurni(record.nilaiTotal)} berhasil disimpan.`);
  }
}

/**
 * Muat sampel Innova B 2577 KRK
 */
function loadBbmSampleData() {
  const sample = getDefaultBbmData();
  sample.id = 'bbm_innova_' + Date.now();
  loadBbmRecordIntoForm(sample);
  saveCurrentBbmRecord();
  updateBbmDocPreview();

  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Contoh Dimuat', 'Data contoh Toyota Innova B 2577 KRK (Rp 1.000.000) berhasil dimuat.');
  }
}

/**
 * Reset form untuk pengajuan baru
 */
function resetBbmForm() {
  const fresh = getDefaultBbmData();
  fresh.id = 'bbm_' + Date.now();
  fresh.kendaraan = '';
  fresh.platNomor = '';
  fresh.pekerjaan = 'Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas.';
  fresh.pekerjaanKuitansi = 'Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas, Output: Perawatan Kendaraan Bermotor.';
  fresh.nilaiTotal = 0;
  fresh.items = [
    {
      tanggal: new Date().toISOString().slice(0, 10),
      uraian: 'Pengisian Bahan Bakar Minyak (BBM)',
      jenisBbm: 'Pertamina Dex',
      liter: '',
      jumlah: 0
    }
  ];

  loadBbmRecordIntoForm(fresh);
  updateBbmDocPreview();
}

/**
 * Render tabel daftar riwayat pengajuan BBM
 */
function renderBbmHistoryTable() {
  const tbody = document.getElementById('bbm_history_tbody');
  const countEl = document.getElementById('bbm_kpi_count');
  if (!tbody) return;

  const list = getBbmStorageList();
  if (countEl) countEl.textContent = list.length;

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="tc bbm-empty-state">
          Belum ada riwayat reimburse BBM tersimpan. Klik "Muat Contoh Struk" atau buat pengajuan baru.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map((item, idx) => {
    const tgl = formatTanggalIndoLengkap(item.tanggalBukti || item.tanggalMasuk);
    return `
      <tr>
        <td class="tc font-bold">${idx + 1}</td>
        <td>
          <strong class="bbm-hist-kendaraan">${item.kendaraan || 'Mobil Dinas'}</strong><br>
          <span class="bbm-hist-plat font-mono">${item.platNomor || '-'}</span>
        </td>
        <td>
          <span class="bbm-hist-pelaksana">${item.pelaksanaNama || item.pelaksanaPanggilan || '-'}</span>
        </td>
        <td class="font-mono">${tgl}</td>
        <td class="tr font-bold font-mono text-success">${formatRupiahMurni(item.nilaiTotal)}</td>
        <td class="tc">
          <span class="badge badge-success">Selesai</span>
        </td>
        <td class="tc bbm-hist-actions">
          <button type="button" class="btn btn-secondary btn-xs" onclick="onBbmHistoryOpen('${item.id}')" title="Buka dan Edit">
            Buka
          </button>
          <button type="button" class="btn btn-primary btn-xs" onclick="onBbmHistoryPrint('${item.id}')" title="Pratinjau Cetak">
            Cetak
          </button>
          <button type="button" class="btn btn-outline btn-xs" onclick="onBbmHistoryExcel('${item.id}')" title="Ekspor Excel">
            Excel
          </button>
          <button type="button" class="btn-icon-danger btn-xs" onclick="onBbmHistoryDelete('${item.id}')" title="Hapus">
            <svg class="ico"><use href="#i-trash"></use></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function onBbmHistoryOpen(id) {
  const list = getBbmStorageList();
  const found = list.find(x => x.id === id);
  if (found) {
    loadBbmRecordIntoForm(found);
    switchBbmTabSubView('form');
    updateBbmDocPreview();
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Berkas Terbuka', `Data BBM untuk ${found.kendaraan} dimuat.`);
    }
  }
}

function onBbmHistoryPrint(id) {
  const list = getBbmStorageList();
  const found = list.find(x => x.id === id);
  if (found) {
    loadBbmRecordIntoForm(found);
    switchBbmTabSubView('docs');
    updateBbmDocPreview();
  }
}

function onBbmHistoryExcel(id) {
  const list = getBbmStorageList();
  const found = list.find(x => x.id === id);
  if (found && typeof exportBbmToExcel === 'function') {
    exportBbmToExcel(found);
  }
}

function onBbmHistoryDelete(id) {
  if (!confirm('Yakin ingin menghapus draf pengajuan BBM ini?')) return;
  let list = getBbmStorageList();
  list = list.filter(x => x.id !== id);
  saveBbmStorageList(list);

  if (window.currentBbmRecord && window.currentBbmRecord.id === id) {
    window.currentBbmRecord = list[0] || getDefaultBbmData();
    loadBbmRecordIntoForm(window.currentBbmRecord);
  }

  renderBbmHistoryTable();
  updateBbmDocPreview();
}

/**
 * Navigasi Sub-Tampilan BBM: 'form' (Formulir & Riwayat) atau 'docs' (Pratinjau Dokumen)
 */
function switchBbmTabSubView(sub) {
  const formWrap = document.getElementById('bbm_sub_form');
  const docsWrap = document.getElementById('bbm_sub_docs');
  const btnForm = document.getElementById('btn_bbm_sub_form');
  const btnDocs = document.getElementById('btn_bbm_sub_docs');

  if (sub === 'docs') {
    if (formWrap) formWrap.style.display = 'none';
    if (docsWrap) docsWrap.style.display = 'block';
    if (btnForm) btnForm.classList.remove('active');
    if (btnDocs) btnDocs.classList.add('active');
    updateBbmDocPreview();
  } else {
    if (formWrap) formWrap.style.display = 'block';
    if (docsWrap) docsWrap.style.display = 'none';
    if (btnForm) btnForm.classList.add('active');
    if (btnDocs) btnDocs.classList.remove('active');
  }
}

/**
 * Filter dokumen pratinjau BBM: 'all', 'checklist', 'kuitansi', 'rincian'
 */
let currentBbmDocFilter = 'all';

function setBbmDocFilter(filter) {
  currentBbmDocFilter = filter;
  document.querySelectorAll('.bbm-doc-nav-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
  });
  updateBbmDocPreview();
}

/**
 * Update render dokumen di panel pratinjau
 */
function updateBbmDocPreview() {
  const previewBox = document.getElementById('bbm_document_render_target');
  if (!previewBox) return;

  const data = collectBbmFormData();

  if (currentBbmDocFilter === 'checklist') {
    previewBox.innerHTML = renderBbmChecklistHtml(data);
  } else if (currentBbmDocFilter === 'kuitansi') {
    previewBox.innerHTML = renderBbmKuitansiHtml(data);
  } else if (currentBbmDocFilter === 'rincian') {
    previewBox.innerHTML = renderBbmRincianHtml(data);
  } else {
    // All
    previewBox.innerHTML = renderBbmAllDocsHtml(data);
  }
}

/**
 * Cetak Dokumen BBM
 */
function printBbmActiveDocument() {
  const data = collectBbmFormData();
  saveCurrentBbmRecord();

  // Pastikan render target siap cetak
  updateBbmDocPreview();
  window.print();
}

/**
 * Ekspor Excel BBM
 */
function downloadBbmExcelCurrent() {
  const data = collectBbmFormData();
  saveCurrentBbmRecord();
  if (typeof exportBbmToExcel === 'function') {
    exportBbmToExcel(data);
  }
}
