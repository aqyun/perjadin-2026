// =====================================================================
// PERDINKU 2026 - SUPABASE DATABASE & AUTHENTICATION INTEGRATION
// =====================================================================

// Backend sekarang PocketBase (server https://perdinku.thearchiver.my.id).
// Lapisan js/pb-shim.js meniru antarmuka supabase-js di atas PocketBase.
const DEFAULT_SUPABASE_URL = (typeof window !== 'undefined' && window.location.hostname.includes('thearchiver.my.id'))
  ? window.location.origin
  : 'https://perdinku.thearchiver.my.id';
const DEFAULT_SUPABASE_ANON_KEY = 'pocketbase';
const DEFAULT_SUPABASE_PUB_KEY = '';
const STORAGE_KEY_SB_URL = 'perdinku_sb_url';
const STORAGE_KEY_SB_ANON = 'perdinku_sb_anon_key';

let sbClient = null;
let currentAuthUser = null; // { id, email, nama, role: 'admin' | 'viewer' }

function setCurrentAuthUser(user) {
  currentAuthUser = user;
  window.currentAuthUser = user;
}

function getCurrentAuthUser() {
  return currentAuthUser;
}

// Ambil konfigurasi URL dan Anon Key dari localStorage atau default tertanam
function getSupabaseConfig() {
  let storedUrl = (localStorage.getItem(STORAGE_KEY_SB_URL) || '').trim();
  if (storedUrl.includes('supabase.co')) {
    localStorage.removeItem(STORAGE_KEY_SB_URL);
    storedUrl = '';
  }
  let storedAnon = (localStorage.getItem(STORAGE_KEY_SB_ANON) || '').trim();
  if (storedAnon && (storedAnon.includes('postgres') || storedAnon.includes('secret') || storedAnon.startsWith('eyJhbGci'))) {
    localStorage.removeItem(STORAGE_KEY_SB_ANON);
    storedAnon = '';
  }
  return {
    url: storedUrl || DEFAULT_SUPABASE_URL,
    anonKey: storedAnon || DEFAULT_SUPABASE_ANON_KEY
  };
}

// Inisialisasi Supabase Client
function getSupabaseClient() {
  if (sbClient) return sbClient;
  const cfg = getSupabaseConfig();
  if (!window.supabase || !cfg.url || !cfg.anonKey) return null;
  try {
    sbClient = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return sbClient;
  } catch (err) {
    console.error('Inisialisasi Supabase gagal:', err);
    return null;
  }
}

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
    const rawRole = (profile?.role || user.user_metadata?.role || 'viewer').toLowerCase().trim();
    const normalizedRole = ['admin', 'operator', 'editor'].includes(rawRole) ? (rawRole === 'editor' ? 'operator' : rawRole) : 'viewer';

    setCurrentAuthUser({
      id: user.id,
      email: user.email,
      nama: fullName,
      role: normalizedRole
    });
  } catch (e) {
    console.warn('Gagal mengambil data profil:', e);
    const rawRole = (user.user_metadata?.role || 'viewer').toLowerCase().trim();
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

  // Set body role classes
  if (isViewer) {
    document.body.classList.add('role-viewer');
    document.body.classList.remove('role-admin', 'role-operator');
    // Viewer memiliki modul: dashboard, riwayat, sbm
    const activeBtn = document.querySelector('.tab-btn.active');
    const activeTab = activeBtn?.getAttribute('data-tab');
    if (!['dashboard', 'riwayat', 'sbm'].includes(activeTab)) {
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
          <strong>Dashboard Eksekutif Viewer (${currentAuthUser.email}):</strong> Anda dapat memantau status real-time berkas yang diproses ke satker &amp; telah dicairkan, mengecek Kamus SBM 2026, serta membuka dan mencetak dokumen resmi.
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

// =====================================================================
// PROSES AUTHENTICATION (LOGIN, SIGNUP, LOGOUT)
// =====================================================================

async function handleAuthLogin(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('authLoginEmail')?.value || '').trim();
  const password = document.getElementById('authLoginPassword')?.value || '';
  const alertEl = document.getElementById('authLoginAlert');
  const btn = document.getElementById('btnSubmitLogin');

  if (!email && !password) {
    showAuthAlert(alertEl, 'error', 'Alamat Email dan Kata Sandi wajib diisi.');
    return;
  }
  if (!email) {
    showAuthAlert(alertEl, 'error', 'Alamat Email wajib diisi.');
    return;
  }
  if (!password) {
    showAuthAlert(alertEl, 'error', 'Kata Sandi wajib diisi.');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    showAuthAlert(alertEl, 'error', 'Supabase belum terhubung. Periksa konfigurasi API Key.');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Memproses masuk...';
  }

  try {
    let { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error && error.message && error.message.includes('Invalid API key')) {
      console.warn('Mendeteksi Invalid API key, me-reset cache Supabase ke default...');
      localStorage.removeItem(STORAGE_KEY_SB_ANON);
      sbClient = null;
      const retryClient = getSupabaseClient();
      if (retryClient) {
        const retry = await retryClient.auth.signInWithPassword({ email, password });
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) throw error;

    await loadUserProfile(data.user);
    closeAuthModal();
    unlockAuthGate();
    renderAuthWidget();
    applyRolePermissions();

    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Berhasil Masuk',
        `Selamat datang, ${currentAuthUser.nama}! Anda masuk sebagai [${currentAuthUser.role.toUpperCase()}].`
      );
    }
    // Sinkronkan data riwayat dari cloud secara otomatis
    syncTripsFromCloud(true);
  } catch (err) {
    console.error('Login error:', err);
    let msg = err.message || 'Gagal masuk. Periksa email dan password.';
    if (msg.includes('Invalid login credentials')) {
      msg = 'Email atau kata sandi tidak cocok. Silakan coba lagi.';
    } else if (msg.includes('Email not confirmed') || msg.includes('Email belum dikonfirmasi') || err.isUnverified) {
      msg = `Email Anda belum dikonfirmasi. Silakan periksa <strong>kotak masuk</strong> (atau folder Spam) pada email Anda terlebih dahulu dan klik tautan verifikasi sebelum masuk.<br><button type="button" class="btn btn-outline btn-sm" onclick="resendVerificationLink('${email}')" style="margin-top:8px; font-size:11.5px; padding:3px 10px;">📧 Kirim Ulang Email Verifikasi</button>`;
    } else if (msg.includes('Invalid API key')) {
      msg = 'Koneksi sesi diperbarui otomatis. Silakan klik Masuk sekali lagi.';
    }
    showAuthAlert(alertEl, 'error', msg);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg class="ico"><use href="#i-check"></use></svg><span>Masuk</span>';
    }
  }
}

