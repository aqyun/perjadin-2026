/**
 * js/08-ui/13-reimburse-bbm-ui.js
 * Modul Antarmuka (UI) & Manajemen Reimburse BBM Kendaraan Dinas & Pribadi
 * Khusus Administrator dan Operator Biro Komunikasi Publik
 * Mendukung Multi-Struk BBM & Pilihan Kendaraan per Baris
 */

window.currentBbmRecord = null;
const BBM_KDO_NOPOL_OPTIONS = ['B 2223 UKQ', 'B 2602 UYZ', 'B 2577 KRK'];

const BBM_STORAGE_KEY = 'perdinku_bbm_records_v1';

/**
 * Mengambil seluruh daftar berkas BBM yang benar-benar tersimpan (Database Cloud + localStorage + lampiran non-DKI).
 * @param {{ includeSampleIfEmpty?: boolean }} options
 */
function getBbmStorageList(options = {}) {
  const { includeSampleIfEmpty = false } = options;
  const byId = new Map();
  const normHelper = (typeof normalizeBbmRecordState === 'function')
    ? normalizeBbmRecordState
    : (r => r);
  const mergeHelper = (typeof mergeBbmRecordsCleanly === 'function')
    ? mergeBbmRecordsCleanly
    : ((a, b) => ({ ...(a || {}), ...(b || {}) }));
  const isDkiConflict = (typeof isBbmLinkedToDkiOnlyTrip === 'function')
    ? isBbmLinkedToDkiOnlyTrip
    : (() => false);

  // 1. Tarik dari localStorage BBM (sumber utama cache tersinkron riwayat_bbm Cloud)
  try {
    const raw = localStorage.getItem(BBM_STORAGE_KEY);
    if (raw) {
      const localArr = JSON.parse(raw);
      if (Array.isArray(localArr)) {
        localArr.forEach(item => {
          if (!item || !item.id) return;
          if (item.id === 'bbm_sample' && !item.cloudId && (Number(item.nilaiTotal) || 0) <= 0) return;
          const norm = normHelper(item);
          if (norm) byId.set(norm.id, mergeHelper(byId.get(norm.id), norm));
        });
      }
    }
  } catch (e) {
    console.warn('Error fetching BBM from localStorage:', e);
  }

  // 2. Tarik dari cache fallback riwayat_perjadin bila ada yang belum masuk BBM_STORAGE_KEY
  if (window._fallbackBbmFromTrips instanceof Map) {
    for (const [uid, fb] of window._fallbackBbmFromTrips.entries()) {
      if (!uid || !fb || isDkiConflict(fb)) continue;
      const norm = normHelper(fb);
      if (norm) byId.set(uid, mergeHelper(byId.get(uid), norm));
    }
  }

  // 3. Tarik dari daftar riwayat perjalanan dinas non-DKI yang memiliki lampiran bbmData
  if (typeof getTripHistoryList === 'function') {
    try {
      const trips = getTripHistoryList();
      trips.forEach(trip => {
        if (!trip || (typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(trip))) return;
        const bbm = trip.bbmData || (trip.draft && trip.draft.bbmData) || (typeof getCachedBbmRecord === 'function' ? getCachedBbmRecord(trip) : null);
        if (bbm && bbm.id && !isDkiConflict(bbm)) {
          const cloned = { ...bbm };
          if (!cloned.noST && trip.noST) cloned.noST = trip.noST;
          if (!cloned.agenda && trip.agenda) cloned.agenda = trip.agenda;
          const norm = normHelper(cloned);
          if (norm) byId.set(norm.id, mergeHelper(byId.get(norm.id), norm));
        }
      });
    } catch (e) {
      console.warn('Error fetching BBM from trips:', e);
    }
  }

  const records = Array.from(byId.values())
    .sort((a, b) => new Date(b.savedAt || b.createdAt || 0).getTime() - new Date(a.savedAt || a.createdAt || 0).getTime());

  // 4. Fallback opsional hanya bila pemanggil meminta sampel placeholder kosong
  if (!records.length && includeSampleIfEmpty) {
    const def = (typeof getDefaultBbmData === 'function') ? getDefaultBbmData() : { id: 'bbm_sample', noST: '395/ST/Sj.07/2026' };
    records.push(normHelper(def));
  }

  return records;
}
window.getBbmStorageList = getBbmStorageList;

function getSavedBbmRecordsList() {
  const all = getBbmStorageList({ includeSampleIfEmpty: false });
  const isDkiConflict = (typeof isBbmLinkedToDkiOnlyTrip === 'function')
    ? isBbmLinkedToDkiOnlyTrip
    : (() => false);
  return all.filter(rec => rec && !isDkiConflict(rec));
}
window.getSavedBbmRecordsList = getSavedBbmRecordsList;

