/**
 * js/07-excel/02-ekspor-bbm-excel.js
 * Modul Ekspor Berkas Reimburse BBM ke Excel (.xlsx)
 * Format Plek Ketiplek Template Resmi Biro Komunikasi Publik Kementerian PKP
 * Berisi 4 Sheet:
 * - "Berkas Lengkap BBM" (Susunan persis seperti file Excel asli)
 * - "1. Checklist Pengendalian"
 * - "2. Kuitansi BBM"
 * - "3. Rincian S-46"
 */

function cleanNip(nip) {
  if (!nip) return '';
  let s = String(nip).replace(/^['"]+|['"]+$/g, '').trim();
  return s.replace(/^(NIP\.?\s*)+/gi, '').trim();
}

function formatNip(nip, defaultBlank = 'NIP.') {
  const s = cleanNip(nip);
  if (!s || s === '-' || /^[.\s]+$/.test(s)) return defaultBlank;
  return `NIP. ${s}`;
}

function exportBbmToExcel(d) {
  if (typeof XLSX === 'undefined') {
    alert('Pustaka SheetJS (XLSX) belum dimuat.');
    return;
  }

  const data = d || (typeof getActiveBbmRecord === 'function' ? getActiveBbmRecord() : getDefaultBbmData());
  const wb = XLSX.utils.book_new();

  const receipt = getBbmReceiptPeriod(data);
  const bulanAngka = receipt.bulanAngka || '11';
  const noKuitansi = (typeof formatBbmNoKuitansi === 'function')
    ? formatBbmNoKuitansi(data.noKuitansi, bulanAngka, receipt.tahun)
    : `            /KW/Bend/Satker - Sj/${bulanAngka}/${receipt.tahun}`;
  const tglMasuk = formatTanggalIndoLengkap(data.tanggalMasuk) || '';
  const tglKuitansi = receipt.tanggalKuitansi;
  const terbilangTeks = (typeof terbilang === 'function')
    ? terbilang(data.nilaiTotal || 0)
    : 'Satu Juta Rupiah';

  // Pembuat Daftar sinkron dengan pelaksana pertanggungjawaban pembuat berkas perjadin
  const pelaksanaRaw = (data.pelaksanaNama !== undefined)
    ? (data.pelaksanaNama || data.pelaksanaPanggilan || '')
    : ((typeof document !== 'undefined' && document.getElementById('lk_pelaksana')?.value) || '');
  const pelaksanaIdentity = (pelaksanaRaw && typeof resolveBbmPelaksanaIdentity === 'function')
    ? resolveBbmPelaksanaIdentity(pelaksanaRaw, data.pelaksanaNip)
    : { nama: pelaksanaRaw, nip: data.pelaksanaNip || '' };
  const pelaksanaNama = pelaksanaIdentity.nama || '';
  const pelaksanaNip = pelaksanaIdentity.nip || '';

  const uraianKegiatan = getBbmUraianKegiatan(data);
  const uraianKuitansi = getBbmUraianKuitansi(data);

  const items = (data.items && data.items.length) ? data.items : [
    {
      tanggal: receipt.tanggalBukti,
      uraian: `Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil ${data.platNomor || 'B 2577 KRK'} an. ${pelaksanaNama}`,
      jumlah: data.nilaiTotal || 1000000
    }
  ];

  // Helper untuk membuat baris kosong sebanyak n kolom
  const emptyRow = (n = 10) => Array(n).fill('');

  // =========================================================================
  // 1. SHEET: BERKAS LENGKAP BBM (PLEK KETIPLEK FILE EXCEL ASLI USER)
  // =========================================================================
  const fullRows = [];

  // Baris 1-9 kosong
  for (let i = 0; i < 9; i++) fullRows.push(emptyRow(10));

  // Row 10: Tanggal Masuk Berkas
  const r10 = emptyRow(10);
  r10[6] = 'Tanggal Masuk Berkas :';
  r10[7] = tglMasuk;
  fullRows.push(r10);

  // Row 11: Pelaksana
  const r11 = emptyRow(10);
  r11[1] = 'PELAKSANA PERTANGGUNGJAWABAN';
  r11[4] = ':';
  r11[5] = pelaksanaNama;
  fullRows.push(r11);

  // Row 12: Title Checklist
  const r12 = emptyRow(10);
  r12[1] = 'CHECKLIST PENGENDALIAN PENGADAAN BARANG / JASA';
  fullRows.push(r12);

  // Row 13: Pelaksana / Penyedia / SPK
  const r13 = emptyRow(10);
  r13[1] = 'Pelaksana Pekerjaan Pengadaan Barang/Jasa';
  r13[3] = 'Nama Penyedia';
  r13[4] = ':';
  r13[5] = data.namaPenyedia || 'Biro Komunikasi Publik';
  r13[7] = 'Nomor Bukti\nPembayaran /\nKuitansi / SPK';
  r13[8] = ':';
  r13[9] = data.noBukti || '-';
  fullRows.push(r13);

  // Row 14: Pekerjaan / Tanggal SPK
  const r14 = emptyRow(10);
  r14[3] = 'Pekerjaan';
  r14[4] = ':';
  r14[5] = uraianKegiatan;
  r14[7] = 'Tanggal Bukti\nPembayaran /\nKuitansi / SPK';
  r14[8] = ':';
  r14[9] = '';
  fullRows.push(r14);

  // Row 15: Akun / Nilai
  const r15 = emptyRow(10);
  r15[1] = 'Akun/Kegiatan :';
  r15[3] = data.akun || '146.01.WA.7665.EBA.994.002.0D.523121';
  r15[7] = 'Nilai (Rp)';
  r15[8] = ':';
  r15[9] = Number(data.nilaiTotal || 0);
  fullRows.push(r15);

  // Row 16: Jenis Pengadaan
  const r16 = emptyRow(10);
  r16[1] = `Jenis Pengadaan : ${data.jenisPengadaan || 'Perawatan Kendaraan Bermotor'}`;
  fullRows.push(r16);

  // Row 17: Header Tabel Berkas Kegiatan
  const r17 = emptyRow(10);
  r17[1] = 'No';
  r17[2] = 'Berkas Kegiatan';
  r17[5] = 'Ada';
  r17[6] = 'Tidak Ada';
  r17[7] = 'Kesesuaian';
  fullRows.push(r17);

  // Row 18: Item 1
  const r18 = emptyRow(10);
  r18[1] = 1;
  r18[2] = 'Surat Undangan (jika ada)';
  fullRows.push(r18);

  // Row 19: Item 2
  const r19 = emptyRow(10);
  r19[1] = 2;
  r19[2] = 'Surat Tugas';
  fullRows.push(r19);

  // Row 20: Item 3
  const r20 = emptyRow(10);
  r20[1] = 3;
  r20[2] = 'Kwitansi/Struk Pembayaran';
  fullRows.push(r20);

  // Row 20b: Item 4
  const r20b = emptyRow(10);
  r20b[1] = 4;
  r20b[2] = 'Daftar Rincian Pembayaran';
  fullRows.push(r20b);

  // Row 20c: Item 5
  const r20c = emptyRow(10);
  r20c[1] = 5;
  r20c[2] = 'Laporan Perjalanan Dinas';
  fullRows.push(r20c);

  // Row 20d: Item 6
  const r20d = emptyRow(10);
  r20d[1] = 6;
  r20d[2] = 'Dokumentasi Kegiatan';
  fullRows.push(r20d);

  // Row 21: Catatan
  const r21 = emptyRow(10);
  r21[1] = `Catatan : ${data.catatan || ''}`;
  fullRows.push(r21);

  // Baris kosong
  fullRows.push(emptyRow(10));

  // Row 23: Tanda Tangan Header
  const r23 = emptyRow(10);
  r23[2] = 'Disetujui';
  r23[5] = 'PPSPM';
  r23[7] = `Jakarta, ${tglMasuk}`;
  fullRows.push(r23);

  // Row 24: Role Penandatangan
  const r24 = emptyRow(10);
  r24[2] = 'Pejabat Pembuat Komitmen';
  r24[5] = '(Pejabat Penanda Tangan SPM)';
  r24[7] = 'Verifikator Pejabat Pembuat Komitmen';
  fullRows.push(r24);

  // Spasi tanda tangan (7 baris)
  for (let i = 0; i < 7; i++) fullRows.push(emptyRow(10));

  // Row 32: Nama Penandatangan
  const r32 = emptyRow(10);
  r32[2] = data.pejabat?.ppkNama || 'Emanuel Pati Libak, S.Pd., M.T.';
  r32[5] = data.pejabat?.ppspmNama || 'Mala Hayati Rahayu, S.E';
  r32[7] = String(data.pejabat?.verifikatorNama || '').replace(/[ΓÇªrÇªÇª…]+/g, '').trim() || '..................................';
  fullRows.push(r32);

  // Row 33: NIP Penandatangan
  const r33 = emptyRow(10);
  r33[2] = formatNip(data.pejabat?.ppkNip || '197512072010121001');
  r33[5] = formatNip(data.pejabat?.ppspmNip || '198408012009122003');
  r33[7] = formatNip(data.pejabat?.verifikatorNip, 'NIP.');
  fullRows.push(r33);

  // Spasi antar dokumen (2 baris)
  fullRows.push(emptyRow(10));
  fullRows.push(emptyRow(10));

  // ==========================================
  // DOKUMEN 2 DI FILE SAMA: KUITANSI PEMBAYARAN
  // ==========================================
  const r35 = emptyRow(10);
  r35[7] = 'TA';
  r35[8] = ':';
  r35[9] = receipt.tahun;
  fullRows.push(r35);

  const r36 = emptyRow(10);
  r36[7] = 'Nomor Bukti';
  r36[8] = ':';
  r36[9] = noKuitansi;
  fullRows.push(r36);

  const r37 = emptyRow(10);
  r37[7] = 'Akun';
  r37[8] = ':';
  r37[9] = data.akun || '146.01.WA.7665.EBA.994.002.0D.523121';
  fullRows.push(r37);

  const r38 = emptyRow(10);
  r38[9] = `(${data.namaAkun || 'Belanja Pemeliharaan Peralatan dan Mesin'})`;
  fullRows.push(r38);

  fullRows.push(emptyRow(10));
  fullRows.push(emptyRow(10));

  // Row 41: Title Kuitansi
  const r41 = emptyRow(10);
  r41[1] = 'KUITANSI / BUKTI PEMBAYARAN';
  fullRows.push(r41);
  fullRows.push(emptyRow(10));

  const r43 = emptyRow(10);
  r43[1] = 'Sudah terima dari';
  r43[3] = ':';
  r43[4] = 'Pejabat Pembuat Komitmen';
  fullRows.push(r43);

  const r44 = emptyRow(10);
  r44[4] = 'Sekretariat Jenderal Kementerian Perumahan dan Kawasan Permukiman';
  fullRows.push(r44);
  fullRows.push(emptyRow(10));

  const r46 = emptyRow(10);
  r46[1] = 'Jumlah Uang';
  r46[3] = ':';
  r46[4] = Number(data.nilaiTotal || 0);
  fullRows.push(r46);
  fullRows.push(emptyRow(10));

  const r48 = emptyRow(10);
  r48[1] = 'Terbilang';
  r48[3] = ':';
  r48[4] = terbilangTeks;
  fullRows.push(r48);
  fullRows.push(emptyRow(10));

  const r50 = emptyRow(10);
  r50[1] = 'Untuk pembayaran';
  r50[3] = ':';
  r50[4] = uraianKuitansi;
  fullRows.push(r50);
  fullRows.push(emptyRow(10));

  const r52 = emptyRow(10);
  r52[7] = 'Tempat / Tanggal';
  r52[8] = ':';
  r52[9] = `Jakarta/    ${tglKuitansi}`;
  fullRows.push(r52);

  const r53 = emptyRow(10);
  r53[7] = 'Pembuat Daftar';
  fullRows.push(r53);

  // Spasi tanda tangan pembuat daftar (7 baris)
  for (let i = 0; i < 7; i++) fullRows.push(emptyRow(10));

  const r61 = emptyRow(10);
  r61[7] = pelaksanaNama;
  fullRows.push(r61);

  const r62 = emptyRow(10);
  r62[7] = cleanNip(pelaksanaNip) ? `NIP. ${cleanNip(pelaksanaNip)}` : '';
  fullRows.push(r62);

  const r63 = emptyRow(10);
  r63[1] = 'Setuju dibebankan pada mata anggaran berkenaan,';
  r63[7] = 'Lunas dibayar tgl :';
  fullRows.push(r63);

  const r64 = emptyRow(10);
  r64[1] = 'An. Kuasa Pengguna Anggaran';
  fullRows.push(r64);

  const r65 = emptyRow(10);
  r65[1] = 'Pejabat Pembuat Komitmen';
  r65[7] = 'Bendahara Pengeluaran';
  fullRows.push(r65);

  const r66 = emptyRow(10);
  r66[1] = 'Sekretariat  Jenderal';
  fullRows.push(r66);

  const r67 = emptyRow(10);
  r67[1] = 'Kementerian Perumahan dan Kawasan Permukiman';
  fullRows.push(r67);

  // Spasi tanda tangan PPK & Bendahara (5 baris)
  for (let i = 0; i < 5; i++) fullRows.push(emptyRow(10));

  const r73 = emptyRow(10);
  r73[1] = (typeof document !== 'undefined' && document.getElementById('cfg_ppkNama')?.value) || data.pejabat?.ppkNama || 'Emanuel Pati Libak';
  r73[7] = (typeof document !== 'undefined' && document.getElementById('cfg_bendNama')?.value) || data.pejabat?.bendaharaNama || 'Rahmat H';
  fullRows.push(r73);

  const r74 = emptyRow(10);
  r74[1] = `NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ppkNip')?.value) || data.pejabat?.ppkNip || '197512072010121001')}`;
  r74[7] = `NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_bendNip')?.value) || data.pejabat?.bendaharaNip || '198004022014081001')}`;
  fullRows.push(r74);

  const r75 = emptyRow(10);
  r75[1] = 'Barang / pekerjaan tersebut telah diterima / diselesaikan dengan lengkap dan baik';
  fullRows.push(r75);

  const r76 = emptyRow(10);
  r76[1] = 'Pejabat yang bertanggungjawab';
  fullRows.push(r76);

  const r77 = emptyRow(10);
  r77[1] = 'Kepala Subbagian Tata Usaha';
  fullRows.push(r77);

  // Spasi tanda tangan Kasubbag TU (5 baris)
  for (let i = 0; i < 5; i++) fullRows.push(emptyRow(10));

  const r83 = emptyRow(10);
  r83[1] = (typeof document !== 'undefined' && document.getElementById('cfg_ktuNama')?.value) || data.pejabat?.kasubbagTuNama || 'Ahmad Jayadi, S.Hum., MT.';
  fullRows.push(r83);

  const r84 = emptyRow(10);
  r84[1] = `NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ktuNip')?.value) || data.pejabat?.kasubbagTuNip || '198702182010121003')}`;
  fullRows.push(r84);

  // Spasi antar dokumen (4 baris)
  for (let i = 0; i < 4; i++) fullRows.push(emptyRow(10));

  // ==========================================
  // DOKUMEN 3 DI FILE SAMA: RINCIAN PEMBAYARAN
  // ==========================================
  const r89 = emptyRow(10);
  r89[4] = 'Lampiran Surat Direktur Jenderal Perbendaharaan';
  fullRows.push(r89);

  const r90 = emptyRow(10);
  r90[4] = 'Nomor';
  r90[5] = ':';
  r90[6] = 'S-46 /PB/2013';
  fullRows.push(r90);

  const r91 = emptyRow(10);
  r91[4] = 'Tanggal';
  r91[5] = ':';
  r91[6] = '2013-01-03';
  fullRows.push(r91);

  fullRows.push(emptyRow(10));

  const r93 = emptyRow(10);
  r93[1] = 'Daftar Rincian Pembayaran';
  fullRows.push(r93);
  fullRows.push(emptyRow(10));

  const r95 = emptyRow(10);
  r95[1] = 'Yang bertandatangan di bawah ini menyatakan bahwa kami bertanggungjawab atas pengeluaran yang tidak diperoleh kuitansi, dengan perincian sebagai berikut:';
  fullRows.push(r95);
  fullRows.push(emptyRow(10));

  const r97 = emptyRow(10);
  r97[1] = 'Klasifikasi anggaran : fungsi / sub fungsi / program / kegiatan / output / sub kelompok akun / akun';
  fullRows.push(r97);
  fullRows.push(emptyRow(10));

  const r99 = emptyRow(10);
  r99[1] = 'No';
  r99[2] = 'Uraian';
  r99[6] = 'Jumlah';
  fullRows.push(r99);

  // Group items by date for Excel export (Sesuai Format Revisi User)
  const dateGroups = {};
  items.forEach(item => {
    const tgl = item.tanggal || receipt.tanggalBukti;
    if (!dateGroups[tgl]) dateGroups[tgl] = [];
    dateGroups[tgl].push(item);
  });

  let globalNoExcel = 1;
  const sortedDatesExcel = Object.keys(dateGroups).sort();
  sortedDatesExcel.forEach(tgl => {
    const tglItem = formatTanggalIndoLengkap(tgl);
    const rDate = emptyRow(10);
    rDate[2] = tglItem;
    fullRows.push(rDate);

    dateGroups[tgl].forEach(item => {
      const isKdo = (item.pelaksanaNama && (item.pelaksanaNama.toLowerCase().includes('kdo') || item.pelaksanaNama.toLowerCase().includes('operasional'))) ||
                    (item.uraian && item.uraian.includes('Kendaraan Dinas Operasional (KDO)')) ||
                    (!item.pelaksanaNama && (item.platNomor === 'B 2577 KRK' || item.platNomor === 'B 2223 UKQ' || item.platNomor === 'B 2602 UYZ'));
      let itemUraian = item.uraian;
      if (!itemUraian) {
        const kendPlat = item.kendaraanPlat || `${item.kendaraan || data.kendaraan || 'Mobil'} ${item.platNomor || data.platNomor || 'B 2577 KRK'}`;
        if (isKdo) {
          itemUraian = `Pengisian Bahan Bakar Minyak (BBM) ${item.jenisBbm || 'Pertamina Dex'} Kendaraan Dinas Operasional (KDO) - ${kendPlat}`;
        } else {
          itemUraian = `Pengisian Bahan Bakar Minyak (BBM) ${item.jenisBbm || 'Pertamax'} - ${kendPlat}${item.pelaksanaNama ? ' an. ' + item.pelaksanaNama : ''}`;
        }
      }
      const rItem = emptyRow(10);
      rItem[1] = globalNoExcel++;
      rItem[2] = itemUraian;
      rItem[6] = Number(item.jumlah || 0);
      fullRows.push(rItem);
    });
  });

  const rTot = emptyRow(10);
  rTot[2] = 'Nilai Total';
  rTot[6] = Number(data.nilaiTotal || 0);
  fullRows.push(rTot);

  fullRows.push(emptyRow(10));

  const rClose = emptyRow(10);
  rClose[1] = 'Jumlah uang tersebut di atas benar - benar di keluarkan untuk pelaksanaan dukungan atas kegiatan biro kompu, kami bersedia untuk menyetorkan kelebihan tersebut ke kas negara';
  fullRows.push(rClose);

  fullRows.push(emptyRow(10));
  fullRows.push(emptyRow(10));

  const rSignTgl = emptyRow(10);
  rSignTgl[5] = `Jakarta,         ${tglKuitansi}`;
  fullRows.push(rSignTgl);

  const rSignPpk1 = emptyRow(10);
  rSignPpk1[5] = 'Pejabat Pembuat Komitmen';
  fullRows.push(rSignPpk1);

  const rSignPpk2 = emptyRow(10);
  rSignPpk2[5] = 'Sekretariat Jenderal';
  fullRows.push(rSignPpk2);

  const rSignPpk3 = emptyRow(10);
  rSignPpk3[5] = 'Kementerian Perumahan dan Kawasan Permukiman';
  fullRows.push(rSignPpk3);

  // Spasi tanda tangan PPK Rincian (5 baris)
  for (let i = 0; i < 5; i++) fullRows.push(emptyRow(10));

  const rSignName = emptyRow(10);
  rSignName[5] = data.pejabat?.ppkNama || 'Emanuel Pati Libak';
  fullRows.push(rSignName);

  const rSignNip = emptyRow(10);
  rSignNip[5] = `NIP. '${cleanNip(data.pejabat?.ppkNip || '197512072010121001')}`;
  fullRows.push(rSignNip);

  // Kolom lebar untuk Sheet Berkas Lengkap
  const wsFull = XLSX.utils.aoa_to_sheet(fullRows);
  wsFull['!cols'] = [
    { wch: 4 },  // Col A
    { wch: 28 }, // Col B
    { wch: 18 }, // Col C
    { wch: 18 }, // Col D
    { wch: 4 },  // Col E (:)
    { wch: 38 }, // Col F
    { wch: 16 }, // Col G
    { wch: 22 }, // Col H
    { wch: 4 },  // Col I (:)
    { wch: 24 }  // Col J
  ];
  XLSX.utils.book_append_sheet(wb, wsFull, 'Berkas Lengkap BBM');

  // =========================================================================
  // 2. SHEET: 1. CHECKLIST PENGENDALIAN
  // =========================================================================
  const chkRows = [
    ['', '', '', '', '', '', 'Tanggal Masuk Berkas :', tglMasuk],
    ['', 'PELAKSANA PERTANGGUNGJAWABAN', '', '', ':', pelaksanaNama],
    ['', 'CHECKLIST PENGENDALIAN PENGADAAN BARANG / JASA'],
    ['', 'Pelaksana Pekerjaan Pengadaan Barang/Jasa', '', 'Nama Penyedia', ':', data.namaPenyedia || 'Biro Komunikasi Publik', '', 'Nomor Bukti Pembayaran / Kuitansi / SPK', ':', data.noBukti || '-'],
    ['', '', '', 'Pekerjaan', ':', uraianKegiatan, '', 'Tanggal Bukti Pembayaran / Kuitansi / SPK', ':', ''],
    ['', 'Akun/Kegiatan :', '', data.akun || '146.01.WA.7665.EBA.994.002.0D.523121', '', '', '', 'Nilai (Rp)', ':', Number(data.nilaiTotal || 0)],
    ['', `Jenis Pengadaan : ${data.jenisPengadaan || 'Perawatan Kendaraan Bermotor'}`],
    [],
    ['', 'No', 'Berkas Kegiatan', '', '', 'Ada', 'Tidak Ada', 'Kesesuaian'],
    ['', 1, 'Surat Undangan (jika ada)', '', '', '', '', ''],
    ['', 2, 'Surat Tugas', '', '', '', '', ''],
    ['', 3, 'Kwitansi/Struk Pembayaran', '', '', '', '', ''],
    ['', 4, 'Daftar Rincian Pembayaran', '', '', '', '', ''],
    ['', 5, 'Laporan Perjalanan Dinas', '', '', '', '', ''],
    ['', 6, 'Dokumentasi Kegiatan', '', '', '', '', ''],
    [],
    ['', `Catatan : ${data.catatan || ''}`],
    [],
    ['', '', 'Disetujui', '', '', 'PPSPM', '', `Jakarta, ${tglMasuk}`],
    ['', '', 'Pejabat Pembuat Komitmen', '', '', '(Pejabat Penanda Tangan SPM)', '', 'Verifikator Pejabat Pembuat Komitmen'],
    [], [], [], [], [],
    ['', '', data.pejabat?.ppkNama || 'Emanuel Pati Libak, S.Pd., M.T.', '', '', data.pejabat?.ppspmNama || 'Mala Hayati Rahayu, S.E', '', String(data.pejabat?.verifikatorNama || '').replace(/[ΓÇªrÇªÇª…]+/g, '').trim() || '..................................'],
    ['', '', formatNip(data.pejabat?.ppkNip || '197512072010121001'), '', '', formatNip(data.pejabat?.ppspmNip || '198408012009122003'), '', formatNip(data.pejabat?.verifikatorNip, 'NIP.')]
  ];
  const wsChk = XLSX.utils.aoa_to_sheet(chkRows);
  wsChk['!cols'] = [{ wch: 4 }, { wch: 30 }, { wch: 24 }, { wch: 18 }, { wch: 4 }, { wch: 35 }, { wch: 12 }, { wch: 35 }, { wch: 4 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsChk, '1. Checklist Pengendalian');

  // =========================================================================
  // 3. SHEET: 2. KUITANSI BBM
  // =========================================================================
  const kwRows = [
    ['', '', '', '', '', '', '', 'TA', ':', receipt.tahun],
    ['', '', '', '', '', '', '', 'Nomor Bukti', ':', noKuitansi],
    ['', '', '', '', '', '', '', 'Akun', ':', data.akun || '146.01.WA.7665.EBA.994.002.0D.523121'],
    ['', '', '', '', '', '', '', '', '', `(${data.namaAkun || 'Belanja Pemeliharaan Peralatan dan Mesin'})`],
    [],
    ['', 'KUITANSI / BUKTI PEMBAYARAN'],
    [],
    ['', 'Sudah terima dari', '', ':', 'Pejabat Pembuat Komitmen'],
    ['', '', '', '', 'Sekretariat Jenderal Kementerian Perumahan dan Kawasan Permukiman'],
    [],
    ['', 'Jumlah Uang', '', ':', Number(data.nilaiTotal || 0)],
    [],
    ['', 'Terbilang', '', ':', terbilangTeks],
    [],
    ['', 'Untuk pembayaran', '', ':', uraianKuitansi],
    [],
    ['', '', '', '', '', '', '', 'Tempat / Tanggal', ':', `Jakarta/    ${tglKuitansi}`],
    ['', '', '', '', '', '', '', 'Pembuat Daftar'],
    [], [], [], [],
    ['', '', '', '', '', '', '', pelaksanaNama],
    ['', '', '', '', '', '', '', cleanNip(pelaksanaNip) ? `NIP. ${cleanNip(pelaksanaNip)}` : ''],
    [],
    ['', 'Setuju dibebankan pada mata anggaran berkenaan,', '', '', '', '', '', 'Lunas dibayar tgl :'],
    ['', 'An. Kuasa Pengguna Anggaran'],
    ['', 'Pejabat Pembuat Komitmen', '', '', '', '', '', 'Bendahara Pengeluaran'],
    ['', 'Sekretariat  Jenderal'],
    ['', 'Kementerian Perumahan dan Kawasan Permukiman'],
    [], [], [], [],
    ['', (typeof document !== 'undefined' && document.getElementById('cfg_ppkNama')?.value) || data.pejabat?.ppkNama || 'Emanuel Pati Libak', '', '', '', '', '', (typeof document !== 'undefined' && document.getElementById('cfg_bendNama')?.value) || data.pejabat?.bendaharaNama || 'Rahmat H'],
    ['', `NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ppkNip')?.value) || data.pejabat?.ppkNip || '197512072010121001')}`, '', '', '', '', '', `NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_bendNip')?.value) || data.pejabat?.bendaharaNip || '198004022014081001')}`],
    [],
    ['', 'Barang / pekerjaan tersebut telah diterima / diselesaikan dengan lengkap dan baik'],
    ['', 'Pejabat yang bertanggungjawab'],
    ['', 'Kepala Subbagian Tata Usaha'],
    [], [], [], [],
    ['', (typeof document !== 'undefined' && document.getElementById('cfg_ktuNama')?.value) || data.pejabat?.kasubbagTuNama || 'Ahmad Jayadi, S.Hum., MT.'],
    ['', `NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ktuNip')?.value) || data.pejabat?.kasubbagTuNip || '198702182010121003')}`]
  ];
  const wsKw = XLSX.utils.aoa_to_sheet(kwRows);
  wsKw['!cols'] = [{ wch: 4 }, { wch: 32 }, { wch: 14 }, { wch: 4 }, { wch: 38 }, { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 4 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsKw, '2. Kuitansi BBM');

  // =========================================================================
  // 4. SHEET: 3. RINCIAN PEMBAYARAN S-46
  // =========================================================================
  const s46Rows = [
    ['', 'Daftar Rincian Pembayaran'],
    [],
    ['', 'Yang bertandatangan di bawah ini menyatakan bahwa kami bertanggungjawab atas pengeluaran yang tidak diperoleh kuitansi, dengan perincian sebagai berikut:'],
    [],
    ['', 'Klasifikasi anggaran : fungsi / sub fungsi / program / kegiatan / output / sub kelompok akun / akun'],
    [],
    ['', 'No', 'Uraian', '', '', '', 'Jumlah'],
  ];

  let s46No = 1;
  sortedDatesExcel.forEach(tgl => {
    const tglItem = formatTanggalIndoLengkap(tgl);
    s46Rows.push(['', '', tglItem]);
    dateGroups[tgl].forEach(item => {
      const isKdo = (item.pelaksanaNama && (item.pelaksanaNama.toLowerCase().includes('kdo') || item.pelaksanaNama.toLowerCase().includes('operasional'))) ||
                    (item.uraian && item.uraian.includes('Kendaraan Dinas Operasional (KDO)')) ||
                    (!item.pelaksanaNama && (item.platNomor === 'B 2577 KRK' || item.platNomor === 'B 2223 UKQ' || item.platNomor === 'B 2602 UYZ'));
      let itemUraian = item.uraian;
      if (!itemUraian) {
        const kendPlat = item.kendaraanPlat || `${item.kendaraan || data.kendaraan || 'Mobil'} ${item.platNomor || data.platNomor || 'B 2577 KRK'}`;
        if (isKdo) {
          itemUraian = `Pengisian Bahan Bakar Minyak (BBM) ${item.jenisBbm || 'Pertamina Dex'} Kendaraan Dinas Operasional (KDO) - ${kendPlat}`;
        } else {
          itemUraian = `Pengisian Bahan Bakar Minyak (BBM) ${item.jenisBbm || 'Pertamax'} - ${kendPlat}${item.pelaksanaNama ? ' an. ' + item.pelaksanaNama : ''}`;
        }
      }
      s46Rows.push(['', s46No++, itemUraian, '', '', '', Number(item.jumlah || 0)]);
    });
  });

  s46Rows.push(['', '', 'Nilai Total', '', '', '', Number(data.nilaiTotal || 0)]);
  s46Rows.push([]);
  s46Rows.push(['', 'Jumlah uang tersebut di atas benar - benar di keluarkan untuk pelaksanaan dukungan atas kegiatan biro kompu, kami bersedia untuk menyetorkan kelebihan tersebut ke kas negara']);
  s46Rows.push([]);
  s46Rows.push(['', '', '', '', '', `Jakarta,         ${tglKuitansi}`]);
  s46Rows.push(['', '', '', '', '', 'Pejabat Pembuat Komitmen']);
  s46Rows.push(['', '', '', '', '', 'Sekretariat Jenderal']);
  s46Rows.push(['', '', '', '', '', 'Kementerian Perumahan dan Kawasan Permukiman']);
  s46Rows.push([]); s46Rows.push([]); s46Rows.push([]); s46Rows.push([]);
  s46Rows.push(['', '', '', '', '', data.pejabat?.ppkNama || 'Emanuel Pati Libak']);
  s46Rows.push(['', '', '', '', '', `NIP. '${cleanNip(data.pejabat?.ppkNip || '197512072010121001')}`]);

  const wsS46 = XLSX.utils.aoa_to_sheet(s46Rows);
  wsS46['!cols'] = [{ wch: 4 }, { wch: 6 }, { wch: 55 }, { wch: 8 }, { wch: 8 }, { wch: 20 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsS46, '3. Rincian S-46');

  // Unduh Berkas
  const platClean = (data.platNomor || 'BBM').replace(/[^a-zA-Z0-9]/g, '_');
  const tglClean = receipt.tanggalBukti.replace(/[^0-9]/g, '');
  const fileName = `Reimburse_BBM_${platClean}_${tglClean}.xlsx`;

  XLSX.writeFile(wb, fileName);
  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Unduh Excel Berhasil', `File "${fileName}" telah diunduh dengan format resmi template BBM.`);
  }
}
