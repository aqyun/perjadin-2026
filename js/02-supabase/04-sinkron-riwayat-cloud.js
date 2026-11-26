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
  if (typeof window !== 'undefined' && typeof window.getTripCompositeDedupeKey === 'function') {
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

      const combined = Array.from(cloudMap.values()).sort((a, b) => {
        const tA = new Date(a.savedAt || 0).getTime();
        const tB = new Date(b.savedAt || 0).getTime();
        return tB - tA;
      });

      if (typeof saveTripHistoryList === 'function') {
        saveTripHistoryList(combined);
      }
      if (typeof renderTripHistory === 'function') {
        renderTripHistory();
      }

      if (!silent && typeof showRefreshToast === 'function') {
        showRefreshToast(
          'Sinkronisasi Database Berhasil',
          cloudRows.length === 0 && combined.length === 0
            ? 'Database Cloud terhubung. Belum ada berkas perjalanan tersimpan.'
            : `Berhasil menyinkronkan ${combined.length} berkas perjalanan dinas tanpa duplikasi.`
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

// Simpan data perjalanan saat ini langsung ke Cloud Supabase Publik (Anti-Duplikat & Thread-Safe)
async function uploadTripToCloud(tripItem) {
  const client = getSupabaseClient();
  if (!client || !tripItem) return null;

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

      // Pastikan csv_data selalu terisi jika belum ada
      let csvData = tripItem.csv_data || '';
      if (!csvData && typeof generatePerjadinCsvString === 'function') {
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

      // 2. Cek berdasarkan nomor_st DAN kecocokan MAK + Metode Pembayaran (agar berkas LS/KKP atau beda MAK tidak saling menimpa)
      if (hasValidNoST) {
        const { data: existingRows } = await client
          .from('riwayat_perjadin')
          .select('id, payload_json')
          .eq('nomor_st', noST)
          .order('created_at', { ascending: true });

        if (Array.isArray(existingRows) && existingRows.length > 0) {
          const targetKey = getTripCompositeDedupeKey(tripItem);
          const matchedRow = existingRows.find(row => {
            const rowPayload = row.payload_json || {};
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
        console.error('Gagal simpan ke tabel riwayat_perjadin Supabase:', insertRes.error);
        return null;
      }

      return null;
    } catch (e) {
      console.error('Gagal simpan ke Cloud Supabase:', e);
      return null;
    } finally {
      window._inFlightCloudUploads.delete(lockKey);
    }
  })();

  window._inFlightCloudUploads.set(lockKey, uploadPromise);
  return uploadPromise;
}

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

