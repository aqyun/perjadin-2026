// =====================================================================
// RIWAYAT PERJALANAN (TRIP HISTORY & REVISION ARCHIVE)
// =====================================================================
const TRIP_HISTORY_KEY = 'perdinku_trip_history_v1';

function cacheBbmRecord(trip, record = null) {
  const bbm = record || trip?.bbmData || trip?.draft?.bbmData;
  if (!bbm) return null;
  window._bbmCloudRecords = window._bbmCloudRecords || new Map();
  window._bbmCloudTripIndex = window._bbmCloudTripIndex || new Map();
  const recordId = String(bbm.id || (trip?.id ? `bbm_trip_${trip.id}` : ''));
  if (!recordId) return bbm;
  if (trip?.id) {
    const tripKey = String(trip.id);
    bbm.tripId = tripKey;
    const previousId = window._bbmCloudTripIndex.get(tripKey);
    if (previousId && previousId !== recordId) window._bbmCloudRecords.delete(previousId);
    window._bbmCloudTripIndex.set(tripKey, recordId);
  }
  if (trip?.cloudId) bbm.tripCloudId = trip.cloudId;
  window._bbmCloudRecords.set(recordId, bbm);
  return bbm;
}

function getCachedBbmRecord(trip) {
  if (!trip || !window._bbmCloudTripIndex || !window._bbmCloudRecords) return null;
  return window._bbmCloudRecords.get(window._bbmCloudTripIndex.get(String(trip.id))) || null;
}

function clearCachedBbmRecord(trip) {
  if (!trip || !window._bbmCloudTripIndex || !window._bbmCloudRecords) return;
  const tripKey = String(trip.id);
  const recordId = window._bbmCloudTripIndex.get(tripKey);
  if (recordId) window._bbmCloudRecords.delete(recordId);
  window._bbmCloudTripIndex.delete(tripKey);
}

function stripBbmDataForLocalStorage(item) {
  if (!item || typeof item !== 'object') return item;
  const copy = { ...item };
  delete copy.bbmData;
  if (copy.draft && typeof copy.draft === 'object') {
    const draft = { ...copy.draft };
    delete draft.bbmData;
    copy.draft = draft;
  }
  return copy;
}

function getTripHistoryList() {
  try {
    const raw = localStorage.getItem(TRIP_HISTORY_KEY);
    let list = raw ? JSON.parse(raw) : [];
    if ((!Array.isArray(list) || list.length === 0) && typeof window !== 'undefined' && Array.isArray(window.INITIAL_TRIPS_ARCHIVE) && window.INITIAL_TRIPS_ARCHIVE.length > 0) {
      list = [...window.INITIAL_TRIPS_ARCHIVE];
      saveTripHistoryList(list);
    }
    if (Array.isArray(list) && list.some(item => item?.bbmData || item?.draft?.bbmData)) {
      list.forEach(item => cacheBbmRecord(item));
      saveTripHistoryList(list);
    }
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('Gagal membaca riwayat perjalanan:', e);
    return (typeof window !== 'undefined' && Array.isArray(window.INITIAL_TRIPS_ARCHIVE)) ? [...window.INITIAL_TRIPS_ARCHIVE] : [];
  }
}

function saveTripHistoryList(list) {
  try {
    const localList = (Array.isArray(list) ? list : []).map(stripBbmDataForLocalStorage);
    localStorage.setItem(TRIP_HISTORY_KEY, JSON.stringify(localList));
  } catch (e) {
    console.warn('Gagal menyimpan riwayat perjalanan:', e);
  }
}

function getCurrentRevisionActor() {
  const user = (typeof getCurrentAuthUser === 'function' ? getCurrentAuthUser() : null) || window.currentAuthUser || null;
  if (!user) {
    return { id: null, nama: 'Pengguna Lokal', email: '-', role: 'local', roleLabel: 'Lokal' };
  }
  const role = String(user.role || 'viewer').toLowerCase().trim();
  let roleLabel = 'Viewer';
  if (role === 'admin') roleLabel = 'Admin';
  else if (role === 'operator' || role === 'editor') roleLabel = 'Role Khusus';
  return {
    id: user.id || null,
    nama: user.nama || (user.email ? user.email.split('@')[0] : 'Pengguna'),
    email: user.email || '-',
    role: (role === 'editor' ? 'operator' : role),
    roleLabel
  };
}

function normalizeTripNoStKey(noST) {
  const s = String(noST || '').trim();
  if (!s) return '';
  const low = s.toLowerCase();
  if (low === 'tanpa nomor st' || low === 'tanpa no st' || low === '-') return '';
  return low;
}

