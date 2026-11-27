/**
 * js/08-ui/13-reimburse-bbm-ui.js
 * Modul Antarmuka (UI) & Manajemen Reimburse BBM Kendaraan Dinas & Pribadi
 * Khusus Administrator dan Operator Biro Komunikasi Publik TA 2026
 * Mendukung Multi-Struk BBM & Pilihan Mobil Dinas vs Mobil Pribadi
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
 * Preset Armada Mobil Dinas Operasional Kantor
 */
const BBM_KENDARAAN_PRESETS = [
  { nama: 'TOYOTA INNOVA B 2577 KRK', plat: 'B 2577 KRK', label: 'Innova Operasional (B 2577 KRK)' },
  { nama: 'TOYOTA HIACE B 7123 PKP', plat: 'B 7123 PKP', label: 'Hiace Operasional (B 7123 PKP)' },
  { nama: 'MITSUBISHI XPANDER B 1945 RKP', plat: 'B 1945 RKP', label: 'Xpander Operasional (B 1945 RKP)' },
  { nama: 'custom', plat: '', label: '-- Input Mobil Manual / Lainnya --' }
];

function populateBbmKendaraanPresets() {
  const sel = document.getElementById('bbm_preset_kendaraan');
  if (!sel) return;
  const currentPlat = document.getElementById('bbm_platNomor')?.value || 'B 2577 KRK';
  sel.innerHTML = BBM_KENDARAAN_PRESETS.map(p => {
    const isSel = (p.plat && currentPlat.toUpperCase().includes(p.plat.toUpperCase())) ? 'selected' : '';
    return `<option value="${p.plat}" ${isSel}>${p.label}</option>`;
  }).join('');
}

function onBbmPresetKendaraanChange() {
  const sel = document.getElementById('bbm_preset_kendaraan');
  if (!sel) return;
  const found = BBM_KENDARAAN_PRESETS.find(p => p.plat === sel.value);
  if (found && found.plat) {
    const elKend = document.getElementById('bbm_kendaraan');
    const elPlat = document.getElementById('bbm_platNomor');
    if (elKend) elKend.value = found.nama;
    if (elPlat) elPlat.value = found.plat;
    updateBbmUraianOtomatis();
  }
}

function populateBbmPelaksanaDropdown() {
  const sel = document.getElementById('bbm_select_pegawai');
  if (!sel) return;

  const currentPel = document.getElementById('bbm_pelaksanaNama')?.value || '';
  const pelakuList = (typeof getAvailablePelakuList === 'function') ? getAvailablePelakuList() : [];

  let html = '<option value="">-- Pilih dari Database Pegawai --</option>';
  pelakuList.forEach(p => {
    const isSel = (currentPel && p.nama && currentPel.includes(p.nama.split(',')[0]));
    html += `<option value="${p.nama}" data-nip="${p.nip || ''}" ${isSel ? 'selected' : ''}>${p.nama}</option>`;
  });

  sel.innerHTML = html;
}

function onBbmPelaksanaChange() {
  const sel = document.getElementById('bbm_select_pegawai');
  if (!sel || !sel.value) return;

  const opt = sel.options[sel.selectedIndex];
  const nama = sel.value;
  const nip = opt ? (opt.getAttribute('data-nip') || '') : '';

  const elNama = document.getElementById('bbm_pelaksanaNama');
  const elNip = document.getElementById('bbm_pelaksanaNip');
  const elPanggil = document.getElementById('bbm_pelaksanaPanggilan');

  if (elNama) elNama.value = nama;
  if (elNip && nip) elNip.value = nip;
  if (elPanggil) {
    const parts = nama.split(/[\s,]+/);
    elPanggil.value = parts.length > 2 ? `${parts[0]} ${parts[1]}` : parts[0];
  }

  onBbmRowFieldChange();
}

