// =====================================================================
// TABS
// =====================================================================
const tabMeta = {
  input: ['Input Perjalanan', 'Formulir'],
  bbm: ['Reimburse BBM Kendaraan Dinas', 'Pengadaan Barang & Jasa (MAK 523121)'],
  dashboard: ['Dashboard Eksekutif', 'Portal Pemantau'],
  riwayat: ['Riwayat Perjalanan Dinas', 'Arsip & Berkas'],
  sbm: ['Kamus & Cek Tarif SBM 2026', 'Standar Biaya Masukan'],
  simulasi: ['Simulasi Perhitungan Perdin', 'Kalkulator Estimasi SBM 2026'],
  nominatif: ['Daftar Nominatif', 'Rekapitulasi'],
  'rekap-kuitansi': ['Rekap Kuitansi', 'Rekapitulasi'],
  'kuitansi-perorangan': ['Kuitansi Perorangan', 'Dokumen'],
  'sppd-perorangan': ['SPPD Perorangan', 'Dokumen'],
  'lembar-kendali': ['Lembar Kendali', 'Rekapitulasi'],
  'rekap-rincian': ['Rekap Rincian', 'Rekapitulasi'],
  'rekap-spt': ['Rekap Surat Tugas', 'Rekapitulasi'],
  rincian: ['Rincian per Orang', 'Dokumen'],
  dpr: ['DPR Perorangan', 'Dokumen'],
  pengaturan: ['Pengaturan', 'Sistem']
};

function showTab(name) {
  const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  const isViewer = !canEdit && !!window.currentAuthUser;
  const viewerAllowedTabs = ['dashboard', 'riwayat', 'sbm', 'simulasi'];
  if (isViewer && !viewerAllowedTabs.includes(name)) {
    name = 'dashboard';
  }
  // Fitur simulasi biaya HANYA boleh diakses oleh role Viewer (Admin/Operator tidak boleh)
  if (name === 'simulasi' && !isViewer) {
    name = canEdit ? 'input' : 'dashboard';
  }
  const currentActive = document.querySelector('.tab-content.active');
  if (currentActive && currentActive.id === 'tab-' + name) {
    return;
  }
  if (!['input', 'pengaturan', 'dashboard', 'riwayat', 'sbm', 'simulasi', 'bbm'].includes(name)) {
    const val = validateTripForm();
    if (!val.valid) {
      showValidationToast(val.missing, val.dateMismatch ? 'Tanggal kembali tidak boleh sebelum tanggal berangkat!' : null);
      return;
    }
  }
  triggerTabProgress();
  showPageTransitionLoader(name, () => {
    switchTabPanel(name);
    if (name === 'dashboard' && typeof renderDashboardModule === 'function') {
      renderDashboardModule();
      if (typeof syncTripsFromCloud === 'function') syncTripsFromCloud(true);
    } else if (name === 'sbm' && typeof initViewerSbmCockpit === 'function') {
      initViewerSbmCockpit();
    } else if (name === 'simulasi' && typeof initSimulasiKalkulator === 'function') {
      initSimulasiKalkulator();
    } else if (name === 'bbm' && typeof initBbmModule === 'function') {
      initBbmModule();
    } else if (name === 'riwayat' && typeof renderTripHistory === 'function') {
      renderTripHistory();
      if (typeof syncTripsFromCloud === 'function') syncTripsFromCloud(true);
    }
  });
}

