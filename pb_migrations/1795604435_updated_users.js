/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Halo,</p><p>Terima kasih telah mendaftar di <strong>PerdinKu 2026</strong> (Kementerian PKP).</p><p>Demi keamanan, silakan klik tombol di bawah untuk memverifikasi email Anda sebelum masuk:</p><p><a class=\"btn\" href=\"{APP_URL}/#type=verify&token={TOKEN}\" target=\"_blank\" rel=\"noopener\">Verifikasi Email</a></p><p><i>Jika tombol tidak dapat diklik, salin tautan ini: {APP_URL}/#type=verify&token={TOKEN}</i></p><p>Salam hangat,<br/>Biro Komunikasi Publik Kementerian PKP</p>",
      "subject": "Verifikasi Alamat Email Anda - PerdinKu 2026"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "Test",
      "subject": "Test"
    }
  }, collection)

  return app.save(collection)
})
