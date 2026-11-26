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