async function handleAuthSignUp(e) {
  if (e) e.preventDefault();
  const fullName = (document.getElementById('authSignupName')?.value || '').trim();
  const email = (document.getElementById('authSignupEmail')?.value || '').trim();
  const password = document.getElementById('authSignupPassword')?.value || '';
  const userRole = (email.toLowerCase() === 'aqyunrm@gmail.com' || email.toLowerCase() === 'aqyun.maulidin@pkp.go.id') ? 'admin' : 'viewer';
  const alertEl = document.getElementById('authSignupAlert');
  const btn = document.getElementById('btnSubmitSignup');

  if (!fullName) {
    showAuthAlert(alertEl, 'error', 'Nama Lengkap wajib diisi.');
    return;
  }
  if (!email) {
    showAuthAlert(alertEl, 'error', 'Alamat Email wajib diisi.');
    return;
  }
  if (!password) {
    showAuthAlert(alertEl, 'error', 'Kata Sandi Baru wajib diisi.');
    return;
  }
  if (password.length < 6) {
    showAuthAlert(alertEl, 'error', 'Kata sandi minimal 6 karakter.');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    showAuthAlert(alertEl, 'error', 'Supabase belum terhubung. Periksa konfigurasi API Key.');
    return;
  }

  // Pre-check apakah email sudah terdaftar di database profiles
  try {
    const { data: existingProfile } = await client
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (existingProfile) {
      showAuthAlert(alertEl, 'error', '⚠️ Email ini sudah pernah terdaftar di PerdinKu. Silakan masuk (Login) dengan email tersebut atau gunakan menu "Lupa Kata Sandi".');
      return;
    }
  } catch (chkErr) {
    console.warn('Pre-check email diabaikan:', chkErr);
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Mendaftarkan akun...';
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: userRole
        }
      }
    });

    if (error) {
      const errLower = (error.message || '').toLowerCase();
      if (errLower.includes('already') || errLower.includes('registered') || error.status === 422 || error.code === 'user_already_exists') {
        throw new Error('Email ini sudah pernah terdaftar di PerdinKu. Silakan masuk (Login) dengan email tersebut atau gunakan menu "Lupa Kata Sandi".');
      }
      throw error;
    }

    // Supabase saat auto-confirm OFF mengembalikan identities: [] jika email sudah terdaftar
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      showAuthAlert(alertEl, 'error', '⚠️ Email ini sudah pernah terdaftar di PerdinKu. Silakan masuk (Login) dengan email tersebut atau gunakan menu "Lupa Kata Sandi".');
      return;
    }

    // Jika Supabase auto-confirm session:
    if (data.session && data.user) {
      showAuthAlert(alertEl, 'success', 'Pendaftaran berhasil! Akun Anda telah aktif.');
      await loadUserProfile(data.user);
      setTimeout(() => {
        closeAuthModal();
        unlockAuthGate();
        renderAuthWidget();
        applyRolePermissions();
        if (typeof showRefreshToast === 'function') {
          showRefreshToast('Pendaftaran Berhasil', `Akun Anda (${currentAuthUser.role.toUpperCase()}) telah aktif.`);
        }
      }, 1000);
    } else {
      const safeEmail = (typeof escapeAttrSafe === 'function') ? escapeAttrSafe(email) : email;
      showAuthAlert(alertEl, 'success', `Pendaftaran berhasil! Tautan verifikasi telah dikirim ke <strong>${safeEmail}</strong>.<br>Silakan periksa <strong>kotak masuk</strong> (atau folder Spam) pada email Anda sebelum masuk.`);
      setTimeout(() => {
        switchAuthTab('login');
        const loginEmail = document.getElementById('authLoginEmail');
        if (loginEmail) loginEmail.value = email;
        const loginAlert = document.getElementById('authLoginAlert');
        if (loginAlert) {
          showAuthAlert(loginAlert, 'success', `Akun berhasil dibuat untuk <strong>${safeEmail}</strong>. Silakan periksa <strong>kotak masuk</strong> (atau folder Spam) email Anda untuk konfirmasi sebelum masuk.`);
        }
      }, 2200);
    }
  } catch (err) {
    console.error('Sign up error:', err);
    showAuthAlert(alertEl, 'error', err.message || 'Gagal mendaftar akun.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg class="ico"><use href="#i-plus"></use></svg><span>Daftar Akun</span>';
    }
  }
}

async function authLogout() {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Logout error:', e);
    }
  }
  setCurrentAuthUser(null);
  renderAuthWidget();
  applyRolePermissions();
  lockAuthGate();
  if (typeof renderTripHistory === 'function') {
    renderTripHistory();
  }
  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Telah Keluar', 'Anda telah keluar dari akun.');
  }
}

function showAuthAlert(el, type, msg) {
  if (!el) return;
  el.className = `auth-alert alert-${type}`;
  el.innerHTML = msg;
  el.style.display = 'block';
}

// Kontrol Tab pada Gerbang Login Utama
function switchGateTab(tab) {
  const loginPane = document.getElementById('gateLoginPane');
  const signupPane = document.getElementById('gateSignupPane');
  const resetPane = document.getElementById('gateResetPane');
  const tabLogin = document.getElementById('tabGateLogin');
  const tabSignup = document.getElementById('tabGateSignup');

  if (loginPane) loginPane.style.display = 'none';
  if (signupPane) signupPane.style.display = 'none';
  if (resetPane) resetPane.style.display = 'none';
  if (tabLogin) tabLogin.classList.remove('active');
  if (tabSignup) tabSignup.classList.remove('active');

  if (tab === 'signup') {
    if (signupPane) signupPane.style.display = 'block';
    if (tabSignup) tabSignup.classList.add('active');
  } else if (tab === 'reset') {
    if (resetPane) resetPane.style.display = 'block';
  } else {
    if (loginPane) loginPane.style.display = 'block';
    if (tabLogin) tabLogin.classList.add('active');
  }
}

