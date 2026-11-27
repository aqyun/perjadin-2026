/**
 * js/06-documents/04-render-bbm.js
 * Engine Render Dokumen Resmi Reimburse BBM Kendaraan Dinas
 * Sesuai Template Excel Biro Komunikasi Publik Kementerian PKP
 * 1. Checklist Pengendalian Pengadaan Barang / Jasa (Lembar Kendali BBM)
 * 2. Kuitansi / Bukti Pembayaran (Akun 523121)
 * 3. Daftar Rincian Pembayaran (Lampiran Surat Dirjen Perbendaharaan S-46/PB/2013)
 */

function formatRupiahMurni(n) {
  const num = Math.round(Number(n) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

function formatTanggalIndoLengkap(dStr) {
  if (!dStr) return '';
  // Jika formatnya sudah teks seperti "20 November 2026" atau "Desember 2026"
  if (/[a-zA-Z]/.test(dStr)) return dStr;
  const parts = dStr.split('-');
  if (parts.length === 3) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1] || '';
    const year = parts[0];
    return `${day} ${month} ${year}`;
  }
  return dStr;
}

function getDefaultBbmData() {
  return {
    id: 'bbm_' + Date.now(),
    tanggalMasuk: '2026-11-20',
    pelaksanaPanggilan: 'Yogi Pakpahan',
    pelaksanaNama: 'Yogi Andre Yonatan Pakpahan, S.P.W.K',
    pelaksanaNip: '199511272025061006',
    namaPenyedia: 'Biro Komunikasi Publik',
    noBukti: '-',
    noKuitansi: '            /KW/Bend/Satker-Setjen/2026',
    pekerjaan: 'Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas - TOYOTA INNOVA B 2577 KRK.',
    pekerjaanKuitansi: 'Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas - TOYOTA INNOVA B 2577 KRK, Output: Perawatan Kendaraan Bermotor.',
    kendaraan: 'TOYOTA INNOVA B 2577 KRK',
    platNomor: 'B 2577 KRK',
    tanggalBukti: '2026-11-20',
    tanggalKuitansi: 'Desember 2026',
    tempatKota: 'Jakarta',
    akun: '146.01.WA.7665.EBA.994.002.0D.523121',
    namaAkun: 'Belanja Pemeliharaan Peralatan dan Mesin',
    outputKegiatan: 'Perawatan Kendaraan Bermotor',
    jenisPengadaan: 'Perawatan Kendaraan Bermotor',
    ta: '2026',
    items: [
      {
        id: 1,
        tanggal: '2026-11-20',
        uraian: 'Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil Innova B 2577 KRK',
        spbu: 'SPBU Pertamina',
        jenisBbm: 'Pertamina Dex',
        liter: 65,
        jumlah: 1000000
      }
    ],
    nilaiTotal: 1000000,
    catatan: '',
    checklist: {
      kwitansi: { ada: true, tidakAda: false, sesuai: true },
      rincian: { ada: true, tidakAda: false, sesuai: true },
      dokumentasi: { ada: true, tidakAda: false, sesuai: true }
    },
    pejabat: {
      ppkNama: 'Emanuel Pati Libak, S.Pd., M.T.',
      ppkNip: '197512072010121001',
      ppspmNama: 'Mala Hayati Rahayu, S.E',
      ppspmNip: '198408012009122003',
      bendaharaNama: 'Rahmat H',
      bendaharaNip: '198004022014081001',
      kasubbagTuNama: 'Ahmad Jayadi, S.Hum., MT.',
      kasubbagTuNip: '198702182010121003',
      verifikatorNama: '…......…...........…........................................',
      verifikatorNip: ''
    }
  };
}

/**
 * 1. RENDER CHECKLIST PENGENDALIAN PENGADAAN BARANG / JASA (Lembar Kendali BBM)
 */
