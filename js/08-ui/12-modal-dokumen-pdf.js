// =====================================================================
// TRIP PDF MODAL (DOKUMEN LENGKAP PER ORANG)
// =====================================================================

function handleTripCardClick(e, tripId) {
  if (e && e.target && e.target.closest('button, a, input, select, .btn-status-toggle, .history-status-badge, .history-revision-box')) {
    return;
  }
  openTripPdfModal(tripId, e);
}

let currentPdfModalTrip = null;
let currentPdfModalTripEmps = [];

function openTripPdfModal(tripId, e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const list = getTripHistoryList();
  const item = list.find(x => x.id === tripId);
  if (!item) {
    alert('Data perjalanan tidak ditemukan.');
    return;
  }
  currentPdfModalTrip = item;

  const overlay = document.getElementById('tripPdfModalOverlay');
  if (!overlay) return;

  const elNoST = document.getElementById('tripPdfModalNoST');
  if (elNoST) elNoST.textContent = item.noST || 'Perjalanan Dinas';

  const elMAK = document.getElementById('tripPdfModalMAK');
  if (elMAK) {
    elMAK.textContent = item.mak || '-';
    elMAK.style.display = item.mak ? 'inline-block' : 'none';
  }

  const elStatus = document.getElementById('tripPdfModalStatus');
  if (elStatus) {
    const rawMetode = item.metodePembayaran || item.draft?.fields?.metodePembayaran || 'LS';
    const isKKP = String(rawMetode).trim().toUpperCase() === 'KKP';
    const isDicairkan = (item.status_berkas === 'dicairkan');
    const statusText = isDicairkan ? (isKKP ? 'Berkas KKP Selesai' : 'Sudah Dicairkan') : 'Diproses ke Satker';
    const statusClass = isDicairkan ? (isKKP ? 'status-dicairkan status-kkp-selesai' : 'status-dicairkan') : 'status-diproses';
    elStatus.className = `history-status-badge ${statusClass}`;
    elStatus.innerHTML = `<svg class="ico" style="width:14px;height:14px;"><use href="${isDicairkan ? '#i-check' : '#i-clipboard'}"></use></svg>${statusText}`;
    const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
    if (canEdit) {
      elStatus.style.cursor = 'pointer';
      elStatus.title = isKKP ? 'Klik untuk memperbarui progres status berkas (Diproses / KKP Selesai)' : 'Klik untuk memperbarui progres status berkas (Diproses / Dicairkan)';
      elStatus.onclick = (ev) => {
        if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
        toggleTripStatus(item.id, ev);
        const updated = getTripHistoryList().find(x => x.id === item.id);
        if (updated) {
          const updDicairkan = (updated.status_berkas === 'dicairkan');
          const updText = updDicairkan ? (isKKP ? 'Berkas KKP Selesai' : 'Sudah Dicairkan') : 'Diproses ke Satker';
          const updClass = updDicairkan ? (isKKP ? 'status-dicairkan status-kkp-selesai' : 'status-dicairkan') : 'status-diproses';
          elStatus.className = `history-status-badge ${updClass}`;
          elStatus.innerHTML = `<svg class="ico" style="width:14px;height:14px;"><use href="${updDicairkan ? '#i-check' : '#i-clipboard'}"></use></svg>${updText}`;
        }
      };
    } else {
      elStatus.style.cursor = 'default';
      elStatus.onclick = null;
    }
  }

  const elAgenda = document.getElementById('tripPdfModalAgenda');
  if (elAgenda) elAgenda.textContent = item.agenda || 'Tanpa Agenda';

  const provDisplay = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(item.provinsiTujuan) : (item.provinsiTujuan || '');
  const kota = (item.kotaTujuan || '').trim();
  let dest = kota && provDisplay ? (kota.toLowerCase().includes(provDisplay.toLowerCase()) ? kota : `${kota}, ${provDisplay}`) : (kota || provDisplay || '-');
  const elDest = document.getElementById('tripPdfModalDest');
  if (elDest) elDest.textContent = `Tujuan: ${dest}`;

  const tglTeks = (item.tglBerangkat && item.tglKembali)
    ? `${(typeof formatTgl === 'function' ? formatTgl(item.tglBerangkat) : item.tglBerangkat)} s.d. ${(typeof formatTgl === 'function' ? formatTgl(item.tglKembali) : item.tglKembali)}`
    : (item.tglBerangkat || '-');
  const duration = item.lamaTugas ? ` (${item.lamaTugas})` : '';
  const elDates = document.getElementById('tripPdfModalDates');
  if (elDates) elDates.textContent = `Tanggal: ${tglTeks}${duration}`;

  // Temporarily restore draft so hitungBiaya and document builders have exact context
  if (item.draft && typeof restorePerjadinDraftData === 'function') {
    try {
      restorePerjadinDraftData(item.draft);
    } catch (e) {
      console.warn('Draft restoration notice:', e);
    }
  }

  const masterEmps = (typeof employees !== 'undefined' && Array.isArray(employees)) ? employees : [];

  // Determine the exact list of employees assigned to this specific trip
  let tripEmps = [];
  const rawEmpIds = (item.draft && Array.isArray(item.draft.empIds) && item.draft.empIds.length > 0)
    ? item.draft.empIds
    : (Array.isArray(item.employees) && item.employees.length > 0 ? item.employees.map(e => e.id) : []);

  if (rawEmpIds.length > 0) {
    tripEmps = rawEmpIds.map(id => {
      const found = masterEmps.find(e => Number(e.id) === Number(id));
      if (found) return found;
      if (Array.isArray(item.employees)) {
        const itemEmp = item.employees.find(e => Number(e.id) === Number(id));
        if (itemEmp) return itemEmp;
      }
      return null;
    }).filter(Boolean);
  } else if (Array.isArray(item.employees) && item.employees.length > 0) {
    tripEmps = item.employees.map(ie => {
      const found = masterEmps.find(me => Number(me.id) === Number(ie.id));
      return found ? { ...ie, ...found } : ie;
    });
  } else if (typeof selectedEmpIds !== 'undefined' && selectedEmpIds.size > 0) {
    tripEmps = masterEmps.filter(e => selectedEmpIds.has(Number(e.id)));
  }

  currentPdfModalTripEmps = tripEmps;

  // Make sure selectedEmpIds strictly matches this trip's assigned employees
  if (typeof selectedEmpIds !== 'undefined') {
    selectedEmpIds.clear();
    tripEmps.forEach(e => selectedEmpIds.add(Number(e.id)));
  }

  let displayCost = item.totalBiaya;
  if (!displayCost || displayCost <= 0) {
    displayCost = tripEmps.reduce((sum, emp) => sum + (typeof hitungBiaya === 'function' ? (hitungBiaya(emp)?.total || 0) : 0), 0);
  }
  const costFormatted = displayCost > 0 ? ((typeof rp === 'function') ? rp(displayCost) : 'Rp ' + Number(displayCost).toLocaleString('id-ID')) : 'Rp 0';
  const elCost = document.getElementById('tripPdfModalTotalCost');
  if (elCost) elCost.textContent = `Total Biaya: ${costFormatted}`;

  const empContainer = document.getElementById('tripPdfEmpList');
  if (empContainer) {
    if (tripEmps.length === 0) {
      empContainer.innerHTML = `
        <div style="padding:32px 20px; text-align:center; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
          <svg class="ico" style="width:36px;height:36px;stroke:#94a3b8;margin-bottom:8px;"><use href="#i-users"></use></svg>
          <div style="font-weight:600; font-size:15px; color:#334155; margin-bottom:4px;">Tidak Ada Data Pelaksana</div>
          <div style="font-size:13px;">Berkas perjalanan ini tidak memiliki daftar pelaksana yang tersimpan.</div>
        </div>
      `;
    } else {
      const hasDpr = typeof isDPRAvailableForTrip === 'function' ? isDPRAvailableForTrip() : false;

      empContainer.innerHTML = tripEmps.map((emp) => {
        const initial = (emp.nama || 'P').charAt(0).toUpperCase();
        const nipTeks = emp.nip ? `NIP. ${emp.nip}` : 'NIP -';
        const golTeks = emp.golongan ? `Gol. ${emp.golongan}` : (emp.jabatan || '');
        const biaya = typeof hitungBiaya === 'function' ? hitungBiaya(emp) : { total: 0 };
        const costEmp = biaya.total > 0 ? ((typeof rp === 'function') ? rp(biaya.total) : 'Rp ' + Number(biaya.total).toLocaleString('id-ID')) : 'Rp 0';

        const safeName = (typeof escapeHtml === 'function') ? escapeHtml(emp.nama || 'Pegawai') : (emp.nama || 'Pegawai');
        const safeNip = (typeof escapeHtml === 'function') ? escapeHtml(nipTeks) : nipTeks;
        const safeGol = (typeof escapeHtml === 'function') ? escapeHtml(golTeks) : golTeks;

        return `
          <div class="trip-pdf-emp-card">
            <div class="trip-pdf-emp-main">
              <div class="trip-pdf-emp-profile">
                <div class="trip-pdf-avatar">${initial}</div>
                <div class="trip-pdf-emp-details">
                  <div class="trip-pdf-emp-name">${safeName}</div>
                  <div class="trip-pdf-emp-sub">
                    <span>${safeNip}</span>
                    ${safeGol ? `<span>&bull;</span><span>${safeGol}</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="trip-pdf-cost-badge">
                <span class="trip-pdf-cost-label">Total Biaya Riil</span>
                <span class="trip-pdf-cost-val">${costEmp}</span>
              </div>
            </div>

            <div class="trip-pdf-doc-pills">
              <span class="doc-pill">✓ Kuitansi Perorangan</span>
              <span class="doc-pill">✓ Rincian Biaya Riil</span>
              <span class="doc-pill">✓ SPPD Perorangan</span>
              ${hasDpr ? '<span class="doc-pill">✓ DPR Perorangan</span>' : ''}
            </div>

            <div class="trip-pdf-emp-actions">
              <div class="trip-pdf-quick-links">
                <button type="button" class="btn-mini-doc" onclick="downloadSingleDocFromModal(${emp.id}, 'kuitansi')" title="Unduh file Kuitansi saja">
                  <span>🧾 Kuitansi</span>
                </button>
                <button type="button" class="btn-mini-doc" onclick="downloadSingleDocFromModal(${emp.id}, 'rincian')" title="Unduh file Rincian Biaya saja">
                  <span>📋 Rincian</span>
                </button>
                <button type="button" class="btn-mini-doc" onclick="downloadSingleDocFromModal(${emp.id}, 'sppd')" title="Unduh file SPPD saja">
                  <span>📑 SPPD</span>
                </button>
                ${hasDpr ? `
                <button type="button" class="btn-mini-doc" onclick="downloadSingleDocFromModal(${emp.id}, 'dpr')" title="Unduh file DPR saja">
                  <span>📝 DPR</span>
                </button>` : ''}
              </div>

              <div style="display:flex; gap:8px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="previewCompleteEmpPdfFromModal(${emp.id}, this)" title="Lihat dan cetak dokumen lengkap pegawai ini">
                  <svg class="ico"><use href="#i-receipt"></use></svg>
                  <span>Pratinjau / Cetak</span>
                </button>
                <button type="button" class="btn btn-primary btn-sm trip-pdf-btn-bundle" onclick="downloadCompleteEmpPdfFromModal(${emp.id}, this)" title="Unduh berkas PDF gabungan lengkap (Kuitansi + Rincian + DPR + SPPD)">
                  <svg class="ico"><use href="#i-load"></use></svg>
                  <span>Unduh PDF Lengkap</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  overlay.classList.add('is-open');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeTripPdfModal() {
  const overlay = document.getElementById('tripPdfModalOverlay');
  if (overlay) {
    overlay.classList.remove('is-open');
    overlay.style.display = 'none';
  }
  document.body.style.overflow = '';
}

function handleTripPdfBackdrop(e) {
  if (e && e.target && e.target.id === 'tripPdfModalOverlay') {
    closeTripPdfModal();
  }
}

// Global listener untuk tombol Escape agar modal menutup dan scroll layar pulih aman
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTripPdfModal();
    if (typeof closeWelcomeOverlay === 'function') closeWelcomeOverlay();
    if (typeof closePMKOverlay === 'function') closePMKOverlay();
    document.body.style.overflow = '';
  }
});

async function getEmpMergedPdfBlob(empId) {
  if (!currentPdfModalTrip) throw new Error('Data perjalanan belum dimuat.');
  const masterEmps = (typeof employees !== 'undefined' && Array.isArray(employees)) ? employees : [];
  const emp = (currentPdfModalTripEmps || []).find(e => Number(e.id) === Number(empId))
           || masterEmps.find(e => Number(e.id) === Number(empId));
  if (!emp) throw new Error('Data pegawai tidak ditemukan.');

  const hasDpr = typeof isDPRAvailableForTrip === 'function' ? isDPRAvailableForTrip() : false;
  const kuitansiHtml = typeof buildKuitansiHtml === 'function' ? buildKuitansiHtml(emp) : '';
  const rincianHtml = typeof buildRincianHtml === 'function' ? buildRincianHtml(emp) : '';
  const dprHtml = (hasDpr && typeof buildDPRHtml === 'function') ? buildDPRHtml(emp) : '';
  const sppdHtml = typeof buildSPPDHtml === 'function' ? buildSPPDHtml(emp) : '';

  const blobs = [];
  if (kuitansiHtml && typeof generatePdfBlobFromHtml === 'function') {
    blobs.push(await generatePdfBlobFromHtml(kuitansiHtml));
  }
  if (rincianHtml && typeof generatePdfBlobFromHtml === 'function') {
    blobs.push(await generatePdfBlobFromHtml(rincianHtml));
  }
  if (dprHtml && typeof generatePdfBlobFromHtml === 'function') {
    blobs.push(await generatePdfBlobFromHtml(dprHtml));
  }
  if (sppdHtml && typeof generatePdfBlobFromHtml === 'function') {
    blobs.push(await generatePdfBlobFromHtml(sppdHtml));
  }

  let mergedBlob = null;
  if (typeof mergePdfBlobs === 'function') {
    try {
      mergedBlob = await mergePdfBlobs(blobs);
    } catch (err) {
      console.warn('mergePdfBlobs fallback:', err);
    }
  }

  if (!mergedBlob) {
    const allDocsHtml = typeof buildAllDocsHtmlForEmp === 'function' ? buildAllDocsHtmlForEmp(emp) : '';
    if (allDocsHtml && typeof generatePdfBlobFromHtml === 'function') {
      mergedBlob = await generatePdfBlobFromHtml(allDocsHtml);
    }
  }

  return { emp, blob: mergedBlob };
}

async function downloadCompleteEmpPdfFromModal(empId, btnEl) {
  const origHtml = btnEl ? btnEl.innerHTML : '';
  try {
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<span>⏳ Menyiapkan PDF...</span>';
    }
    const { emp, blob } = await getEmpMergedPdfBlob(empId);
    if (!blob) throw new Error('Gagal mengompilasi PDF.');

    const cleanSt = (currentPdfModalTrip.noST || 'Perjadin').replace(/[\/\\:*?"<>|]/g, '_');
    const cleanNama = (emp.nama || 'Pegawai').split(',')[0].replace(/[\/\\:*?"<>|]/g, '_');
    const fileName = `${cleanSt} - ${cleanNama} - Dokumen Lengkap.pdf`;

    if (typeof downloadBlob === 'function') {
      downloadBlob(blob, fileName);
    }
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Unduh PDF Berhasil', `Berkas lengkap "${fileName}" berhasil diunduh.`);
    }
  } catch (err) {
    console.error('Download PDF error:', err);
    alert('Gagal membuat dokumen PDF: ' + (err.message || err));
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = origHtml;
    }
  }
}

async function previewCompleteEmpPdfFromModal(empId, btnEl) {
  const origHtml = btnEl ? btnEl.innerHTML : '';
  try {
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<span>⏳ Membuka...</span>';
    }
    const { emp, blob } = await getEmpMergedPdfBlob(empId);
    if (!blob) throw new Error('Gagal mengompilasi PDF.');

    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (err) {
    console.error('Preview PDF error:', err);
    alert('Gagal membuka pratinjau PDF: ' + (err.message || err));
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = origHtml;
    }
  }
}

async function downloadSingleDocFromModal(empId, docType) {
  if (!currentPdfModalTrip) return;
  const masterEmps = (typeof employees !== 'undefined' && Array.isArray(employees)) ? employees : [];
  const emp = (currentPdfModalTripEmps || []).find(e => Number(e.id) === Number(empId))
           || masterEmps.find(e => Number(e.id) === Number(empId));
  if (!emp) return;

  let html = '';
  let label = 'Dokumen';
  if (docType === 'kuitansi') {
    html = typeof buildKuitansiHtml === 'function' ? buildKuitansiHtml(emp) : '';
    label = 'Kuitansi';
  } else if (docType === 'rincian') {
    html = typeof buildRincianHtml === 'function' ? buildRincianHtml(emp) : '';
    label = 'Rincian Biaya';
  } else if (docType === 'sppd') {
    html = typeof buildSPPDHtml === 'function' ? buildSPPDHtml(emp) : '';
    label = 'SPPD';
  } else if (docType === 'dpr') {
    html = typeof buildDPRHtml === 'function' ? buildDPRHtml(emp) : '';
    label = 'DPR';
  }

  if (!html) {
    alert('Dokumen tidak tersedia.');
    return;
  }

  try {
    if (typeof generatePdfBlobFromHtml === 'function') {
      const blob = await generatePdfBlobFromHtml(html);
      const cleanSt = (currentPdfModalTrip.noST || 'Perjadin').replace(/[\/\\:*?"<>|]/g, '_');
      const cleanNama = (emp.nama || 'Pegawai').split(',')[0].replace(/[\/\\:*?"<>|]/g, '_');
      if (typeof downloadBlob === 'function') {
        downloadBlob(blob, `${cleanSt} - ${cleanNama} - ${label}.pdf`);
      }
    }
  } catch (e) {
    alert('Gagal membuat PDF: ' + e.message);
  }
}

async function downloadTripRincianPdfFromModal() {
  if (!currentPdfModalTrip) return;
  const btn = document.getElementById('btnTripPdfRincian') || document.getElementById('btnTripPdfNominatif');
  const origHtml = btn ? btn.innerHTML : '';
  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Menyiapkan Rincian...</span>';
    }
    if (typeof renderRekapRincian === 'function') renderRekapRincian();
    const el = document.getElementById('rekapRincianOut');
    const html = el ? el.innerHTML : '';
    if (!html || html.includes('alert-warn')) throw new Error('Data rincian biaya belum lengkap.');

    if (typeof generatePdfBlobFromHtml === 'function') {
      const blob = await generatePdfBlobFromHtml(html, {
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      });
      const cleanSt = (currentPdfModalTrip.noST || 'Perjadin').replace(/[\/\\:*?"<>|]/g, '_');
      if (typeof downloadBlob === 'function') {
        downloadBlob(blob, `${cleanSt} - Rekap Rincian Biaya Riil.pdf`);
      }
    }
  } catch (e) {
    alert('Gagal mengunduh Rekap Rincian: ' + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}
window.downloadTripRincianPdfFromModal = downloadTripRincianPdfFromModal;
window.downloadTripNominatifPdfFromModal = downloadTripRincianPdfFromModal;

function downloadTripZipFromModal() {
  if (!currentPdfModalTrip) return;
  exportExcelFromHistory(currentPdfModalTrip.id, 'zip');
}

window.handleTripCardClick = handleTripCardClick;
window.openTripPdfModal = openTripPdfModal;
window.closeTripPdfModal = closeTripPdfModal;
window.handleTripPdfBackdrop = handleTripPdfBackdrop;
window.downloadCompleteEmpPdfFromModal = downloadCompleteEmpPdfFromModal;
window.previewCompleteEmpPdfFromModal = previewCompleteEmpPdfFromModal;
window.downloadSingleDocFromModal = downloadSingleDocFromModal;
window.downloadTripNominatifPdfFromModal = downloadTripNominatifPdfFromModal;
window.downloadTripZipFromModal = downloadTripZipFromModal;

window.toggleSaveMenu = toggleSaveMenu;
window.closeSaveMenu = closeSaveMenu;
window.selectSaveMode = selectSaveMode;

window.saveTripToHistory = saveCurrentTripToHistory;
window.saveCurrentTripToHistory = saveCurrentTripToHistory;
window.getTripHistoryList = getTripHistoryList;
window.loadTripFromHistory = loadTripFromHistory;
window.duplicateTripFromHistory = duplicateTripFromHistory;
window.deleteTripFromHistory = deleteTripFromHistory;
window.exportExcelFromHistory = exportExcelFromHistory;
window.resetPerjadinForm = resetPerjadinForm;
window.renderDashboardModule = renderDashboardModule;
window.setTripStatusFilter = setTripStatusFilter;
window.renderTripHistory = renderTripHistory;
window.filterTripHistory = filterTripHistory;
window.clearHistorySearch = clearHistorySearch;