function saveBbmStorageList(list) {
  try {
    const normHelper = (typeof normalizeBbmRecordState === 'function')
      ? normalizeBbmRecordState
      : (r => r);
    const clean = (Array.isArray(list) ? list : []).filter(Boolean).map(normHelper);
    localStorage.setItem(BBM_STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.warn('Error saving BBM storage list:', err);
  }
}

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

function setBbmKategori(val, preserveItemPlates = false) {
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

  const hasValidSpt = (typeof validateBbmParentSpt === 'function')
    ? validateBbmParentSpt(window.currentBbmRecord).valid
    : false;

  if (!hasValidSpt) {
    renderBbmItemRows([]);
    checkBbmDecemberRule();
    updateBbmUraianOtomatis();
    return;
  }

  let currentItems = collectBbmFormData().items;
  if (!preserveItemPlates && Array.isArray(currentItems)) {
    const isKdoPlateFn = (typeof isOfficialKdoPlate === 'function')
      ? isOfficialKdoPlate
      : (p => BBM_KDO_NOPOL_OPTIONS.includes(String(p || '').toUpperCase().trim()));
    currentItems = currentItems.map(it => {
      const next = { ...it };
      if (isPribadi && isKdoPlateFn(next.platNomor)) {
        // Beralih ke Mobil Pribadi: bersihkan nopol KDO agar tidak terbaca sebagai kendaraan dinas biro
        next.platNomor = '';
        if (String(next.pelaksanaNama || '').toLowerCase().includes('kdo')) {
          next.pelaksanaNama = '';
        }
      } else if (!isPribadi && !isKdoPlateFn(next.platNomor)) {
        next.platNomor = 'B 2577 KRK';
      }
      return next;
    });
  }
  renderBbmItemRows(currentItems);

  checkBbmDecemberRule();
  updateBbmUraianOtomatis();
}

function onBbmKategoriChange(val) {
  setBbmKategori(val, false);
}

/**
 * Inisialisasi modul BBM saat pertama kali tab dibuka.
 * Nomor SPT selalu terkunci 100% mengikuti SPT Induk (dari Input Perdin aktif, Riwayat Perdin, atau Arsip BBM yang dibuka).
 */
async function initBbmModule() {
  try {
    if (typeof syncTripsFromCloud === 'function') {
      await syncTripsFromCloud(true);
    }

    const explicitLock = Boolean(window._bbmExplicitLock);
    window._bbmExplicitLock = false;
    const tab1Spt = getActiveTab1SptInfo();

    if (explicitLock && window.currentBbmRecord) {
      refreshBbmSptLiveBanner(window.currentBbmRecord);
    } else if (tab1Spt) {
      const tab1Key = (typeof normalizeSptMatchKey === 'function') ? normalizeSptMatchKey(tab1Spt.noST) : tab1Spt.noST.toLowerCase();
      const curKey = window.currentBbmRecord?.noST
        ? ((typeof normalizeSptMatchKey === 'function') ? normalizeSptMatchKey(window.currentBbmRecord.noST) : window.currentBbmRecord.noST.toLowerCase())
        : '';
      if (!window.currentBbmRecord || curKey !== tab1Key) {
        syncBbmFromActiveSpt(false);
      } else {
        refreshBbmSptLiveBanner(window.currentBbmRecord);
      }
    } else if (window.currentBbmRecord && validateBbmParentSpt(window.currentBbmRecord).valid) {
      refreshBbmSptLiveBanner(window.currentBbmRecord);
    } else {
      resetBbmForm(null);
    }
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

function getAvailableNonDkiTripsForBbm() {
  if (typeof getTripHistoryList !== 'function') return [];
  const raw = getTripHistoryList();
  return raw.filter(t => {
    if (!t) return false;
    if (typeof isNonPerdinBbmEntry === 'function' && isNonPerdinBbmEntry(t)) return false;
    if (t.recordType === 'bbm' || String(t.id || '').startsWith('trip_bbm_')) return false;
    if (typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(t)) return false;
    return true;
  });
}

function getActiveTab1SptInfo() {
  const getV = id => (document.getElementById(id)?.value || '').trim();
  const makForm = getV('mak');
  const provForm = getV('tujuanProvinsi');
  const kotaForm = getV('tujuanKota') || getV('tujuanKabKota');
  const agendaForm = getV('agenda');
  const noST = getV('noST') || getV('noSTNum');
  if (!noST) return null;

  const provLow = provForm.toLowerCase();
  const kotaLow = kotaForm.toLowerCase();
  const agLow = agendaForm.toLowerCase();
  const isKepSeribu = kotaLow.includes('seribu') || kotaLow.includes('lancang') || kotaLow.includes('pari') || agLow.includes('seribu');
  const isDkiForm = makForm === '524113' || (((provLow === 'dki jakarta' || provLow === 'dki' || provLow === 'jakarta' || provLow === '13') && !isKepSeribu) && makForm !== '523121');
  if (isDkiForm) return null;

  return {
    noST,
    mak: makForm,
    agenda: agendaForm,
    tglBerangkat: getV('tglBerangkat'),
    tglKembali: getV('tglKembali') || getV('tglBerangkat'),
    provinsiTujuan: provForm,
    kotaTujuan: kotaForm,
    lk_pelaksana: getV('lk_pelaksana')
  };
}

function validateBbmParentSpt(rec = null) {
  const source = rec || window.currentBbmRecord || {};
  const noST = String(source.noST || '').trim();
  const linkedTrip = (typeof findLinkedPerjadinTrip === 'function')
    ? findLinkedPerjadinTrip(noST, source.tripId, source.tripCloudId)
    : null;
  if (linkedTrip) {
    return { valid: true, source: 'riwayat', trip: linkedTrip, noST: linkedTrip.noST || noST };
  }

  const tab1Spt = getActiveTab1SptInfo();
  const stKey = (typeof normalizeSptMatchKey === 'function') ? normalizeSptMatchKey(noST) : noST.toLowerCase();
  const tab1Key = tab1Spt ? ((typeof normalizeSptMatchKey === 'function') ? normalizeSptMatchKey(tab1Spt.noST) : tab1Spt.noST.toLowerCase()) : '';
  if (tab1Spt && stKey && tab1Key && stKey === tab1Key) {
    return { valid: true, source: 'tab1', tab1Spt, trip: null, noST: tab1Spt.noST };
  }

  return {
    valid: false,
    source: null,
    trip: null,
    noST,
    reason: noST
      ? `SPT "${noST}" belum terdaftar sebagai Berkas Perjalanan Dinas (Non-DKI) yang aktif atau tersimpan di Riwayat Perdin.`
      : 'Belum memilih SPT Induk Perjalanan Dinas (Non-DKI).'
  };
}
window.validateBbmParentSpt = validateBbmParentSpt;

function resolveParentTripPelaksanaIdentity(check, fallbackRec = null) {
  if (!check || !check.valid) return { nama: '', nip: '' };
  const linkedTrip = check.trip || null;
  const tab1Spt = check.tab1Spt || null;
  const activeEdit = (typeof window !== 'undefined') ? window._activeEditingTrip : null;
  const checkKey = (check.noST && typeof normalizeSptMatchKey === 'function')
    ? normalizeSptMatchKey(check.noST)
    : String(check.noST || '').trim().toLowerCase();

  let rawPel = '';
  if (tab1Spt) {
    rawPel = tab1Spt.lk_pelaksana || '';
  } else if (linkedTrip) {
    const tab1Live = (typeof getActiveTab1SptInfo === 'function') ? getActiveTab1SptInfo() : null;
    const tab1LiveKey = (tab1Live?.noST && typeof normalizeSptMatchKey === 'function')
      ? normalizeSptMatchKey(tab1Live.noST)
      : String(tab1Live?.noST || '').trim().toLowerCase();
    if ((activeEdit?.id && String(activeEdit.id) === String(linkedTrip.id)) || (tab1LiveKey && checkKey && tab1LiveKey === checkKey)) {
      rawPel = tab1Live?.lk_pelaksana || '';
    } else {
      rawPel = linkedTrip.lk_pelaksana || linkedTrip.draft?.fields?.lk_pelaksana || linkedTrip.pelaksanaNama || '';
    }
  } else if (fallbackRec) {
    rawPel = fallbackRec.pelaksanaNama || '';
  }

  const trimmed = String(rawPel || '').trim();
  if (!trimmed) return { nama: '', nip: '' };
  return resolveBbmPelaksanaIdentity(trimmed);
}

function refreshBbmSptLiveBanner(rec = null) {
  const source = rec || window.currentBbmRecord || {};
  const check = validateBbmParentSpt(source);
  const linkedTrip = check.trip;
  const tab1Spt = (!linkedTrip && check.source === 'tab1') ? check.tab1Spt : null;
  const parentPelIdentity = resolveParentTripPelaksanaIdentity(check, source);
  const effectiveSource = linkedTrip ? {
    noST: linkedTrip.noST,
    agenda: linkedTrip.agenda,
    tanggalBerangkat: linkedTrip.tglBerangkat,
    tanggalKembali: linkedTrip.tglKembali,
    tujuanProvinsi: linkedTrip.provinsiTujuan,
    tujuanKota: linkedTrip.kotaTujuan,
    pelaksanaNama: parentPelIdentity.nama
  } : (tab1Spt ? {
    noST: tab1Spt.noST,
    agenda: tab1Spt.agenda,
    tanggalBerangkat: tab1Spt.tglBerangkat,
    tanggalKembali: tab1Spt.tglKembali,
    tujuanProvinsi: tab1Spt.provinsiTujuan,
    tujuanKota: tab1Spt.kotaTujuan,
    pelaksanaNama: parentPelIdentity.nama
  } : source);

  const noLbl = document.getElementById('bbm_spt_no_lbl');
  const agLbl = document.getElementById('bbm_spt_agenda_lbl');
  const pelLbl = document.getElementById('bbm_spt_pelaksana_lbl');
  const tglLbl = document.getElementById('bbm_spt_tanggal_lbl');
  const tujLbl = document.getElementById('bbm_spt_tujuan_lbl');
  const badgeEl = document.getElementById('bbm_spt_perdin_badge');
  const warnEl = document.getElementById('bbm_no_spt_lock_warning');
  const btnOpenPerdin = document.getElementById('btnBbmOpenLinkedPerdin');

  const noST = String(effectiveSource.noST || '').trim();
  if (noLbl) {
    noLbl.textContent = (check.valid && noST) ? noST : (noST ? `${noST} (SPT Induk Tidak Terdaftar)` : '— Belum Ada SPT Induk Aktif —');
    noLbl.classList.toggle('is-missing', !check.valid);
  }

  if (agLbl) agLbl.textContent = check.valid ? (effectiveSource.agenda || '-') : 'Belum terhubung ke SPT Induk Perjalanan Dinas (Non-DKI).';
  if (pelLbl) pelLbl.textContent = check.valid ? (effectiveSource.pelaksanaNama || '-') : '-';

  const prov = check.valid ? (effectiveSource.tujuanProvinsi || '') : '';
  const kota = check.valid ? (effectiveSource.tujuanKota || '') : '';
  const tujTeks = (kota && prov && !kota.toLowerCase().includes(prov.toLowerCase())) ? `${kota}, ${prov}` : (kota || prov || '');
  if (tujLbl) {
    tujLbl.textContent = tujTeks || '-';
    const tujPill = tujLbl.closest('.bbm-spt-meta-item');
    if (tujPill) tujPill.style.display = tujTeks ? 'inline-flex' : 'none';
  }

  const tA = check.valid ? (effectiveSource.tanggalBerangkat || source.tanggalBukti || '') : '';
  const tB = check.valid ? (effectiveSource.tanggalKembali || tA) : '';
  if (tglLbl) {
    if (tA && tB && tA !== tB) {
      tglLbl.textContent = `${formatTanggalIndoLengkap(tA)} - ${formatTanggalIndoLengkap(tB)}`;
    } else if (tA) {
      tglLbl.textContent = formatTanggalIndoLengkap(tA);
    } else {
      tglLbl.textContent = '-';
    }
  }

  if (badgeEl) {
    if (linkedTrip) {
      badgeEl.innerHTML = `<span class="bbm-live-dot"></span> Terkunci Mengikuti SPT Induk (${linkedTrip.metodePembayaran || 'LS'})`;
      badgeEl.className = 'bbm-spt-status-pill is-synced-perdin';
    } else if (tab1Spt) {
      badgeEl.innerHTML = `<span class="bbm-live-dot"></span> Mengikuti Form Input Perdin Aktif`;
      badgeEl.className = 'bbm-spt-status-pill is-synced-perdin';
    } else {
      badgeEl.innerHTML = `<span class="bbm-live-dot is-warn"></span> Terkunci — Belum Ada SPT Induk Aktif`;
      badgeEl.className = 'bbm-spt-status-pill is-missing-spt';
    }
  }

  if (warnEl) {
    warnEl.style.display = check.valid ? 'none' : 'flex';
  }

  if (btnOpenPerdin) {
    btnOpenPerdin.style.display = linkedTrip ? 'inline-flex' : 'none';
    btnOpenPerdin.dataset.tripId = linkedTrip ? String(linkedTrip.id) : '';
  }

  setBbmFormEnabledState(check.valid);
}

function setBbmFormEnabledState(hasValidSpt) {
  const defaultFieldValues = {
    bbm_namaPenyedia: 'Biro Komunikasi Publik',
    bbm_jenisPengadaan: 'Perawatan Kendaraan Bermotor',
    bbm_akun: '146.01.WA.7665.EBA.994.002.0D.523121',
    bbm_namaAkun: 'Belanja Pemeliharaan Peralatan dan Mesin'
  };
  const lockedIds = [
    'bbm_namaPenyedia',
    'bbm_jenisPengadaan',
    'bbm_akun',
    'bbm_namaAkun',
    'bbm_pekerjaan',
    'bbm_pekerjaanKuitansi'
  ];
  lockedIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.disabled = !hasValidSpt;
    if (!hasValidSpt) {
      el.value = '';
    } else if (defaultFieldValues[id] && !String(el.value || '').trim()) {
      el.value = defaultFieldValues[id];
    }
  });
  if (!hasValidSpt) {
    ['bbm_pelaksanaNama', 'bbm_pelaksanaNip'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
  const addBtn = document.getElementById('btnBbmAddItemRow');
  if (addBtn) addBtn.disabled = !hasValidSpt;
  const formCard = document.querySelector('#tab-bbm .bbm-form-card');
  if (formCard) formCard.classList.toggle('is-locked-no-spt', !hasValidSpt);
}

function populateBbmSptDropdown() {}

function applyTripMetadataToBbmContext(trip) {
  if (!trip) return;
  const noST = String(trip.noST || '').trim();
  const pelId = resolveParentTripPelaksanaIdentity({ valid: true, trip, noST }, window.currentBbmRecord);

  window.currentBbmRecord = window.currentBbmRecord || getDefaultBbmData();
  window.currentBbmRecord.tripId = trip.id;
  if (trip.cloudId) window.currentBbmRecord.tripCloudId = trip.cloudId;
  window.currentBbmRecord.noST = noST;
  window.currentBbmRecord.agenda = trip.agenda || '';
  window.currentBbmRecord.tanggalBerangkat = trip.tglBerangkat || '';
  window.currentBbmRecord.tanggalKembali = trip.tglKembali || '';
  window.currentBbmRecord.tujuanProvinsi = trip.provinsiTujuan || '';
  window.currentBbmRecord.tujuanKota = trip.kotaTujuan || '';

  window.currentBbmRecord.pelaksanaNama = pelId.nama || '';
  window.currentBbmRecord.pelaksanaNip = pelId.nip || '';
  const elPelNama = document.getElementById('bbm_pelaksanaNama');
  const elPelNip = document.getElementById('bbm_pelaksanaNip');
  if (elPelNama) elPelNama.value = pelId.nama || '';
  if (elPelNip) elPelNip.value = pelId.nip || '';

  refreshBbmSptLiveBanner(window.currentBbmRecord);
  const currentItems = collectBbmFormData().items;
  renderBbmItemRows(currentItems);
  updateBbmUraianOtomatis();
  checkBbmDecemberRule();
}

function openLinkedPerdinFromBbm(e = null) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const btn = document.getElementById('btnBbmOpenLinkedPerdin');
  const tripId = btn?.dataset?.tripId || window.currentBbmRecord?.tripId || '';
  const noST = window.currentBbmRecord?.noST || '';
  const linkedTrip = (typeof findLinkedPerjadinTrip === 'function') ? findLinkedPerjadinTrip(noST, tripId) : null;
  if (!linkedTrip) {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Perdin Induk Tidak Ditemukan', `Belum ada arsip Perjalanan Dinas di Riwayat dengan Nomor SPT "${noST || '-'}".`);
    }
    return;
  }
  if (typeof openTripPdfModal === 'function') {
    openTripPdfModal(linkedTrip.id);
  }
}
window.openLinkedPerdinFromBbm = openLinkedPerdinFromBbm;

/**
 * Buka tab BBM yang langsung terkunci & tersinkron ke SPT Perjadin tertentu (atau membuka berkas BBM existing SPT tersebut)
 */
function openOrCreateBbmForTrip(tripId, existingBbmId = null) {
  const savedList = getSavedBbmRecordsList();
  window._bbmExplicitLock = true;
  if (typeof showTab === 'function') showTab('bbm');

  if (existingBbmId) {
    const found = savedList.find(b => b && b.id === existingBbmId);
    if (found) {
      loadBbmRecordIntoForm(found);
      switchBbmTabSubView('form');
      updateBbmDocPreview();
      return;
    }
  }

  const trips = getAvailableNonDkiTripsForBbm();
  const trip = trips.find(t => String(t.id) === String(tripId));
  if (!trip) return;

  const key = (typeof normalizeSptMatchKey === 'function') ? normalizeSptMatchKey(trip.noST) : '';
  const matchedBbm = savedList.find(b => (b.tripId && String(b.tripId) === String(trip.id)) || (key && (typeof normalizeSptMatchKey === 'function' ? normalizeSptMatchKey(b.noST) : '') === key));
  if (matchedBbm) {
    loadBbmRecordIntoForm(matchedBbm);
    switchBbmTabSubView('form');
    updateBbmDocPreview();
    return;
  }

  // Buat draft berkas BBM baru yang terpisah, terkunci langsung ke SPT Induk Perjadin ini
  resetBbmForm(trip);
  applyTripMetadataToBbmContext(trip);
  switchBbmTabSubView('form');
}
window.openOrCreateBbmForTrip = openOrCreateBbmForTrip;

function resolveActiveBbmTrip(preferredRecord = null) {
  if (typeof getTripHistoryList !== 'function') return null;
  if (preferredRecord && (preferredRecord.tripId || preferredRecord.tripCloudId || preferredRecord.noST)) {
    if (typeof findLinkedPerjadinTrip === 'function') {
      return findLinkedPerjadinTrip(preferredRecord.noST, preferredRecord.tripId, preferredRecord.tripCloudId);
    }
  }
  const rawTrips = getTripHistoryList();
  // Khusus DKI Jakarta (MAK 524113 / dalam kota) bukan berkas BBM
  const trips = rawTrips.filter(trip => !(typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(trip)));

  const active = window._activeEditingTrip;
  if (active?.id && !(typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(active))) {
    const activeTrip = trips.find(trip => String(trip.id) === String(active.id));
    if (activeTrip) return activeTrip;
  }
  if (active?.cloudId && !(typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(active))) {
    const activeTrip = trips.find(trip => trip.cloudId === active.cloudId);
    if (activeTrip) return activeTrip;
  }

  const noST = (document.getElementById('noST')?.value || document.getElementById('noSTNum')?.value || '').trim();
  const mak = (document.getElementById('mak')?.value || '').trim();
  const metode = document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS';
  // Jika MAK formulir saat ini adalah 524113 (DKI Jakarta), jangan tautkan ke BBM
  if (mak === '524113') return null;

  const compKey = getTripCompositeDedupeKey(noST, mak, metode);
  if (compKey) {
    const matched = trips.find(trip => getTripCompositeDedupeKey(trip) === compKey);
    if (matched) return matched;
  }
  const sameNoST = trips.filter(trip => String(trip.noST || '').trim() === noST);
  return sameNoST.length === 1 ? sameNoST[0] : null;
}

/**
 * Sinkronisasi data BBM langsung mengikuti SPT Induk pada form Input Perjadin aktif (Non-DKI)
 */
function syncBbmFromActiveSpt(showToast = true) {
  const getV = id => (document.getElementById(id)?.value || '').trim();

  // Khusus penugasan DKI Jakarta (MAK 524113) bukan berkas BBM
  const makForm = getV('mak');
  const provForm = getV('tujuanProvinsi').toLowerCase();
  const kotaForm = (getV('tujuanKota') || getV('tujuanKabKota')).toLowerCase();
  const isKepSeribu = kotaForm.includes('seribu') || kotaForm.includes('lancang') || kotaForm.includes('pari');
  const isDkiForm = makForm === '524113' || (((provForm === 'dki jakarta' || provForm === 'dki' || provForm === 'jakarta' || provForm === '13') && !isKepSeribu) && makForm !== '523121');

  if (isDkiForm) {
    if (showToast && typeof showRefreshToast === 'function') {
      showRefreshToast('Perjalanan Dalam Kota DKI Jakarta', 'Perjalanan dinas khusus DKI Jakarta (MAK 524113) menggunakan transport lokal (DPR), bukan Berkas BBM.');
    }
    return;
  }

  const tab1Spt = getActiveTab1SptInfo();
  const linkedTripFromTab1 = tab1Spt ? ((typeof findLinkedPerjadinTrip === 'function') ? findLinkedPerjadinTrip(tab1Spt.noST) : null) : null;
  const activeTrip = linkedTripFromTab1 || resolveActiveBbmTrip();

  if (activeTrip && typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(activeTrip)) {
    if (showToast && typeof showRefreshToast === 'function') {
      showRefreshToast('Perjalanan Dalam Kota DKI Jakarta', 'Perjalanan dinas khusus DKI Jakarta (MAK 524113) menggunakan transport lokal (DPR), bukan Berkas BBM.');
    }
    return;
  }

  const noST = tab1Spt?.noST || activeTrip?.noST || '';
  if (!noST) {
    populateBbmSptDropdown();
    refreshBbmSptLiveBanner(window.currentBbmRecord);
    if (showToast && typeof showRefreshToast === 'function') {
      showRefreshToast('Belum Ada SPT Induk Aktif', 'Silakan isi atau buka Perjalanan Dinas (Non-DKI) di Input Perjalanan atau klik "+ Berkas BBM" dari Riwayat Perjalanan.');
    }
    return;
  }

  const agenda = tab1Spt?.agenda || activeTrip?.agenda || '';
  const tglBerangkat = tab1Spt?.tglBerangkat || activeTrip?.tglBerangkat || '';
  const tglKembali = tab1Spt?.tglKembali || activeTrip?.tglKembali || tglBerangkat;
  const pelaksanaRaw = getV('lk_pelaksana') || activeTrip?.lk_pelaksana || activeTrip?.draft?.fields?.lk_pelaksana || activeTrip?.pelaksanaNama || '';
  const pelaksanaIdentity = resolveBbmPelaksanaIdentity(pelaksanaRaw);
  const pelaksana = pelaksanaIdentity.nama;
  const prov = tab1Spt?.provinsiTujuan || activeTrip?.provinsiTujuan || '';
  const kota = tab1Spt?.kotaTujuan || activeTrip?.kotaTujuan || '';

  // 2. Periksa apakah trip / SPT ini sudah memiliki rekaman BBM terpisah di riwayat BBM
  const savedBbmList = getSavedBbmRecordsList();
  const stKey = (typeof normalizeSptMatchKey === 'function') ? normalizeSptMatchKey(noST) : noST.toLowerCase();
  let existingBbm = savedBbmList.find(b =>
    (activeTrip && b.tripId && String(b.tripId) === String(activeTrip.id)) ||
    (stKey && (typeof normalizeSptMatchKey === 'function' ? normalizeSptMatchKey(b.noST) : '') === stKey)
  ) || null;
  if (!existingBbm && activeTrip) {
    existingBbm = activeTrip.bbmData || (activeTrip.draft && activeTrip.draft.bbmData) || getCachedBbmRecord(activeTrip) || null;
  }

  populateBbmSptDropdown();

  if (existingBbm) {
    loadBbmRecordIntoForm(existingBbm);
    const elPelNama = document.getElementById('bbm_pelaksanaNama');
    const elPelNip = document.getElementById('bbm_pelaksanaNip');
    if (elPelNama) elPelNama.value = pelaksana || '';
    if (elPelNip) elPelNip.value = pelaksanaIdentity.nip || '';
    if (window.currentBbmRecord) {
      window.currentBbmRecord.pelaksanaNama = pelaksana || '';
      window.currentBbmRecord.pelaksanaNip = pelaksanaIdentity.nip || '';
    }
  } else {
    const elPelNama = document.getElementById('bbm_pelaksanaNama');
    const elPelNip = document.getElementById('bbm_pelaksanaNip');
    if (elPelNama) elPelNama.value = pelaksana || '';
    if (elPelNip) elPelNip.value = pelaksanaIdentity.nip || '';

    window.currentBbmRecord = window.currentBbmRecord || getDefaultBbmData();
    if (!window.currentBbmRecord.id) window.currentBbmRecord.id = 'bbm_' + Date.now();
    if (activeTrip) {
      window.currentBbmRecord.tripId = activeTrip.id;
      if (activeTrip.cloudId) window.currentBbmRecord.tripCloudId = activeTrip.cloudId;
    } else {
      delete window.currentBbmRecord.tripId;
      delete window.currentBbmRecord.tripCloudId;
    }
    window.currentBbmRecord.noST = noST;
    window.currentBbmRecord.agenda = agenda;
    window.currentBbmRecord.tanggalBerangkat = tglBerangkat;
    window.currentBbmRecord.tanggalKembali = tglKembali;
    window.currentBbmRecord.tujuanProvinsi = prov;
    window.currentBbmRecord.tujuanKota = kota;
    window.currentBbmRecord.pelaksanaNama = pelaksana || '';
    window.currentBbmRecord.pelaksanaNip = pelaksanaIdentity.nip || '';

    refreshBbmSptLiveBanner(window.currentBbmRecord);
    updateBbmUraianOtomatis();
    const tbody = document.getElementById('bbm_items_body');
    if (tbody && tbody.children.length === 0) {
      renderBbmItemRows(window.currentBbmRecord.items || []);
    }
  }

  refreshBbmSptLiveBanner(window.currentBbmRecord || {
    noST, agenda, pelaksanaNama: pelaksana, tanggalBerangkat: tglBerangkat, tanggalKembali: tglKembali,
    tujuanProvinsi: prov, tujuanKota: kota, tripId: activeTrip?.id, tripCloudId: activeTrip?.cloudId
  });

  // 5. Re-render item rows agar pilihan pelaku BBM otomatis mengambil personil di SPT Induk ini
  const currentItems = collectBbmFormData().items;
  renderBbmItemRows(currentItems);

  checkBbmDecemberRule();
  updateBbmDocPreview();

  if (showToast && typeof showRefreshToast === 'function') {
    showRefreshToast('Terkunci ke SPT Induk', `Berkas BBM disinkronkan dan mengikuti Nomor SPT Induk "${noST}".`);
  }
}

/**
 * Validasi Aturan 2: Larangan Penggantian BBM Khusus Perorangan / Kendaraan Pribadi per 1 Desember 2026
 */
function checkBbmDecemberRule() {
  const kat = document.getElementById('bbm_kategoriKendaraan')?.value || 'dinas';
  const banner = document.getElementById('bbm_rule_december_banner');
  const badgeKategori = document.getElementById('bbm_kategori_badge');

  const items = [];
  document.querySelectorAll('#bbm_items_body tr').forEach(tr => {
    items.push({
      pelaksanaNama: (tr.querySelector('.bbm-item-pelaksana')?.value || '').trim(),
      platNomor: (tr.querySelector('.bbm-item-plat')?.value || '').trim(),
      tanggal: (tr.querySelector('.bbm-item-tanggal')?.value || '').trim()
    });
  });

  const policy = (typeof evaluateBbmPencairanPolicy === 'function')
    ? evaluateBbmPencairanPolicy({
        kategoriKendaraan: kat,
        platNomor: items[0]?.platNomor || window.currentBbmRecord?.platNomor || '',
        items
      })
    : {
        isPerorangan: kat === 'pribadi',
        eligiblePencairan: kat !== 'pribadi' || !items.some(i => i.tanggal >= '2026-12-01'),
        badgeLabel: kat === 'pribadi' ? 'Perorangan' : 'KDO Dinas'
      };

  if (!policy.isPerorangan) {
    if (banner) banner.style.display = 'none';
    if (badgeKategori) {
      badgeKategori.textContent = 'Mobil Dinas / KDO (Masuk Pencairan)';
      badgeKategori.className = 'badge badge-success';
    }
    return true;
  }

  if (!policy.eligiblePencairan) {
    if (banner) banner.style.display = 'block';
    if (badgeKategori) {
      badgeKategori.textContent = 'Perorangan ≥ 1 Des 2026 (Tidak Masuk Pencairan)';
      badgeKategori.className = 'badge badge-danger';
    }
    return false;
  }

  if (banner) banner.style.display = 'none';
  if (badgeKategori) {
    badgeKategori.textContent = 'Perorangan s.d. 30 Nov 2026 (Masuk Pencairan)';
    badgeKategori.className = 'badge badge-warning';
  }
  return true;
}

/**
 * Dapatkan daftar personil pegawai yang tersedia untuk menjadi pelaku pembelian BBM
 * HANYA personil yang terdaftar pada Surat Perintah Tugas (SPT) aktif
 */
function getAvailablePelakuList() {
  const list = [
    { nama: 'Kendaraan Dinas Operasional (KDO)', nip: '', gol: '' }
  ];
  const seen = new Set(['kendaraan dinas operasional (kdo)']);

  const activeTrip = (typeof resolveActiveBbmTrip === 'function') ? resolveActiveBbmTrip(window.currentBbmRecord) : null;

  // 1. Personil yang tercantum di SPT aktif (trip.employees)
  if (activeTrip && Array.isArray(activeTrip.employees) && activeTrip.employees.length) {
    activeTrip.employees.forEach(emp => {
      if (emp && emp.nama && !seen.has(emp.nama.toLowerCase())) {
        seen.add(emp.nama.toLowerCase());
        list.push({ nama: emp.nama, nip: emp.nip || '', gol: emp.golongan || emp.gol || '' });
      }
    });
  }

  // 2. Personil dari activeTrip.draft.empIds (jika ada)
  if (activeTrip?.draft?.empIds && Array.isArray(activeTrip.draft.empIds) && typeof employees !== 'undefined') {
    activeTrip.draft.empIds.forEach(id => {
      const emp = employees.find(e => e.id === id);
      if (emp && emp.nama && !seen.has(emp.nama.toLowerCase())) {
        seen.add(emp.nama.toLowerCase());
        list.push({ nama: emp.nama, nip: emp.nip || '', gol: emp.golongan || emp.gol || '' });
      }
    });
  }

  // 3. Personil dari selectedEmpIds di form Perjadin aktif HANYA jika tidak sedang terikat trip lain atau cocok SPT Tab 1
  const tab1Spt = getActiveTab1SptInfo();
  const curNoStKey = (typeof normalizeSptMatchKey === 'function') ? normalizeSptMatchKey(window.currentBbmRecord?.noST) : '';
  const tab1Key = tab1Spt && (typeof normalizeSptMatchKey === 'function') ? normalizeSptMatchKey(tab1Spt.noST) : '';
  const useTab1Emps = !activeTrip && tab1Spt && (!curNoStKey || curNoStKey === tab1Key);
  if (useTab1Emps && typeof selectedEmpIds !== 'undefined' && selectedEmpIds && selectedEmpIds.size > 0 && typeof employees !== 'undefined') {
    selectedEmpIds.forEach(id => {
      const emp = employees.find(e => e.id === id);
      if (emp && emp.nama && !seen.has(emp.nama.toLowerCase())) {
        seen.add(emp.nama.toLowerCase());
        list.push({ nama: emp.nama, nip: emp.nip || '', gol: emp.golongan || emp.gol || '' });
      }
    });
  }

  // 4. Pelaksana berkas / Pembuat Daftar di SPT Induk
  const pelaksanaRaw = activeTrip?.lk_pelaksana || activeTrip?.draft?.fields?.lk_pelaksana || activeTrip?.pelaksanaNama || (useTab1Emps ? document.getElementById('lk_pelaksana')?.value : '') || document.getElementById('bbm_pelaksanaNama')?.value || '';
  if (pelaksanaRaw) {
    const pelaksana = (typeof resolveBbmPelaksanaIdentity === 'function') ? resolveBbmPelaksanaIdentity(pelaksanaRaw) : { nama: pelaksanaRaw };
    if (pelaksana.nama && !seen.has(pelaksana.nama.toLowerCase())) {
      seen.add(pelaksana.nama.toLowerCase());
      list.push({ nama: pelaksana.nama, nip: pelaksana.nip || '', gol: '' });
    }
  }

  return list;
}


function updateBbmUraianOtomatis() {
  const firstRow = document.querySelector('#bbm_items_body .bbm-item-row');
  const kend = normalizeBbmJenisKendaraan(firstRow?.querySelector('.bbm-item-kendaraan')?.value);
  const plat = firstRow?.querySelector('.bbm-item-plat')?.value.trim() || '';
  const elPekerjaan = document.getElementById('bbm_pekerjaan');
  const elPekerjaanKuitansi = document.getElementById('bbm_pekerjaanKuitansi');

  const curCheck = validateBbmParentSpt(window.currentBbmRecord);
  if (!curCheck.valid) {
    if (elPekerjaan) elPekerjaan.value = '';
    if (elPekerjaanKuitansi) elPekerjaanKuitansi.value = '';
    updateBbmDocPreview();
    return;
  }

  const parentTrip = curCheck.trip;
  const tab1Spt = (!parentTrip && curCheck.source === 'tab1') ? curCheck.tab1Spt : null;
  const isPribadi = document.getElementById('bbm_kategoriKendaraan')?.value === 'pribadi';
  const tglAwal = parentTrip?.tglBerangkat || window.currentBbmRecord?.tanggalBerangkat || tab1Spt?.tglBerangkat || firstRow?.querySelector('.bbm-item-tanggal')?.value || '';
  const tglAkhir = parentTrip?.tglKembali || window.currentBbmRecord?.tanggalKembali || tab1Spt?.tglKembali || tglAwal;
  const uraianData = {
    agenda: (parentTrip?.agenda || window.currentBbmRecord?.agenda || tab1Spt?.agenda || '').trim(),
    noST: (parentTrip?.noST || window.currentBbmRecord?.noST || tab1Spt?.noST || '').trim(),
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

  const parentCheck = validateBbmParentSpt(rec);
  const hasValidSpt = parentCheck.valid;
  if (hasValidSpt) {
    const recIdentity = resolveParentTripPelaksanaIdentity(parentCheck, rec);
    rec.pelaksanaNama = recIdentity.nama;
    rec.pelaksanaNip = recIdentity.nip;
    setVal('bbm_pelaksanaNama', recIdentity.nama);
    setVal('bbm_pelaksanaNip', recIdentity.nip);
    setVal('bbm_namaPenyedia', rec.namaPenyedia || 'Biro Komunikasi Publik');
    setVal('bbm_pekerjaan', rec.pekerjaan);
    setVal('bbm_pekerjaanKuitansi', rec.pekerjaanKuitansi);
    setVal('bbm_akun', rec.akun || '146.01.WA.7665.EBA.994.002.0D.523121');
    setVal('bbm_namaAkun', rec.namaAkun || 'Belanja Pemeliharaan Peralatan dan Mesin');
    setVal('bbm_jenisPengadaan', rec.jenisPengadaan || 'Perawatan Kendaraan Bermotor');
  } else {
    setVal('bbm_pelaksanaNama', '');
    setVal('bbm_pelaksanaNip', '');
    setVal('bbm_namaPenyedia', '');
    setVal('bbm_pekerjaan', '');
    setVal('bbm_pekerjaanKuitansi', '');
    setVal('bbm_akun', '');
    setVal('bbm_namaAkun', '');
    setVal('bbm_jenisPengadaan', '');
  }

  // Update banner SPT summary (100% read-only terkunci ke SPT Induk)
  populateBbmSptDropdown();
  refreshBbmSptLiveBanner(rec);

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

  // Rincian Struk / Item (kosong bila belum ada SPT Induk aktif)
  renderBbmItemRows(hasValidSpt ? (rec.items || []) : []);
  setBbmKategori(kat, true);
  recalcBbmTotal();
}

/**
 * Render baris tabel struk pembelian BBM (Multi-Struk & Multi-Pelaksana)
 */
function renderBbmItemRows(items) {
  const tbody = document.getElementById('bbm_items_body');
  if (!tbody) return;

  tbody.innerHTML = '';
  const hasValidSpt = validateBbmParentSpt(window.currentBbmRecord).valid;
  if (!hasValidSpt) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="tc bbm-empty-state">
          Belum ada SPT Induk aktif. Rincian pembelian BBM kosong dan akan aktif otomatis setelah terhubung ke SPT Perjalanan Dinas (Non-DKI).
        </td>
      </tr>
    `;
    return;
  }

  const list = (items && items.length) ? items : [
    {
      pelaksanaNama: 'Kendaraan Dinas Operasional (KDO)',
      kendaraan: 'Mobil',
      platNomor: 'B 2577 KRK',
      tanggal: new Date().toISOString().slice(0, 10),
      jenisBbm: 'Pertamina Dex',
      liter: '',
      jumlah: 0
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
  if (requestedPelaku && !pelakuList.some(p => p.nama === requestedPelaku)) {
    pelakuList.push({ nama: requestedPelaku, nip: item.pelaksanaNip || '', gol: '' });
  }
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
    <td class="tc bbm-row-no bbm-td-no font-bold" data-label="No">${tbody.children.length + 1}</td>
    <td class="bbm-td-pelaku" data-label="Pelaku BBM (Pegawai)">
      <select class="form-control bbm-item-pelaksana font-bold" onchange="onBbmRowFieldChange()">
        ${optHtml}
      </select>
    </td>
    <td class="bbm-td-kendaraan" data-label="Jenis Kendaraan">
      <select class="form-control bbm-item-kendaraan font-bold" onchange="onBbmRowFieldChange()">
        <option value="Mobil" ${kendVal === 'Mobil' ? 'selected' : ''}>Mobil</option>
        <option value="Motor" ${kendVal === 'Motor' ? 'selected' : ''}>Motor</option>
      </select>
    </td>
    <td class="bbm-td-nopol" data-label="Nopol">
      ${platControl}
    </td>
    <td class="bbm-td-tanggal" data-label="Tanggal Struk">
      <input type="date" class="form-control bbm-item-tanggal" value="${item.tanggal || new Date().toISOString().slice(0, 10)}" onchange="onBbmRowFieldChange()">
    </td>
    <td class="bbm-td-jenis" data-label="Jenis BBM">
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
    <td class="bbm-td-liter" data-label="Liter">
      <input type="number" step="0.01" class="form-control bbm-item-liter tr" value="${item.liter || ''}" placeholder="Liter" oninput="onBbmRowFieldChange()">
    </td>
    <td class="bbm-td-jumlah" data-label="Jumlah (Rp)">
      <input type="text" class="form-control bbm-item-jumlah tr font-bold font-mono" value="${Number(item.jumlah || 0).toLocaleString('id-ID')}" placeholder="0" oninput="onBbmJumlahInput(this)">
    </td>
    <td class="tc bbm-td-aksi" data-label="Aksi">
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
  if (!validateBbmParentSpt(window.currentBbmRecord).valid) {
    alert('Belum ada SPT Induk Perjalanan Dinas (Non-DKI) yang aktif. Silakan isi atau pilih SPT terlebih dahulu di Input Perjalanan atau Riwayat Perjalanan.');
    return;
  }
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
    const txt = total === 0
      ? 'Nol Rupiah'
      : ((typeof terbilang === 'function') ? terbilang(total) : 'Rupiah');
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

    const pelaksanaNama = (tr.querySelector('.bbm-item-pelaksana')?.value || '').trim();
    const kendItem = normalizeBbmJenisKendaraan(tr.querySelector('.bbm-item-kendaraan')?.value);
    const platItem = tr.querySelector('.bbm-item-plat')?.value.trim() || '';
    const kendPlat = platItem ? `${kendItem} ${platItem}` : kendItem;
    const tgl = tr.querySelector('.bbm-item-tanggal')?.value || new Date().toISOString().slice(0, 10);
    const jenisBbm = tr.querySelector('.bbm-item-jenis')?.value || 'Pertamina Dex';
    const liter = parseFloat(tr.querySelector('.bbm-item-liter')?.value) || 0;

    let uraian = '';
    const isKdo = pelaksanaNama.toLowerCase().includes('kdo') ||
                  pelaksanaNama.toLowerCase().includes('operasional') ||
                  (!pelaksanaNama && (platItem === 'B 2577 KRK' || platItem === 'B 2223 UKQ' || platItem === 'B 2602 UYZ'));

    if (isKdo) {
      uraian = `Pengisian Bahan Bakar Minyak (BBM) ${jenisBbm} Kendaraan Dinas Operasional (KDO) - ${kendPlat}`;
    } else {
      uraian = `Pengisian Bahan Bakar Minyak (BBM) ${jenisBbm} - ${kendPlat}${pelaksanaNama ? ' an. ' + pelaksanaNama : ''}`;
    }

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

  const buktiPelakSet = new Set();
  items.forEach(it => {
    if (it.pelaksanaNama) buktiPelakSet.add(it.pelaksanaNama.trim());
  });
  const pelaksanaBuktiStr = [...buktiPelakSet].join(', ');

  const receipt = getBbmReceiptPeriod({
    items,
    tanggalKembali: window.currentBbmRecord?.tanggalKembali || getV('tglKembali') || ''
  });
  const tahunBerkas = receipt.tahun;
  const firstItem = items[0] || {};
  const prevRec = window.currentBbmRecord || {};

  // Nomor SPT dan metadata SPT WAJIB terkunci mengikuti SPT Induk Perjadin (tidak dapat diubah manual & bukan DKI Jakarta)
  const parentCheck = validateBbmParentSpt(prevRec);
  const linkedTrip = parentCheck.trip || null;
  const tab1Spt = (!linkedTrip && parentCheck.source === 'tab1') ? parentCheck.tab1Spt : null;
  const pelIdentity = parentCheck.valid
    ? resolveParentTripPelaksanaIdentity(parentCheck, prevRec)
    : { nama: '', nip: '' };

  const curNoST = linkedTrip?.noST || tab1Spt?.noST || prevRec.noST || '';
  const curAgenda = linkedTrip?.agenda || tab1Spt?.agenda || prevRec.agenda || '';
  const curTglBerangkat = linkedTrip?.tglBerangkat || tab1Spt?.tglBerangkat || prevRec.tanggalBerangkat || '';
  const curTglKembali = linkedTrip?.tglKembali || tab1Spt?.tglKembali || prevRec.tanggalKembali || '';
  const uniquePlates = (typeof collectUniquePlatesFromRecord === 'function')
    ? collectUniquePlatesFromRecord({ items, platNomor: firstItem.platNomor || '' })
    : [];

  const rawRecord = {
    id: prevRec.id || ('bbm_' + Date.now()),
    cloudId: prevRec.cloudId || null,
    fallbackTripCloudId: prevRec.fallbackTripCloudId || null,
    tripId: linkedTrip?.id || prevRec.tripId || null,
    tripCloudId: linkedTrip?.cloudId || prevRec.tripCloudId || null,
    isCloud: Boolean(prevRec.isCloud || prevRec.cloudId || prevRec.fallbackTripCloudId),
    kategoriKendaraan: document.getElementById('bbm_kategoriKendaraan')?.value || 'dinas',
    tanggalMasuk: '',
    tanggalBukti: receipt.tanggalBukti,
    tanggalKuitansi: receipt.tanggalKuitansi,
    nomorSPM: '-',
    nomorSPD: '-',
    pelaksanaNama: pelIdentity.nama,
    pelaksanaNip: pelIdentity.nip,
    pelaksanaPanggilan: pelIdentity.nama,
    pembuatBerkasNama: pelIdentity.nama,
    pembuatBerkasNip: pelIdentity.nip,
    pelaksanaBukti: pelaksanaBuktiStr,
    namaPenyedia: getV('bbm_namaPenyedia') || 'Biro Komunikasi Publik',
    noBukti: '-',
    noKuitansi: (typeof formatBbmNoKuitansi === 'function')
      ? formatBbmNoKuitansi(prevRec.noKuitansi, receipt.bulanAngka || '11', tahunBerkas)
      : `            /KW/Bend/Satker - Sj/${receipt.bulanAngka || '11'}/${tahunBerkas}`,
    kendaraan: firstItem.kendaraan || 'Mobil',
    platNomor: uniquePlates[0] || firstItem.platNomor || '',
    platDisplay: uniquePlates.join(' • ') || firstItem.platNomor || '',
    pekerjaan: getV('bbm_pekerjaan'),
    pekerjaanKuitansi: getV('bbm_pekerjaanKuitansi'),
    akun: getV('bbm_akun') || '146.01.WA.7665.EBA.994.002.0D.523121',
    namaAkun: getV('bbm_namaAkun') || 'Belanja Pemeliharaan Peralatan dan Mesin',
    outputKegiatan: 'Perawatan Kendaraan Bermotor',
    jenisPengadaan: getV('bbm_jenisPengadaan') || 'Perawatan Kendaraan Bermotor',
    mak: '523121',
    ta: tahunBerkas,
    items: items,
    nilaiTotal: sum,
    catatan: '',
    status_berkas: prevRec.status_berkas || 'diproses',
    status: prevRec.status || prevRec.status_berkas || 'diproses',
    createdAt: prevRec.createdAt || null,
    savedAt: prevRec.savedAt || null,
    createdBy: prevRec.createdBy || null,
    revision_log: Array.isArray(prevRec.revision_log) ? prevRec.revision_log : [],
    noST: curNoST,
    agenda: curAgenda,
    tanggalBerangkat: curTglBerangkat,
    tanggalKembali: curTglKembali,
    tujuanProvinsi: prevRec.tujuanProvinsi || linkedTrip?.provinsiTujuan || '',
    tujuanKota: prevRec.tujuanKota || linkedTrip?.kotaTujuan || '',
    pejabat: {
      ppkNama: document.getElementById('cfg_ppkNama')?.value || getV('bbm_ppkNama') || 'Emanuel Pati Libak, S.Pd., M.T.',
      ppkNip: document.getElementById('cfg_ppkNip')?.value || getV('bbm_ppkNip') || '197512072010121001',
      ppspmNama: document.getElementById('cfg_ppspmNama')?.value || getV('bbm_ppspmNama') || 'Mala Hayati Rahayu, S.E',
      ppspmNip: document.getElementById('cfg_ppspmNip')?.value || getV('bbm_ppspmNip') || '198408012009122003',
      bendaharaNama: document.getElementById('cfg_bendNama')?.value || getV('bbm_bendaharaNama') || 'Rahmat H',
      bendaharaNip: document.getElementById('cfg_bendNip')?.value || getV('bbm_bendaharaNip') || '198004022014081001',
      kasubbagTuNama: document.getElementById('cfg_ktuNama')?.value || getV('bbm_kasubbagTuNama') || 'Ahmad Jayadi, S.Hum., MT.',
      kasubbagTuNip: document.getElementById('cfg_ktuNip')?.value || getV('bbm_kasubbagTuNip') || '198702182010121003',
      verifikatorNama: String(document.getElementById('cfg_verifikatorNama')?.value || '').replace(/[ΓÇªrÇªÇª…]+/g, '').trim() || '..................................',
      verifikatorNip: document.getElementById('cfg_verifikatorNip')?.value || ''
    }
  };

  const record = (typeof normalizeBbmRecordState === 'function') ? normalizeBbmRecordState(rawRecord) : rawRecord;
  window.currentBbmRecord = record;
  return record;
}

/**
 * Simpan data BBM ke Arsip BBM, Pencairan, dan Database Cloud PocketBase (riwayat_bbm)
 */
async function saveCurrentBbmRecord() {
  if (window._isSavingBbm) return false;
  const record = collectBbmFormData();

  // Wajib terhubung ke SPT Induk Perjalanan Dinas (Non-DKI): tidak boleh disimpan tanpa SPT Induk
  const parentCheck = validateBbmParentSpt(record);
  if (!parentCheck.valid) {
    alert(
      'BERKAS BBM TERKUNCI — WAJIB ADA SPT INDUK PERJALANAN DINAS:\n\n' +
      (parentCheck.reason || 'Belum ada SPT Induk Perjalanan Dinas (Non-DKI) yang aktif.') +
      '\n\nNomor SPT Berkas BBM tidak dapat diisi atau dipilih manual karena mengikuti bundel SPT Induk Perdin (bukan DKI Jakarta 524113).' +
      '\nSilakan isi atau buka Perjalanan Dinas terlebih dahulu di Input Perjalanan, atau klik "+ Berkas BBM" dari Riwayat Perjalanan.'
    );
    const warnEl = document.getElementById('bbm_no_spt_lock_warning');
    if (warnEl) {
      warnEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  }

  const policy = (typeof evaluateBbmPencairanPolicy === 'function')
    ? evaluateBbmPencairanPolicy(record)
    : { isPerorangan: record.kategoriKendaraan === 'pribadi', eligiblePencairan: checkBbmDecemberRule(), badgeLabel: 'BBM' };

  if (!policy.eligiblePencairan) {
    const konfirm = confirm('PERHATIAN KETENTUAN KEMENKEU / SETJEN:\nTerhitung mulai tanggal 1 Desember 2026, penggantian biaya (reimburse/klaim) pembelian BBM khusus PERORANGAN / KENDARAAN PRIBADI tidak lagi diperkenankan dan TIDAK AKAN MASUK PENCAIRAN.\n\nApakah Anda tetap ingin menyimpannya sebagai arsip non-pencairan di database?');
    if (!konfirm) return false;
  }

  // Ambil daftar existing untuk mendeteksi pembuatan baru vs revisi dan menjaga cloudId & track record
  const existingAll = getSavedBbmRecordsList();
  const existingRec = existingAll.find(x => x && x.id === record.id) || null;
  const nowIso = new Date().toISOString();
  const actor = (typeof getCurrentRevisionActor === 'function')
    ? getCurrentRevisionActor()
    : { id: null, nama: record.pembuatBerkasNama || 'Operator', email: '-', role: 'operator', roleLabel: 'Operator' };

  // Paksa kunci penuh metadata SPT mengikuti Berkas Perdin induk (berkas tetap terpisah di riwayat_bbm)
  const linkedTrip = parentCheck.trip;
  const tab1Spt = (!linkedTrip && parentCheck.source === 'tab1') ? parentCheck.tab1Spt : null;
  if (linkedTrip) {
    record.noST = linkedTrip.noST;
    record.agenda = linkedTrip.agenda || record.agenda;
    record.tanggalBerangkat = linkedTrip.tglBerangkat || record.tanggalBerangkat;
    record.tanggalKembali = linkedTrip.tglKembali || record.tanggalKembali;
    record.tujuanProvinsi = linkedTrip.provinsiTujuan || '';
    record.tujuanKota = linkedTrip.kotaTujuan || '';
    record.tripId = linkedTrip.id;
    if (linkedTrip.cloudId) record.tripCloudId = linkedTrip.cloudId;
  } else if (tab1Spt) {
    record.noST = tab1Spt.noST;
    record.agenda = tab1Spt.agenda || record.agenda;
    record.tanggalBerangkat = tab1Spt.tglBerangkat || record.tanggalBerangkat;
    record.tanggalKembali = tab1Spt.tglKembali || record.tanggalKembali;
    record.tujuanProvinsi = tab1Spt.provinsiTujuan || '';
    record.tujuanKota = tab1Spt.kotaTujuan || '';
  }

  record.pekerjaan = getBbmUraianKegiatan(record);
  record.pekerjaanKuitansi = getBbmUraianKuitansi(record);
  record.savedAt = nowIso;

  if (existingRec) {
    record.cloudId = existingRec.cloudId || record.cloudId || null;
    record.fallbackTripCloudId = existingRec.fallbackTripCloudId || record.fallbackTripCloudId || null;
    record.isCloud = Boolean(existingRec.isCloud || record.cloudId || record.fallbackTripCloudId);
    record.createdAt = existingRec.createdAt || record.createdAt || nowIso;
    record.createdBy = existingRec.createdBy || record.createdBy || actor;

    // Pertahankan status pencairan jika masih layak masuk pencairan
    if (policy.eligiblePencairan) {
      record.status_berkas = existingRec.status_berkas === 'dicairkan' ? 'dicairkan' : 'diproses';
    } else {
      record.status_berkas = 'non_pencairan';
    }
    record.status = record.status_berkas;

    const prevLogs = Array.isArray(existingRec.revision_log) ? [...existingRec.revision_log] : [];
    const logsWithInit = prevLogs.some(l => l && l.action === 'buat_baru')
      ? prevLogs
      : [
          ...prevLogs,
          {
            id: 'rev_bbm_init_' + record.id,
            at: record.createdAt,
            actorId: (existingRec.createdBy || actor).id,
            actorName: (existingRec.createdBy || actor).nama,
            actorEmail: (existingRec.createdBy || actor).email,
            actorRole: (existingRec.createdBy || actor).role,
            actorRoleLabel: (existingRec.createdBy || actor).roleLabel,
            action: 'buat_baru',
            note: `Membuat berkas BBM (${policy.badgeLabel})`
          }
        ];

    logsWithInit.unshift({
      id: 'rev_bbm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      at: nowIso,
      actorId: actor.id,
      actorName: actor.nama,
      actorEmail: actor.email,
      actorRole: actor.role,
      actorRoleLabel: actor.roleLabel,
      action: 'revisi',
      note: `Memperbarui berkas BBM (${policy.badgeLabel}) • Total: ${formatRupiahMurni(record.nilaiTotal)} (${(record.items || []).length} struk)`
    });
    record.revision_log = logsWithInit;
  } else {
    record.createdAt = nowIso;
    record.createdBy = actor;
    record.status_berkas = policy.eligiblePencairan ? 'diproses' : 'non_pencairan';
    record.status = record.status_berkas;
    const statusAwalText = policy.eligiblePencairan ? 'Diproses ke Satker (Masuk Pencairan)' : 'Arsip Non-Pencairan (≥ 1 Des 2026)';
    record.revision_log = [{
      id: 'rev_bbm_init_' + Date.now(),
      at: nowIso,
      actorId: actor.id,
      actorName: actor.nama,
      actorEmail: actor.email,
      actorRole: actor.role,
      actorRoleLabel: actor.roleLabel,
      action: 'buat_baru',
      note: `Membuat berkas BBM baru (${policy.badgeLabel}) sebesar ${formatRupiahMurni(record.nilaiTotal)} • Status: ${statusAwalText}`
    }];
  }

  const normalized = (typeof normalizeBbmRecordState === 'function') ? normalizeBbmRecordState(record) : record;
  window.currentBbmRecord = normalized;

  // Simpan instan ke localStorage BBM (terpisah dari blob riwayat_perjadin)
  const localList = getSavedBbmRecordsList().filter(x => x.id !== normalized.id);
  localList.unshift(normalized);
  saveBbmStorageList(localList);

  refreshBbmSptLiveBanner(normalized);

  window._isSavingBbm = true;
  try {
    let savedCloudId = null;
    if (typeof uploadBbmRecordToCloud === 'function') {
      savedCloudId = await uploadBbmRecordToCloud(normalized);
      if (savedCloudId) {
        normalized.isCloud = true;
      }
    }

    renderBbmHistoryTable();
    if (typeof renderTripHistory === 'function') renderTripHistory();
    if (typeof renderDashboardModule === 'function') renderDashboardModule();

    if (typeof showRefreshToast === 'function') {
      const tipeLabel = `${normalized.kendaraan || 'Mobil'} (${normalized.policyBadgeLabel || policy.badgeLabel})`;
      if (savedCloudId) {
        showRefreshToast(
          'Berkas BBM Tersimpan di Database',
          `Pengajuan BBM ${tipeLabel} sebesar ${formatRupiahMurni(normalized.nilaiTotal)} berhasil masuk ke Database Cloud${normalized.layakPencairan ? ' & Daftar Pencairan' : ' (Arsip Non-Pencairan ≥ 1 Des 2026)'}.`
        );
      } else {
        showRefreshToast(
          'Berkas BBM Tersimpan Lokal',
          `Data BBM ${tipeLabel} sebesar ${formatRupiahMurni(normalized.nilaiTotal)} disimpan di perangkat. Login Admin/Operator & online untuk masuk ke Database.`
        );
      }
    }
    return true;
  } catch (err) {
    console.warn('Gagal menyimpan BBM ke Database Cloud:', err);
    renderBbmHistoryTable();
    if (typeof renderTripHistory === 'function') renderTripHistory();
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Data BBM Tersimpan Lokal', 'Data disimpan di penyimpanan lokal browser. Sinkronkan ke Database saat terhubung.');
    }
    return true;
  } finally {
    window._isSavingBbm = false;
  }
}

/**
 * Muat sampel Innova B 2577 KRK (terkunci mengikuti SPT Induk yang sedang aktif saja)
 */
function loadBbmSampleData() {
  const curCheck = validateBbmParentSpt(window.currentBbmRecord);
  const parentTrip = curCheck.trip || null;
  const tab1Spt = (!parentTrip && getActiveTab1SptInfo()) || null;

  if (!parentTrip && !tab1Spt) {
    alert('Belum ada SPT Induk Perjalanan Dinas (Non-DKI) yang aktif.\n\nSilakan isi/buka perjalanan dinas di Input Perjalanan atau klik "+ Berkas BBM" dari Riwayat Perjalanan terlebih dahulu.');
    return;
  }

  const sample = getDefaultBbmData();
  sample.id = 'bbm_innova_' + Date.now();
  if (parentTrip) {
    sample.tripId = parentTrip.id;
    if (parentTrip.cloudId) sample.tripCloudId = parentTrip.cloudId;
    sample.noST = parentTrip.noST;
    sample.agenda = parentTrip.agenda || sample.agenda;
    sample.tanggalBerangkat = parentTrip.tglBerangkat || sample.tanggalBerangkat;
    sample.tanggalKembali = parentTrip.tglKembali || sample.tanggalKembali;
    sample.tujuanProvinsi = parentTrip.provinsiTujuan || '';
    sample.tujuanKota = parentTrip.kotaTujuan || '';
  } else if (tab1Spt) {
    sample.noST = tab1Spt.noST;
    sample.agenda = tab1Spt.agenda || sample.agenda;
    sample.tanggalBerangkat = tab1Spt.tglBerangkat || sample.tanggalBerangkat;
    sample.tanggalKembali = tab1Spt.tglKembali || sample.tanggalKembali;
    sample.tujuanProvinsi = tab1Spt.provinsiTujuan || '';
    sample.tujuanKota = tab1Spt.kotaTujuan || '';
  }

  loadBbmRecordIntoForm(sample);
  updateBbmDocPreview();

  if (typeof showRefreshToast === 'function') {
    const sampleTotal = Array.isArray(sample.items)
      ? sample.items.reduce((s, it) => s + (Number(it.jumlah) || 0), 0)
      : (sample.nilaiTotal || 0);
    showRefreshToast('Contoh Dimuat', `Contoh struk (${formatRupiahMurni(sampleTotal)}) dimuat mengikuti SPT Induk "${sample.noST}". Klik Simpan Pengajuan untuk menyimpan ke database.`);
  }
}

/**
 * Reset form untuk pengajuan baru dengan tetap terkunci ke SPT Induk aktif (tidak pernah memilih acak SPT lain)
 */
function resetBbmForm(preferredTrip = undefined) {
  const prevCheck = validateBbmParentSpt(window.currentBbmRecord);
  const targetTrip = (preferredTrip !== undefined)
    ? preferredTrip
    : (prevCheck.trip || null);
  const tab1Spt = (!targetTrip && preferredTrip !== null && getActiveTab1SptInfo()) || null;

  const fresh = getDefaultBbmData();
  fresh.id = 'bbm_' + Date.now();
  delete fresh.cloudId;
  delete fresh.fallbackTripCloudId;
  fresh.isCloud = false;
  delete fresh.tripId;
  delete fresh.tripCloudId;
  fresh.noST = '';
  fresh.agenda = '';
  fresh.tanggalBerangkat = '';
  fresh.tanggalKembali = '';
  fresh.tujuanProvinsi = '';
  fresh.tujuanKota = '';
  fresh.revision_log = [];

  if (targetTrip) {
    fresh.tripId = targetTrip.id;
    if (targetTrip.cloudId) fresh.tripCloudId = targetTrip.cloudId;
    fresh.noST = targetTrip.noST || '';
    fresh.agenda = targetTrip.agenda || '';
    fresh.tanggalBerangkat = targetTrip.tglBerangkat || '';
    fresh.tanggalKembali = targetTrip.tglKembali || '';
    fresh.tujuanProvinsi = targetTrip.provinsiTujuan || '';
    fresh.tujuanKota = targetTrip.kotaTujuan || '';
    const pelRaw = targetTrip.lk_pelaksana || targetTrip.draft?.fields?.lk_pelaksana || targetTrip.pelaksanaNama || '';
    if (pelRaw) {
      const pid = resolveBbmPelaksanaIdentity(pelRaw);
      fresh.pelaksanaNama = pid.nama;
      if (pid.nip) fresh.pelaksanaNip = pid.nip;
    }
  } else if (tab1Spt) {
    fresh.noST = tab1Spt.noST;
    fresh.agenda = tab1Spt.agenda || '';
    fresh.tanggalBerangkat = tab1Spt.tglBerangkat || '';
    fresh.tanggalKembali = tab1Spt.tglKembali || '';
    fresh.tujuanProvinsi = tab1Spt.provinsiTujuan || '';
    fresh.tujuanKota = tab1Spt.kotaTujuan || '';
    if (tab1Spt.lk_pelaksana) {
      const pid = resolveBbmPelaksanaIdentity(tab1Spt.lk_pelaksana);
      fresh.pelaksanaNama = pid.nama;
      if (pid.nip) fresh.pelaksanaNip = pid.nip;
    }
  } else {
    fresh.pelaksanaNama = '';
    fresh.pelaksanaNip = '';
  }

  const hasValidSpt = Boolean(targetTrip || tab1Spt);
  fresh.kendaraan = 'Mobil';
  fresh.platNomor = hasValidSpt ? 'B 2577 KRK' : '';
  fresh.namaPenyedia = hasValidSpt ? 'Biro Komunikasi Publik' : '';
  fresh.jenisPengadaan = hasValidSpt ? 'Perawatan Kendaraan Bermotor' : '';
  fresh.akun = hasValidSpt ? '146.01.WA.7665.EBA.994.002.0D.523121' : '';
  fresh.namaAkun = hasValidSpt ? 'Belanja Pemeliharaan Peralatan dan Mesin' : '';
  fresh.pekerjaan = hasValidSpt ? 'Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas.' : '';
  fresh.pekerjaanKuitansi = hasValidSpt ? 'Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas, Output: Perawatan Kendaraan Bermotor.' : '';
  fresh.nilaiTotal = 0;
  fresh.items = hasValidSpt ? [
    {
      tanggal: new Date().toISOString().slice(0, 10),
      uraian: 'Pengisian Bahan Bakar Minyak (BBM)',
      jenisBbm: 'Pertamina Dex',
      liter: '',
      jumlah: 0
    }
  ] : [];

  loadBbmRecordIntoForm(fresh);
  if (hasValidSpt) updateBbmUraianOtomatis();
  updateBbmDocPreview();
}

let _bbmSearchQuery = '';
let _bbmHistoryFilter = 'all';

function setBbmHistoryFilter(filter) {
  _bbmHistoryFilter = filter || 'all';
  document.querySelectorAll('.bbm-hist-filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === _bbmHistoryFilter);
  });
  renderBbmHistoryTable();
}
window.setBbmHistoryFilter = setBbmHistoryFilter;

function onBbmSearchInput(query) {
  _bbmSearchQuery = String(query || '').trim().toLowerCase();
  const wrap = document.getElementById('bbmSearchWrap');
  if (wrap) {
    if (_bbmSearchQuery) wrap.classList.add('has-val');
    else wrap.classList.remove('has-val');
  }
  renderBbmHistoryTable();
}

function clearBbmHistorySearch() {
  const inp = document.getElementById('bbmHistorySearch');
  if (inp) {
    inp.value = '';
    onBbmSearchInput('');
    inp.focus();
  }
}

/**
 * Dapatkan HTML nama pelaksana yang memiliki bukti/struk BBM pada berkas ini
 * Mengutamakan nama-nama personil di setiap struk, bukan pembuat berkas perjadin
 */
function getBbmBuktiPelaksanaNames(item) {
  if (!item) return [];

  // 1. Kumpulkan nama-nama unik dari setiap struk di item.items
  if (Array.isArray(item.items) && item.items.length) {
    const names = [];
    const seen = new Set();

    item.items.forEach(it => {
      let n = (it.pelaksanaNama || '').trim();
      if (!n && it.uraian) {
        const m = it.uraian.match(/an\.\s+([^,\-]+(?:,\s*[A-Za-z.]+)?)/i);
        if (m) n = m[1].trim();
      }

      if (n && !seen.has(n.toLowerCase())) {
        seen.add(n.toLowerCase());
        names.push(n);
      }
    });

    if (names.length > 0) return names;
  }

  // 2. Jika ada field pelaksanaBukti yang tersimpan
  if (item.pelaksanaBukti && typeof item.pelaksanaBukti === 'string') {
    const list = item.pelaksanaBukti.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length > 0) return list;
  }

  // 3. Jika struk KDO atau dinas tanpa personil spesifik
  const isKdo = item.isPerorangan === false ||
                (item.kendaraan && item.kendaraan.toLowerCase().includes('kdo')) ||
                (item.platNomor && BBM_KDO_NOPOL_OPTIONS.includes(item.platNomor));
  if (isKdo) {
    return ['Kendaraan Dinas Operasional (KDO)'];
  }

  const pembuatBerkas = (document.getElementById('lk_pelaksana')?.value || '').trim().toLowerCase();
  const pel = (item.pelaksanaNama || item.pelaksanaPanggilan || '').trim();
  if (pel && (!pembuatBerkas || pel.toLowerCase() !== pembuatBerkas)) {
    return [pel];
  }

  return [];
}

function getBbmBuktiPelaksanaHtml(item) {
  const names = getBbmBuktiPelaksanaNames(item);
  if (!names.length) return '<span class="text-muted">-</span>';
  if (names.length === 1) return `<strong class="font-bold">${names[0]}</strong>`;
  return names.map(n => `<div class="font-bold" style="line-height: 1.35; margin: 2px 0;">${n}</div>`).join('');
}

function updateBbmHistoryRoleNotice() {
  const el = document.getElementById('bbmHistoryRoleNotice');
  if (!el) return;
  const user = (typeof currentAuthUser !== 'undefined') ? currentAuthUser : null;
  if (user && user.email) {
    const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (user.role === 'admin' || user.role === 'operator');
    if (canEdit) {
      el.className = 'history-role-banner banner-admin';
      el.style.display = 'flex';
      el.innerHTML = `
        <svg class="ico"><use href="#i-check"></use></svg>
        <span><strong>Akses ${user.role === 'admin' ? 'Administrator' : 'Role Khusus'} (${user.email}):</strong> Anda dapat menyimpan berkas BBM ke Database Cloud, memperbarui status pencairan (<em>Diproses ke Satker</em> &rarr; <em>Sudah Dicairkan</em>), dan memantau rekam jejak berkas. Khusus BBM perorangan berlaku s.d. sebelum <strong>1 Desember 2026</strong>.</span>
      `;
    } else {
      el.className = 'history-role-banner banner-guest';
      el.style.display = 'flex';
      el.innerHTML = `
        <svg class="ico"><use href="#i-info"></use></svg>
        <span><strong>Mode Pemantau / Viewer (${user.email}):</strong> Anda dapat memantau arsip, status pencairan, dan rekam jejak berkas BBM dari Database Cloud.</span>
      `;
    }
  } else {
    el.className = 'history-role-banner banner-guest';
    el.style.display = 'flex';
    el.innerHTML = `
      <svg class="ico"><use href="#i-info"></use></svg>
      <span><strong>Penyimpanan Cloud Aktif:</strong> Berkas BBM tersinkronisasi dengan koleksi Database <code>riwayat_bbm</code> dan Daftar Pencairan. Klik "Tarik / Sync Database" untuk menyinkronkan antar perangkat.</span>
    `;
  }
}

async function syncBbmFromCloud(silent = false) {
  const btn = document.getElementById('btnBbmCloudSync');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('is-loading');
  }
  try {
    if (typeof syncTripsFromCloud === 'function') {
      await syncTripsFromCloud(true);
    }
    if (typeof syncBbmRecordsFromCloud === 'function') {
      await syncBbmRecordsFromCloud(silent);
    }
    renderBbmHistoryTable();
    if (typeof renderTripHistory === 'function') renderTripHistory();
    if (typeof renderDashboardModule === 'function') renderDashboardModule();
    updateBbmHistoryRoleNotice();
  } catch (err) {
    console.error('Gagal sinkron BBM dari Cloud:', err);
    if (!silent) alert('Gagal menyinkronkan data BBM dengan database cloud: ' + (err.message || err));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('is-loading');
    }
  }
}

/**
 * Ubah status pencairan Berkas BBM ('diproses' <-> 'dicairkan') + catat ke Track Record & Database
 */
async function toggleBbmPencairanStatus(bbmId, e = null) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const canEdit = (typeof canCurrentUserEdit === 'function')
    ? canCurrentUserEdit()
    : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  if (!canEdit) {
    alert('Hanya Admin dan Role Khusus yang berhak memperbarui progres pencairan berkas BBM.');
    return;
  }

  const list = getSavedBbmRecordsList();
  const item = list.find(x => x && x.id === bbmId);
  if (!item) return;

  const policy = (typeof evaluateBbmPencairanPolicy === 'function')
    ? evaluateBbmPencairanPolicy(item)
    : { eligiblePencairan: true, badgeLabel: 'BBM' };

  if (!policy.eligiblePencairan) {
    alert('Berkas BBM khusus Perorangan mulai tanggal 1 Desember 2026 tidak memenuhi syarat masuk pencairan (hanya berlaku s.d. sebelum 1 Desember 2026).');
    return;
  }

  const curStatus = item.status_berkas || 'diproses';
  const newStatus = (curStatus === 'dicairkan') ? 'diproses' : 'dicairkan';
  const oldLabel = (curStatus === 'dicairkan') ? 'Sudah Dicairkan' : 'Diproses ke Satker';
  const newLabel = (newStatus === 'dicairkan') ? 'Sudah Dicairkan' : 'Diproses ke Satker';
  const nowIso = new Date().toISOString();
  const actor = (typeof getCurrentRevisionActor === 'function')
    ? getCurrentRevisionActor()
    : { id: null, nama: 'Administrator', email: '-', role: 'admin', roleLabel: 'Admin' };

  item.status_berkas = newStatus;
  item.status = newStatus;
  item.savedAt = nowIso;

  const logs = Array.isArray(item.revision_log) ? [...item.revision_log] : [];
  logs.unshift({
    id: 'rev_bbm_st_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    at: nowIso,
    actorId: actor.id,
    actorName: actor.nama,
    actorEmail: actor.email,
    actorRole: actor.role,
    actorRoleLabel: actor.roleLabel,
    action: 'status',
    note: `Update status pencairan BBM (${policy.badgeLabel}): ${oldLabel} → ${newLabel} (${formatRupiahMurni(item.nilaiTotal)})`
  });
  item.revision_log = logs;

  const updatedList = list.map(x => (x.id === item.id ? item : x));
  saveBbmStorageList(updatedList);

  if (window.currentBbmRecord && window.currentBbmRecord.id === item.id) {
    window.currentBbmRecord = item;
  }

  renderBbmHistoryTable();
  if (typeof renderTripHistory === 'function') renderTripHistory();
  if (typeof renderDashboardModule === 'function') renderDashboardModule();

  if (typeof showRefreshToast === 'function') {
    showRefreshToast(
      newStatus === 'dicairkan' ? 'Berkas BBM Telah Dicairkan' : 'Status BBM Kembali Diproses',
      `Status pencairan BBM ST "${item.noST || '-'}" (${formatRupiahMurni(item.nilaiTotal)}) diubah ke [${newLabel}] oleh ${actor.nama}.`
    );
  }

  if (typeof uploadBbmRecordToCloud === 'function') {
    try {
      await uploadBbmRecordToCloud(item);
      renderBbmHistoryTable();
      if (typeof renderTripHistory === 'function') renderTripHistory();
    } catch (err) {
      console.warn('Gagal sinkron status pencairan BBM ke Cloud:', err);
    }
  }
}
window.toggleBbmPencairanStatus = toggleBbmPencairanStatus;

/**
 * Tampilkan Modal / Laci Track Record Lengkap Berkas BBM
 */
function openBbmTrackRecordModal(bbmId, e = null) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const list = getSavedBbmRecordsList();
  const item = list.find(x => x && x.id === bbmId);
  if (!item) return;

  const esc = (s) => (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s);
  const fmtDate = (iso) => (typeof formatHistoryDate === 'function') ? formatHistoryDate(iso) : (iso || '-');
  const norm = (typeof normalizeBbmRecordState === 'function') ? normalizeBbmRecordState(item) : item;
  const logs = Array.isArray(norm.revision_log) ? norm.revision_log : [];

  const statusBadge = !norm.layakPencairan
    ? '<span class="badge badge-danger">Non-Pencairan (Perorangan ≥ 1 Des 2026)</span>'
    : (norm.status_berkas === 'dicairkan'
        ? '<span class="badge badge-success">Sudah Dicairkan</span>'
        : '<span class="badge badge-warning">Diproses ke Satker</span>');

  const logHtml = logs.length
    ? logs.map((rev, idx) => {
        const isInit = rev.action === 'buat_baru';
        const isStatus = rev.action === 'status';
        const marker = isInit ? 'BARU' : (isStatus ? 'STATUS' : `#${logs.length - idx}`);
        return `
          <div class="rev-log-entry">
            <div class="rev-log-marker ${isInit ? 'is-creator' : ''}">${marker}</div>
            <div class="rev-log-content">
              <div class="rev-log-meta">
                <strong class="rev-log-actor">${esc(rev.actorName || rev.actorEmail || 'Pengguna')}</strong>
                <span class="rev-role-tag rev-role-${rev.actorRole === 'admin' ? 'admin' : 'operator'}">${esc(rev.actorRoleLabel || 'Operator')}</span>
                <span class="rev-log-time">&bull; ${esc(fmtDate(rev.at))}</span>
              </div>
              <div class="rev-log-note">${esc(rev.note || '-')}</div>
            </div>
          </div>
        `;
      }).join('')
    : '<p style="color:#64748b;margin:8px 0;">Belum ada riwayat aktivitas tercatat.</p>';

  const modal = document.getElementById('bbmTrackRecordModal');
  const body = document.getElementById('bbmTrackRecordBody');
  const title = document.getElementById('bbmTrackRecordTitle');
  const linkedTrip = (typeof findLinkedPerjadinTrip === 'function')
    ? findLinkedPerjadinTrip(norm.noST, norm.tripId, norm.tripCloudId)
    : null;
  if (title) title.textContent = `Track Record Berkas BBM — ${norm.noST || norm.id}`;
  if (body) {
    body.innerHTML = `
      <div class="bbm-tr-summary">
        <div class="bbm-tr-row"><span>Nomor SPT / MAK:</span><strong>${esc(norm.noST || '-')} &bull; MAK ${esc(norm.mak || '523121')}</strong></div>
        <div class="bbm-tr-row"><span>Sinkronisasi Perdin:</span><strong>${linkedTrip ? `🔗 Tersinkron Berkas Perdin (${esc(linkedTrip.metodePembayaran || 'LS')}) <button type="button" class="btn btn-outline btn-xs" style="margin-left:6px;" onclick="closeBbmTrackRecordModal(); if(typeof openTripPdfModal==='function') openTripPdfModal('${linkedTrip.id}');">Lihat Perdin</button>` : 'Berkas BBM Terpisah (SPT Mandiri)'}</strong></div>
        <div class="bbm-tr-row"><span>Kategori Kebijakan:</span><strong>${esc(norm.policyBadgeLabel || '-')} (${esc(norm.keteranganPencairan || '')})</strong></div>
        <div class="bbm-tr-row"><span>Bukti Pembelian:</span><strong>${(norm.items || []).length} Struk Pembelian BBM</strong></div>
        <div class="bbm-tr-row"><span>Pelaksana Bukti BBM:</span><strong>${esc(norm.pelaksanaBukti || norm.pelaksanaNama || '-')}</strong></div>
        <div class="bbm-tr-row"><span>Total Nilai Klaim:</span><strong style="color:#059669;">${formatRupiahMurni(norm.nilaiTotal)}</strong></div>
        <div class="bbm-tr-row"><span>Status Pencairan:</span>${statusBadge}</div>
        <div class="bbm-tr-row"><span>Status Database:</span><strong>${norm.cloudId ? '☁️ Tersimpan di Database PocketBase (riwayat_bbm)' : (norm.fallbackTripCloudId ? '☁️ Tersimpan di Cloud (fallback)' : '💾 Masih di Lokal Browser — Belum Masuk Database')}</strong></div>
      </div>
      <h4 style="margin:14px 0 8px;font-size:13.5px;font-weight:700;">Rekam Jejak &amp; Riwayat Perubahan (${logs.length} Aktivitas)</h4>
      <div class="history-revision-timeline" style="display:block;max-height:300px;overflow-y:auto;">
        ${logHtml}
      </div>
    `;
  }
  if (modal) modal.style.display = 'flex';
}
window.openBbmTrackRecordModal = openBbmTrackRecordModal;

