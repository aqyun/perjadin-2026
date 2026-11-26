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

async function redirectAfterSignUp({
  client,
  session,
  email,
  signupAlertEl,
  signupFieldIds,
  switchTabFn,
  loginEmailId,
  loginPasswordId,
  loginAlertId
}) {
  // Pastikan tidak ada sesi aktif setelah pendaftaran: selalu arahkan ke halaman login dulu
  if (session && client && client.auth && typeof client.auth.signOut === 'function') {
    await client.auth.signOut();
  }
  const safeEmail = (typeof escapeAttrSafe === 'function') ? escapeAttrSafe(email) : email;
  const requireEmailVerify = window.PERDINKU_REQUIRE_EMAIL_VERIFICATION === true;

  if (requireEmailVerify) {
    showAuthAlert(signupAlertEl, 'success', `Pendaftaran berhasil! Tautan verifikasi telah dikirim ke <strong>${safeEmail}</strong>.<br>Silakan periksa <strong>kotak masuk</strong> (atau folder Spam) pada email Anda sebelum masuk.`);
  } else {
    showAuthAlert(signupAlertEl, 'success', `Pendaftaran berhasil! Akun <strong>${safeEmail}</strong> sudah terverifikasi. Mengalihkan ke halaman masuk...`);
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Pendaftaran Berhasil', 'Akun Anda sudah terverifikasi. Silakan masuk melalui halaman login.');
    }
  }

  (signupFieldIds || []).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  setTimeout(() => {
    if (signupAlertEl) signupAlertEl.style.display = 'none';
    if (typeof switchTabFn === 'function') switchTabFn('login');

    const loginEmail = document.getElementById(loginEmailId);
    if (loginEmail) loginEmail.value = email;

    const loginPassword = document.getElementById(loginPasswordId);
    if (loginPassword) {
      loginPassword.value = '';
      loginPassword.focus();
    }

    const loginAlert = document.getElementById(loginAlertId);
    if (loginAlert) {
      const loginMsg = requireEmailVerify
        ? `Akun berhasil dibuat untuk <strong>${safeEmail}</strong>. Silakan periksa <strong>kotak masuk</strong> (atau folder Spam) email Anda untuk konfirmasi sebelum masuk.`
        : `Akun <strong>${safeEmail}</strong> berhasil dibuat dan sudah berstatus <strong>Terverifikasi</strong>. Silakan masuk menggunakan kata sandi Anda.`;
      showAuthAlert(loginAlert, 'success', loginMsg);
    }
  }, requireEmailVerify ? 2200 : 1200);
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

    await redirectAfterSignUp({
      client,
      session: data?.session,
      email,
      signupAlertEl: alertEl,
      signupFieldIds: ['authSignupName', 'authSignupEmail', 'authSignupPassword'],
      switchTabFn: switchAuthTab,
      loginEmailId: 'authLoginEmail',
      loginPasswordId: 'authLoginPassword',
      loginAlertId: 'authLoginAlert'
    });
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

    if (alertEl) alertEl.style.display = 'none';
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

    await redirectAfterSignUp({
      client,
      session: data?.session,
      email,
      signupAlertEl: alertEl,
      signupFieldIds: ['gateSignupName', 'gateSignupEmail', 'gateSignupPassword'],
      switchTabFn: switchGateTab,
      loginEmailId: 'gateLoginEmail',
      loginPasswordId: 'gateLoginPassword',
      loginAlertId: 'gateLoginAlert'
    });
  } catch (err) {
    console.error('Sign up error:', err);
    showAuthAlert(alertEl, 'error', err.message || 'Gagal mendaftar akun.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>Daftar Akun Sekarang</span><svg class="ico"><use href="#i-plus"></use></svg>';
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