async function handleGateLogin(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('gateLoginEmail')?.value || '').trim();
  const password = document.getElementById('gateLoginPassword')?.value || '';
  const alertEl = document.getElementById('gateLoginAlert');
  const btn = document.getElementById('btnGateSubmitLogin');

  if (!email && !password) {
    showAuthAlert(alertEl, 'error', 'Alamat Email dan Kata Sandi wajib diisi.');
    return;
  }
  if (!email) {
    showAuthAlert(alertEl, 'error', 'Alamat Email wajib diisi.');
    return;
  }
  if (!password) {
    showAuthAlert(alertEl, 'error', 'Kata Sandi wajib diisi.');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    showAuthAlert(alertEl, 'error', 'Supabase belum terhubung. Silakan klik tombol "Set Supabase API" di bawah.');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Memverifikasi akun...';
  }

  try {
    let { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error && error.message && error.message.includes('Invalid API key')) {
      console.warn('Mendeteksi Invalid API key di gate, me-reset cache Supabase ke default...');
      localStorage.removeItem(STORAGE_KEY_SB_ANON);
      sbClient = null;
      const retryClient = getSupabaseClient();
      if (retryClient) {
        const retry = await retryClient.auth.signInWithPassword({ email, password });
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) throw error;

    await loadUserProfile(data.user);
    unlockAuthGate();
    renderAuthWidget();
    applyRolePermissions();

    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Berhasil Masuk',
        `Selamat datang, ${currentAuthUser.nama}! Anda masuk sebagai [${currentAuthUser.role.toUpperCase()}].`
      );
    }
    syncTripsFromCloud(true);
  } catch (err) {
    console.error('Login error:', err);
    let msg = err.message || 'Gagal masuk. Periksa email dan password.';
    if (msg.includes('Invalid login credentials')) {
      msg = 'Email atau kata sandi tidak cocok. Silakan coba lagi.';
    } else if (msg.includes('Email not confirmed') || msg.includes('Email belum dikonfirmasi') || err.isUnverified) {
      msg = `Email Anda belum dikonfirmasi. Silakan periksa <strong>kotak masuk</strong> (atau folder Spam) pada email Anda terlebih dahulu dan klik tautan verifikasi sebelum masuk.<br><button type="button" class="btn btn-outline btn-sm" onclick="resendVerificationLink('${email}')" style="margin-top:8px; font-size:11.5px; padding:3px 10px;">📧 Kirim Ulang Email Verifikasi</button>`;
    } else if (msg.includes('Invalid API key')) {
      msg = 'Koneksi sesi diperbarui otomatis. Silakan klik Masuk sekali lagi.';
    }
    showAuthAlert(alertEl, 'error', msg);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg class="ico"><use href="#i-check"></use></svg><span>Masuk ke PerdinKu</span>';
    }
  }
}

async function handleGateSignUp(e) {
  if (e) e.preventDefault();
  const fullName = (document.getElementById('gateSignupName')?.value || '').trim();
  const email = (document.getElementById('gateSignupEmail')?.value || '').trim();
  const password = document.getElementById('gateSignupPassword')?.value || '';
  const userRole = (email.toLowerCase() === 'aqyunrm@gmail.com' || email.toLowerCase() === 'aqyun.maulidin@pkp.go.id') ? 'admin' : 'viewer';
  const alertEl = document.getElementById('gateSignupAlert');
  const btn = document.getElementById('btnGateSubmitSignup');

  if (!fullName) {
    showAuthAlert(alertEl, 'error', 'Nama Lengkap wajib diisi.');
    return;
  }
  if (!email) {
    showAuthAlert(alertEl, 'error', 'Alamat Email wajib diisi.');
    return;
  }
  if (!password) {
    showAuthAlert(alertEl, 'error', 'Kata Sandi Baru wajib diisi.');
    return;
  }

  if (password.length < 6) {
    showAuthAlert(alertEl, 'error', 'Kata sandi minimal 6 karakter.');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    showAuthAlert(alertEl, 'error', 'Supabase belum terhubung. Periksa konfigurasi API Key.');
    return;
  }

  // Pre-check apakah email sudah terdaftar di database profiles
  try {
    const { data: existingProfile } = await client
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (existingProfile) {
      showAuthAlert(alertEl, 'error', '⚠️ Email ini sudah pernah terdaftar di PerdinKu. Silakan masuk (Login) dengan email tersebut atau gunakan menu "Lupa kata sandi".');
      return;
    }
  } catch (chkErr) {
    console.warn('Pre-check email diabaikan:', chkErr);
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Mendaftarkan akun...';
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: userRole
        }
      }
    });

    if (error) {
      const errLower = (error.message || '').toLowerCase();
      if (errLower.includes('already') || errLower.includes('registered') || error.status === 422 || error.code === 'user_already_exists') {
        throw new Error('Email ini sudah pernah terdaftar di PerdinKu. Silakan masuk (Login) dengan email tersebut atau gunakan menu "Lupa kata sandi".');
      }
      throw error;
    }

    // Supabase saat auto-confirm OFF mengembalikan identities: [] jika email sudah pernah terdaftar
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      showAuthAlert(alertEl, 'error', '⚠️ Email ini sudah pernah terdaftar di PerdinKu. Silakan masuk (Login) dengan email tersebut atau gunakan menu "Lupa kata sandi".');
      return;
    }

    if (data.session && data.user) {
      showAuthAlert(alertEl, 'success', 'Pendaftaran berhasil! Akun Anda telah siap.');
      await loadUserProfile(data.user);
      setTimeout(() => {
        unlockAuthGate();
        renderAuthWidget();
        applyRolePermissions();
        if (typeof showRefreshToast === 'function') {
          showRefreshToast('Pendaftaran Berhasil', `Selamat datang, ${currentAuthUser.nama} [${currentAuthUser.role.toUpperCase()}].`);
        }
      }, 900);
    } else {
      const safeEmail = (typeof escapeAttrSafe === 'function') ? escapeAttrSafe(email) : email;
      showAuthAlert(alertEl, 'success', `Pendaftaran berhasil! Tautan verifikasi telah dikirim ke <strong>${safeEmail}</strong>.<br>Silakan periksa <strong>kotak masuk</strong> (atau folder Spam) pada email Anda sebelum masuk.`);
      setTimeout(() => {
        switchGateTab('login');
        const loginEmail = document.getElementById('gateLoginEmail');
        if (loginEmail) loginEmail.value = email;
        const loginAlert = document.getElementById('gateLoginAlert');
        if (loginAlert) {
          showAuthAlert(loginAlert, 'success', `Akun berhasil dibuat untuk <strong>${safeEmail}</strong>. Silakan periksa <strong>kotak masuk</strong> (atau folder Spam) email Anda untuk konfirmasi sebelum masuk.`);
        }
      }, 2200);
    }
  } catch (err) {
    console.error('Sign up error:', err);
    showAuthAlert(alertEl, 'error', err.message || 'Gagal mendaftar akun.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg class="ico"><use href="#i-plus"></use></svg><span>Daftar Akun</span>';
    }
  }
}