function closeBbmTrackRecordModal() {
  const modal = document.getElementById('bbmTrackRecordModal');
  if (modal) modal.style.display = 'none';
}
window.closeBbmTrackRecordModal = closeBbmTrackRecordModal;

/**
 * Render tabel daftar riwayat pengajuan BBM dengan Status Pencairan, Batas 1 Des 2026, Cloud Sync, & Track Record
 */
function renderBbmHistoryTable() {
  const tbody = document.getElementById('bbm_history_tbody');
  const countEl = document.getElementById('bbm_kpi_count');
  const totalCountEl = document.getElementById('bbmHistoryTotalCount');
  if (!tbody) return;

  updateBbmHistoryRoleNotice();

  const fullList = getSavedBbmRecordsList();
  if (countEl) countEl.textContent = fullList.length;
  if (totalCountEl) totalCountEl.textContent = `${fullList.length} Berkas BBM`;

  const masukPencairan = fullList.filter(x => x.layakPencairan);
  const dinasItems = fullList.filter(x => !x.isPerorangan);
  const peroranganValidItems = fullList.filter(x => x.isPerorangan && x.layakPencairan);
  const diprosesItems = masukPencairan.filter(x => (x.status_berkas || 'diproses') !== 'dicairkan');
  const dicairkanItems = masukPencairan.filter(x => x.status_berkas === 'dicairkan');
  const nonPencairanItems = fullList.filter(x => !x.layakPencairan);
  const unsyncedLocalItems = fullList.filter(x => !x.cloudId && !x.fallbackTripCloudId);

  const setCount = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setCount('bbmFilterCountAll', fullList.length);
  setCount('bbmFilterCountPencairan', masukPencairan.length);
  setCount('bbmFilterCountDinas', dinasItems.length);
  setCount('bbmFilterCountPerorangan', peroranganValidItems.length);
  setCount('bbmFilterCountDiproses', diprosesItems.length);
  setCount('bbmFilterCountDicairkan', dicairkanItems.length);
  setCount('bbmFilterCountNonPencairan', nonPencairanItems.length);

  const sumMasuk = masukPencairan.reduce((s, r) => s + (Number(r.nilaiTotal) || 0), 0);
  const sumDiproses = diprosesItems.reduce((s, r) => s + (Number(r.nilaiTotal) || 0), 0);
  const sumDicairkan = dicairkanItems.reduce((s, r) => s + (Number(r.nilaiTotal) || 0), 0);
  setCount('bbmHistSummaryMasuk', formatRupiahMurni(sumMasuk));
  setCount('bbmHistSummaryDiproses', formatRupiahMurni(sumDiproses));
  setCount('bbmHistSummaryDicairkan', formatRupiahMurni(sumDicairkan));

  // Tampilkan alert bila ada berkas bensin lokal yang belum masuk ke database Cloud
  const unsyncedBanner = document.getElementById('bbmUnsyncedDbBanner');
  if (unsyncedBanner) {
    if (unsyncedLocalItems.length > 0) {
      unsyncedBanner.style.display = 'flex';
      const txtEl = document.getElementById('bbmUnsyncedDbText');
      if (txtEl) {
        txtEl.innerHTML = `Terdapat <strong>${unsyncedLocalItems.length} Berkas BBM</strong> yang masih tersimpan lokal di browser ini dan <strong>belum masuk ke Database Cloud</strong>.`;
      }
    } else {
      unsyncedBanner.style.display = 'none';
    }
  }

  let list = fullList.filter(item => {
    if (_bbmHistoryFilter === 'pencairan' && !item.layakPencairan) return false;
    if (_bbmHistoryFilter === 'dinas' && item.isPerorangan) return false;
    if (_bbmHistoryFilter === 'perorangan' && (!item.isPerorangan || !item.layakPencairan)) return false;
    if (_bbmHistoryFilter === 'diproses' && (!item.layakPencairan || (item.status_berkas || 'diproses') === 'dicairkan')) return false;
    if (_bbmHistoryFilter === 'dicairkan' && (!item.layakPencairan || item.status_berkas !== 'dicairkan')) return false;
    if (_bbmHistoryFilter === 'non_pencairan' && item.layakPencairan) return false;
    return true;
  });

  if (_bbmSearchQuery) {
    list = list.filter(item => {
      const q = _bbmSearchQuery;
      const noSpt = String(item.noST || item.noSuratTugas || item.nomor_st || '').toLowerCase();
      const itemStrukText = Array.isArray(item.items)
        ? item.items.map(it => `${it.pelaksanaNama || ''} ${it.uraian || ''}`).join(' ').toLowerCase()
        : '';
      const pelBukti = String(item.pelaksanaBukti || '').toLowerCase();
      const pel = String(item.pelaksanaNama || item.pelaksanaPanggilan || '').toLowerCase();
      const ag = String(item.agenda || '').toLowerCase();
      const pej = String(item.pekerjaan || '').toLowerCase();
      const pol = String(item.policyBadgeLabel || '').toLowerCase();
      return noSpt.includes(q) || itemStrukText.includes(q) || pelBukti.includes(q) || pel.includes(q) || ag.includes(q) || pej.includes(q) || pol.includes(q);
    });
  }

  const esc = (s) => (typeof escapeHtml === 'function')
    ? escapeHtml(s)
    : String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  if (!list.length) {
    tbody.innerHTML = `
      <div class="history-empty-card">
        <div class="history-empty-icon">
          <svg class="ico"><use href="#i-fuel"></use></svg>
        </div>
        <h3>${_bbmSearchQuery ? 'Tidak Ditemukan Hasil' : 'Belum Ada Berkas BBM'}</h3>
        <p>${_bbmSearchQuery
          ? `Tidak ada berkas BBM yang cocok dengan kata kunci <em>"${esc(_bbmSearchQuery)}"</em>.`
          : 'Belum ada berkas BBM pada filter ini. Klik <strong>Simpan Pengajuan</strong> pada form BBM atau <strong>Tarik / Sync Database</strong>.'}</p>
        ${_bbmSearchQuery ? '<button type="button" class="btn btn-secondary" onclick="clearBbmHistorySearch()"><span>Bersihkan Pencarian</span></button>' : ''}
      </div>
    `;
    return;
  }

  const canEdit = (typeof canCurrentUserEdit === 'function')
    ? canCurrentUserEdit()
    : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  const isAdmin = (typeof isCurrentUserAdmin === 'function') ? isCurrentUserAdmin() : false;

  tbody.innerHTML = list.map((item) => {
    const noSpt = item.noST || item.noSuratTugas || item.nomor_st || '-';
    const escNoSpt = esc(noSpt);
    const escId = esc(item.id);
    const escMak = esc(item.mak || '523121');
    const itemCount = (item.items && item.items.length) ? item.items.length : 1;
    const tglLatest = item.tanggalBukti ? formatTanggalIndoLengkap(item.tanggalBukti) : '-';
    const savedDateTxt = (typeof formatHistoryDate === 'function' && (item.savedAt || item.createdAt))
      ? formatHistoryDate(item.savedAt || item.createdAt)
      : tglLatest;

    const isSyncedCloud = Boolean(item.cloudId || item.fallbackTripCloudId);
    const cloudBadge = isSyncedCloud
      ? '<span class="history-cloud-pill" title="Tersimpan di Database Cloud PocketBase">&#9729;&#65039; Database</span>'
      : '<span class="history-local-pill" title="Belum tersinkron ke Database Cloud">&#128190; Lokal</span>';

    const badgeText = item.policyBadgeLabel || (item.isPerorangan ? 'Perorangan ≤ 30 Nov' : 'KDO Dinas');
    const policyCls = item.policyJenis === 'perorangan_expired'
      ? 'is-expired'
      : (item.isPerorangan ? 'is-perorangan' : 'is-kdo');
    const policyTitle = item.policyJenis === 'perorangan_expired'
      ? 'Klaim perorangan ≥ 1 Des 2026 tidak masuk pencairan'
      : (item.keteranganPencairan || (item.isPerorangan ? 'Khusus perorangan s.d. sebelum 1 Desember 2026 (Masuk Pencairan)' : 'Kendaraan Dinas Operasional (KDO) — Masuk Pencairan'));
    const tipeBadge = `<span class="bbm-policy-pill ${policyCls}" title="${esc(policyTitle)}">${esc(badgeText)}</span>`;

    const linkedTrip = (typeof findLinkedPerjadinTrip === 'function')
      ? findLinkedPerjadinTrip(noSpt, item.tripId, item.tripCloudId)
      : null;
    const escTripId = linkedTrip ? esc(linkedTrip.id) : '';
    const perdinSyncPill = linkedTrip
      ? `<span class="history-cloud-pill history-perdin-sync-pill" onclick="if(typeof openTripPdfModal==='function') openTripPdfModal('${escTripId}', event)" title="Tersinkron dengan Berkas Perdin (${esc(linkedTrip.metodePembayaran || 'LS')}). Klik untuk membuka berkas Perdin induk.">&#128279; Sinkron Perdin (${esc(linkedTrip.metodePembayaran || 'LS')})</span>`
      : '';

    const agendaText = String(item.agenda || item.pekerjaan || 'Pengajuan Reimburse Pembelian BBM').trim();
    const escAgenda = esc(agendaText);

    const pelNames = getBbmBuktiPelaksanaNames(item);
    const pelPillsHtml = pelNames.length
      ? `${pelNames.slice(0, 6).map(n => `<span class="emp-pill">${esc(n)}</span>`).join('')}${pelNames.length > 6 ? `<span class="emp-pill more">+${pelNames.length - 6} lainnya</span>` : ''}`
      : '<span class="text-muted" style="font-size:12px;">-</span>';

    const logs = Array.isArray(item.revision_log) ? item.revision_log : [];
    const latestLog = logs[0];
    const trackRecordHtml = `
      <div class="bbm-card-track-bar">
        <button type="button" class="bbm-track-btn" onclick="openBbmTrackRecordModal('${escId}', event)" title="Klik untuk melihat riwayat pembuatan, revisi, dan status pencairan berkas ini">
          &#128338; Track Record (${logs.length})
        </button>
        ${latestLog ? `<span class="bbm-track-latest" title="${esc(latestLog.note || '')}">Terakhir: <strong>${esc(latestLog.actorName || 'Sistem')}</strong> &bull; ${esc(typeof formatHistoryDate === 'function' ? formatHistoryDate(latestLog.at) : '')}</span>` : ''}
      </div>
    `;

    let statusBadgeHtml = '';
    let statusActionBtn = '';
    if (!item.layakPencairan) {
      statusBadgeHtml = `<span class="badge badge-danger" title="Mulai 1 Des 2026, BBM Perorangan tidak masuk pencairan">Non-Pencairan</span>`;
    } else if (item.status_berkas === 'dicairkan') {
      statusBadgeHtml = `<span class="history-status-badge status-dicairkan" ${canEdit ? `onclick="toggleBbmPencairanStatus('${escId}', event)" style="cursor:pointer;" title="Klik untuk ubah status kembali ke Diproses ke Satker"` : ''}><svg class="ico" style="width:13px;height:13px;"><use href="#i-check"></use></svg><span>Sudah Dicairkan</span></span>`;
      if (canEdit) {
        statusActionBtn = `<button type="button" class="btn btn-status-toggle is-diproses" onclick="toggleBbmPencairanStatus('${escId}', event)" title="Kembalikan status ke Diproses ke Satker"><svg class="ico"><use href="#i-refresh"></use></svg><span>Ubah ke Diproses</span></button>`;
      }
    } else {
      statusBadgeHtml = `<span class="history-status-badge status-diproses" ${canEdit ? `onclick="toggleBbmPencairanStatus('${escId}', event)" style="cursor:pointer;" title="Klik untuk menandai Berkas BBM Sudah Dicairkan"` : ''}><svg class="ico" style="width:13px;height:13px;"><use href="#i-clipboard"></use></svg><span>Diproses ke Satker</span></span>`;
      if (canEdit) {
        statusActionBtn = `<button type="button" class="btn btn-status-toggle is-dicairkan" onclick="toggleBbmPencairanStatus('${escId}', event)" title="Tandai berkas BBM ini Sudah Dicairkan"><svg class="ico"><use href="#i-check"></use></svg><span>Tandai Dicairkan</span></button>`;
      }
    }

    return `
      <div class="history-card card-method-bbm" data-bbm-id="${escId}" onclick="if(event && event.target && event.target.closest('button, a, .history-status-badge, .history-perdin-sync-pill, .bbm-track-btn')) return; onBbmHistoryPrint('${escId}');" title="Klik untuk pratinjau &amp; cetak dokumen Berkas BBM">
        <div class="history-card-top">
          <div class="history-card-st">
            <span class="history-st-badge">${escNoSpt}</span>
            ${tipeBadge}
            <span class="history-mak-pill" title="Mata Anggaran Kegiatan (MAK)">MAK: ${escMak}</span>
            ${statusBadgeHtml}
            ${cloudBadge}
            ${perdinSyncPill}
          </div>
          <div class="history-card-date">
            <svg class="ico"><use href="#i-calendar"></use></svg>
            <span>Disimpan: ${esc(savedDateTxt)}</span>
          </div>
        </div>

        <div class="history-card-body">
          <h3 class="history-card-agenda">${escAgenda}</h3>

          <div class="history-meta-grid">
            <div class="history-meta-item">
              <span class="meta-label">Tanggal Bukti</span>
              <span class="meta-val">${esc(tglLatest)}</span>
            </div>
            <div class="history-meta-item">
              <span class="meta-label">Bukti Pembelian</span>
              <span class="meta-val">${itemCount} Struk BBM</span>
            </div>
            <div class="history-meta-item history-meta-cost">
              <span class="meta-label">Total Klaim BBM</span>
              <span class="meta-val cost-text">${formatRupiahMurni(item.nilaiTotal)}</span>
            </div>
          </div>

          <div class="bbm-card-pelaksana-wrap">
            <span class="bbm-card-pelaksana-lbl">Pelaksana Bukti:</span>
            <div class="history-emp-pills">${pelPillsHtml}</div>
          </div>

          ${trackRecordHtml}
        </div>

        <div class="history-card-actions">
          ${statusActionBtn}
          <button type="button" class="btn btn-primary btn-sm" onclick="onBbmHistoryOpen('${escId}')" title="Buka dan Edit Formulir">
            <svg class="ico"><use href="#i-edit"></use></svg><span>Edit / Buka Form</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="onBbmHistoryPrint('${escId}')" title="Pratinjau &amp; Cetak Dokumen">
            <svg class="ico"><use href="#i-print"></use></svg><span>Cetak Dokumen</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="onBbmHistoryExcel('${escId}')" title="Ekspor ke Excel (.xlsx)">
            <svg class="ico"><use href="#i-file"></use></svg><span>Unduh Excel</span>
          </button>
          ${linkedTrip ? `
          <button type="button" class="btn btn-outline btn-sm bbm-card-perdin-btn" onclick="if(typeof openTripPdfModal==='function') openTripPdfModal('${escTripId}', event)" title="Buka berkas Perjalanan Dinas induk">
            <svg class="ico"><use href="#i-file-lines"></use></svg><span>Lihat Perdin Induk</span>
          </button>` : ''}
          ${isAdmin ? `
          <button type="button" class="btn btn-outline btn-sm bbm-card-del-btn" onclick="onBbmHistoryDelete('${escId}')" title="Hapus Pengajuan BBM dari Lokal &amp; Database Cloud">
            <svg class="ico"><use href="#i-trash"></use></svg><span>Hapus</span>
          </button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function onBbmHistoryOpen(id) {
  const list = getSavedBbmRecordsList();
  const found = list.find(x => x.id === id);
  if (found) {
    window._bbmExplicitLock = true;
    loadBbmRecordIntoForm(found);
    switchBbmTabSubView('form');
    updateBbmDocPreview();
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Berkas Terbuka', `Data BBM ${found.noST ? 'ST "' + found.noST + '"' : 'terpilih'} dimuat ke formulir.`);
    }
  }
}

function onBbmHistoryPrint(id) {
  const list = getSavedBbmRecordsList();
  const found = list.find(x => x.id === id);
  if (found) {
    window._bbmExplicitLock = true;
    loadBbmRecordIntoForm(found);
    switchBbmTabSubView('docs');
    updateBbmDocPreview();
  }
}

function onBbmHistoryExcel(id) {
  const list = getSavedBbmRecordsList();
  const found = list.find(x => x.id === id);
  if (found && typeof exportBbmToExcel === 'function') {
    exportBbmToExcel(found);
  }
}

async function onBbmHistoryDelete(id) {
  const list = getSavedBbmRecordsList();
  const target = list.find(x => x && x.id === id);
  if (!target) return;

  const isAdmin = (typeof isCurrentUserAdmin === 'function') ? isCurrentUserAdmin() : true;
  if ((target.cloudId || target.fallbackTripCloudId) && !isAdmin) {
    alert('Hanya akun Administrator yang berhak menghapus data BBM yang sudah tersimpan di Database Cloud.');
    return;
  }
  if (!confirm(`Yakin ingin menghapus pengajuan BBM "${target.noST || target.id}"?`)) return;

  const remaining = list.filter(x => x.id !== id);
  saveBbmStorageList(remaining);

  if (window._fallbackBbmFromTrips instanceof Map) {
    window._fallbackBbmFromTrips.delete(id);
  }
  if ((target.cloudId || target.fallbackTripCloudId) && typeof removeBbmRecordFromCloud === 'function') {
    await removeBbmRecordFromCloud(target.cloudId, target.fallbackTripCloudId);
  }

  if (window.currentBbmRecord && window.currentBbmRecord.id === id) {
    if (remaining.length > 0) {
      window.currentBbmRecord = remaining[0];
      loadBbmRecordIntoForm(window.currentBbmRecord);
    } else {
      window.currentBbmRecord = null;
      resetBbmForm(null);
    }
  }

  renderBbmHistoryTable();
  if (typeof renderTripHistory === 'function') renderTripHistory();
  if (typeof renderDashboardModule === 'function') renderDashboardModule();
  updateBbmDocPreview();
}
window.onBbmHistoryDelete = onBbmHistoryDelete;

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
 * Cetak Dokumen BBM (wajib memiliki SPT Induk Perdin Non-DKI)
 */
async function printBbmActiveDocument() {
  const data = collectBbmFormData();
  const ok = await saveCurrentBbmRecord();
  if (!ok) return;

  // Pastikan render target siap cetak
  updateBbmDocPreview();
  window.print();
}

/**
 * Ekspor Excel BBM (wajib memiliki SPT Induk Perdin Non-DKI)
 */
async function downloadBbmExcelCurrent() {
  const data = collectBbmFormData();
  const ok = await saveCurrentBbmRecord();
  if (!ok) return;
  if (typeof exportBbmToExcel === 'function') {
    exportBbmToExcel(data);
  }
}
