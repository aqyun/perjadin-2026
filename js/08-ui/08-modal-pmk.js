// =====================================================================
// DOKUMEN RESMI PMK SBM 2026 MODAL VIEWER
// =====================================================================
const PMK_FILE_PATH = 'PMK_Nomor_32_Tahun_2025_SBM_2026.pdf';

function openPmkModal(defaultPage) {
  const overlay = document.getElementById('pmkOverlay');
  if (!overlay) return;
  const page = parseInt(defaultPage, 10) || 15;

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  const pill = document.querySelector(`.pmk-pill[data-page="${page}"]`) || document.querySelector('.pmk-pill');
  jumpPmkPage(page, pill);
}

function closePmkModal() {
  const overlay = document.getElementById('pmkOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function handlePmkBackdrop(event) {
  if (event.target && event.target.id === 'pmkOverlay') {
    closePmkModal();
  }
}

function jumpPmkPage(pageNum, btnEl) {
  const page = parseInt(pageNum, 10) || 15;
  const targetUrl = `${PMK_FILE_PATH}#page=${page}&zoom=page-width`;

  // 1. Update pills visual active state
  document.querySelectorAll('.pmk-pill').forEach(btn => {
    const p = parseInt(btn.getAttribute('data-page'), 10);
    btn.classList.toggle('active', p === page);
  });
  if (btnEl) {
    btnEl.classList.add('active');
    try {
      btnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch (e) {}
  }

  // 2. Update page input box if present
  const pageInput = document.getElementById('pmkPageInput');
  if (pageInput) pageInput.value = page;

  // 3. Update "Tab Baru" button href so opening in new tab also goes to this page
  const tabBtn = document.getElementById('pmkNewTabBtn');
  if (tabBtn) tabBtn.href = targetUrl;

  // 4. Force Edge / Chromium PDF re-navigation via fresh iframe element
  const oldIframe = document.getElementById('pmkPdfFrame');
  const container = document.querySelector('.pmk-body');
  if (container) {
    const newIframe = document.createElement('iframe');
    newIframe.id = 'pmkPdfFrame';
    newIframe.className = 'pmk-iframe';
    newIframe.title = 'PDF Viewer PMK SBM 2026';
    newIframe.src = targetUrl;

    if (oldIframe && oldIframe.parentNode) {
      oldIframe.parentNode.replaceChild(newIframe, oldIframe);
    } else {
      container.appendChild(newIframe);
    }
  }
}

function jumpPmkFromInput() {
  const input = document.getElementById('pmkPageInput');
  if (!input) return;
  let p = parseInt(input.value, 10);
  if (isNaN(p) || p < 1) p = 1;
  if (p > 110) p = 110;
  input.value = p;
  const pill = document.querySelector(`.pmk-pill[data-page="${p}"]`);
  jumpPmkPage(p, pill);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeSidebar();
    closeWelcome();
    closePmkModal();
    if (typeof closeMealDuplicateModal === 'function') closeMealDuplicateModal();
  }
});

document.addEventListener('input', (e) => { 
  updateSbmWarnings(); 
  refreshHotelSummaries(); 
  const rincianTab = document.getElementById('tab-rincian');
  if (rincianTab && rincianTab.classList.contains('active')) {
    if (!e.target.closest('#rincianOut') && !e.target.closest('#rincianCockpit')) {
      if (typeof renderRincian === 'function') renderRincian();
    }
  }
});
document.addEventListener('change', (e) => { 
  updateSbmWarnings(); 
  refreshHotelSummaries(); 
  const rincianTab = document.getElementById('tab-rincian');
  if (rincianTab && rincianTab.classList.contains('active')) {
    if (!e.target.closest('#rincianOut') && !e.target.closest('#rincianCockpit')) {
      if (typeof renderRincian === 'function') renderRincian();
    }
  }
});

