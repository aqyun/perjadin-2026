/// <reference path="../pb_data/types.d.ts" />
// Skema PerdinKu untuk PocketBase. Menggantikan supabase_schema.sql.
// Peran: admin / operator / viewer. Semua akses wajib login (tidak ada akses anon).
migrate((app) => {
  // 1. Koleksi pengguna bawaan: tambah kolom role, longgarkan min password ke 6
  const users = app.findCollectionByNameOrId("users");

  if (!users.fields.getByName("role")) {
    users.fields.add(new SelectField({
      name: "role",
      values: ["viewer", "operator", "admin"],
      maxSelect: 1,
    }));
  }
  const pw = users.fields.getByName("password");
  if (pw) pw.min = 6;

  const isAdmin = '@request.auth.role = "admin"';
  // semua yang login boleh lihat daftar nama (sama seperti kebijakan lama)
  users.listRule = '@request.auth.id != ""';
  users.viewRule = '@request.auth.id != ""';
  // daftar mandiri hanya boleh jadi viewer; admin dinaikkan manual oleh admin
  users.createRule = '@request.body.role:isset = false || @request.body.role = "viewer"';
  // ubah profil sendiri tanpa menyentuh role, atau admin boleh ubah siapa saja
  users.updateRule = '(id = @request.auth.id && @request.body.role:isset = false) || ' + isAdmin;
  users.deleteRule = isAdmin;
  app.save(users);

  // 2. Koleksi riwayat perjalanan dinas
  const riwayat = new Collection({
    type: "base",
    name: "riwayat_perjadin",
    fields: [
      { type: "text", name: "nomor_st" },
      { type: "text", name: "tujuan" },
      { type: "text", name: "agenda" },
      { type: "text", name: "tgl_berangkat" },
      { type: "text", name: "tgl_kembali" },
      { type: "number", name: "total_biaya" },
      { type: "text", name: "status_berkas" },
      // csv_data bisa panjang, naikkan batas default 5000 karakter
      { type: "text", name: "csv_data", max: 5000000 },
      { type: "json", name: "payload_json", maxSize: 20000000 },
      { type: "relation", name: "created_by", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { type: "autodate", name: "created_at", onCreate: true, onUpdate: false },
      { type: "autodate", name: "updated_at", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE INDEX idx_riwayat_nomor_st ON riwayat_perjadin (nomor_st)",
      "CREATE INDEX idx_riwayat_created_at ON riwayat_perjadin (created_at)",
    ],
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.role = "admin" || @request.auth.role = "operator"',
    updateRule: '@request.auth.role = "admin" || @request.auth.role = "operator"',
    deleteRule: isAdmin,
  });
  app.save(riwayat);
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("riwayat_perjadin")); } catch (_) {}
});
