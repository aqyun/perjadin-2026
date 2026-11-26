// =====================================================================
// TEMPLATE DOKUMEN CETAK & REKAPITULASI (PerdinKu)
// Kuitansi, SPPD, Rincian, DPR, Lembar Kendali, Rekap Kuitansi,
// Rekap Rincian, Rekap SPT, dan Daftar Nominatif
// =====================================================================

// =====================================================================
// RENDER DAFTAR NOMINATIF
// =====================================================================
function renderRekapKuitansi() {
  const out = document.getElementById('rekapKuitansiOut');
  const dateValue = document.getElementById('tglSPD')?.value || document.getElementById('tglST')?.value || '';
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  const year = date.getFullYear();
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const monthInput = document.getElementById('bulanKuitansi');
  if (monthInput && !monthInput.value) monthInput.value = months[date.getMonth()];
  const month = (monthInput ? monthInput.value.trim() : '') || months[date.getMonth()];

  if (selectedEmpIds.size === 0) {
    if (out) out.innerHTML = '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const selectedEmps = [...selectedEmpIds].map(id => employees.find(emp => emp.id === id)).filter(Boolean);
  const grandTotal = selectedEmps.reduce((total, emp) => total + (hitungBiaya(emp)?.total || 0), 0);
  const satker = document.getElementById('cfg_satker')?.value || '';
  const nomorBukti = document.getElementById('cfg_noBuktiKuitansi')?.value || '-';
  const kodeKegiatan = document.getElementById('kodeKegiatan')?.value || '';
  const kodeSubKegiatan = document.getElementById('kodeSubKegiatan')?.value || '';
  const mak = document.getElementById('mak')?.value || '';
  const agenda = (document.getElementById('agenda')?.value || '').trim();
  const kegiatan = (document.getElementById('cfg_kegiatan')?.value || '').trim();
  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || '';
  const ppkNama = document.getElementById('cfg_ppkNama')?.value || '';
  const ppkNip = document.getElementById('cfg_ppkNip')?.value || '';
  const bendNama = document.getElementById('cfg_bendNama')?.value || '';
  const bendNip = document.getElementById('cfg_bendNip')?.value || '';
  const monthYear = `${month} ${year}`;
  const makLengkap = `${kodeKegiatan}.${kodeSubKegiatan}.${mak}`;
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const paymentText = [agenda || `Perjalanan dinas ke ${kotaTeks ? (typeof getTujuanDisplay === 'function' ? getTujuanDisplay(kotaTeks) : kotaTeks) : '-'}`, kegiatan ? `Output ${kegiatan}` : '']
    .filter(Boolean)
    .join(', ');
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';

  out.innerHTML = `
    <section class="kuitansi-area">
      <h2>${isKKP ? 'KUITANSI KKP' : 'KUITANSI LS'}</h2>
      <div class="kuitansi-frame">
        <table class="kuitansi-reference">
          <tr><td>TA</td><td>:</td><td>${year}</td></tr>
          <tr><td>Nomor Bukti</td><td>:</td><td><span class="kuitansi-bukti-space"></span>${nomorBukti}</td></tr>
          <tr><td>MAK</td><td>:</td><td>${makLengkap}</td></tr>
        </table>

        <table class="kuitansi-details">
          <tr>
            <td>Sudah terima dari</td><td>:</td>
            <td>Kuasa Pengguna Anggaran/Pejabat Pembuat Komitmen<br>${satker}</td>
          </tr>
          <tr><td>Jumlah Uang</td><td>:</td><td>Rp&nbsp;&nbsp;${Number(grandTotal).toLocaleString('id-ID')}</td></tr>
          <tr><td>Terbilang</td><td>:</td><td>${terbilang(grandTotal)}</td></tr>
          <tr><td>Untuk pembayaran</td><td>:</td><td>${paymentText}</td></tr>
        </table>

        <div class="kuitansi-bendahara">
          <div>${kotaAsal}, <span class="kuitansi-day-blank"></span> ${monthYear}</div>
          <div>Bendahara Pengeluaran</div>
          <div>Satuan Kerja Sekretariat Jenderal Kementerian PKP</div>
          <div class="kuitansi-signature-space"></div>
          <div>${bendNama}</div>
          <div>${bendNip}</div>
        </div>

        <div class="kuitansi-approval">
          <div>Setuju dibayar :</div>
          <div>a.n. Kuasa Pengguna Anggaran</div>
          <div>Pejabat Pembuat Komitmen</div>
          <div>Sekretariat Jenderal Kementerian PKP</div>
          <div class="kuitansi-signature-space"></div>
          <div>${ppkNama}</div>
          <div>${ppkNip}</div>
        </div>
      </div>
    </section>
  `;
}

function printRekapKuitansi() {
  const clearPrintMode = () => document.body.classList.remove('print-kuitansi');
  document.body.classList.add('print-kuitansi');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

function syncEmpSelectTitle(selectOrId) {
  const select = typeof selectOrId === 'string' ? document.getElementById(selectOrId) : selectOrId;
  if (!select) return;
  const opt = select.options && select.selectedIndex >= 0 ? select.options[select.selectedIndex] : null;
  select.title = (opt && select.value !== '') ? opt.textContent : '';
}

function populateEmpDocSelect(selectId, emptyOutId, emptyHtml) {
  const select = document.getElementById(selectId);
  if (!select) return false;
  const previousValue = select.value;
  select.innerHTML = '<option value="">-- Pilih Pegawai --</option>';
  [...selectedEmpIds].forEach(id => {
    const emp = employees.find(employee => employee.id === id);
    if (!emp) return;
    const option = document.createElement('option');
    option.value = id;
    option.textContent = emp.nama;
    option.title = emp.nama;
    select.appendChild(option);
  });

  if (selectedEmpIds.size === 0) {
    const out = emptyOutId ? document.getElementById(emptyOutId) : null;
    if (out) out.innerHTML = emptyHtml;
    syncEmpSelectTitle(select);
    return false;
  }

  const previousId = Number(previousValue);
  select.value = previousValue !== '' && selectedEmpIds.has(previousId) ? previousValue : String([...selectedEmpIds][0]);
  syncEmpSelectTitle(select);
  return true;
}

function populateKuitansiPeroranganSelect() {
  if (!populateEmpDocSelect(
    'kuitansiPeroranganPegawai',
    'kuitansiPeroranganOut',
    '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>'
  )) return;
  loadKuitansiPeroranganSPD();
  renderKuitansiPerorangan();
}

function getSpdSuffix() {
  const tglVal = document.getElementById('tglST')?.value || document.getElementById('tglSPD')?.value || '';
  let month = '10';
  let year = '2026';
  if (tglVal) {
    const parts = tglVal.split('-');
    if (parts.length >= 2) {
      year = parts[0] || '2026';
      month = parts[1] || '10';
    }
  } else {
    const now = new Date();
    month = String(now.getMonth() + 1).padStart(2, '0');
    year = String(now.getFullYear());
  }
  return `/SPD/Birkom/${month}/${year}`;
}

function getSpdNumberPrefix(fullSpd) {
  if (!fullSpd) return '';
  const str = String(fullSpd).trim();
  const idx = str.indexOf('/');
  if (idx !== -1) {
    return str.substring(0, idx).trim();
  }
  return str;
}

function buildFullSpdFromInput(numInput) {
  if (!numInput) return '';
  const num = String(numInput).trim();
  if (!num) return '';
  if (num.includes('/')) {
    return num;
  }
  return `${num}${getSpdSuffix()}`;
}

function updateAllSpdSuffixLabels() {
  const suffix = getSpdSuffix();
  ['kuitansiPeroranganNoSPDSuffix', 'sppdNoSPDSuffix', 'rincianNoSPDSuffix', 'dprNoSPDSuffix'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = suffix;
  });
}

function loadKuitansiPeroranganSPD() {
  const select = document.getElementById('kuitansiPeroranganPegawai');
  if (!select || select.value === '') return;
  syncEmpSelectTitle(select);
  const fullVal = spdPerEmployee[Number(select.value)] || '';
  const input = document.getElementById('kuitansiPeroranganNoSPD');
  if (input) input.value = getSpdNumberPrefix(fullVal);
  updateAllSpdSuffixLabels();
}

function onKuitansiPeroranganEmployeeChange() {
  loadKuitansiPeroranganSPD();
  renderKuitansiPerorangan();
}

function syncEmpSpdInputs(empId, val) {
  if (empId === null || empId === undefined || isNaN(empId)) return;
  spdPerEmployee[empId] = val;
  const prefix = getSpdNumberPrefix(val);

  const kpSelect = document.getElementById('kuitansiPeroranganPegawai');
  if (kpSelect && Number(kpSelect.value) === empId) {
    const kpInput = document.getElementById('kuitansiPeroranganNoSPD');
    if (kpInput && kpInput.value !== prefix) kpInput.value = prefix;
    if (kpInput) {
      if (prefix) {
        kpInput.classList.remove('has-error');
        kpInput.closest('.spd-prefix-wrap')?.classList.remove('has-error');
      }
    }
  }
  const sppdSelect = document.getElementById('sppdPegawai');
  if (sppdSelect && Number(sppdSelect.value) === empId) {
    const sppdInput = document.getElementById('sppdNoSPD');
    if (sppdInput && sppdInput.value !== prefix) sppdInput.value = prefix;
    if (sppdInput) {
      if (prefix) {
        sppdInput.classList.remove('has-error');
        sppdInput.closest('.spd-prefix-wrap')?.classList.remove('has-error');
      }
    }
  }
  const rincianSelect = document.getElementById('rincianPegawai');
  if (rincianSelect && Number(rincianSelect.value) === empId) {
    const rincianInput = document.getElementById('rincianNoSPD');
    if (rincianInput && rincianInput.value !== prefix) rincianInput.value = prefix;
    if (rincianInput) {
      if (prefix) {
        rincianInput.classList.remove('has-error');
        rincianInput.closest('.spd-prefix-wrap')?.classList.remove('has-error');
      }
    }
  }
  const dprSelect = document.getElementById('dprPegawai');
  if (dprSelect && Number(dprSelect.value) === empId) {
    const dprInput = document.getElementById('dprNoSPD');
    if (dprInput && dprInput.value !== prefix) dprInput.value = prefix;
    if (dprInput) {
      if (prefix) {
        dprInput.classList.remove('has-error');
        dprInput.closest('.spd-prefix-wrap')?.classList.remove('has-error');
      }
    }
  }
  updateAllSpdSuffixLabels();
}

function saveKuitansiPeroranganSPD() {
  const select = document.getElementById('kuitansiPeroranganPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  const input = document.getElementById('kuitansiPeroranganNoSPD');
  const numVal = input ? input.value.trim() : '';
  const fullVal = buildFullSpdFromInput(numVal);
  syncEmpSpdInputs(empId, fullVal);
  renderKuitansiPerorangan();
}

function buildKuitansiHtml(emp) {
  if (!emp) return '';
  const biaya = typeof hitungBiaya === 'function' ? hitungBiaya(emp) : { total: 0 };
  const tanggalSPDValue = document.getElementById('tglSPD')?.value || document.getElementById('tglST')?.value;
  const tanggalSPD = formatTgl(tanggalSPDValue);
  const date = tanggalSPDValue ? new Date(`${tanggalSPDValue}T00:00:00`) : new Date();
  const tahun = date.getFullYear();
  const nomorBukti = document.getElementById('cfg_noBuktiKuitansi')?.value || '';
  const satker = document.getElementById('cfg_satker')?.value || '';
  const alamat = document.getElementById('cfg_alamatKuitansi')?.value || '';
  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || '';
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const tujuan = typeof getTujuanDisplay === 'function' ? getTujuanDisplay(kotaTeks) : kotaTeks;
  const paymentText = `Biaya Perjalanan Dinas atas nama ${emp.nama}`;
  const mak = `${document.getElementById('kodeKegiatan')?.value || ''} ${document.getElementById('kodeSubKegiatan')?.value || ''} ${document.getElementById('mak')?.value || ''}`.trim();
  const rawSPD = (typeof spdPerEmployee !== 'undefined' && spdPerEmployee[emp.id]) ? spdPerEmployee[emp.id].trim() : '';
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const ppkNama = document.getElementById('cfg_ppkNama')?.value || '';
  const ppkNip = document.getElementById('cfg_ppkNip')?.value || '';
  const ppkJabatan = document.getElementById('cfg_ppkJabatan')?.value || '';
  const bendNama = document.getElementById('cfg_bendNama')?.value || '';
  const bendNip = document.getElementById('cfg_bendNip')?.value || '';
  const isKKP = ((document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP');
  const logoSrc = (typeof LOGO_PKP_BASE64 !== 'undefined' && LOGO_PKP_BASE64) ? LOGO_PKP_BASE64 : 'logo-pkp.webp';

  return `
    <section class="kuitansi-perorangan-area">
      <header class="kuitansi-perorangan-header lembar-kendali-header">
        <img src="${logoSrc}" alt="" class="kuitansi-perorangan-logo lembar-kendali-logo">
        <div>
          <div class="kuitansi-perorangan-ministry lembar-kendali-ministry">KEMENTERIAN PERUMAHAN DAN KAWASAN PERMUKIMAN <span>REPUBLIK INDONESIA</span></div>
          <strong class="lembar-kendali-secretariat">SEKRETARIAT JENDERAL</strong>
          <div class="lembar-kendali-unit">SATUAN KERJA</div>
          <div class="lembar-kendali-address">${alamat}</div>
        </div>
      </header>

      <table class="kuitansi-perorangan-reference">
        <tr><td>Tahun Anggaran</td><td>:</td><td>${tahun}</td></tr>
        <tr><td>Bukti Kas No.</td><td>:</td><td><span class="kuitansi-perorangan-bukti-space"></span>${nomorBukti}</td></tr>
        <tr><td>Mata Anggaran</td><td>:</td><td>${mak}</td></tr>
      </table>

      <h2 class="kuitansi-perorangan-title">${isKKP ? 'KUITANSI KKP' : 'K W I T A N S I'}</h2>
      <table class="kuitansi-perorangan-details">
        <tr><td>Sudah Terima dari</td><td>:</td><td>${jabatanDuaBaris(ppkJabatan)}</td></tr>
        <tr><td>Uang Sebesar</td><td>:</td><td>Rp. &nbsp; ${Number(biaya.total).toLocaleString('id-ID')}</td></tr>
        <tr><td>Terbilang</td><td>:</td><td><em>${terbilang(biaya.total)}</em></td></tr>
        <tr><td>Untuk Pembayaran</td><td>:</td><td>${paymentText}</td></tr>
        <tr><td>Berdasarkan SPD</td><td>:</td><td></td></tr>
        <tr><td>Nomor</td><td>:</td><td>${noSPD}</td></tr>
        <tr><td>Tanggal</td><td>:</td><td>${tanggalSPD}</td></tr>
        <tr><td>Untuk Perjalanan Dinas dari</td><td>:</td><td>${kotaAsal} ke ${tujuan} &nbsp; (PP)</td></tr>
      </table>

      <div class="kuitansi-perorangan-recipient">
        <div>${kotaAsal}, ${tanggalSPD}</div>
        <div>Yang Menerima</div>
        <div class="kuitansi-perorangan-signature-space"></div>
        <div>${emp.nama}</div>
        <div>NIP. ${emp.nip}</div>
      </div>

      <div class="kuitansi-perorangan-approvals">
        <div>
          <div>Setuju dibebankan pada mata anggaran berkenaan,</div>
          <div>a.n. Kuasa Pengguna Anggaran</div>
          <div>Pejabat Pembuat Komitmen</div>
          <div>Sekretariat Jenderal Kementerian PKP</div>
          <div class="kuitansi-perorangan-approval-space"></div>
          <div>${ppkNama}</div>
          <div>${ppkNip}</div>
        </div>
        <div>
          <div class="kuitansi-perorangan-approval-space-sm"></div>
          <div>Lunas dibayar tanggal</div>
          <div>Bendahara Pengeluaran</div>
          <div class="kuitansi-perorangan-approval-space"></div>
          <div>${bendNama}</div>
          <div>${bendNip}</div>
        </div>
      </div>
    </section>
  `;
}

function renderKuitansiPerorangan(targetEmp) {
  const out = document.getElementById('kuitansiPeroranganOut');
  if (!out) return;
  const select = document.getElementById('kuitansiPeroranganPegawai');
  let emp = targetEmp;
  if (!emp) {
    if (!select || select.value === '') {
      out.innerHTML = '';
      return;
    }
    const id = Number(select.value);
    emp = (typeof employees !== 'undefined' ? employees : []).find(employee => employee.id === id);
  }
  if (!emp) {
    out.innerHTML = '';
    return;
  }
  out.innerHTML = buildKuitansiHtml(emp);
}

function printKuitansiPerorangan() {
  const select = document.getElementById('kuitansiPeroranganPegawai');
  const empId = Number(select.value);
  const emp = employees.find(e => e.id === empId);
  const noSPD = (spdPerEmployee[empId] || '').trim();
  if (!noSPD) {
    const msg = `Nomor SPD Perorangan untuk ${emp ? emp.nama.split(',')[0] : 'pegawai'} WAJIB diisi sebelum mencetak!`;
    if (typeof showValidationToast === 'function') {
      showValidationToast([{ label: 'No. SPD Perorangan' }], msg);
    } else {
      alert(msg);
    }
    const input = document.getElementById('kuitansiPeroranganNoSPD');
    if (input) { 
      input.focus(); 
      input.classList.add('has-error'); 
      input.closest('.spd-prefix-wrap')?.classList.add('has-error');
    }
    return;
  }
  const clearPrintMode = () => document.body.classList.remove('print-kuitansi-perorangan');
  document.body.classList.add('print-kuitansi-perorangan');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

function populateSPPDSelect() {
  if (!populateEmpDocSelect(
    'sppdPegawai',
    'sppdOut',
    '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>'
  )) return;
  loadSPPDNo();
  renderSPPDPerorangan();
}

function loadSPPDNo() {
  const select = document.getElementById('sppdPegawai');
  if (!select || select.value === '') return;
  syncEmpSelectTitle(select);
  const fullVal = spdPerEmployee[Number(select.value)] || '';
  const input = document.getElementById('sppdNoSPD');
  if (input) input.value = getSpdNumberPrefix(fullVal);
  updateAllSpdSuffixLabels();
}

function onSPPDEmployeeChange() {
  loadSPPDNo();
  renderSPPDPerorangan();
}

function saveSPPDNo() {
  const select = document.getElementById('sppdPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  const input = document.getElementById('sppdNoSPD');
  const numVal = input ? input.value.trim() : '';
  const fullVal = buildFullSpdFromInput(numVal);
  syncEmpSpdInputs(empId, fullVal);
  renderSPPDPerorangan();
}

function buildSPPDHtml(emp) {
  if (!emp) return '';
  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  const empSegments = typeof getEmpSegments === 'function' ? getEmpSegments(emp.id) : [];
  const { days } = typeof getEmpDays === 'function' ? getEmpDays(emp.id) : { days: 1 };
  const satker = document.getElementById('cfg_satker')?.value || '';
  const alamat = document.getElementById('cfg_alamatKuitansi')?.value || '';
  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || '';
  const ppkNama = document.getElementById('cfg_ppkNama')?.value || '';
  const ppkNip = document.getElementById('cfg_ppkNip')?.value || '';
  const ppkJabatan = document.getElementById('cfg_ppkJabatan')?.value || '';
  const kegiatan = document.getElementById('cfg_kegiatan')?.value || '';
  const kodeKegiatan = document.getElementById('kodeKegiatan')?.value || '';
  const kodeSubKegiatan = document.getElementById('kodeSubKegiatan')?.value || '';
  const mak = document.getElementById('mak')?.value || '';
  const agenda = (document.getElementById('agenda')?.value || '').trim() || '-';
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const tujuan = typeof getTujuanDisplay === 'function' ? getTujuanDisplay(kotaTeks) : kotaTeks;
  const rawSPD = (typeof spdPerEmployee !== 'undefined' && spdPerEmployee[emp.id]) ? spdPerEmployee[emp.id].trim() : '';
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const tanggalSPD = formatTgl(document.getElementById('tglSPD')?.value);
  const tripDays = typeof expandTripDays === 'function' ? expandTripDays(empSegments) : [];
  const tripContiguous = tripDays.length > 0 && tripDays.length === (typeof daySpan === 'function' ? daySpan(tripDays[0], tripDays[tripDays.length - 1]) : tripDays.length);
  const tglBerangkat = !tripContiguous && tripDays.length > 1
    ? `${typeof formatTanggalList === 'function' ? formatTanggalList(tripDays.slice(0, -1)) : ''}, dan`
    : formatTgl(empSegments.length ? empSegments[0].start : document.getElementById('tglBerangkat')?.value);
  const tglKembali = formatTgl(tripDays.length ? tripDays[tripDays.length - 1] : (empSegments.length ? empSegments[empSegments.length - 1].end : document.getElementById('tglKembali')?.value));
  const noST = (document.getElementById('noST')?.value || '').trim() || '-';
  const tglST = formatTgl(document.getElementById('tglST')?.value);
  const pangkat = emp.pangkat && emp.pangkat !== '-' ? emp.pangkat : '-';
  const hasPesawatCost = typeof getCustomCosts === 'function' && getCustomCosts().some(c => /pesawat|udara/i.test(c.name) || (c.kind === 'tiket' && /pesawat/i.test(c.name)));
  const transport = (document.getElementById('cbTiket')?.checked || hasPesawatCost) ? 'Pesawat Udara' : 'Transportasi Darat';
  const lamaKata = terbilang(days).replace(/\s*Rupiah$/, '').toLowerCase();
  const pengikutRows = [1, 2, 3, 4, 5].map(() => `
        <tr><td></td><td></td><td></td></tr>`).join('');
  const pengikutNums = [1, 2, 3, 4, 5].map(number => `<tr><td>${number}.</td></tr>`).join('');
  const logoSrc = (typeof LOGO_PKP_BASE64 !== 'undefined' && LOGO_PKP_BASE64) ? LOGO_PKP_BASE64 : 'logo-pkp.webp';

  return `
    <section class="sppd-area">
      <header class="kuitansi-perorangan-header lembar-kendali-header">
        <img src="${logoSrc}" alt="" class="kuitansi-perorangan-logo lembar-kendali-logo">
        <div>
          <div class="kuitansi-perorangan-ministry lembar-kendali-ministry">KEMENTERIAN PERUMAHAN DAN KAWASAN PERMUKIMAN <span>REPUBLIK INDONESIA</span></div>
          <strong class="lembar-kendali-secretariat">SEKRETARIAT JENDERAL</strong>
          <div class="lembar-kendali-unit">SATUAN KERJA</div>
          <div class="lembar-kendali-address">${alamat}</div>
        </div>
      </header>

      <table class="sppd-meta">
        <tr><td>Lembar ke</td><td>:</td><td></td></tr>
        <tr><td>Kode No.</td><td>:</td><td></td></tr>
        <tr><td>Nomor</td><td>:</td><td>${noSPD}</td></tr>
      </table>

      <table class="sppd-tbl">
        <colgroup><col style="width:31%"><col style="width:69%"></colgroup>
        <tbody>
          <tr><td>Pejabat Pembuat Komitmen</td><td>${satker}</td></tr>
          <tr><td>Nama, NIP Pegawai yang Melaksanakan Perjalanan Dinas</td><td><div class="sppd-emp-line"><span>${emp.nama}</span><span>NIP. ${emp.nip}</span></div></td></tr>
          <tr><td>a. Pangkat dan Golongan</td><td>a. ${pangkat} Gol. ${emp.gol}</td></tr>
          <tr><td>b. Jabatan/Instansi</td><td>b. ${emp.jabatan}</td></tr>
          <tr><td>c. Tingkat Biaya Perjalanan Dinas</td><td>c. -</td></tr>
          <tr><td>Maksud Perjalanan Dinas</td><td class="sppd-agenda">${agenda}${kegiatan ? `, Output ${kegiatan}` : ''}</td></tr>
          <tr><td>Alat angkut yang dipergunakan</td><td>${transport}</td></tr>
          <tr><td>a. Tempat berangkat</td><td>a. ${kotaAsal}</td></tr>
          <tr><td>b. Tempat Tujuan</td><td>b. ${tujuan}</td></tr>
          <tr><td>a. Lamanya Perjalanan Dinas</td><td>a. ${days} (${lamaKata}) hari</td></tr>
          <tr><td>b. Tanggal berangkat</td><td>b. ${tglBerangkat}</td></tr>
          <tr><td>c. Tanggal harus kembali/tiba di tempat baru *)</td><td>c. ${tglKembali}</td></tr>
          <tr><td class="sppd-pengikut-no-cell">
            <table class="sppd-pengikut-no">
              <thead><tr><th>Pengikut</th></tr></thead>
              <tbody>${pengikutNums}</tbody>
            </table>
          </td><td class="sppd-pengikut-cell">
            <table class="sppd-pengikut">
              <colgroup><col style="width:55%"><col style="width:22%"><col style="width:23%"></colgroup>
              <thead><tr><th>Nama</th><th>Tanggal Lahir</th><th>Keterangan</th></tr></thead>
              <tbody>${pengikutRows}</tbody>
            </table>
          </td></tr>
          <tr><td colspan="2" class="sppd-pembebanan-wrap">
            <table class="sppd-pembebanan">
              <colgroup><col style="width:31%"><col style="width:69%"></colgroup>
              <tbody>
                <tr><td>Pembebanan Anggaran</td><td></td></tr>
                <tr><td>a. Instansi</td><td>a. Satuan Kerja ${satker}</td></tr>
                <tr><td>b. Akun</td><td>b. ${kodeKegiatan} ${kodeSubKegiatan} ${mak}</td></tr>
              </tbody>
            </table>
          </td></tr>
          <tr><td>Keterangan Lain-lain</td><td><div class="sppd-keterangan"><span>${noST}</span><span>Tanggal ${tglST}</span></div></td></tr>
        </tbody>
      </table>

      <div class="sppd-footnote">*) Coret yang tidak perlu</div>

      <div class="sppd-signature">
        <table class="sppd-signature-meta">
          <tr><td>Dikeluarkan di</td><td>:</td><td>${kotaAsal.toUpperCase()}</td></tr>
          <tr><td>Tanggal</td><td>:</td><td>${tanggalSPD}</td></tr>
        </table>
        <div>${jabatanDuaBaris(ppkJabatan)}</div>
        <div class="sppd-signature-space"></div>
        <div class="sppd-signature-name">${ppkNama}</div>
        <div>${ppkNip}</div>
      </div>
    </section>
  `;
}

function renderSPPDPerorangan(targetEmp) {
  const out = document.getElementById('sppdOut');
  if (!out) return;
  const select = document.getElementById('sppdPegawai');
  let emp = targetEmp;
  if (!emp) {
    if (!select || select.value === '') {
      out.innerHTML = '';
      return;
    }
    emp = (typeof employees !== 'undefined' ? employees : []).find(employee => employee.id === Number(select.value));
  }
  if (!emp) {
    out.innerHTML = '';
    return;
  }
  out.innerHTML = buildSPPDHtml(emp);
}

function printSPPDPerorangan() {
  const select = document.getElementById('sppdPegawai');
  const empId = Number(select.value);
  const emp = employees.find(e => e.id === empId);
  const noSPD = (spdPerEmployee[empId] || '').trim();
  if (!noSPD) {
    const msg = `Nomor SPD Perorangan untuk ${emp ? emp.nama.split(',')[0] : 'pegawai'} WAJIB diisi sebelum mencetak!`;
    if (typeof showValidationToast === 'function') {
      showValidationToast([{ label: 'No. SPD Perorangan' }], msg);
    } else {
      alert(msg);
    }
    const input = document.getElementById('sppdNoSPD');
    if (input) { 
      input.focus(); 
      input.classList.add('has-error'); 
      input.closest('.spd-prefix-wrap')?.classList.add('has-error');
    }
    return;
  }
  const clearPrintMode = () => document.body.classList.remove('print-sppd');
  document.body.classList.add('print-sppd');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

const MAK_RULES = {
  '524111': { desc: 'Kegiatan di luar kota', jenis: 'Luar Kota' },
  '524119': { desc: 'Rapat di luar kota', jenis: 'Luar Kota' },
  '524113': { desc: 'Kegiatan di dalam kota', jenis: 'Dalam Kota' },
  '524114': { desc: 'Rapat di dalam kota', jenis: 'Dalam Kota' }
};

function syncJenisPerjalananFromMak() {
  const makInput = document.getElementById('mak');
  const elJenis = document.getElementById('lk_jenisPerjalanan');
  const hintEl = document.getElementById('makDescHint');
  if (!makInput) return;
  const raw = makInput.value.trim();
  const match = raw.match(/\b(524111|524119|524113|524114)\b/);
  const code = match ? match[1] : raw;
  const rule = MAK_RULES[code];

  if (hintEl) {
    hintEl.textContent = rule
      ? `Akun: ${rule.desc} → Lembar Kendali: ${rule.jenis}`
      : 'Pilihan MAK: 524111 (Luar Kota), 524113 (Dalam Kota), 524114 (Rapat Dalam Kota), 524119 (Rapat Luar Kota)';
  }

  if (elJenis && rule) {
    elJenis.value = rule.jenis;
  }
}

function renderLembarKendali() {
  const out = document.getElementById('lembarKendaliOut');
  if (selectedEmpIds.size === 0) {
    out.innerHTML = '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const sbm = typeof getSBM === 'function' ? getSBM() : {};
  const selectedEmps = [...selectedEmpIds].map(id => employees.find(emp => emp.id === id)).filter(Boolean);
  const total = selectedEmps.reduce((sum, emp) => sum + (hitungBiaya(emp)?.total || 0), 0);
  const satker = document.getElementById('cfg_satker')?.value || '';
  const alamat = document.getElementById('cfg_alamatSatker')?.value || '';
  const pelaksana = document.getElementById('lk_pelaksana')?.value || '-';
  const tanggalMasuk = document.getElementById('lk_tanggalMasuk')?.value || '';
  const nomorSPM = document.getElementById('lk_nomorSPM')?.value || '';
  const nomorSPD = document.getElementById('lk_nomorSPD')?.value || '';
  const nomorST = document.getElementById('noST')?.value || '-';
  const tanggalST = typeof formatTgl === 'function' ? formatTgl(document.getElementById('tglST')?.value) : '';
  const allTripSegs = selectedEmps.flatMap(emp => (typeof getEmpSegments === 'function' ? getEmpSegments(emp.id) : []));
  const tripStart = allTripSegs.length ? allTripSegs.reduce((min, s) => (s.start < min ? s.start : min), allTripSegs[0].start) : (document.getElementById('tglBerangkat')?.value || '');
  const tripEnd = allTripSegs.length ? allTripSegs.reduce((max, s) => (s.end > max ? s.end : max), allTripSegs[0].end) : (document.getElementById('tglKembali')?.value || '');
  const tanggalBerangkat = typeof formatTgl === 'function' ? formatTgl(tripStart) : tripStart;
  const tanggalKembali = typeof formatTgl === 'function' ? formatTgl(tripEnd) : tripEnd;
  const verifNama = (document.getElementById('cfg_verifikatorNama')?.value || '').trim();
  const verifNipRaw = (document.getElementById('cfg_verifikatorNip')?.value || '').trim().replace(/^NIP\.?\s*/i, '');
  const elJenis = document.getElementById('lk_jenisPerjalanan');
  if (elJenis && !elJenis.dataset.userEdited && typeof syncJenisPerjalananFromMak === 'function') {
    syncJenisPerjalananFromMak();
  }
  const jenisPerjalanan = elJenis ? elJenis.value : 'Luar Kota';
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const tujuan = typeof getTujuanDisplay === 'function' ? getTujuanDisplay(kotaTeks) : kotaTeks;
  const tujuanPerjalanan = (document.getElementById('agenda')?.value || '').trim() || tujuan;
  const akunKegiatan = `${document.getElementById('kodeKegiatan')?.value || ''}.${document.getElementById('kodeSubKegiatan')?.value || ''}.${document.getElementById('mak')?.value || ''}`;
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  const checklistItems = [
    'Surat Undangan (Jika Ada)',
    'Surat Tugas',
    'Surat Perjalanan Dinas',
    'Daftar Nominatif',
    'Daftar Rincian Perjalanan Dinas',
    'Daftar Rekap SPT',
    isKKP ? 'Daftar Pengeluaran Riil (DPR KKP)' : 'Daftar Pengeluaran Riil (DPR)',
    isKKP ? 'Kuitansi KKP' : 'Kuitansi LS',
    'Bukti Pembayaran Transportasi (Kereta/Pesawat/Kapal Laut/Bus)',
    'Boarding Pass',
    'Bukti Pembayaran Taksi, BBM, Tol',
    'Kuitansi Pembayaran Hotel',
    'Laporan Perjalanan Dinas',
    'SP2D (Lembar Dua)',
    'Tanda Tangan pada Link Monitoring Perjadin'
  ];
  const logoSrc = (typeof LOGO_PKP_BASE64 !== 'undefined' && LOGO_PKP_BASE64) ? LOGO_PKP_BASE64 : 'logo-pkp.webp';

  out.innerHTML = `
    <section class="lembar-kendali-area">
      <header class="lembar-kendali-header">
        <img class="lembar-kendali-logo" src="${logoSrc}" alt="">
        <div>
          <div class="lembar-kendali-ministry">KEMENTERIAN PERUMAHAN DAN KAWASAN PERMUKIMAN <span>REPUBLIK INDONESIA</span></div>
          <strong class="lembar-kendali-secretariat">SEKRETARIAT JENDERAL</strong>
          <div class="lembar-kendali-unit">SATUAN KERJA</div>
          ${alamat ? `<div class="lembar-kendali-address">${alamat}</div>` : ''}
        </div>
      </header>

      <div class="lembar-kendali-section-title lembar-kendali-section-title-berkas">Tanggal Masuk Berkas: ${formatTgl(tanggalMasuk)}</div>
      <table class="lembar-kendali-meta">
        <colgroup>
          <col style="width:15%"><col style="width:14%"><col style="width:2%"><col style="width:33%">
          <col style="width:14%"><col style="width:2%"><col style="width:20%">
        </colgroup>
        <tr>
          <th colspan="2" rowspan="2" class="lembar-kendali-meta-label">PELAKSANA PERTANGGUNGJAWABAN</th>
          <td rowspan="2" class="lembar-kendali-meta-separator">:</td>
          <td rowspan="2" class="lembar-kendali-meta-value">${pelaksana}</td>
          <th class="lembar-kendali-meta-label">SPM</th>
          <td class="lembar-kendali-meta-separator">:</td>
          <td class="lembar-kendali-meta-value">${nomorSPM}</td>
        </tr>
        <tr>
          <th class="lembar-kendali-meta-label">SP2D</th>
          <td class="lembar-kendali-meta-separator">:</td>
          <td class="lembar-kendali-meta-value">${nomorSPD}</td>
        </tr>
      </table>

      <div class="lembar-kendali-section-title lembar-kendali-section-title-checklist">${isKKP ? 'CHECKLIST PENGENDALIAN PERJALANAN DINAS (KKP)' : 'CHECKLIST PENGENDALIAN PERJALANAN DINAS'}</div>
      <table class="lembar-kendali-info">
        <colgroup>
          <col style="width:14%"><col style="width:13%"><col style="width:2%"><col style="width:35%">
          <col style="width:14%"><col style="width:2%"><col style="width:20%">
        </colgroup>
        <tr>
          <th rowspan="2" class="lembar-kendali-side-label">Pelaksana<br>Perjalanan Dinas</th>
          <th class="lembar-kendali-before-colon">Nama Pelaksana</th><td class="lembar-kendali-colon">:</td>
          <td>${selectedEmps.map(emp => emp.nama.split(',')[0].trim().split(/\s+/).slice(0, 2).join(' ')).join(', ')}</td>
          <th class="lembar-kendali-before-colon">Tanggal Berangkat</th><td class="lembar-kendali-colon">:</td><td>${tanggalBerangkat}</td>
        </tr>
        <tr>
          <th class="lembar-kendali-before-colon">Tujuan</th><td class="lembar-kendali-colon">:</td><td>${tujuanPerjalanan}</td>
          <th class="lembar-kendali-before-colon">Tanggal Kembali</th><td class="lembar-kendali-colon">:</td><td>${tanggalKembali}</td>
        </tr>
        <tr>
          <th colspan="2" class="lembar-kendali-before-colon">Akun/Kegiatan</th><td class="lembar-kendali-colon">:</td><td>${akunKegiatan}</td>
          <th class="lembar-kendali-before-colon">Surat Tugas (ST)</th><td class="lembar-kendali-colon">:</td><td>${nomorST}</td>
        </tr>
        <tr>
          <th colspan="2" class="lembar-kendali-before-colon">Jenis Perjalanan Dinas</th><td class="lembar-kendali-colon">:</td><td>${jenisPerjalanan}</td>
          <th class="lembar-kendali-before-colon">Tanggal Surat Tugas (ST)</th><td class="lembar-kendali-colon">:</td><td>${tanggalST}</td>
        </tr>
        <tr><td colspan="4"></td><th class="lembar-kendali-before-colon">Nilai (Rp)</th><td class="lembar-kendali-colon">:</td><td>${rp(total)}</td></tr>
      </table>

      <table class="lembar-kendali-checklist">
        <thead>
          <tr><th>No</th><th>Berkas Kegiatan</th><th>Ada</th><th>Tidak Ada</th><th>Keterangan</th></tr>
        </thead>
        <tbody>
          ${checklistItems.map((item, index) => `
            <tr>
              <td class="lembar-kendali-center">${index + 1}</td>
              <td>${item}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          `).join('')}
          <tr class="lembar-kendali-notes"><td colspan="5">Catatan:</td></tr>
        </tbody>
      </table>

      <div class="lembar-kendali-signatures">
        <div class="lk-sig-col">
          <div class="lk-sig-head">
            <strong>Disetujui</strong>
            <div>Pejabat Pembuat Komitmen</div>
            <div>Sekretariat Jenderal Kementerian PKP</div>
          </div>
          <div class="lembar-kendali-signature-space"></div>
          <div>${document.getElementById('cfg_ppkNama').value}</div>
          <div>${document.getElementById('cfg_ppkNip').value}</div>
        </div>
        <div class="lk-sig-col">
          <div class="lk-sig-head">
            <strong>Pejabat Pembuat SPM (PP-SPM)</strong>
          </div>
          <div class="lembar-kendali-signature-space"></div>
          <div>${document.getElementById('cfg_ppspmNama').value}</div>
          <div>${document.getElementById('cfg_ppspmNip').value}</div>
        </div>
        <div class="lk-sig-col">
          <div class="lk-sig-head">
            <div>${document.getElementById('cfg_kotaAsal').value},</div>
            <strong>Verifikator Pejabat Pembuat Komitmen</strong>
          </div>
          <div class="lembar-kendali-signature-space"></div>
          <div>${verifNama || '..................................'}</div>
          <div>NIP. ${verifNipRaw || '..................................'}</div>
        </div>
      </div>
    </section>
  `;
}

function printLembarKendali() {
  const clearPrintMode = () => document.body.classList.remove('print-lembar-kendali');
  document.body.classList.add('print-lembar-kendali');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

function renderRekapRincian() {
  const out = document.getElementById('rekapRincianOut');
  if (selectedEmpIds.size === 0) {
    out.innerHTML = '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const sbm = typeof getSBM === 'function' ? getSBM() : {};
  const selectedEmps = [...selectedEmpIds].map(id => employees.find(emp => emp.id === id)).filter(Boolean);
  const rows = selectedEmps.map((emp, index) => ({
    emp,
    index: index + 1,
    biaya: hitungBiaya(emp),
    segs: typeof getEmpSegments === 'function' ? getEmpSegments(emp.id) : [],
    days: typeof getEmpDays === 'function' ? getEmpDays(emp.id).days : 1
  }));
  const satker = document.getElementById('cfg_satker')?.value || '';
  const kodeSatker = document.getElementById('cfg_kodeSatker')?.value || '';
  const kodeKegiatan = document.getElementById('kodeKegiatan')?.value || '';
  const kodeSubKegiatan = document.getElementById('kodeSubKegiatan')?.value || '';
  const mak = document.getElementById('mak')?.value || '';
  const kegiatan = document.getElementById('cfg_kegiatan')?.value || '';
  const bank = document.getElementById('cfg_bank')?.value || '';
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const tujuan = typeof getTujuanDisplay === 'function' ? getTujuanDisplay(kotaTeks) : kotaTeks;
  const tanggalBerangkat = document.getElementById('tglBerangkat')?.value || '';
  const tanggalKembali = document.getElementById('tglKembali')?.value || '';
  const cbUH = !!document.getElementById('cbUH')?.checked;
  const cbHotel = !!document.getElementById('cbHotel')?.checked;
  const cbDPR = !!document.getElementById('cbDPR')?.checked;
  const cbTiket = !!document.getElementById('cbTiket')?.checked;
  const customCosts = typeof getCustomCosts === 'function' ? getCustomCosts() : [];
  const ppkNama = document.getElementById('cfg_ppkNama')?.value || '';
  const ppkNip = document.getElementById('cfg_ppkNip')?.value || '';
  const ppkJabatan = document.getElementById('cfg_ppkJabatan')?.value || '';
  const bendNama = document.getElementById('cfg_bendNama')?.value || '';
  const bendNip = document.getElementById('cfg_bendNip')?.value || '';

  const showUH = cbUH || rows.some(row => row.biaya.uh > 0);

  // Dynamic Biaya Columns: Representasi -> Penginapan/Hotel -> Tiket Kereta -> Tiket Pesawat -> Tiket Whoosh ... -> DPR -> Biaya Lainnya
  const biayaColumns = [];
  if (rows.some(row => row.biaya.representatif > 0)) {
    biayaColumns.push({ label: 'Representasi', value: biaya => biaya.representatif || 0 });
  }

  const hasHotel = cbHotel || rows.some(row => row.biaya.hotel > 0);
  if (hasHotel) {
    biayaColumns.push({ label: 'Penginapan/Hotel', value: biaya => biaya.hotel || 0 });
  }

  const preferredTicketOrder = ['Tiket Kereta', 'Tiket Pesawat', 'Tiket Whoosh', 'Tiket Kapal', 'Tiket Bus/Travel'];
  const ticketGroups = new Set();
  const planeTicketLabel = 'Tiket Pesawat';
  const hasSbmTiket = cbTiket || rows.some(row => row.biaya.tiket > 0);
  if (hasSbmTiket) {
    ticketGroups.add(planeTicketLabel);
  }
  rows.forEach(row => {
    (row.biaya.customCosts || []).forEach(item => {
      if (item.isTicket && item.amount > 0) {
        const label = typeof getTicketCostLabel === 'function' ? getTicketCostLabel(item.name) : item.name;
        ticketGroups.add(label);
      }
    });
  });

  const sortedTicketLabels = Array.from(ticketGroups).sort((a, b) => {
    const idxA = preferredTicketOrder.indexOf(a);
    const idxB = preferredTicketOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  sortedTicketLabels.forEach(label => {
    const isPlaneTicket = label === planeTicketLabel;
    biayaColumns.push({
      label,
      value: biaya => {
        const sbmVal = isPlaneTicket ? (biaya.tiket || 0) : 0;
        const customVal = (biaya.customCosts || [])
          .filter(c => c.isTicket && (typeof getTicketCostLabel === 'function' ? getTicketCostLabel(c.name) : c.name) === label)
          .reduce((sum, c) => sum + (c.amount || 0), 0);
        return sbmVal + customVal;
      }
    });
  });

  const hasTransportCost = rows.some(row => (row.biaya.customCosts || []).some(item => item.isTransport && item.amount > 0));
  const hasDprCost = rows.some(row => row.biaya.dpr > 0);
  if (hasDprCost || hasTransportCost) {
    biayaColumns.push({
      label: 'DPR',
      value: biaya => (biaya.dpr || 0) + (biaya.customCosts || []).reduce((total, item) => total + (item.isTransport ? item.amount : 0), 0)
    });
  }

  const otherCostNames = new Set();
  rows.forEach(row => {
    (row.biaya.customCosts || []).forEach(item => {
      if (!item.isTransport && !item.isTicket && item.amount > 0) {
        otherCostNames.add(item.name);
      }
    });
  });
  otherCostNames.forEach(name => {
    biayaColumns.push({
      label: name,
      value: biaya => (biaya.customCosts || [])
        .filter(item => !item.isTransport && !item.isTicket && item.name === name)
        .reduce((sum, item) => sum + (item.amount || 0), 0)
    });
  });

  const grandTotal = rows.reduce((total, row) => total + row.biaya.total, 0);
  const totalUangHarian = rows.reduce((total, row) => total + row.biaya.uh, 0);
  const multiSegRows = rows.filter(row => row.segs.length > 1);
  const biayaColspan = Math.max(1, biayaColumns.length);
  const financialColumnCount = (showUH ? 1 : 0) + biayaColspan + 1;
  const financialColumnWidth = 18 / financialColumnCount;

  out.innerHTML = `
    <section class="rekap-rincian-area">
      <h2>RINCIAN</h2>
      <table class="rekap-rincian-meta">
        <tr><td>NAMA SATKER</td><td>:</td><td>${satker}</td></tr>
        <tr><td>KODE SATKER</td><td>:</td><td>${kodeSatker}</td></tr>
        <tr><td>KODE KEGIATAN</td><td>:</td><td>${kodeKegiatan}</td></tr>
        <tr><td>KODE SUB KEGIATAN</td><td>:</td><td>${kodeSubKegiatan}</td></tr>
        <tr><td>KODE MAK</td><td>:</td><td>${mak}</td></tr>
        <tr><td>KEGIATAN</td><td>:</td><td>${kegiatan}</td></tr>
        <tr><td>BANK DAN NO. REKENING</td><td>:</td><td>${bank}</td></tr>
      </table>

      <table class="rekap-rincian-table">
        <colgroup>
          ${[3,17,4,11,26,8,8,5].map(width => `<col style="width:${width}%">`).join('')}
          ${Array.from({length:financialColumnCount}, () => `<col style="width:${financialColumnWidth}%">`).join('')}
        </colgroup>
        <thead>
          <tr>
            <th rowspan="2">No</th>
            <th rowspan="2">Nama Yang Ditugaskan</th>
            <th rowspan="2">Gol</th>
            <th rowspan="2">NIP</th>
            <th rowspan="2">Tujuan</th>
            <th colspan="2">Tanggal</th>
            <th rowspan="2">Lama Tugas</th>
            ${showUH ? '<th rowspan="2">Uang Harian</th>' : ''}
            <th colspan="${biayaColspan}">Biaya</th>
            <th rowspan="2">JUMLAH<br>(Rp)</th>
          </tr>
          <tr>
            <th>Berangkat</th>
            <th>Kembali</th>
            ${biayaColumns.length ? biayaColumns.map(column => `<th>${column.label}</th>`).join('') : '<th>-</th>'}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td class="rekap-rincian-center">${row.index}</td>
              <td>${row.emp.nama}</td>
              <td class="rekap-rincian-center">${row.emp.gol}</td>
              <td class="rekap-rincian-center">${row.emp.nip}</td>
              <td class="rekap-rincian-center">${tujuan}</td>
              <td class="rekap-rincian-center">${formatTgl(row.segs.length ? row.segs[0].start : tanggalBerangkat)}</td>
              <td class="rekap-rincian-center">${formatTgl(row.segs.length ? row.segs[row.segs.length - 1].end : tanggalKembali)}</td>
              <td class="rekap-rincian-center">${row.days} hari</td>
              ${showUH ? `<td class="rekap-rincian-number">${rp(row.biaya.uh)}</td>` : ''}
              ${biayaColumns.length ? biayaColumns.map(column => `<td class="rekap-rincian-number">${rp(column.value(row.biaya))}</td>`).join('') : '<td class="rekap-rincian-center">-</td>'}
              <td class="rekap-rincian-number">${rp(row.biaya.total)}</td>
            </tr>
          `).join('')}
          <tr class="rekap-rincian-total">
            <td colspan="8" class="rekap-rincian-center">Jumlah</td>
            ${showUH ? `<td class="rekap-rincian-number">${rp(totalUangHarian)}</td>` : ''}
            ${biayaColumns.length ? biayaColumns.map(column => `<td class="rekap-rincian-number">${rp(rows.reduce((total, row) => total + column.value(row.biaya), 0))}</td>`).join('') : '<td></td>'}
            <td class="rekap-rincian-number">${rp(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      ${multiSegRows.length ? `<div class="rekap-rincian-date-note">Catatan tanggal perjalanan: ${multiSegRows.map(row => `${row.emp.nama} (${row.segs.map(s => `${formatTgl(s.start)} s.d. ${formatTgl(s.end)}`).join('; ')})`).join(' | ')}.</div>` : ''}
      <div class="rekap-rincian-terbilang"><strong><em>Terbilang</em></strong><span>:</span><strong><em>${terbilang(grandTotal)}</em></strong></div>
      <div class="rekap-rincian-signatures">
        <div>
          <div>Pejabat Pembuat Komitmen</div>
          <div>Sekretariat Jenderal Kementerian PKP</div>
          <div class="rekap-rincian-signature-space"></div>
          <div>${ppkNama}</div>
          <div>${ppkNip}</div>
        </div>
        <div>
          <div>Bendahara Pengeluaran</div>
          <div style="visibility:hidden">Sekretariat Jenderal Kementerian PKP</div>
          <div class="rekap-rincian-signature-space"></div>
          <div>${bendNama}</div>
          <div>${bendNip}</div>
        </div>
      </div>
    </section>
  `;
}

function printRekapRincian() {
  const clearPrintMode = () => document.body.classList.remove('print-rekap-rincian');
  document.body.classList.add('print-rekap-rincian');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

function renderRekapSPT() {
  const out = document.getElementById('rekapSPTOut');
  if (selectedEmpIds.size === 0) {
    out.innerHTML = '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const sbm = typeof getSBM === 'function' ? getSBM() : {};
  const selectedEmps = [...selectedEmpIds].map(id => employees.find(emp => emp.id === id)).filter(Boolean);
  const satker = document.getElementById('cfg_satker')?.value || '';
  const kodeSatker = document.getElementById('cfg_kodeSatker')?.value || '';
  const kodeKegiatan = document.getElementById('kodeKegiatan')?.value || '';
  const kodeSubKegiatan = document.getElementById('kodeSubKegiatan')?.value || '';
  const mak = document.getElementById('mak')?.value || '';
  const kegiatan = document.getElementById('cfg_kegiatan')?.value || '';
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const kotaTujuan = typeof getTujuanDisplay === 'function' ? getTujuanDisplay(kotaTeks) : kotaTeks;
  const tanggalSPT = typeof formatTgl === 'function' ? formatTgl(document.getElementById('tglST')?.value) : '';
  const nomorSPT = document.getElementById('noST')?.value || '-';
  const ppkNama = document.getElementById('cfg_ppkNama')?.value || '';
  const ppkNip = document.getElementById('cfg_ppkNip')?.value || '';
  const ppkJabatan = document.getElementById('cfg_ppkJabatan')?.value || '';

  out.innerHTML = `
    <section class="rekap-spt-area">
      <h2>REKAP SURAT PERINTAH TUGAS</h2>
      <table class="rekap-spt-meta">
        <tr><td>NAMA SATKER</td><td>:</td><td>${satker}</td></tr>
        <tr><td>KODE SATKER</td><td>:</td><td>${kodeSatker}</td></tr>
        <tr><td>KODE KEGIATAN</td><td>:</td><td>${kodeKegiatan}</td></tr>
        <tr><td>KODE SUB KEGIATAN</td><td>:</td><td>${kodeSubKegiatan}</td></tr>
        <tr><td>KODE MAK</td><td>:</td><td>${mak}</td></tr>
        <tr><td>KEGIATAN</td><td>:</td><td>${kegiatan}</td></tr>
      </table>

      <table class="rekap-spt-table">
        <colgroup>
          <col style="width:4%"><col style="width:7%"><col style="width:27%">
          <col style="width:11%"><col style="width:15%"><col style="width:16%"><col style="width:20%">
        </colgroup>
        <thead>
          <tr>
            <th rowspan="2">No</th>
            <th rowspan="2">MAK</th>
            <th rowspan="2">Nama Penerima</th>
            <th rowspan="2" colspan="2">Uraian</th>
            <th colspan="2">SPT</th>
          </tr>
          <tr><th>Tanggal</th><th>Nomor</th></tr>
        </thead>
        <tbody>
          ${selectedEmps.map((emp, index) => `
            <tr>
              <td class="rekap-spt-center rekap-spt-cell-fit">${index + 1}</td>
              <td class="rekap-spt-center rekap-spt-cell-fit">${mak}</td>
              <td class="rekap-spt-emp-cell">
                <div class="rekap-spt-emp-box">
                  <div class="rekap-spt-emp-nama">${emp.nama}</div>
                  <div class="rekap-spt-emp-nip">NIP. ${emp.nip}</div>
                </div>
              </td>
              <td class="rekap-spt-uraian-lbl">Perjalanan Dinas ke</td>
              <td class="rekap-spt-center">${kotaTujuan}</td>
              <td class="rekap-spt-center rekap-spt-cell-fit">${tanggalSPT}</td>
              <td class="rekap-spt-center rekap-spt-cell-fit">${nomorSPT}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="rekap-spt-signature">
        <div>${jabatanDuaBaris(ppkJabatan)}</div>
        <div class="rekap-spt-signature-space" style="height: 80px;"></div>
        <div>${ppkNama}</div>
        <div>${ppkNip}</div>
      </div>
    </section>
  `;
}

function printRekapSPT() {
  const clearPrintMode = () => document.body.classList.remove('print-rekap-spt');
  document.body.classList.add('print-rekap-spt');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

function renderNominatif() {
  const out = document.getElementById('nominatifOut');
  if (selectedEmpIds.size === 0) {
    out.innerHTML = '<div class="alert-warn">⚠️ Belum ada pegawai yang dipilih. Kembali ke tab <b>Input Perjalanan</b> dan pilih pegawai terlebih dahulu.</div>';
    return;
  }
  const sbm = typeof getSBM === 'function' ? getSBM() : {};
  const tglBrkt = document.getElementById('tglBerangkat')?.value || '';
  const tglKmb = document.getElementById('tglKembali')?.value || '';
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const kotaTujuan = typeof getTujuanDisplay === 'function' ? getTujuanDisplay(kotaTeks) : kotaTeks;
  const satker = document.getElementById('cfg_satker')?.value || '';
  const kodeSatker = document.getElementById('cfg_kodeSatker')?.value || '';
  const kodeKeg = document.getElementById('kodeKegiatan')?.value || '';
  const kodeSubKeg = document.getElementById('kodeSubKegiatan')?.value || '';
  const mak = document.getElementById('mak')?.value || '';
  const kegiatan = document.getElementById('cfg_kegiatan')?.value || '';
  const bank = document.getElementById('cfg_bank')?.value || '';
  const ppkNama = document.getElementById('cfg_ppkNama')?.value || '';
  const ppkNip = document.getElementById('cfg_ppkNip')?.value || '';
  const bendNama = document.getElementById('cfg_bendNama')?.value || '';
  const bendNip = document.getElementById('cfg_bendNip')?.value || '';

  const selectedEmps = [...selectedEmpIds].map(id => employees.find(e => e.id === id)).filter(Boolean);

  // Calculate totals
  let grandTotal = 0;
  const rows = selectedEmps.map((emp, idx) => {
    const b = hitungBiaya(emp);
    grandTotal += b.total;
    return { emp, b, idx: idx + 1, segs: getEmpSegments(emp.id), days: getEmpDays(emp.id).days };
  });
  const multiSegRows = rows.filter(r => r.segs.length > 1);
  const formatNominatifTgl = (str) => {
    if (!str || str === '-') return '-';
    const parts = str.split(' ');
    if (parts.length === 3) return `${parts[0]}&nbsp;${parts[1]}<br>${parts[2]}`;
    return str.replace(/ (\d{4})$/, '<br>$1');
  };

  out.innerHTML = `
    <div class="nominatif-area">
      <div class="doc-title">
        <h2>DAFTAR NOMINATIF</h2>
      </div>
      <table class="meta-tbl">
        <tr><td>NAMA SATKER</td><td>:</td><td>${satker}</td></tr>
        <tr><td>KODE SATKER</td><td>:</td><td>${kodeSatker}</td></tr>
        <tr><td>KODE KEGIATAN</td><td>:</td><td>${kodeKeg}</td></tr>
        <tr><td>KODE SUB KEGIATAN</td><td>:</td><td>${kodeSubKeg}</td></tr>
        <tr><td>KODE MAK</td><td>:</td><td>${mak}</td></tr>
        <tr><td>KEGIATAN</td><td>:</td><td>${kegiatan}</td></tr>
        <tr><td>BANK DAN NO. REKENING</td><td>:</td><td>${bank}</td></tr>
      </table>

      <div class="nominatif-wrapper">
        <table class="data-tbl nominatif-table">
          <colgroup>
            <col style="width:3.5%"><col style="width:21%"><col style="width:4.5%"><col style="width:17.5%">
            <col style="width:13%"><col style="width:10.5%"><col style="width:10.5%"><col style="width:7%"><col style="width:12.5%">
          </colgroup>
          <thead>
            <tr>
              <th rowspan="2">No</th>
              <th rowspan="2">Nama Yang Ditugaskan</th>
              <th rowspan="2">Gol</th>
              <th rowspan="2">NIP</th>
              <th rowspan="2">Tujuan</th>
              <th colspan="2">Tanggal</th>
              <th rowspan="2">Lama Tugas</th>
              <th>JUMLAH</th>
            </tr>
            <tr>
              <th>Berangkat</th>
              <th>Kembali</th>
              <th>(Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td class="tc">${r.idx}</td>
                <td>${r.emp.nama}</td>
                <td class="tc">${r.emp.gol}</td>
                <td class="tc nominatif-nip">${r.emp.nip}</td>
                <td class="tc">${kotaTujuan}</td>
                <td class="tc nominatif-date-cell">${formatNominatifTgl(formatTgl(r.segs.length ? r.segs[0].start : tglBrkt))}</td>
                <td class="tc nominatif-date-cell">${formatNominatifTgl(formatTgl(r.segs.length ? r.segs[r.segs.length - 1].end : tglKmb))}</td>
                <td class="tc">${r.days} hari</td>
                <td><div class="nominatif-amount"><span>Rp</span><span>${Number(r.b.total).toLocaleString('id-ID')}</span></div></td>
              </tr>
            `).join('')}
            <tr class="total-row nominatif-total">
              <td colspan="8" class="nominatif-total-label">Jumlah</td>
              <td><div class="nominatif-amount nominatif-amount-total"><span>Rp</span><span>${Number(grandTotal).toLocaleString('id-ID')}</span></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      ${multiSegRows.length ? `<div class="rekap-rincian-date-note">Catatan tanggal perjalanan: ${multiSegRows.map(r => `${r.emp.nama} (${r.segs.map(s => `${formatTgl(s.start)} s.d. ${formatTgl(s.end)}`).join('; ')})`).join(' | ')}.</div>` : ''}

      <div class="nominatif-terbilang">
        <b><em>Terbilang</em></b><span>:</span><strong><em>${terbilang(grandTotal)}</em></strong>
      </div>

      <div class="sig-row">
        <div class="sig-box">
          <div>Pejabat Pembuat Komitmen</div>
          <div>Sekretariat Jenderal Kementerian PKP</div>
          <div class="sig-space"></div>
          <div>${ppkNama}</div>
          <div class="sig-nip">${ppkNip}</div>
        </div>
        <div class="sig-box">
          <div>Bendahara Pengeluaran</div>
          <div>&nbsp;</div>
          <div class="sig-space"></div>
          <div>${bendNama}</div>
          <div class="sig-nip">${bendNip}</div>
        </div>
      </div>

      ${!sbm?'<div class="alert-warn" style="margin-top:16px">⚠️ Provinsi tujuan belum dipilih — biaya dihitung Rp 0. Kembali ke Input dan pilih provinsi.</div>':''}
    </div>
  `;
}

function printNominatif() {
  const clearPrintMode = () => document.body.classList.remove('print-nominatif');
  document.body.classList.add('print-nominatif');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

