// =====================================================================
// FORM VALIDATION & REQUIRED INDICATORS (!)
// =====================================================================
const REQUIRED_FIELDS = [
  { id: 'noST', label: 'Nomor Surat Tugas (ST)' },
  { id: 'tglST', label: 'Tanggal Surat Tugas' },
  { id: 'tglSPD', label: 'Tanggal SPD' },
  { id: 'tglBerangkat', label: 'Tanggal Berangkat' },
  { id: 'tglKembali', label: 'Tanggal Kembali' },
  { id: 'provinsiTujuan', label: 'Provinsi Tujuan' },
  { id: 'kotaTujuan', label: 'Kota / Kabupaten Tujuan' },
  { id: 'agenda', label: 'Agenda Perjalanan Dinas' },
  { id: 'kodeKegiatan', label: 'Kode Kegiatan' },
  { id: 'kodeSubKegiatan', label: 'Kode Sub Kegiatan' },
  { id: 'mak', label: 'MAK' }
];

let valToastTimer = null;

function validateTripForm() {
  const missing = [];

  REQUIRED_FIELDS.forEach(f => {
    if (f.id === 'provinsiTujuan' && typeof isMultiProvActive === 'function' && isMultiProvActive()) {
      const p1 = document.getElementById('provinsiTujuan1');
      const p2 = document.getElementById('provinsiTujuan2');
      const g1 = p1?.closest('.form-group');
      const g2 = p2?.closest('.form-group');
      const v1 = (p1?.value || '').trim();
      const v2 = (p2?.value || '').trim();
      if (!v1) {
        if (g1) g1.classList.add('has-error');
        missing.push({ el: p1, label: 'Provinsi Tujuan 1', id: 'provinsiTujuan1' });
      } else if (g1) {
        g1.classList.remove('has-error');
      }
      if (!v2) {
        if (g2) g2.classList.add('has-error');
        missing.push({ el: p2, label: 'Provinsi Tujuan 2', id: 'provinsiTujuan2' });
      } else if (g2) {
        g2.classList.remove('has-error');
      }
      return;
    }

    const el = document.getElementById(f.id);
    if (!el) return;
    const val = (el.value || '').trim();
    const group = el.closest('.form-group');
    if (!val) {
      if (group) group.classList.add('has-error');
      missing.push({ el, label: f.label, id: f.id });
    } else {
      if (group) group.classList.remove('has-error');
    }
  });

  // Cek tanggal kembali >= tanggal berangkat
  const tgl1 = document.getElementById('tglBerangkat')?.value;
  const tgl2 = document.getElementById('tglKembali')?.value;
  let dateMismatch = false;
  if (tgl1 && tgl2 && tgl2 < tgl1) {
    const group = document.getElementById('tglKembali')?.closest('.form-group');
    if (group) group.classList.add('has-error');
    missing.push({
      el: document.getElementById('tglKembali'),
      label: 'Tanggal Kembali (harus \u2265 Tanggal Berangkat)',
      id: 'tglKembali',
      customError: true
    });
    dateMismatch = true;
  }

  // Cek multi-provinsi pembagian hari
  if (typeof isMultiProvActive === 'function' && isMultiProvActive()) {
    const totalDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
    const h1 = parseInt(document.getElementById('hariProvinsi1')?.value) || 0;
    const h2 = parseInt(document.getElementById('hariProvinsi2')?.value) || 0;
    if (totalDays > 1 && (h1 <= 0 || h2 <= 0 || (h1 + h2 !== totalDays))) {
      missing.push({
        el: document.getElementById('hariProvinsi1'),
        label: `Pembagian hari (${h1} hr + ${h2} hr) harus sesuai total lama tugas (${totalDays} Hari)`,
        id: 'hariProvinsi1',
        customError: true
      });
    }
  }

  // Cek minimal 1 pegawai
  const selBox = document.getElementById('selectedBox');
  const empErr = document.getElementById('empErrorMsg');
  if (selectedEmpIds.size === 0) {
    if (selBox) selBox.classList.add('has-error');
    if (empErr) empErr.classList.add('is-visible');
    missing.push({
      el: selBox || document.getElementById('empSearch'),
      label: 'Minimal 1 Pegawai Ditugaskan',
      id: 'selectedBox'
    });
  } else {
    if (selBox) selBox.classList.remove('has-error');
    if (empErr) empErr.classList.remove('is-visible');
  }

  if (valToastTimer) clearTimeout(valToastTimer);
  valToastTimer = setTimeout(() => {
    hideValidationToast();
  }, 5000);

  // Return validation result so callers can check validity
  return { valid: missing.length === 0, missing, dateMismatch };
}

