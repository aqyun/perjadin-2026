// =====================================================================
// PERDINKU 2026 - LAPISAN PENGHUBUNG POCKETBASE
// Meniru bagian kecil dari antarmuka supabase-js (auth + from() + rpc())
// di atas PocketBase, supaya js/supabase.js tidak perlu ditulis ulang.
// Dimuat setelah pocketbase.umd.js dan sebelum js/supabase.js.
// =====================================================================
(function () {
  'use strict';

  const SAFE_COL = /^[a-zA-Z0-9_.]+$/;

  // Peta nama tabel Supabase lama -> koleksi PocketBase
  const TABLES = {
    profiles: {
      collection: 'users',
      colIn: { nama_lengkap: 'name', created_at: 'created', updated_at: 'updated' },
      rowOut: (r) => ({
        id: r.id,
        email: r.email || '',
        nama_lengkap: r.name || '',
        role: r.role || 'viewer',
        created_at: fixDate(r.created),
        updated_at: fixDate(r.updated)
      }),
      dataIn: (d) => {
        const o = {};
        if (d.nama_lengkap !== undefined) o.name = d.nama_lengkap;
        if (d.role !== undefined) o.role = d.role;
        return o;
      }
    },
    riwayat_perjadin: {
      collection: 'riwayat_perjadin',
      colIn: {},
      rowOut: (r) => {
        const o = { ...r };
        delete o.collectionId; delete o.collectionName;
        o.created_at = fixDate(o.created_at);
        o.updated_at = fixDate(o.updated_at);
        return o;
      },
      dataIn: (d) => {
        const o = { ...d };
        // diisi otomatis oleh server
        delete o.updated_at; delete o.created_at; delete o.id;
        // relasi harus berupa id pengguna yang valid atau kosong
        if (!o.created_by) delete o.created_by;
        return o;
      }
    }
  };

  // PocketBase memakai "2026-11-25 09:00:00.000Z"; Safari butuh format ISO
  function fixDate(s) {
    return (typeof s === 'string') ? s.replace(' ', 'T') : s;
  }

  function errOut(e) {
    const status = (e && e.status) || 0;
    let msg = (e && e.response && e.response.message) || (e && e.message) || 'Terjadi kesalahan';
    const data = e && e.response && e.response.data;
    if (data && typeof data === 'object') {
      const first = Object.values(data)[0];
      if (first && first.message) msg = first.message;
    }
    return { message: msg, status, code: (e && e.response && e.response.code) || status };
  }

  function makeClient(baseUrl) {
    let targetUrl = baseUrl;
    if (!targetUrl || targetUrl.includes('supabase.co')) {
      targetUrl = (typeof window !== 'undefined' && window.location.hostname.includes('thearchiver.my.id'))
        ? window.location.origin
        : 'https://perdinku.thearchiver.my.id';
    }
    const pb = new window.PocketBase(targetUrl);
    pb.autoCancellation(false); // aplikasi sering memanggil paralel

    const listeners = [];
    let recoveryToken = null;

    function userOut(r) {
      if (!r) return null;
      return {
        id: r.id,
        email: r.email,
        user_metadata: { full_name: r.name || '', role: r.role || 'viewer' },
        identities: [{}]
      };
    }
    function sessionOut() {
      if (!pb.authStore.isValid || !pb.authStore.record) return null;
      return { user: userOut(pb.authStore.record), access_token: pb.authStore.token };
    }
    function emit(event, session) {
      listeners.slice().forEach((cb) => {
        try { cb(event, session); } catch (e) { console.warn('auth listener error', e); }
      });
    }

    // Akun baru belum punya peran: aktif tetapi menunggu admin memberi hak akses
    let pendingShown = false;
    function notifyPending() {
      const r = pb.authStore.record;
      if (!r || r.role || pendingShown) return;
      pendingShown = true;
      setTimeout(() => {
        if (typeof window.showRefreshToast === 'function') {
          window.showRefreshToast('Menunggu persetujuan admin', 'Akun Anda sudah aktif, tetapi belum diberi hak akses. Hubungi admin agar dibukakan akses.');
        }
      }, 1500);
    }

    // Tautan reset kata sandi dari email: #type=recovery&token=XXXX
    try {
      const h = new URLSearchParams((window.location.hash || '').replace(/^#\??/, ''));
      if (h.get('type') === 'recovery' && h.get('token')) recoveryToken = h.get('token');
    } catch (e) { /* abaikan */ }

    function jwtEmail(tok) {
      try {
        const p = JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return p.email || null;
      } catch (e) { return null; }
    }

    const auth = {
      async getSession() {
        if (pb.authStore.isValid) {
          try { await pb.collection('users').authRefresh(); } catch (e) {
            if (e && (e.status === 401 || e.status === 403 || e.status === 404)) pb.authStore.clear();
          }
        }
        notifyPending();
        return { data: { session: sessionOut() }, error: null };
      },
      onAuthStateChange(cb) {
        listeners.push(cb);
        setTimeout(() => {
          cb('INITIAL_SESSION', sessionOut());
          if (recoveryToken) cb('PASSWORD_RECOVERY', null);
        }, 0);
        return { data: { subscription: { unsubscribe() {
          const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1);
        } } } };
      },
      async signInWithPassword({ email, password }) {
        try {
          await pb.collection('users').authWithPassword(email, password);
          const session = sessionOut();
          notifyPending();
          emit('SIGNED_IN', session);
          return { data: { user: session.user, session }, error: null };
        } catch (e) {
          const status = e && e.status;
          return {
            data: { user: null, session: null },
            error: { message: (status === 400 || status === 401) ? 'Invalid login credentials' : errOut(e).message, status }
          };
        }
      },
      async signUp({ email, password, options }) {
        const full = (options && options.data && options.data.full_name) || '';
        try {
          // role sengaja tidak dikirim: akun baru menunggu admin memberi peran
          await pb.collection('users').create({
            email, password, passwordConfirm: password, name: full, emailVisibility: true
          });
        } catch (e) {
          const d = e && e.response && e.response.data;
          if (d && d.email) {
            return { data: { user: null, session: null }, error: { message: 'User already registered', status: 422, code: 'user_already_exists' } };
          }
          return { data: { user: null, session: null }, error: errOut(e) };
        }
        const res = await auth.signInWithPassword({ email, password });
        if (res.error) return { data: { user: null, session: null }, error: res.error };
        return { data: res.data, error: null };
      },
      async signOut() {
        pb.authStore.clear();
        pendingShown = false;
        emit('SIGNED_OUT', null);
        return { error: null };
      },
      async resetPasswordForEmail(email) {
        try {
          await pb.collection('users').requestPasswordReset(email);
          return { data: {}, error: null };
        } catch (e) {
          return { data: null, error: errOut(e) };
        }
      },
      async updateUser({ password }) {
        if (recoveryToken) {
          try {
            const email = jwtEmail(recoveryToken);
            await pb.collection('users').confirmPasswordReset(recoveryToken, password, password);
            recoveryToken = null;
            if (email) {
              const r = await auth.signInWithPassword({ email, password });
              if (r.error) return { data: null, error: r.error };
              return { data: { user: r.data.user }, error: null };
            }
            return { data: { user: null }, error: null };
          } catch (e) {
            return { data: null, error: errOut(e) };
          }
        }
        return { data: null, error: { message: 'Ubah kata sandi saat sudah login belum tersedia. Gunakan "Lupa Kata Sandi".' } };
      }
    };

    // ---- Query builder gaya supabase-js ----
    class Query {
      constructor(table) {
        this.tbl = TABLES[table];
        this.tblName = table;
        this.op = 'select';
        this.filters = [];
        this.sortBy = null;
        this.max = null;
        this.body = null;
        this.wantRows = false;
        this.mode = 'many'; // many | single | maybe
      }
      col(c) {
        if (!SAFE_COL.test(c)) throw new Error('Nama kolom tidak valid: ' + c);
        return this.tbl.colIn[c] || c;
      }
      select() { if (this.op !== 'select') this.wantRows = true; return this; }
      eq(c, v) { this.filters.push([this.col(c), '=', v]); return this; }
      // ilike dipakai untuk cek email: dibandingkan persis, tapi tak peka huruf besar/kecil
      ilike(c, v) { this.filters.push([this.col(c) + ':lower', '=', String(v).toLowerCase()]); return this; }
      contains(c, obj) {
        const base = this.col(c);
        Object.keys(obj || {}).forEach((k) => {
          if (!SAFE_COL.test(k)) throw new Error('Kunci JSON tidak valid');
          this.filters.push([base + '.' + k, '=', obj[k]]);
        });
        return this;
      }
      order(c, o) { this.sortBy = ((o && o.ascending === false) ? '-' : '') + this.col(c); return this; }
      limit(n) { this.max = n; return this; }
      maybeSingle() { this.mode = 'maybe'; return this; }
      single() { this.mode = 'single'; return this; }
      insert(d) { this.op = 'insert'; this.body = d; return this; }
      update(d) { this.op = 'update'; this.body = d; return this; }
      delete() { this.op = 'delete'; return this; }

      filterStr() {
        if (!this.filters.length) return { expr: '', params: {} };
        const params = {};
        const parts = this.filters.map((f, i) => { params['p' + i] = f[2]; return f[0] + ' ' + f[1] + ' {:p' + i + '}'; });
        return { expr: pb.filter(parts.join(' && '), params) };
      }
      shape(rows) {
        const out = rows.map((r) => this.tbl.rowOut(r));
        if (this.mode === 'many') return out;
        if (out.length === 0) {
          if (this.mode === 'single') throw Object.assign(new Error('JSON object requested, multiple (or no) rows returned'), { status: 406 });
          return null;
        }
        return out[0];
      }
      async run() {
        const coll = pb.collection(this.tbl.collection);
        const { expr } = this.filterStr();
        if (this.op === 'select') {
          const opts = { filter: expr, sort: this.sortBy || undefined };
          let rows;
          if (this.mode !== 'many' || this.max) {
            const res = await coll.getList(1, this.max || 1, opts);
            rows = res.items;
          } else {
            rows = await coll.getFullList({ ...opts, batch: 200 });
          }
          return this.shape(rows);
        }
        if (this.op === 'insert') {
          const rec = await coll.create(this.tbl.dataIn(this.body));
          return this.wantRows ? [this.tbl.rowOut(rec)] : null;
        }
        // update / delete: cari baris target dulu
        const idf = this.filters.find((f) => f[0] === 'id' && f[1] === '=');
        let ids;
        if (idf && this.filters.length === 1) ids = [idf[2]];
        else ids = (await coll.getFullList({ filter: expr, fields: 'id', batch: 200 })).map((r) => r.id);
        const out = [];
        for (const id of ids) {
          if (this.op === 'update') {
            const rec = await coll.update(id, this.tbl.dataIn(this.body));
            out.push(this.tbl.rowOut(rec));
          } else {
            await coll.delete(id);
          }
        }
        return this.op === 'update' && this.wantRows ? out : null;
      }
      then(resolve, reject) {
        return this.run().then(
          (data) => ({ data, error: null }),
          (e) => ({ data: null, error: errOut(e) })
        ).then(resolve, reject);
      }
    }

    return {
      auth,
      from(table) {
        if (!TABLES[table]) throw new Error('Tabel tidak dikenal: ' + table);
        return new Query(table);
      },
      async rpc(name, args) {
        if (name === 'admin_set_user_role') {
          try {
            const rec = await pb.collection('users').update(args.target_user_id, { role: args.new_role });
            return { data: { success: true, id: rec.id, email: rec.email, role: rec.role }, error: null };
          } catch (e) {
            return { data: null, error: errOut(e) };
          }
        }
        return { data: null, error: { message: 'Fungsi tidak dikenal: ' + name } };
      },
      _pb: pb
    };
  }

  // js/supabase.js memanggil window.supabase.createClient(url, key, opts)
  window.supabase = {
    createClient(url) { return makeClient(url || window.location.origin); }
  };
})();
