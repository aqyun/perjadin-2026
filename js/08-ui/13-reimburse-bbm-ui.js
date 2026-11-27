/**
 * js/08-ui/13-reimburse-bbm-ui.js
 * Modul Antarmuka (UI) & Manajemen Reimburse BBM Kendaraan Dinas & Pribadi
 * Khusus Administrator dan Operator Biro Komunikasi Publik
 * Mendukung Multi-Struk BBM & Pilihan Kendaraan per Baris
 */

window.currentBbmRecord = null;
const BBM_KDO_NOPOL_OPTIONS = ['B 2223 UKQ', 'B 2602 UYZ', 'B 2577 KRK'];

function getBbmCloudRecords() {
  return window._bbmCloudRecords ? [...window._bbmCloudRecords.values()] : [];
}

function getActiveBbmRecord() {
  if (!window.currentBbmRecord) {
    window.currentBbmRecord = (typeof collectBbmFormData === 'function')
      ? collectBbmFormData()
      : getDefaultBbmData();
  }
  return window.currentBbmRecord;
}

/**
 * Normalisasi jenis kendaraan menjadi "Mobil" / "Motor" saja
 */
function normalizeBbmJenisKendaraan(val) {
  return /motor/i.test(val || '') ? 'Motor' : 'Mobil';
}

/**
 * Cari data pegawai berdasarkan nama (tanpa gelar) dari database kepegawaian
 */
function findBbmPegawaiByNama(nama) {
  if (!nama || typeof employees === 'undefined' || !employees || typeof employees.find !== 'function') return null;
  const key = nama.split(',')[0].trim().toLowerCase();
  if (!key) return null;
  return employees.find(p => p && p.nama && p.nama.split(',')[0].trim().toLowerCase() === key) || null;
}

/**
 * Isi NIP pelaksana otomatis dari data pegawai
 */
function syncBbmNipPelaksana() {
  const elNama = document.getElementById('bbm_pelaksanaNama');
  const elNip = document.getElementById('bbm_pelaksanaNip');
  if (!elNama || !elNip) return;
  const emp = findBbmPegawaiByNama(elNama.value);
  if (emp && emp.nip) elNip.value = emp.nip;
}

/**
 * Resolusi identitas pelaksana/pembuat berkas ke data pegawai.
 * Contoh: "Aqyun (Kompu)" -> "Aqyun Rista Maulidin, S.Tr.Kom." + NIP pegawai.
 */
function resolveBbmPelaksanaIdentity(rawNama, fallbackNip) {
  const raw = (rawNama || '').trim();
  let emp = null;

  if (raw && typeof employees !== 'undefined' && employees && typeof employees.filter === 'function') {
    emp = findBbmPegawaiByNama(raw);
    if (!emp) {
      // Cocokkan lewat unsur nama (mis. "Aqyun (Kompu)" -> pegawai bernama Aqyun)
      const tokens = raw.toLowerCase().match(/[a-z]{3,}/g) || [];
      const candidates = employees.filter(p => {
        if (!p || !p.nama) return false;
        const nameTokens = p.nama.toLowerCase().match(/[a-z]{3,}/g) || [];
        return tokens.some(t => nameTokens.includes(t));
      });
      if (candidates.length === 1) emp = candidates[0];
    }
  }

  return {
    nama: (emp && emp.nama) ? emp.nama : raw,
    nip: (emp && emp.nip) ? emp.nip : (fallbackNip || '')
  };
}

function setBbmKategori(val) {
  const kategori = val === 'pribadi' ? 'pribadi' : 'dinas';
  const isPribadi = kategori === 'pribadi';
  const selKat = document.getElementById('bbm_kategoriKendaraan');
  if (selKat) selKat.value = kategori;

  const cardDinas = document.getElementById('bbm_cat_card_dinas');
  const cardPribadi = document.getElementById('bbm_cat_card_pribadi');
  if (cardDinas) {
    cardDinas.classList.toggle('active', !isPribadi);
    cardDinas.setAttribute('aria-checked', String(!isPribadi));
  }
  if (cardPribadi) {
    cardPribadi.classList.toggle('active', isPribadi);
    cardPribadi.setAttribute('aria-checked', String(isPribadi));
  }

  const currentItems = collectBbmFormData().items;
  renderBbmItemRows(currentItems);

  checkBbmDecemberRule();
  updateBbmUraianOtomatis();
}

function onBbmKategoriChange(val) {
  setBbmKategori(val);
}

/**
 * Inisialisasi modul BBM saat pertama kali tab dibuka
 */