async function handleGateForgotPassword(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('gateResetEmail')?.value || '').trim();
  const alertEl = document.getElementById('gateResetAlert');
  const btn = document.getElementById('btnGateSubmitReset');

  if (!email) {
    showAuthAlert(alertEl, 'error', 'Alamat Email Terdaftar wajib diisi.');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    showAuthAlert(alertEl, 'error', 'Supabase belum terhubung. Periksa konfigurasi API Key.');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Mengirim tautan...';
  }

  try {
    const redirectUrl = window.location.origin + window.location.pathname;
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) throw error;

    showAuthAlert(alertEl, 'success', `Tautan atur ulang kata sandi telah dikirim ke <strong>${email}</strong>.<br>Silakan periksa kotak masuk atau spam email Anda.`);
  } catch (err) {
    console.error('Reset password error:', err);
    showAuthAlert(alertEl, 'error', err.message || 'Gagal mengirim email reset kata sandi.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg class="ico"><use href="#i-refresh"></use></svg><span>Kirim Tautan Atur Ulang</span>';
    }
  }
}

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
          // Hanya pertahankan berkas lokal yang valid (bukan sisa auto-save draft kosong tanpa ST)
          const hasMeaningfulContent = Boolean(compKey) || (localItem.agenda && localItem.agenda !== 'Tanpa Agenda Perjalanan' && (localItem.empCount > 0 || (localItem.employees || []).length > 0));
          if (hasMeaningfulContent && !localItem.cloudId) {
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

// =====================================================================
// KONTROL MODAL (LOGIN / SIGNUP & KONFIGURASI SUPABASE)
// =====================================================================

function openAuthModal(tab = 'login') {
  const overlay = document.getElementById('authModalOverlay');
  if (!overlay) return;
  switchAuthTab(tab);
  overlay.classList.add('is-open');
}

function closeAuthModal() {
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) overlay.classList.remove('is-open');
  const a1 = document.getElementById('authLoginAlert');
  const a2 = document.getElementById('authSignupAlert');
  const a3 = document.getElementById('authResetAlert');
  if (a1) a1.style.display = 'none';
  if (a2) a2.style.display = 'none';
  if (a3) a3.style.display = 'none';
}

function switchAuthTab(tab) {
  const loginPane = document.getElementById('authLoginPane');
  const signupPane = document.getElementById('authSignupPane');
  const resetPane = document.getElementById('authResetPane');
  const tabLogin = document.getElementById('tabAuthLogin');
  const tabSignup = document.getElementById('tabAuthSignup');

  if (loginPane) loginPane.style.display = 'none';
  if (signupPane) signupPane.style.display = 'none';
  if (resetPane) resetPane.style.display = 'none';
  if (tabLogin) tabLogin.classList.remove('active');
  if (tabSignup) tabSignup.classList.remove('active');

  if (tab === 'signup') {
    if (signupPane) signupPane.style.display = 'block';
    if (tabSignup) tabSignup.classList.add('active');
  } else if (tab === 'reset') {
    if (resetPane) resetPane.style.display = 'block';
  } else {
    if (loginPane) loginPane.style.display = 'block';
    if (tabLogin) tabLogin.classList.add('active');
  }
}

function handleAuthBackdrop(event) {
  if (event.target.id === 'authModalOverlay') {
    closeAuthModal();
  }
}

// Permintaan kirim email atur ulang kata sandi
async function handleAuthForgotPassword(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('authResetEmail')?.value || '').trim();
  const alertEl = document.getElementById('authResetAlert');
  const btn = document.getElementById('btnSubmitReset');

  if (!email) {
    showAuthAlert(alertEl, 'error', 'Harap masukkan alamat email Anda.');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    showAuthAlert(alertEl, 'error', 'Supabase belum terhubung. Periksa konfigurasi API Key.');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Mengirim tautan...';
  }

  try {
    const redirectUrl = window.location.origin + window.location.pathname;
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) throw error;

    showAuthAlert(alertEl, 'success', `Tautan atur ulang kata sandi telah dikirim ke <strong>${email}</strong>.<br>Silakan periksa kotak masuk atau spam email Anda.`);
  } catch (err) {
    console.error('Reset password error:', err);
    showAuthAlert(alertEl, 'error', err.message || 'Gagal mengirim email reset kata sandi.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg class="ico"><use href="#i-refresh"></use></svg><span>Kirim Tautan Atur Ulang</span>';
    }
  }
}

// Modal Form Buat Kata Sandi Baru (Dipicu dari tautan email recovery)
function openUpdatePasswordModal() {
  const overlay = document.getElementById('updatePasswordOverlay');
  if (overlay) overlay.classList.add('is-open');
}

function closeUpdatePasswordModal() {
  const overlay = document.getElementById('updatePasswordOverlay');
  if (overlay) overlay.classList.remove('is-open');
  const alertEl = document.getElementById('updatePasswordAlert');
  if (alertEl) alertEl.style.display = 'none';
}

async function handleAuthUpdatePassword(e) {
  if (e) e.preventDefault();
  const p1 = document.getElementById('newPasswordInput')?.value || '';
  const p2 = document.getElementById('newPasswordConfirmInput')?.value || '';
  const alertEl = document.getElementById('updatePasswordAlert');
  const btn = document.getElementById('btnSubmitNewPassword');

  if (!p1 || !p2) {
    showAuthAlert(alertEl, 'error', 'Harap isi kedua kolom kata sandi.');
    return;
  }
  if (p1.length < 6) {
    showAuthAlert(alertEl, 'error', 'Kata sandi minimal 6 karakter.');
    return;
  }
  if (p1 !== p2) {
    showAuthAlert(alertEl, 'error', 'Konfirmasi kata sandi tidak cocok.');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    showAuthAlert(alertEl, 'error', 'Supabase belum terhubung.');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Menyimpan kata sandi baru...';
  }

  try {
    const { data, error } = await client.auth.updateUser({ password: p1 });
    if (error) throw error;

    showAuthAlert(alertEl, 'success', 'Kata sandi berhasil diperbarui! Sedang mengalihkan...');
    setTimeout(() => {
      closeUpdatePasswordModal();
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      if (typeof showRefreshToast === 'function') {
        showRefreshToast('Kata Sandi Diperbarui', 'Kata sandi baru Anda telah aktif. Anda sekarang telah masuk.');
      }
    }, 1500);
  } catch (err) {
    console.error('Update password error:', err);
    showAuthAlert(alertEl, 'error', err.message || 'Gagal memperbarui kata sandi.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<svg class="ico"><use href="#i-check"></use></svg><span>Simpan Kata Sandi Baru</span>';
    }
  }
}