// Composite Key Anti-Duplikat: Nomor ST boleh sama asalkan beda berkas LS/KKP atau beda MAK
function getTripCompositeDedupeKey(itemOrNoST, makParam, metodeParam) {
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
window.getTripCompositeDedupeKey = getTripCompositeDedupeKey;

function computeTripDraftSignature(item) {
  if (!item) return '';
  const d = item.draft || {};
  try {
    return JSON.stringify({
      noST: item.noST || '',
      mak: item.mak || d.fields?.mak || '',
      metodePembayaran: item.metodePembayaran || d.fields?.metodePembayaran || 'LS',
      agenda: item.agenda || '',
      prov: item.provinsiTujuan || '',
      kota: item.kotaTujuan || '',
      tglBerangkat: item.tglBerangkat || '',
      tglKembali: item.tglKembali || '',
      empCount: item.empCount || 0,
      totalBiaya: Number(item.totalBiaya) || 0,
      fields: d.fields || {},
      empIds: d.empIds || [],
      segments: d.segments || [],
      spdMap: d.spdMap || {},
      costCfg: d.costCfg || {},
      transports: d.transports || {},
      hotels: d.hotels || [],
      customCosts: d.customCosts || [],
      manualMeals: d.manualMeals || []
    });
  } catch (e) {
    return `${item.noST}|${item.mak}|${item.metodePembayaran}|${item.totalBiaya}|${item.empCount}`;
  }
}

function buildRevisionSummaryNote(oldItem, newItem) {
  if (!oldItem || !newItem) return 'Revisi data perjalanan dinas';
  const diffs = [];
  if (normalizeTripNoStKey(oldItem.noST) !== normalizeTripNoStKey(newItem.noST)) {
    diffs.push(`No. ST (${oldItem.noST} → ${newItem.noST})`);
  }
  const oldMetode = String(oldItem.metodePembayaran || oldItem.draft?.fields?.metodePembayaran || 'LS').toUpperCase();
  const newMetode = String(newItem.metodePembayaran || newItem.draft?.fields?.metodePembayaran || 'LS').toUpperCase();
  if (oldMetode !== newMetode) {
    diffs.push(`Metode (${oldMetode} → ${newMetode})`);
  }
  const oldMak = String(oldItem.mak || oldItem.draft?.fields?.mak || '').trim();
  const newMak = String(newItem.mak || newItem.draft?.fields?.mak || '').trim();
  if (oldMak !== newMak) {
    diffs.push(`MAK (${oldMak || '-'} → ${newMak || '-'})`);
  }
  if ((oldItem.agenda || '').trim() !== (newItem.agenda || '').trim()) {
    diffs.push('Agenda');
  }
  if ((oldItem.kotaTujuan || '').trim() !== (newItem.kotaTujuan || '').trim() || (oldItem.provinsiTujuan || '').trim() !== (newItem.provinsiTujuan || '').trim()) {
    diffs.push('Tujuan');
  }
  if ((oldItem.tglBerangkat || '') !== (newItem.tglBerangkat || '') || (oldItem.tglKembali || '') !== (newItem.tglKembali || '')) {
    diffs.push('Jadwal');
  }
  if ((Number(oldItem.empCount) || 0) !== (Number(newItem.empCount) || 0)) {
    diffs.push(`Pelaksana (${oldItem.empCount || 0} → ${newItem.empCount || 0} org)`);
  }
  if ((Number(oldItem.totalBiaya) || 0) !== (Number(newItem.totalBiaya) || 0)) {
    const oldRp = (typeof rp === 'function') ? rp(oldItem.totalBiaya) : oldItem.totalBiaya;
    const newRp = (typeof rp === 'function') ? rp(newItem.totalBiaya) : newItem.totalBiaya;
    diffs.push(`Total Biaya (${oldRp} → ${newRp})`);
  }
  return diffs.length > 0 ? `Revisi: ${diffs.join(', ')}` : 'Revisi rincian berkas perjalanan dinas';
}

function updateRevisionBanner(editTrip) {
  const banner = document.getElementById('activeRevisionBanner');
  if (!banner) return;
  if (!editTrip) {
    banner.classList.remove('is-saved');
    banner.style.display = 'none';
    banner.innerHTML = '';
    return;
  }
  const safeNo = (typeof escapeHtml === 'function') ? escapeHtml(editTrip.origNoST || editTrip.noST || 'Berkas Terpilih') : (editTrip.origNoST || 'Berkas Terpilih');
  const safeMetode = editTrip.origMetode ? ` [${editTrip.origMetode}]` : '';
  const safeMak = editTrip.origMak ? ` [MAK: ${editTrip.origMak}]` : '';
  const isJustSaved = !!editTrip.justSaved;
  banner.classList.toggle('is-saved', isJustSaved);
  banner.style.display = 'flex';
  banner.innerHTML = isJustSaved ? `
    <div class="rev-banner-left">
      <span class="rev-banner-pill is-saved">TERSIMPAN DI WEB</span>
      <span class="rev-banner-text">Berkas <strong>${safeNo}</strong>${safeMetode}${safeMak} telah tersimpan ke <strong>Riwayat &amp; Cloud Web</strong> tanpa mengunduh file ke perangkat. Anda dapat mencetak dokumen, mengunduh Excel lewat panah opsi, atau membuat input baru.</span>
    </div>
    <button type="button" class="btn btn-secondary btn-sm rev-banner-cancel" onclick="cancelActiveRevision()" title="Kosongkan formulir untuk mulai perjalanan dinas baru">
      <span>Buat Input Baru</span>
    </button>
  ` : `
    <div class="rev-banner-left">
      <span class="rev-banner-pill">MODE REVISI</span>
      <span class="rev-banner-text">Sedang merevisi berkas <strong>${safeNo}</strong>${safeMetode}${safeMak} &bull; Perubahan akan memperbarui data yang sudah ada dan tercatat di <strong>Log Revisi</strong> (tidak membuat data ganda).</span>
    </div>
    <button type="button" class="btn btn-secondary btn-sm rev-banner-cancel" onclick="cancelActiveRevision()" title="Batalkan revisi dan mulai form baru">
      <span>Batal / Buat Baru</span>
    </button>
  `;
}

function cancelActiveRevision() {
  window._activeEditingTrip = null;
  resetPerjadinForm(false);
}
window.cancelActiveRevision = cancelActiveRevision;

function toggleTripRevisionLog(tripId, event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const safeId = (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') ? CSS.escape(tripId) : tripId;
  const panel = document.getElementById(`revLog-${tripId}`) || document.querySelector(`[data-rev-log="${safeId}"]`);
  const btn = event?.currentTarget || panel?.previousElementSibling;
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (btn) btn.classList.toggle('is-open', !isOpen);
}
window.toggleTripRevisionLog = toggleTripRevisionLog;

function saveCurrentTripToHistory(isManual = false, customCsvData = null) {
  if (window._isExportingFromHistory) return null;

  const draft = (typeof collectPerjadinDraftData === 'function') ? collectPerjadinDraftData() : null;
  if (!draft || !draft.fields) {
    if (isManual) alert('Formulir masih kosong.');
    return null;
  }

  const noST = (draft.fields.noST || draft.fields.noSTNum || '').trim();
  const agenda = (draft.fields.agenda || '').trim();
  const prov = (draft.fields.provinsiTujuan || '').trim();
  const empIds = draft.empIds || [];

  if (!noST && !agenda && empIds.length === 0) {
    if (isManual) alert('Formulir masih kosong. Silakan isi data perjalanan dinas terlebih dahulu.');
    return null;
  }

  let totalBiaya = 0;
  try {
    const emps = (typeof employees !== 'undefined' && Array.isArray(employees))
      ? empIds.map(id => employees.find(e => e.id === id)).filter(Boolean)
      : [];
    if (typeof hitungBiaya === 'function') {
      totalBiaya = emps.reduce((tot, emp) => tot + (hitungBiaya(emp)?.total || 0), 0);
    }
  } catch (e) {
    console.warn('Gagal menghitung total estimasi biaya:', e);
  }

  const empList = empIds.map(id => {
    const emp = (typeof employees !== 'undefined') ? employees.find(e => e.id === id) : null;
    return emp ? { id: emp.id, nama: emp.nama, jabatan: emp.jabatan, nip: emp.nip, golongan: emp.golongan || emp.gol } : { id };
  });

  const activeEdit = window._activeEditingTrip || null;
  const rawMetode = draft.fields.metodePembayaran
    || (document.getElementById('metodePembayaran')?.value)
    || (document.getElementById('lk_metodePembayaran')?.value)
    || 'LS';
  const metodePembayaran = String(rawMetode).trim().toUpperCase() === 'KKP' ? 'KKP' : 'LS';
  const mak = String(draft.fields.mak || document.getElementById('mak')?.value || '').trim();

  // Composite Key: Nomor ST boleh sama asal beda metode (LS/KKP) atau beda MAK
  const compKey = getTripCompositeDedupeKey(noST, mak, metodePembayaran);
  const tripId = (activeEdit && activeEdit.id)
    ? activeEdit.id
    : ('trip_' + (compKey ? compKey.replace(/[^a-zA-Z0-9]/g, '_') : Date.now()));

  let provTeks = '';
  if (draft.fields.cbMultiProvinsi) {
    const p1 = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(draft.fields.provinsiTujuan1) : draft.fields.provinsiTujuan1;
    const p2 = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(draft.fields.provinsiTujuan2) : draft.fields.provinsiTujuan2;
    provTeks = [p1, p2].filter(Boolean).join(' & ');
  } else {
    provTeks = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(prov) : prov;
  }

  // Siapkan konversi CSV otomatis di latar belakang untuk integrasi database Supabase
  let csvStr = (typeof customCsvData === 'string' && customCsvData) ? customCsvData : '';
  if (!csvStr && typeof generatePerjadinCsvString === 'function') {
    try {
      csvStr = generatePerjadinCsvString(null, {
        noST, agenda, tglST: draft.fields.tglST,
        tglBerangkat: draft.fields.tglBerangkat, tglKembali: draft.fields.tglKembali,
        lamaTugas: draft.fields.lamaTugas, provinsiTujuan: provTeks,
        kotaTujuan: draft.fields.kotaTujuan, mak: mak,
        employees: empList, totalBiaya, draft
      });
    } catch (csvGenErr) {
      console.warn('Otomatisasi pembuatan CSV riwayat:', csvGenErr);
    }
  }

  const nowIso = new Date().toISOString();
  const actor = getCurrentRevisionActor();

  const historyItem = {
    id: tripId,
    noST: noST || 'Tanpa Nomor ST',
    mak: mak,
    metodePembayaran: metodePembayaran,
    agenda: agenda || 'Tanpa Agenda Perjalanan',
    tglST: draft.fields.tglST || '',
    tglBerangkat: draft.fields.tglBerangkat || '',
    tglKembali: draft.fields.tglKembali || '',
    lamaTugas: draft.fields.lamaTugas || '',
    provinsiTujuan: provTeks || '',
    kotaTujuan: draft.fields.kotaTujuan || '',
    empCount: empIds.length,
    employees: empList,
    totalBiaya: totalBiaya,
    status_berkas: (activeEdit && activeEdit.status_berkas) || 'diproses',
    savedAt: nowIso,
    createdAt: nowIso,
    createdBy: actor,
    revision_log: [],
    draft: draft,
    bbmData: (draft && draft.bbmData) || (typeof collectBbmFormData === 'function' ? collectBbmFormData() : null),
    csv_data: csvStr
  };

  cacheBbmRecord(historyItem);

  let list = getTripHistoryList();
  // Cari entri yang sudah ada berdasarkan context revisi aktif, cloudId, id, atau composite key (No ST + Metode + MAK)
  const existingIdx = list.findIndex(item => {
    if (!item) return false;
    if (activeEdit) {
      if (activeEdit.id && item.id === activeEdit.id) return true;
      if (activeEdit.cloudId && item.cloudId && item.cloudId === activeEdit.cloudId) return true;
    }
    if (item.id === historyItem.id) return true;
    if (compKey && getTripCompositeDedupeKey(item) === compKey) return true;
    return false;
  });

  let isRevisionRecorded = false;

  if (existingIdx >= 0) {
    const existing = list[existingIdx];
    historyItem.id = existing.id;
    if (existing.cloudId) {
      historyItem.cloudId = existing.cloudId;
      historyItem.isCloud = true;
    } else if (activeEdit && activeEdit.cloudId) {
      historyItem.cloudId = activeEdit.cloudId;
      historyItem.isCloud = true;
    }
    if (existing.status_berkas) {
      historyItem.status_berkas = existing.status_berkas;
    }
    if (!historyItem.csv_data && existing.csv_data) {
      historyItem.csv_data = existing.csv_data;
    }
    historyItem.createdAt = existing.createdAt || existing.savedAt || nowIso;
    historyItem.createdBy = existing.createdBy || actor;

    const prevLogs = Array.isArray(existing.revision_log) ? [...existing.revision_log] : [];
    // Pastikan catatan pembuat awal selalu ada dalam riwayat log jika belum tercatat
    if (!prevLogs.some(r => r && r.action === 'buat_baru')) {
      const creatorInfo = existing.createdBy || actor;
      prevLogs.push({
        id: 'rev_' + Date.now() + '_init',
        at: existing.createdAt || existing.savedAt || nowIso,
        actorId: creatorInfo.id || null,
        actorName: creatorInfo.nama || 'Pengguna',
        actorEmail: creatorInfo.email || '-',
        actorRole: creatorInfo.role || 'admin',
        actorRoleLabel: creatorInfo.roleLabel || 'Admin',
        action: 'buat_baru',
        note: 'Membuat berkas perjalanan dinas baru'
      });
    }
    const oldSig = computeTripDraftSignature(existing);
    const newSig = computeTripDraftSignature(historyItem);

    // Catat log revisi apabila isi/data berkas berubah atau direvisi dari Mode Revisi
    if (oldSig !== newSig || activeEdit) {
      const revEntry = {
        id: 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        at: nowIso,
        actorId: actor.id,
        actorName: actor.nama,
        actorEmail: actor.email,
        actorRole: actor.role,
        actorRoleLabel: actor.roleLabel,
        action: 'revisi',
        note: buildRevisionSummaryNote(existing, historyItem)
      };
      // Cegah dobel log identik dalam 2 detik jika ter-klik beruntun
      const latestRev = prevLogs[0];
      const isRapidDup = latestRev
        && latestRev.note === revEntry.note
        && latestRev.actorEmail === revEntry.actorEmail
        && Math.abs(new Date(nowIso).getTime() - new Date(latestRev.at || 0).getTime()) < 2000;
      if (!isRapidDup) {
        prevLogs.unshift(revEntry);
        isRevisionRecorded = true;
      }
    }
    historyItem.revision_log = prevLogs;
    list[existingIdx] = historyItem;

    // Bersihkan jika sempat ada baris duplikat lain di lokal untuk composite key / id / cloudId ini
    list = list.filter((it, idx) => {
      if (idx === existingIdx) return true;
      if (!it) return false;
      if (it.id === historyItem.id) return false;
      if (historyItem.cloudId && it.cloudId === historyItem.cloudId) return false;
      if (compKey && getTripCompositeDedupeKey(it) === compKey) return false;
      return true;
    });
  } else {
    // Saat pertama kali membuat berkas baru, langsung catat di log siapa pembuatnya dan waktunya
    historyItem.revision_log = [{
      id: 'rev_' + Date.now() + '_init',
      at: nowIso,
      actorId: actor.id,
      actorName: actor.nama,
      actorEmail: actor.email,
      actorRole: actor.role,
      actorRoleLabel: actor.roleLabel,
      action: 'buat_baru',
      note: 'Membuat berkas perjalanan dinas baru'
    }];
    list.unshift(historyItem);
  }

  saveTripHistoryList(list);

  // Sinkronkan konteks edit aktif agar perubahan berikutnya memperbarui berkas yang sama & user bisa buat baru kapan saja
  window._activeEditingTrip = {
    id: historyItem.id,
    cloudId: historyItem.cloudId || null,
    isCloud: !!historyItem.isCloud,
    origNoST: historyItem.noST || '',
    origMak: historyItem.mak || '',
    origMetode: historyItem.metodePembayaran || 'LS',
    status_berkas: historyItem.status_berkas || 'diproses',
    revision_log: Array.isArray(historyItem.revision_log) ? [...historyItem.revision_log] : [],
    justSaved: !isRevisionRecorded && (!activeEdit || !!activeEdit.justSaved)
  };
  if (typeof updateRevisionBanner === 'function') {
    updateRevisionBanner(window._activeEditingTrip);
  }

  if (typeof renderTripHistory === 'function') {
    renderTripHistory();
  }

  // Auto-integrasi langsung 1x ke Cloud Database (tabel riwayat_perjadin)
  if (typeof uploadTripToCloud === 'function') {
    uploadTripToCloud(historyItem).then(cloudId => {
      if (cloudId) {
        historyItem.cloudId = cloudId;
        historyItem.isCloud = true;
        if (window._activeEditingTrip && window._activeEditingTrip.id === historyItem.id) {
          window._activeEditingTrip.cloudId = cloudId;
          window._activeEditingTrip.isCloud = true;
        }
        const curList = getTripHistoryList();
        const curIdx = curList.findIndex(x => x.id === historyItem.id || (compKey && getTripCompositeDedupeKey(x) === compKey));
        if (curIdx >= 0) {
          curList[curIdx] = { ...curList[curIdx], ...historyItem, cloudId, isCloud: true };
        }
        saveTripHistoryList(curList);
        if (typeof renderTripHistory === 'function') renderTripHistory();
        if (isManual && typeof showRefreshToast === 'function') {
          showRefreshToast(
            isRevisionRecorded ? 'Revisi Tersimpan & Dicatat di Log' : 'Tersimpan ke Web & Cloud',
            isRevisionRecorded
              ? `Revisi "${historyItem.noST}" (${historyItem.metodePembayaran}) oleh ${actor.nama} (${actor.roleLabel}) berhasil diperbarui ke database.`
              : `Data perjalanan "${historyItem.noST}" (${historyItem.metodePembayaran}) tersimpan di Riwayat & Cloud tanpa mengunduh file ke perangkat.`
          );
        }
      } else if (isManual && typeof showRefreshToast === 'function') {
        showRefreshToast(
          isRevisionRecorded ? 'Revisi Tersimpan ke Riwayat' : 'Perjalanan Tersimpan di Web',
          `Data perjalanan "${historyItem.noST}" (${historyItem.metodePembayaran}) berhasil dicatat ke Riwayat Web.`
        );
      }
    }).catch(err => {
      console.warn('Gagal auto-integrasi ke Cloud:', err);
      if (isManual && typeof showRefreshToast === 'function') {
        showRefreshToast(
          'Perjalanan Tersimpan di Web',
          `Data perjalanan "${historyItem.noST}" (${historyItem.metodePembayaran}) berhasil dicatat ke Riwayat Web.`
        );
      }
    });
  } else if (isManual && typeof showRefreshToast === 'function') {
    showRefreshToast(
      'Perjalanan Tersimpan di Web',
      `Data perjalanan "${historyItem.noST}" (${historyItem.metodePembayaran}) berhasil dicatat ke Riwayat Web.`
    );
  }

  return historyItem;
}

function loadTripFromHistory(id, event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) {
    alert('Data riwayat perjalanan tidak ditemukan.');
    return;
  }

  const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  const isViewer = !canEdit && !!window.currentAuthUser;

  if (isViewer) {
    openTripPdfModal(id);
    return;
  }

  const rawMetode = item.metodePembayaran || item.draft?.fields?.metodePembayaran || item.draft?.fields?.lk_metodePembayaran || 'LS';
  const itemMetode = String(rawMetode).trim().toUpperCase() === 'KKP' ? 'KKP' : 'LS';
  const itemMak = item.mak || item.draft?.fields?.mak || '';

  window._activeEditingTrip = {
    id: item.id,
    cloudId: item.cloudId || null,
    isCloud: !!item.isCloud,
    origNoST: item.noST || '',
    origMak: itemMak,
    origMetode: itemMetode,
    status_berkas: item.status_berkas || 'diproses',
    revision_log: Array.isArray(item.revision_log) ? [...item.revision_log] : []
  };

  if (typeof restorePerjadinDraftData === 'function') {
    restorePerjadinDraftData(item.draft);
  }

  // Muat bundle berkas BBM yang terikat dengan SPT ini
  const bbmRecord = getCachedBbmRecord(item);
  if (bbmRecord && typeof loadBbmRecordIntoForm === 'function') {
    try {
      loadBbmRecordIntoForm(bbmRecord);
    } catch (e) {
      console.warn('Gagal memuat bundle BBM saat loadTripToForm:', e);
    }
  }

  // Pastikan metode pembayaran terupdate di seluruh kontrol input & tabs
  if (typeof onMetodePembayaranChange === 'function') {
    onMetodePembayaranChange(itemMetode);
  }

  // Jangan simpan PERJADIN_DRAFT_KEY ke localStorage agar refresh/tutup web tetap auto-clear form
  updateRevisionBanner(window._activeEditingTrip);
  showTab('input');

  setTimeout(() => {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Perjalanan Dimuat untuk Revisi',
        `Data "${item.noST}" [${itemMetode}] siap direvisi. Saat disimpan nanti akan memperbarui data berkas ini dan tercatat di Log Revisi.`
      );
    }
  }, 250);
}

