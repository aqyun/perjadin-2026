// Uji lapisan penghubung terhadap PocketBase lokal (instance uji, bukan server kantor)
const path = require('path');
const BASE = process.env.PB_TEST_URL || 'http://127.0.0.1:8099';
const REPO = process.argv[2] || path.join(__dirname, '..');

// lingkungan "browser" minimal
const store = {};
global.window = {
  location: { origin: BASE, hash: '', pathname: '/' },
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  }
};
global.localStorage = global.window.localStorage;
global.document = undefined;
// UMD SDK memasang PocketBase ke module.exports / global
const sdk = require(path.join(REPO, 'vendor', 'pocketbase.umd.js'));
window.PocketBase = sdk.default || sdk.PocketBase || sdk;
require(path.join(REPO, 'js', '01-shim', '01-pocketbase-shim.js'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  OK   ' + name); }
  else { fail++; console.log('  GAGAL ' + name + (extra ? '  -> ' + JSON.stringify(extra) : '')); }
}

async function suToken() {
  const r = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tmp@test.local', password: 'TmpTest-9f3k2x' })
  });
  return (await r.json()).token;
}
async function setRole(userId, role) {
  const t = await suToken();
  const r = await fetch(BASE + '/api/collections/users/records/' + userId, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: t },
    body: JSON.stringify({ role })
  });
  return r.ok;
}

