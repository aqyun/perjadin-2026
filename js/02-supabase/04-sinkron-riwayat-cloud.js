// =====================================================================
// SINKRONISASI DATA RIWAYAT CLOUD (riwayat_perjadin)
// =====================================================================

function normalizeStKey(noST) {
  const s = String(noST || '').trim();
  if (!s) return '';
  const low = s.toLowerCase();
  if (low === 'tanpa nomor st' || low === 'tanpa no st' || low === '-') return '';
  return low;
}

// Composite Key Anti-Duplikat: Nomor ST boleh sama asalkan beda metode (LS/KKP) atau beda MAK
function getTripCompositeDedupeKey(itemOrNoST, makParam, metodeParam) {
  if (itemOrNoST && typeof itemOrNoST === 'object' && itemOrNoST.recordType === 'bbm') {
    const bbmUid = itemOrNoST.bbmRecordId || itemOrNoST.bbmData?.id || itemOrNoST.id || '';
    return bbmUid ? `bbm__${String(bbmUid).toLowerCase()}` : '';
  }
  if (typeof window !== 'undefined' && typeof window.getTripCompositeDedupeKey === 'function' && window.getTripCompositeDedupeKey !== getTripCompositeDedupeKey) {
    return window.getTripCompositeDedupeKey(itemOrNoST, makParam, metodeParam);
  }
  let noST = '';
  let mak = '';
  let metode = 'LS';

  if (itemOrNoST && typeof itemOrNoST === 'object') {
    noST = itemOrNoST.noST || (itemOrNoST.draft && itemOrNoST.draft.fields && (itemOrNoST.draft.fields.noST || itemOrNoST.draft.fields.noSTNum)) || '';
    mak = (itemOrNoST.mak != null && itemOrNoST.mak !== '')
      ? itemOrNoST.mak
      : ((itemOrNoST.draft && itemOrNoST.draft.fields && itemOrNoST.draft.fields.mak) || '');
    metode = itemOrNoST.metodePembayaran
      || (itemOrNoST.draft && itemOrNoST.draft.fields && (itemOrNoST.draft.fields.metodePembayaran || itemOrNoST.draft.fields.lk_metodePembayaran))
      || 'LS';
  } else {
    noST = itemOrNoST || '';
    mak = makParam || '';
    metode = metodeParam || 'LS';
  }

  const sST = String(noST || '').trim();
  if (!sST) return '';
  const lowST = sST.toLowerCase();
  if (lowST === 'tanpa nomor st' || lowST === 'tanpa no st' || lowST === '-') return '';

  const cleanMak = String(mak || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
  const cleanMetode = String(metode || 'LS').trim().toUpperCase() === 'KKP' ? 'KKP' : 'LS';

  return `${lowST}__${cleanMetode}__${cleanMak}`;
}

function mergeRevisionLogs(logA, logB) {
  const listA = Array.isArray(logA) ? logA : [];
  const listB = Array.isArray(logB) ? logB : [];
  if (listA.length === 0 && listB.length === 0) return [];
  const seen = new Set();
  const combined = [];
  [...listA, ...listB].forEach(entry => {
    if (!entry || !entry.at) return;
    const key = entry.id || `${entry.at}|${entry.actorEmail || entry.actorName || ''}|${entry.note || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    combined.push(entry);
  });
  return combined.sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());
}

function mergeTripItemsCleanly(existing, incoming) {
  if (!existing) return incoming;
  if (!incoming) return existing;
  const tExisting = new Date(existing.savedAt || 0).getTime();
  const tIncoming = new Date(incoming.savedAt || 0).getTime();
  const newer = tIncoming >= tExisting ? incoming : existing;
  const older = tIncoming >= tExisting ? existing : incoming;
  return {
    ...older,
    ...newer,
    id: existing.id || incoming.id,
    cloudId: newer.cloudId || older.cloudId || null,
    isCloud: Boolean(newer.isCloud || older.isCloud),
    csv_data: newer.csv_data || older.csv_data || '',
    createdBy: older.createdBy || newer.createdBy || null,
    createdAt: older.createdAt || newer.createdAt || older.savedAt || newer.savedAt,
    revision_log: mergeRevisionLogs(older.revision_log, newer.revision_log)
  };
}

// =====================================================================
// KEBIJAKAN PENCAIRAN, SINKRONISASI SPT & TRACK RECORD BERKAS BBM (MAK 523121)
// =====================================================================
const BBM_CLOUD_STORAGE_KEY = 'perdinku_bbm_records_v1';
const BBM_KDO_PLATES = ['B 2223 UKQ', 'B 2602 UYZ', 'B 2577 KRK'];
const BBM_PERORANGAN_CUTOFF_DATE = '2026-12-01'; // Klaim perorangan hanya diperkenankan s.d. sebelum 1 Desember 2026

function normalizePlateText(plate = '') {
  return String(plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function isOfficialKdoPlate(plate = '') {
  const normPlate = normalizePlateText(plate);
  if (!normPlate) return false;
  return BBM_KDO_PLATES.some(p => normPlate.includes(normalizePlateText(p)));
}
window.isOfficialKdoPlate = isOfficialKdoPlate;

function normalizeSptMatchKey(noST = '') {
  const s = String(noST || '').trim().toLowerCase();
  if (!s || s === '-' || s === 'tanpa nomor st' || s === 'tanpa no st') return '';
  return s.replace(/\s+/g, '');
}
window.normalizeSptMatchKey = normalizeSptMatchKey;

/**
 * Memastikan apakah entri di riwayat_perjadin / localStorage sebenarnya merupakan baris BBM (MAK 523121 / Reimburse BBM / fallback),
 * bukan berkas Perjalanan Dinas induk.
 */
function isNonPerdinBbmEntry(item) {
  if (!item || typeof item !== 'object') return false;
  if (item.recordType === 'bbm') return true;
  const idStr = String(item.id || '').trim();
  if (idStr.startsWith('trip_bbm_') || idStr.startsWith('bbm_')) return true;
  const mak = String(item.mak || item.draft?.fields?.mak || '').trim();
  if (mak === '523121') return true;
  const agenda = String(item.agenda || item.draft?.fields?.agenda || '').trim().toLowerCase();
  const kota = String(item.kotaTujuan || '').trim().toLowerCase();
  if (/^reimburse\s*bbm/i.test(agenda)) return true;
  if (agenda.includes('reimburse bbm') && (!kota || kota.includes('523121') || kota.includes('perawatan kendaraan'))) return true;
  if (kota.includes('perawatan kendaraan / operasional') || kota.includes('mak 523121')) return true;
  return false;
}
window.isNonPerdinBbmEntry = isNonPerdinBbmEntry;

/**
 * Mencari berkas Perjalanan Dinas induk (non-DKI) berdasarkan tripId/cloudId atau Nomor SPT.
 * Digunakan untuk menjaga sinkronisasi antara Berkas BBM terpisah (MAK 523121) dan Berkas Perjadin induknya.
 */
function findLinkedPerjadinTrip(noST = '', tripId = null, tripCloudId = null) {
  if (typeof getTripHistoryList !== 'function') return null;
  const rawTrips = getTripHistoryList();
  const trips = rawTrips.filter(t => {
    if (!t || isNonPerdinBbmEntry(t)) return false;
    if (typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(t)) return false;
    return true;
  });

  if (tripId) {
    const byId = trips.find(t => String(t.id) === String(tripId));
    if (byId) return byId;
  }
  if (tripCloudId) {
    const byCid = trips.find(t => t.cloudId && String(t.cloudId) === String(tripCloudId));
    if (byCid) return byCid;
  }

  const key = normalizeSptMatchKey(noST);
  if (!key) return null;
  const matches = trips.filter(t => normalizeSptMatchKey(t.noST) === key);
  if (!matches.length) return null;
  // Prioritaskan LS bila ada beberapa metode pada SPT yang sama
  return matches.find(t => String(t.metodePembayaran || 'LS').toUpperCase() === 'LS') || matches[0];
}
window.findLinkedPerjadinTrip = findLinkedPerjadinTrip;

function collectUniquePlatesFromRecord(record = {}) {
  const items = Array.isArray(record.items) ? record.items : [];
  const seen = new Set();
  const plates = [];
  items.forEach(it => {
    const p = String(it?.platNomor || '').toUpperCase().replace(/\s+/g, ' ').trim();
    const k = normalizePlateText(p);
    if (p && k && !seen.has(k)) {
      seen.add(k);
      plates.push(p);
    }
  });
  if (!plates.length && record.platNomor) {
    const p = String(record.platNomor).toUpperCase().replace(/\s+/g, ' ').trim();
    if (p) plates.push(p);
  }
  return plates;
}
window.collectUniquePlatesFromRecord = collectUniquePlatesFromRecord;

function isKdoItemOrPlate(item, fallbackPlat = '') {
  if (!item) return false;
  const pel = String(item.pelaksanaNama || '').toLowerCase();
  const uraian = String(item.uraian || '').toLowerCase();
  const itemPlat = String(item.platNomor || '').trim();
  const effPlat = itemPlat || String(fallbackPlat || '').trim();
  if (isOfficialKdoPlate(effPlat)) return true;
  if (pel.includes('kdo') || pel.includes('kendaraan dinas operasional') || uraian.includes('(kdo)') || uraian.includes('kendaraan dinas operasional')) return true;
  return false;
}

/**
 * Evaluasi kelayakan pencairan Berkas BBM:
 * - Kendaraan Dinas Operasional (KDO, plat resmi biro B 2223 UKQ / B 2602 UYZ / B 2577 KRK): Masuk pencairan (berlaku seterusnya).
 * - Khusus Perorangan / Kendaraan Pribadi (non-KDO): Hanya masuk pencairan s.d. sebelum 1 Desember 2026 (< 2026-12-01).
 */
function evaluateBbmPencairanPolicy(record = {}) {
  const kat = String(record.kategoriKendaraan || 'dinas').toLowerCase().trim() === 'pribadi' ? 'pribadi' : 'dinas';
  const items = Array.isArray(record.items) ? record.items : [];
  const itemDatesAll = items.map(it => String(it?.tanggal || '').trim()).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const fallbackDates = [record.tanggalBukti, record.tanggalKembali, record.tanggalBerangkat]
    .map(d => String(d || '').trim())
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const allDates = (itemDatesAll.length ? itemDatesAll : fallbackDates).sort();
  const latestDate = allDates[allDates.length - 1] || '';

  const fallbackPlat = items.length ? '' : (record.platNomor || '');
  const kdoItems = [];
  const personalItems = [];

  if (items.length > 0) {
    items.forEach(it => {
      const itemPlat = String(it?.platNomor || '').trim();
      if (isOfficialKdoPlate(itemPlat) || (isKdoItemOrPlate(it, '') && !itemPlat)) {
        kdoItems.push(it);
      } else if (itemPlat && !isOfficialKdoPlate(itemPlat)) {
        // Plat non-KDO jelas merupakan kendaraan perorangan
        personalItems.push(it);
      } else if (kat === 'pribadi') {
        // Tanpa plat KDO dan mode form Perorangan -> Perorangan
        personalItems.push(it);
      } else if (!itemPlat && isOfficialKdoPlate(record.platNomor)) {
        kdoItems.push(it);
      } else {
        kdoItems.push(it);
      }
    });
  } else if (isOfficialKdoPlate(fallbackPlat)) {
    kdoItems.push({ platNomor: fallbackPlat });
  } else if (kat === 'pribadi') {
    personalItems.push({ platNomor: fallbackPlat });
  } else {
    kdoItems.push({ platNomor: fallbackPlat });
  }

  const hasKdoItems = kdoItems.length > 0;
  const isMixed = hasKdoItems && personalItems.length > 0;
  const isPerorangan = personalItems.length > 0;

  const personalDates = personalItems
    .map(it => String(it?.tanggal || '').trim())
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const checkDates = personalDates.length ? personalDates : allDates;
  const isOverDec1Cutoff = isPerorangan && checkDates.some(d => d >= BBM_PERORANGAN_CUTOFF_DATE);

  if (!isPerorangan) {
    return {
      isPerorangan: false,
      isMixed: false,
      policyJenis: 'kdo',
      eligiblePencairan: true,
      latestDate,
      badgeLabel: 'KDO Dinas',
      reason: 'Kendaraan Dinas Operasional (KDO) — Masuk Pencairan'
    };
  }

  if (isOverDec1Cutoff) {
    return {
      isPerorangan: true,
      isMixed,
      policyJenis: 'perorangan_expired',
      eligiblePencairan: false,
      latestDate,
      badgeLabel: isMixed ? 'KDO + Perorangan ≥ 1 Des' : 'Perorangan ≥ 1 Des 2026',
      reason: 'Tidak masuk pencairan: Klaim BBM perorangan/kendaraan pribadi tidak diperkenankan terhitung mulai 1 Desember 2026'
    };
  }

  return {
    isPerorangan: true,
    isMixed,
    policyJenis: 'perorangan_valid',
    eligiblePencairan: true,
    latestDate,
    badgeLabel: isMixed ? 'KDO + Perorangan ≤ 30 Nov' : 'Perorangan ≤ 30 Nov',
    reason: isMixed
      ? 'Gabungan KDO & Perorangan sebelum 1 Desember 2026 — Masuk Pencairan'
      : 'BBM Khusus Perorangan sebelum 1 Desember 2026 — Masuk Pencairan'
  };
}
window.evaluateBbmPencairanPolicy = evaluateBbmPencairanPolicy;

function isBbmLinkedToDkiOnlyTrip(record) {
  if (!record) return false;
  const noST = String(record.noST || '').trim();
  if (!noST || typeof getTripHistoryList !== 'function' || typeof isDkiJakartaTrip !== 'function') return false;
  const trips = getTripHistoryList();
  const noStKey = normalizeSptMatchKey(noST);
  const matching = trips.filter(t => t && t.recordType !== 'bbm' && normalizeSptMatchKey(t.noST) === noStKey);
  if (!matching.length) return false;
  const allDki = matching.every(t => isDkiJakartaTrip(t));
  if (!allDki) return false;
  if ((Number(record.nilaiTotal) || 0) <= 0) return true;
  const mak = String(record.mak || '').trim();
  return mak !== '523121';
}
window.isBbmLinkedToDkiOnlyTrip = isBbmLinkedToDkiOnlyTrip;

function normalizeBbmRecordState(rawRecord) {
  if (!rawRecord || typeof rawRecord !== 'object') return null;
  const rec = { ...rawRecord };
  const policy = evaluateBbmPencairanPolicy(rec);
  const nowIso = new Date().toISOString();

  // Pastikan kategoriKendaraan konsisten dengan item plat aktual (mis. plat B 2577 KRK saja = dinas)
  if (!policy.isPerorangan && rec.kategoriKendaraan === 'pribadi') {
    rec.kategoriKendaraan = 'dinas';
  }
  const uniquePlates = collectUniquePlatesFromRecord(rec);
  if (uniquePlates.length > 0) {
    rec.platNomor = uniquePlates[0];
    rec.platDisplay = uniquePlates.join(' • ');
  } else {
    rec.platDisplay = rec.platNomor || '-';
  }

  // Sinkronkan metadata SPT jika tertaut ke Berkas Perjadin non-DKI sesuai Nomor SPT
  const linkedTrip = findLinkedPerjadinTrip(rec.noST, rec.tripId, rec.tripCloudId);
  if (linkedTrip) {
    rec.tripId = linkedTrip.id;
    if (linkedTrip.cloudId) rec.tripCloudId = linkedTrip.cloudId;
    if (linkedTrip.noST) rec.noST = linkedTrip.noST;
    if (!rec.agenda && linkedTrip.agenda) rec.agenda = linkedTrip.agenda;
    if (!rec.tanggalBerangkat && linkedTrip.tglBerangkat) rec.tanggalBerangkat = linkedTrip.tglBerangkat;
    if (!rec.tanggalKembali && linkedTrip.tglKembali) rec.tanggalKembali = linkedTrip.tglKembali;
    if (!rec.tujuanProvinsi && linkedTrip.provinsiTujuan) rec.tujuanProvinsi = linkedTrip.provinsiTujuan;
    if (!rec.tujuanKota && linkedTrip.kotaTujuan) rec.tujuanKota = linkedTrip.kotaTujuan;
  }

  if (!rec.pelaksanaBukti && Array.isArray(rec.items)) {
    const set = new Set();
    rec.items.forEach(it => {
      let n = String(it?.pelaksanaNama || '').trim();
      if (!n && it?.uraian) {
        const m = String(it.uraian).match(/an\.\s+([^,\-]+(?:,\s*[A-Za-z.]+)?)/i);
        if (m) n = m[1].trim();
      }
      if (n) set.add(n);
    });
    rec.pelaksanaBukti = [...set].join(', ');
  }

  if (Array.isArray(rec.items) && rec.items.length > 0 && (rec.nilaiTotal == null || Number.isNaN(Number(rec.nilaiTotal)))) {
    rec.nilaiTotal = rec.items.reduce((acc, it) => acc + (Number(it?.jumlah) || 0), 0);
  }
  rec.nilaiTotal = Number(rec.nilaiTotal) || 0;
  rec.mak = rec.mak || '523121';
  if (!rec.tanggalBukti && policy.latestDate) rec.tanggalBukti = policy.latestDate;

  rec.layakPencairan = policy.eligiblePencairan;
  rec.keteranganPencairan = policy.reason;
  rec.policyJenis = policy.policyJenis;
  rec.policyBadgeLabel = policy.badgeLabel;
  rec.isPerorangan = policy.isPerorangan;
  rec.isMixedKendaraan = Boolean(policy.isMixed);

  let st = String(rec.status_berkas || '').trim().toLowerCase();
  if (!st || st === 'selesai') {
    st = (rec.status === 'dicairkan') ? 'dicairkan' : 'diproses';
  }
  if (!policy.eligiblePencairan) {
    st = 'non_pencairan';
  } else if (st !== 'dicairkan') {
    st = 'diproses';
  }
  rec.status_berkas = st;
  rec.status = st;

  rec.createdAt = rec.createdAt || rec.savedAt || nowIso;
  rec.savedAt = rec.savedAt || rec.createdAt || nowIso;

  const actor = (typeof currentAuthUser !== 'undefined' && currentAuthUser)
    ? {
        id: currentAuthUser.id || null,
        nama: currentAuthUser.nama || (currentAuthUser.email ? currentAuthUser.email.split('@')[0] : 'Pengguna'),
        email: currentAuthUser.email || '-',
        role: currentAuthUser.role || 'operator',
        roleLabel: currentAuthUser.role === 'admin' ? 'Admin' : 'Role Khusus'
      }
    : { id: null, nama: rec.pembuatBerkasNama || rec.pelaksanaNama || 'Pembuat Berkas', email: '-', role: 'operator', roleLabel: 'Operator' };

  if (!rec.createdBy) {
    rec.createdBy = {
      id: actor.id || null,
      nama: rec.pembuatBerkasNama || rec.pelaksanaNama || actor.nama,
      email: actor.email || '-',
      role: actor.role || 'operator',
      roleLabel: actor.roleLabel || 'Role Khusus'
    };
  }

  let logs = Array.isArray(rec.revision_log) ? rec.revision_log.filter(Boolean) : [];
  if (!logs.some(r => r && r.action === 'buat_baru')) {
    const maker = rec.createdBy || actor;
    logs = [...logs, {
      id: 'rev_bbm_init_' + (rec.id || Date.now()),
      at: rec.createdAt,
      actorId: maker.id || null,
      actorName: maker.nama || rec.pembuatBerkasNama || rec.pelaksanaNama || 'Pembuat Berkas',
      actorEmail: maker.email || '-',
      actorRole: maker.role || 'operator',
      actorRoleLabel: maker.roleLabel || 'Role Khusus',
      action: 'buat_baru',
      note: `Membuat berkas BBM (${policy.badgeLabel}) senilai Rp ${rec.nilaiTotal.toLocaleString('id-ID')}`
    }];
  }
  rec.revision_log = logs.sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());
  return rec;
}
window.normalizeBbmRecordState = normalizeBbmRecordState;

function mergeBbmRecordsCleanly(existing, incoming) {
  if (!existing) return normalizeBbmRecordState(incoming);
  if (!incoming) return normalizeBbmRecordState(existing);
  const a = normalizeBbmRecordState(existing);
  const b = normalizeBbmRecordState(incoming);
  const tA = new Date(a.savedAt || a.createdAt || 0).getTime();
  const tB = new Date(b.savedAt || b.createdAt || 0).getTime();
  const newer = tB >= tA ? b : a;
  const older = tB >= tA ? a : b;
  const merged = {
    ...older,
    ...newer,
    id: a.id || b.id,
    cloudId: newer.cloudId || older.cloudId || null,
    fallbackTripCloudId: newer.fallbackTripCloudId || older.fallbackTripCloudId || null,
    isCloud: Boolean(newer.isCloud || older.isCloud),
    createdBy: older.createdBy || newer.createdBy || null,
    createdAt: older.createdAt || newer.createdAt,
    savedAt: newer.savedAt || older.savedAt,
    revision_log: mergeRevisionLogs(older.revision_log, newer.revision_log)
  };
  return normalizeBbmRecordState(merged);
}
window.mergeBbmRecordsCleanly = mergeBbmRecordsCleanly;

// Tarik data riwayat dari Supabase Cloud (Pull dulu agar tidak pernah generate duplikat saat refresh)
async function syncTripsFromCloud(silent = false) {
  if (window._syncCloudPromise) {
    return window._syncCloudPromise;
  }

  const client = getSupabaseClient();
  if (!client) {
    if (!silent) alert('Database Supabase belum terhubung.');
    return;
  }

  const run = (async () => {
    const btn = document.getElementById('btnCloudSync');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('is-loading');
    }

    try {
      // 1. Tarik seluruh baris data terbaru dari tabel riwayat_perjadin terlebih dahulu
      const { data, error } = await client
        .from('riwayat_perjadin')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cloudRows = Array.isArray(data) ? data : [];
      const cloudMap = new Map();
      const cloudCompToKey = new Map();

      cloudRows.forEach(cloudRow => {
        const payload = cloudRow.payload_json || {};
        const tripId = payload.id || ('trip_cloud_' + cloudRow.id);
        const noST = cloudRow.nomor_st || payload.noST || 'Tanpa Nomor ST';
        const mak = (payload.mak != null && payload.mak !== '') ? payload.mak : (payload.draft?.fields?.mak || '');
        const rawMetode = payload.metodePembayaran || payload.draft?.fields?.metodePembayaran || payload.draft?.fields?.lk_metodePembayaran || 'LS';
        const metodePembayaran = String(rawMetode).trim().toUpperCase() === 'KKP' ? 'KKP' : 'LS';

        const cloudItem = {
          ...payload,
          id: tripId,
          cloudId: cloudRow.id,
          isCloud: true,
          status_berkas: cloudRow.status_berkas || payload.status_berkas || 'diproses',
          noST,
          mak,
          metodePembayaran,
          agenda: cloudRow.agenda || payload.agenda || 'Tanpa Agenda',
          kotaTujuan: cloudRow.tujuan || payload.kotaTujuan || '',
          totalBiaya: Number(cloudRow.total_biaya) || Number(payload.totalBiaya) || 0,
          savedAt: cloudRow.updated_at || cloudRow.created_at || payload.savedAt,
          createdAt: payload.createdAt || cloudRow.created_at || payload.savedAt,
          csv_data: cloudRow.csv_data || payload.csv_data || '',
          createdBy: payload.createdBy || null,
          revision_log: mergeRevisionLogs(payload.revision_log, [])
        };

        const compKey = getTripCompositeDedupeKey(cloudItem);

        // Deduplikasi hanya jika baris di Supabase benar-benar memiliki composite key yang identik (No ST + Metode + MAK)
        const canonicalKey = cloudMap.has(tripId)
          ? tripId
          : (compKey && cloudCompToKey.has(compKey) ? cloudCompToKey.get(compKey) : tripId);

        const merged = mergeTripItemsCleanly(cloudMap.get(canonicalKey), cloudItem);
        cloudMap.set(canonicalKey, merged);
        if (compKey && !cloudCompToKey.has(compKey)) {
          cloudCompToKey.set(compKey, canonicalKey);
        }
      });

      // 2. Cocokkan dengan data lokal dan cegah duplikasi
      const localList = (typeof getTripHistoryList === 'function') ? getTripHistoryList() : [];
      const localOnlyUnsynced = [];

      localList.forEach(localItem => {
        if (!localItem) return;
        const compKey = getTripCompositeDedupeKey(localItem);
        let matchedKey = null;

        if (localItem.cloudId) {
          for (const [k, v] of cloudMap.entries()) {
            if (v.cloudId === localItem.cloudId) {
              matchedKey = k;
              break;
            }
          }
        }
        if (!matchedKey && localItem.id && cloudMap.has(localItem.id)) {
          matchedKey = localItem.id;
        }
        if (!matchedKey && compKey && cloudCompToKey.has(compKey)) {
          matchedKey = cloudCompToKey.get(compKey);
        }

        if (matchedKey) {
          cloudMap.set(matchedKey, mergeTripItemsCleanly(cloudMap.get(matchedKey), localItem));
        } else {
          // Pertahankan semua berkas lokal yang memiliki konten valid
          const hasMeaningfulContent = Boolean(compKey) || (localItem.agenda && localItem.agenda !== 'Tanpa Agenda Perjalanan' && (localItem.empCount > 0 || (localItem.employees || []).length > 0));
          if (hasMeaningfulContent) {
            const key = localItem.id || ('trip_loc_' + Date.now());
            cloudMap.set(key, localItem);
            if (compKey) cloudCompToKey.set(compKey, key);
            localOnlyUnsynced.push(localItem);
          }
        }
      });

      // 3. Hanya dorong berkas lokal yang belum ada di Cloud jika user menekan sinkronisasi manual (!silent) & punya hak edit
      if (!silent && localOnlyUnsynced.length > 0 && canCurrentUserEdit()) {
        for (const item of localOnlyUnsynced) {
          try {
            const cloudId = await uploadTripToCloud(item);
            if (cloudId) {
              item.cloudId = cloudId;
              item.isCloud = true;
            }
          } catch (e) {
            console.warn('Manual sync push warning:', item.noST, e);
          }
        }
      }

      const combinedRaw = Array.from(cloudMap.values()).sort((a, b) => {
        const tA = new Date(a.savedAt || 0).getTime();
        const tB = new Date(b.savedAt || 0).getTime();
        return tB - tA;
      });

      // Pisahkan baris fallback BBM (recordType === 'bbm' / MAK 523121 / Reimburse BBM) agar hanya dikelola di koleksi riwayat_bbm, tidak masuk daftar Perdin Induk
      window._fallbackBbmFromTrips = new Map();
      const combined = [];

      combinedRaw.forEach(item => {
        if (!item) return;
        const isFallbackBbm = isNonPerdinBbmEntry(item);
        if (isFallbackBbm) {
          if (item.bbmData) {
            const bbmRec = normalizeBbmRecordState({
              ...item.bbmData,
              fallbackTripCloudId: item.cloudId || item.bbmData.fallbackTripCloudId || null,
              status_berkas: item.status_berkas || item.bbmData.status_berkas,
              revision_log: mergeRevisionLogs(item.revision_log, item.bbmData.revision_log),
              isCloud: Boolean(item.isCloud || item.cloudId)
            });
            if (bbmRec && bbmRec.id) {
              window._fallbackBbmFromTrips.set(bbmRec.id, bbmRec);
            }
          }
          return;
        }

        if (typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(item)) {
          delete item.bbmData;
          if (item.draft) delete item.draft.bbmData;
          if (typeof clearCachedBbmRecord === 'function') clearCachedBbmRecord(item);
        } else {
          const attachedBbm = item.bbmData || item.draft?.bbmData;
          if (attachedBbm && attachedBbm.id && !isBbmLinkedToDkiOnlyTrip(attachedBbm)) {
            const bbmRec = normalizeBbmRecordState({
              ...attachedBbm,
              noST: attachedBbm.noST || item.noST || '',
              agenda: attachedBbm.agenda || item.agenda || '',
              tripId: item.id,
              tripCloudId: item.cloudId || attachedBbm.tripCloudId || null
            });
            if (bbmRec && !window._fallbackBbmFromTrips.has(bbmRec.id)) {
              window._fallbackBbmFromTrips.set(bbmRec.id, bbmRec);
            }
          }
          cacheBbmRecord(item);
        }
        combined.push(item);
      });

      if (typeof saveTripHistoryList === 'function') {
        saveTripHistoryList(combined);
      }

      // Sinkronkan berkas BBM dari koleksi khusus riwayat_bbm + dorong data lokal yang belum masuk DB
      if (typeof syncBbmRecordsFromCloud === 'function') {
        try {
          await syncBbmRecordsFromCloud(true);
        } catch (bbmSyncErr) {
          console.warn('Sync BBM warning:', bbmSyncErr);
        }
      }

      if (typeof renderTripHistory === 'function') {
        renderTripHistory();
      }
      if (typeof renderBbmHistoryTable === 'function') {
        renderBbmHistoryTable();
      }

      if (!silent && typeof showRefreshToast === 'function') {
        showRefreshToast(
          'Sinkronisasi Database Berhasil',
          cloudRows.length === 0 && combined.length === 0
            ? 'Database Cloud terhubung. Belum ada berkas perjalanan tersimpan.'
            : `Berhasil menyinkronkan ${combined.length} berkas perjalanan dinas & arsip BBM.`
        );
      }
    } catch (err) {
      console.error('Sync Cloud error:', err);
      if (!silent) {
        alert('Gagal menyinkronkan data dari Cloud: ' + (err.message || 'Periksa koneksi database.'));
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('is-loading');
      }
      window._syncCloudPromise = null;
    }
  })();

  window._syncCloudPromise = run;
  return run;
}

// Eksekusi operasi Supabase dengan penanganan otomatis jika kolom tertentu belum dibuat di skema database Supabase
async function executeSupabaseOperationWithFallback(operationFn, initialPayload) {
  let curPayload = { ...initialPayload };
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await operationFn(curPayload);
    if (!res || !res.error) {
      return res;
    }
    const errMsg = String(res.error.message || '');
    // Deteksi jika tabel belum memiliki kolom tertentu (PGRST204: Could not find the 'xyz' column)
    if (errMsg.includes('Could not find the') && errMsg.includes('column of')) {
      const match = errMsg.match(/Could not find the '([^']+)' column/);
      if (match && match[1] && curPayload[match[1]] !== undefined) {
        console.warn(`Supabase schema fallback: menghapus kolom '${match[1]}' dan mengulang operasi...`);
        delete curPayload[match[1]];
        continue;
      }
    }
    // Deteksi jika terjadi kendala foreign key pada created_by
    if (curPayload.created_by && (errMsg.includes('foreign key') || errMsg.includes('created_by'))) {
      console.warn('Supabase fallback: menghapus created_by dan mengulang...');
      delete curPayload.created_by;
      continue;
    }
    return res;
  }
  return await operationFn(curPayload);
}

async function hydrateTripBbmFromCloud(tripItem) {
  if (!tripItem) return;
  // Khusus penugasan DKI Jakarta (MAK 524113) bukan Berkas BBM
  if (typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(tripItem)) {
    delete tripItem.bbmData;
    if (tripItem.draft) delete tripItem.draft.bbmData;
    if (typeof clearCachedBbmRecord === 'function') clearCachedBbmRecord(tripItem);
    return;
  }
  if (tripItem.bbmData || tripItem.draft?.bbmData) {
    cacheBbmRecord(tripItem);
    return;
  }
  const cached = getCachedBbmRecord(tripItem);
  if (cached) {
    tripItem.bbmData = cached;
    if (tripItem.draft) tripItem.draft.bbmData = cached;
    return;
  }

  const client = getSupabaseClient();
  if (!client || (!tripItem.cloudId && !normalizeStKey(tripItem.noST))) return;
  try {
    let query = client.from('riwayat_perjadin').select('payload_json');
    if (tripItem.cloudId) {
      query = query.eq('id', tripItem.cloudId);
    } else {
      query = query.eq('nomor_st', tripItem.noST);
    }
    const { data, error } = await query.limit(50);
    if (error || !Array.isArray(data)) return;
    const targetKey = getTripCompositeDedupeKey(tripItem);
    const matched = tripItem.cloudId
      ? data[0]
      : data.find(row => {
        const payload = row.payload_json || {};
        const key = getTripCompositeDedupeKey(payload);
        return key && targetKey && key === targetKey;
      });
    const bbm = matched?.payload_json?.bbmData || matched?.payload_json?.draft?.bbmData;
    if (!bbm) return;
    tripItem.bbmData = bbm;
    if (tripItem.draft) tripItem.draft.bbmData = bbm;
    cacheBbmRecord(tripItem, bbm);
  } catch (e) {
    console.warn('Gagal memuat BBM Cloud untuk pembaruan perjalanan:', e);
  }
}

// Simpan data perjalanan saat ini langsung ke Cloud Supabase Publik (Anti-Duplikat & Thread-Safe)
async function uploadTripToCloud(tripItem, options = {}) {
  const client = getSupabaseClient();
  if (!client || !tripItem) return null;

  if (options.removeBbm) {
    delete tripItem.bbmData;
    if (tripItem.draft) delete tripItem.draft.bbmData;
  } else if (tripItem.recordType !== 'bbm') {
    await hydrateTripBbmFromCloud(tripItem);
  }

  window._inFlightCloudUploads = window._inFlightCloudUploads || new Map();
  const compKey = getTripCompositeDedupeKey(tripItem);
  const lockKey = tripItem.cloudId
    ? `cid:${tripItem.cloudId}`
    : (compKey ? `comp:${compKey}` : `tid:${tripItem.id || Date.now()}`);

  // Jika proses upload untuk berkas yang sama sedang berjalan, tunggu hingga selesai lalu gunakan cloudId hasil-nya agar tidak double-insert
  const existingPromise = window._inFlightCloudUploads.get(lockKey);
  if (existingPromise) {
    try {
      const prevCloudId = await existingPromise;
      if (prevCloudId && !tripItem.cloudId) {
        tripItem.cloudId = prevCloudId;
      }
    } catch (e) {}
  }

  const uploadPromise = (async () => {
    try {
      const noST = (tripItem.noST || '').trim();
      const hasValidNoST = Boolean(normalizeStKey(noST));

      // Pastikan csv_data selalu terisi jika belum ada (kecuali record fallback BBM)
      let csvData = tripItem.csv_data || '';
      if (!csvData && tripItem.recordType !== 'bbm' && typeof generatePerjadinCsvString === 'function') {
        try {
          csvData = generatePerjadinCsvString(null, tripItem);
          tripItem.csv_data = csvData;
        } catch (e) {}
      }

      const payload = {
        nomor_st: noST || 'Tanpa Nomor ST',
        tujuan: tripItem.kotaTujuan || tripItem.provinsiTujuan || '',
        agenda: tripItem.agenda || '',
        tgl_berangkat: tripItem.tglBerangkat || null,
        tgl_kembali: tripItem.tglKembali || null,
        total_biaya: Number(tripItem.totalBiaya) || 0,
        status_berkas: tripItem.status_berkas || 'diproses',
        csv_data: csvData || '',
        payload_json: tripItem,
        updated_at: new Date().toISOString()
      };

      if (currentAuthUser && currentAuthUser.id) {
        payload.created_by = currentAuthUser.id;
      }

      // 1. Jika sudah ada cloudId, update baris yang sama di database
      if (tripItem.cloudId) {
        const updRes = await executeSupabaseOperationWithFallback(p => {
          return client.from('riwayat_perjadin').update(p).eq('id', tripItem.cloudId).select('id');
        }, payload);

        if (updRes && !updRes.error && Array.isArray(updRes.data) && updRes.data.length > 0) {
          return updRes.data[0].id;
        }
      }

      // 2. Cek berdasarkan nomor_st DAN kecocokan MAK + Metode Pembayaran (khusus berkas perjalanan non-BBM)
      if (hasValidNoST && tripItem.recordType !== 'bbm') {
        const { data: existingRows } = await client
          .from('riwayat_perjadin')
          .select('id, payload_json')
          .eq('nomor_st', noST)
          .order('created_at', { ascending: true });

        if (Array.isArray(existingRows) && existingRows.length > 0) {
          const targetKey = getTripCompositeDedupeKey(tripItem);
          const matchedRow = existingRows.find(row => {
            const rowPayload = row.payload_json || {};
            if (rowPayload.recordType === 'bbm') return false;
            const rKey = getTripCompositeDedupeKey(rowPayload);
            return rKey && targetKey && rKey === targetKey;
          });

          if (matchedRow) {
            const existingId = matchedRow.id;
            const updRes = await executeSupabaseOperationWithFallback(p => {
              return client.from('riwayat_perjadin').update(p).eq('id', existingId).select('id');
            }, payload);

            if (updRes && !updRes.error && Array.isArray(updRes.data) && updRes.data.length > 0) {
              return updRes.data[0].id;
            }
          }
        }
      }

      // 3. Cek berdasarkan payload_json.id (misal saat nomor_st direvisi atau belum diisi)
      if (tripItem.id) {
        try {
          const { data: idRows } = await client
            .from('riwayat_perjadin')
            .select('id')
            .contains('payload_json', { id: tripItem.id })
            .limit(1);

          if (idRows && idRows.length > 0) {
            const existingId = idRows[0].id;
            const updRes = await executeSupabaseOperationWithFallback(p => {
              return client.from('riwayat_perjadin').update(p).eq('id', existingId).select('id');
            }, payload);

            if (updRes && !updRes.error && Array.isArray(updRes.data) && updRes.data.length > 0) {
              return updRes.data[0].id;
            }
          }
        } catch (containsErr) {
          // Abaikan jika index/filter JSON tidak didukung dan lanjut insert
        }
      }

      // 4. Belum ada sama sekali di Cloud -> Insert 1 baris baru saja
      const insertRes = await executeSupabaseOperationWithFallback(p => {
        return client.from('riwayat_perjadin').insert(p).select('id');
      }, payload);

      if (insertRes && !insertRes.error && Array.isArray(insertRes.data) && insertRes.data.length > 0) {
        return insertRes.data[0].id;
      }

      if (insertRes && insertRes.error) {
        console.error('Gagal simpan ke tabel riwayat_perjadin:', insertRes.error);
        return null;
      }

      return null;
    } catch (e) {
      console.error('Gagal simpan ke Cloud:', e);
      return null;
    } finally {
      window._inFlightCloudUploads.delete(lockKey);
    }
  })();

  window._inFlightCloudUploads.set(lockKey, uploadPromise);
  const cloudId = await uploadPromise;
  if (tripItem.recordType !== 'bbm') {
    if (cloudId && options.removeBbm) {
      clearCachedBbmRecord(tripItem);
    } else if (cloudId) {
      cacheBbmRecord(tripItem);
    }
  }
  return cloudId;
}

// =====================================================================
// SINKRONISASI KHUSUS DATABASE BERKAS BBM (riwayat_bbm + fallback aman)
// =====================================================================

function isMissingBbmCollectionError(err) {
  if (!err) return false;
  const msg = String(err.message || '');
  return err.status === 404 || /missing collection|not found|tidak dikenal|does not exist/i.test(msg);
}

function readRawLocalBbmList() {
  try {
    const raw = localStorage.getItem(BBM_CLOUD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(normalizeBbmRecordState) : [];
  } catch (e) {
    console.warn('Gagal membaca localStorage BBM:', e);
    return [];
  }
}

function writeRawLocalBbmList(list) {
  try {
    const clean = (Array.isArray(list) ? list : []).filter(Boolean).map(normalizeBbmRecordState);
    localStorage.setItem(BBM_CLOUD_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.warn('Gagal menyimpan localStorage BBM:', e);
  }
}

function buildFallbackTripFromBbmRecord(rec) {
  const norm = normalizeBbmRecordState(rec);
  const receiptDate = norm.tanggalBukti || norm.tanggalKembali || norm.tanggalBerangkat || '';
  return {
    id: `trip_bbm_${norm.id}`,
    bbmRecordId: norm.id,
    cloudId: norm.fallbackTripCloudId || null,
    isCloud: Boolean(norm.fallbackTripCloudId),
    recordType: 'bbm',
    noST: norm.noST || 'Berkas BBM',
    mak: norm.mak || '523121',
    metodePembayaran: 'LS',
    agenda: norm.agenda || norm.pekerjaan || 'Pengajuan Reimburse Pembelian BBM',
    tglBerangkat: norm.tanggalBerangkat || receiptDate,
    tglKembali: norm.tanggalKembali || receiptDate,
    kotaTujuan: 'Perawatan Kendaraan / Operasional (MAK 523121)',
    provinsiTujuan: 'Sekretariat Jenderal',
    totalBiaya: Number(norm.nilaiTotal) || 0,
    status_berkas: norm.status_berkas || 'diproses',
    layakPencairan: Boolean(norm.layakPencairan),
    savedAt: norm.savedAt,
    createdAt: norm.createdAt,
    createdBy: norm.createdBy || null,
    revision_log: Array.isArray(norm.revision_log) ? norm.revision_log : [],
    bbmData: norm
  };
}

/**
 * Simpan/Upsert 1 berkas BBM langsung ke tabel riwayat_bbm di PocketBase Cloud
 * (dengan fallback otomatis ke riwayat_perjadin bertipe 'bbm' bila tabel riwayat_bbm belum dimigrasi)
 */
async function uploadBbmRecordToCloud(bbmRecord) {
  const client = getSupabaseClient();
  const norm = normalizeBbmRecordState(bbmRecord);
  if (!client || !norm || !norm.id) return null;

  const canEdit = (typeof canCurrentUserEdit === 'function')
    ? canCurrentUserEdit()
    : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  if (currentAuthUser && !canEdit) return null;

  window._inFlightBbmUploads = window._inFlightBbmUploads || new Map();
  const lockKey = String(norm.id);
  if (window._inFlightBbmUploads.has(lockKey)) {
    try { await window._inFlightBbmUploads.get(lockKey); } catch (e) {}
  }

  const doUpload = (async () => {
    try {
      const rowPayload = {
        bbm_uid: String(norm.id),
        nomor_st: String(norm.noST || '').trim() || 'Tanpa Nomor ST',
        kategori_kendaraan: norm.kategoriKendaraan || 'dinas',
        kendaraan: norm.kendaraan || 'Mobil',
        plat_nomor: norm.platNomor || '',
        pelaksana_bukti: norm.pelaksanaBukti || norm.pelaksanaNama || '',
        pembuat_berkas: norm.pembuatBerkasNama || norm.pelaksanaNama || '',
        tgl_bukti: norm.tanggalBukti || '',
        mak: norm.mak || '523121',
        nilai_total: Number(norm.nilaiTotal) || 0,
        status_berkas: norm.status_berkas || 'diproses',
        layak_pencairan: Boolean(norm.layakPencairan),
        keterangan_pencairan: norm.keteranganPencairan || '',
        payload_json: norm
      };
      if (currentAuthUser && currentAuthUser.id) {
        rowPayload.created_by = currentAuthUser.id;
      }

      // 1. Coba update lewat cloudId yang sudah tercatat di koleksi riwayat_bbm
      if (norm.cloudId && !String(norm.cloudId).startsWith('fb_')) {
        const updRes = await client.from('riwayat_bbm').update(rowPayload).eq('id', norm.cloudId).select('id');
        if (updRes && !updRes.error && Array.isArray(updRes.data) && updRes.data.length > 0) {
          norm.cloudId = updRes.data[0].id;
          norm.isCloud = true;
          return norm.cloudId;
        }
        if (updRes && updRes.error && isMissingBbmCollectionError(updRes.error)) {
          throw Object.assign(new Error(updRes.error.message || 'missing'), { isMissingCollection: true });
        }
      }

      // 2. Cari baris existing berdasarkan bbm_uid di koleksi riwayat_bbm
      const { data: existRows, error: findErr } = await client
        .from('riwayat_bbm')
        .select('id, bbm_uid')
        .eq('bbm_uid', norm.id)
        .limit(1);

      if (findErr && isMissingBbmCollectionError(findErr)) {
        throw Object.assign(new Error(findErr.message || 'missing'), { isMissingCollection: true });
      }

      if (Array.isArray(existRows) && existRows.length > 0) {
        const existingId = existRows[0].id;
        const updRes = await client.from('riwayat_bbm').update(rowPayload).eq('id', existingId).select('id');
        if (updRes && !updRes.error && Array.isArray(updRes.data) && updRes.data.length > 0) {
          norm.cloudId = updRes.data[0].id;
          norm.isCloud = true;
          return norm.cloudId;
        }
      }

      // 3. Insert baru ke koleksi riwayat_bbm
      const insRes = await client.from('riwayat_bbm').insert(rowPayload).select('id');
      if (insRes && insRes.error && isMissingBbmCollectionError(insRes.error)) {
        throw Object.assign(new Error(insRes.error.message || 'missing'), { isMissingCollection: true });
      }
      if (insRes && !insRes.error && Array.isArray(insRes.data) && insRes.data.length > 0) {
        norm.cloudId = insRes.data[0].id;
        norm.isCloud = true;
        return norm.cloudId;
      }
      if (insRes && insRes.error) {
        console.warn('Gagal insert riwayat_bbm:', insRes.error);
      }
      return null;
    } catch (err) {
      if (err && err.isMissingCollection) {
        // Fallback aman ke riwayat_perjadin bila server belum restart menjalankan migrasi riwayat_bbm
        const fbTrip = buildFallbackTripFromBbmRecord(norm);
        const fbId = await uploadTripToCloud(fbTrip);
        if (fbId) {
          norm.fallbackTripCloudId = fbId;
          norm.isCloud = true;
          return fbId;
        }
        return null;
      }
      console.warn('Error uploadBbmRecordToCloud:', err);
      return null;
    } finally {
      window._inFlightBbmUploads.delete(lockKey);
    }
  })();

  window._inFlightBbmUploads.set(lockKey, doUpload);
  const resId = await doUpload;
  if (resId) {
    Object.assign(bbmRecord, norm);
    const curLocal = readRawLocalBbmList();
    const idx = curLocal.findIndex(x => x && x.id === norm.id);
    if (idx >= 0) curLocal[idx] = norm;
    else curLocal.unshift(norm);
    writeRawLocalBbmList(curLocal);
  }
  return resId;
}
window.uploadBbmRecordToCloud = uploadBbmRecordToCloud;

/**
 * Tarik & sinkronkan seluruh Berkas BBM dari PocketBase (riwayat_bbm)
 * serta otomatis mendorong berkas bensin lokal yang belum masuk ke database.
 */
async function syncBbmRecordsFromCloud(silent = true) {
  if (window._syncBbmCloudPromise) {
    return window._syncBbmCloudPromise;
  }

  const client = getSupabaseClient();
  if (!client) return [];

  const run = (async () => {
    const bbmMap = new Map();
    let hasBbmCollection = true;

    try {
      const { data, error } = await client
        .from('riwayat_bbm')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (isMissingBbmCollectionError(error)) {
          hasBbmCollection = false;
        } else {
          throw error;
        }
      } else if (Array.isArray(data)) {
        data.forEach(row => {
          const payload = row.payload_json || {};
          const uid = row.bbm_uid || payload.id || ('bbm_pb_' + row.id);
          const merged = normalizeBbmRecordState({
            ...payload,
            id: uid,
            cloudId: row.id,
            isCloud: true,
            noST: payload.noST || row.nomor_st || '',
            kategoriKendaraan: payload.kategoriKendaraan || row.kategori_kendaraan || 'dinas',
            kendaraan: payload.kendaraan || row.kendaraan || 'Mobil',
            platNomor: payload.platNomor || row.plat_nomor || '',
            pelaksanaBukti: payload.pelaksanaBukti || row.pelaksana_bukti || '',
            nilaiTotal: payload.nilaiTotal != null ? Number(payload.nilaiTotal) : (Number(row.nilai_total) || 0),
            status_berkas: row.status_berkas || payload.status_berkas || 'diproses',
            savedAt: row.updated_at || row.created_at || payload.savedAt,
            createdAt: payload.createdAt || row.created_at || payload.savedAt,
            revision_log: mergeRevisionLogs(payload.revision_log, [])
          });
          if (merged) {
            bbmMap.set(merged.id, mergeBbmRecordsCleanly(bbmMap.get(merged.id), merged));
          }
        });
      }

      // Gabungkan pula data BBM dari fallback riwayat_perjadin / lampiran SPT non-DKI bila ada
      if (window._fallbackBbmFromTrips instanceof Map) {
        for (const [uid, fbRec] of window._fallbackBbmFromTrips.entries()) {
          if (!uid || !fbRec) continue;
          if (isBbmLinkedToDkiOnlyTrip(fbRec)) continue;
          const existing = bbmMap.get(uid);
          const merged = mergeBbmRecordsCleanly(existing, fbRec);
          // Jika berasal dari riwayat_perjadin lama & belum ada row native di riwayat_bbm,
          // biarkan cloudId tetap null agar bisa dipromosikan ke riwayat_bbm!
          if (!existing) {
            merged.cloudId = null;
            merged.isCloud = Boolean(merged.fallbackTripCloudId);
          }
          bbmMap.set(uid, merged);
        }
      }

      // Gabungkan dengan localStorage browser (data berkas bensin lokal)
      const localArr = readRawLocalBbmList();
      localArr.forEach(locRec => {
        if (!locRec || !locRec.id) return;
        if (locRec.id === 'bbm_sample' && !locRec.cloudId && (Number(locRec.nilaiTotal) || 0) <= 0) return;
        const prev = bbmMap.get(locRec.id);
        bbmMap.set(locRec.id, mergeBbmRecordsCleanly(prev, locRec));
      });

      const mergedList = Array.from(bbmMap.values())
        .map(normalizeBbmRecordState)
        .filter(Boolean)
        .sort((a, b) => new Date(b.savedAt || b.createdAt || 0).getTime() - new Date(a.savedAt || a.createdAt || 0).getTime());

      // Otomatis dorong berkas bensin lokal yang belum masuk ke database Cloud (khusus Admin/Operator)
      const canEdit = (typeof canCurrentUserEdit === 'function')
        ? canCurrentUserEdit()
        : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
      const needPushToDb = mergedList.filter(r => {
        if (!r || !r.id) return false;
        if (isBbmLinkedToDkiOnlyTrip(r)) return false;
        if (hasBbmCollection) return !r.cloudId;
        return !r.cloudId && !r.fallbackTripCloudId;
      });

      let pushedCount = 0;
      if (needPushToDb.length > 0 && canEdit && currentAuthUser) {
        for (const item of needPushToDb) {
          try {
            const upId = await uploadBbmRecordToCloud(item);
            if (upId) pushedCount++;
          } catch (pushErr) {
            console.warn('Auto-push BBM ke Cloud warning:', item.id, pushErr);
          }
        }
      }

      writeRawLocalBbmList(mergedList);

      // Sinkronkan juga Map cache window._bbmCloudRecords untuk referensi cepat
      window._bbmCloudRecords = window._bbmCloudRecords || new Map();
      mergedList.forEach(r => {
        if (r && r.id) window._bbmCloudRecords.set(String(r.id), r);
      });

      if (!silent && typeof showRefreshToast === 'function') {
        const pushNote = pushedCount > 0 ? ` (${pushedCount} berkas lokal berhasil dikirim ke database)` : '';
        showRefreshToast('Database BBM Tersinkronisasi', `${mergedList.length} Berkas BBM disinkronkan dari Cloud${pushNote}.`);
      }

      return mergedList;
    } catch (e) {
      console.warn('syncBbmRecordsFromCloud warning:', e);
      return readRawLocalBbmList();
    } finally {
      window._syncBbmCloudPromise = null;
    }
  })();

  window._syncBbmCloudPromise = run;
  return run;
}
window.syncBbmRecordsFromCloud = syncBbmRecordsFromCloud;

async function pushUnsyncedBbmRecordsToCloud(showToast = true) {
  const client = getSupabaseClient();
  if (!client) {
    if (showToast) alert('Database Cloud belum terhubung.');
    return 0;
  }
  const canEdit = (typeof canCurrentUserEdit === 'function')
    ? canCurrentUserEdit()
    : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  if (!canEdit) {
    if (showToast) alert('Hanya Admin atau Operator yang dapat mengirim data ke database Cloud.');
    return 0;
  }

  const list = readRawLocalBbmList();
  const targets = list.filter(r => r && !r.cloudId && !isBbmLinkedToDkiOnlyTrip(r));
  let pushed = 0;
  for (const item of targets) {
    const id = await uploadBbmRecordToCloud(item);
    if (id) pushed++;
  }
  if (typeof renderBbmHistoryTable === 'function') renderBbmHistoryTable();
  if (typeof renderTripHistory === 'function') renderTripHistory();
  if (showToast && typeof showRefreshToast === 'function') {
    if (pushed > 0) {
      showRefreshToast('Data Berkas BBM Masuk Database', `${pushed} berkas BBM lokal berhasil disimpan ke Cloud Database kantor.`);
    } else {
      showRefreshToast('Sudah Sinkron ke Database', 'Seluruh berkas BBM yang valid sudah tersimpan di Cloud Database.');
    }
  }
  return pushed;
}
window.pushUnsyncedBbmRecordsToCloud = pushUnsyncedBbmRecordsToCloud;

async function removeBbmRecordFromCloud(cloudId, fallbackTripCloudId = null) {
  const client = getSupabaseClient();
  if (!client || !currentAuthUser) return;
  if (!isCurrentUserAdmin()) {
    alert('Hanya akun Admin yang memiliki izin menghapus data BBM dari Cloud.');
    return;
  }
  try {
    if (cloudId && !String(cloudId).startsWith('fb_')) {
      const res = await client.from('riwayat_bbm').delete().eq('id', cloudId);
      if (res && res.error && !isMissingBbmCollectionError(res.error)) {
        console.warn('Hapus riwayat_bbm warning:', res.error);
      }
    }
    if (fallbackTripCloudId) {
      await client.from('riwayat_perjadin').delete().eq('id', fallbackTripCloudId);
    }
  } catch (e) {
    console.warn('Gagal menghapus data BBM dari Cloud:', e);
  }
}
window.removeBbmRecordFromCloud = removeBbmRecordFromCloud;

/**
 * Sinkronkan metadata SPT Perjadin (non-DKI) ke Berkas BBM terpisah yang terhubung lewat Nomor SPT / tripId.
 * Menjaga berkas BBM tetap terpisah di riwayat_bbm namun selalu selaras dengan Berkas Perjadin induknya.
 */
async function syncLinkedBbmRecordsFromTrip(trip, previousNoST = '') {
  if (!trip || trip.recordType === 'bbm') return 0;
  if (typeof isDkiJakartaTrip === 'function' && isDkiJakartaTrip(trip)) return 0;

  const newKey = normalizeSptMatchKey(trip.noST);
  const oldKey = normalizeSptMatchKey(previousNoST);
  if (!newKey && !oldKey && !trip.id && !trip.cloudId) return 0;

  const localList = readRawLocalBbmList();
  if (!localList.length) return 0;

  const updatedRecords = [];
  const nextList = localList.map(rec => {
    if (!rec) return rec;
    const recKey = normalizeSptMatchKey(rec.noST);
    const sameTripId = trip.id && rec.tripId && String(rec.tripId) === String(trip.id);
    const sameCloudId = trip.cloudId && rec.tripCloudId && String(rec.tripCloudId) === String(trip.cloudId);
    const sameNoST = (newKey && recKey === newKey) || (oldKey && recKey === oldKey);
    if (!sameTripId && !sameCloudId && !sameNoST) return rec;

    const cloned = { ...rec };
    let changed = false;
    const setIfDiff = (k, val) => {
      const nextVal = String(val || '').trim();
      if (nextVal && String(cloned[k] || '').trim() !== nextVal) {
        cloned[k] = val;
        changed = true;
      }
    };

    const prevNo = String(cloned.noST || '').trim();
    if (trip.noST && prevNo !== String(trip.noST).trim()) {
      cloned.noST = String(trip.noST).trim();
      changed = true;
    }
    setIfDiff('agenda', trip.agenda);
    setIfDiff('tanggalBerangkat', trip.tglBerangkat);
    setIfDiff('tanggalKembali', trip.tglKembali);
    setIfDiff('tujuanProvinsi', trip.provinsiTujuan);
    setIfDiff('tujuanKota', trip.kotaTujuan);
    const rawLkPel = String(trip.lk_pelaksana || trip.draft?.fields?.lk_pelaksana || trip.pelaksanaNama || '').trim();
    const resolvedLk = rawLkPel
      ? ((typeof resolveBbmPelaksanaIdentity === 'function') ? resolveBbmPelaksanaIdentity(rawLkPel) : { nama: rawLkPel, nip: '' })
      : { nama: '', nip: '' };
    if (String(cloned.pelaksanaNama || '').trim() !== String(resolvedLk.nama || '').trim() ||
        String(cloned.pelaksanaNip || '').trim() !== String(resolvedLk.nip || '').trim()) {
      cloned.pelaksanaNama = resolvedLk.nama;
      cloned.pelaksanaPanggilan = resolvedLk.nama;
      cloned.pembuatBerkasNama = resolvedLk.nama;
      cloned.pelaksanaNip = resolvedLk.nip;
      cloned.pembuatBerkasNip = resolvedLk.nip;
      changed = true;
    }
    if (trip.id && String(cloned.tripId || '') !== String(trip.id)) {
      cloned.tripId = trip.id;
      changed = true;
    }
    if (trip.cloudId && String(cloned.tripCloudId || '') !== String(trip.cloudId)) {
      cloned.tripCloudId = trip.cloudId;
      changed = true;
    }

    if (!changed) return rec;

    const normalized = normalizeBbmRecordState(cloned);
    if (prevNo && normalized.noST && prevNo !== normalized.noST) {
      const logs = Array.isArray(normalized.revision_log) ? [...normalized.revision_log] : [];
      logs.unshift({
        id: 'rev_bbm_spt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        at: new Date().toISOString(),
        actorId: currentAuthUser?.id || null,
        actorName: currentAuthUser?.nama || currentAuthUser?.email || 'Sinkron SPT',
        actorEmail: currentAuthUser?.email || '-',
        actorRole: currentAuthUser?.role || 'operator',
        actorRoleLabel: currentAuthUser?.role === 'admin' ? 'Admin' : 'Sistem',
        action: 'revisi',
        note: `Sinkron Nomor SPT dari Berkas Perdin: ${prevNo} → ${normalized.noST}`
      });
      normalized.revision_log = logs;
    }
    updatedRecords.push(normalized);
    return normalized;
  });

  if (!updatedRecords.length) return 0;

  writeRawLocalBbmList(nextList);
  window._bbmCloudRecords = window._bbmCloudRecords || new Map();
  updatedRecords.forEach(r => window._bbmCloudRecords.set(String(r.id), r));

  const canEdit = (typeof canCurrentUserEdit === 'function')
    ? canCurrentUserEdit()
    : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  if (canEdit && currentAuthUser) {
    for (const rec of updatedRecords) {
      try {
        await uploadBbmRecordToCloud(rec);
      } catch (e) {
        console.warn('Gagal menyinkronkan pembaruan SPT ke Cloud BBM:', e);
      }
    }
  }

  if (typeof renderBbmHistoryTable === 'function') renderBbmHistoryTable();
  if (typeof renderTripHistory === 'function') renderTripHistory();
  return updatedRecords.length;
}
window.syncLinkedBbmRecordsFromTrip = syncLinkedBbmRecordsFromTrip;

// Sinkronkan berkas lokal yang benar-benar belum memiliki cloudId (khusus pemanggil manual, bukan refresh halaman)
async function autoSyncLocalTripsToCloud() {
  if (window._isSyncingLocalToCloud) return;
  const client = getSupabaseClient();
  if (!client || (currentAuthUser && !canCurrentUserEdit())) return;

  window._isSyncingLocalToCloud = true;
  try {
    const localList = (typeof getTripHistoryList === 'function') ? getTripHistoryList() : [];
    const unsynced = localList.filter(item => {
      if (!item || item.cloudId) return false;
      const stKey = normalizeStKey(item.noST);
      return Boolean(stKey) || (item.agenda && item.agenda !== 'Tanpa Agenda Perjalanan' && (item.empCount > 0 || (item.employees || []).length > 0));
    });
    if (unsynced.length === 0) return;

    let hasChanges = false;
    for (const item of unsynced) {
      try {
        const cloudId = await uploadTripToCloud(item);
        if (cloudId) {
          item.cloudId = cloudId;
          item.isCloud = true;
          hasChanges = true;
        }
      } catch (e) {
        console.warn('Auto-sync item ke cloud warning:', item.noST, e);
      }
    }

    if (hasChanges) {
      if (typeof saveTripHistoryList === 'function') saveTripHistoryList(localList);
      if (typeof renderTripHistory === 'function') renderTripHistory();
    }
  } finally {
    window._isSyncingLocalToCloud = false;
  }
}
window.autoSyncLocalTripsToCloud = autoSyncLocalTripsToCloud;

// Hapus data perjalanan dari Cloud Supabase
async function removeTripFromCloud(cloudId) {
  const client = getSupabaseClient();
  if (!client || !currentAuthUser || !cloudId) return;

  if (!isCurrentUserAdmin()) {
    alert('Hanya akun Admin yang memiliki izin menghapus data dari Cloud.');
    return;
  }

  try {
    await client
      .from('riwayat_perjadin')
      .delete()
      .eq('id', cloudId);
  } catch (e) {
    console.warn('Gagal menghapus data dari Cloud:', e);
  }
}