function duplicateTripFromHistory(id, event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) return;

  window._activeEditingTrip = null;
  updateRevisionBanner(null);

  const clonedDraft = JSON.parse(JSON.stringify(item.draft));

  if (typeof restorePerjadinDraftData === 'function') {
    restorePerjadinDraftData(clonedDraft);
  }

  const rawMetode = item.metodePembayaran || item.draft?.fields?.metodePembayaran || 'LS';
  if (typeof onMetodePembayaranChange === 'function') {
    onMetodePembayaranChange(rawMetode);
  }

  showTab('input');

  setTimeout(() => {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Perjalanan Diduplikasi',
        `Isian berkas telah dimuat. Anda dapat mengubah Metode Pembayaran (LS/KKP), MAK, atau No. ST sebelum menyimpan berkas baru.`
      );
    }
  }, 250);
}

function deleteTripFromHistory(id, event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item) return;

  if (typeof isCurrentUserAdmin === 'function' && !isCurrentUserAdmin() && window.currentAuthUser) {
    alert('Akun Viewer hanya memiliki izin baca. Anda tidak memiliki wewenang menghapus data riwayat.');
    return;
  }

  if (!confirm(`Hapus perjalanan "${item.noST}" dari riwayat?`)) return;

  if (window._activeEditingTrip && window._activeEditingTrip.id === id) {
    window._activeEditingTrip = null;
    updateRevisionBanner(null);
  }

  if (item.cloudId && typeof removeTripFromCloud === 'function' && typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin()) {
    removeTripFromCloud(item.cloudId);
  }

  const updated = list.filter(x => x.id !== id);
  saveTripHistoryList(updated);
  renderTripHistory();

  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Riwayat Dihapus', `Perjalanan "${item.noST}" telah dihapus dari riwayat.`);
  }
}