(async () => {
  const c = window.supabase.createClient(BASE, 'x');
  const email = 'budi.test@example.com';
  const pw = 'rahasia1';

  console.log('1. Daftar dan login');
  let r = await c.auth.signUp({ email, password: pw, options: { data: { full_name: 'Budi Uji', role: 'admin' } } });
  check('signUp berhasil tanpa auto-login (session = null)', !r.error && r.data.session === null && r.data.user, r.error);
  check('belum ada sesi aktif setelah signUp', (await c.auth.getSession()).data.session === null);
  check('peran awal = viewer (role admin dari klien diabaikan)', r.data && r.data.user && r.data.user.user_metadata.role === 'viewer', r.data && r.data.user);
  const uid = r.data.user.id;
  const t1 = await suToken();
  const createdUser = await (await fetch(BASE + '/api/collections/users/records/' + uid, { headers: { Authorization: t1 } })).json();
  check('akun baru otomatis berstatus verified di server', createdUser && createdUser.verified === true, createdUser);
  r = await c.auth.signUp({ email, password: pw, options: { data: { full_name: 'Dobel' } } });
  check('daftar email yang sama ditolak (pesan memuat "already")', r.error && /already/i.test(r.error.message), r.error);
  r = await c.auth.signInWithPassword({ email, password: 'salah-salah' });
  check('login sandi salah -> "Invalid login credentials"', r.error && r.error.message === 'Invalid login credentials', r.error);
  r = await c.auth.signInWithPassword({ email, password: pw });
  check('login benar setelah daftar', !r.error && r.data.session, r.error);

  console.log('2. Peran viewer');
  let g = await c.auth.getSession();
  check('getSession mengembalikan pengguna', g.data.session && g.data.session.user.email === email);
  const row = {
    nomor_st: 'ST-001/2026', tujuan: 'Bandung', agenda: 'Rapat koordinasi', tgl_berangkat: '2026-12-01', tgl_kembali: null,
    total_biaya: 1500000, status_berkas: 'diproses', csv_data: 'x'.repeat(12000),
    payload_json: { id: 'trip_abc', noST: 'ST-001/2026', employees: [{ nama: 'A' }, { nama: 'B' }] },
    created_by: uid, updated_at: new Date().toISOString()
  };
  r = await c.from('riwayat_perjadin').insert(row).select('id');
  check('viewer TIDAK boleh menyimpan berkas', !!r.error, r);
  r = await c.from('profiles').update({ role: 'admin' }).eq('id', uid).select();
  check('viewer TIDAK boleh menaikkan peran sendiri', !!r.error || !r.data || r.data.length === 0, r);

  console.log('3. Peran operator');
  check('(server) naikkan ke operator', await setRole(uid, 'operator'));
  g = await c.auth.getSession(); // authRefresh -> peran baru
  r = await c.from('profiles').select('nama_lengkap, role').eq('id', uid).maybeSingle();
  check('profil: nama_lengkap + role operator terbaca', r.data && r.data.nama_lengkap === 'Budi Uji' && r.data.role === 'operator', r);
  r = await c.from('riwayat_perjadin').insert(row).select('id');
  check('operator boleh simpan berkas (kembali id)', !r.error && Array.isArray(r.data) && r.data[0] && r.data[0].id, r);
  const cloudId = r.data && r.data[0] && r.data[0].id;
  r = await c.from('riwayat_perjadin').select('*').order('created_at', { ascending: false });
  const got = r.data && r.data[0];
  check('tarik semua berkas', !r.error && r.data.length === 1, r.error);
  check('payload_json kembali sebagai objek', got && got.payload_json && got.payload_json.id === 'trip_abc' && got.payload_json.employees.length === 2, got && got.payload_json);
  check('csv_data panjang (12000) utuh', got && got.csv_data.length === 12000);
  check('tgl_kembali null aman, total_biaya angka', got && got.tgl_kembali === '' || got && got.tgl_kembali === null, got && got.tgl_kembali);
  check('created_at berformat ISO (T)', got && /T/.test(got.created_at), got && got.created_at);
  r = await c.from('riwayat_perjadin').update({ ...row, agenda: 'Agenda revisi' }).eq('id', cloudId).select('id');
  check('update lewat id kembali baris', !r.error && r.data && r.data[0] && r.data[0].id === cloudId, r);
  r = await c.from('riwayat_perjadin').select('id, payload_json').eq('nomor_st', 'ST-001/2026').order('created_at', { ascending: true });
  check('cari by nomor_st', !r.error && r.data.length === 1, r.error);
  r = await c.from('riwayat_perjadin').select('id').contains('payload_json', { id: 'trip_abc' }).limit(1);
  check('cari lewat payload_json.id (contains)', !r.error && r.data && r.data.length === 1, r);
  r = await c.from('riwayat_perjadin').delete().eq('id', cloudId);
  check('operator TIDAK boleh menghapus', !!r.error, r);
  r = await c.rpc('admin_set_user_role', { target_user_id: uid, new_role: 'admin' });
  check('operator TIDAK boleh memakai admin_set_user_role', !!r.error, r);

  console.log('4. Peran admin');
  check('(server) naikkan ke admin', await setRole(uid, 'admin'));
  await c.auth.getSession();
  r = await c.from('profiles').select('*').order('created_at', { ascending: true });
  check('admin melihat daftar pengguna (email terlihat)', !r.error && r.data.length >= 1 && r.data[0].email === email, r);
  r = await c.from('profiles').select('id').ilike('email', 'BUDI.test@example.com').maybeSingle();
  check('cek email terdaftar (tidak peka huruf besar/kecil)', r.data && r.data.id === uid, r);
  r = await c.rpc('admin_set_user_role', { target_user_id: uid, new_role: 'viewer' });
  check('admin boleh admin_set_user_role', !r.error && r.data && r.data.success && r.data.role === 'viewer', r);
  r = await c.from('profiles').update({ role: 'admin' }).eq('id', uid).select();
  check('setelah diturunkan jadi viewer, tak bisa naik lagi sendiri', !!r.error || !r.data || r.data.length === 0, r);
  check('(server) kembalikan ke admin', await setRole(uid, 'admin'));
  await c.auth.getSession();
  r = await c.from('riwayat_perjadin').delete().eq('id', cloudId);
  check('admin boleh menghapus', !r.error, r);
  r = await c.from('riwayat_perjadin').select('*');
  check('berkas terhapus', !r.error && r.data.length === 0, r);

  console.log('5. Tanpa login (tamu)');
  await c.auth.signOut();
  r = await c.from('riwayat_perjadin').select('*');
  check('tamu tidak melihat satu pun berkas', !r.error && Array.isArray(r.data) && r.data.length === 0, r);
  r = await c.from('riwayat_perjadin').insert(row).select('id');
  check('tamu TIDAK boleh menyimpan', !!r.error, r);
  g = await c.auth.getSession();
  check('getSession tamu = null', g.data.session === null);

  console.log('6. Akun baru menunggu persetujuan');
  const t2 = await suToken();
  const seed = await fetch(BASE + '/api/collections/riwayat_perjadin/records', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t2 },
    body: JSON.stringify({ nomor_st: 'ST-9/2026', payload_json: { id: 'seed1' } })
  });
  check('(server) siapkan 1 berkas contoh', seed.ok);
  const c2 = window.supabase.createClient(BASE, 'x');
  r = await c2.auth.signUp({ email: 'pending@example.com', password: 'rahasia1', options: { data: { full_name: 'Calon Pengguna' } } });
  check('daftar baru berhasil tanpa auto-login', !r.error && r.data.session === null && r.data.user, r.error);
  const uid2 = r.data.user.id;
  r = await c2.auth.signInWithPassword({ email: 'pending@example.com', password: 'rahasia1' });
  check('login akun baru berhasil dan dapat sesi', !r.error && r.data.session, r.error);
  r = await c2.from('riwayat_perjadin').select('*');
  check('akun menunggu TIDAK melihat berkas satu pun', !r.error && r.data.length === 0, r);
  r = await c2.from('profiles').select('*');
  check('akun menunggu hanya melihat profilnya sendiri', !r.error && r.data.length === 1 && r.data[0].id === uid2, r);
  r = await c2.from('riwayat_perjadin').insert(row).select('id');
  check('akun menunggu TIDAK boleh menyimpan', !!r.error, r);
  check('(server) beri peran viewer', await setRole(uid2, 'viewer'));
  await c2.auth.getSession();
  r = await c2.from('riwayat_perjadin').select('*');
  check('setelah diberi viewer: bisa baca berkas', !r.error && r.data.length === 1, r);
  r = await c2.from('riwayat_perjadin').insert(row).select('id');
  check('viewer tetap TIDAK boleh menyimpan', !!r.error, r);
  r = await c2.from('profiles').select('*');
  check('viewer melihat daftar pengguna', !r.error && r.data.length >= 2, r);

  console.log('7. Verifikasi email dihidupkan (PERDINKU_REQUIRE_EMAIL_VERIFICATION = true)');
  window.PERDINKU_REQUIRE_EMAIL_VERIFICATION = true;
  const c3 = window.supabase.createClient(BASE, 'x');
  r = await c3.auth.signUp({ email: 'verif@example.com', password: 'rahasia1', options: { data: { full_name: 'Perlu Verifikasi' } } });
  check('daftar tidak auto-login (tanpa sesi, tanpa error)', !r.error && r.data.session === null, r);
  const t3 = await suToken();
  const found = await (await fetch(BASE + "/api/collections/users/records?filter=" + encodeURIComponent("email='verif@example.com'"), { headers: { Authorization: t3 } })).json();
  const vid = found.items && found.items[0] && found.items[0].id;
  // Trigger auto-verify aktif selama SMTP belum dipakai; simulasi akun belum terverifikasi
  const unvr = await fetch(BASE + '/api/collections/users/records/' + vid, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: t3 }, body: JSON.stringify({ verified: false })
  });
  check('(server) setel verified=false untuk uji verifikasi', unvr.ok);
  r = await c3.auth.signInWithPassword({ email: 'verif@example.com', password: 'rahasia1' });
  check('login akun belum terverifikasi ditolak (isUnverified)', r.error && r.error.isUnverified === true, r);
  check('tidak ada sesi tersisa setelah ditolak', (await c3.auth.getSession()).data.session === null);
  const vr = await fetch(BASE + '/api/collections/users/records/' + vid, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: t3 }, body: JSON.stringify({ verified: true })
  });
  check('(server) tandai akun terverifikasi', vr.ok);
  r = await c3.auth.signInWithPassword({ email: 'verif@example.com', password: 'rahasia1' });
  check('setelah terverifikasi: login berhasil', !r.error && r.data.session, r.error);
  window.PERDINKU_REQUIRE_EMAIL_VERIFICATION = false;

  console.log('8. Koleksi khusus Berkas BBM (riwayat_bbm)');
  r = await c.auth.signInWithPassword({ email, password: pw });
  check('admin login kembali untuk uji riwayat_bbm', !r.error && r.data.session, r.error);
  const bbmRow = {
    bbm_uid: 'bbm_test_1', nomor_st: '395/ST/Sj.07/2026', kategori_kendaraan: 'pribadi',
    kendaraan: 'Mobil', plat_nomor: 'F 1550 ABZ', pelaksana_bukti: 'Refly Saprilaturyandi',
    pembuat_berkas: 'Yogi Andre', tgl_bukti: '2026-11-08', mak: '523121', nilai_total: 2723977,
    status_berkas: 'diproses', layak_pencairan: true,
    keterangan_pencairan: 'BBM Khusus Perorangan sebelum 1 Desember 2026',
    payload_json: { id: 'bbm_test_1', items: [{ tanggal: '2026-11-08', jumlah: 2723977 }] },
    created_by: uid
  };
  r = await c2.from('riwayat_bbm').insert(bbmRow).select('id');
  check('viewer TIDAK boleh menyimpan ke riwayat_bbm', !!r.error, r);
  r = await c.from('riwayat_bbm').insert(bbmRow).select('id');
  check('admin boleh menyimpan ke riwayat_bbm', !r.error && Array.isArray(r.data) && r.data[0] && r.data[0].id, r);
  const bbmCloudId = r.data && r.data[0] && r.data[0].id;
  r = await c2.from('riwayat_bbm').select('*');
  check('viewer dapat membaca riwayat_bbm', !r.error && Array.isArray(r.data) && r.data.length === 1 && r.data[0].bbm_uid === 'bbm_test_1', r);
  r = await c.from('riwayat_bbm').update({ status_berkas: 'dicairkan', layak_pencairan: true }).eq('id', bbmCloudId).select('id');
  check('admin dapat memperbarui status pencairan riwayat_bbm', !r.error && r.data && r.data[0] && r.data[0].id === bbmCloudId, r);
  r = await c.from('riwayat_bbm').delete().eq('id', bbmCloudId);
  check('admin dapat menghapus riwayat_bbm', !r.error, r);

  console.log('\nHasil: ' + pass + ' lulus, ' + fail + ' gagal');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