// =====================================================================
// KELOLA PENGGUNA & HAK AKSES (ADMIN ONLY)
// =====================================================================

let cachedUserProfiles = [];

function openUserManagementModal() {
  const overlay = document.getElementById('userMgmtOverlay');
  if (!overlay) return;
  overlay.classList.add('is-open');
  loadUserManagementList();
}

function closeUserManagementModal() {
  const overlay = document.getElementById('userMgmtOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function closeUserMgmtModal() {
  closeUserManagementModal();
}

function handleUserMgmtBackdrop(event) {
  if (event.target.id === 'userMgmtOverlay') {
    closeUserManagementModal();
  }
}

function updateUserStats(users) {
  const totalEl = document.getElementById('statTotalUsers');
  const adminEl = document.getElementById('statAdminUsers');
  const operatorEl = document.getElementById('statOperatorUsers');
  const viewerEl = document.getElementById('statViewerUsers');
  if (!totalEl) return;

  const total = (users || []).length;
  const adminCount = (users || []).filter(u => (u.role || '').toLowerCase() === 'admin').length;
  const operatorCount = (users || []).filter(u => ['operator', 'editor'].includes((u.role || '').toLowerCase())).length;
  const viewerCount = Math.max(0, total - adminCount - operatorCount);

  totalEl.textContent = total;
  if (adminEl) adminEl.textContent = adminCount;
  if (operatorEl) operatorEl.textContent = operatorCount;
  if (viewerEl) viewerEl.textContent = viewerCount;
}

function copySchemaSqlToClipboard(btn) {
  const sql = `-- Salin dan jalankan di Supabase > SQL Editor:
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;

-- Pastikan kolom & constraint role pada tabel profiles mendukung admin, operator, viewer
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'operator', 'viewer'));

-- Pastikan izin Admin utama dan hak update profil
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN ('aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id UUID, new_role TEXT)
RETURNS JSONB AS $$
DECLARE
  caller_email TEXT;
  caller_is_admin BOOLEAN;
  updated_row RECORD;
BEGIN
  caller_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
  caller_is_admin := (
    caller_email IN ('aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Admin yang dapat mengubah peran.';
  END IF;
  IF new_role NOT IN ('admin', 'operator', 'viewer') THEN
    RAISE EXCEPTION 'Peran tidak valid: %. Pilihan: admin, operator, viewer', new_role;
  END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id RETURNING * INTO updated_row;
  IF updated_row.id IS NULL THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (target_user_id, (SELECT email FROM auth.users WHERE id = target_user_id), new_role)
    RETURNING * INTO updated_row;
  END IF;
  RETURN jsonb_build_object('success', true, 'id', updated_row.id, 'role', updated_row.role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated, anon;

-- Pastikan RLS tabel profiles mengizinkan Admin membaca & mengubah peran anggota
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles dapat dilihat oleh pengguna terotentikasi" ON public.profiles;
CREATE POLICY "Profiles dapat dilihat oleh pengguna terotentikasi"
  ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengupdate profil dan role pengguna" ON public.profiles;
DROP POLICY IF EXISTS "Pengguna dapat mengupdate profil sendiri" ON public.profiles;
DROP POLICY IF EXISTS "Admin atau pemilik akun dapat mengupdate profil" ON public.profiles;
CREATE POLICY "Admin atau pemilik akun dapat mengupdate profil"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin() OR auth.uid() = id)
  WITH CHECK (public.is_admin() OR role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()));

-- Pastikan seluruh kolom penting tersedia di tabel riwayat_perjadin
ALTER TABLE public.riwayat_perjadin ADD COLUMN IF NOT EXISTS status_berkas TEXT DEFAULT 'diproses';
ALTER TABLE public.riwayat_perjadin ADD COLUMN IF NOT EXISTS csv_data TEXT;
ALTER TABLE public.riwayat_perjadin ADD COLUMN IF NOT EXISTS total_biaya NUMERIC DEFAULT 0;
ALTER TABLE public.riwayat_perjadin ADD COLUMN IF NOT EXISTS tgl_berangkat TEXT;
ALTER TABLE public.riwayat_perjadin ADD COLUMN IF NOT EXISTS tgl_kembali TEXT;
ALTER TABLE public.riwayat_perjadin ADD COLUMN IF NOT EXISTS payload_json JSONB;

-- Pastikan izin SELECT, INSERT & UPDATE tabel riwayat_perjadin terbuka untuk integrasi otomatis
DROP POLICY IF EXISTS "Pengguna dapat melihat riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Semua pengguna login dapat melihat riwayat" ON public.riwayat_perjadin;
CREATE POLICY "Pengguna dapat melihat riwayat" ON public.riwayat_perjadin FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Pengguna dapat menambah riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Hanya Admin yang dapat menambah riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Admin dan Operator dapat menambah riwayat" ON public.riwayat_perjadin;
CREATE POLICY "Pengguna dapat menambah riwayat" ON public.riwayat_perjadin FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Pengguna dapat memperbarui riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Hanya Admin yang dapat memperbarui riwayat" ON public.riwayat_perjadin;
DROP POLICY IF EXISTS "Admin dan Operator dapat memperbarui riwayat" ON public.riwayat_perjadin;
CREATE POLICY "Pengguna dapat memperbarui riwayat" ON public.riwayat_perjadin FOR UPDATE TO authenticated, anon USING (true);`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(sql).then(() => {
      if (btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span>✅ Berhasil Disalin!</span>';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
      }
      if (typeof showRefreshToast === 'function') {
        showRefreshToast('Perintah SQL Disalin', 'Tempelkan ke SQL Editor Supabase Anda lalu klik Run.');
      }
    });
  } else {
    prompt('Salin query SQL berikut:', sql);
  }
}

