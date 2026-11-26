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
          <col style="width:4%"><col style="width:7%"><col style="width:29%">
          <col style="width:10%"><col style="width:17%"><col style="width:15%"><col style="width:18%">
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
              <td class="rekap-spt-center rekap-spt-nowrap">${index + 1}</td>
              <td class="rekap-spt-center rekap-spt-nowrap">${mak}</td>
              <td class="rekap-spt-emp-cell">
                <div class="rekap-spt-emp-box">
                  <div class="rekap-spt-emp-nama">${emp.nama}</div>
                  <div class="rekap-spt-emp-nip">NIP. ${emp.nip}</div>
                </div>
              </td>
              <td>Perjalanan Dinas ke</td>
              <td class="rekap-spt-center">${kotaTujuan}</td>
              <td class="rekap-spt-center rekap-spt-nowrap">${tanggalSPT}</td>
              <td class="rekap-spt-center rekap-spt-nowrap">${nomorSPT}</td>
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

// =====================================================================
// RENDER RINCIAN PER ORANG
// =====================================================================
function populateRincianSelect() {
  if (!populateEmpDocSelect(
    'rincianPegawai',
    'rincianOut',
    '<div class="alert-warn">⚠️ Belum ada pegawai dipilih. Kembali ke Input Perjalanan.</div>'
  )) return;
  loadRincianSPD();
  if (typeof renderRincianEmpPills === 'function') renderRincianEmpPills();
  if (typeof renderRincianCockpit === 'function') renderRincianCockpit();
  if (typeof renderRincianTransportEditor === 'function') renderRincianTransportEditor();
  renderRincian();
}

function loadRincianSPD() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  syncEmpSelectTitle(select);
  const fullVal = spdPerEmployee[Number(select.value)] || '';
  const input = document.getElementById('rincianNoSPD');
  if (input) input.value = getSpdNumberPrefix(fullVal);
  updateAllSpdSuffixLabels();
}

function onRincianEmployeeChange() {
  loadRincianSPD();
  if (typeof renderRincianEmpPills === 'function') renderRincianEmpPills();
  if (typeof renderRincianCockpit === 'function') renderRincianCockpit();
  if (typeof renderRincianTransportEditor === 'function') renderRincianTransportEditor();
  renderRincian();
}

function saveRincianSPD() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  const input = document.getElementById('rincianNoSPD');
  const numVal = input ? input.value.trim() : '';
  const fullVal = buildFullSpdFromInput(numVal);
  syncEmpSpdInputs(empId, fullVal);
  if (typeof renderRincianEmpPills === 'function') renderRincianEmpPills();
  const tip = document.getElementById('activeSpdTip');
  if (tip) tip.textContent = fullVal ? `Format lengkap: ${fullVal}` : 'Format: [Nomor] + /SPD/Birkom/...';
  renderRincian();
}

function mergeRincianKeterangan(rowsHtml) {
  const tbody = document.createElement('tbody');
  tbody.innerHTML = rowsHtml;
  const rows = [...tbody.children];
  let blankStart = null;
  rows.forEach((tr, index) => {
    const ket = [...tr.children].find(c => c.classList && c.classList.contains('rincian-ket-cell'));
    if (!ket) {
      blankStart = null;
      return;
    }
    if (!ket.textContent.trim()) {
      if (blankStart === null) blankStart = index;
      return;
    }
    if (blankStart !== null && tr.dataset.mergeKetUp === 'true') {
      const target = [...rows[blankStart].children].find(c => c.classList && c.classList.contains('rincian-ket-cell'));
      if (target) {
        target.innerHTML = ket.innerHTML;
        target.rowSpan = index - blankStart + 1;
        for (let i = blankStart + 1; i <= index; i++) {
          [...rows[i].children].find(c => c.classList && c.classList.contains('rincian-ket-cell'))?.remove();
        }
      }
    }
    blankStart = null;
  });
  return tbody.innerHTML;
}