function switchTabPanel(name) {
  const panel = document.getElementById('tab-' + name);
  if (!panel) return;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn, .bottom-nav-btn[data-tab]').forEach(b => b.classList.remove('active'));
  panel.classList.add('active');
  document.querySelectorAll(`.tab-btn[data-tab="${name}"], .bottom-nav-btn[data-tab="${name}"]`).forEach(btn => btn.classList.add('active'));
  const meta = tabMeta[name] || ['Perjalanan Dinas', 'Menu'];
  const titleEl = document.getElementById('pageTitle');
  const eyebrowEl = document.getElementById('pageEyebrow');
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  if (titleEl) {
    if (name === 'dpr' && isKKP) titleEl.textContent = 'DPR KKP Perorangan';
    else if (name === 'rekap-kuitansi' && isKKP) titleEl.textContent = 'Rekap Kuitansi KKP';
    else if (name === 'kuitansi-perorangan' && isKKP) titleEl.textContent = 'Kuitansi KKP Perorangan';
    else titleEl.textContent = meta[0];
  }
  if (eyebrowEl) eyebrowEl.textContent = meta[1];
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'bbm') {
    if (typeof initBbmModule === 'function') initBbmModule();
  }
  if (name === 'dashboard') {
    if (typeof renderDashboardModule === 'function') renderDashboardModule();
    if (typeof syncTripsFromCloud === 'function') syncTripsFromCloud(true);
  }
  if (name === 'sbm' && typeof initViewerSbmCockpit === 'function') initViewerSbmCockpit();
  if (name === 'simulasi' && typeof initSimulasiKalkulator === 'function') initSimulasiKalkulator();
  if (name === 'riwayat') {
    if (typeof renderTripHistory === 'function') renderTripHistory();
    if (typeof syncTripsFromCloud === 'function') syncTripsFromCloud(true);
  }
  if (name === 'rincian') populateRincianSelect();
  if (name === 'dpr') populateDPRSelect();
  if (name === 'nominatif') renderNominatif();
  if (name === 'rekap-kuitansi') renderRekapKuitansi();
  if (name === 'kuitansi-perorangan') populateKuitansiPeroranganSelect();
  if (name === 'sppd-perorangan') populateSPPDSelect();
  if (name === 'lembar-kendali') renderLembarKendali();
  if (name === 'rekap-rincian') renderRekapRincian();
  if (name === 'rekap-spt') renderRekapSPT();
}

function onMetodePembayaranChange(val) {
  const f1 = document.getElementById('metodePembayaran');
  const f2 = document.getElementById('lk_metodePembayaran');
  if (f1 && f1.value !== val) f1.value = val;
  if (f2 && f2.value !== val) f2.value = val;
  updateKKPBadgesAndNav();
  if (typeof renderCurrentTab === 'function') {
    renderCurrentTab();
  } else {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
      const tabId = activeTab.id.replace(/^tab-/, '');
      if (tabId === 'lembar-kendali' && typeof renderLembarKendali === 'function') renderLembarKendali();
      if (tabId === 'rekap-kuitansi' && typeof renderRekapKuitansi === 'function') renderRekapKuitansi();
      if (tabId === 'kuitansi-perorangan' && typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
      if (tabId === 'dpr' && typeof renderDPR === 'function') renderDPR();
    }
  }
}

function updateKKPBadgesAndNav() {
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  const dprNav = document.querySelector('.tab-btn[data-tab="dpr"] .nav-text');
  if (dprNav) {
    dprNav.textContent = isKKP ? 'DPR KKP' : 'DPR Perorangan';
  }
  const dprCard = document.querySelector('.action-card[onclick*="showTab(\'dpr\')"] .action-body strong');
  if (dprCard) {
    dprCard.textContent = isKKP ? 'DPR KKP Perorangan' : 'DPR Perorangan';
  }
  const dprCardSub = document.querySelector('.action-card[onclick*="showTab(\'dpr\')"] .action-body small');
  if (dprCardSub) {
    dprCardSub.textContent = isKKP ? 'Daftar pengeluaran riil KKP' : 'Daftar pengeluaran riil';
  }
  const titleEl = document.getElementById('dprCardTitle');
  if (titleEl) {
    titleEl.textContent = isKKP ? 'Pilih Pegawai untuk DPR KKP' : 'Pilih Pegawai untuk DPR';
  }
  const subEl = document.getElementById('dprCardSub');
  if (subEl) {
    subEl.textContent = isKKP ? 'Daftar pengeluaran riil perjalanan dinas jabatan dengan KKP per orang' : 'Daftar pengeluaran riil per orang';
  }
  const btnPrint = document.getElementById('labelPrintDPR');
  if (btnPrint) {
    btnPrint.textContent = isKKP ? 'Cetak DPR KKP' : 'Cetak DPR';
  }
  const btnPrintAll = document.getElementById('labelPrintAllDPR');
  if (btnPrintAll) {
    btnPrintAll.textContent = isKKP ? 'Cetak Semua DPR KKP' : 'Cetak Semua DPR';
  }
}

function toggleSidebar() {
  document.body.classList.toggle('sidebar-open');
  const btn = document.querySelector('.burger');
  if (btn) btn.setAttribute('aria-expanded', document.body.classList.contains('sidebar-open') ? 'true' : 'false');
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  const btn = document.querySelector('.burger');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