async function loadUserManagementList() {
  const container = document.getElementById('userMgmtList');
  const alertEl = document.getElementById('userMgmtAlert');
  if (!container) return;

  if (alertEl) alertEl.style.display = 'none';
  container.innerHTML = `
    <div class="user-mgmt-loading">
      <div class="user-mgmt-spinner"></div>
      <span>Memuat data pengguna dari cloud...</span>
    </div>
  `;

  const client = getSupabaseClient();
  if (!client) {
    container.innerHTML = '<div class="user-mgmt-empty">Supabase belum terhubung. Periksa konfigurasi API Key.</div>';
    return;
  }

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    cachedUserProfiles = data || [];
    renderUserManagementRows(cachedUserProfiles);
    updateUserStats(cachedUserProfiles);
  } catch (err) {
    console.error('Gagal mengambil daftar pengguna:', err);
    const isPermErr = (err.message || '').includes('permission denied') || (err.message || '').includes('profiles');

    // Fallback elegan: Selalu tampilkan akun Admin aktif Anda agar UI tetap lengkap & tidak kosong
    const currentUser = getCurrentAuthUser();
    const fallbackUsers = currentUser ? [{
      id: currentUser.id,
      email: currentUser.email,
      nama_lengkap: currentUser.nama || 'Aqyun Rista Maulidin',
      role: currentUser.role || 'admin'
    }] : [];

    cachedUserProfiles = fallbackUsers;

    if (isPermErr) {
      container.innerHTML = `
        <div class="user-mgmt-perm-notice">
          <div class="perm-notice-icon">⚠️</div>
          <div class="perm-notice-content">
            <div class="perm-notice-title">Izin Tabel "profiles" Perlu Diaktifkan di Supabase</div>
            <p class="perm-notice-desc">
              Untuk menampilkan seluruh anggota tim yang mendaftar secara otomatis, silakan jalankan perintah SQL perbaikan hak akses di bawah ini pada menu <strong>SQL Editor</strong> Supabase Anda.
            </p>
            <button type="button" class="btn-copy-sql" onclick="copySchemaSqlToClipboard(this)">
              <svg class="ico" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M8 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6zM14 8h-6V2"/></svg>
              <span>Salin Perintah SQL Perbaikan</span>
            </button>
          </div>
        </div>
        <div class="user-mgmt-section-title">Akun Anda Yang Sedang Aktif:</div>
      `;
      const fallbackListWrap = document.createElement('div');
      fallbackListWrap.innerHTML = generateUserRowsHtml(fallbackUsers);
      container.appendChild(fallbackListWrap);
      updateUserStats(fallbackUsers);
      return;
    }

    container.innerHTML = `<div class="user-mgmt-empty text-danger">Gagal memuat pengguna: ${err.message}</div>`;
    updateUserStats(fallbackUsers);
  }
}