function showValidationToast(missingList, customMsg) {
  const toast = document.getElementById('valToast');
  if (!toast) return;
  const title = document.getElementById('valToastTitle');
  const desc = document.getElementById('valToastDesc');
  if (title) title.textContent = 'Isian Wajib Belum Lengkap';
  if (desc) {
    if (customMsg) {
      desc.textContent = customMsg;
    } else if (missingList && missingList.length > 0) {
      const names = missingList.slice(0, 3).map(m => m.label).join(', ');
      const more = missingList.length > 3 ? ` (+${missingList.length - 3} lainnya)` : '';
      desc.textContent = `Mohon lengkapi: ${names}${more}`;
    } else {
      desc.textContent = 'Mohon lengkapi semua isian bertanda (!) sebelum membuat dokumen.';
    }
  }
  toast.classList.add('is-show');
  if (valToastTimer) clearTimeout(valToastTimer);
  valToastTimer = setTimeout(() => {
    hideValidationToast();
  }, 5000);
}

function hideValidationToast() {
  const toast = document.getElementById('valToast');
  if (toast) toast.classList.remove('is-show');
  if (valToastTimer) {
    clearTimeout(valToastTimer);
    valToastTimer = null;
  }
}

let refreshToastTimer = null;

function showRefreshToast(title = 'Dokumen Berhasil Diperbarui', desc = 'Kalkulasi dan tampilan dokumen telah disegarkan.') {
  const toast = document.getElementById('refreshToast');
  if (!toast) return;
  const titleEl = document.getElementById('refreshToastTitle');
  const descEl = document.getElementById('refreshToastDesc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  toast.classList.add('is-show');
  if (refreshToastTimer) clearTimeout(refreshToastTimer);
  refreshToastTimer = setTimeout(() => {
    hideRefreshToast();
  }, 3500);
}

function hideRefreshToast() {
  const toast = document.getElementById('refreshToast');
  if (toast) toast.classList.remove('is-show');
  if (refreshToastTimer) {
    clearTimeout(refreshToastTimer);
    refreshToastTimer = null;
  }
}

function refreshDocument(btn, renderFnName) {
  if (!btn) {
    const activeTab = document.querySelector('.tab-content.active');
    btn = activeTab ? activeTab.querySelector('.btn-primary') : null;
  }
  if (!btn) return;
  if (btn.dataset.isRefreshing === 'true') return; // Cegah double-click selama durasi 3 detik
  btn.dataset.isRefreshing = 'true';
  btn.disabled = true;
  btn.classList.add('is-refreshing');

  const origHTML = btn.innerHTML;

  // Temukan elemen kontainer dokumen di tab yang sedang aktif
  const tabPane = btn.closest('.tab-content') || document.querySelector('.tab-content.active');
  const docContainer = tabPane ? (tabPane.querySelector('.doc-page, [id$="Out"], .doc-preview-wrap, .kuitansi-area, .sppd-sheet, .kendali-page, .rekap-page') || tabPane) : null;
  if (docContainer) {
    docContainer.classList.add('doc-refresh-loading');
  }

  // Pra-sinkronisasi data & kalkulasi sebelum render
  try {
    if (typeof syncJenisPerjalananFromMak === 'function') syncJenisPerjalananFromMak();
    if (typeof updateDPRInput === 'function') updateDPRInput();
    if (typeof hitungBiaya === 'function' && typeof selectedEmpIds !== 'undefined' && typeof employees !== 'undefined') {
      [...selectedEmpIds].forEach(id => {
        const emp = employees.find(e => e.id === id);
        if (emp) hitungBiaya(emp);
      });
    }
  } catch (err) {
    console.warn('Sync on refresh error:', err);
  }

  // Tampilkan spinner dan status menyegarkan (durasi 1 detik)
  btn.innerHTML = `<svg class="ico is-refresh-spin"><use href="#i-refresh"></use></svg><span>Menyegarkan...</span>`;

  // Jalankan setelah tepat 1.000 ms (1 detik)
  setTimeout(() => {
    // Eksekusi fungsi render spesifik tab dokumen
    try {
      if (renderFnName === 'renderKuitansiPerorangan') {
        const sel = document.getElementById('kuitansiPeroranganPegawai');
        if (!sel || !sel.value) {
          if (typeof populateKuitansiPeroranganSelect === 'function') populateKuitansiPeroranganSelect();
          else if (typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
        } else {
          if (typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
        }
      } else if (renderFnName === 'renderSPPDPerorangan') {
        const sel = document.getElementById('sppdPegawai');
        if (!sel || !sel.value) {
          if (typeof populateSPPDSelect === 'function') populateSPPDSelect();
          else if (typeof renderSPPDPerorangan === 'function') renderSPPDPerorangan();
        } else {
          if (typeof renderSPPDPerorangan === 'function') renderSPPDPerorangan();
        }
      } else if (renderFnName === 'renderRincian') {
        const sel = document.getElementById('rincianPegawai') || document.getElementById('rincianBiayaPegawai');
        if (!sel || !sel.value) {
          if (typeof populateRincianSelect === 'function') populateRincianSelect();
          else if (typeof renderRincian === 'function') renderRincian();
        } else {
          if (typeof renderRincian === 'function') renderRincian();
        }
      } else if (renderFnName === 'renderDPR') {
        const sel = document.getElementById('dprPegawai');
        if (!sel || !sel.value) {
          if (typeof populateDPRSelect === 'function') populateDPRSelect();
          else if (typeof renderDPR === 'function') renderDPR();
        } else {
          if (typeof renderDPR === 'function') renderDPR();
        }
      } else if (typeof window[renderFnName] === 'function') {
        window[renderFnName]();
      } else if (typeof renderFnName === 'function') {
        renderFnName();
      }
    } catch (err) {
      console.error('Render on refresh error:', err);
    }

    // Hilangkan efek visual loading pada dokumen
    if (docContainer) {
      docContainer.classList.remove('doc-refresh-loading');
    }

    // Tampilkan state sukses pada tombol
    btn.innerHTML = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;display:inline-block;"><polyline points="20 6 9 17 4 12"/></svg><span>Diperbarui!</span>`;

    // Tentukan label dokumen untuk toast
    let docLabel = 'Dokumen';
    const fnStr = String(renderFnName);
    if (fnStr.includes('Nominatif')) docLabel = 'Daftar Nominatif';
    else if (fnStr.includes('RekapKuitansi')) docLabel = 'Rekap Kuitansi';
    else if (fnStr.includes('KuitansiPerorangan')) docLabel = 'Kuitansi Perorangan';
    else if (fnStr.includes('SPPD')) docLabel = 'SPPD Perorangan';
    else if (fnStr.includes('LembarKendali')) docLabel = 'Lembar Kendali';
    else if (fnStr.includes('RekapRincian')) docLabel = 'Rekap Rincian';
    else if (fnStr.includes('RekapSPT')) docLabel = 'Rekap SPT';
    else if (fnStr.includes('Rincian')) docLabel = 'Rincian Biaya';
    else if (fnStr.includes('DPR')) docLabel = 'Lembar DPR';

    showRefreshToast(`${docLabel} Berhasil Diperbarui`, `Data kalkulasi dan tampilan dokumen telah disegarkan.`);

    // Kembalikan tombol ke keadaan semula setelah 800ms
    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.disabled = false;
      btn.classList.remove('is-refreshing');
      btn.dataset.isRefreshing = 'false';
    }, 800);
  }, 1000);
}

window.showRefreshToast = showRefreshToast;
window.hideRefreshToast = hideRefreshToast;
window.refreshDocument = refreshDocument;

