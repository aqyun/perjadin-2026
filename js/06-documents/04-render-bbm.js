/**
 * js/06-documents/04-render-bbm.js
 * Engine Render Dokumen Resmi Reimburse BBM Kendaraan Dinas & Pribadi
 * Format Plek Ketiplek Template Resmi Biro Komunikasi Publik Kementerian PKP
 * 1. Checklist Pengendalian Pengadaan Barang / Jasa (Format Lembar Kendali Resmi PerdinKu)
 * 2. Kuitansi / Bukti Pembayaran (Akun 523121 - Sesuai Template Box Resmi)
 * 3. Daftar Rincian Pembayaran (Multi-Struk BBM Grouping Per Tanggal)
 */

function formatRupiahMurni(n) {
  const num = Math.round(Number(n) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

function cleanNip(nip) {
  if (!nip) return '';
  return String(nip).replace(/^['"]+|['"]+$/g, '').trim();
}

function formatTanggalIndoLengkap(dStr) {
  if (!dStr) return '';
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

function getBbmReceiptPeriod(data = {}) {
  const itemDates = Array.isArray(data.items) ? data.items.map(item => item.tanggal).filter(Boolean) : [];
  const dates = [...itemDates, data.tanggalKembali, data.tanggalBerangkat, data.tanggalBukti]
    .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date || ''))
    .sort();
  const referenceDate = dates[dates.length - 1] || new Date().toISOString().slice(0, 10);
  const [tahun, bulan] = referenceDate.split('-');
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return {
    tanggalBukti: referenceDate,
    tahun,
    tanggalKuitansi: `${months[parseInt(bulan, 10) - 1]} ${tahun}`
  };
}

function getBbmUraianKegiatan(data = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const agenda = data.agenda || doc?.getElementById('agenda')?.value || '';
  const noST = data.noST || doc?.getElementById('noST')?.value || doc?.getElementById('noSTNum')?.value || '';
  const receipt = getBbmReceiptPeriod(data);
  const tglAwal = data.tanggalBerangkat || doc?.getElementById('tglBerangkat')?.value || receipt.tanggalBukti;
  const tglAkhir = data.tanggalKembali || doc?.getElementById('tglKembali')?.value || tglAwal;

  let tglRentang = '';
  if (tglAwal && tglAkhir && tglAwal !== tglAkhir) {
    tglRentang = `${formatTanggalIndoLengkap(tglAwal)} s.d. ${formatTanggalIndoLengkap(tglAkhir)}`;
  } else if (tglAwal) {
    tglRentang = formatTanggalIndoLengkap(tglAwal);
  } else {
    tglRentang = formatTanggalIndoLengkap(receipt.tanggalBukti);
  }

  if (agenda || noST) {
    return `Pembelian BBM untuk kegiatan perjalanan dinas dalam rangka ${agenda || '...'} tanggal ${tglRentang} dengan Nomor ST ${noST || '...'}.`;
  }

  const kendLabel = `${data.kendaraan || 'Mobil'} ${data.kategoriKendaraan === 'pribadi' ? 'Pribadi' : 'Dinas'}${data.platNomor ? ' - ' + data.platNomor : ''}`;
  return `Pengisian Bahan Bakar Minyak (BBM) untuk Kendaraan ${kendLabel}.`;
}

function getBbmUraianKuitansi(data = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const base = getBbmUraianKegiatan(data).replace(/\s+Output\s*:?\s*.*$/i, '').trim();
  const output = data.namaAkun || doc?.getElementById('bbm_namaAkun')?.value || 'Belanja Pemeliharaan Peralatan dan Mesin';
  return `${base} Output ${output}`;
}

function getDefaultBbmData() {
  const data = {
    id: 'bbm_' + Date.now(),
    kategoriKendaraan: 'dinas',
    tanggalMasuk: '',
    pelaksanaPanggilan: 'Yogi Pakpahan',
    pelaksanaNama: 'Yogi Andre Yonatan Pakpahan, S.P.W.K',
    pelaksanaNip: '199511272025061006',
    namaPenyedia: 'Biro Komunikasi Publik',
    noBukti: '-',
    noKuitansi: '            /KW/Bend/Satker-Setjen/2026',
    noST: '395/ST/Sj.07/2026',
    agenda: 'Pembuatan Video Dokumenter dan Pengambilan Footage Penerima Manfaat Bedah Rumah BSPS di Pulau Lancang, Kel. Pulau Pari, Kab. Kepulauan Seribu',
    tanggalBerangkat: '2026-10-14',
    tanggalKembali: '2026-10-16',
    nomorSPM: '-',
    nomorSPD: '-',
    kendaraan: 'Mobil',
    platNomor: 'B 2577 KRK',
    tanggalBukti: '2026-11-20',
    tanggalKuitansi: 'November 2026',
    tempatKota: 'Jakarta',
    akun: '146.01.WA.7665.EBA.994.002.0D.523121',
    namaAkun: 'Belanja Pemeliharaan Peralatan dan Mesin',
    outputKegiatan: 'Perawatan Kendaraan Bermotor',
    jenisPengadaan: 'Perawatan Kendaraan Bermotor',
    ta: '2026',
    items: [
      {
        id: 1,
        pelaksanaNama: 'Ahmad Jayadi, S.Hum., MT.',
        pelaksanaNip: '198702182010121003',
        tanggal: '2026-11-20',
        kendaraan: 'Mobil',
        platNomor: 'B 2577 KRK',
        jenisBbm: 'Pertamina Dex',
        spbu: 'SPBU Pertamina',
        liter: 65,
        jumlah: 1000000,
        uraian: 'Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil B 2577 KRK an. Ahmad Jayadi, S.Hum., MT.'
      },
      {
        id: 2,
        pelaksanaNama: 'Fitrah Faizal, S.I.Kom.',
        pelaksanaNip: '199208152020121004',
        tanggal: '2026-11-20',
        kendaraan: 'Mobil',
        platNomor: 'B 2577 KRK',
        jenisBbm: 'Pertamina Dex',
        spbu: 'SPBU Pertamina',
        liter: 65,
        jumlah: 1000000,
        uraian: 'Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil B 2577 KRK an. Fitrah Faizal, S.I.Kom.'
      }
    ],
    nilaiTotal: 2000000,
    catatan: '',
    pejabat: {
      ppkNama: 'Emanuel Pati Libak, S.Pd., M.T.',
      ppkNip: '197512072010121001',
      ppspmNama: 'Mala Hayati Rahayu, S.E',
      ppspmNip: '198408012009122003',
      bendaharaNama: 'Rahmat H',
      bendaharaNip: '198004022014081001',
      kasubbagTuNama: 'Ahmad Jayadi, S.Hum., MT.',
      kasubbagTuNip: '198702182010121003',
      verifikatorNama: 'ΓÇª......ΓÇª...........ΓÇª........................................',
      verifikatorNip: ''
    }
  };
  data.pekerjaan = getBbmUraianKegiatan(data);
  data.pekerjaanKuitansi = getBbmUraianKuitansi(data);
  return data;
}

/**
 * 1. RENDER CHECKLIST PENGENDALIAN PENGADAAN BARANG / JASA (LEMBAR KENDALI BBM)
 * 100% Plek Ketiplek Format Gambar User (BBM Only: Single Unified Border Box)
 * Kop Mengikuti Standar Resmi PerdinKu & Pelaksana Pertanggungjawaban Sinkron dengan Berkas Perjadin
 */
function renderBbmChecklistHtml(d) {
  const data = d || getDefaultBbmData();
  const receipt = getBbmReceiptPeriod(data);
  const tglMasuk = formatTanggalIndoLengkap(data.tanggalMasuk);
  const nilaiFmt = Number(data.nilaiTotal || 0).toLocaleString('id-ID');
  const logoSrc = (typeof LOGO_PKP_BASE64 !== 'undefined' && LOGO_PKP_BASE64) ? LOGO_PKP_BASE64 : 'logo-pkp.webp';
  const alamat = (typeof document !== 'undefined' && ((document.getElementById('cfg_alamatSatker')?.value || document.getElementById('alamatSatker')?.value) || '')) || 'Raden Patah No. 1 RT. 002 RW. 001 Kebayoran Baru, Jakarta Selatan - DKI Jakarta';

  const pelaksanaRaw = (typeof document !== 'undefined' && document.getElementById('lk_pelaksana')?.value) || data.pelaksanaNama || data.pelaksanaPanggilan || 'Yogi Andre Yonatan Pakpahan, S.P.W.K';
  const pelaksana = (typeof resolveBbmPelaksanaIdentity === 'function')
    ? resolveBbmPelaksanaIdentity(pelaksanaRaw, data.pelaksanaNip).nama
    : pelaksanaRaw;

  const pekerjaanText = getBbmUraianKegiatan(data);

  return `
    <div class="bbm-paper bbm-paper-checklist" style="font-family: Arial, sans-serif; color: #000; background: #fff;">
      <!-- KOP RESMI IDENTIK DENGAN LEMBAR KENDALI PERJADIN -->
      <header class="lembar-kendali-header">
        <img class="lembar-kendali-logo" src="${logoSrc}" alt="Logo PKP">
        <div>
          <div class="lembar-kendali-ministry">KEMENTERIAN PERUMAHAN DAN KAWASAN PERMUKIMAN <span>REPUBLIK INDONESIA</span></div>
          <strong class="lembar-kendali-secretariat">SEKRETARIAT JENDERAL</strong>
          <div class="lembar-kendali-unit">SATUAN KERJA</div>
          ${alamat ? `<div class="lembar-kendali-address">${alamat}</div>` : ''}
        </div>
      </header>

      <!-- TANGGAL MASUK BERKAS (CENTERED POLOS TANPA KOTAK) -->
      <div style="text-align: center; font-size: 11px; margin: 10px 0 6px 0; font-family: Arial, sans-serif;">
        Tanggal Masuk Berkas : &nbsp;${tglMasuk || ''}
      </div>

      <!-- KOTAK TABEL UTAMA CHECKLIST TERPADU BINGKAI HITAM -->
      <div class="bbm-checklist-main-box" style="border: 1.5px solid #000; background: #fff; color: #000; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.35; box-sizing: border-box;">
        
        <!-- BARIS 1: PELAKSANA PERTANGGUNGJAWABAN (SINKRON BERKAS PERJADIN) -->
        <div style="border-bottom: 1px solid #000; padding: 5px 8px; font-size: 11px;">
          <strong>PELAKSANA PERTANGGUNGJAWABAN</strong> &nbsp; : &nbsp; ${pelaksana}
        </div>

        <!-- BARIS 2: CHECKLIST PENGENDALIAN PENGADAAN BARANG / JASA -->
        <div style="border-bottom: 1px solid #000; padding: 6px 8px; text-align: center; font-size: 12px; font-weight: bold; letter-spacing: 0.3px;">
          CHECKLIST PENGENDALIAN PENGADAAN BARANG / JASA
        </div>

        <!-- BARIS 3 & 4: PELAKSANA PEKERJAAN | PENYEDIA & PEKERJAAN | NOMOR & TANGGAL BUKTI -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000; font-size: 11px;">
          <colgroup>
            <col style="width: 14%;">
            <col style="width: 45%;">
            <col style="width: 41%;">
          </colgroup>
          <tr>
            <td rowspan="2" style="border-right: 1px solid #000; padding: 6px 6px; text-align: center; vertical-align: middle; font-weight: bold; line-height: 1.35;">
              Pelaksana<br>Pekerjaan<br>Pengadaan<br>Barang/Jasa
            </td>
            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 8px; vertical-align: top;">
              <div style="display: flex;">
                <span style="width: 95px; flex-shrink: 0; font-weight: bold;">Nama Penyedia</span>
                <span style="width: 14px; text-align: center; flex-shrink: 0;">:</span>
                <span>${data.namaPenyedia || 'Biro Komunikasi Publik'}</span>
              </div>
            </td>
            <td style="border-bottom: 1px solid #000; padding: 5px 8px; vertical-align: top;">
              <div style="display: flex; align-items: flex-start;">
                <span style="width: 115px; flex-shrink: 0; font-weight: bold; font-size: 10px; line-height: 1.25;">Nomor Bukti<br>Pembayaran /<br>Kuitansi / SPK</span>
                <span style="width: 14px; text-align: center; flex-shrink: 0; padding-top: 1px;">:</span>
                <span style="padding-top: 1px;">${data.noBukti || '-'}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-right: 1px solid #000; padding: 5px 8px; vertical-align: top;">
              <div style="display: flex;">
                <span style="width: 95px; flex-shrink: 0; font-weight: bold;">Pekerjaan</span>
                <span style="width: 14px; text-align: center; flex-shrink: 0;">:</span>
                <span style="line-height: 1.35;">${pekerjaanText}</span>
              </div>
            </td>
            <td style="padding: 5px 8px; vertical-align: top;">
              <div style="display: flex; align-items: flex-start;">
                <span style="width: 115px; flex-shrink: 0; font-weight: bold; font-size: 10px; line-height: 1.25;">Tanggal Bukti<br>Pembayaran /<br>Kuitansi / SPK</span>
                <span style="width: 14px; text-align: center; flex-shrink: 0; padding-top: 1px;">:</span>
                <span style="padding-top: 1px; white-space: nowrap;">&nbsp;</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- BARIS 5: AKUN / KEGIATAN & NILAI (RP) -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; font-size: 11px;">
          <div style="padding: 5px 8px; display: flex; align-items: center; flex: 1;">
            <strong style="margin-right: 8px;">Akun/Kegiatan :</strong>
            <span style="font-family: Arial, sans-serif;">${data.akun || '146.01.WA.7665.EBA.994.002.0D.523121'}</span>
          </div>
          <div style="width: 41%; padding: 5px 8px; display: flex; align-items: center; box-sizing: border-box;">
            <strong style="width: 90px; flex-shrink: 0;">Nilai (Rp)</strong>
            <span style="width: 14px; text-align: center; flex-shrink: 0;">:</span>
            <span style="font-family: Arial, sans-serif;">${nilaiFmt}</span>
          </div>
        </div>

        <!-- BARIS 6: JENIS PENGADAAN -->
        <div style="border-bottom: 1px solid #000; padding: 5px 8px; font-size: 11px;">
          <strong>Jenis Pengadaan :</strong> ${data.jenisPengadaan || 'Perawatan Kendaraan Bermotor'}
        </div>

        <!-- BARIS 7-12: TABEL BERKAS KEGIATAN (TERMASUK SURAT TUGAS, UNDANGAN, LAPORAN, DOKUMENTASI) -->
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <colgroup>
            <col style="width: 48px;">
            <col style="width: auto;">
            <col style="width: 85px;">
            <col style="width: 95px;">
            <col style="width: 135px;">
          </colgroup>
          <thead>
            <tr>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">No</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 8px; text-align: center; font-weight: bold;">Berkas Kegiatan</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">Ada</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">Tidak Ada</th>
              <th style="border-bottom: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">Kesesuaian</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; text-align: center;">1</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 8px;">Kwitansi/Struk Pembayaran</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-bottom: 1px solid #000; padding: 5px;"></td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; text-align: center;">2</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 8px;">Daftar Rincian Pembayaran</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-bottom: 1px solid #000; padding: 5px;"></td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; text-align: center;">3</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 8px;">Surat Tugas</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-bottom: 1px solid #000; padding: 5px;"></td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; text-align: center;">4</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 8px;">Undangan (jika ada)</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-bottom: 1px solid #000; padding: 5px;"></td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px; text-align: center;">5</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 8px;">Laporan Perjalanan Dinas</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px;"></td>
              <td style="border-bottom: 1px solid #000; padding: 5px;"></td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; padding: 5px; text-align: center;">6</td>
              <td style="border-right: 1px solid #000; padding: 5px 8px;">Dokumentasi Kegiatan</td>
              <td style="border-right: 1px solid #000; padding: 5px;"></td>
              <td style="border-right: 1px solid #000; padding: 5px;"></td>
              <td style="padding: 5px;"></td>
            </tr>
          </tbody>
        </table>

        <!-- BARIS CATATAN -->
        <div style="border-top: 1px solid #000; padding: 6px 8px; min-height: 65px; font-size: 11px; box-sizing: border-box;">
          <strong>Catatan :</strong> ${data.catatan ? `<span>${data.catatan}</span>` : ''}
        </div>

      </div>

      <!-- TANDA TANGAN 3 KOLOM RESMI (POLOS TANPA UNDERLINE / GARIS BAWAH) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 24px; text-align: center; font-size: 11px; line-height: 1.35; font-family: Arial, sans-serif;">
        <div>
          <div>Disetujui</div>
          <div style="font-weight: bold;">Pejabat Pembuat Komitmen</div>
          <div style="height: 60px;"></div>
          <div>${(typeof document !== 'undefined' && document.getElementById('cfg_ppkNama')?.value) || data.pejabat?.ppkNama || 'Emanuel Pati Libak, S.Pd., M.T.'}</div>
          <div>NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ppkNip')?.value) || data.pejabat?.ppkNip || '197512072010121001')}</div>
        </div>

        <div>
          <div style="font-weight: bold;">PPSPM</div>
          <div>(Pejabat Penanda Tangan SPM)</div>
          <div style="height: 60px;"></div>
          <div>${(typeof document !== 'undefined' && document.getElementById('cfg_ppspmNama')?.value) || data.pejabat?.ppspmNama || 'Mala Hayati Rahayu, S.E'}</div>
          <div>NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ppspmNip')?.value) || data.pejabat?.ppspmNip || '198408012009122003')}</div>
        </div>

        <div>
          <div>Jakarta,</div>
          <div>Verifikator Pejabat Pembuat Komitmen</div>
          <div style="height: 60px;"></div>
          <div>${(typeof document !== 'undefined' && document.getElementById('cfg_verifikatorNama')?.value) || data.pejabat?.verifikatorNama || '................................................................'}</div>
          <div>${((typeof document !== 'undefined' && document.getElementById('cfg_verifikatorNip')?.value) || data.pejabat?.verifikatorNip) ? 'NIP. ' + cleanNip(document.getElementById('cfg_verifikatorNip')?.value || data.pejabat.verifikatorNip) : 'NIP.'}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 2. RENDER KUITANSI / BUKTI PEMBAYARAN BBM (Akun 523121)
 * 100% Plek Ketiplek Format Box Gambar User (Image 1)
 * Ketentuan Aturan 1: Uraian kuitansi menyebutkan maksud penugasan, tanggal rentang, dan Nomor ST.
 * Pembuat Daftar sinkron dengan pelaksana pertanggungjawaban pembuat berkas perjadin.
 */
function renderBbmKuitansiHtml(d) {
  const data = d || getDefaultBbmData();
  const receipt = getBbmReceiptPeriod(data);
  const noKuitansi = `            /KW/Bend/Satker-Setjen/${receipt.tahun}`;
  const terbilangTeks = (typeof terbilang === 'function')
    ? terbilang(data.nilaiTotal || 0)
    : 'Satu Juta Rupiah';

  const pelaksanaRaw = (typeof document !== 'undefined' && document.getElementById('lk_pelaksana')?.value) || data.pelaksanaNama || 'Yogi Andre Yonatan Pakpahan, S.P.W.K';
  const pelIdentity = (typeof resolveBbmPelaksanaIdentity === 'function')
    ? resolveBbmPelaksanaIdentity(pelaksanaRaw, data.pelaksanaNip)
    : { nama: pelaksanaRaw, nip: data.pelaksanaNip || '199511272025061006' };
  const pelaksanaNama = pelIdentity.nama;
  const pelaksanaNip = pelIdentity.nip || '199511272025061006';

  const uraianKuitansi = getBbmUraianKuitansi(data);

  return `
    <div class="bbm-paper bbm-paper-kuitansi" style="padding: 20px;">
      <!-- KOTAK BINGKAI UTAMA KUITANSI -->
      <div class="bbm-kuitansi-border-box" style="border: 1.5px solid #000; padding: 26px 32px; background: #ffffff; color: #000000; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; box-sizing: border-box;">
        
        <!-- HEADER KANAN ATAS: TA, NOMOR BUKTI, AKUN -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 22px;">
          <table style="border-collapse: collapse; font-size: 11px;">
            <tr>
              <td style="width: 85px; vertical-align: top;">TA</td>
              <td style="width: 14px; text-align: center; vertical-align: top;">:</td>
              <td style="vertical-align: top;">${data.ta || '2026'}</td>
            </tr>
            <tr>
              <td style="vertical-align: top;">Nomor Bukti</td>
              <td style="text-align: center; vertical-align: top;">:</td>
              <td style="vertical-align: top; font-family: monospace;">${noKuitansi}</td>
            </tr>
            <tr>
              <td style="vertical-align: top;">Akun</td>
              <td style="text-align: center; vertical-align: top;">:</td>
              <td style="vertical-align: top; font-family: monospace;">${data.akun || '146.01.WA.7665.EBA.994.002.0D.523121'}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td style="font-size: 10.5px; padding-top: 2px;">(${data.namaAkun || 'Belanja Pemeliharaan Peralatan dan Mesin'})</td>
            </tr>
          </table>
        </div>

        <!-- JUDUL TENGAH -->
        <div style="text-align: center; margin-bottom: 28px;">
          <h2 style="font-size: 15px; font-weight: bold; margin: 0; letter-spacing: 0.5px;">KUITANSI / BUKTI PEMBAYARAN</h2>
        </div>

        <!-- ISI KUITANSI -->
        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 25px;">
          <tr>
            <td style="width: 140px; vertical-align: top; padding: 4px 0;">Sudah terima dari</td>
            <td style="width: 14px; vertical-align: top; text-align: center; padding: 4px 0;">:</td>
            <td style="vertical-align: top; padding: 4px 0; line-height: 1.45;">
              Pejabat Pembuat Komitmen<br>
              Sekretariat Jenderal Kementerian Perumahan dan Kawasan Permukiman
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; padding: 8px 0 4px 0;">Jumlah Uang</td>
            <td style="vertical-align: top; text-align: center; padding: 8px 0 4px 0;">:</td>
            <td style="vertical-align: top; padding: 8px 0 4px 0;">
              <span style="display: inline-block; width: 40px;">Rp</span>
              <span style="font-size: 12px; margin-left: 15px;">${Number(data.nilaiTotal || 0).toLocaleString('en-US')}</span>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; padding: 4px 0;">Terbilang</td>
            <td style="vertical-align: top; text-align: center; padding: 4px 0;">:</td>
            <td style="vertical-align: top; padding: 4px 0; font-style: italic;">
              ${terbilangTeks}
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; padding: 6px 0;">Untuk pembayaran</td>
            <td style="vertical-align: top; text-align: center; padding: 6px 0;">:</td>
            <td style="vertical-align: top; padding: 6px 0; line-height: 1.45;">
              ${uraianKuitansi}
            </td>
          </tr>
        </table>

        <!-- BLOK TANDA TANGAN 1: PEMBUAT DAFTAR (KANAN) -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 18px;">
          <div style="width: 320px; font-size: 11px;">
            <table style="border-collapse: collapse; margin-bottom: 4px;">
              <tr>
                <td style="width: 110px;">Tempat / Tanggal</td>
                <td style="width: 10px; text-align: center;">:</td>
                <td>Jakarta/ &nbsp; &nbsp; ${receipt.tanggalKuitansi}</td>
              </tr>
            </table>
            <div>Pembuat Daftar</div>
            <div style="height: 52px;"></div>
            <div>${pelaksanaNama}</div>
            <div>NIP. ${cleanNip(pelaksanaNip)}</div>
          </div>
        </div>

        <!-- GARIS PEMISAH HORIZONTAL 1 -->
        <div style="border-top: 1px solid #000; margin: 12px 0 16px 0;"></div>

        <!-- BLOK TANDA TANGAN 2 & 3: PPK (KIRI) DAN BENDAHARA (KANAN) -->
        <div style="display: flex; justify-content: space-between; font-size: 11px; line-height: 1.35; margin-bottom: 18px;">
          <div style="width: 52%;">
            <div>Setuju dibebankan pada mata anggaran berkenaan,</div>
            <div>An. Kuasa Pengguna Anggaran</div>
            <div>Pejabat Pembuat Komitmen</div>
            <div>Sekretariat Jenderal</div>
            <div>Kementerian Perumahan dan Kawasan Permukiman</div>
            <div style="height: 52px;"></div>
            <div>${(typeof document !== 'undefined' && document.getElementById('cfg_ppkNama')?.value) || data.pejabat?.ppkNama || 'Emanuel Pati Libak'}</div>
            <div>NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ppkNip')?.value) || data.pejabat?.ppkNip || '197512072010121001')}</div>
          </div>
          <div style="width: 44%;">
            <div>Lunas dibayar tgl &nbsp; &nbsp;:</div>
            <div style="margin-top: 2px;">Bendahara Pengeluaran</div>
            <div style="height: 82px;"></div>
            <div>${(typeof document !== 'undefined' && document.getElementById('cfg_bendNama')?.value) || data.pejabat?.bendaharaNama || 'Rahmat H'}</div>
            <div>NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_bendNip')?.value) || data.pejabat?.bendaharaNip || '198004022014081001')}</div>
          </div>
        </div>

        <!-- GARIS PEMISAH HORIZONTAL 2 -->
        <div style="border-top: 1px solid #000; margin: 12px 0 16px 0;"></div>

        <!-- BLOK TANDA TANGAN 4: KASUBBAG TU (KIRI) -->
        <div style="width: 65%; font-size: 11px; line-height: 1.35;">
          <div>Barang / pekerjaan tersebut telah diterima / diselesaikan dengan lengkap dan baik</div>
          <div>Pejabat yang bertanggungjawab</div>
          <div>Kepala Subbagian Tata Usaha</div>
          <div style="height: 52px;"></div>
          <div>${(typeof document !== 'undefined' && document.getElementById('cfg_ktuNama')?.value) || data.pejabat?.kasubbagTuNama || 'Ahmad Jayadi, S.Hum., MT.'}</div>
          <div>NIP. ${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ktuNip')?.value) || data.pejabat?.kasubbagTuNip || '198702182010121003')}</div>
        </div>

      </div>
    </div>
  `;
}

/**
 * 3. RENDER DAFTAR RINCIAN PEMBAYARAN
 * 100% Plek Ketiplek Format Gambar User (Image 4 / S-46 Multi-Pelaksana)
 * Dikelompokkan berjenjang: Tanggal -> Nama Pelaku (colspan 3) -> Rincian Struk per Pelaku (Nomor 1, 2, ...)
 */
function renderBbmRincianHtml(d) {
  const data = d || getDefaultBbmData();
  const receipt = getBbmReceiptPeriod(data);
  const items = (data.items && data.items.length) ? data.items : [
    {
      id: 1,
      pelaksanaNama: 'Ahmad Jayadi, S.Hum., MT.',
      tanggal: receipt.tanggalBukti,
      kendaraan: 'Mobil',
      platNomor: 'B 2577 KRK',
      jenisBbm: 'Pertamina Dex',
      uraian: 'Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil B 2577 KRK an. Ahmad Jayadi, S.Hum., MT.',
      jumlah: 1000000
    },
    {
      id: 2,
      pelaksanaNama: 'Fitrah Faizal, S.I.Kom.',
      tanggal: receipt.tanggalBukti,
      kendaraan: 'Mobil',
      platNomor: 'B 2577 KRK',
      jenisBbm: 'Pertamina Dex',
      uraian: 'Pengisian Bahan Bakar Minyak (BBM) Pertamina Dex - Mobil B 2577 KRK an. Fitrah Faizal, S.I.Kom.',
      jumlah: 1000000
    }
  ];

  // Group items by date, then by pelaksana
  const dateGroups = {};
  items.forEach(item => {
    const tgl = item.tanggal || receipt.tanggalBukti;
    if (!dateGroups[tgl]) dateGroups[tgl] = {};
    const pel = (item.pelaksanaNama || data.pelaksanaNama || 'Pelaksana BBM').trim();
    if (!dateGroups[tgl][pel]) dateGroups[tgl][pel] = [];
    dateGroups[tgl][pel].push(item);
  });

  let groupedRowsHtml = '';
  Object.keys(dateGroups).forEach(tgl => {
    const tglFormatted = formatTanggalIndoLengkap(tgl);
    // 1. Baris Tanggal: No kosong, Uraian tanggal, Jumlah kosong
    groupedRowsHtml += `
      <tr>
        <td style="border: 1px solid #000; padding: 5px 8px;"></td>
        <td style="border: 1px solid #000; padding: 5px 8px; font-weight: normal;">${tglFormatted}</td>
        <td style="border: 1px solid #000; padding: 5px 8px;"></td>
      </tr>
    `;

    // 2. Baris Pelaku (colspan 3) persis gambar referensi user
    const pelakus = Object.keys(dateGroups[tgl]);
    pelakus.forEach(pelName => {
      groupedRowsHtml += `
        <tr>
          <td colspan="3" style="border: 1px solid #000; padding: 5px 8px; font-weight: normal; text-align: left;">${pelName}</td>
        </tr>
      `;

      // 3. Baris Struk di bawah pelaku tersebut (nomor berulang mulai dari 1)
      dateGroups[tgl][pelName].forEach((item, itemIdx) => {
        const itemUraian = item.uraian || `Pengisian Bahan Bakar Minyak (BBM) ${item.jenisBbm || 'Pertamina Dex'} - ${item.kendaraanPlat || `${item.kendaraan || data.kendaraan || 'Mobil'} ${item.platNomor || data.platNomor || 'B 2577 KRK'}`} an. ${pelName}`;
        groupedRowsHtml += `
          <tr>
            <td style="border: 1px solid #000; padding: 5px 8px; text-align: center;">${itemIdx + 1}</td>
            <td style="border: 1px solid #000; padding: 5px 8px;">${itemUraian}</td>
            <td style="border: 1px solid #000; padding: 5px 8px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Rp</span>
                <span style="font-family: Arial, sans-serif;">${Number(item.jumlah || 0).toLocaleString('en-US')}</span>
              </div>
            </td>
          </tr>
        `;
      });
    });
  });

  return `
    <div class="bbm-paper bbm-paper-rincian" style="padding: 40px 48px; background: #ffffff; color: #000000; font-family: Arial, sans-serif; font-size: 11.5px; line-height: 1.45;">
      
      <!-- JUDUL RESMI TENGAH -->
      <div style="text-align: center; margin-bottom: 28px;">
        <h2 style="font-size: 15px; font-weight: bold; margin: 0;">Daftar Rincian Pembayaran</h2>
      </div>

      <!-- KETERANGAN PERNYATAAN PENANGGUNGJAWAB -->
      <p style="font-size: 11px; line-height: 1.5; margin: 0 0 10px 0; text-align: justify;">
        Yang bertandatangan di bawah ini menyatakan bahwa kami bertanggungjawab atas pengeluaran yang tidak diperoleh kuitansi, dengan perincian sebagai berikut:
      </p>

      <p style="font-size: 11px; margin: 0 0 16px 0;">
        Klasifikasi anggaran : fungsi / sub fungsi / program / kegiatan / output / sub kelompok akun / akun
      </p>

      <!-- TABEL RINCIAN 3 KOLOM PERSIS GAMBAR USER -->
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 11px; margin-bottom: 16px;">
        <thead>
          <tr>
            <th style="width: 45px; border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">No</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">Uraian</th>
            <th style="width: 190px; border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          ${groupedRowsHtml}
          <tr>
            <td style="border: 1px solid #000; padding: 5px 8px;"></td>
            <td style="border: 1px solid #000; padding: 5px 8px; text-align: right; font-weight: bold;">Nilai Total</td>
            <td style="border: 1px solid #000; padding: 5px 8px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Rp</span>
                <span style="font-family: Arial, sans-serif;">${Number(data.nilaiTotal || 0).toLocaleString('en-US')}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- PERNYATAAN PENUTUP RESMI KAS NEGARA -->
      <p style="font-size: 11px; line-height: 1.5; margin: 0 0 28px 0; text-align: justify;">
        Jumlah uang tersebut di atas benar - benar di keluarkan untuk pelaksanaan dukungan atas kegiatan biro kompu, kami bersedia untuk menyetorkan kelebihan tersebut ke kas negara
      </p>

      <!-- TANDA TANGAN PPK KANAN -->
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 320px; font-size: 11px; text-align: left; line-height: 1.35;">
          <div>Jakarta, &nbsp; &nbsp; &nbsp; ${receipt.tanggalKuitansi}</div>
          <div style="margin-top: 3px;">Pejabat Pembuat Komitmen</div>
          <div>Sekretariat Jenderal</div>
          <div>Kementerian Perumahan dan Kawasan Permukiman</div>
          <div style="height: 55px;"></div>
          <div>${(typeof document !== 'undefined' && document.getElementById('cfg_ppkNama')?.value) || data.pejabat?.ppkNama || 'Emanuel Pati Libak'}</div>
          <div>NIP. '${cleanNip((typeof document !== 'undefined' && document.getElementById('cfg_ppkNip')?.value) || data.pejabat?.ppkNip || '197512072010121001')}</div>
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
