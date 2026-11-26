// =====================================================================
// DAFTAR PENGELUARAN RIIL (DPR) PER ORANG
// =====================================================================
function populateDPRSelect() {
  if (!populateEmpDocSelect(
    'dprPegawai',
    'dprOut',
    '<div class="alert-warn">⚠️ Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>'
  )) return;
  loadDPRNo();
  renderDPR();
}

function loadDPRNo() {
  const select = document.getElementById('dprPegawai');
  if (!select || select.value === '') return;
  syncEmpSelectTitle(select);
  const fullVal = spdPerEmployee[Number(select.value)] || '';
  const input = document.getElementById('dprNoSPD');
  if (input) input.value = getSpdNumberPrefix(fullVal);
  updateAllSpdSuffixLabels();
}

function onDPREmployeeChange() {
  loadDPRNo();
  renderDPR();
}

function saveDPRNoSPD() {
  const select = document.getElementById('dprPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  const input = document.getElementById('dprNoSPD');
  const numVal = input ? input.value.trim() : '';
  const fullVal = buildFullSpdFromInput(numVal);
  syncEmpSpdInputs(empId, fullVal);
  renderDPR();
}

function buildDPRKKPHtml(emp, extraClass = '') {
  const alamat = document.getElementById('cfg_alamatSatker')?.value || '';
  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const rawSPD = (spdPerEmployee[emp.id] || '').trim();
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const tanggalSPD = formatTgl(document.getElementById('tglSPD').value);

  const kkpNama = document.getElementById('cfg_kkpNama')?.value || 'Ishaq Abdullah, S.Ars.';
  const kkpNip = document.getElementById('cfg_kkpNip')?.value || '199505122020121002';
  const kkpPangkat = document.getElementById('cfg_kkpPangkat')?.value || 'Penata Muda Tk. I/ IIIb';
  const kkpJabatan = document.getElementById('cfg_kkpJabatan')?.value || 'Penata Kelola Perumahan Ahli Pertama';
  const kkpUnit = document.getElementById('cfg_kkpUnit')?.value || 'Biro Komunikasi Publik';
  const kkpKartuNama = document.getElementById('cfg_kkpKartuNama')?.value || 'Ishaq Abdullah';
  const kkpNomor = document.getElementById('cfg_kkpNomor')?.value || '4895 9403 0010 3147';

  // Anggaran parsing
  const rawSub = (document.getElementById('kodeSubKegiatan')?.value || '').trim();
  const mak = (document.getElementById('mak')?.value || '524111').trim();
  const uraianAkunKKP = (document.getElementById('cfg_kegiatan')?.value || '').trim() || 'Penyelenggaraan Kegiatan Protokoler Kementerian';

  let kodeKegiatanKKP = '7665';
  let kodeOutputKKP = 'EBA';
  let kodeKomponenAkunKKP = `959.100.A.<br>${mak}`;

  if (rawSub) {
    const parts = rawSub.split('.');
    if (parts.length >= 2) {
      kodeKegiatanKKP = parts[0];
      kodeOutputKKP = parts[1];
      const komp = parts.slice(2).join('.');
      kodeKomponenAkunKKP = komp ? `${komp}.<br>${mak}` : mak;
    } else {
      kodeKegiatanKKP = rawSub;
      kodeKomponenAkunKKP = mak;
    }
  }

  const biaya = hitungBiaya(emp);

  // Kumpulkan rincian pengeluaran riil KKP yang diinputkan (bukan uang harian & bukan transport, terutama tiket dan hotel)
  const kkpItems = [];

  // 1. Hotel / Penginapan
  if (biaya.hotel > 0) {
    if (biaya.hotelDetails && biaya.hotelDetails.length > 1) {
      biaya.hotelDetails.forEach(h => {
        if (h.total > 0) {
          const hName = h.name ? (/^hotel/i.test(h.name) ? h.name : `Hotel (${h.name})`) : 'Hotel';
          kkpItems.push({ nama: hName, jumlah: h.total, adaBukti: true });
        }
      });
    } else {
      const firstHotel = biaya.hotelDetails && biaya.hotelDetails[0];
      const hName = (firstHotel && firstHotel.name)
        ? (/^hotel/i.test(firstHotel.name) ? firstHotel.name : `Hotel (${firstHotel.name})`)
        : 'Hotel';
      kkpItems.push({ nama: hName, jumlah: biaya.hotel, adaBukti: true });
    }
  }

  // 2. Tiket Pesawat SBM (jika dicentang / aktif)
  if (biaya.tiket > 0) {
    kkpItems.push({
      nama: 'Tiket Pesawat',
      jumlah: biaya.tiket,
      adaBukti: true
    });
  }

  // 3. Rincian Biaya Tambahan (customCosts: Tiket / Biaya yang bukan transport dan bukan uang harian)
  if (biaya.customCosts && biaya.customCosts.length > 0) {
    biaya.customCosts.forEach(item => {
      if (item.amount <= 0) return;
      const isTransport = item.isTransport || (typeof TRANSPORT_COST_RE !== 'undefined' && TRANSPORT_COST_RE.test(item.name));
      const isTicket = item.isTicket || (typeof TICKET_COST_RE !== 'undefined' && TICKET_COST_RE.test(item.name));
      // Hanya masukkan biaya yang BUKAN transport lokal/taksi/tol/bbm (fokus pada Tiket atau pengeluaran riil KKP lainnya)
      if (!isTransport) {
        let label = item.name;
        if (isTicket && typeof getTicketCostLabel === 'function') {
          label = getTicketCostLabel(item.name);
        }
        kkpItems.push({
          nama: label,
          jumlah: item.amount,
          adaBukti: true
        });
      }
    });
  }

  // Jika belum ada pengeluaran hotel / tiket sama sekali (nominal 0)
  if (kkpItems.length === 0) {
    const cbHotel = document.getElementById('cbHotel')?.checked;
    kkpItems.push({
      nama: cbHotel ? 'Hotel' : 'Hotel / Tiket',
      jumlah: 0,
      adaBukti: false
    });
  }

  let tableRowsHtml = '';
  let totalKKP = 0;

  kkpItems.forEach((item, idx) => {
    totalKKP += item.jumlah;
    tableRowsHtml += `
          <tr>
            <td class="tc">${idx + 1}</td>
            <td class="tc">${escHtml(item.nama)}</td>
            <td class="tc">${kodeKegiatanKKP}</td>
            <td class="tc">${kodeOutputKKP}</td>
            <td class="tc">${kodeKomponenAkunKKP}</td>
            <td class="tc">${escHtml(uraianAkunKKP)}</td>
            <td class="tc">${item.jumlah > 0 ? '√' : ''}</td>
            <td class="tc"></td>
            <td class="tr">${rp(item.jumlah)}</td>
          </tr>
    `;
  });

  // Tambahkan 1 baris kosong estetika seperti format resmi
  tableRowsHtml += `
          <tr>
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
  `;

  const logoSrc = (typeof LOGO_PKP_BASE64 !== 'undefined' && LOGO_PKP_BASE64) ? LOGO_PKP_BASE64 : 'logo-pkp.webp';

  return `
    <section class="dpr-kkp-area${extraClass}">
      <header class="kuitansi-perorangan-header lembar-kendali-header">
        <img src="${logoSrc}" alt="" class="kuitansi-perorangan-logo lembar-kendali-logo">
        <div>
          <div class="kuitansi-perorangan-ministry lembar-kendali-ministry">KEMENTERIAN PERUMAHAN DAN KAWASAN PERMUKIMAN <span>REPUBLIK INDONESIA</span></div>
          <strong class="lembar-kendali-secretariat">SEKRETARIAT JENDERAL</strong>
          <div class="lembar-kendali-unit">SATUAN KERJA</div>
          ${alamat ? `<div class="lembar-kendali-address">${alamat}</div>` : ''}
        </div>
      </header>

      <div class="dpr-kkp-title">
        DAFTAR PENGELUARAN RIIL KEGIATAN PERJALANAN DINAS JABATAN<br>
        DENGAN KARTU KREDIT PEMERINTAH
      </div>

      <div style="margin: 12px 0 4px 0;">Yang bertandatangan di bawah ini:</div>
      <table class="dpr-kkp-meta">
        <tr><td style="width:260px;">Nama</td><td style="width:15px;">:</td><td>${kkpNama}</td></tr>
        <tr><td>NIP</td><td>:</td><td>${kkpNip}</td></tr>
        <tr><td>Pangkat/ Gol. Ruang</td><td>:</td><td>${kkpPangkat}</td></tr>
        <tr><td>Jabatan</td><td>:</td><td>${kkpJabatan}</td></tr>
        <tr><td>Unit Kerja</td><td>:</td><td>${kkpUnit}</td></tr>
        <tr><td>Nama Pemegang Kartu Kredit Pemerintah</td><td>:</td><td>${kkpKartuNama}</td></tr>
        <tr><td>Nomor Kartu Kredit Pemerintah</td><td>:</td><td>${kkpNomor}</td></tr>
      </table>

      <p style="margin: 10px 0 6px 0; text-align: justify; line-height: 1.4;">
        Berdasarkan Surat Perjalanan Dinas (SPD) Nomor ${noSPD} tanggal ${tanggalSPD}, dengan ini kami menyatakan dengan sesungguhnya bahwa:
      </p>
      <div style="margin-bottom: 6px;">1. Rincian pengeluaran riil kegiatan perjalanan dinas jabatan dengan kartu kredit pemerintah sebagai berikut:</div>

      <table class="dpr-kkp-table">
        <thead>
          <tr>
            <th rowspan="2" style="width: 5%;">No.</th>
            <th rowspan="2" style="width: 17%;">Rincian Pengeluaran</th>
            <th colspan="4" style="width: 50%;">Pembebanan Anggaran</th>
            <th colspan="2" style="width: 13%;">Bukti</th>
            <th rowspan="2" style="width: 15%;">Jumlah</th>
          </tr>
          <tr>
            <th style="width: 11%;">Kode Kegiatan</th>
            <th style="width: 10%;">Kode Output</th>
            <th style="width: 14%;">Kode Komponen dan Akun</th>
            <th style="width: 15%;">Uraian Akun</th>
            <th style="width: 6.5%;">Ada</th>
            <th style="width: 6.5%;">Tidak</th>
          </tr>
        </thead>
        <tbody>
${tableRowsHtml}
          <tr class="dpr-kkp-total-row">
            <td colspan="8" class="tc" style="font-weight: bold;">Total</td>
            <td class="tr" style="font-weight: bold;">${rp(totalKKP)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 10px; line-height: 1.4; text-align: justify;">
        2. Jumlah uang tersebut pada angka 1 di atas benar-benar dikeluarkan untuk pembayaran perjalanan dinas dan apabila di kemudian hari terdapat kelebihan atas pembayaran, kami bersedia untuk menyetorkan kelebihan tersebut ke Kas Negara.
      </div>
      <p style="margin-top: 10px; margin-bottom: 20px; text-align: justify;">
        Demikian pernyataan ini kami buat dengan sebenarnya, untuk dipergunakan sebagaimana mestinya.
      </p>

      <table class="dpr-kkp-signatures">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <div>Mengetahui:</div>
            <div>Pemegang Kartu Kredit Pemerintah</div>
            <div style="height: 60px;"></div>
            <div style="font-weight: 500;">${kkpNama}</div>
            <div>NIP. ${kkpNip}</div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 20px;">
            <div>${kotaAsal}, ${tanggalSPD}</div>
            <div>Pelaksana SPD,</div>
            <div style="height: 60px;"></div>
            <div style="font-weight: 500;">${emp.nama}</div>
            <div>NIP. ${emp.nip}</div>
          </td>
        </tr>
      </table>
    </section>
  `;
}

function buildDPRLSHtml(emp, extraClass = '') {
  const alamat = document.getElementById('cfg_alamatKuitansi')?.value || document.getElementById('cfg_alamatSatker')?.value || '';
  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const tujuan = getTujuanDisplay(kotaTeks);
  const rawSPD = (spdPerEmployee[emp.id] || '').trim();
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const tanggalSPD = formatTgl(document.getElementById('tglSPD')?.value || document.getElementById('tglST')?.value);
  const ppkNama = document.getElementById('cfg_ppkNama')?.value || '';
  const ppkNip = document.getElementById('cfg_ppkNip')?.value || '';
  const ppkJabatan = document.getElementById('cfg_ppkJabatan')?.value || '';
  const biaya = hitungBiaya(emp);
  const dprAmount = Number(biaya.dpr) || 0;
  const transportCosts = biaya.customCosts.filter(item => item.isTransport && item.amount > 0);
  const transportExtra = transportCosts.reduce((total, item) => total + item.amount, 0);
  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  const isSekitarNoDetails = (dprAmount === 0 && transportCosts.length === 0 && sbm && sbm.isSekitarJakarta);
  const defaultSekitarTotal = isSekitarNoDetails ? sbm.dpr : 0;
  const grandDprTotal = dprAmount + transportExtra + defaultSekitarTotal;

  let dprRowsHtml = '';
  let rowNo = 1;

  if (dprAmount > 0) {
    dprRowsHtml += `
      <tr>
        <td class="tc">${rowNo++}</td>
        <td>
          <div class="dpr-uraian-title">Daftar Pengeluaran Riil</div>
          <div>${kotaAsal} - ${tujuan} (PP)</div>
          <div>1 orang x 1 hari x @${dprAmount.toLocaleString('id-ID')}</div>
        </td>
        <td class="dpr-jumlah">${rp(dprAmount)}</td>
      </tr>`;
  } else if (isSekitarNoDetails) {
    dprRowsHtml += `
      <tr>
        <td class="tc">${rowNo++}</td>
        <td>
          <div class="dpr-uraian-title">Transportasi Darat (DPR)</div>
          <div>${kotaAsal} - ${tujuan} (PP)</div>
          <div>1 orang x PP (SBM One Way @${rp(sbm.dprOneWay)} &times; 2)</div>
        </td>
        <td class="dpr-jumlah">${rp(defaultSekitarTotal)}</td>
      </tr>`;
  }

  const hasDates = transportCosts.some(t => t.date);
  if (hasDates) {
    const groups = {};
    transportCosts.forEach(item => {
      const dKey = item.date || 'tanpa_tanggal';
      if (!groups[dKey]) groups[dKey] = [];
      groups[dKey].push(item);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'tanpa_tanggal') return 1;
      if (b === 'tanpa_tanggal') return -1;
      return a.localeCompare(b);
    });
    sortedKeys.forEach(dateKey => {
      const items = groups[dateKey];
      const groupColor = (typeof getTransportDateColor === 'function') ? getTransportDateColor(emp.id, dateKey) : '#fef3c7';
      if (dateKey !== 'tanpa_tanggal') {
        const dateDisplay = typeof formatTgl === 'function' ? formatTgl(dateKey) : dateKey;
        dprRowsHtml += `
          <tr class="dpr-date-group-row" style="background-color: ${groupColor}; font-weight: 700;">
            <td style="background-color: ${groupColor};"></td>
            <td colspan="2" style="font-weight: 700; color: #000; background-color: ${groupColor}; padding-left: 10px;">${dateDisplay}</td>
          </tr>`;
      }
      items.forEach(item => {
        const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
        dprRowsHtml += `
          <tr>
            <td class="tc">${rowNo++}</td>
            <td style="${dateKey !== 'tanpa_tanggal' ? 'padding-left: 20px;' : ''}">
              <div class="dpr-uraian-title">${escHtml(item.name)}</div>
              <div>${escHtml(route || (kotaAsal + ' - ' + tujuan + ' (PP)'))}</div>
            </td>
            <td class="dpr-jumlah">${rp(item.amount)}</td>
          </tr>`;
      });
    });
  } else {
    transportCosts.forEach(item => {
      const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
      dprRowsHtml += `
        <tr>
          <td class="tc">${rowNo++}</td>
          <td>
            <div class="dpr-uraian-title">${escHtml(item.name)}</div>
            <div>${escHtml(route || (kotaAsal + ' - ' + tujuan + ' (PP)'))}</div>
          </td>
          <td class="dpr-jumlah">${rp(item.amount)}</td>
        </tr>`;
    });
  }

  if (!dprRowsHtml) {
    dprRowsHtml = `
      <tr>
        <td class="tc">1</td>
        <td>
          <div class="dpr-uraian-title">Daftar Pengeluaran Riil</div>
          <div>${kotaAsal} - ${tujuan} (PP)</div>
        </td>
        <td class="dpr-jumlah">${rp(0)}</td>
      </tr>`;
  }

  const logoSrc = (typeof LOGO_PKP_BASE64 !== 'undefined' && LOGO_PKP_BASE64) ? LOGO_PKP_BASE64 : 'logo-pkp.webp';

  return `
    <section class="dpr-area${extraClass}">
      <header class="kuitansi-perorangan-header lembar-kendali-header">
        <img src="${logoSrc}" alt="" class="kuitansi-perorangan-logo lembar-kendali-logo">
        <div>
          <div class="kuitansi-perorangan-ministry lembar-kendali-ministry">KEMENTERIAN PERUMAHAN DAN KAWASAN PERMUKIMAN <span>REPUBLIK INDONESIA</span></div>
          <strong class="lembar-kendali-secretariat">SEKRETARIAT JENDERAL</strong>
          <div class="lembar-kendali-unit">SATUAN KERJA</div>
          <div class="lembar-kendali-address">${alamat}</div>
        </div>
      </header>

      <h2>Daftar Pengeluaran Riil</h2>

      <table class="dpr-meta">
        <tr><td>Nama</td><td>:</td><td>${emp.nama}</td></tr>
        <tr><td>NIP</td><td>:</td><td>${emp.nip}</td></tr>
        <tr><td>Jabatan</td><td>:</td><td>${emp.jabatan}</td></tr>
      </table>

      <p class="dpr-text">Berdasarkan Surat Perjalanan Dinas (SPD) nomor ${noSPD} tanggal ${tanggalSPD} dengan ini kami menyatakan dengan sesungguhnya bahwa :</p>

      <ol class="dpr-list">
        <li>Biaya transport pegawai dan/atau biaya penginapan di bawah ini yang tidak dapat diperoleh bukti-bukti pengeluarannya, meliputi :
          <table class="dpr-tbl">
            <colgroup><col style="width:7%"><col style="width:63%"><col style="width:30%"></colgroup>
            <thead><tr><th>No.</th><th>Uraian</th><th>Jumlah</th></tr></thead>
            <tbody>
              ${dprRowsHtml}
              <tr><td colspan="2" class="dpr-total-label">Jumlah</td><td class="dpr-jumlah">${rp(grandDprTotal)}</td></tr>
            </tbody>
          </table>
        </li>
        <li>Jumlah uang tersebut pada angka 1 di atas benar-benar dikeluarkan untuk pelaksanaan perjalanan dinas dimaksud dan apabila di kemudian hari terdapat kelebihan atas pembayaran, kami bersedia untuk menyetorkan kelebihan tersebut ke Kas Negara.</li>
      </ol>

      <p class="dpr-closing">Demikian pernyataan ini kami buat dengan sebenarnya, untuk dipergunakan sebagaimana mestinya.</p>

      <div class="dpr-signatures">
        <div>
          <div>Mengetahui/Menyetujui:</div>
          <div>${jabatanDuaBaris(ppkJabatan)}</div>
          <div class="dpr-sig-space"></div>
          <div>${ppkNama}</div>
          <div>${ppkNip}</div>
        </div>
        <div>
          <div>${kotaAsal}, ${tanggalSPD}</div>
          <div>Pelaksana Perjalanan Dinas</div>
          <div class="dpr-sig-space"></div>
          <div>${emp.nama}</div>
          <div>NIP. ${emp.nip}</div>
        </div>
      </div>
    </section>
  `;
}