async function initBbmModule() {
  try {
    if (typeof syncTripsFromCloud === 'function') {
      await syncTripsFromCloud(true);
    }
    // Otomatis tarik & hubungkan langsung dengan SPT aktif saat ini
    syncBbmFromActiveSpt(false);
    syncBbmNipPelaksana();

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
 * Backward compatibility stub
 */
function populateBbmSptDropdown() {}
function onBbmSptSelectorChange() {}

function resolveActiveBbmTrip(preferredRecord = null) {
  if (typeof getTripHistoryList !== 'function') return null;
  const trips = getTripHistoryList();
  if (preferredRecord?.tripId) {
    const preferred = trips.find(trip => String(trip.id) === String(preferredRecord.tripId));
    if (preferred) return preferred;
  }
  if (preferredRecord?.tripCloudId) {
    const preferred = trips.find(trip => trip.cloudId === preferredRecord.tripCloudId);
    if (preferred) return preferred;
  }

  const active = window._activeEditingTrip;
  if (active?.id) {
    const activeTrip = trips.find(trip => String(trip.id) === String(active.id));
    if (activeTrip) return activeTrip;
  }
  if (active?.cloudId) {
    const activeTrip = trips.find(trip => trip.cloudId === active.cloudId);
    if (activeTrip) return activeTrip;
  }

  const noST = (document.getElementById('noST')?.value || document.getElementById('noSTNum')?.value || '').trim();
  const mak = (document.getElementById('mak')?.value || '').trim();
  const metode = document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS';
  const compKey = getTripCompositeDedupeKey(noST, mak, metode);
  if (compKey) {
    const matched = trips.find(trip => getTripCompositeDedupeKey(trip) === compKey);
    if (matched) return matched;
  }
  const sameNoST = trips.filter(trip => String(trip.noST || '').trim() === noST);
  return sameNoST.length === 1 ? sameNoST[0] : null;
}

/**
 * Sinkronisasi data BBM langsung dari form SPT aktif di aplikasi (Direct Auto-Binding)
 */
function syncBbmFromActiveSpt(showToast = true) {
  const getV = id => (document.getElementById(id)?.value || '').trim();

  // 1. Ambil data dari formulir perjadin yang sedang aktif atau _activeEditingTrip
  const activeTrip = resolveActiveBbmTrip();
  const noST = getV('noST') || getV('noSTNum') || (activeTrip && activeTrip.noST) || '395/ST/Sj.07/2026';
  const agenda = getV('agenda') || (activeTrip && activeTrip.agenda) || 'Pembuatan Video Dokumenter dan Pengambilan Footage Penerima Manfaat Bedah Rumah BSPS di Pulau Lancang, Kel. Pulau Pari, Kab. Kepulauan Seribu';
  const tglBerangkat = getV('tglBerangkat') || (activeTrip && activeTrip.tglBerangkat) || '2026-10-14';
  const tglKembali = getV('tglKembali') || (activeTrip && activeTrip.tglKembali) || '2026-10-16';
  const pelaksanaRaw = getV('lk_pelaksana') || (activeTrip && (activeTrip.lk_pelaksana || (activeTrip.draft && activeTrip.draft.fields && activeTrip.draft.fields.lk_pelaksana))) || 'Yogi Andre Yonatan Pakpahan, S.P.W.K';
  const pelaksanaIdentity = resolveBbmPelaksanaIdentity(pelaksanaRaw);
  const pelaksana = pelaksanaIdentity.nama;
  const prov = getV('tujuanProvinsi') || (activeTrip && activeTrip.tujuanProvinsi) || 'DKI Jakarta';
  const kota = getV('tujuanKota') || getV('tujuanKabKota') || (activeTrip && activeTrip.tujuanKota) || '';
  const tujuanLengkap = kota ? `${prov}, ${kota}` : prov;

  // 2. Periksa apakah trip ini sudah memiliki rekaman BBM tersimpan sebelumnya
  let existingBbm = (activeTrip && (activeTrip.bbmData || (activeTrip.draft && activeTrip.draft.bbmData))) || null;
  if (!existingBbm && activeTrip) {
    existingBbm = getCachedBbmRecord(activeTrip);
  }

  if (existingBbm) {
    loadBbmRecordIntoForm(existingBbm);

    // Identitas pelaksana tetap mengikuti pembuat berkas perjadin yang aktif
    const elPelNama = document.getElementById('bbm_pelaksanaNama');
    const elPelNip = document.getElementById('bbm_pelaksanaNip');
    if (elPelNama) elPelNama.value = pelaksana;
    if (elPelNip && pelaksanaIdentity.nip) elPelNip.value = pelaksanaIdentity.nip;
    if (window.currentBbmRecord) {
      window.currentBbmRecord.pelaksanaNama = pelaksana;
      if (pelaksanaIdentity.nip) window.currentBbmRecord.pelaksanaNip = pelaksanaIdentity.nip;
    }
  } else {
    // 3. Update field identitas pelaksana BBM dari lk_pelaksana
    const elPelNama = document.getElementById('bbm_pelaksanaNama');
    const elPelNip = document.getElementById('bbm_pelaksanaNip');
    if (elPelNama) elPelNama.value = pelaksana;
    if (elPelNip && pelaksanaIdentity.nip) elPelNip.value = pelaksanaIdentity.nip;

    if (window.currentBbmRecord) {
      window.currentBbmRecord.id = 'bbm_' + Date.now();
      delete window.currentBbmRecord.tripId;
      delete window.currentBbmRecord.tripCloudId;
      window.currentBbmRecord.noST = noST;
      window.currentBbmRecord.agenda = agenda;
      window.currentBbmRecord.tanggalBerangkat = tglBerangkat;
      window.currentBbmRecord.tanggalKembali = tglKembali;
      window.currentBbmRecord.pelaksanaNama = pelaksana;
      if (pelaksanaIdentity.nip) window.currentBbmRecord.pelaksanaNip = pelaksanaIdentity.nip;
    }

    updateBbmUraianOtomatis();
  }

  // 4. Perbarui elemen banner SPT aktif live card
  const noLbl = document.getElementById('bbm_spt_no_lbl');
  const agLbl = document.getElementById('bbm_spt_agenda_lbl');
  const pelLbl = document.getElementById('bbm_spt_pelaksana_lbl');
  const tglLbl = document.getElementById('bbm_spt_tanggal_lbl');
  const tujLbl = document.getElementById('bbm_spt_tujuan_lbl');

  if (noLbl) noLbl.textContent = noST || '-';
  if (agLbl) agLbl.textContent = agenda || '-';
  if (pelLbl) pelLbl.textContent = pelaksana || '-';
  if (tujLbl) tujLbl.textContent = tujuanLengkap || '-';

  if (tglLbl) {
    if (tglBerangkat && tglKembali && tglBerangkat !== tglKembali) {
      tglLbl.textContent = `${formatTanggalIndoLengkap(tglBerangkat)} - ${formatTanggalIndoLengkap(tglKembali)}`;
    } else if (tglBerangkat) {
      tglLbl.textContent = formatTanggalIndoLengkap(tglBerangkat);
    } else {
      tglLbl.textContent = '-';
    }
  }

  // 5. Re-render item rows agar pilihan pelaku BBM otomatis mengambil personil di SPT ini
  const currentItems = collectBbmFormData().items;
  renderBbmItemRows(currentItems);

  checkBbmDecemberRule();
  updateBbmDocPreview();

  if (showToast && typeof showRefreshToast === 'function') {
    showRefreshToast('SPT Ditautkan', `BBM berhasil dihubungkan langsung dengan ST: ${noST}`);
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

  const dates = [];
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
  }

  if (banner) banner.style.display = 'none';
  if (badgeKategori) {
    badgeKategori.textContent = 'Mobil Pribadi (Diperkenankan s.d. 30 Nov 2026)';
    badgeKategori.className = 'badge badge-warning';
  }
  return true;
}

/**
 * Dapatkan daftar personil pegawai yang tersedia untuk menjadi pelaku pembelian BBM
 */
function getAvailablePelakuList() {
  const list = [];
  const seen = new Set();
  const pelaksanaRaw = document.getElementById('lk_pelaksana')?.value || document.getElementById('bbm_pelaksanaNama')?.value || '';
  const pelaksana = resolveBbmPelaksanaIdentity(pelaksanaRaw);

  if (typeof selectedEmpIds !== 'undefined' && selectedEmpIds && typeof employees !== 'undefined') {
    selectedEmpIds.forEach(id => {
      const emp = employees.find(e => e.id === id);
      const isPelaksana = pelaksana.nama && (
        emp?.nama === pelaksana.nama ||
        (pelaksana.nip && emp?.nip === pelaksana.nip)
      );
      if (emp && emp.nama && !isPelaksana && !seen.has(emp.nama)) {
        seen.add(emp.nama);
        list.push({ nama: emp.nama, nip: emp.nip || '', gol: emp.golongan || emp.gol || '' });
      }
    });
  }

  return list;
}


function updateBbmUraianOtomatis() {
  const firstRow = document.querySelector('#bbm_items_body .bbm-item-row');
  const kend = normalizeBbmJenisKendaraan(firstRow?.querySelector('.bbm-item-kendaraan')?.value);
  const plat = firstRow?.querySelector('.bbm-item-plat')?.value.trim() || '';
  const elPekerjaan = document.getElementById('bbm_pekerjaan');
  const elPekerjaanKuitansi = document.getElementById('bbm_pekerjaanKuitansi');

  const isPribadi = document.getElementById('bbm_kategoriKendaraan')?.value === 'pribadi';
  const tglAwal = document.getElementById('tglBerangkat')?.value || window.currentBbmRecord?.tanggalBerangkat || firstRow?.querySelector('.bbm-item-tanggal')?.value;
  const tglAkhir = document.getElementById('tglKembali')?.value || window.currentBbmRecord?.tanggalKembali || tglAwal;
  const uraianData = {
    agenda: (document.getElementById('agenda')?.value || window.currentBbmRecord?.agenda || '').trim(),
    noST: (document.getElementById('noST')?.value || document.getElementById('noSTNum')?.value || window.currentBbmRecord?.noST || '').trim(),
    tanggalBerangkat: tglAwal,
    tanggalKembali: tglAkhir,
    kendaraan: kend,
    platNomor: plat,
    kategoriKendaraan: isPribadi ? 'pribadi' : 'dinas',
    namaAkun: document.getElementById('bbm_namaAkun')?.value || window.currentBbmRecord?.namaAkun || 'Belanja Pemeliharaan Peralatan dan Mesin'
  };

  if (elPekerjaan) {
    elPekerjaan.value = getBbmUraianKegiatan(uraianData);
  }
  if (elPekerjaanKuitansi) {
    elPekerjaanKuitansi.value = getBbmUraianKuitansi(uraianData);
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

  const kat = rec.kategoriKendaraan === 'pribadi' ? 'pribadi' : 'dinas';
  const selKat = document.getElementById('bbm_kategoriKendaraan');
  if (selKat) selKat.value = kat;

  const recIdentity = resolveBbmPelaksanaIdentity(rec.pelaksanaNama, rec.pelaksanaNip);
  setVal('bbm_pelaksanaNama', recIdentity.nama);
  setVal('bbm_pelaksanaNip', recIdentity.nip);
  setVal('bbm_namaPenyedia', rec.namaPenyedia || 'Biro Komunikasi Publik');
  setVal('bbm_pekerjaan', rec.pekerjaan);
  setVal('bbm_pekerjaanKuitansi', rec.pekerjaanKuitansi);
  setVal('bbm_akun', rec.akun || '146.01.WA.7665.EBA.994.002.0D.523121');
  setVal('bbm_namaAkun', rec.namaAkun || 'Belanja Pemeliharaan Peralatan dan Mesin');
  setVal('bbm_jenisPengadaan', rec.jenisPengadaan || 'Perawatan Kendaraan Bermotor');

  // Update banner SPT summary
  const elNo = document.getElementById('bbm_spt_no_lbl');
  const elPel = document.getElementById('bbm_spt_pelaksana_lbl');
  if (elNo && rec.noST) elNo.textContent = rec.noST;
  if (elPel && rec.pelaksanaNama) elPel.textContent = rec.pelaksanaNama;

  // Pejabat diselaraskan langsung dari Tab Pengaturan (Settings)
  const ppkNama = (document.getElementById('cfg_ppkNama')?.value || rec.pejabat?.ppkNama || 'Emanuel Pati Libak, S.Pd., M.T.').trim();
  const ppkNip = (document.getElementById('cfg_ppkNip')?.value || rec.pejabat?.ppkNip || '197512072010121001').trim();
  const ppspmNama = (document.getElementById('cfg_ppspmNama')?.value || rec.pejabat?.ppspmNama || 'Mala Hayati Rahayu, S.E').trim();
  const ppspmNip = (document.getElementById('cfg_ppspmNip')?.value || rec.pejabat?.ppspmNip || '198408012009122003').trim();
  const bendNama = (document.getElementById('cfg_bendNama')?.value || rec.pejabat?.bendaharaNama || 'Rahmat H').trim();
  const bendNip = (document.getElementById('cfg_bendNip')?.value || rec.pejabat?.bendaharaNip || '198004022014081001').trim();
  const ktuNama = (document.getElementById('cfg_ktuNama')?.value || rec.pejabat?.kasubbagTuNama || 'Ahmad Jayadi, S.Hum., MT.').trim();
  const ktuNip = (document.getElementById('cfg_ktuNip')?.value || rec.pejabat?.kasubbagTuNip || '198702182010121003').trim();

  setVal('bbm_ppkNama', ppkNama);
  setVal('bbm_ppkNip', ppkNip);
  setVal('bbm_ppspmNama', ppspmNama);
  setVal('bbm_ppspmNip', ppspmNip);
  setVal('bbm_bendaharaNama', bendNama);
  setVal('bbm_bendaharaNip', bendNip);
  setVal('bbm_kasubbagTuNama', ktuNama);
  setVal('bbm_kasubbagTuNip', ktuNip);

  // Perbarui tampilan ringkasan pejabat di form BBM
  const cleanNip = raw => {
    if (!raw) return '-';
    const t = raw.trim();
    return (t.startsWith('NIP.') || t.startsWith('NIP ') || t.startsWith('NIP:')) ? t : `NIP. ${t}`;
  };

  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setTxt('bbm_sync_ppk', ppkNama);
  setTxt('bbm_sync_ppk_nip', cleanNip(ppkNip));
  setTxt('bbm_sync_ppspm', ppspmNama);
  setTxt('bbm_sync_ppspm_nip', cleanNip(ppspmNip));
  setTxt('bbm_sync_bendahara', bendNama);
  setTxt('bbm_sync_bendahara_nip', cleanNip(bendNip));
  setTxt('bbm_sync_ktu', ktuNama);
  setTxt('bbm_sync_ktu_nip', cleanNip(ktuNip));

  // Rincian Struk / Item (Mendukung Multi-Struk & Multi-Pelaksana)
  renderBbmItemRows(rec.items || []);
  setBbmKategori(kat);
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
      kendaraan: 'Mobil',
      platNomor: 'B 2577 KRK',
      tanggal: '2026-11-20',
      jenisBbm: 'Pertamina Dex',
      liter: 65,
      jumlah: 1000000
    },
    {
      pelaksanaNama: 'Fitrah Faizal, S.I.Kom.',
      kendaraan: 'Mobil',
      platNomor: 'B 2577 KRK',
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

  const kendVal = normalizeBbmJenisKendaraan(item.kendaraan || 'Mobil');
  const isPribadi = document.getElementById('bbm_kategoriKendaraan')?.value === 'pribadi';
  const platVal = isPribadi ? (item.platNomor || '') : (BBM_KDO_NOPOL_OPTIONS.includes(item.platNomor) ? item.platNomor : 'B 2577 KRK');
  const platControl = isPribadi
    ? `<input type="text" class="form-control bbm-item-plat font-mono font-bold" value="${platVal}" placeholder="Ketik Nopol" oninput="onBbmRowFieldChange()">`
    : `<select class="form-control bbm-item-plat font-mono font-bold" onchange="onBbmRowFieldChange()">
        ${BBM_KDO_NOPOL_OPTIONS.map(plat => `<option value="${plat}" ${plat === platVal ? 'selected' : ''}>${plat}</option>`).join('')}
      </select>`;

  const pelakuList = getAvailablePelakuList();
  const requestedPelaku = item.pelaksanaNama || '';
  const currentPelaku = pelakuList.some(p => p.nama === requestedPelaku) ? requestedPelaku : (pelakuList[0]?.nama || '');

  const optHtml = pelakuList.length
    ? pelakuList.map(p => {
      const isSel = p.nama === currentPelaku;
      return `<option value="${p.nama}" data-nip="${p.nip || ''}" ${isSel ? 'selected' : ''}>${p.nama}</option>`;
    }).join('')
    : '<option value="" selected>Pilih pegawai dari SPT</option>';

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
      <select class="form-control bbm-item-kendaraan font-bold" onchange="onBbmRowFieldChange()">
        <option value="Mobil" ${kendVal === 'Mobil' ? 'selected' : ''}>Mobil</option>
        <option value="Motor" ${kendVal === 'Motor' ? 'selected' : ''}>Motor</option>
      </select>
    </td>
    <td>
      ${platControl}
    </td>
    <td>
      <input type="date" class="form-control bbm-item-tanggal" value="${item.tanggal || new Date().toISOString().slice(0, 10)}" onchange="onBbmRowFieldChange()">
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
  const pelakuList = getAvailablePelakuList();
  const defPelaku = pelakuList[0]?.nama || '';
  const isPribadi = document.getElementById('bbm_kategoriKendaraan')?.value === 'pribadi';

  appendBbmItemRowHtml({
    pelaksanaNama: defPelaku,
    kendaraan: 'Mobil',
    platNomor: isPribadi ? '' : 'B 2577 KRK',
    tanggal: new Date().toISOString().slice(0, 10),
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

  const items = [];
  let sum = 0;
  document.querySelectorAll('#bbm_items_body tr').forEach((tr, i) => {
    const rawJumlah = tr.querySelector('.bbm-item-jumlah')?.value.replace(/[^0-9]/g, '');
    const jumlah = parseInt(rawJumlah, 10) || 0;
    sum += jumlah;

    const pelaksanaNama = tr.querySelector('.bbm-item-pelaksana')?.value || '';
    const kendItem = normalizeBbmJenisKendaraan(tr.querySelector('.bbm-item-kendaraan')?.value);
    const platItem = tr.querySelector('.bbm-item-plat')?.value.trim() || '';
    const kendPlat = platItem ? `${kendItem} ${platItem}` : kendItem;
    const tgl = tr.querySelector('.bbm-item-tanggal')?.value || new Date().toISOString().slice(0, 10);
    const jenisBbm = tr.querySelector('.bbm-item-jenis')?.value || 'Pertamina Dex';
    const liter = parseFloat(tr.querySelector('.bbm-item-liter')?.value) || 0;

    const uraian = `Pengisian Bahan Bakar Minyak (BBM) ${jenisBbm} - ${kendPlat} an. ${pelaksanaNama}`;

    items.push({
      id: i + 1,
      pelaksanaNama: pelaksanaNama,
      kendaraanPlat: kendPlat,
      kendaraan: kendItem,
      platNomor: platItem,
      tanggal: tgl,
      jenisBbm: jenisBbm,
      uraian: uraian,
      liter: liter,
      jumlah: jumlah
    });
  });

  const pelIdentity = resolveBbmPelaksanaIdentity(
    getV('bbm_pelaksanaNama') || document.getElementById('lk_pelaksana')?.value,
    getV('bbm_pelaksanaNip')
  );

  const receipt = getBbmReceiptPeriod({
    items,
    tanggalKembali: window.currentBbmRecord?.tanggalKembali || getV('tglKembali') || ''
  });
  const tahunBerkas = receipt.tahun;
  const firstItem = items[0] || {};

  const record = {
    id: window.currentBbmRecord?.id || ('bbm_' + Date.now()),
    kategoriKendaraan: document.getElementById('bbm_kategoriKendaraan')?.value || 'dinas',
    tanggalMasuk: '',
    tanggalBukti: receipt.tanggalBukti,
    tanggalKuitansi: receipt.tanggalKuitansi,
    nomorSPM: '-',
    nomorSPD: '-',
    pelaksanaNama: pelIdentity.nama,
    pelaksanaNip: pelIdentity.nip,
    pelaksanaPanggilan: pelIdentity.nama,
    namaPenyedia: getV('bbm_namaPenyedia') || 'Biro Komunikasi Publik',
    noBukti: '-',
    noKuitansi: `            /KW/Bend/Satker-Setjen/${tahunBerkas}`,
    kendaraan: firstItem.kendaraan || 'Mobil',
    platNomor: firstItem.platNomor || '',
    pekerjaan: getV('bbm_pekerjaan'),
    pekerjaanKuitansi: getV('bbm_pekerjaanKuitansi'),
    akun: getV('bbm_akun') || '146.01.WA.7665.EBA.994.002.0D.523121',
    namaAkun: getV('bbm_namaAkun') || 'Belanja Pemeliharaan Peralatan dan Mesin',
    outputKegiatan: 'Perawatan Kendaraan Bermotor',
    jenisPengadaan: getV('bbm_jenisPengadaan') || 'Perawatan Kendaraan Bermotor',
    ta: tahunBerkas,
    items: items,
    nilaiTotal: sum,
    catatan: '',
    status: window.currentBbmRecord?.status || 'selesai',
    noST: getV('noST') || getV('noSTNum') || window.currentBbmRecord?.noST || '',
    agenda: getV('agenda') || window.currentBbmRecord?.agenda || '',
    tanggalBerangkat: getV('tglBerangkat') || window.currentBbmRecord?.tanggalBerangkat || '',
    tanggalKembali: getV('tglKembali') || window.currentBbmRecord?.tanggalKembali || '',
    pejabat: {
      ppkNama: document.getElementById('cfg_ppkNama')?.value || getV('bbm_ppkNama') || 'Emanuel Pati Libak, S.Pd., M.T.',
      ppkNip: document.getElementById('cfg_ppkNip')?.value || getV('bbm_ppkNip') || '197512072010121001',
      ppspmNama: document.getElementById('cfg_ppspmNama')?.value || getV('bbm_ppspmNama') || 'Mala Hayati Rahayu, S.E',
      ppspmNip: document.getElementById('cfg_ppspmNip')?.value || getV('bbm_ppspmNip') || '198408012009122003',
      bendaharaNama: document.getElementById('cfg_bendNama')?.value || getV('bbm_bendaharaNama') || 'Rahmat H',
      bendaharaNip: document.getElementById('cfg_bendNip')?.value || getV('bbm_bendaharaNip') || '198004022014081001',
      kasubbagTuNama: document.getElementById('cfg_ktuNama')?.value || getV('bbm_kasubbagTuNama') || 'Ahmad Jayadi, S.Hum., MT.',
      kasubbagTuNip: document.getElementById('cfg_ktuNip')?.value || getV('bbm_kasubbagTuNip') || '198702182010121003',
      verifikatorNama: document.getElementById('cfg_verifikatorNama')?.value || 'ΓÇª......ΓÇª...........ΓÇª........................................',
      verifikatorNip: document.getElementById('cfg_verifikatorNip')?.value || ''
    }
  };

  window.currentBbmRecord = record;
  return record;
}

/**
 * Simpan data BBM ke bundle SPT dan Cloud tanpa penyimpanan lokal khusus
 */
async function saveCurrentBbmRecord() {
  if (window._isSavingBbm) return false;
  const record = collectBbmFormData();

  const isRuleOk = checkBbmDecemberRule();
  if (!isRuleOk && record.kategoriKendaraan === 'pribadi') {
    const konfirm = confirm('PERHATIAN KETENTUAN KEMENKEU / SETJEN:\nTerhitung mulai tanggal 1 Desember 2026, penggantian biaya (reimburse/klaim) pembelian BBM untuk KENDARAAN PRIBADI TIDAK LAGI DIPERKENANKAN.\n\nApakah Anda tetap ingin menyimpan berkas ini sebagai arsip internal?');
    if (!konfirm) return false;
  }

  const bundledTrip = resolveActiveBbmTrip(record);
  if (!bundledTrip || typeof uploadTripToCloud !== 'function') {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('BBM Belum Dapat Disimpan', 'Simpan Surat Tugas Perjalanan Dinas dan pastikan Cloud terhubung. Data BBM tidak disimpan ke lokal.');
    }
    return false;
  }

  record.noST = bundledTrip.noST || record.noST;
  record.agenda = bundledTrip.agenda || record.agenda;
  record.tanggalBerangkat = bundledTrip.tglBerangkat || record.tanggalBerangkat;
  record.tanggalKembali = bundledTrip.tglKembali || record.tanggalKembali;
  record.pekerjaan = getBbmUraianKegiatan(record);
  record.pekerjaanKuitansi = getBbmUraianKuitansi(record);
  bundledTrip.bbmData = record;
  if (bundledTrip.draft) bundledTrip.draft.bbmData = record;

  window._isSavingBbm = true;
  try {
    const cloudId = await uploadTripToCloud(bundledTrip);
    if (!cloudId) throw new Error('Cloud tidak mengembalikan ID berkas');
    bundledTrip.cloudId = cloudId;
    bundledTrip.isCloud = true;
    cacheBbmRecord(bundledTrip, record);
    if (window._activeEditingTrip && window._activeEditingTrip.id === bundledTrip.id) {
      window._activeEditingTrip.cloudId = cloudId;
      window._activeEditingTrip.isCloud = true;
    }
    if (typeof saveTripHistoryList === 'function') {
      const trips = getTripHistoryList();
      const idx = trips.findIndex(trip => trip.id === bundledTrip.id || trip.cloudId === cloudId);
      if (idx >= 0) trips[idx] = bundledTrip;
      saveTripHistoryList(trips);
    }
    renderBbmHistoryTable();
    if (typeof renderTripHistory === 'function') renderTripHistory();
    if (typeof showRefreshToast === 'function') {
      const tipeLabel = `${record.kendaraan || 'Mobil'} ${record.kategoriKendaraan === 'pribadi' ? 'Pribadi' : 'Dinas'}`;
      showRefreshToast('Data BBM Disimpan di Cloud', `Pengajuan BBM ${tipeLabel} sebesar ${formatRupiahMurni(record.nilaiTotal)} berhasil disimpan dan terhubung ke ST: ${record.noST}.`);
    }
    return true;
  } catch (err) {
    console.error('Gagal menyimpan BBM ke Cloud:', err);
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('BBM Gagal Disimpan ke Cloud', 'Data BBM tidak disimpan ke lokal. Periksa koneksi Cloud lalu coba lagi.');
    }
    return false;
  } finally {
    window._isSavingBbm = false;
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
    showRefreshToast('Contoh Dimuat', 'Data contoh Mobil B 2577 KRK (Rp 1.000.000) berhasil dimuat.');
  }
}

/**
 * Reset form untuk pengajuan baru
 */
function resetBbmForm() {
  const fresh = getDefaultBbmData();
  fresh.id = 'bbm_' + Date.now();
  fresh.kendaraan = 'Mobil';
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
    const tgl = formatTanggalIndoLengkap(item.tanggalBukti || item.items?.[0]?.tanggal || item.tanggalMasuk);
    const tipeBadges = item.kategoriKendaraan === 'pribadi'
      ? '<span class="badge badge-warning">Pribadi</span>'
      : '<span class="badge badge-success">Dinas</span>';
    const itemCount = (item.items && item.items.length) ? item.items.length : 1;

    return `
      <tr>
        <td class="tc font-bold">${idx + 1}</td>
        <td>
          <div class="bbm-hist-kendaraan-row">
            ${tipeBadges}
            <strong class="bbm-hist-kendaraan">${item.kendaraan || 'Mobil Dinas'}</strong>
          </div>
          <div class="bbm-hist-meta">
            <span class="bbm-hist-plat font-mono">${item.platNomor || '-'}</span>
            <span class="bbm-hist-struk">${itemCount} Struk</span>
          </div>
        </td>
        <td class="bbm-hist-pelaksana">${item.pelaksanaNama || item.pelaksanaPanggilan || '-'}</td>
        <td class="font-mono">${tgl}</td>
        <td class="tr font-bold font-mono text-success">${formatRupiahMurni(item.nilaiTotal)}</td>
        <td class="tc">
          <span class="badge badge-success">Selesai</span>
        </td>
        <td class="tc bbm-hist-actions">
          <button type="button" class="btn btn-secondary btn-xs" onclick="onBbmHistoryOpen('${item.id}')" title="Buka dan Edit">
            <svg class="ico"><use href="#i-edit"></use></svg> Buka
          </button>
          <button type="button" class="btn btn-primary btn-xs" onclick="onBbmHistoryPrint('${item.id}')" title="Pratinjau Cetak">
            <svg class="ico"><use href="#i-print"></use></svg> Cetak
          </button>
          <button type="button" class="btn btn-outline btn-xs" onclick="onBbmHistoryExcel('${item.id}')" title="Ekspor Excel">
            <svg class="ico"><use href="#i-file"></use></svg> Excel
          </button>
          <button type="button" class="btn-icon-danger" onclick="onBbmHistoryDelete('${item.id}')" title="Hapus">
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
 * Navigasi Sub-Tampilan BBM: 'form' (Input Struk), 'docs' (Pratinjau Dokumen), atau 'history' (Arsip Riwayat)
 */
function switchBbmTabSubView(sub) {
  const formWrap = document.getElementById('bbm_sub_form');
  const docsWrap = document.getElementById('bbm_sub_docs');
  const histWrap = document.getElementById('bbm_sub_history');
  const btnForm = document.getElementById('btn_bbm_sub_form');
  const btnDocs = document.getElementById('btn_bbm_sub_docs');
  const btnHist = document.getElementById('btn_bbm_sub_history');

  if (formWrap) formWrap.style.display = (sub === 'form') ? 'block' : 'none';
  if (docsWrap) docsWrap.style.display = (sub === 'docs') ? 'block' : 'none';
  if (histWrap) histWrap.style.display = (sub === 'history') ? 'block' : 'none';

  if (btnForm) btnForm.classList.toggle('active', sub === 'form');
  if (btnDocs) btnDocs.classList.toggle('active', sub === 'docs');
  if (btnHist) btnHist.classList.toggle('active', sub === 'history');

  if (sub === 'docs') {
    updateBbmDocPreview();
  } else if (sub === 'history') {
    renderBbmHistoryTable();
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