function exportExcelFromHistory(id, mode = 'excel', event = null) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) return;

  window._isExportingFromHistory = true;
  try {
    if (typeof restorePerjadinDraftData === 'function') {
      restorePerjadinDraftData(item.draft);
    }
    if (typeof exportPerjadinExcel === 'function') {
      exportPerjadinExcel(mode);
    }
  } finally {
    window._isExportingFromHistory = false;
  }
}

function formatHistoryDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const pad = n => String(n).padStart(2, '0');
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
  } catch (e) {
    return isoStr;
  }
}

let currentTripStatusFilter = 'all';

function setTripStatusFilter(filter) {
  currentTripStatusFilter = filter;
  const filterMap = {
    all: 'btnFilterAll',
    ls: 'btnFilterLs',
    kkp: 'btnFilterKkp',
    diproses: 'btnFilterDiproses',
    dicairkan: 'btnFilterDicairkan'
  };
  ['all', 'ls', 'kkp', 'diproses', 'dicairkan'].forEach(f => {
    const btn = document.querySelector(`.btn-filter-pill[data-filter="${f}"]`) || document.getElementById(filterMap[f]);
    if (btn) btn.classList.toggle('active', f === filter);
  });
  renderTripHistory();
}

function renderDashboardModule(passedList = null) {
  const list = passedList || getTripHistoryList();
  const totalAll = list.length;
  const diprosesItems = list.filter(x => (x.status_berkas || 'diproses') !== 'dicairkan');
  const dicairkanItems = list.filter(x => x.status_berkas === 'dicairkan');
  const totalDiproses = diprosesItems.length;
  const totalDicairkan = dicairkanItems.length;

  // Dana yang dibayarkan/dicairkan HANYA untuk berkas LS.
  // Berkas KKP adalah kartu kredit pemerintah (non-tunai / bukan pencairan ke pelaksana).
  const sumNominalDicairkanLS = dicairkanItems.filter(x => {
    const raw = x.metodePembayaran || x.draft?.fields?.metodePembayaran || x.draft?.fields?.lk_metodePembayaran || 'LS';
    return String(raw).trim().toUpperCase() !== 'KKP';
  }).reduce((acc, cur) => acc + (Number(cur.totalBiaya) || 0), 0);
  const sumNominalDicairkan = sumNominalDicairkanLS;

  // Update KPI cards
  const elCountDiproses = document.getElementById('kpiCountDiproses');
  if (elCountDiproses) elCountDiproses.textContent = totalDiproses;

  const elCountDicairkan = document.getElementById('kpiCountDicairkan');
  if (elCountDicairkan) elCountDicairkan.textContent = totalDicairkan;

  const elNominalDicairkan = document.getElementById('kpiNominalDicairkan');
  if (elNominalDicairkan) {
    const formattedNominal = (typeof rp === 'function') ? rp(sumNominalDicairkan) : 'Rp ' + sumNominalDicairkan.toLocaleString('id-ID');
    elNominalDicairkan.textContent = `Dana LS Dibayarkan: ${formattedNominal}`;
    elNominalDicairkan.title = 'Hanya menghitung dana berkas LS yang dicairkan/dibayarkan. Berkas KKP bersifat non-tunai (kartu kredit satker).';
  }

  const elCountTotal = document.getElementById('kpiCountTotal');
  if (elCountTotal) elCountTotal.textContent = totalAll;

  // Update Progress Bar
  const pct = totalAll > 0 ? Math.round((totalDicairkan / totalAll) * 100) : 0;
  const fill = document.getElementById('dashboardProgressFill');
  if (fill) fill.style.width = pct + '%';

  const progressTxt = document.getElementById('dashboardProgressText');
  if (progressTxt) progressTxt.textContent = `${totalDicairkan} dari ${totalAll} Berkas Telah Dicairkan (${totalDiproses} Sedang Diproses)`;

  const progressPct = document.getElementById('dashboardProgressPct');
  if (progressPct) progressPct.textContent = `${pct}% Tuntas`;

  // Render recent 5 trips on dashboard
  const recentContainer = document.getElementById('dashboardRecentList');
  if (recentContainer) {
    if (list.length === 0) {
      recentContainer.innerHTML = `
        <div style="text-align:center; padding:28px 16px; color:var(--text-muted, #64748b);">
          Belum ada perjalanan dinas yang tercatat.
        </div>
      `;
    } else {
      const recentFive = list.slice(0, 5);
      recentContainer.innerHTML = `
        <table class="dashboard-recent-table">
          <colgroup>
            <col class="col-st-w">
            <col class="col-agenda-w">
            <col class="col-emp-w">
            <col class="col-cost-w">
            <col class="col-status-w">
            <col class="col-act-w">
          </colgroup>
          <thead>
            <tr>
              <th>Nomor ST</th>
              <th>Maksud &amp; Tujuan</th>
              <th>Pelaksana</th>
              <th style="text-align:right;">Total Biaya</th>
              <th style="text-align:center;">Status Satker</th>
              <th style="text-align:right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${recentFive.map(item => {
              const status = item.status_berkas || 'diproses';
              const isDicairkan = (status === 'dicairkan');
              const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
              const statusBadge = isDicairkan
                ? `<span class="history-status-badge status-dicairkan" ${canEdit ? `onclick="toggleTripStatus('${item.id}', event)" style="font-size:11px;padding:3px 9px;cursor:pointer;" title="Klik untuk mengubah status kembali ke Diproses ke Satker"` : 'style="font-size:11px;padding:3px 9px;"'}><svg class="ico" style="width:12px;height:12px;"><use href="#i-check"></use></svg>Dicairkan</span>`
                : `<span class="history-status-badge status-diproses" ${canEdit ? `onclick="toggleTripStatus('${item.id}', event)" style="font-size:11px;padding:3px 9px;cursor:pointer;" title="Klik untuk menandai berkas Sudah Dicairkan"` : 'style="font-size:11px;padding:3px 9px;"'}><svg class="ico" style="width:12px;height:12px;"><use href="#i-clipboard"></use></svg>Diproses</span>`;
              const cost = item.totalBiaya > 0 ? ((typeof rp === 'function') ? rp(item.totalBiaya) : 'Rp ' + Number(item.totalBiaya).toLocaleString('id-ID')) : 'Rp 0';
              const safeNo = (typeof escapeHtml === 'function') ? escapeHtml(item.noST || '-') : (item.noST || '-');
              const safeAgenda = (typeof escapeHtml === 'function') ? escapeHtml(item.agenda || '-') : (item.agenda || '-');
              const empCount = item.empCount || (item.employees || []).length || 1;
              return `
                <tr>
                  <td class="col-st">
                    <span class="recent-st-badge" title="${safeNo}">${safeNo}</span>
                  </td>
                  <td class="col-agenda">
                    <div class="recent-agenda-text" title="${safeAgenda}">${safeAgenda}</div>
                  </td>
                  <td class="col-emp">
                    <span class="recent-pelaksana-badge">
                      <svg class="ico" style="width:13px;height:13px;"><use href="#i-user"></use></svg>
                      <span>${empCount} Orang</span>
                    </span>
                  </td>
                  <td class="col-cost" style="text-align:right;">
                    <span class="recent-cost-val">${cost}</span>
                  </td>
                  <td class="col-status" style="text-align:center;">
                    ${statusBadge}
                  </td>
                  <td class="col-act" style="text-align:right;">
                    <button type="button" class="btn-recent-pdf" onclick="openTripPdfModal('${item.id}', event)" title="Buka berkas PDF lengkap per pelaksana">
                      <svg class="ico" style="width:13px;height:13px;"><use href="#i-file-lines"></use></svg>
                      <span>Berkas PDF</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }
}

function renderRevisionLogHtml(item) {
  let revs = Array.isArray(item.revision_log) ? [...item.revision_log] : [];
  // Pastikan entri 'buat_baru' selalu ada di log agar tercatat siapa pembuatnya
  if (!revs.some(r => r && r.action === 'buat_baru')) {
    const creator = item.createdBy || {};
    const actorRole = creator.role || 'operator';
    const actorRoleLabel = creator.roleLabel || (actorRole === 'admin' ? 'Admin' : 'Role Khusus');
    revs.push({
      id: 'rev_creator_synth',
      at: item.createdAt || item.savedAt || new Date().toISOString(),
      actorId: creator.id || null,
      actorName: creator.nama || (creator.email && creator.email !== '-' ? creator.email.split('@')[0] : 'Pembuat Berkas'),
      actorEmail: creator.email || '-',
      actorRole,
      actorRoleLabel,
      action: 'buat_baru',
      note: 'Membuat berkas perjalanan dinas baru'
    });
  }
  if (revs.length === 0) return '';

  const esc = (s) => (typeof escapeHtml === 'function') ? escapeHtml(s) : String(s == null ? '' : s);
  const actualRevs = revs.filter(r => r && r.action !== 'buat_baru');
  const latest = revs[0];
  const latestName = esc(latest.actorName || latest.actorEmail || 'Pengguna');
  const latestRoleKey = (latest.actorRole === 'admin') ? 'admin' : ((latest.actorRole === 'operator' || latest.actorRole === 'editor') ? 'operator' : 'viewer');
  const latestRoleLabel = esc(latest.actorRoleLabel || (latestRoleKey === 'admin' ? 'Admin' : (latestRoleKey === 'operator' ? 'Role Khusus' : 'Pengguna')));
  const latestTime = esc(formatHistoryDate(latest.at));

  const badgeHtml = actualRevs.length > 0
    ? `<span class="rev-badge-count">🕒 ${actualRevs.length}x Revisi</span>`
    : `<span class="rev-badge-count rev-badge-created">📝 Dibuat</span>`;
  const summaryPrefix = actualRevs.length > 0 ? 'Terakhir:' : 'Oleh:';

  let revCounter = actualRevs.length;
  const timelineRows = revs.map((rev) => {
    const isCreatorEntry = rev.action === 'buat_baru';
    const revNum = isCreatorEntry ? 0 : revCounter--;
    const roleKey = (rev.actorRole === 'admin') ? 'admin' : ((rev.actorRole === 'operator' || rev.actorRole === 'editor') ? 'operator' : 'viewer');
    const roleLbl = esc(rev.actorRoleLabel || (roleKey === 'admin' ? 'Admin' : (roleKey === 'operator' ? 'Role Khusus' : 'Pengguna')));
    const actorName = esc(rev.actorName || rev.actorEmail || 'Pengguna');
    const actorEmail = (rev.actorEmail && rev.actorEmail !== '-') ? ` (${esc(rev.actorEmail)})` : '';
    const note = esc(rev.note || (isCreatorEntry ? 'Membuat berkas perjalanan dinas baru' : 'Revisi data berkas'));
    const timeStr = esc(formatHistoryDate(rev.at));

    return `
      <div class="rev-log-entry">
        <div class="rev-log-marker ${isCreatorEntry ? 'is-creator' : ''}">${isCreatorEntry ? 'BARU' : `#${revNum}`}</div>
        <div class="rev-log-content">
          <div class="rev-log-meta">
            <strong class="rev-log-actor">${actorName}</strong><span class="rev-log-email">${actorEmail}</span>
            <span class="rev-role-tag rev-role-${roleKey}">${roleLbl}</span>
            <span class="rev-log-time">&bull; ${timeStr}</span>
          </div>
          <div class="rev-log-note">${note}</div>
        </div>
      </div>
    `;
  }).join('');

  const safeTripId = esc(item.id);
  return `
    <div class="history-revision-box" onclick="event.stopPropagation()">
      <button type="button" class="history-revision-toggle" onclick="toggleTripRevisionLog('${safeTripId}', event)" title="Klik untuk melihat riwayat pembuatan &amp; log revisi lengkap">
        ${badgeHtml}
        <span class="rev-latest-summary">
          ${summaryPrefix} <strong>${latestName}</strong>
          <span class="rev-role-tag rev-role-${latestRoleKey}">${latestRoleLabel}</span>
          <span class="rev-latest-time">&bull; ${latestTime}</span>
        </span>
        <span class="rev-chevron">▾</span>
      </button>
      <div class="history-revision-timeline" id="revLog-${safeTripId}" data-rev-log="${safeTripId}" style="display:none;">
        ${timelineRows}
      </div>
    </div>
  `;
}

function renderTripHistory(filterText = '') {
  const container = document.getElementById('historyListContainer');
  const countBadge = document.getElementById('historyCountBadge');
  if (!container) return;

  const list = getTripHistoryList();

  // Hitung metrik KPI real-time untuk Dashboard & Filter Pills (tanpa auto-push ulang agar tidak ada duplikat DB)
  const totalAll = list.length;
  const lsItems = list.filter(x => {
    const raw = x.metodePembayaran || x.draft?.fields?.metodePembayaran || x.draft?.fields?.lk_metodePembayaran || 'LS';
    return String(raw).trim().toUpperCase() !== 'KKP';
  });
  const kkpItems = list.filter(x => {
    const raw = x.metodePembayaran || x.draft?.fields?.metodePembayaran || x.draft?.fields?.lk_metodePembayaran || 'LS';
    return String(raw).trim().toUpperCase() === 'KKP';
  });
  const diprosesItems = list.filter(x => (x.status_berkas || 'diproses') !== 'dicairkan');
  const dicairkanItems = list.filter(x => x.status_berkas === 'dicairkan');

  const totalLs = lsItems.length;
  const totalKkp = kkpItems.length;
  const totalDiproses = diprosesItems.length;
  const totalDicairkan = dicairkanItems.length;

  const elPillAll = document.getElementById('filterCountAll');
  if (elPillAll) elPillAll.textContent = totalAll;
  const elPillLs = document.getElementById('filterCountLs');
  if (elPillLs) elPillLs.textContent = totalLs;
  const elPillKkp = document.getElementById('filterCountKkp');
  if (elPillKkp) elPillKkp.textContent = totalKkp;
  const elPillDiproses = document.getElementById('filterCountDiproses');
  if (elPillDiproses) elPillDiproses.textContent = totalDiproses;
  const elPillDicairkan = document.getElementById('filterCountDicairkan');
  if (elPillDicairkan) elPillDicairkan.textContent = totalDicairkan;

  // Sinkronkan data ke Dashboard Eksekutif
  renderDashboardModule(list);

  const q = String(filterText || document.getElementById('historySearchInput')?.value || '').trim().toLowerCase();

  const filtered = list.filter(item => {
    const status = item.status_berkas || 'diproses';
    const rawMetode = item.metodePembayaran || item.draft?.fields?.metodePembayaran || item.draft?.fields?.lk_metodePembayaran || 'LS';
    const isKKP = String(rawMetode).trim().toUpperCase() === 'KKP';

    if (currentTripStatusFilter === 'ls' && isKKP) return false;
    if (currentTripStatusFilter === 'kkp' && !isKKP) return false;
    if (currentTripStatusFilter === 'diproses' && status === 'dicairkan') return false;
    if (currentTripStatusFilter === 'dicairkan' && status !== 'dicairkan') return false;

    if (!q) return true;
    const provDisplay = (typeof getProvinsiDisplayName === 'function')
      ? getProvinsiDisplayName(item.provinsiTujuan)
      : (item.provinsiTujuan || '');
    const itemMetode = String(item.metodePembayaran || item.draft?.fields?.metodePembayaran || item.draft?.fields?.lk_metodePembayaran || 'LS').trim().toUpperCase() === 'KKP' ? 'KKP' : 'LS';
    const searchTarget = [
      item.noST,
      itemMetode,
      item.agenda,
      provDisplay,
      item.kotaTujuan,
      item.mak,
      item.status_berkas || 'diproses',
      ...(item.employees || []).map(e => e.nama || '')
    ].join(' ').toLowerCase();
    return searchTarget.includes(q);
  });

  if (countBadge) {
    countBadge.textContent = `${list.length} Riwayat Tersimpan`;
  }

  const searchWrap = document.querySelector('.history-search-wrap');
  if (searchWrap) {
    searchWrap.classList.toggle('has-val', !!q);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="history-empty-card">
        <div class="history-empty-icon">
          <svg class="ico"><use href="#i-history"></use></svg>
        </div>
        <h3>Belum Ada Riwayat Perjalanan</h3>
        <p>Setiap kali Anda mengklik tombol <strong>Simpan Data</strong>, arsip perjalanan dinas akan otomatis tersimpan ke web (Riwayat &amp; Cloud) agar dapat Anda buka, revisi, atau unduh ke Excel/PDF kapan saja.</p>
        <button type="button" class="btn btn-primary" onclick="showTab('input')">
          <svg class="ico"><use href="#i-edit"></use></svg>
          <span>Buka Formulir Input Perjalanan</span>
        </button>
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    const safeQ = (typeof escapeHtml === 'function') ? escapeHtml(q) : q;
    container.innerHTML = `
      <div class="history-empty-card">
        <div class="history-empty-icon">
          <svg class="ico"><use href="#i-search"></use></svg>
        </div>
        <h3>Tidak Ditemukan Hasil</h3>
        <p>Tidak ada riwayat yang cocok dengan kata kunci <em>"${safeQ}"</em>.</p>
        <button type="button" class="btn btn-secondary" onclick="clearHistorySearch()">
          <span>Bersihkan Pencarian</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const costFormatted = item.totalBiaya > 0
      ? ((typeof rp === 'function') ? rp(item.totalBiaya) : 'Rp ' + Number(item.totalBiaya).toLocaleString('id-ID'))
      : 'Rp 0';

    const tglTeks = (item.tglBerangkat && item.tglKembali)
      ? `${(typeof formatTgl === 'function' ? formatTgl(item.tglBerangkat) : item.tglBerangkat)} s.d. ${(typeof formatTgl === 'function' ? formatTgl(item.tglKembali) : item.tglKembali)}`
      : item.tglBerangkat || 'Tanggal belum diisi';

    const durationTeks = item.lamaTugas ? ` (${item.lamaTugas})` : '';
    const provDisplay = (typeof getProvinsiDisplayName === 'function')
      ? getProvinsiDisplayName(item.provinsiTujuan)
      : (item.provinsiTujuan || '');
    const kota = (item.kotaTujuan || '').trim();
    let destinationTeks = 'Belum ditentukan';
    if (kota && provDisplay) {
      if (kota.toLowerCase().includes(provDisplay.toLowerCase())) {
        destinationTeks = kota;
      } else {
        destinationTeks = `${kota}, ${provDisplay}`;
      }
    } else if (kota) {
      destinationTeks = kota;
    } else if (provDisplay) {
      destinationTeks = provDisplay;
    }
    const emps = item.employees || [];

    const safeNoST = (typeof escapeHtml === 'function') ? escapeHtml(item.noST) : item.noST;
    const safeMak = (typeof escapeHtml === 'function') ? escapeHtml(item.mak) : item.mak;
    const safeAgenda = (typeof escapeHtml === 'function') ? escapeHtml(item.agenda) : item.agenda;
    const safeDest = (typeof escapeHtml === 'function') ? escapeHtml(destinationTeks) : destinationTeks;
    const safeTgl = (typeof escapeHtml === 'function') ? escapeHtml(tglTeks) : tglTeks;
    const safeDuration = (typeof escapeHtml === 'function') ? escapeHtml(durationTeks) : durationTeks;

    const empPillsHtml = emps.slice(0, 5).map(e => {
      const shortName = (e.nama || '').split(',')[0];
      const safeName = (typeof escapeHtml === 'function') ? escapeHtml(shortName) : shortName;
      return `<span class="emp-pill">${safeName}</span>`;
    }).join('');

    const morePillHtml = emps.length > 5 ? `<span class="emp-pill more">+${emps.length - 5} lainnya</span>` : '';
    const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
    const isViewer = !canEdit && !!window.currentAuthUser;
    const isCloud = !!item.isCloud;
    const storagePill = isCloud
      ? '<span class="history-cloud-pill" title="Tersimpan di Cloud Database">☁️ Cloud</span>'
      : '<span class="history-local-pill" title="Tersimpan di Penyimpanan Lokal Browser">💾 Lokal</span>';
    const bbmRecord = getCachedBbmRecord(item);
    const bbmPill = bbmRecord ? `
      <span class="history-cloud-pill history-bbm-pill" title="Berkas BBM tersimpan di Cloud">
        <svg class="ico" style="width:14px;height:14px;"><use href="#i-file"></use></svg>
        Berkas BBM — No. ST: ${(typeof escapeHtml === 'function' ? escapeHtml(bbmRecord.noST || item.noST || '-') : (bbmRecord.noST || item.noST || '-'))}
      </span>` : '';

    const rawMetode = item.metodePembayaran || (item.draft && item.draft.fields && (item.draft.fields.metodePembayaran || item.draft.fields.lk_metodePembayaran)) || 'LS';
    const isKKP = String(rawMetode).trim().toUpperCase() === 'KKP';
    const metodeLabel = isKKP ? 'KKP' : 'LS';

    const status = item.status_berkas || 'diproses';
    const isDicairkan = status === 'dicairkan';

    let statusLabel = 'Diproses ke Satker';
    let statusBadgeClass = 'status-diproses';
    let statusBadgeTitle = 'Berkas sedang dalam verifikasi &amp; pengujian Satker';
    let toggleBtnLabel = isKKP ? 'Tandai KKP Selesai' : 'Tandai Dicairkan';
    let toggleBtnClass = isKKP ? 'is-kkp-selesai' : 'is-dicairkan';

    if (isDicairkan) {
      if (isKKP) {
        statusLabel = 'Berkas KKP Selesai';
        statusBadgeClass = 'status-dicairkan status-kkp-selesai';
        statusBadgeTitle = 'Berkas pertanggungjawaban KKP telah lengkap dan selesai diverifikasi';
      } else {
        statusLabel = 'Sudah Dicairkan';
        statusBadgeClass = 'status-dicairkan';
        statusBadgeTitle = 'Berkas telah diverifikasi dan dana dicairkan (SP2D LS)';
      }
      toggleBtnLabel = 'Ubah ke Diproses';
      toggleBtnClass = 'is-diproses';
    }

    const statusBadge = `
      <span class="history-status-badge ${statusBadgeClass}" ${canEdit ? `onclick="toggleTripStatus('${item.id}', event)" style="cursor:pointer;" title="Klik untuk mengubah status berkas"` : `title="${statusBadgeTitle}"`}>
        <svg class="ico" style="width:14px;height:14px;"><use href="${isDicairkan ? '#i-check' : '#i-clipboard'}"></use></svg>
        <span>${statusLabel}</span>
      </span>
    `;

    const statusToggleBtn = canEdit ? `
      <button type="button" class="btn btn-status-toggle ${toggleBtnClass}" onclick="toggleTripStatus('${item.id}', event)" title="Perbarui status progres berkas">
        <svg class="ico"><use href="${isDicairkan ? '#i-refresh' : '#i-check'}"></use></svg>
        <span>${toggleBtnLabel}</span>
      </button>
    ` : '';

    const cardActionsHtml = isViewer ? `
      <div class="history-card-actions">
        <button type="button" class="btn btn-primary btn-sm trip-pdf-btn-bundle" onclick="openTripPdfModal('${item.id}', event)" title="Buka dan unduh dokumen PDF lengkap per pelaksana">
          <svg class="ico"><use href="#i-file-lines"></use></svg>
          <span>Buka Dokumen PDF Lengkap</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'excel', event)" title="Unduh file Excel perjalanan ini">
          <svg class="ico"><use href="#i-save"></use></svg>
          <span>Unduh Excel</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'zip', event)" title="Unduh paket ZIP lengkap (Excel + Semua PDF)">
          <svg class="ico"><use href="#i-package"></use></svg>
          <span>Unduh ZIP</span>
        </button>
      </div>
    ` : `
      <div class="history-card-actions">
        ${statusToggleBtn}
        <button type="button" class="btn btn-primary btn-sm" onclick="loadTripFromHistory('${item.id}', event)" title="Muat seluruh data perjalanan ini ke formulir untuk diedit/direvisi">
          <svg class="ico"><use href="#i-edit"></use></svg>
          <span>Edit / Revisi</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm trip-pdf-btn-bundle" onclick="openTripPdfModal('${item.id}', event)" title="Buka dan unduh berkas PDF lengkap per pelaksana">
          <svg class="ico"><use href="#i-file-lines"></use></svg>
          <span>Dokumen PDF</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'excel', event)" title="Unduh file Excel perjalanan ini">
          <svg class="ico"><use href="#i-save"></use></svg>
          <span>Unduh Excel</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'zip', event)" title="Unduh paket ZIP lengkap">
          <svg class="ico"><use href="#i-package"></use></svg>
          <span>Unduh ZIP</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="duplicateTripFromHistory('${item.id}', event)" title="Salin data perjalanan ini untuk membuat perjalanan baru">
          <svg class="ico"><use href="#i-plus"></use></svg>
          <span>Duplikat</span>
        </button>
        ${(typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin()) ? `
        <button type="button" class="btn btn-outline btn-sm" onclick="deleteTripFromHistory('${item.id}', event)" title="Hapus perjalanan ini dari riwayat">
          <svg class="ico"><use href="#i-trash"></use></svg>
          <span>Hapus</span>
        </button>` : ''}
      </div>
    `;

    return `
      <div class="history-card ${isKKP ? 'card-method-kkp' : 'card-method-ls'}" data-trip-id="${item.id}" onclick="handleTripCardClick(event, '${item.id}')" title="Klik untuk membuka dokumen PDF lengkap perjalanan ini">
        <div class="history-card-top">
          <div class="history-card-st">
            <span class="history-st-badge">${safeNoST}</span>
            <span class="history-metode-pill ${isKKP ? 'is-kkp' : 'is-ls'}" title="Metode Pembayaran: ${isKKP ? 'Kartu Kredit Pemerintah (KKP)' : 'Pembayaran Langsung (LS)'}">${metodeLabel}</span>
            ${safeMak ? `<span class="history-mak-pill" title="Mata Anggaran Kegiatan (MAK)">MAK: ${safeMak}</span>` : ''}
            ${statusBadge}
            ${storagePill}
            ${bbmPill}
          </div>
          <div class="history-card-date">
            <svg class="ico"><use href="#i-calendar"></use></svg>
            <span>Disimpan: ${formatHistoryDate(item.savedAt)}</span>
          </div>
        </div>

        <div class="history-card-body">
          <h3 class="history-card-agenda">${safeAgenda}</h3>
          
          <div class="history-meta-grid">
            <div class="history-meta-item">
              <span class="meta-label">Tujuan</span>
              <span class="meta-val">${safeDest}</span>
            </div>
            <div class="history-meta-item">
              <span class="meta-label">Jadwal Pelaksanaan</span>
              <span class="meta-val">${safeTgl}${safeDuration}</span>
            </div>
            <div class="history-meta-item">
              <span class="meta-label">Pelaksana</span>
              <span class="meta-val">${item.empCount} Pegawai</span>
            </div>
            <div class="history-meta-item history-meta-cost">
              <span class="meta-label">Total Estimasi Biaya</span>
              <span class="meta-val cost-text">${costFormatted}</span>
            </div>
          </div>

          ${emps.length > 0 ? `
            <div class="history-emp-pills">
              ${empPillsHtml}
              ${morePillHtml}
            </div>
          ` : ''}

          ${renderRevisionLogHtml(item)}
        </div>

        ${cardActionsHtml}
      </div>
    `;
  }).join('');
}

async function toggleTripStatus(tripId, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  if (!canEdit) {
    alert('Hanya Admin dan Role Khusus yang berhak memperbarui progres berkas.');
    return;
  }
  const list = getTripHistoryList();
  const item = list.find(x => x.id === tripId);
  if (!item) return;

  const rawMetode = item.metodePembayaran || item.draft?.fields?.metodePembayaran || item.draft?.fields?.lk_metodePembayaran || 'LS';
  const isKKP = String(rawMetode).trim().toUpperCase() === 'KKP';

  const currentStatus = item.status_berkas || 'diproses';
  const newStatus = (currentStatus === 'dicairkan') ? 'diproses' : 'dicairkan';
  const oldLabel = (currentStatus === 'dicairkan') ? (isKKP ? 'Berkas KKP Selesai' : 'Sudah Dicairkan') : 'Diproses ke Satker';
  const newLabel = (newStatus === 'dicairkan') ? (isKKP ? 'Berkas KKP Selesai' : 'Sudah Dicairkan') : 'Diproses ke Satker';
  const nowIso = new Date().toISOString();
  const actor = getCurrentRevisionActor();

  item.status_berkas = newStatus;
  item.savedAt = nowIso;
  const logs = Array.isArray(item.revision_log) ? [...item.revision_log] : [];
  logs.unshift({
    id: 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    at: nowIso,
    actorId: actor.id,
    actorName: actor.nama,
    actorEmail: actor.email,
    actorRole: actor.role,
    actorRoleLabel: actor.roleLabel,
    action: 'status',
    note: `Update status berkas: ${oldLabel} → ${newLabel}`
  });
  item.revision_log = logs;

  saveTripHistoryList(list);
  renderTripHistory();
  renderDashboardModule(list);

  if (typeof showRefreshToast === 'function') {
    showRefreshToast(
      isKKP
        ? (newStatus === 'dicairkan' ? 'Berkas KKP Selesai' : 'Status KKP Kembali Diproses')
        : (newStatus === 'dicairkan' ? 'Berkas Telah Dicairkan' : 'Status Kembali Diproses'),
      `Status berkas "${item.noST}" [${isKKP ? 'KKP' : 'LS'}] diubah ke [${newLabel}] oleh ${actor.nama} (${actor.roleLabel}).`
    );
  }

  // Update ke database Supabase Cloud jika terhubung
  if (typeof uploadTripToCloud === 'function') {
    uploadTripToCloud(item).then(cloudId => {
      if (cloudId && !item.cloudId) {
        item.cloudId = cloudId;
        item.isCloud = true;
        saveTripHistoryList(list);
      }
    }).catch(e => {
      console.warn('Gagal sinkron status ke Supabase:', e);
    });
  }
}
window.toggleTripStatus = toggleTripStatus;

function filterTripHistory() {
  const input = document.getElementById('historySearchInput');
  renderTripHistory(input?.value || '');
}

function clearHistorySearch() {
  const input = document.getElementById('historySearchInput');
  if (input) input.value = '';
  renderTripHistory('');
}

function toggleSaveMenu(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const group = document.getElementById('saveSplitGroup');
  const menu = document.getElementById('saveSplitMenu');
  const btnArrow = document.querySelector('.btn-split-arrow');
  if (!menu) return;
  const isHidden = menu.style.display === 'none' || !menu.style.display;
  if (isHidden) {
    menu.style.display = 'block';
    if (group) group.classList.add('open');
    if (btnArrow) btnArrow.setAttribute('aria-expanded', 'true');
  } else {
    menu.style.display = 'none';
    if (group) group.classList.remove('open');
    if (btnArrow) btnArrow.setAttribute('aria-expanded', 'false');
  }
}

function closeSaveMenu() {
  const group = document.getElementById('saveSplitGroup');
  const menu = document.getElementById('saveSplitMenu');
  const btnArrow = document.querySelector('.btn-split-arrow');
  if (menu) menu.style.display = 'none';
  if (group) group.classList.remove('open');
  if (btnArrow) btnArrow.setAttribute('aria-expanded', 'false');
}

function selectSaveMode(mode = 'web') {
  closeSaveMenu();
  if (mode === 'web') {
    if (typeof saveCurrentTripToHistory === 'function') {
      saveCurrentTripToHistory(true);
    }
    return;
  }
  if (typeof exportPerjadinExcel === 'function') {
    exportPerjadinExcel(mode);
  }
}

document.addEventListener('click', function (e) {
  const group = document.getElementById('saveSplitGroup');
  if (group && !group.contains(e.target)) {
    closeSaveMenu();
  }
});