function renderDPR() {
  const out = document.getElementById('dprOut');
  if (!out) return;
  const select = document.getElementById('dprPegawai');
  if (!select || select.value === '') {
    out.innerHTML = '<div class="alert-warn no-print">⚠️ Pilih pegawai untuk menampilkan lembar DPR.</div>';
    return;
  }
  const emp = employees.find(employee => employee.id === Number(select.value));
  if (!emp) {
    out.innerHTML = '<div class="alert-warn no-print">⚠️ Pegawai tidak ditemukan.</div>';
    return;
  }

  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  if (isKKP) {
    // DPR KKP wajib untuk berkas KKP (isinya pertiketan & hotel saja)
    out.innerHTML = buildDPRKKPHtml(emp);
    return;
  }

  // Untuk metode LS: Lembar DPR Perorangan hanya untuk DKI Jakarta (DPR Rp 170.000)
  const isDki = typeof isTripToDki === 'function' ? isTripToDki() : false;
  if (!isDki) {
    out.innerHTML = `
      <div class="alert-warn no-print" style="margin: 28px auto; max-width: 680px; text-align: center; padding: 32px 24px; border-radius: 14px; background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1.5px solid #fcd34d; color: #92400e; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.08);">
        <div style="font-size: 34px; margin-bottom: 12px;">📋</div>
        <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #78350f;">Lembar DPR Perorangan Hanya Berlaku untuk Kegiatan di DKI Jakarta</div>
        <p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.6; color: #92400e;">
          Berdasarkan ketentuan perjalanan dinas LS, lembar <strong>Daftar Pengeluaran Riil (DPR)</strong> hanya diterbitkan untuk perjalanan dinas dalam kota <strong>DKI Jakarta (Rp 170.000)</strong>.<br>
          Untuk perjalanan dinas luar kota/luar Jakarta, pertanggungjawaban biaya transport menggunakan kuitansi riil/nominatif dan tidak memerlukan lembar DPR.
        </p>
        <div style="display: inline-block; background: rgba(255,255,255,0.85); border: 1px solid #fde68a; border-radius: 8px; padding: 7px 16px; font-size: 12px; color: #b45309; font-weight: 500;">
          💳 <em>Jika kegiatan ini menggunakan Kartu Kredit Pemerintah, pilih metode <strong>KKP</strong> pada formulir untuk mencetak DPR KKP (Hotel &amp; Tiket).</em>
        </div>
      </div>
    `;
    return;
  }

  out.innerHTML = buildDPRLSHtml(emp);
}