function buildRincianHtml(emp) {
  if (!emp) return '';
  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  const { days, nights } = typeof getEmpDays === 'function' ? getEmpDays(emp.id) : { days: 1, nights: 0 };
  const b = typeof hitungBiaya === 'function' ? hitungBiaya(emp) : { total: 0, customCosts: [] };
  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const kotaTujuan = typeof getTujuanDisplay === 'function' ? getTujuanDisplay(kotaTeks) : kotaTeks;
  const rawSPD = (typeof spdPerEmployee !== 'undefined' && spdPerEmployee[emp.id] ? spdPerEmployee[emp.id].trim() : '');
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const tglSPD = document.getElementById('tglSPD')?.value || '';
  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const ppkNama = document.getElementById('cfg_ppkNama')?.value || '';
  const ppkNip = document.getElementById('cfg_ppkNip')?.value || '';
  const bendNama = document.getElementById('cfg_bendNama')?.value || '';
  const bendNip = document.getElementById('cfg_bendNip')?.value || '';
  const agenda = document.getElementById('agenda')?.value || '-';
  const cfg = typeof getEmployeeCostConfig === 'function' ? getEmployeeCostConfig(emp.id) : null;
  const cbUH = cfg ? cfg.uhActive : (document.getElementById('cbUH')?.checked ?? true);
  const cbHotel = cfg ? cfg.hotelActive : (document.getElementById('cbHotel')?.checked ?? false);
  const cbDPR = document.getElementById('cbDPR')?.checked ?? true;
  const cbTiket = document.getElementById('cbTiket')?.checked ?? false;
  const uhPercent = cfg ? (cfg.uhPercent ?? 1) : (Number(document.getElementById('uhPersentase')?.value) || 1);

  let rincianRows = '';
  let no = 1;
  const isMealManual = !!b.isMealManual || !!document.getElementById('cbTarifMakanManual')?.checked;
  const mealKet = isMealManual ? 'Biaya makan at-cost' : '';
  const uhKeterangan = b.jenisKeg === 'fullboard'
    ? 'Paket Fullboard'
    : b.jenisKeg === 'diklat'
    ? 'Diklat / Pelatihan'
    : (uhPercent < 1 ? 'Menggunakan Kendaraan Dinas Operasional' : '');

  if (cbUH && (b.uhGross > 0 || b.uh > 0)) {
    if (b.isMultiProv && b.multiProvData) {
      const hasMeal = b.mealDeduction > 0;
      const hasSnack = b.snackDeduction > 0;
      const hasDeductions = hasMeal || hasSnack;
      const totalRows = 1 + 1 + (hasDeductions ? (1 + (hasMeal ? 1 : 0) + (hasSnack ? 1 : 0)) : 0);

      let deductionNativeRows = '';
      if (hasDeductions) {
        deductionNativeRows += `
          <tr class="rincian-item-sub">
            <td class="live-editable" contenteditable="true" style="padding-left:12px;">Terpotong konsumsi:</td>
            <td></td>
            <td></td>
          </tr>`;
        if (hasMeal) {
          const isMealLast = !hasSnack;
          if (b.mealDetails && b.mealDetails.length > 0) {
            const detailRowsHtml = b.mealDetails.map(m =>
              `<span style="padding-left:12px; display:block;">• ${escHtml(m.day)} (${escHtml(m.session)}): 1 &times; ${rp(m.price)}</span>`
            ).join('');
            deductionNativeRows += `
              <tr class="rincian-item-sub${isMealLast ? ' rincian-item-last' : ''}">
                <td class="live-editable" contenteditable="true" style="padding-left:24px;">
                  * Makan (${b.mealDetails.length} kali makan):<br>
                  ${detailRowsHtml}
                </td>
                <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
                <td class="live-editable" contenteditable="true" style="vertical-align:bottom;">${mealKet}</td>
              </tr>`;
          } else {
            deductionNativeRows += `
              <tr class="rincian-item-sub${isMealLast ? ' rincian-item-last' : ''}">
                <td class="live-editable" contenteditable="true" style="padding-left:24px;">
                  * Makan<br>
                  <span style="padding-left:12px;">${b.mealDays} hari &times; ${b.mealCount} kali &times; ${rp(b.mealRate)}</span>
                </td>
                <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
                <td class="live-editable" contenteditable="true" style="vertical-align:bottom;">${mealKet}</td>
              </tr>`;
          }
        }
        if (hasSnack) {
          deductionNativeRows += `
            <tr class="rincian-item-sub rincian-item-last">
              <td class="live-editable" contenteditable="true" style="padding-left:24px;">
                * Snack<br>
                <span style="padding-left:12px;">${b.snackDays} hari &times; ${b.snackCount} kali &times; ${rp(b.snackRate)}</span>
              </td>
              <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.snackDeduction)}</td>
              <td class="live-editable" contenteditable="true"></td>
            </tr>`;
        }
      }

      rincianRows += `
        <tr class="rincian-item-main has-sub">
          <td class="tc rincian-no-cell" rowspan="${totalRows}">${no++}</td>
          <td class="live-editable" contenteditable="true">${b.multiProvData.title1}<br><span style="padding-left:12px">${b.multiProvData.days1} hari &nbsp; X &nbsp; ${rp(b.multiProvData.uhRate1)}</span></td>
          <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">${rp(b.multiProvData.uhGross1)}</td>
          <td class="live-editable" contenteditable="true">${uhKeterangan}</td>
        </tr>
        <tr class="rincian-item-sub${hasDeductions ? '' : ' rincian-item-last'}">
          <td class="live-editable" contenteditable="true">${b.multiProvData.title2}<br><span style="padding-left:12px">${b.multiProvData.days2} hari &nbsp; X &nbsp; ${rp(b.multiProvData.uhRate2)}</span></td>
          <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">${rp(b.multiProvData.uhGross2)}</td>
          <td class="live-editable" contenteditable="true"></td>
        </tr>
        ${deductionNativeRows}`;
    } else if (b.mealDeduction > 0 || b.snackDeduction > 0) {
      const hasMeal = b.mealDeduction > 0;
      const hasSnack = b.snackDeduction > 0;
      const totalRows = 1 + 1 + (hasMeal ? 1 : 0) + (hasSnack ? 1 : 0);

      let deductionNativeRows = '';
      if (hasMeal) {
        const isMealLast = !hasSnack;
        if (b.mealDetails && b.mealDetails.length > 0) {
          const detailRowsHtml = b.mealDetails.map(m =>
            `<span style="padding-left:12px; display:block;">• ${escHtml(m.day)} (${escHtml(m.session)}): 1 &times; ${rp(m.price)}</span>`
          ).join('');
          deductionNativeRows += `
            <tr class="rincian-item-sub${isMealLast ? ' rincian-item-last' : ''}">
              <td class="live-editable" contenteditable="true" style="padding-left:24px;">
                * Makan (${b.mealDetails.length} kali makan):<br>
                ${detailRowsHtml}
              </td>
              <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
              <td class="live-editable" contenteditable="true" style="vertical-align:bottom;">${mealKet}</td>
            </tr>`;
        } else {
          deductionNativeRows += `
            <tr class="rincian-item-sub${isMealLast ? ' rincian-item-last' : ''}">
              <td class="live-editable" contenteditable="true" style="padding-left:24px;">
                * Makan<br>
                <span style="padding-left:12px;">${b.mealDays} hari &times; ${b.mealCount} kali &times; ${rp(b.mealRate)}</span>
              </td>
              <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
              <td class="live-editable" contenteditable="true" style="vertical-align:bottom;">${mealKet}</td>
            </tr>`;
        }
      }
      if (hasSnack) {
        deductionNativeRows += `
          <tr class="rincian-item-sub rincian-item-last">
            <td class="live-editable" contenteditable="true" style="padding-left:24px;">
              * Snack<br>
              <span style="padding-left:12px;">${b.snackDays} hari &times; ${b.snackCount} kali &times; ${rp(b.snackRate)}</span>
            </td>
            <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.snackDeduction)}</td>
            <td class="live-editable" contenteditable="true"></td>
          </tr>`;
      }

      rincianRows += `
        <tr class="rincian-item-main has-sub">
          <td class="tc rincian-no-cell" rowspan="${totalRows}">${no++}</td>
          <td class="live-editable" contenteditable="true">${b.uhTitle || 'Uang Harian'}<br><span style="padding-left:12px">${days} hari &nbsp; X &nbsp; ${rp(b.uhBaseRate)}</span></td>
          <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">${rp(b.uhGross)}</td>
          <td class="live-editable" contenteditable="true">${uhKeterangan}</td>
        </tr>
        <tr class="rincian-item-sub">
          <td class="live-editable" contenteditable="true" style="padding-left:12px;">Terpotong konsumsi:</td>
          <td></td>
          <td></td>
        </tr>
        ${deductionNativeRows}`;
    } else {
      rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td class="live-editable" contenteditable="true">${b.uhTitle || 'Uang Harian'}<br><span style="padding-left:12px">${days} hari &nbsp; X &nbsp; ${rp(b.uhBaseRate)}</span></td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()">${rp(b.uh)}</td><td class="rincian-ket-cell live-editable" contenteditable="true">${uhKeterangan}</td></tr>`;
    }
  }
  if (b.representatif > 0) {
    const representatifKet = sbm && sbm.provinsi === 'DKI JAKARTA' ? 'Dalam kota' : 'Luar kota';
    rincianRows += `<tr class="rincian-ket-row" data-merge-ket-up="true"><td class="tc">${no++}</td><td class="live-editable" contenteditable="true">Biaya Representatif<br><span style="padding-left:12px">${days} hari &nbsp; X &nbsp; ${rp(b.representatifRate)}</span></td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()">${rp(b.representatif)}</td><td class="rincian-ket-cell live-editable" contenteditable="true">${representatifKet}</td></tr>`;
  }
  if (cbHotel && b.hotel > 0) {
    if (b.hotelDetails.length) {
      b.hotelDetails.forEach(item => {
        rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td class="live-editable" contenteditable="true">Penginapan/Hotel<br><span style="padding-left:12px">${item.nights} malam &nbsp; X &nbsp; ${rp(item.price)}</span></td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()">${rp(item.total)}</td><td class="rincian-ket-cell live-editable" contenteditable="true">${escHtml(item.name)}</td></tr>`;
      });
    } else {
      rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td class="live-editable" contenteditable="true">Penginapan/Hotel<br><span style="padding-left:12px">${nights} malam &nbsp; X &nbsp; ${rp(getHotelRate(sbm,emp.gol))}</span></td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()">${rp(b.hotel)}</td><td class="rincian-ket-cell live-editable" contenteditable="true"></td></tr>`;
    }
  }
  // 4. Tiket Perjalanan
  const ticketCosts = b.customCosts.filter(item => item.isTicket && item.amount > 0);
  const transportCosts = b.customCosts.filter(item => item.isTransport && item.amount > 0);
  const otherCosts = b.customCosts.filter(item => !item.isTransport && !item.isTicket && item.amount > 0);

  if (cbTiket && b.tiket > 0) {
    const ticketRoute = [kotaAsal, kotaTujuan].filter(Boolean).join(' - ');
    rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td class="live-editable" contenteditable="true">Tiket Pesawat PP</td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()">${rp(b.tiket)}</td><td class="rincian-ket-cell live-editable" contenteditable="true">${ticketRoute}</td></tr>`;
  }
  ticketCosts.forEach(item => {
    const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
    rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td class="live-editable" contenteditable="true">${escHtml(item.name)}</td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()">${rp(item.amount)}</td><td class="rincian-ket-cell live-editable" contenteditable="true">${escHtml(route)}</td></tr>`;
  });
  otherCosts.forEach(item => {
    const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
    rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td class="live-editable" contenteditable="true">${escHtml(item.name)}</td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()">${rp(item.amount)}</td><td class="rincian-ket-cell live-editable" contenteditable="true">${escHtml(route)}</td></tr>`;
  });

  // 5. Transport Lokal / DPR (Paling Bawah)
  const transportExtra = transportCosts.reduce((total, item) => total + item.amount, 0);
  if (b.dpr > 0 || transportExtra > 0) {
    const dprUraian = (sbm?.provinsi === 'DKI JAKARTA' && b.dpr > 0)
      ? `Daftar Pengeluaran Riil:<br>${kotaAsal} - ${kotaTujuan} PP`
      : `Transport ${kotaAsal} - ${kotaTujuan} (PP)`;
    const transportTotal = b.dpr + transportExtra;
    if (transportCosts.length) {
      const hasDates = transportCosts.some(t => t.date);
      let detailRows = '';
      let subRowCount = 1; // starts with 1 for the "Rincian Transport:" label row
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

        let totalItems = 0;
        sortedKeys.forEach(dateKey => {
          if (dateKey !== 'tanpa_tanggal') subRowCount++;
          subRowCount += groups[dateKey].length;
          totalItems += groups[dateKey].length;
        });

        let itemIndex = 0;
        detailRows = sortedKeys.map(dateKey => {
          let headerHtml = '';
          const items = groups[dateKey];
          const groupColor = (typeof getTransportDateColor === 'function') ? getTransportDateColor(emp.id, dateKey) : '#fef3c7';

          if (dateKey !== 'tanpa_tanggal') {
            const dateDisplay = typeof formatTgl === 'function' ? formatTgl(dateKey) : dateKey;
            headerHtml = `
              <tr class="rincian-item-sub rincian-date-group-row" style="background-color: ${groupColor}; font-weight: 700;">
                <td class="live-editable" contenteditable="true" style="padding-left: 18px; font-weight: 700; color: #000; background-color: ${groupColor};">
                  ${dateDisplay}
                  <input type="color" class="date-color-picker no-print" value="${groupColor}" onchange="setTransportDateColorForDate('${emp.id}', '${dateKey}', this.value)" title="Ganti warna baris ${dateDisplay}">
                </td>
                <td class="tr" style="background-color: ${groupColor};"></td>
                <td class="live-editable" contenteditable="true" style="background-color: ${groupColor};"></td>
              </tr>`;
          }

          const itemsHtml = items.map(item => {
            itemIndex++;
            const isLast = itemIndex === totalItems;
            const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
            const paddingLeft = dateKey !== 'tanpa_tanggal' ? '28px' : '24px';
            return `<tr class="rincian-item-sub${isLast ? ' rincian-item-last' : ''}"><td class="live-editable" contenteditable="true" style="padding-left: ${paddingLeft};"><em>${escHtml(item.name)}</em></td><td class="tr live-editable" contenteditable="true"><em>${rp(item.amount)}</em></td><td class="live-editable" contenteditable="true">${escHtml(route)}</td></tr>`;
          }).join('');

          return headerHtml + itemsHtml;
        }).join('');
      } else {
        subRowCount += transportCosts.length;
        detailRows = transportCosts.map((item, idx) => {
          const isLast = idx === transportCosts.length - 1;
          const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
          return `<tr class="rincian-item-sub${isLast ? ' rincian-item-last' : ''}"><td class="live-editable" contenteditable="true" style="padding-left: 24px;"><em>${escHtml(item.name)}</em></td><td class="tr live-editable" contenteditable="true"><em>${rp(item.amount)}</em></td><td class="live-editable" contenteditable="true">${escHtml(route)}</td></tr>`;
        }).join('');
      }
      const totalRows = 1 + subRowCount;
      rincianRows += `
        <tr class="rincian-item-main has-sub">
          <td class="tc rincian-no-cell" rowspan="${totalRows}">${no++}</td>
          <td class="live-editable" contenteditable="true">${dprUraian}</td>
          <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()"><strong>${rp(transportTotal)}</strong></td>
          <td class="live-editable" contenteditable="true"></td>
        </tr>
        <tr class="rincian-item-sub">
          <td class="live-editable" contenteditable="true" style="padding-left:12px"><em>Rincian Transport:</em></td>
          <td></td>
          <td></td>
        </tr>
        ${detailRows}`;
    } else {
      rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td class="live-editable" contenteditable="true">${dprUraian}</td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()">${rp(transportTotal)}</td><td class="rincian-ket-cell live-editable" contenteditable="true"></td></tr>`;
    }
  }

  return `
    <div class="rincian-doc" style="background:#fff; color:#000;">
      <h3>RINCIAN &nbsp; PERJALANAN &nbsp; DINAS</h3>
      <table class="rincian-meta-top">
        <tr><td>Lampiran SPD No.</td><td>:</td><td><span class="live-editable" id="rincianDocSpd" contenteditable="true" oninput="onRincianDocSpdInput(this)">${noSPD}</span></td></tr>
        <tr><td>Tanggal</td><td>:</td><td><span class="live-editable" contenteditable="true">${formatTgl(tglSPD)}</span></td></tr>
      </table>

      <table class="rincian-tbl">
        <colgroup><col class="col-rincian-no" style="width:36px"><col class="col-rincian-biaya"><col class="col-rincian-jumlah" style="width:125px"><col class="col-rincian-ket" style="width:250px"></colgroup>
        <thead>
          <tr>
            <th>NO</th>
            <th>PERINCIAN BIAYA</th>
            <th>J u m l a h</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${mergeRincianKeterangan(rincianRows) || '<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:16px">Tidak ada komponen biaya yang dipilih</td></tr>'}
          <tr class="rincian-total-row">
            <td colspan="2" style="text-align:center;font-weight:700">J u m l a h</td>
            <td class="tr" id="rincianDocGrandTotal" style="font-weight:700">${rp(b.total)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div class="rincian-terbilang">terbilang : <em id="rincianDocTerbilang">${terbilang(b.total)}</em></div>

      <div class="rincian-payment-row">
        <div class="rincian-payment-col">
          <div style="visibility:hidden">placeholder</div>
          <div>Telah dibayar sejumlah</div>
          <div class="rincian-amount-box rincian-sync-total">${rp(b.total)}</div>
          <div class="rincian-signatory-label">Bendahara Pengeluaran</div>
          <div class="rincian-sig-space"></div>
          <div class="rincian-name live-editable" contenteditable="true">${bendNama}</div>
          <div>NIP. ${bendNip.replace('NIP.','').trim()}</div>
        </div>
        <div class="rincian-payment-col">
          <div><span class="live-editable" contenteditable="true">${kotaAsal}</span>, <span class="live-editable" contenteditable="true">${formatTgl(tglSPD)}</span></div>
          <div>Telah menerima jumlah uang</div>
          <div class="rincian-amount-box rincian-sync-total">${rp(b.total)}</div>
          <div class="rincian-signatory-label">Yang Menerima</div>
          <div class="rincian-sig-space"></div>
          <div class="rincian-name live-editable" contenteditable="true">${emp.nama}</div>
          <div>NIP.${emp.nip}</div>
        </div>
      </div>

      <div class="rincian-spd-rampung">
        <div style="font-weight:700;text-align:center;margin-bottom:8px">PERHITUNGAN SPD RAMPUNG</div>
        <table class="rincian-spd-tbl">
          <tr><td>Ditetapkan sejumlah</td><td style="text-align:right" id="spdRampungDitetapkan">${rp(b.total)}</td></tr>
          <tr><td>Yang telah dibayar semula</td><td style="text-align:right" id="spdRampungDibayar">${rp(b.total)}</td></tr>
          <tr><td>Sisa/Kurang</td><td style="text-align:right">-</td></tr>
        </table>
      </div>

      <div class="rincian-ppk-sig">
        <div>Pejabat Pembuat Komitmen</div>
        <div>Sekretariat Jenderal Kementerian PKP</div>
        <div class="rincian-sig-space"></div>
        <div class="rincian-name live-editable" contenteditable="true">${ppkNama}</div>
        <div>${ppkNip}</div>
      </div>
    </div>
  `;
}

