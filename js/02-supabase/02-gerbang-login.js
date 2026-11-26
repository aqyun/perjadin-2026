// =====================================================================
// KONTROL GERBANG LOGIN UTAMA (FULLSCREEN AUTH GATE)
// =====================================================================

function lockAuthGate() {
  document.body.classList.add('auth-locked');
  const gate = document.getElementById('authGateScreen');
  if (gate) gate.style.display = 'flex';
  const cfg = getSupabaseConfig();
  const notice = document.getElementById('gateConfigNotice');
  if (notice) {
    notice.style.display = (!cfg.anonKey) ? 'flex' : 'none';
  }
  const loader = document.getElementById('appLoader');
  if (loader) loader.classList.add('is-hidden');
}

function unlockAuthGate() {
  document.body.classList.remove('auth-locked');
  const gate = document.getElementById('authGateScreen');
  if (gate) gate.style.display = 'none';
  const loader = document.getElementById('appLoader');
  if (loader) loader.classList.add('is-hidden');
}

// Inisialisasi Auth saat aplikasi dimuat
async function initSupabaseAuth() {
  renderAuthWidget();
  const client = getSupabaseClient();
  if (!client) {
    lockAuthGate();
    renderAuthWidget();
    return;
  }

  let initialSyncedUserId = null;

  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (session && session.user) {
      await loadUserProfile(session.user);
      unlockAuthGate();
      initialSyncedUserId = session.user.id;
      syncTripsFromCloud(true);
    } else {
      setCurrentAuthUser(null);
      lockAuthGate();
    }
  } catch (e) {
    console.warn('Gagal memuat sesi Supabase:', e);
    setCurrentAuthUser(null);
    lockAuthGate();
  }
  renderAuthWidget();
  applyRolePermissions();

  // Deteksi tautan pemulihan kata sandi dari email Supabase (type=recovery)
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  if (hash.includes('type=recovery') || search.includes('type=recovery')) {
    setTimeout(() => {
      openUpdatePasswordModal();
    }, 600);
  }

  // Dengarkan perubahan sesi login/logout & password recovery
  client.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      openUpdatePasswordModal();
    }
    if (session && session.user) {
      await loadUserProfile(session.user);
      unlockAuthGate();
      // Cegah duplikasi sync pada INITIAL_SESSION / SIGNED_IN pertama kali saat boot
      const isInitialSameUser = (event === 'INITIAL_SESSION' || initialSyncedUserId === session.user.id);
      if (!isInitialSameUser || !initialSyncedUserId) {
        initialSyncedUserId = session.user.id;
        syncTripsFromCloud(true);
      }
    } else {
      initialSyncedUserId = null;
      setCurrentAuthUser(null);
      lockAuthGate();
    }
    renderAuthWidget();
    applyRolePermissions();
    if (typeof renderTripHistory === 'function') {
      renderTripHistory();
    }
  });
}

// Muat profil user dari tabel 'profiles' untuk mengetahui Role (admin / viewer)
async function loadUserProfile(user) {
  const client = getSupabaseClient();
  if (!client || !user) return;

  try {
    const { data: profile, error } = await client
      .from('profiles')
      .select('nama_lengkap, role')
      .eq('id', user.id)
      .maybeSingle();

    const fullName = profile?.nama_lengkap || user.user_metadata?.full_name || user.email.split('@')[0];
    const defaultEmailRole = (user.email === 'aqyunmaulidin@gmail.com') ? 'admin' : 'viewer';
    const rawRole = (profile?.role || user.user_metadata?.role || defaultEmailRole).toLowerCase().trim();
    const normalizedRole = ['admin', 'operator', 'editor'].includes(rawRole) ? (rawRole === 'editor' ? 'operator' : rawRole) : 'viewer';

    setCurrentAuthUser({
      id: user.id,
      email: user.email,
      nama: fullName,
      role: normalizedRole
    });
  } catch (e) {
    console.warn('Gagal mengambil data profil:', e);
    const defaultEmailRole = (user.email === 'aqyunmaulidin@gmail.com') ? 'admin' : 'viewer';
    const rawRole = (user.user_metadata?.role || defaultEmailRole).toLowerCase().trim();
    const normalizedRole = ['admin', 'operator', 'editor'].includes(rawRole) ? (rawRole === 'editor' ? 'operator' : rawRole) : 'viewer';
    setCurrentAuthUser({
      id: user.id,
      email: user.email,
      nama: user.user_metadata?.full_name || user.email.split('@')[0],
      role: normalizedRole
    });
  }
}

// Cek apakah user adalah Admin
function isCurrentUserAdmin() {
  return currentAuthUser && currentAuthUser.role === 'admin';
}

// Cek apakah user adalah Operator (Operator / Verifikator)
function isCurrentUserRoleKhusus() {
  return currentAuthUser && (currentAuthUser.role === 'operator' || currentAuthUser.role === 'editor');
}