function printDPR() {
  const select = document.getElementById('dprPegawai');
  if (!select || !select.value) {
    if (typeof showValidationToast === 'function') {
      showValidationToast([{ label: 'Pegawai' }], 'Pilih pegawai terlebih dahulu!');
    }
    return;
  }
  const empId = Number(select.value);
  const emp = employees.find(e => e.id === empId);

  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  const isDki = typeof isTripToDki === 'function' ? isTripToDki() : false;
  if (!isKKP && !isDki) {
    const msg = 'Lembar DPR (LS) hanya diterbitkan untuk Perjalanan Dinas dalam kota DKI Jakarta (Rp 170.000) atau perjalanan dengan metode KKP.';
    if (typeof showValidationToast === 'function') {
      showValidationToast([{ label: 'DPR' }], msg);
    } else {
      alert(msg);
    }
    return;
  }

  const noSPD = (spdPerEmployee[empId] || '').trim();
  if (!noSPD) {
    const msg = `Nomor SPD Perorangan untuk ${emp ? emp.nama.split(',')[0] : 'pegawai'} WAJIB diisi sebelum mencetak!`;
    if (typeof showValidationToast === 'function') {
      showValidationToast([{ label: 'No. SPD Perorangan' }], msg);
    } else {
      alert(msg);
    }
    const input = document.getElementById('dprNoSPD');
    if (input) { 
      input.focus(); 
      input.classList.add('has-error'); 
      input.closest('.spd-prefix-wrap')?.classList.add('has-error');
    }
    return;
  }
  if (typeof renderDPR === 'function') renderDPR();
  const clearPrintMode = () => document.body.classList.remove('print-dpr');
  document.body.classList.add('print-dpr');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

function printAllDPR() {
  if (selectedEmpIds.size === 0) return;
  const missing = [];
  [...selectedEmpIds].forEach(id => {
    const no = (spdPerEmployee[id] || '').trim();
    if (!no) {
      const e = employees.find(emp => emp.id === id);
      missing.push(e ? e.nama.split(',')[0] : `ID ${id}`);
    }
  });
  if (missing.length > 0) {
    const msg = `Nomor SPD Perorangan wajib diisi untuk semua pegawai sebelum mencetak! (Belum diisi: ${missing.join(', ')})`;
    if (typeof showValidationToast === 'function') {
      showValidationToast([{ label: 'No. SPD Perorangan' }], msg);
    } else {
      alert(msg);
    }
    return;
  }

  const out = document.getElementById('dprOut');
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  const isDki = typeof isTripToDki === 'function' ? isTripToDki() : false;
  if (!isKKP && !isDki) {
    const msg = 'Lembar DPR (LS) hanya diterbitkan untuk Perjalanan Dinas dalam kota DKI Jakarta (Rp 170.000) atau perjalanan dengan metode KKP.';
    if (typeof showValidationToast === 'function') {
      showValidationToast([{ label: 'DPR' }], msg);
    } else {
      alert(msg);
    }
    return;
  }

  let allHtml = '';
  const emps = [...selectedEmpIds].map(id => employees.find(e => e.id === id)).filter(Boolean);
  emps.forEach((emp, idx) => {
    const pageBreakClass = (idx < emps.length - 1) ? ' page-break' : '';
    allHtml += isKKP ? buildDPRKKPHtml(emp, pageBreakClass) : buildDPRLSHtml(emp, pageBreakClass);
  });

  out.innerHTML = allHtml;
  const clearPrintMode = () => {
    document.body.classList.remove('print-dpr');
    renderDPR();
  };
  document.body.classList.add('print-dpr');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}