function renderBbmChecklistHtml(d) {
  const data = d || getDefaultBbmData();
  const tglMasuk = formatTanggalIndoLengkap(data.tanggalMasuk);
  const tglBukti = formatTanggalIndoLengkap(data.tanggalBukti);
  const nilaiFmt = Number(data.nilaiTotal || 0).toLocaleString('id-ID');

  return `
    <div class="bbm-paper bbm-paper-checklist">
      <!-- HEADER ATAS -->
      <div class="bbm-top-meta">
        <div class="bbm-meta-row">
          <span class="bbm-meta-label">Tanggal Masuk Berkas</span>
          <span class="bbm-meta-sep">:</span>
          <span class="bbm-meta-val">${tglMasuk || '&nbsp;'}</span>
        </div>
        <div class="bbm-meta-row">
          <span class="bbm-meta-label font-bold">PELAKSANA PERTANGGUNGJAWABAN</span>
          <span class="bbm-meta-sep">:</span>
          <span class="bbm-meta-val font-bold">${data.pelaksanaPanggilan || data.pelaksanaNama || '&nbsp;'}</span>
        </div>
      </div>

      <!-- JUDUL RESMI -->
      <div class="bbm-doc-title">
        CHECKLIST PENGENDALIAN PENGADAAN BARANG / JASA
      </div>

      <!-- TABEL KETERANGAN PENGADAAN -->
      <table class="bbm-table bbm-table-meta">
        <tbody>
          <tr>
            <td rowspan="2" class="bbm-w-pelaksana font-bold bbm-bg-light">
              Pelaksana Pekerjaan Pengadaan Barang/Jasa
            </td>
            <td class="bbm-w-sublabel">Nama Penyedia</td>
            <td class="bbm-w-sep">:</td>
            <td class="bbm-w-subval">${data.namaPenyedia || 'Biro Komunikasi Publik'}</td>
            <td class="bbm-w-spk-label font-bold">
              Nomor Bukti<br>Pembayaran /<br>Kuitansi / SPK
            </td>
            <td class="bbm-w-sep">:</td>
            <td class="bbm-w-spk-val">${data.noBukti || '-'}</td>
          </tr>
          <tr>
            <td class="bbm-w-sublabel">Pekerjaan</td>
            <td class="bbm-w-sep">:</td>
            <td class="bbm-w-subval font-bold">${data.pekerjaan || `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas - ${data.kendaraan}.`}</td>
            <td class="bbm-w-spk-label font-bold">
              Tanggal Bukti<br>Pembayaran /<br>Kuitansi / SPK
            </td>
            <td class="bbm-w-sep">:</td>
            <td class="bbm-w-spk-val">${tglBukti || '&nbsp;'}</td>
          </tr>
          <tr>
            <td class="font-bold">Akun/Kegiatan :</td>
            <td colspan="3" class="font-bold">${data.akun || '146.01.WA.7665.EBA.994.002.0D.523121'}</td>
            <td class="font-bold">Nilai (Rp)</td>
            <td class="bbm-w-sep">:</td>
            <td class="font-bold">${nilaiFmt}</td>
          </tr>
          <tr>
            <td colspan="7" class="font-bold">
              Jenis Pengadaan : ${data.jenisPengadaan || 'Perawatan Kendaraan Bermotor'}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- TABEL BERKAS KEGIATAN -->
      <table class="bbm-table bbm-table-check">
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 320px;">Berkas Kegiatan</th>
            <th style="width: 60px;">Ada</th>
            <th style="width: 70px;">Tidak Ada</th>
            <th style="width: 100px;">Kesesuaian</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="tc font-bold">1</td>
            <td>Kwitansi/Struk Pembayaran</td>
            <td class="tc font-bold">✓</td>
            <td class="tc"></td>
            <td class="tc">Sesuai</td>
          </tr>
          <tr>
            <td class="tc font-bold">2</td>
            <td>Daftar Rincian Pembayaran</td>
            <td class="tc font-bold">✓</td>
            <td class="tc"></td>
            <td class="tc">Sesuai</td>
          </tr>
          <tr>
            <td class="tc font-bold">3</td>
            <td>Dokumentasi</td>
            <td class="tc font-bold">✓</td>
            <td class="tc"></td>
            <td class="tc">Sesuai</td>
          </tr>
        </tbody>
      </table>

      <!-- CATATAN -->
      <div class="bbm-catatan-box">
        <span class="font-bold">Catatan :</span> ${data.catatan || ''}
      </div>

      <!-- TANDA TANGAN 3 KOLOM -->
      <div class="bbm-sign-row bbm-mt-30">
        <div class="bbm-sign-col">
          <p class="bbm-sign-role">Disetujui</p>
          <p class="bbm-sign-role font-bold">Pejabat Pembuat Komitmen</p>
          <div class="bbm-sign-space"></div>
          <p class="bbm-sign-name font-bold underline">"${data.pejabat?.ppkNama || 'Emanuel Pati Libak, S.Pd., M.T.'}"</p>
          <p class="bbm-sign-nip">NIP. ${data.pejabat?.ppkNip || '197512072010121001'}</p>
        </div>

        <div class="bbm-sign-col">
          <p class="bbm-sign-role font-bold">PPSPM</p>
          <p class="bbm-sign-role">(Pejabat Penanda Tangan SPM)</p>
          <div class="bbm-sign-space"></div>
          <p class="bbm-sign-name font-bold underline">"${data.pejabat?.ppspmNama || 'Mala Hayati Rahayu, S.E'}"</p>
          <p class="bbm-sign-nip">NIP. ${data.pejabat?.ppspmNip || '198408012009122003'}</p>
        </div>

        <div class="bbm-sign-col">
          <p class="bbm-sign-role">Jakarta, ${tglMasuk || '&nbsp;'}</p>
          <p class="bbm-sign-role font-bold">Verifikator Pejabat Pembuat Komitmen</p>
          <div class="bbm-sign-space"></div>
          <p class="bbm-sign-name font-bold underline">${data.pejabat?.verifikatorNama || '…......…...........…........................................'}</p>
          <p class="bbm-sign-nip">NIP. ${data.pejabat?.verifikatorNip || ''}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * 2. RENDER KUITANSI / BUKTI PEMBAYARAN BBM (Akun 523121)
 */
function renderBbmKuitansiHtml(d) {
  const data = d || getDefaultBbmData();
  const terbilangTeks = (typeof terbilang === 'function')
    ? terbilang(data.nilaiTotal || 0)
    : 'Satu Juta Rupiah';

  return `
    <div class="bbm-paper bbm-paper-kuitansi">
      <!-- HEADER KANAN ATAS -->
      <div class="bbm-kuitansi-top-right">
        <table class="bbm-table-borderless">
          <tr>
            <td class="font-bold">TA</td>
            <td>:</td>
            <td>${data.ta || '2026'}</td>
          </tr>
          <tr>
            <td class="font-bold">Nomor Bukti</td>
            <td>:</td>
            <td>${data.noKuitansi || '            /KW/Bend/Satker-Setjen/2026'}</td>
          </tr>
          <tr>
            <td class="font-bold">Akun</td>
            <td>:</td>
            <td class="font-bold">${data.akun || '146.01.WA.7665.EBA.994.002.0D.523121'}</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="bbm-sub-akun">(${data.namaAkun || 'Belanja Pemeliharaan Peralatan dan Mesin'})</td>
          </tr>
        </table>
      </div>

      <!-- JUDUL KUITANSI -->
      <div class="bbm-kuitansi-header">
        <h2 class="bbm-kuitansi-title">KUITANSI / BUKTI PEMBAYARAN</h2>
      </div>

      <!-- FORM ISIAN KUITANSI -->
      <table class="bbm-table-kuitansi-body">
        <tbody>
          <tr>
            <td class="bbm-k-label">Sudah terima dari</td>
            <td class="bbm-k-sep">:</td>
            <td class="bbm-k-val font-bold">
              Pejabat Pembuat Komitmen<br>
              Sekretariat Jenderal Kementerian Perumahan dan Kawasan Permukiman
            </td>
          </tr>
          <tr>
            <td class="bbm-k-label">Jumlah Uang</td>
            <td class="bbm-k-sep">:</td>
            <td class="bbm-k-val">
              <span class="bbm-k-amount">${formatRupiahMurni(data.nilaiTotal)}</span>
            </td>
          </tr>
          <tr>
            <td class="bbm-k-label">Terbilang</td>
            <td class="bbm-k-sep">:</td>
            <td class="bbm-k-val font-bold italic bbm-terbilang-box">
              ${terbilangTeks}
            </td>
          </tr>
          <tr>
            <td class="bbm-k-label">Untuk pembayaran</td>
            <td class="bbm-k-sep">:</td>
            <td class="bbm-k-val">
              "${data.pekerjaanKuitansi || `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan Mobil Dinas - ${data.kendaraan}, Output: Perawatan Kendaraan Bermotor.`}"
            </td>
          </tr>
        </tbody>
      </table>

      <!-- SUB-TANDA TANGAN: PEMBUAT DAFTAR -->
      <div class="bbm-pembuat-daftar-row">
        <div class="bbm-pembuat-daftar-col">
          <p>Tempat / Tanggal : Jakarta/ &nbsp; &nbsp; ${data.tanggalKuitansi || 'Desember 2026'}</p>
          <p class="font-bold">Pembuat Daftar</p>
          <div class="bbm-sign-space-sm"></div>
          <p class="font-bold underline">"${data.pelaksanaNama || 'Yogi Andre Yonatan Pakpahan, S.P.W.K'}"</p>
          <p>NIP. ${data.pelaksanaNip || '199511272025061006'}</p>
        </div>
      </div>

      <!-- TANDA TANGAN PPK & BENDAHARA (DUA KOLOM) -->
      <div class="bbm-sign-dual-row bbm-mt-15">
        <div class="bbm-sign-dual-col">
          <p class="italic">"Setuju dibebankan pada mata anggaran berkenaan,"</p>
          <p>An. Kuasa Pengguna Anggaran</p>
          <p class="font-bold">Pejabat Pembuat Komitmen</p>
          <p>Sekretariat Jenderal</p>
          <p>Kementerian Perumahan dan Kawasan Permukiman</p>
          <div class="bbm-sign-space-sm"></div>
          <p class="font-bold underline">${data.pejabat?.ppkNama || 'Emanuel Pati Libak'}</p>
          <p>NIP. '${data.pejabat?.ppkNip || '197512072010121001'}</p>
        </div>

        <div class="bbm-sign-dual-col">
          <p>Lunas dibayar tgl :</p>
          <p class="font-bold">Bendahara Pengeluaran</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <div class="bbm-sign-space-sm"></div>
          <p class="font-bold underline">${data.pejabat?.bendaharaNama || 'Rahmat H'}</p>
          <p>NIP. ${data.pejabat?.bendaharaNip || '198004022014081001'}</p>
        </div>
      </div>

      <!-- TANDA TANGAN KASUBBAG TU (BAWAH KIRI) -->
      <div class="bbm-kasubbag-row bbm-mt-15">
        <div class="bbm-kasubbag-col">
          <p>Barang / pekerjaan tersebut telah diterima / diselesaikan dengan lengkap dan baik</p>
          <p>Pejabat yang bertanggungjawab</p>
          <p class="font-bold">Kepala Subbagian Tata Usaha</p>
          <div class="bbm-sign-space-sm"></div>
          <p class="font-bold underline">"${data.pejabat?.kasubbagTuNama || 'Ahmad Jayadi, S.Hum., MT.'}"</p>
          <p>NIP. ${data.pejabat?.kasubbagTuNip || '198702182010121003'}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * 3. RENDER DAFTAR RINCIAN PEMBAYARAN (Format Lampiran S-46/PB/2013)
 */
function renderBbmRincianHtml(d) {
  const data = d || getDefaultBbmData();
  const items = (data.items && data.items.length) ? data.items : [
    {
      tanggal: data.tanggalBukti || '2026-11-20',
      uraian: `Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil Innova ${data.platNomor || 'B 2577 KRK'}`,
      jumlah: data.nilaiTotal || 1000000
    }
  ];

  let itemRowsHtml = '';
  items.forEach((item, idx) => {
    const tglItem = formatTanggalIndoLengkap(item.tanggal);
    if (idx === 0 || item.tanggal !== items[idx - 1]?.tanggal) {
      itemRowsHtml += `
        <tr class="bbm-rincian-date-group">
          <td></td>
          <td colspan="2" class="font-bold bbm-pl-15">${tglItem}</td>
        </tr>
      `;
    }
    itemRowsHtml += `
      <tr>
        <td class="tc">${idx + 1}</td>
        <td>${item.uraian}</td>
        <td class="tr font-mono">${Number(item.jumlah || 0).toLocaleString('id-ID')}</td>
      </tr>
    `;
  });

  return `
    <div class="bbm-paper bbm-paper-rincian">
      <!-- HEADER LAMPIRAN PERBENDAHARAAN -->
      <div class="bbm-s46-header">
        <p>Lampiran Surat Direktur Jenderal Perbendaharaan</p>
        <p>Nomor : S-46 /PB/2013</p>
        <p>Tanggal : 2013-01-03</p>
      </div>

      <!-- JUDUL -->
      <div class="bbm-rincian-title-box">
        <h2 class="bbm-rincian-title">Daftar Rincian Pembayaran</h2>
      </div>

      <!-- KETERANGAN PERNYATAAN -->
      <p class="bbm-rincian-statement">
        Yang bertandatangan di bawah ini menyatakan bahwa kami bertanggungjawab atas pengeluaran yang tidak diperoleh kuitansi, dengan perincian sebagai berikut :
      </p>

      <p class="bbm-rincian-klasifikasi">
        <span class="font-bold">Klasifikasi anggaran : fungsi / sub fungsi / program / kegiatan / output / sub kelompok akun / akun</span><br>
        <span class="font-bold font-mono">${data.akun || '146.01.WA.7665.EBA.994.002.0D.523121'}</span>
      </p>

      <!-- TABEL RINCIAN -->
      <table class="bbm-table bbm-table-rincian">
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th>Uraian</th>
            <th style="width: 170px;">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
          <tr class="bbm-row-total">
            <td colspan="2" class="tr font-bold">Nilai Total</td>
            <td class="tr font-bold font-mono">${Number(data.nilaiTotal || 0).toLocaleString('id-ID')}</td>
          </tr>
        </tbody>
      </table>

      <!-- PERNYATAAN PENUTUP RESMI -->
      <p class="bbm-rincian-closing">
        Jumlah uang tersebut di atas benar - benar di keluarkan untuk pelaksanaan dukungan atas kegiatan biro kompu, kami bersedia untuk menyetorkan kelebihan tersebut ke kas negara
      </p>

      <!-- TANDA TANGAN PPK -->
      <div class="bbm-rincian-sign-row">
        <div class="bbm-rincian-sign-box">
          <p>Jakarta, &nbsp; &nbsp; &nbsp; &nbsp; ${data.tanggalKuitansi || 'Desember 2026'}</p>
          <p class="font-bold">Pejabat Pembuat Komitmen</p>
          <p>Sekretariat Jenderal</p>
          <p>Kementerian Perumahan dan Kawasan Permukiman</p>
          <div class="bbm-sign-space"></div>
          <p class="font-bold underline">${data.pejabat?.ppkNama || 'Emanuel Pati Libak'}</p>
          <p>NIP. '${data.pejabat?.ppkNip || '197512072010121001'}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * 4. RENDER SEMUA DOKUMEN BBM SEKALIGUS (Siap Cetak / Print Batch)
 */
function renderBbmAllDocsHtml(data) {
  return `
    <div class="bbm-all-documents-container">
      <div class="bbm-doc-section" id="bbm-doc-checklist">
        ${renderBbmChecklistHtml(data)}
      </div>
      <div class="page-break"></div>
      <div class="bbm-doc-section" id="bbm-doc-kuitansi">
        ${renderBbmKuitansiHtml(data)}
      </div>
      <div class="page-break"></div>
      <div class="bbm-doc-section" id="bbm-doc-rincian">
        ${renderBbmRincianHtml(data)}
      </div>
    </div>
  `;
}