// Cek apakah user berhak membuat / mengedit berkas dan update progres
function canCurrentUserEdit() {
  return isCurrentUserAdmin() || isCurrentUserRoleKhusus();
}

// Update tampilan Widget Auth di Topbar Header
function renderAuthWidget() {
  const container = document.getElementById('authTopbarWidget');
  if (!container) return;

  const cfg = getSupabaseConfig();
  if (!cfg.anonKey) {
    container.innerHTML = `
      <button type="button" class="btn-tool btn-tool-auth-setup" onclick="openSbConfigModal()" title="Hubungkan Database Supabase (Masukkan Anon Public Key)">
        <span class="auth-dot auth-dot-warn"></span>
        <svg class="ico"><use href="#i-sliders"></use></svg>
        <span>Set Supabase API</span>
      </button>
    `;
    return;
  }

  if (!currentAuthUser) {
    container.innerHTML = `
      <button type="button" class="btn-tool btn-tool-auth" onclick="openAuthModal('login')" title="Masuk / Daftar Akun untuk sinkronisasi cloud">
        <svg class="ico"><use href="#i-user"></use></svg>
        <span>Masuk / Daftar</span>
      </button>
    `;
    return;
  }

  let roleLabel = 'VIEWER';
  let roleClass = 'badge-role-viewer';
  if (currentAuthUser.role === 'admin') {
    roleLabel = 'ADMIN';
    roleClass = 'badge-role-admin';
  } else if (currentAuthUser.role === 'operator' || currentAuthUser.role === 'editor') {
    roleLabel = 'OPERATOR';
    roleClass = 'badge-role-operator';
  }
  const initials = currentAuthUser.nama.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';

  container.innerHTML = `
    <div class="user-profile-menu-wrap">
      <button type="button" class="user-profile-pill" onclick="toggleUserDropdown(event)" aria-haspopup="true" aria-expanded="false" title="Akun: ${currentAuthUser.nama} (${currentAuthUser.email})">
        <span class="user-avatar-circle">${initials}</span>
        <span class="user-pill-info">
          <strong class="user-pill-name">${currentAuthUser.nama}</strong>
          <span class="user-pill-role ${roleClass}">${roleLabel}</span>
        </span>
        <svg class="ico ico-dropdown"><use href="#i-chevron-down"></use></svg>
      </button>
      <div class="user-profile-dropdown" id="userProfileDropdown" style="display:none;" onclick="event.stopPropagation()">
        <div class="user-dd-header">
          <div class="user-dd-avatar">${initials}</div>
          <div class="user-dd-details">
            <strong class="user-dd-name">${currentAuthUser.nama}</strong>
            <span class="user-dd-email">${currentAuthUser.email}</span>
            <span class="user-dd-badge ${roleClass}">Hak Akses: ${roleLabel}</span>
          </div>
        </div>
        <div class="user-dd-divider"></div>
        <div class="user-dd-item-info">
          <span class="dd-cloud-dot"></span>
          <span>Database: <strong>Terhubung</strong></span>
        </div>
        ${isCurrentUserAdmin() ? `
        <button type="button" class="user-dd-item" onclick="openUserManagementModal(); toggleUserDropdown();">
          <svg class="ico"><use href="#i-user"></use></svg>
          <span>Kelola Pengguna Tim</span>
        </button>
        <button type="button" class="user-dd-item" onclick="openSbConfigModal(); toggleUserDropdown();">
          <svg class="ico"><use href="#i-sliders"></use></svg>
          <span>Pengaturan Supabase</span>
        </button>
        ` : ''}
        <div class="user-dd-divider"></div>
        <button type="button" class="user-dd-item user-dd-logout" onclick="authLogout()">
          <svg class="ico"><use href="#i-close"></use></svg>
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  `;
}

// Toggle Dropdown Menu Pengguna
function toggleUserDropdown(event) {
  if (event) event.stopPropagation();
  const dd = document.getElementById('userProfileDropdown');
  if (!dd) return;
  const isHidden = dd.style.display === 'none' || !dd.style.display;
  dd.style.display = isHidden ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
  const dd = document.getElementById('userProfileDropdown');
  if (dd && dd.style.display === 'block' && !e.target.closest('.user-profile-menu-wrap')) {
    dd.style.display = 'none';
  }
});