function renderRincian(targetEmp) {
  const sel = document.getElementById('rincianPegawai');
  const out = document.getElementById('rincianOut');
  if (!out) return;
  let emp = targetEmp;
  if (!emp) {
    if (!sel || !sel.value) {
      if (typeof selectedEmpIds !== 'undefined' && selectedEmpIds.size > 0 && sel) {
        sel.value = String([...selectedEmpIds][0]);
      } else {
        out.innerHTML = '<div class="alert-warn no-print">⚠️ Silakan pilih pegawai untuk melihat rincian biaya.</div>';
        return;
      }
    }
    const id = parseInt(sel.value);
    if (isNaN(id)) { out.innerHTML = ''; return; }
    emp = (typeof employees !== 'undefined' ? employees : []).find(e => e.id === id);
  }
  if (!emp) { out.innerHTML = ''; return; }
  out.innerHTML = buildRincianHtml(emp) + `
    <div class="btn-row no-print" style="margin-top:16px;justify-content:center">
      <button class="btn btn-success" onclick="printRincian()">🖨️ Print Rincian</button>
    </div>
  `;
}

function buildDPRHtml(emp, extraClass = '') {
  const isKKP = ((document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP');
  return isKKP ? buildDPRKKPHtml(emp, extraClass) : buildDPRLSHtml(emp, extraClass);
}

function isDPRAvailableForTrip() {
  const isKKP = ((document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP');
  const isDki = typeof isTripToDki === 'function' ? isTripToDki() : false;
  return isKKP || isDki;
}

function buildAllDocsHtmlForEmp(emp) {
  if (!emp) return '';
  const sections = [];
  // 1. Kuitansi Perorangan
  sections.push(buildKuitansiHtml(emp));
  // 2. Rekap / Rincian Biaya Perorangan (dan DPR jika ada)
  sections.push(buildRincianHtml(emp));
  if (typeof isDPRAvailableForTrip === 'function' && isDPRAvailableForTrip()) {
    sections.push(buildDPRHtml(emp));
  }
  // 3. SPPD Perorangan
  sections.push(buildSPPDHtml(emp));
  return `
    <div class="emp-bundle-doc" style="background:#ffffff; color:#000000; margin:0; padding:0;">
      ${sections.map((sec, idx) => `
        <div class="doc-page-section" style="${idx > 0 ? 'page-break-before: always; break-before: page;' : ''} margin:0; padding:0;">
          ${sec}
        </div>
      `).join('')}
    </div>
  `;
}

function onRincianDocSpdInput(el) {
  const select = document.getElementById('rincianPegawai');
  if (!select || !select.value) return;
  const empId = Number(select.value);
  const newSpd = (el.innerText || el.textContent || '').trim();
  if (typeof spdPerEmployee !== 'undefined') {
    spdPerEmployee[empId] = newSpd;
  }
  const input = document.getElementById('rincianNoSPD');
  if (input) {
    const match = newSpd.match(/^([^\/]+)/);
    if (match) input.value = match[1].trim();
  }
  if (typeof renderRincianEmpPills === 'function') renderRincianEmpPills();
}

function onRincianDocAmountChange() {
  const table = document.querySelector('.rincian-tbl tbody');
  if (!table) return;
  let total = 0;
  const amountCells = table.querySelectorAll('.tr-amount');
  amountCells.forEach(cell => {
    const text = (cell.innerText || cell.textContent || '').trim();
    if (!text) return;
    const isNegative = text.includes('-');
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) return;
    const val = parseInt(digits, 10) || 0;
    if (isNegative) {
      total -= val;
    } else {
      total += val;
    }
  });

  if (total < 0) total = 0;

  const grandTotalEl = document.getElementById('rincianDocGrandTotal');
  if (grandTotalEl) grandTotalEl.textContent = (typeof rp === 'function') ? rp(total) : 'Rp ' + total;

  const terbilangEl = document.getElementById('rincianDocTerbilang');
  if (terbilangEl) terbilangEl.textContent = (typeof terbilang === 'function') ? terbilang(total) : '';

  const syncBoxes = document.querySelectorAll('.rincian-sync-total');
  syncBoxes.forEach(box => {
    box.textContent = (typeof rp === 'function') ? rp(total) : 'Rp ' + total;
  });

  const ditetapkan = document.getElementById('spdRampungDitetapkan');
  if (ditetapkan) ditetapkan.textContent = (typeof rp === 'function') ? rp(total) : 'Rp ' + total;
  const dibayar = document.getElementById('spdRampungDibayar');
  if (dibayar) dibayar.textContent = (typeof rp === 'function') ? rp(total) : 'Rp ' + total;
}

function printRincian() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Pilih pegawai terlebih dahulu sebelum mencetak.');
    return;
  }
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
    const input = document.getElementById('rincianNoSPD');
    if (input) { 
      input.focus(); 
      input.classList.add('has-error'); 
      input.closest('.spd-prefix-wrap')?.classList.add('has-error');
    }
    return;
  }
  if (typeof renderRincian === 'function') renderRincian();
  const clearPrintMode = () => document.body.classList.remove('print-rincian');
  document.body.classList.add('print-rincian');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

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


