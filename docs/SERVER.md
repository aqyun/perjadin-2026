# PerdinKu di server kantor: cara kerja dan alur pengembangan

Aplikasi ini berjalan di server kantor, di belakang Cloudflare Tunnel:
**https://perdinku.thearchiver.my.id**. Backend-nya PocketBase (satu program, SQLite),
bukan Supabase lagi. Aplikasi, API (`/api/`), dan dashboard admin (`/_/`) ada di satu alamat.

## Gambaran singkat

```
browser ─► Cloudflare ─► tunnel ─► container perjadin-pb (PocketBase)
                                     ├─ menyajikan file web (index.html, js/, ...)
                                     ├─ /api/  : data dan login
                                     └─ /_/    : dashboard admin (hanya superuser kantor)
```

- `js/pb-shim.js` meniru bagian kecil antarmuka `supabase-js` (auth, `from()`, `rpc()`) di atas
  PocketBase, jadi `js/supabase.js` hampir tidak perlu diubah.
- Skema database dan aturan akses ada di **`pb_migrations/`** (bukan lagi `supabase_schema.sql`).

## Branch dan deploy otomatis

| Branch | Fungsi |
|---|---|
| `main` | Bebas untuk eksperimen. Dipakai GitHub Pages. |
| `server-kantor` | **Yang dipakai server kantor.** Tiap 5 menit server menariknya otomatis. |

Alur normal:

1. Kembangkan di `main` (atau branch lain), uji lokal (lihat bawah).
2. Kalau sudah siap dipakai kantor: `git checkout server-kantor`, `git merge main`, `git push`.
3. Dalam ±5 menit server memperbarui diri. Tidak perlu SSH.

Apa yang dilakukan server saat ada commit baru di `server-kantor`:

- Menyalin file web. **Tidak ada restart** kalau hanya file web yang berubah.
- Kalau ada file baru atau berubah di `pb_migrations/`: server menyimpan salinan data dulu,
  merestart PocketBase, lalu memeriksa `/api/health`.
- **Kalau tidak sehat, server otomatis kembali ke versi dan data sebelumnya** dan menandai
  commit itu gagal (tidak dicoba ulang sampai ada commit baru). Log ada di server
  (`/opt/perjadin/deploy.log`); minta pemilik server melihatnya bila perlu.
- Pengaman ini hanya menangkap kegagalan total (server tidak mau naik). Bug yang tampil di
  layar tidak terdeteksi, jadi tetap uji lokal sebelum merge ke `server-kantor`.

## Mengubah skema database atau aturan akses

Lewat **file migrasi**, jangan lewat dashboard `/_/`:

1. Buat file baru `pb_migrations/<angka lebih besar dari yang ada>_nama.js` (contoh: `1700000002_tambah_kolom.js`).
   Lihat dua file yang ada sebagai contoh bentuknya (`migrate((app) => {...}, (app) => {...})`).
2. Uji lokal (lihat bawah). Migrasi yang rusak membuat PocketBase gagal naik.
3. Commit, merge ke `server-kantor`.

Peran pengguna: kosong (menunggu persetujuan, tidak bisa membaca apa pun), `viewer` (baca),
`operator` (baca, buat, ubah), `admin` (semua, termasuk hapus dan ubah peran). Pendaftar baru
selalu kosong sampai admin memberi peran lewat **Kelola Pengguna Tim** di aplikasi.

## Uji lokal (tanpa menyentuh server atau data kantor)

1. Unduh PocketBase **v0.40.6** untuk OS-mu dari https://github.com/pocketbase/pocketbase/releases
   dan taruh `pocketbase` (atau `pocketbase.exe`) di folder kerja sementara, mis. `.pb-test/`.
2. Buat superuser uji dan jalankan (PowerShell, dari akar repo):

   ```powershell
   .pb-test\pocketbase.exe superuser upsert tmp@test.local TmpTest-9f3k2x --dir=.pb-test\data --migrationsDir=pb_migrations
   .pb-test\pocketbase.exe serve --http=127.0.0.1:8099 --dir=.pb-test\data --migrationsDir=pb_migrations --publicDir=.
   ```

3. Buka http://127.0.0.1:8099 untuk mencoba aplikasi. Di terminal lain, jalankan 46 pemeriksaan otomatis
   (butuh Node.js, tanpa paket tambahan): `node tests/run-test.js`.
   Hapus `.pb-test\data` untuk mengulang dari kosong.

## Penting diketahui

- **GitHub Pages memakai data produksi.** Di luar domain `thearchiver.my.id`, aplikasi otomatis memakai
  `https://perdinku.thearchiver.my.id`. Jadi mencoba lewat Pages berarti menulis ke data kantor.
  Untuk bereksperimen pakai uji lokal di atas.
- Jangan commit `pb_data/`, binary PocketBase, atau kata sandi. Tidak ada kunci rahasia di kode ini
  (PocketBase tidak memakai kunci publik seperti Supabase).
- Dashboard `/_/` (akun superuser) memberi akses penuh ke semua data kantor, jadi tidak dibagikan.
  Kelola pengguna dan data lewat aplikasi (akun admin).
- `pocketbase.umd.js` adalah SDK resmi v0.29.0 dari npm. Kalau diperbarui, cek isinya sama dengan paket resmi.
- Reset kata sandi lewat email baru berfungsi setelah SMTP diatur di server (belum).

## Verifikasi email (saklar)

Pengiriman email verifikasi saat pendaftaran **dimatikan** secara bawaan karena server belum punya SMTP.
Akun yang baru mendaftar **tidak langsung login** ke aplikasi (diarahkan dulu ke tab masuk/login),
dan statusnya otomatis ditandai `verified = 1` di PocketBase lewat migrasi
`pb_migrations/1795610000_auto_verify_users.js` (trigger SQLite `users_auto_verify_insert`).

Sebelum menghidupkan verifikasi email suatu saat nanti:

1. Atur SMTP di dashboard PocketBase (Settings, Mail) dan tes kirim email.
2. Buat migrasi baru untuk menghapus trigger auto-verifikasi (`DROP TRIGGER IF EXISTS users_auto_verify_insert;`).
3. Tandai akun yang sudah ada sebagai `verified` (koleksi `users`), terutama akun admin.
4. Taruh di `index.html`, sebelum `<script src="js/pb-shim.js...">`:
   `<script>window.PERDINKU_REQUIRE_EMAIL_VERIFICATION = true;</script>`

Bagian 7 di `tests/run-test.js` menguji mode ini. Penolakan login untuk akun belum terverifikasi
saat ini hanya dijaga di sisi browser; bila verifikasi dijadikan syarat keamanan, tambahkan juga
aturan `@request.auth.verified = true` lewat file migrasi.