function escapeAttrSafe(str) {
  if (typeof escapeHtml === 'function') return escapeHtml(str);
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getRoleMeta(rawRole) {
  const r = String(rawRole || 'viewer').toLowerCase().trim();
  if (r === 'admin') {
    return {
      key: 'admin',
      label: 'ADMIN',
      fullName: 'ADMIN (Akses Penuh)',
      badgeClass: 'badge-role-admin',
      selectClass: 'select-role-admin'
    };
  }
  if (r === 'operator' || r === 'editor') {
    return {
      key: 'operator',
      label: 'OPERATOR',
      fullName: 'OPERATOR (Buat & Update Progres)',
      badgeClass: 'badge-role-operator',
      selectClass: 'select-role-operator'
    };
  }
  return {
    key: 'viewer',
    label: 'VIEWER',
    fullName: 'VIEWER (Hanya Dashboard)',
    badgeClass: 'badge-role-viewer',
    selectClass: 'select-role-viewer'
  };
}

function applyUserRowRoleVisual(userId, roleValue, selectEl) {
  const meta = getRoleMeta(roleValue);
  const safeId = (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') ? CSS.escape(String(userId)) : String(userId);
  const rowEl = document.querySelector(`.user-mgmt-row[data-user-id="${safeId}"]`);
  if (rowEl) {
    const roleWrap = rowEl.querySelector('.user-mgmt-role-wrap');
    if (roleWrap) {
      roleWrap.innerHTML = `<span class="${meta.badgeClass}">${meta.label}</span>`;
    }
    const sel = selectEl || rowEl.querySelector('.user-role-select');
    if (sel) {
      sel.value = meta.key;
      sel.classList.remove('select-role-admin', 'select-role-operator', 'select-role-viewer');
      sel.classList.add(meta.selectClass);
    }
  } else if (selectEl) {
    selectEl.value = meta.key;
    selectEl.classList.remove('select-role-admin', 'select-role-operator', 'select-role-viewer');
    selectEl.classList.add(meta.selectClass);
  }
}

function filterUserManagementList() {
  const q = String(document.getElementById('userMgmtSearch')?.value || '').trim().toLowerCase();
  const container = document.getElementById('userMgmtList');
  if (!container) return;
  if (!q) {
    renderUserManagementRows(cachedUserProfiles);
    return;
  }
  const filtered = cachedUserProfiles.filter(u => {
    return (u.nama_lengkap || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });
  container.innerHTML = generateUserRowsHtml(filtered);
  updateUserStats(cachedUserProfiles);
}

function generateUserRowsHtml(users) {
  if (!users || users.length === 0) {
    return '<div class="user-mgmt-empty">Tidak ada pengguna yang cocok dengan pencarian.</div>';
  }

  const currentUser = getCurrentAuthUser();

  return users.map(u => {
    const isRootAdmin = ['aqyunrm@gmail.com', 'aqyun.maulidin@pkp.go.id'].includes((u.email || '').toLowerCase());
    const isSelf = currentUser && (currentUser.id === u.id || (currentUser.email && currentUser.email.toLowerCase() === (u.email || '').toLowerCase()));
    const roleMeta = getRoleMeta(u.role);
    const role = roleMeta.key;
    const isAdm = role === 'admin';
    const isOperator = role === 'operator';
    const roleBadge = `<span class="${roleMeta.badgeClass}">${roleMeta.label}</span>`;

    const rawName = u.nama_lengkap || u.email || 'Pengguna';
    const safeName = escapeAttrSafe(rawName);
    const safeEmail = escapeAttrSafe(u.email || '-');
    const safeId = escapeAttrSafe(u.id);
    const initials = rawName.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';

    let actionBtnHtml = '';
    if (isRootAdmin) {
      actionBtnHtml = '<span class="user-mgmt-protected" title="Admin Utama PerdinKu (Hak Akses Penuh Permanen)">👑 Admin Utama</span>';
    } else if (isSelf) {
      actionBtnHtml = '<span class="badge-self-pill" title="Akun Anda yang sedang aktif">Akun Anda</span>';
    } else {
      actionBtnHtml = `
        <select class="user-role-select ${roleMeta.selectClass}"
                data-user-id="${safeId}"
                data-user-email="${escapeAttrSafe(u.email || '')}"
                onchange="updateUserRole(this.dataset.userId, this.dataset.userEmail, this.value, this)"
                title="Ubah peran pengguna">
          <option value="viewer" ${role === 'viewer' ? 'selected' : ''}>Viewer (Hanya Dashboard)</option>
          <option value="operator" ${isOperator ? 'selected' : ''}>Operator (Buat &amp; Update Progres)</option>
          <option value="admin" ${isAdm ? 'selected' : ''}>Admin (Akses Penuh)</option>
        </select>
      `;
    }

    return `
      <div class="user-mgmt-row" data-user-id="${safeId}">
        <div class="user-mgmt-avatar" title="${safeName}">${initials}</div>
        <div class="user-mgmt-info">
          <div class="user-mgmt-name-wrap">
            <strong class="user-mgmt-name">${safeName}</strong>
            ${isSelf ? '<span class="badge-self-pill">Anda</span>' : ''}
          </div>
          <span class="user-mgmt-email">${safeEmail}</span>
        </div>
        <div class="user-mgmt-role-wrap">
          ${roleBadge}
        </div>
        <div class="user-mgmt-action-wrap">
          ${actionBtnHtml}
        </div>
      </div>
    `;
  }).join('');
}

function renderUserManagementRows(users) {
  const container = document.getElementById('userMgmtList');
  if (!container) return;
  container.innerHTML = generateUserRowsHtml(users);
  updateUserStats(cachedUserProfiles.length ? cachedUserProfiles : users);
}

async function updateUserRole(userId, userEmail, newRole, selectEl) {
  const client = getSupabaseClient();
  if (!client || !isCurrentUserAdmin()) {
    alert('Hanya Admin yang berhak mengubah peran pengguna.');
    filterUserManagementList();
    return;
  }

  const targetMeta = getRoleMeta(newRole);
  const targetRole = targetMeta.key;
  const targetUser = cachedUserProfiles.find(u => String(u.id) === String(userId));
  const previousRole = targetUser ? getRoleMeta(targetUser.role).key : 'viewer';

  // Auto-update instan di UI (nama badge, warna badge, warna dropdown, dan counter statistik)
  if (targetUser) targetUser.role = targetRole;
  applyUserRowRoleVisual(userId, targetRole, selectEl);
  updateUserStats(cachedUserProfiles);

  const alertEl = document.getElementById('userMgmtAlert');
  if (alertEl) {
    alertEl.style.display = 'none';
    alertEl.innerHTML = '';
  }

  if (selectEl) selectEl.disabled = true;

  try {
    let updateSuccess = false;
    let verifiedRow = null;
    let lastErrMsg = '';

    // Cara 1: Update langsung ke tabel profiles dengan .select() untuk memverifikasi baris benar-benar berubah di DB
    try {
      const { data, error } = await client
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', userId)
        .select();

      if (!error && Array.isArray(data) && data.length > 0 && getRoleMeta(data[0].role).key === targetRole) {
        updateSuccess = true;
        verifiedRow = data[0];
      } else if (error) {
        lastErrMsg = error.message;
      } else {
        lastErrMsg = 'Update langsung ditolak kebijakan RLS Supabase (0 baris berubah).';
      }
    } catch (e1) {
      lastErrMsg = e1.message;
    }

    // Cara 2: Jika Cara 1 diblokir RLS, panggil RPC admin_set_user_role (Security Definer)
    if (!updateSuccess) {
      try {
        const { data: rpcRes, error: rpcErr } = await client.rpc('admin_set_user_role', {
          target_user_id: userId,
          new_role: targetRole
        });
        if (!rpcErr && rpcRes && rpcRes.success && getRoleMeta(rpcRes.role).key === targetRole) {
          updateSuccess = true;
          verifiedRow = { ...(targetUser || {}), id: userId, role: rpcRes.role };
        } else if (rpcErr) {
          lastErrMsg = rpcErr.message || lastErrMsg;
        }
      } catch (e2) {
        lastErrMsg = e2.message || lastErrMsg;
      }
    }

    if (!updateSuccess) {
      throw new Error(lastErrMsg || 'Izin RLS / fungsi admin_set_user_role di Supabase belum diaktifkan.');
    }

    // Sinkronkan cache lokal dengan hasil terverifikasi dari database
    if (verifiedRow) {
      const idx = cachedUserProfiles.findIndex(u => String(u.id) === String(userId));
      if (idx !== -1) {
        cachedUserProfiles[idx] = { ...cachedUserProfiles[idx], ...verifiedRow, role: targetRole };
      }
    }

    applyUserRowRoleVisual(userId, targetRole, selectEl);
    updateUserStats(cachedUserProfiles);

    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Hak Akses Diperbarui di Database', `Peran untuk ${userEmail} berhasil disimpan sebagai [${targetMeta.fullName}].`);
    }

    // Jika yang diubah adalah akun pengguna yang sedang login saat ini, perbarui status aktifnya
    if (currentAuthUser && String(currentAuthUser.id) === String(userId)) {
      currentAuthUser.role = targetRole;
      if (typeof applyRolePermissions === 'function') applyRolePermissions();
      if (typeof renderAuthWidget === 'function') renderAuthWidget();
    }
  } catch (err) {
    console.error('Gagal memperbarui peran:', err);
    // Kembalikan state & visual ke role sebelumnya di database agar UI selalu jujur
    if (targetUser) targetUser.role = previousRole;
    applyUserRowRoleVisual(userId, previousRole, selectEl);
    updateUserStats(cachedUserProfiles);

    const safeErrMsg = escapeAttrSafe(err.message || 'Gagal memperbarui peran di database.');
    if (alertEl) {
      showAuthAlert(alertEl, 'error', `
        <div style="display:flex;flex-direction:column;gap:8px;">
          <span><strong>Gagal menyimpan ke Supabase:</strong> ${safeErrMsg}</span>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:12px;">Jika belum pernah dijalankan, salin lalu jalankan query SQL perbaikan di <strong>SQL Editor</strong> Supabase:</span>
            <button type="button" class="btn-copy-sql" onclick="copySchemaSqlToClipboard(this)">
              <span>Salin Perintah SQL Perbaikan</span>
            </button>
          </div>
        </div>
      `);
    } else {
      alert(`Gagal mengubah peran: ${err.message}`);
    }
  } finally {
    if (selectEl) selectEl.disabled = false;
  }
}

// Modal Konfigurasi Supabase URL & Anon Key (Khusus Admin)
function openSbConfigModal() {
  if (typeof isCurrentUserAdmin === 'function' && !isCurrentUserAdmin() && currentAuthUser) {
    alert('Akses Ditolak: Fitur Pengaturan Supabase hanya dapat diakses oleh Administrator.');
    return;
  }
  const overlay = document.getElementById('sbConfigOverlay');
  if (!overlay) return;
  const cfg = getSupabaseConfig();
  const urlInp = document.getElementById('sbCfgUrl');
  const anonInp = document.getElementById('sbCfgAnon');
  if (urlInp) urlInp.value = cfg.url;
  if (anonInp) anonInp.value = cfg.anonKey;
  overlay.classList.add('is-open');
}

function closeSbConfigModal() {
  const overlay = document.getElementById('sbConfigOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function handleSbConfigBackdrop(event) {
  if (event.target.id === 'sbConfigOverlay') {
    closeSbConfigModal();
  }
}

function saveSbConfig(e) {
  if (e) e.preventDefault();
  if (typeof isCurrentUserAdmin === 'function' && !isCurrentUserAdmin() && currentAuthUser) {
    alert('Akses Ditolak: Hanya Administrator yang berhak mengubah konfigurasi database Supabase.');
    return;
  }
  const url = (document.getElementById('sbCfgUrl')?.value || '').trim();
  const anon = (document.getElementById('sbCfgAnon')?.value || '').trim();

  if (!url || !anon) {
    alert('Harap isi Project URL dan Anon Public Key dari dashboard Supabase Anda.');
    return;
  }

  if (anon.startsWith('sb_secret_')) {
    alert('Perhatian: Kunci yang Anda masukkan adalah Secret / Service Role Key (sb_secret_...).\n\nJangan gunakan Secret Key pada aplikasi browser karena akan ditolak. Harap gunakan Anon Public Key (diawali eyJhbGci... atau sb_publishable_...).');
    return;
  }

  localStorage.setItem(STORAGE_KEY_SB_URL, url);
  localStorage.setItem(STORAGE_KEY_SB_ANON, anon);

  // Reset client agar instance baru dibuat
  sbClient = null;
  setCurrentAuthUser(null);

  closeSbConfigModal();
  initSupabaseAuth();

  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Konfigurasi Disimpan', 'Koneksi ke Supabase berhasil diperbarui. Silakan login.');
  }
  setTimeout(() => openAuthModal('login'), 400);
}

function resetSbConfigToDefault() {
  if (typeof isCurrentUserAdmin === 'function' && !isCurrentUserAdmin() && currentAuthUser) {
    alert('Akses Ditolak: Hanya Administrator yang berhak mereset konfigurasi database Supabase.');
    return;
  }
  localStorage.removeItem(STORAGE_KEY_SB_URL);
  localStorage.removeItem(STORAGE_KEY_SB_ANON);
  const urlInp = document.getElementById('sbCfgUrl');
  const anonInp = document.getElementById('sbCfgAnon');
  if (urlInp) urlInp.value = DEFAULT_SUPABASE_URL;
  if (anonInp) anonInp.value = DEFAULT_SUPABASE_ANON_KEY;
  sbClient = null;
  setCurrentAuthUser(null);
  initSupabaseAuth();
  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Reset Berhasil', 'Konfigurasi URL dan Anon Key bawaan resmi PerdinKu telah dipulihkan.');
  }
}

// Inisialisasi otomatis setelah halaman siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSupabaseAuth();
  });
} else {
  initSupabaseAuth();
}

