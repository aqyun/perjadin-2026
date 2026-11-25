/// <reference path="../pb_data/types.d.ts" />
// Perketat akses sebelum aplikasi dibuka ke internet:
// akun baru (role kosong) berstatus "menunggu persetujuan" dan tidak bisa membaca data
// sampai admin memberinya peran (viewer / operator / admin).
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  // pengguna selalu boleh melihat profilnya sendiri; pengguna lain hanya jika sudah berperan
  users.listRule = 'id = @request.auth.id || @request.auth.role != ""';
  users.viewRule = 'id = @request.auth.id || @request.auth.role != ""';
  // daftar mandiri tidak boleh menentukan peran sendiri
  users.createRule = '@request.body.role:isset = false';
  app.save(users);

  const riwayat = app.findCollectionByNameOrId("riwayat_perjadin");
  riwayat.listRule = '@request.auth.role != ""';
  riwayat.viewRule = '@request.auth.role != ""';
  app.save(riwayat);
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  users.listRule = '@request.auth.id != ""';
  users.viewRule = '@request.auth.id != ""';
  users.createRule = '@request.body.role:isset = false || @request.body.role = "viewer"';
  app.save(users);

  const riwayat = app.findCollectionByNameOrId("riwayat_perjadin");
  riwayat.listRule = '@request.auth.id != ""';
  riwayat.viewRule = '@request.auth.id != ""';
  app.save(riwayat);
});
