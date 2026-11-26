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
