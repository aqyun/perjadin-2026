// =====================================================================
// ANTARMUKA & INTERAKSI PENGGUNA (PerdinKu)
// Tema (Dark/Light), Navigasi Tab, Sidebar, Popup Selamat Datang,
// Pilihan Pegawai, dan Inisialisasi Aplikasi
// =====================================================================

// =====================================================================
// MODE TAMPILAN (terang / gelap / otomatis)
// =====================================================================
const THEME_STORAGE_KEY = 'perjadin-theme';
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');

function getThemeMode() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return ['light', 'dark', 'auto'].includes(saved) ? saved : 'auto';
}

function applyThemeMode(mode) {
  const dark = mode === 'dark' || (mode === 'auto' && themeMedia.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

function markThemeButtons(mode) {
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeMode === mode);
  });
}

function setThemeMode(mode) {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyThemeMode(mode);
  markThemeButtons(mode);
}

function initTheme() {
  const mode = getThemeMode();
  applyThemeMode(mode);
  markThemeButtons(mode);
  const onChange = () => { if (getThemeMode() === 'auto') applyThemeMode('auto'); };
  if (themeMedia.addEventListener) themeMedia.addEventListener('change', onChange);
  else themeMedia.addListener(onChange);
}

initTheme();

// =====================================================================
// INIT
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Populate provinsi dropdown
  const sel = document.getElementById('provinsiTujuan');
  sbmData.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = formatProvinsi(s.provinsi);
    sel.appendChild(opt);
  });
  renderEmployeeList();
  const datePill = document.getElementById('datePill');
  if (datePill) {
    datePill.textContent = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  }
  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tglST').value = today;
  document.getElementById('tglSPD').value = today;
  document.getElementById('tglBerangkat').value = today;
  document.getElementById('tglKembali').value = today;
  hitungLama();
  updateSbmWarnings();
  initWelcomeModal();
});