// Terapkan pembatasan hak akses (Admin vs Operator vs Viewer) pada UI
function applyRolePermissions() {
  const isAdm = isCurrentUserAdmin();
  const isKhusus = isCurrentUserRoleKhusus();
  const canEdit = isAdm || isKhusus;
  const isLogged = !!currentAuthUser;
  const isViewer = isLogged && !canEdit;

  // Toggle Input Perjalanan tab button di sidebar (hanya Admin & Operator yang melihat form buat berkas)
  const inputTabBtn = document.querySelector('.tab-btn[data-tab="input"]');
  if (inputTabBtn) {
    inputTabBtn.style.display = isViewer ? 'none' : 'flex';
  }

  // Toggle Simulasi Biaya (HANYA role Viewer yang melihat fitur simulasi; Admin & Operator TIDAK MUNCUL)
  const simTabBtns = document.querySelectorAll('.tab-btn[data-tab="simulasi"], .bottom-nav-btn[data-tab="simulasi"], .btn-hero-simulasi, .sbm-btn-to-simulasi');
  simTabBtns.forEach(el => {
    el.style.display = isViewer ? '' : 'none';
  });

  // Jika Admin/Operator sedang berada di tab simulasi, arahkan ke input
  if (!isViewer) {
    const activeBtn = document.querySelector('.tab-btn.active');
    const activeTab = activeBtn?.getAttribute('data-tab');
    if (activeTab === 'simulasi') {
      if (typeof showTab === 'function') showTab(canEdit ? 'input' : 'dashboard');
    }
  }

  // Set body role classes
  if (isViewer) {
    document.body.classList.add('role-viewer');
    document.body.classList.remove('role-admin', 'role-operator');
    // Viewer memiliki modul: dashboard, riwayat, sbm, simulasi
    const activeBtn = document.querySelector('.tab-btn.active');
    const activeTab = activeBtn?.getAttribute('data-tab');
    if (!['dashboard', 'riwayat', 'sbm', 'simulasi'].includes(activeTab)) {
      if (typeof showTab === 'function') showTab('dashboard');
    }
    const pageEyebrow = document.getElementById('pageEyebrow');
    if (pageEyebrow) pageEyebrow.textContent = 'Portal Eksekutif';
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = 'Dashboard Eksekutif';
  } else if (isAdm) {
    document.body.classList.add('role-admin');
    document.body.classList.remove('role-viewer', 'role-operator');
  } else if (isKhusus) {
    document.body.classList.add('role-operator');
    document.body.classList.remove('role-viewer', 'role-admin');
  } else {
    document.body.classList.remove('role-viewer', 'role-admin', 'role-operator');
  }

  // Banner status di tab Riwayat
  const banner = document.getElementById('historyRoleNotice');
  if (banner) {
    if (!isLogged) {
      banner.style.display = 'flex';
      banner.className = 'history-role-banner banner-guest';
      banner.innerHTML = `
        <svg class="ico"><use href="#i-info"></use></svg>
        <div class="banner-text">
          <strong>Mode Offline / Lokal:</strong> Anda belum masuk. Data riwayat saat ini disimpan di memori browser ini. <a href="javascript:void(0)" onclick="openAuthModal('login')">Masuk atau Daftar</a> untuk menyinkronkan data antar-perangkat.
        </div>
      `;
    } else if (isAdm) {
      banner.style.display = 'flex';
      banner.className = 'history-role-banner banner-admin';
      banner.innerHTML = `
        <svg class="ico"><use href="#i-check"></use></svg>
        <div class="banner-text">
          <strong>Akses Administrator (${currentAuthUser.email}):</strong> Anda memiliki wewenang penuh untuk membuat berkas baru, mengedit, menyimpan langsung ke Cloud Database Publik, memperbarui progres pencairan, dan mengelola hak akses tim.
        </div>
      `;
    } else if (isKhusus) {
      banner.style.display = 'flex';
      banner.className = 'history-role-banner banner-admin';
      banner.innerHTML = `
        <svg class="ico"><use href="#i-edit"></use></svg>
        <div class="banner-text">
          <strong>Akses Opeator (${currentAuthUser.email}):</strong> Anda berhak menyusun berkas perjalanan dinas baru, mengedit isian, menyimpan otomatis ke Cloud Database Publik, dan memperbarui progres berkas ke Satker / Pencairan.
        </div>
      `;
    } else {
      banner.style.display = 'flex';
      banner.className = 'history-role-banner banner-viewer';
      banner.innerHTML = `
        <svg class="ico"><use href="#i-info"></use></svg>
        <div class="banner-text">
          <strong>Dashboard Eksekutif Viewer (${currentAuthUser.email}):</strong> Anda dapat memantau status real-time berkas yang diproses ke satker &amp; telah dicairkan, mengecek Kamus SBM 2026, menjalankan Kalkulator Simulasi Biaya, serta membuka dan mencetak dokumen resmi.
        </div>
      `;
    }
  }

  // Tombol Cloud Sync di Tab Riwayat
  const cloudSyncBtn = document.getElementById('btnCloudSync');
  if (cloudSyncBtn) {
    cloudSyncBtn.style.display = isLogged ? 'inline-flex' : 'none';
  }

  const cloudPushBtn = document.getElementById('btnCloudPush');
  if (cloudPushBtn) {
    cloudPushBtn.style.display = canEdit ? 'inline-flex' : 'none';
  }

  // Pastikan SBM Cockpit terinisialisasi
  if (typeof initViewerSbmCockpit === 'function') {
    initViewerSbmCockpit();
  }
}