function onBbmKategoriChange(val) {
  const isPribadi = val === 'pribadi';
  const pribadiWrap = document.getElementById('bbm_pribadi_fields');
  const presetWrap = document.getElementById('bbm_preset_wrap');
  const lblKend = document.getElementById('bbm_lbl_kendaraan');
  const hintKend = document.getElementById('bbm_hint_kendaraan');

  if (pribadiWrap) pribadiWrap.style.display = isPribadi ? 'block' : 'none';
  if (presetWrap) presetWrap.style.display = isPribadi ? 'none' : 'block';

  if (lblKend) {
    lblKend.textContent = isPribadi ? 'Nama & Jenis Kendaraan Pribadi *' : 'Nama & Jenis Kendaraan Dinas *';
  }
  if (hintKend) {
    hintKend.textContent = isPribadi ? 'Merk dan tipe kendaraan pribadi' : 'Merk dan tipe kendaraan dinas operasional';
  }

  checkBbmDecemberRule();
  updateBbmUraianOtomatis();
}

/**
 * Inisialisasi modul BBM saat pertama kali tab dibuka
 */
function initBbmModule() {
  try {
    populateBbmSptDropdown();
    populateBbmPelaksanaDropdown();
    populateBbmKendaraanPresets();

    const record = getActiveBbmRecord();
    loadBbmRecordIntoForm(record);
    renderBbmHistoryTable();
    checkBbmDecemberRule();
    updateBbmDocPreview();
  } catch (err) {
    console.error('Error initializing BBM module:', err);
  } finally {
    if (typeof hidePageLoader === 'function') {
      hidePageLoader();
    }
  }
}

/**
 * Dropdown pemilih Surat Tugas (SPT) dari form aktif atau arsip riwayat cloud
 */