// =====================================================================
// TABS
// =====================================================================
const tabMeta = {
  input: ['Input Perjalanan', 'Formulir'],
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
  const panel = document.getElementById('tab-' + name);
  if (!panel) return;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  panel.classList.add('active');
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  const meta = tabMeta[name] || ['Perjalanan Dinas', 'Menu'];
  const titleEl = document.getElementById('pageTitle');
  const eyebrowEl = document.getElementById('pageEyebrow');
  if (titleEl) titleEl.textContent = meta[0];
  if (eyebrowEl) eyebrowEl.textContent = meta[1];
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

// =====================================================================
// JENDELA / POPUP SELAMAT DATANG (WELCOME MODAL)
// =====================================================================
function openWelcome() {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeWelcome() {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  const checkbox = document.getElementById('welcomeDontShow');
  if (checkbox && checkbox.checked) {
    try {
      localStorage.setItem('perdinku_welcome_dismissed', '1');
    } catch (e) {}
  }
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function handleWelcomeBackdrop(event) {
  if (event.target && event.target.id === 'welcomeOverlay') {
    closeWelcome();
  }
}

function initWelcomeModal() {
  let isDismissed = false;
  try {
    isDismissed = localStorage.getItem('perdinku_welcome_dismissed') === '1';
  } catch (e) {}

  if (!isDismissed) {
    setTimeout(() => {
      openWelcome();
    }, 450);
  }
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeSidebar();
    closeWelcome();
  }
});

document.addEventListener('input', () => { updateSbmWarnings(); refreshHotelSummaries(); });
document.addEventListener('change', () => { updateSbmWarnings(); refreshHotelSummaries(); });

// =====================================================================
// EMPLOYEE LIST
// =====================================================================
function getInitials(nama) {
  return nama.replace(/[^A-Za-z\s]/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

function renderEmployeeList() {
  const box = document.getElementById('empListBox');
  const q = document.getElementById('empSearch').value.toLowerCase();
  const filtered = employees.filter(e => e.nama.toLowerCase().includes(q) || e.jabatan.toLowerCase().includes(q));
  box.innerHTML = filtered.map(e => `
    <div class="emp-item ${selectedEmpIds.has(e.id)?'selected':''}" onclick="toggleEmployee(${e.id})">
      <input type="checkbox" ${selectedEmpIds.has(e.id)?'checked':''} onclick="event.stopPropagation();toggleEmployee(${e.id})">
      <span class="emp-avatar">${getInitials(e.nama)}</span>
      <div class="emp-text">
        <div class="emp-name">${e.nama}</div>
        <div class="emp-detail">Gol. ${e.gol}<span class="sep">·</span>${e.jabatan}<span class="sep">·</span>NIP: ${e.nip}</div>
      </div>
    </div>
  `).join('') || '<div style="padding:16px;text-align:center;color:#9aabc0;font-size:13px">Tidak ada hasil</div>';
}

function filterEmployees() { renderEmployeeList(); }

function toggleEmployee(id) {
  if (selectedEmpIds.has(id)) { selectedEmpIds.delete(id); empTripSegments.delete(id); }
  else selectedEmpIds.add(id);
  renderEmployeeList();
  renderSelectedTags();
  renderTripDates();
  refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();
}

function renderSelectedTags() {
  const box = document.getElementById('selectedBox');
  const count = document.getElementById('countSelected');
  if (selectedEmpIds.size === 0) {
    box.innerHTML = '<span class="empty-note">Belum ada pegawai dipilih</span>';
    count.textContent = '0';
    return;
  }
  count.textContent = selectedEmpIds.size;
  box.innerHTML = [...selectedEmpIds].map(id => {
    const e = employees.find(x => x.id === id);
    return `<span class="emp-tag">${e.nama.split(',')[0]} <span class="rm" onclick="toggleEmployee(${id})">×</span></span>`;
  }).join('');
}

function renderTripDates() {
  const block = document.getElementById('tripDatesBlock');
  const list = document.getElementById('tripDatesList');
  if (!block || !list) return;
  if (selectedEmpIds.size === 0) { block.style.display = 'none'; list.innerHTML = ''; return; }
  block.style.display = '';
  const g1 = document.getElementById('tglBerangkat').value;
  const g2 = document.getElementById('tglKembali').value;
  const globalText = g1 && g2 ? `${formatTgl(g1)} – ${formatTgl(g2)}` : 'belum diisi';
  list.innerHTML = [...selectedEmpIds].map(id => {
    const e = employees.find(x => x.id === id);
    if (!e) return '';
    const name = e.nama.split(',')[0];
    const segs = empTripSegments.get(id) || [];
    if (!segs.length) {
      return `<div class="trip-row">
        <div class="trip-name" title="${e.nama}">${name}</div>
        <div class="trip-follow">Ikut tanggal perjalanan (${globalText})</div>
        <button type="button" class="trip-btn" onclick="setEmpDates(${id})">Atur tanggal</button>
      </div>`;
    }
    const segHtml = segs.map((s, i) => `
      <span class="trip-seg">
        <input type="date" value="${s.start}" onchange="updateEmpSegment(${id},${i},'start',this.value)">
        <span class="trip-sep">s.d.</span>
        <input type="date" value="${s.end}" onchange="updateEmpSegment(${id},${i},'end',this.value)">
        <button type="button" class="trip-seg-rm" title="Hapus tanggal" onclick="removeEmpSegment(${id},${i})">×</button>
      </span>`).join('');
    return `<div class="trip-row">
      <div class="trip-name" title="${e.nama}">${name}</div>
      <div class="trip-segs">${segHtml}</div>
      <div class="trip-actions">
        <button type="button" class="trip-btn" onclick="addEmpSegment(${id})">+ Tanggal</button>
        <button type="button" class="trip-btn trip-btn-reset" onclick="resetEmpDates(${id})">Ikut global</button>
      </div>
    </div>`;
  }).join('');
}

function setEmpDates(id) {
  const g1 = document.getElementById('tglBerangkat').value;
  const g2 = document.getElementById('tglKembali').value || g1;
  if (!g1) return;
  empTripSegments.set(id, [{ start: g1, end: g2 }]);
  renderTripDates();
}

function addEmpSegment(id) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.push({ start: '', end: '' });
  empTripSegments.set(id, segs);
  renderTripDates();
}

function updateEmpSegment(id, index, field, value) {
  const segs = [...(empTripSegments.get(id) || [])];
  if (!segs[index]) return;
  segs[index][field] = value;
  if (field === 'start' && (!segs[index].end || segs[index].end < value)) segs[index].end = value;
  if (field === 'end' && segs[index].start && value && value < segs[index].start) segs[index].start = value;
  empTripSegments.set(id, segs);
  renderTripDates();
}

function removeEmpSegment(id, index) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.splice(index, 1);
  if (segs.length) empTripSegments.set(id, segs);
  else empTripSegments.delete(id);
  renderTripDates();
}

function resetEmpDates(id) {
  empTripSegments.delete(id);
  renderTripDates();
}

function clearAll() {
  selectedEmpIds.clear();
  empTripSegments.clear();
  renderEmployeeList();
  renderSelectedTags();
  renderTripDates();
  refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();
}
