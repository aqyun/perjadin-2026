/// <reference path="../pb_data/types.d.ts" />
// Karena pengiriman email verifikasi dimatikan sementara (SMTP belum aktif),
// akun baru yang berhasil dibuat otomatis berstatus terverifikasi (verified = 1).
migrate((app) => {
  app.db().newQuery(`
    CREATE TRIGGER IF NOT EXISTS users_auto_verify_insert
    AFTER INSERT ON users
    FOR EACH ROW
    WHEN NOT COALESCE(NEW.verified, 0)
    BEGIN
      UPDATE users SET verified = 1 WHERE id = NEW.id;
    END
  `).execute();
}, (app) => {
  app.db().newQuery("DROP TRIGGER IF EXISTS users_auto_verify_insert").execute();
});