// Export fungsi ke window scope
window.initSupabaseAuth = initSupabaseAuth;
window.getSupabaseClient = getSupabaseClient;
window.isCurrentUserAdmin = isCurrentUserAdmin;
window.isCurrentUserRoleKhusus = isCurrentUserRoleKhusus;
window.canCurrentUserEdit = canCurrentUserEdit;
window.getCurrentAuthUser = getCurrentAuthUser;
window.setCurrentAuthUser = setCurrentAuthUser;
window.renderAuthWidget = renderAuthWidget;
window.toggleUserDropdown = toggleUserDropdown;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleAuthLogin = handleAuthLogin;
window.handleAuthSignUp = handleAuthSignUp;
window.authLogout = authLogout;
window.syncTripsFromCloud = syncTripsFromCloud;
window.uploadTripToCloud = uploadTripToCloud;
window.removeTripFromCloud = removeTripFromCloud;
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  if (btnEl) {
    btnEl.classList.toggle('is-visible', isPass);
    btnEl.title = isPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi';
    const useEl = btnEl.querySelector('use');
    if (useEl) {
      useEl.setAttribute('href', isPass ? '#i-eye-off' : '#i-eye');
    }
  }
}

window.togglePasswordVisibility = togglePasswordVisibility;
window.openSbConfigModal = openSbConfigModal;
window.closeSbConfigModal = closeSbConfigModal;
window.saveSbConfig = saveSbConfig;
window.resetSbConfigToDefault = resetSbConfigToDefault;
window.handleAuthForgotPassword = handleAuthForgotPassword;
async function resendVerificationLink(email) {
  if (!email) return;
  const client = getSupabaseClient();
  try {
    if (client && client.auth && typeof client.auth.resendVerificationEmail === 'function') {
      const res = await client.auth.resendVerificationEmail(email);
      if (res && res.error) {
        if (typeof showRefreshToast === 'function') showRefreshToast('Gagal Mengirim', res.error.message || 'Silakan coba lagi nanti.');
        return;
      }
    }
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Email Terkirim', `Tautan verifikasi baru telah dikirim ke ${email}.`);
    }
  } catch (e) {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Gagal Mengirim', 'Silakan coba beberapa saat lagi.');
    }
  }
}

window.resendVerificationLink = resendVerificationLink;
window.openUpdatePasswordModal = openUpdatePasswordModal;
window.closeUpdatePasswordModal = closeUpdatePasswordModal;
window.handleAuthUpdatePassword = handleAuthUpdatePassword;
window.openUserManagementModal = openUserManagementModal;
window.closeUserManagementModal = closeUserManagementModal;
window.closeUserMgmtModal = closeUserMgmtModal;
window.copySchemaSqlToClipboard = copySchemaSqlToClipboard;
window.handleUserMgmtBackdrop = handleUserMgmtBackdrop;
window.loadUserManagementList = loadUserManagementList;
window.filterUserManagementList = filterUserManagementList;
window.updateUserRole = updateUserRole;
window.lockAuthGate = lockAuthGate;
window.unlockAuthGate = unlockAuthGate;
window.switchGateTab = switchGateTab;
window.handleGateLogin = handleGateLogin;
window.handleGateSignUp = handleGateSignUp;
window.handleGateForgotPassword = handleGateForgotPassword;
