/// <reference path="../pb_data/types.d.ts" />
// Koleksi database khusus untuk arsip, pencairan, dan rekam jejak (track record) Berkas BBM.
migrate((app) => {
  try {
    const existing = app.findCollectionByNameOrId("riwayat_bbm");
    if (existing) return;
  } catch (_) {}

  const users = app.findCollectionByNameOrId("users");
  const riwayatBbm = new Collection({
    type: "base",
    name: "riwayat_bbm",
    fields: [
      { type: "text", name: "bbm_uid" },
      { type: "text", name: "nomor_st" },
      { type: "text", name: "kategori_kendaraan" },
      { type: "text", name: "kendaraan" },
      { type: "text", name: "plat_nomor" },
      { type: "text", name: "pelaksana_bukti" },
      { type: "text", name: "pembuat_berkas" },
      { type: "text", name: "tgl_bukti" },
      { type: "text", name: "mak" },
      { type: "number", name: "nilai_total" },
      { type: "text", name: "status_berkas" },
      { type: "bool", name: "layak_pencairan" },
      { type: "text", name: "keterangan_pencairan" },
      { type: "json", name: "payload_json", maxSize: 20000000 },
      { type: "relation", name: "created_by", collectionId: users.id, maxSelect: 1, cascadeDelete: false },
      { type: "autodate", name: "created_at", onCreate: true, onUpdate: false },
      { type: "autodate", name: "updated_at", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE INDEX idx_riwayat_bbm_uid ON riwayat_bbm (bbm_uid)",
      "CREATE INDEX idx_riwayat_bbm_nomor_st ON riwayat_bbm (nomor_st)",
      "CREATE INDEX idx_riwayat_bbm_status ON riwayat_bbm (status_berkas)",
      "CREATE INDEX idx_riwayat_bbm_created_at ON riwayat_bbm (created_at)",
    ],
    listRule: '@request.auth.role != ""',
    viewRule: '@request.auth.role != ""',
    createRule: '@request.auth.role = "admin" || @request.auth.role = "operator"',
    updateRule: '@request.auth.role = "admin" || @request.auth.role = "operator"',
    deleteRule: '@request.auth.role = "admin"',
  });
  app.save(riwayatBbm);
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("riwayat_bbm")); } catch (_) {}
});