function populateBbmSptDropdown() {
  const sel = document.getElementById('bbm_spt_selector');
  if (!sel) return;

  const currentVal = sel.value;
  const noSTAktif = (typeof document !== 'undefined' && (document.getElementById('noST')?.value || document.getElementById('noSTNum')?.value)) || '';
  sel.innerHTML = `<option value="active">-- SPT Aktif pada Formulir Input (${noSTAktif || 'Sedang diedit'}) --</option>`;

  if (typeof getTripHistoryList === 'function') {
    const trips = getTripHistoryList();
    trips.forEach(t => {
      if (!t || !t.id) return;
      const no = t.noST || 'Tanpa No ST';
      const ag = t.agenda ? (t.agenda.length > 45 ? t.agenda.slice(0, 45) + '...' : t.agenda) : '';
      const tgl = t.tglBerangkat ? formatTanggalIndoLengkap(t.tglBerangkat) : '';
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${no} - ${ag} ${tgl ? '(' + tgl + ')' : ''}`;
      sel.appendChild(opt);
    });
  }

  if (currentVal && Array.from(sel.options).some(o => o.value === currentVal)) {
    sel.value = currentVal;
  }
}

/**
 * Event handler saat user memilih SPT di selector
 */
function onBbmSptSelectorChange() {
  const sel = document.getElementById('bbm_spt_selector');
  if (!sel) return;

  if (sel.value === 'active') {
    syncBbmFromActiveSpt(true);
    return;
  }

  if (typeof getTripHistoryList === 'function') {
    const trips = getTripHistoryList();
    const trip = trips.find(t => t.id === sel.value);
    if (trip) {
      const bbmData = trip.bbmData || (trip.draft && trip.draft.bbmData);
      if (bbmData) {
        loadBbmRecordIntoForm(bbmData);
      } else {
        // Tautkan data dari trip yang dipilih
        const elNo = document.getElementById('bbm_spt_no_lbl');
        if (elNo) elNo.textContent = trip.noST || '-';

        const pel = (trip.draft && trip.draft.fields && trip.draft.fields.lk_pelaksana) || trip.lk_pelaksana || '';
        if (pel) {
          const elPel = document.getElementById('bbm_pelaksanaNama');
          if (elPel) elPel.value = pel;
          const elPelLbl = document.getElementById('bbm_spt_pelaksana_lbl');
          if (elPelLbl) elPelLbl.textContent = pel;
        }

        if (window.currentBbmRecord) {
          window.currentBbmRecord.noST = trip.noST;
          window.currentBbmRecord.agenda = trip.agenda;
          window.currentBbmRecord.tanggalBerangkat = trip.tglBerangkat;
          window.currentBbmRecord.tanggalKembali = trip.tglKembali;
        }

        updateBbmUraianOtomatis();
      }

      checkBbmDecemberRule();
      updateBbmDocPreview();
      if (typeof showRefreshToast === 'function') {
        showRefreshToast('SPT Dimuat', `Memuat data BBM terkait ST: ${trip.noST}`);
      }
    }
  }
}

/**
 * Sinkronisasi data BBM langsung dari form SPT aktif di aplikasi
 */
function syncBbmFromActiveSpt(showToast = true) {
  const getV = id => document.getElementById(id)?.value || '';
  const noST = getV('noST') || getV('noSTNum') || '395/ST/Sj.07/2026';
  const agenda = getV('agenda') || 'Pembuatan Video Dokumenter dan Pengambilan Footage Penerima Manfaat Bedah Rumah BSPS di Pulau Lancang, Kel. Pulau Pari, Kab. Kepulauan Seribu';
  const tglBerangkat = getV('tglBerangkat') || '2026-10-14';
  const tglKembali = getV('tglKembali') || '2026-10-16';
  const pelaksana = getV('lk_pelaksana') || 'Yogi Andre Yonatan Pakpahan, S.P.W.K';

  // 1. Pelaksana Pertanggungjawaban BBM sama persis dengan pembuat berkas perjadin
  const elPelNama = document.getElementById('bbm_pelaksanaNama');
  const elPelNip = document.getElementById('bbm_pelaksanaNip');
  const elPelPanggil = document.getElementById('bbm_pelaksanaPanggilan');
  if (elPelNama) elPelNama.value = pelaksana;
  if (elPelPanggil) {
    const parts = pelaksana.split(/[\s,]+/);
    elPelPanggil.value = parts.length > 2 ? `${parts[0]} ${parts[1]}` : parts[0];
  }

  // Cari NIP dari database jika belum terisi
  if (typeof masterPegawai !== 'undefined' && Array.isArray(masterPegawai)) {
    const matchedP = masterPegawai.find(p => p.nama && pelaksana.includes(p.nama.split(',')[0]));
    if (matchedP && elPelNip && matchedP.nip) {
      elPelNip.value = matchedP.nip;
    }
  }

  // 2. Tanggal berkas
  const elTglMasuk = document.getElementById('bbm_tanggalMasuk');
  const elTglBukti = document.getElementById('bbm_tanggalBukti');
  if (elTglMasuk && tglKembali) elTglMasuk.value = tglKembali;
  if (elTglBukti && tglBerangkat) elTglBukti.value = tglBerangkat;

  // 3. Ringkasan banner
  const noLbl = document.getElementById('bbm_spt_no_lbl');
  const pelLbl = document.getElementById('bbm_spt_pelaksana_lbl');
  if (noLbl) noLbl.textContent = noST;
  if (pelLbl) pelLbl.textContent = pelaksana;

  if (window.currentBbmRecord) {
    window.currentBbmRecord.noST = noST;
    window.currentBbmRecord.agenda = agenda;
    window.currentBbmRecord.tanggalBerangkat = tglBerangkat;
    window.currentBbmRecord.tanggalKembali = tglKembali;
    window.currentBbmRecord.pelaksanaNama = pelaksana;
  }

  updateBbmUraianOtomatis();

  // 4. Re-render item rows agar dropdown personil menyesuaikan pegawai di ST ini
  const currentItems = collectBbmFormData().items;
  renderBbmItemRows(currentItems);

  checkBbmDecemberRule();
  updateBbmDocPreview();

  if (showToast && typeof showRefreshToast === 'function') {
    showRefreshToast('SPT Ditautkan', `BBM berhasil dihubungkan dengan ST: ${noST}`);
  }
}

/**
 * Validasi Aturan 2: Larangan Penggantian BBM Kendaraan Pribadi per 1 Desember 2026
 */
function checkBbmDecemberRule() {
  const kat = document.getElementById('bbm_kategoriKendaraan')?.value || 'dinas';
  const banner = document.getElementById('bbm_rule_december_banner');
  const badgeKategori = document.getElementById('bbm_kategori_badge');
  const isPribadi = kat === 'pribadi';

  if (!isPribadi) {
    if (banner) banner.style.display = 'none';
    if (badgeKategori) {
      badgeKategori.textContent = 'Mobil Dinas';
      badgeKategori.className = 'badge badge-success';
    }
    return true;
  }

  // Cek tanggal bukti struk atau tanggal pelaksanaan
  const dates = [];
  const tglBukti = document.getElementById('bbm_tanggalBukti')?.value;
  const tglMasuk = document.getElementById('bbm_tanggalMasuk')?.value;
  if (tglBukti) dates.push(tglBukti);
  if (tglMasuk) dates.push(tglMasuk);

  document.querySelectorAll('#bbm_items_body .bbm-item-tanggal').forEach(inp => {
    if (inp.value) dates.push(inp.value);
  });

  const isAfterOrOnDec1 = dates.some(d => d >= '2026-12-01');

  if (isAfterOrOnDec1) {
    if (banner) banner.style.display = 'block';
    if (badgeKategori) {
      badgeKategori.textContent = 'Mobil Pribadi (DILARANG per 1 Des 2026)';
      badgeKategori.className = 'badge badge-danger';
    }
    return false;
  } else {
    if (banner) banner.style.display = 'none';
    if (badgeKategori) {
      badgeKategori.textContent = 'Mobil Pribadi (Diperkenankan s.d. 30 Nov 2026)';
      badgeKategori.className = 'badge badge-warning';
    }
    return true;
  }
}

/**
 * Dapatkan daftar personil pegawai yang tersedia untuk menjadi pelaku pembelian BBM
 */
function getAvailablePelakuList() {
  const list = [];
  const seen = new Set();

  // 1. Pegawai terpilih dari SPT aktif di formulir
  if (typeof selectedEmpIds !== 'undefined' && selectedEmpIds && typeof employees !== 'undefined') {
    selectedEmpIds.forEach(id => {
      const emp = employees.find(e => e.id === id);
      if (emp && emp.nama && !seen.has(emp.nama)) {
        seen.add(emp.nama);
        list.push({ nama: emp.nama, nip: emp.nip || '', gol: emp.golongan || emp.gol || '' });
      }
    });
  }

  // 2. Pelaksana pertanggungjawaban dari lk_pelaksana
  const pel = document.getElementById('lk_pelaksana')?.value || document.getElementById('bbm_pelaksanaNama')?.value;
  if (pel && !seen.has(pel)) {
    seen.add(pel);
    list.unshift({ nama: pel, nip: document.getElementById('bbm_pelaksanaNip')?.value || '', gol: '' });
  }

  // 3. Pegawai dari masterPegawai jika list masih sedikit
  if (typeof masterPegawai !== 'undefined' && Array.isArray(masterPegawai)) {
    masterPegawai.forEach(p => {
      if (p.nama && !seen.has(p.nama)) {
        seen.add(p.nama);
        list.push({ nama: p.nama, nip: p.nip || '', gol: p.gol || '' });
      }
    });
  }

  return list;
}


function updateBbmUraianOtomatis() {
  const selKategori = document.getElementById('bbm_kategoriKendaraan');
  const isPribadi = (selKategori && selKategori.value === 'pribadi');
  const kend = document.getElementById('bbm_kendaraan')?.value || (isPribadi ? 'TOYOTA INNOVA ZENIX' : 'TOYOTA INNOVA B 2577 KRK');
  const plat = document.getElementById('bbm_platNomor')?.value || '';
  const elPekerjaan = document.getElementById('bbm_pekerjaan');
  const elPekerjaanKuitansi = document.getElementById('bbm_pekerjaanKuitansi');

  const platSfx = plat ? ` (${plat})` : '';

  if (elPekerjaan) {
    elPekerjaan.value = isPribadi
      ? `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Pribadi - ${kend}${platSfx}.`
      : `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas - ${kend}.`;
  }

  // Format Aturan 1 Kuitansi: "Pembelian BBM untuk kegiatan perjalanan dinas dalam rangka (...) tanggal (...) dengan Nomor ST (...)."
  const agenda = (document.getElementById('agenda')?.value || window.currentBbmRecord?.agenda || '').trim();
  const noST = (document.getElementById('noST')?.value || document.getElementById('noSTNum')?.value || window.currentBbmRecord?.noST || '').trim();
  const tglAwal = document.getElementById('tglBerangkat')?.value || window.currentBbmRecord?.tanggalBerangkat || document.getElementById('bbm_tanggalBukti')?.value;
  const tglAkhir = document.getElementById('tglKembali')?.value || window.currentBbmRecord?.tanggalKembali || tglAwal;

  let tglRentang = '';
  if (tglAwal && tglAkhir && tglAwal !== tglAkhir) {
    tglRentang = `${formatTanggalIndoLengkap(tglAwal)} s.d. ${formatTanggalIndoLengkap(tglAkhir)}`;
  } else if (tglAwal) {
    tglRentang = formatTanggalIndoLengkap(tglAwal);
  } else {
    tglRentang = formatTanggalIndoLengkap(document.getElementById('bbm_tanggalBukti')?.value || '2026-11-20');
  }

  if (elPekerjaanKuitansi) {
    if (agenda || noST) {
      elPekerjaanKuitansi.value = `Pembelian BBM untuk kegiatan perjalanan dinas dalam rangka ${agenda || '...'} tanggal ${tglRentang} dengan Nomor ST ${noST || '...'}.`;
    } else {
      elPekerjaanKuitansi.value = isPribadi
        ? `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Pribadi - ${kend}${platSfx}, Output: Perawatan Kendaraan Bermotor.`
        : `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas - ${kend}, Output: Perawatan Kendaraan Bermotor.`;
    }
  }

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

  const kat = rec.kategoriKendaraan || 'dinas';
  const selKat = document.getElementById('bbm_kategoriKendaraan');
  if (selKat) selKat.value = kat;

  setVal('bbm_tanggalMasuk', rec.tanggalMasuk);
  setVal('bbm_tanggalBukti', rec.tanggalBukti);
  setVal('bbm_tanggalKuitansi', rec.tanggalKuitansi);
  setVal('bbm_nomorSPM', rec.nomorSPM || '-');
  setVal('bbm_nomorSPD', rec.nomorSPD || '-');
  setVal('bbm_pelaksanaNama', rec.pelaksanaNama);
  setVal('bbm_pelaksanaNip', rec.pelaksanaNip);
  setVal('bbm_pelaksanaPanggilan', rec.pelaksanaPanggilan);
  setVal('bbm_pemilikMobil', rec.pemilikMobil || '');
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

  // Update banner SPT summary
  const elNo = document.getElementById('bbm_spt_no_lbl');
  const elPel = document.getElementById('bbm_spt_pelaksana_lbl');
  if (elNo && rec.noST) elNo.textContent = rec.noST;
  if (elPel && rec.pelaksanaNama) elPel.textContent = rec.pelaksanaNama;

  // Pejabat
  setVal('bbm_ppkNama', rec.pejabat?.ppkNama || 'Emanuel Pati Libak, S.Pd., M.T.');
  setVal('bbm_ppkNip', rec.pejabat?.ppkNip || '197512072010121001');
  setVal('bbm_ppspmNama', rec.pejabat?.ppspmNama || 'Mala Hayati Rahayu, S.E');
  setVal('bbm_ppspmNip', rec.pejabat?.ppspmNip || '198408012009122003');
  setVal('bbm_bendaharaNama', rec.pejabat?.bendaharaNama || 'Rahmat H');
  setVal('bbm_bendaharaNip', rec.pejabat?.bendaharaNip || '198004022014081001');
  setVal('bbm_kasubbagTuNama', rec.pejabat?.kasubbagTuNama || 'Ahmad Jayadi, S.Hum., MT.');
  setVal('bbm_kasubbagTuNip', rec.pejabat?.kasubbagTuNip || '198702182010121003');

  if (typeof onBbmKategoriChange === 'function') {
    onBbmKategoriChange(kat);
  }

  // Rincian Struk / Item (Mendukung Multi-Struk & Multi-Pelaksana)
  renderBbmItemRows(rec.items || []);
  checkBbmDecemberRule();
  recalcBbmTotal();
}

/**
 * Render baris tabel struk pembelian BBM (Multi-Struk & Multi-Pelaksana)
 */
function renderBbmItemRows(items) {
  const tbody = document.getElementById('bbm_items_body');
  if (!tbody) return;

  tbody.innerHTML = '';
  const list = (items && items.length) ? items : [
    {
      pelaksanaNama: 'Ahmad Jayadi, S.Hum., MT.',
      kendaraanPlat: 'Innova B 2577 KRK',
      tanggal: '2026-11-20',
      jenisBbm: 'Pertamina Dex',
      liter: 65,
      jumlah: 1000000
    },
    {
      pelaksanaNama: 'Fitrah Faizal, S.I.Kom.',
      kendaraanPlat: 'Innova B 2577 KRK',
      tanggal: '2026-11-20',
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

  const defaultKend = document.getElementById('bbm_kendaraan')?.value || 'Innova';
  const defaultPlat = document.getElementById('bbm_platNomor')?.value || 'B 2577 KRK';
  const kendVal = item.kendaraan || defaultKend;
  const platVal = item.platNomor || defaultPlat;
  const itemKendPlat = (item.kendaraanPlat) ? item.kendaraanPlat : (platVal ? `${kendVal} ${platVal}` : kendVal);

  const pelakuList = getAvailablePelakuList();
  const currentPelaku = item.pelaksanaNama || document.getElementById('lk_pelaksana')?.value || document.getElementById('bbm_pelaksanaNama')?.value || (pelakuList[0]?.nama || 'Ahmad Jayadi, S.Hum., MT.');

  let optHtml = '';
  let matched = false;
  pelakuList.forEach(p => {
    const isSel = (p.nama === currentPelaku);
    if (isSel) matched = true;
    optHtml += `<option value="${p.nama}" data-nip="${p.nip || ''}" ${isSel ? 'selected' : ''}>${p.nama}</option>`;
  });
  if (!matched && currentPelaku) {
    optHtml = `<option value="${currentPelaku}" selected>${currentPelaku}</option>` + optHtml;
  }

  const tr = document.createElement('tr');
  tr.className = 'bbm-item-row';
  tr.innerHTML = `
    <td class="tc bbm-row-no font-bold">${tbody.children.length + 1}</td>
    <td>
      <select class="form-control bbm-item-pelaksana font-bold" onchange="onBbmRowFieldChange()">
        ${optHtml}
      </select>
    </td>
    <td>
      <input type="text" class="form-control bbm-item-kendaraan-plat font-bold" value="${itemKendPlat}" placeholder="Innova B 2577 KRK" oninput="onBbmRowFieldChange()">
    </td>
    <td>
      <input type="date" class="form-control bbm-item-tanggal" value="${item.tanggal || document.getElementById('bbm_tanggalBukti')?.value || '2026-11-20'}" onchange="onBbmRowFieldChange()">
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
        <option value="Shell Super" ${item.jenisBbm === 'Shell Super' ? 'selected' : ''}>Shell Super</option>
        <option value="BP Ultimate" ${item.jenisBbm === 'BP Ultimate' ? 'selected' : ''}>BP Ultimate</option>
        <option value="Lainnya" ${item.jenisBbm === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
      </select>
    </td>
    <td>
      <input type="number" step="0.01" class="form-control bbm-item-liter tr" value="${item.liter || ''}" placeholder="Liter" oninput="onBbmRowFieldChange()">
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

/**
 * Tambah Baris Struk BBM Baru (Mendukung Banyak Struk)
 */
function addBbmItemRow() {
  const tgl = document.getElementById('bbm_tanggalBukti')?.value || new Date().toISOString().slice(0, 10);
  const kend = document.getElementById('bbm_kendaraan')?.value || 'Innova';
  const plat = document.getElementById('bbm_platNomor')?.value || 'B 2577 KRK';
  const kendPlat = plat ? `${kend} ${plat}` : kend;
  const pelakuList = getAvailablePelakuList();
  const defPelaku = pelakuList[0]?.nama || document.getElementById('bbm_pelaksanaNama')?.value || 'Ahmad Jayadi, S.Hum., MT.';

  appendBbmItemRowHtml({
    pelaksanaNama: defPelaku,
    kendaraanPlat: kendPlat,
    kendaraan: kend,
    platNomor: plat,
    tanggal: tgl,
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
    // Re-index nomor baris
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
  checkBbmDecemberRule();
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
  const kat = document.getElementById('bbm_kategoriKendaraan')?.value || 'dinas';

  const items = [];
  let sum = 0;
  document.querySelectorAll('#bbm_items_body tr').forEach((tr, i) => {
    const rawJumlah = tr.querySelector('.bbm-item-jumlah')?.value.replace(/[^0-9]/g, '');
    const jumlah = parseInt(rawJumlah, 10) || 0;
    sum += jumlah;

    const pelaksanaNama = tr.querySelector('.bbm-item-pelaksana')?.value || getV('bbm_pelaksanaNama') || 'Ahmad Jayadi, S.Hum., MT.';
    const kendPlat = tr.querySelector('.bbm-item-kendaraan-plat')?.value || `${getV('bbm_kendaraan')} ${getV('bbm_platNomor')}`.trim();
    const tgl = tr.querySelector('.bbm-item-tanggal')?.value || getV('bbm_tanggalBukti') || '2026-11-20';
    const jenisBbm = tr.querySelector('.bbm-item-jenis')?.value || 'Pertamina Dex';
    const liter = parseFloat(tr.querySelector('.bbm-item-liter')?.value) || 0;

    const uraian = `Pengisian Bahan Bakar Minyak (BBM) ${jenisBbm} - Mobil ${kendPlat}`;

    items.push({
      id: i + 1,
      pelaksanaNama: pelaksanaNama,
      kendaraanPlat: kendPlat,
      kendaraan: kendPlat.split(/\s+[A-Z]\s/)[0] || kendPlat,
      platNomor: kendPlat,
      tanggal: tgl,
      jenisBbm: jenisBbm,
      uraian: uraian,
      liter: liter,
      jumlah: jumlah
    });
  });

  const record = {
    id: window.currentBbmRecord?.id || ('bbm_' + Date.now()),
    kategoriKendaraan: kat,
    tanggalMasuk: getV('bbm_tanggalMasuk'),
    tanggalBukti: getV('bbm_tanggalBukti'),
    tanggalKuitansi: getV('bbm_tanggalKuitansi') || 'Desember 2026',
    nomorSPM: getV('bbm_nomorSPM') || '-',
    nomorSPD: getV('bbm_nomorSPD') || '-',
    pelaksanaNama: getV('bbm_pelaksanaNama'),
    pelaksanaNip: getV('bbm_pelaksanaNip'),
    pelaksanaPanggilan: getV('bbm_pelaksanaPanggilan') || getV('bbm_pelaksanaNama'),
    pemilikMobil: getV('bbm_pemilikMobil'),
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
    noST: window.currentBbmRecord?.noST || getV('noST') || '395/ST/Sj.07/2026',
    agenda: window.currentBbmRecord?.agenda || getV('agenda') || '',
    tanggalBerangkat: window.currentBbmRecord?.tanggalBerangkat || getV('tglBerangkat') || '',
    tanggalKembali: window.currentBbmRecord?.tanggalKembali || getV('tglKembali') || '',
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
 * Simpan data BBM saat ini ke riwayat penyimpanan lokal & bundle SPT di Cloud
 */
function saveCurrentBbmRecord() {
  const record = collectBbmFormData();

  // Validasi Aturan 2: 1 Desember 2026
  const isRuleOk = checkBbmDecemberRule();
  if (!isRuleOk && record.kategoriKendaraan === 'pribadi') {
    const konfirm = confirm('PERHATIAN KETENTUAN KEMENKEU / SETJEN:\nTerhitung mulai tanggal 1 Desember 2026, penggantian biaya (reimburse/klaim) pembelian BBM untuk KENDARAAN PRIBADI TIDAK LAGI DIPERKENANKAN.\n\nApakah Anda tetap ingin menyimpan berkas ini sebagai arsip internal?');
    if (!konfirm) return;
  }

  const list = getBbmStorageList();
  const existingIdx = list.findIndex(x => x.id === record.id);

  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }

  saveBbmStorageList(list);
  renderBbmHistoryTable();

  // INTEGRASI SEBUNDLE DENGAN SPT PERJADIN & CLOUD
  let bundledTrip = null;
  const selSpt = document.getElementById('bbm_spt_selector');
  const sptId = selSpt ? selSpt.value : 'active';

  if (typeof getTripHistoryList === 'function') {
    const trips = getTripHistoryList();
    if (sptId && sptId !== 'active') {
      bundledTrip = trips.find(t => t.id === sptId);
    } else if (window._activeEditingTrip) {
      bundledTrip = window._activeEditingTrip;
    } else {
      const activeNoST = document.getElementById('noST')?.value;
      if (activeNoST) {
        bundledTrip = trips.find(t => t.noST === activeNoST);
      }
    }

    if (bundledTrip) {
      bundledTrip.bbmData = record;
      if (bundledTrip.draft) {
        bundledTrip.draft.bbmData = record;
      }
      if (typeof saveTripHistoryList === 'function') {
        saveTripHistoryList(trips);
      }
      if (typeof syncTripToCloudAutomatic === 'function') {
        syncTripToCloudAutomatic(bundledTrip).catch(e => console.warn('Sync cloud trip bundle BBM:', e));
      }
    }
  }

  if (typeof showRefreshToast === 'function') {
    const tipeLabel = record.kategoriKendaraan === 'pribadi' ? 'Mobil Pribadi' : 'Mobil Dinas';
    const bundleMsg = bundledTrip ? ` (Terbundle dengan ST: ${bundledTrip.noST} & Cloud)` : '';
    showRefreshToast('Data BBM Disimpan', `Pengajuan BBM ${tipeLabel} (${record.kendaraan}) sebesar ${formatRupiahMurni(record.nilaiTotal)} berhasil disimpan${bundleMsg}.`);
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
    const tipeBadges = item.kategoriKendaraan === 'pribadi'
      ? '<span class="badge badge-warning" style="font-size: 10px;">Pribadi</span>'
      : '<span class="badge badge-success" style="font-size: 10px;">Dinas</span>';
    const itemCount = (item.items && item.items.length) ? item.items.length : 1;

    return `
      <tr>
        <td class="tc font-bold">${idx + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${tipeBadges}
            <strong class="bbm-hist-kendaraan">${item.kendaraan || 'Mobil Dinas'}</strong>
          </div>
          <span class="bbm-hist-plat font-mono" style="font-size: 11px; color: #64748b;">${item.platNomor || '-'}</span>
          <span class="font-mono" style="font-size: 11px; color: #0284c7;">(${itemCount} Struk)</span>
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
    // All (3 Dokumen Berurutan)
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
