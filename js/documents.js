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
  const dateValue = document.getElementById('tglSPD').value || document.getElementById('tglST').value;
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  const year = date.getFullYear();
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const monthInput = document.getElementById('bulanKuitansi');
  if (!monthInput.value) monthInput.value = months[date.getMonth()];
  const month = monthInput.value.trim() || months[date.getMonth()];

  if (selectedEmpIds.size === 0) {
    out.innerHTML = '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const selectedEmps = [...selectedEmpIds].map(id => employees.find(emp => emp.id === id));
  const grandTotal = selectedEmps.reduce((total, emp) => total + hitungBiaya(emp).total, 0);
  const satker = document.getElementById('cfg_satker').value;
  const nomorBukti = document.getElementById('cfg_noBuktiKuitansi').value || '-';
  const kodeKegiatan = document.getElementById('kodeKegiatan').value;
  const kodeSubKegiatan = document.getElementById('kodeSubKegiatan').value;
  const mak = document.getElementById('mak').value;
  const agenda = document.getElementById('agenda').value.trim();
  const kegiatan = document.getElementById('cfg_kegiatan').value.trim();
  const kotaAsal = document.getElementById('cfg_kotaAsal').value;
  const ppkNama = document.getElementById('cfg_ppkNama').value;
  const ppkNip = document.getElementById('cfg_ppkNip').value;
  const bendNama = document.getElementById('cfg_bendNama').value;
  const bendNip = document.getElementById('cfg_bendNip').value;
  const monthYear = `${month} ${year}`;
  const makLengkap = `${kodeKegiatan}.${kodeSubKegiatan}.${mak}`;
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const paymentText = [agenda || `Perjalanan dinas ke ${kotaTeks ? getTujuanDisplay(kotaTeks) : '-'}`, kegiatan ? `Output ${kegiatan}` : '']
    .filter(Boolean)
    .join(', ');

  out.innerHTML = `
    <section class="kuitansi-area">
      <h2>KUITANSI LS</h2>
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

function populateKuitansiPeroranganSelect() {
  const select = document.getElementById('kuitansiPeroranganPegawai');
  const previousValue = select.value;
  select.innerHTML = '<option value="">-- Pilih Pegawai --</option>';
  [...selectedEmpIds].forEach(id => {
    const emp = employees.find(employee => employee.id === id);
    const option = document.createElement('option');
    option.value = id;
    option.textContent = emp.nama;
    select.appendChild(option);
  });

  if (selectedEmpIds.size === 0) {
    document.getElementById('kuitansiPeroranganOut').innerHTML = '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const previousId = Number(previousValue);
  select.value = previousValue !== '' && selectedEmpIds.has(previousId) ? previousValue : String([...selectedEmpIds][0]);
  loadKuitansiPeroranganSPD();
  renderKuitansiPerorangan();
}

function loadKuitansiPeroranganSPD() {
  const select = document.getElementById('kuitansiPeroranganPegawai');
  if (select.value === '') return;
  document.getElementById('kuitansiPeroranganNoSPD').value = spdPerEmployee[Number(select.value)] || '';
}

function onKuitansiPeroranganEmployeeChange() {
  loadKuitansiPeroranganSPD();
  renderKuitansiPerorangan();
}

function syncEmpSpdInputs(empId, val) {
  if (!empId) return;
  spdPerEmployee[empId] = val;
  const kpSelect = document.getElementById('kuitansiPeroranganPegawai');
  if (kpSelect && Number(kpSelect.value) === empId) {
    const kpInput = document.getElementById('kuitansiPeroranganNoSPD');
    if (kpInput && kpInput.value !== val) kpInput.value = val;
    if (kpInput && val) kpInput.classList.remove('has-error');
  }
  const sppdSelect = document.getElementById('sppdPegawai');
  if (sppdSelect && Number(sppdSelect.value) === empId) {
    const sppdInput = document.getElementById('sppdNoSPD');
    if (sppdInput && sppdInput.value !== val) sppdInput.value = val;
    if (sppdInput && val) sppdInput.classList.remove('has-error');
  }
  const rincianSelect = document.getElementById('rincianPegawai');
  if (rincianSelect && Number(rincianSelect.value) === empId) {
    const rincianInput = document.getElementById('rincianNoSPD');
    if (rincianInput && rincianInput.value !== val) rincianInput.value = val;
    if (rincianInput && val) rincianInput.classList.remove('has-error');
  }
  const dprSelect = document.getElementById('dprPegawai');
  if (dprSelect && Number(dprSelect.value) === empId) {
    const dprInput = document.getElementById('dprNoSPD');
    if (dprInput && dprInput.value !== val) dprInput.value = val;
    if (dprInput && val) dprInput.classList.remove('has-error');
  }
}

function saveKuitansiPeroranganSPD() {
  const select = document.getElementById('kuitansiPeroranganPegawai');
  if (select.value === '') return;
  const empId = Number(select.value);
  const value = document.getElementById('kuitansiPeroranganNoSPD').value.trim();
  syncEmpSpdInputs(empId, value);
  renderKuitansiPerorangan();
}

function renderKuitansiPerorangan() {
  const out = document.getElementById('kuitansiPeroranganOut');
  const select = document.getElementById('kuitansiPeroranganPegawai');
  if (select.value === '') {
    out.innerHTML = '';
    return;
  }
  const id = Number(select.value);
  const emp = employees.find(employee => employee.id === id);
  if (!emp) {
    out.innerHTML = '';
    return;
  }

  const biaya = hitungBiaya(emp);
  const tanggalSPDValue = document.getElementById('tglSPD').value || document.getElementById('tglST').value;
  const tanggalSPD = formatTgl(tanggalSPDValue);
  const date = tanggalSPDValue ? new Date(`${tanggalSPDValue}T00:00:00`) : new Date();
  const tahun = date.getFullYear();
  const nomorBukti = document.getElementById('cfg_noBuktiKuitansi').value;
  const satker = document.getElementById('cfg_satker').value;
  const alamat = document.getElementById('cfg_alamatKuitansi').value;
  const kotaAsal = document.getElementById('cfg_kotaAsal').value;
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const tujuan = getTujuanDisplay(kotaTeks);
  const paymentText = `Biaya Perjalanan Dinas atas nama ${emp.nama}`;
  const mak = `${document.getElementById('kodeKegiatan').value} ${document.getElementById('kodeSubKegiatan').value} ${document.getElementById('mak').value}`;
  const rawSPD = (spdPerEmployee[emp.id] || '').trim();
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const ppkNama = document.getElementById('cfg_ppkNama').value;
  const ppkNip = document.getElementById('cfg_ppkNip').value;
  const bendNama = document.getElementById('cfg_bendNama').value;
  const bendNip = document.getElementById('cfg_bendNip').value;

  out.innerHTML = `
    <section class="kuitansi-perorangan-area">
      <header class="kuitansi-perorangan-header lembar-kendali-header">
        <img src="logo-pkp.webp" alt="" class="kuitansi-perorangan-logo lembar-kendali-logo">
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

      <h2 class="kuitansi-perorangan-title">K W I T A N S I</h2>
      <table class="kuitansi-perorangan-details">
        <tr><td>Sudah Terima dari</td><td>:</td><td>${jabatanDuaBaris(document.getElementById('cfg_ppkJabatan').value)}</td></tr>
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
    if (input) { input.focus(); input.classList.add('has-error'); }
    return;
  }
  const clearPrintMode = () => document.body.classList.remove('print-kuitansi-perorangan');
  document.body.classList.add('print-kuitansi-perorangan');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

function populateSPPDSelect() {
  const select = document.getElementById('sppdPegawai');
  const previousValue = select.value;
  select.innerHTML = '<option value="">-- Pilih Pegawai --</option>';
  [...selectedEmpIds].forEach(id => {
    const emp = employees.find(employee => employee.id === id);
    if (!emp) return;
    const option = document.createElement('option');
    option.value = id;
    option.textContent = emp.nama;
    select.appendChild(option);
  });

  if (selectedEmpIds.size === 0) {
    document.getElementById('sppdOut').innerHTML = '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const previousId = Number(previousValue);
  select.value = previousValue !== '' && selectedEmpIds.has(previousId) ? previousValue : String([...selectedEmpIds][0]);
  loadSPPDNo();
  renderSPPDPerorangan();
}

function loadSPPDNo() {
  const select = document.getElementById('sppdPegawai');
  if (select.value === '') return;
  document.getElementById('sppdNoSPD').value = spdPerEmployee[Number(select.value)] || '';
}

function onSPPDEmployeeChange() {
  loadSPPDNo();
  renderSPPDPerorangan();
}

function saveSPPDNo() {
  const select = document.getElementById('sppdPegawai');
  if (select.value === '') return;
  const empId = Number(select.value);
  const value = document.getElementById('sppdNoSPD').value.trim();
  syncEmpSpdInputs(empId, value);
  renderSPPDPerorangan();
}

function renderSPPDPerorangan() {
  const out = document.getElementById('sppdOut');
  const select = document.getElementById('sppdPegawai');
  if (select.value === '') {
    out.innerHTML = '';
    return;
  }
  const emp = employees.find(employee => employee.id === Number(select.value));
  if (!emp) {
    out.innerHTML = '';
    return;
  }

  const sbm = getSBM();
  const empSegments = getEmpSegments(emp.id);
  const { days } = getEmpDays(emp.id);
  const satker = document.getElementById('cfg_satker').value;
  const alamat = document.getElementById('cfg_alamatKuitansi').value;
  const kotaAsal = document.getElementById('cfg_kotaAsal').value;
  const ppkNama = document.getElementById('cfg_ppkNama').value;
  const ppkNip = document.getElementById('cfg_ppkNip').value;
  const ppkJabatan = document.getElementById('cfg_ppkJabatan').value;
  const kegiatan = document.getElementById('cfg_kegiatan').value;
  const kodeKegiatan = document.getElementById('kodeKegiatan').value;
  const kodeSubKegiatan = document.getElementById('kodeSubKegiatan').value;
  const mak = document.getElementById('mak').value;
  const agenda = document.getElementById('agenda').value.trim() || '-';
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const tujuan = getTujuanDisplay(kotaTeks);
  const rawSPD = (spdPerEmployee[emp.id] || '').trim();
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const tanggalSPD = formatTgl(document.getElementById('tglSPD').value);
  const tripDays = expandTripDays(empSegments);
  const tripContiguous = tripDays.length > 0 && tripDays.length === daySpan(tripDays[0], tripDays[tripDays.length - 1]);
  const tglBerangkat = !tripContiguous && tripDays.length > 1
    ? `${formatTanggalList(tripDays.slice(0, -1))}, dan`
    : formatTgl(empSegments.length ? empSegments[0].start : document.getElementById('tglBerangkat').value);
  const tglKembali = formatTgl(tripDays.length ? tripDays[tripDays.length - 1] : (empSegments.length ? empSegments[empSegments.length - 1].end : document.getElementById('tglKembali').value));
  const noST = document.getElementById('noST').value.trim() || '-';
  const tglST = formatTgl(document.getElementById('tglST').value);
  const pangkat = emp.pangkat && emp.pangkat !== '-' ? emp.pangkat : '-';
  const hasPesawatCost = typeof getCustomCosts === 'function' && getCustomCosts().some(c => /pesawat|udara/i.test(c.name) || (c.kind === 'tiket' && /pesawat/i.test(c.name)));
  const transport = (document.getElementById('cbTiket')?.checked || hasPesawatCost) ? 'Pesawat Udara' : 'Transportasi Darat';
  const lamaKata = terbilang(days).replace(/\s*Rupiah$/, '').toLowerCase();
  const pengikutRows = [1, 2, 3, 4, 5].map(() => `
        <tr><td></td><td></td><td></td></tr>`).join('');
  const pengikutNums = [1, 2, 3, 4, 5].map(number => `<tr><td>${number}.</td></tr>`).join('');

  out.innerHTML = `
    <section class="sppd-area">
      <header class="kuitansi-perorangan-header lembar-kendali-header">
        <img src="logo-pkp.webp" alt="" class="kuitansi-perorangan-logo lembar-kendali-logo">
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
    if (input) { input.focus(); input.classList.add('has-error'); }
    return;
  }
  const clearPrintMode = () => document.body.classList.remove('print-sppd');
  document.body.classList.add('print-sppd');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

function renderLembarKendali() {
  const out = document.getElementById('lembarKendaliOut');
  if (selectedEmpIds.size === 0) {
    out.innerHTML = '<div class="alert-warn no-print">Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const sbm = getSBM();
  const selectedEmps = [...selectedEmpIds].map(id => employees.find(emp => emp.id === id));
  const total = selectedEmps.reduce((sum, emp) => sum + hitungBiaya(emp).total, 0);
  const satker = document.getElementById('cfg_satker').value;
  const alamat = document.getElementById('cfg_alamatSatker').value;
  const pelaksana = document.getElementById('lk_pelaksana').value || '-';
  const tanggalMasuk = document.getElementById('lk_tanggalMasuk').value;
  const nomorSPM = document.getElementById('lk_nomorSPM').value;
  const nomorSPD = document.getElementById('lk_nomorSPD').value;
  const nomorST = document.getElementById('noST').value || '-';
  const tanggalST = formatTgl(document.getElementById('tglST').value);
  const allTripSegs = selectedEmps.flatMap(emp => getEmpSegments(emp.id));
  const tripStart = allTripSegs.length ? allTripSegs.reduce((min, s) => (s.start < min ? s.start : min), allTripSegs[0].start) : document.getElementById('tglBerangkat').value;
  const tripEnd = allTripSegs.length ? allTripSegs.reduce((max, s) => (s.end > max ? s.end : max), allTripSegs[0].end) : document.getElementById('tglKembali').value;
  const tanggalBerangkat = formatTgl(tripStart);
  const tanggalKembali = formatTgl(tripEnd);
  const verifNama = document.getElementById('cfg_verifikatorNama').value.trim();
  const verifNipRaw = document.getElementById('cfg_verifikatorNip').value.trim().replace(/^NIP\.?\s*/i, '');
  const jenisPerjalanan = document.getElementById('lk_jenisPerjalanan').value;
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const tujuan = getTujuanDisplay(kotaTeks);
  const tujuanPerjalanan = document.getElementById('agenda').value.trim() || tujuan;
  const akunKegiatan = `${document.getElementById('kodeKegiatan').value}.${document.getElementById('kodeSubKegiatan').value}.${document.getElementById('mak').value}`;
  const checklistItems = [
    'Surat Undangan (Jika Ada)',
    'Surat Tugas',
    'Surat Perjalanan Dinas',
    'Daftar Nominatif',
    'Daftar Rincian Perjalanan Dinas',
    'Daftar Rekap SPT',
    'Daftar Pengeluaran Riil (DPR)',
    'Kuitansi LS',
    'Bukti Pembayaran Transportasi (Kereta/Pesawat/Kapal Laut/Bus)',
    'Boarding Pass',
    'Bukti Pembayaran Taksi, BBM, Tol',
    'Kuitansi Pembayaran Hotel',
    'Laporan Perjalanan Dinas',
    'SP2D (Lembar Dua)',
    'Tanda Tangan pada Link Monitoring Perjadin'
  ];

  out.innerHTML = `
    <section class="lembar-kendali-area">
      <header class="lembar-kendali-header">
        <img class="lembar-kendali-logo" src="logo-pkp.webp" alt="">
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

      <div class="lembar-kendali-section-title lembar-kendali-section-title-checklist">CHECKLIST PENGENDALIAN PERJALANAN DINAS</div>
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

  const sbm = getSBM();
  const selectedEmps = [...selectedEmpIds].map(id => employees.find(emp => emp.id === id));
  const rows = selectedEmps.map((emp, index) => ({
    emp,
    index: index + 1,
    biaya: hitungBiaya(emp),
    segs: getEmpSegments(emp.id),
    days: getEmpDays(emp.id).days
  }));
  const satker = document.getElementById('cfg_satker').value;
  const kodeSatker = document.getElementById('cfg_kodeSatker').value;
  const kodeKegiatan = document.getElementById('kodeKegiatan').value;
  const kodeSubKegiatan = document.getElementById('kodeSubKegiatan').value;
  const mak = document.getElementById('mak').value;
  const kegiatan = document.getElementById('cfg_kegiatan').value;
  const bank = document.getElementById('cfg_bank').value;
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const tujuan = getTujuanDisplay(kotaTeks);
  const tanggalBerangkat = document.getElementById('tglBerangkat').value;
  const tanggalKembali = document.getElementById('tglKembali').value;
  const cbUH = document.getElementById('cbUH').checked;
  const cbHotel = document.getElementById('cbHotel').checked;
  const cbDPR = document.getElementById('cbDPR').checked;
  const cbTiket = document.getElementById('cbTiket').checked;
  const customCosts = getCustomCosts();
  const ppkNama = document.getElementById('cfg_ppkNama').value;
  const ppkNip = document.getElementById('cfg_ppkNip').value;
  const ppkJabatan = document.getElementById('cfg_ppkJabatan').value;
  const bendNama = document.getElementById('cfg_bendNama').value;
  const bendNip = document.getElementById('cfg_bendNip').value;

  const biayaColumns = [];
  if (rows.some(row => row.biaya.representatif > 0)) {
    biayaColumns.push({ label: 'Representatif', value: biaya => biaya.representatif });
  }
  if (cbHotel) biayaColumns.push({ label: 'Penginapan', value: biaya => biaya.hotel });
  const hasTransportCost = customCosts.some(item => item.kind === 'transport');
  const hasDprCost = rows.some(row => row.biaya.dpr > 0);
  if (hasDprCost || hasTransportCost) {
    biayaColumns.push({
      label: 'DPR',
      value: biaya => biaya.dpr + biaya.customCosts.reduce((total, item) => total + (item.isTransport ? item.amount : 0), 0)
    });
  }
  const ticketGroups = new Map();
  const otherColumns = [];
  customCosts.forEach((item, index) => {
    if (item.kind === 'transport') return;
    if (item.kind === 'tiket') {
      const label = getTicketCostLabel(item.name);
      if (!ticketGroups.has(label)) ticketGroups.set(label, []);
      ticketGroups.get(label).push(index);
      return;
    }
    otherColumns.push({ label: item.name, value: biaya => biaya.customCosts[index]?.amount || 0 });
  });
  const planeTicketLabel = 'Tiket Pesawat Udara';
  if (cbTiket && !ticketGroups.has(planeTicketLabel)) ticketGroups.set(planeTicketLabel, []);
  ticketGroups.forEach((indices, label) => {
    const includeSbmTiket = label === planeTicketLabel;
    biayaColumns.push({
      label,
      value: biaya => (includeSbmTiket ? biaya.tiket : 0) +
        indices.reduce((total, index) => total + (biaya.customCosts[index]?.amount || 0), 0)
    });
  });
  biayaColumns.push(...otherColumns);

  const grandTotal = rows.reduce((total, row) => total + row.biaya.total, 0);
  const totalUangHarian = rows.reduce((total, row) => total + row.biaya.uh, 0);
  const multiSegRows = rows.filter(row => row.segs.length > 1);
  const biayaColspan = Math.max(1, biayaColumns.length);
  const financialColumnCount = (cbUH ? 1 : 0) + biayaColspan + 1;
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
            ${cbUH ? '<th rowspan="2">Uang Harian</th>' : ''}
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
              ${cbUH ? `<td class="rekap-rincian-number">${rp(row.biaya.uh)}</td>` : ''}
              ${biayaColumns.length ? biayaColumns.map(column => `<td class="rekap-rincian-number">${rp(column.value(row.biaya))}</td>`).join('') : '<td class="rekap-rincian-center">-</td>'}
              <td class="rekap-rincian-number">${rp(row.biaya.total)}</td>
            </tr>
          `).join('')}
          <tr class="rekap-rincian-total">
            <td colspan="8" class="rekap-rincian-center">Jumlah</td>
            ${cbUH ? `<td class="rekap-rincian-number">${rp(totalUangHarian)}</td>` : ''}
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

  const sbm = getSBM();
  const selectedEmps = [...selectedEmpIds].map(id => employees.find(emp => emp.id === id));
  const satker = document.getElementById('cfg_satker').value;
  const kodeSatker = document.getElementById('cfg_kodeSatker').value;
  const kodeKegiatan = document.getElementById('kodeKegiatan').value;
  const kodeSubKegiatan = document.getElementById('kodeSubKegiatan').value;
  const mak = document.getElementById('mak').value;
  const kegiatan = document.getElementById('cfg_kegiatan').value;
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const kotaTujuan = getTujuanDisplay(kotaTeks);
  const tanggalSPT = formatTgl(document.getElementById('tglST').value);
  const nomorSPT = document.getElementById('noST').value || '-';
  const ppkNama = document.getElementById('cfg_ppkNama').value;
  const ppkNip = document.getElementById('cfg_ppkNip').value;
  const ppkJabatan = document.getElementById('cfg_ppkJabatan').value;

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
          <col style="width:5%"><col style="width:10%"><col style="width:29%">
          <col style="width:12%"><col style="width:16%"><col style="width:13%"><col style="width:15%">
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
              <td class="rekap-spt-center">${index + 1}</td>
              <td class="rekap-spt-center">${mak}</td>
              <td class="rekap-spt-emp-cell">
                <div class="rekap-spt-emp-nama">${emp.nama}</div>
                <div class="rekap-spt-emp-nip">NIP. ${emp.nip}</div>
              </td>
              <td>Perjalanan Dinas ke</td>
              <td class="rekap-spt-center">${kotaTujuan}</td>
              <td class="rekap-spt-center">${tanggalSPT}</td>
              <td class="rekap-spt-center">${nomorSPT}</td>
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
  const sbm = getSBM();
  const tglBrkt = document.getElementById('tglBerangkat').value;
  const tglKmb = document.getElementById('tglKembali').value;
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const kotaTujuan = getTujuanDisplay(kotaTeks);
  const satker = document.getElementById('cfg_satker').value;
  const kodeSatker = document.getElementById('cfg_kodeSatker').value;
  const kodeKeg = document.getElementById('kodeKegiatan').value;
  const kodeSubKeg = document.getElementById('kodeSubKegiatan').value;
  const mak = document.getElementById('mak').value;
  const kegiatan = document.getElementById('cfg_kegiatan').value;
  const bank = document.getElementById('cfg_bank').value;
  const ppkNama = document.getElementById('cfg_ppkNama').value;
  const ppkNip = document.getElementById('cfg_ppkNip').value;
  const bendNama = document.getElementById('cfg_bendNama').value;
  const bendNip = document.getElementById('cfg_bendNip').value;

  const selectedEmps = [...selectedEmpIds].map(id => employees.find(e => e.id === id));

  // Calculate totals
  let grandTotal = 0;
  const rows = selectedEmps.map((emp, idx) => {
    const b = hitungBiaya(emp);
    grandTotal += b.total;
    return { emp, b, idx: idx + 1, segs: getEmpSegments(emp.id), days: getEmpDays(emp.id).days };
  });
  const multiSegRows = rows.filter(r => r.segs.length > 1);

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
            <col style="width:3.5%"><col style="width:20%"><col style="width:4.5%"><col style="width:18.5%">
            <col style="width:13%"><col style="width:8.5%"><col style="width:8.5%"><col style="width:7.5%"><col style="width:16%">
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
                <td class="tc">${formatTgl(r.segs.length ? r.segs[0].start : tglBrkt).replace(/ (\d{4})$/, '<br>$1')}</td>
                <td class="tc">${formatTgl(r.segs.length ? r.segs[r.segs.length - 1].end : tglKmb).replace(/ (\d{4})$/, '<br>$1')}</td>
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
  const sel = document.getElementById('rincianPegawai');
  const previousValue = sel.value;
  sel.innerHTML = '<option value="">-- Pilih Pegawai --</option>';
  [...selectedEmpIds].forEach(id => {
    const e = employees.find(x => x.id === id);
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = e.nama;
    sel.appendChild(opt);
  });
  if (selectedEmpIds.size === 0) {
    document.getElementById('rincianOut').innerHTML = '<div class="alert-warn">⚠️ Belum ada pegawai dipilih. Kembali ke Input Perjalanan.</div>';
    return;
  }
  const previousId = Number(previousValue);
  sel.value = previousValue !== '' && selectedEmpIds.has(previousId) ? previousValue : String([...selectedEmpIds][0]);
  loadRincianSPD();
  renderRincian();
}

function loadRincianSPD() {
  const select = document.getElementById('rincianPegawai');
  const input = document.getElementById('rincianNoSPD');
  input.value = select.value === '' ? '' : (spdPerEmployee[Number(select.value)] || '');
}

function onRincianEmployeeChange() {
  loadRincianSPD();
  renderRincian();
}

function saveRincianSPD() {
  const select = document.getElementById('rincianPegawai');
  if (select.value === '') return;
  const empId = Number(select.value);
  const value = document.getElementById('rincianNoSPD').value.trim();
  syncEmpSpdInputs(empId, value);
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

function renderRincian() {
  const id = parseInt(document.getElementById('rincianPegawai').value);
  if (!id && id !== 0) { document.getElementById('rincianOut').innerHTML = ''; return; }
  const emp = employees.find(e => e.id === id);
  const sbm = getSBM();
  const { days, nights } = getEmpDays(emp.id);
  const b = hitungBiaya(emp);
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const kotaTujuan = getTujuanDisplay(kotaTeks);
  const rawSPD = (spdPerEmployee[emp.id] || '').trim();
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const tglSPD = document.getElementById('tglSPD').value;
  const kotaAsal = document.getElementById('cfg_kotaAsal').value;
  const ppkNama = document.getElementById('cfg_ppkNama').value;
  const ppkNip = document.getElementById('cfg_ppkNip').value;
  const bendNama = document.getElementById('cfg_bendNama').value;
  const bendNip = document.getElementById('cfg_bendNip').value;
  const agenda = document.getElementById('agenda').value || '-';
  const cbUH = document.getElementById('cbUH').checked;
  const cbHotel = document.getElementById('cbHotel').checked;
  const cbDPR = document.getElementById('cbDPR').checked;
  const cbTiket = document.getElementById('cbTiket').checked;
  const uhPercent = Number(document.getElementById('uhPersentase').value) || 1;

  let rincianRows = '';
  let no = 1;
  const uhKeterangan = b.jenisKeg === 'fullboard'
    ? 'Paket Fullboard'
    : b.jenisKeg === 'diklat'
    ? 'Diklat / Pelatihan'
    : (uhPercent < 1 ? 'Menggunakan Kendaraan Dinas Operasional' : '');

  if (cbUH && (b.uhGross > 0 || b.uh > 0)) {
    if (b.isMultiProv && b.multiProvData) {
      let deductionBlock = '';
      if (b.mealDeduction > 0 || b.snackDeduction > 0) {
        let deductionRows = '';
        if (b.mealDeduction > 0) {
          deductionRows += `
            <tr>
              <td style="padding-left:24px;">
                * Makan<br>
                <span style="padding-left:12px;">${b.mealDays} hari &times; ${b.mealCount} kali &times; ${rp(b.mealRate)}</span>
              </td>
              <td class="tr" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
              <td></td>
            </tr>`;
        }
        if (b.snackDeduction > 0) {
          deductionRows += `
            <tr>
              <td style="padding-left:24px;">
                * Snack<br>
                <span style="padding-left:12px;">${b.snackDays} hari &times; ${b.snackCount} kali &times; ${rp(b.snackRate)}</span>
              </td>
              <td class="tr" style="vertical-align:bottom;">- ${rp(b.snackDeduction)}</td>
              <td></td>
            </tr>`;
        }
        deductionBlock = `
          <tr>
            <td style="padding-left:12px;">Terpotong konsumsi:</td>
            <td></td>
            <td></td>
          </tr>
          ${deductionRows}`;
      }

      rincianRows += `<tr>
        <td class="tc">${no++}</td>
        <td colspan="3" style="padding:0">
          <table class="rincian-subtbl">
            <colgroup><col><col style="width:130px"><col style="width:120px"></colgroup>
            <tbody>
              <tr>
                <td>${b.multiProvData.title1}<br><span style="padding-left:12px">${b.multiProvData.days1} hari &nbsp; X &nbsp; ${rp(b.multiProvData.uhRate1)}</span></td>
                <td class="tr" style="vertical-align:bottom;">${rp(b.multiProvData.uhGross1)}</td>
                <td>${uhKeterangan}</td>
              </tr>
              <tr>
                <td>${b.multiProvData.title2}<br><span style="padding-left:12px">${b.multiProvData.days2} hari &nbsp; X &nbsp; ${rp(b.multiProvData.uhRate2)}</span></td>
                <td class="tr" style="vertical-align:bottom;">${rp(b.multiProvData.uhGross2)}</td>
                <td></td>
              </tr>
              ${deductionBlock}
            </tbody>
          </table>
        </td>
      </tr>`;
    } else if (b.mealDeduction > 0 || b.snackDeduction > 0) {
      let deductionRows = '';
      if (b.mealDeduction > 0) {
        deductionRows += `
          <tr>
            <td style="padding-left:24px;">
              * Makan<br>
              <span style="padding-left:12px;">${b.mealDays} hari &times; ${b.mealCount} kali &times; ${rp(b.mealRate)}</span>
            </td>
            <td class="tr" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
            <td></td>
          </tr>`;
      }
      if (b.snackDeduction > 0) {
        deductionRows += `
          <tr>
            <td style="padding-left:24px;">
              * Snack<br>
              <span style="padding-left:12px;">${b.snackDays} hari &times; ${b.snackCount} kali &times; ${rp(b.snackRate)}</span>
            </td>
            <td class="tr" style="vertical-align:bottom;">- ${rp(b.snackDeduction)}</td>
            <td></td>
          </tr>`;
      }
      rincianRows += `<tr>
        <td class="tc">${no++}</td>
        <td colspan="3" style="padding:0">
          <table class="rincian-subtbl">
            <colgroup><col><col style="width:130px"><col style="width:120px"></colgroup>
            <tbody>
              <tr>
                <td>${b.uhTitle || 'Uang Harian'}<br><span style="padding-left:12px">${days} hari &nbsp; X &nbsp; ${rp(b.uhBaseRate)}</span></td>
                <td class="tr" style="vertical-align:bottom;">${rp(b.uhGross)}</td>
                <td>${uhKeterangan}</td>
              </tr>
              <tr>
                <td style="padding-left:12px;">Terpotong konsumsi:</td>
                <td></td>
                <td></td>
              </tr>
              ${deductionRows}
            </tbody>
          </table>
        </td>
      </tr>`;
    } else {
      rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td>${b.uhTitle || 'Uang Harian'}<br><span style="padding-left:12px">${days} hari &nbsp; X &nbsp; ${rp(b.uhBaseRate)}</span></td><td class="tr">${rp(b.uh)}</td><td class="rincian-ket-cell">${uhKeterangan}</td></tr>`;
    }
  }
  if (b.representatif > 0) {
    const representatifKet = sbm && sbm.provinsi === 'DKI JAKARTA' ? 'Dalam kota' : 'Luar kota';
    rincianRows += `<tr class="rincian-ket-row" data-merge-ket-up="true"><td class="tc">${no++}</td><td>Biaya Representatif<br><span style="padding-left:12px">${days} hari &nbsp; X &nbsp; ${rp(b.representatifRate)}</span></td><td class="tr">${rp(b.representatif)}</td><td class="rincian-ket-cell">${representatifKet}</td></tr>`;
  }
  if (cbHotel && b.hotel > 0) {
    if (b.hotelDetails.length) {
      b.hotelDetails.forEach(item => {
        rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td>Penginapan/Hotel<br><span style="padding-left:12px">${item.nights} malam &nbsp; X &nbsp; ${rp(item.price)}</span></td><td class="tr">${rp(item.total)}</td><td class="rincian-ket-cell">${escHtml(item.name)}</td></tr>`;
      });
    } else {
      rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td>Penginapan/Hotel<br><span style="padding-left:12px">${nights} malam &nbsp; X &nbsp; ${rp(getHotelRate(sbm,emp.gol))}</span></td><td class="tr">${rp(b.hotel)}</td><td class="rincian-ket-cell"></td></tr>`;
    }
  }
  const transportCosts = b.customCosts.filter(item => item.isTransport && item.amount > 0);
  const otherCosts = b.customCosts.filter(item => !item.isTransport && item.amount > 0);
  const transportExtra = transportCosts.reduce((total, item) => total + item.amount, 0);
  if (b.dpr > 0 || transportExtra > 0) {
    const dprUraian = (sbm?.provinsi === 'DKI JAKARTA' && b.dpr > 0)
      ? `Daftar Pengeluaran Riil:<br>${kotaAsal} - ${kotaTujuan} PP`
      : `Transport ${kotaAsal} - ${kotaTujuan} (PP)`;
    const transportTotal = b.dpr + transportExtra;
    if (transportCosts.length) {
      const detailRows = transportCosts.map(item => {
        const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
        return `<tr><td style="padding-left:24px"><em>${item.name}</em></td><td class="tr"><em>${rp(item.amount)}</em></td><td>${route}</td></tr>`;
      }).join('');
      rincianRows += `<tr>
        <td class="tc">${no++}</td>
        <td colspan="3" style="padding:0">
          <table class="rincian-subtbl">
            <colgroup><col><col style="width:130px"><col style="width:120px"></colgroup>
            <tbody>
              <tr><td>${dprUraian}</td><td class="tr"><strong>${rp(transportTotal)}</strong></td><td></td></tr>
              <tr><td style="padding-left:12px"><em>Rincian Transport:</em></td><td></td><td></td></tr>
              ${detailRows}
            </tbody>
          </table>
        </td>
      </tr>`;
    } else {
      rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td>${dprUraian}</td><td class="tr">${rp(transportTotal)}</td><td class="rincian-ket-cell"></td></tr>`;
    }
  }
  if (cbTiket && b.tiket > 0) {
    const ticketRoute = [kotaAsal, kotaTujuan].filter(Boolean).join(' - ');
    rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td>Tiket Pesawat PP</td><td class="tr">${rp(b.tiket)}</td><td class="rincian-ket-cell">${ticketRoute}</td></tr>`;
  }
  otherCosts.forEach(item => {
    const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
    rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td>${item.name}</td><td class="tr">${rp(item.amount)}</td><td class="rincian-ket-cell">${route}</td></tr>`;
  });

  document.getElementById('rincianOut').innerHTML = `
    <div class="rincian-doc">
      <h3>RINCIAN &nbsp; PERJALANAN &nbsp; DINAS</h3>
      <table class="rincian-meta-top">
        <tr><td>Lampiran SPD No.</td><td>:</td><td>${noSPD}</td></tr>
        <tr><td>Tanggal</td><td>:</td><td>${formatTgl(tglSPD)}</td></tr>
      </table>

      <table class="rincian-tbl">
        <colgroup><col style="width:40px"><col><col style="width:130px"><col style="width:120px"></colgroup>
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
            <td class="tr" style="font-weight:700">${rp(b.total)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div class="rincian-terbilang">terbilang : <em>${terbilang(b.total)}</em></div>

      <div class="rincian-payment-row">
        <div class="rincian-payment-col">
          <div style="visibility:hidden">placeholder</div>
          <div>Telah dibayar sejumlah</div>
          <div class="rincian-amount-box">${rp(b.total)}</div>
          <div class="rincian-signatory-label">Bendahara Pengeluaran</div>
          <div class="rincian-sig-space"></div>
          <div class="rincian-name">${bendNama}</div>
          <div>NIP. ${bendNip.replace('NIP.','').trim()}</div>
        </div>
        <div class="rincian-payment-col">
          <div>${kotaAsal}, ${formatTgl(tglSPD)}</div>
          <div>Telah menerima jumlah uang</div>
          <div class="rincian-amount-box">${rp(b.total)}</div>
          <div class="rincian-signatory-label">Yang Menerima</div>
          <div class="rincian-sig-space"></div>
          <div class="rincian-name">${emp.nama}</div>
          <div>NIP.${emp.nip}</div>
        </div>
      </div>

      <div class="rincian-spd-rampung">
        <div style="font-weight:700;text-align:center;margin-bottom:8px">PERHITUNGAN SPD RAMPUNG</div>
        <table class="rincian-spd-tbl">
          <tr><td>Ditetapkan sejumlah</td><td style="text-align:right">${rp(b.total)}</td></tr>
          <tr><td>Yang telah dibayar semula</td><td style="text-align:right">${rp(b.total)}</td></tr>
          <tr><td>Sisa/Kurang</td><td style="text-align:right">-</td></tr>
        </table>
      </div>

      <div class="rincian-ppk-sig">
        <div>Pejabat Pembuat Komitmen</div>
        <div>Sekretariat Jenderal Kementerian PKP</div>
        <div class="rincian-sig-space"></div>
        <div class="rincian-name">${ppkNama}</div>
        <div>${ppkNip}</div>
      </div>
    </div>
    <div class="btn-row no-print" style="margin-top:16px;justify-content:center">
      <button class="btn btn-success" onclick="printRincian()">🖨️ Print Rincian</button>
    </div>
  `;
}

function printRincian() {
  const select = document.getElementById('rincianPegawai');
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
    if (input) { input.focus(); input.classList.add('has-error'); }
    return;
  }
  const clearPrintMode = () => document.body.classList.remove('print-rincian');
  document.body.classList.add('print-rincian');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

// =====================================================================
// DAFTAR PENGELUARAN RIIL (DPR) PER ORANG
// =====================================================================
function populateDPRSelect() {
  const select = document.getElementById('dprPegawai');
  const previousValue = select.value;
  select.innerHTML = '<option value="">-- Pilih Pegawai --</option>';
  [...selectedEmpIds].forEach(id => {
    const emp = employees.find(employee => employee.id === id);
    if (!emp) return;
    const option = document.createElement('option');
    option.value = id;
    option.textContent = emp.nama;
    select.appendChild(option);
  });

  if (selectedEmpIds.size === 0) {
    document.getElementById('dprOut').innerHTML = '<div class="alert-warn">⚠️ Belum ada pegawai yang dipilih. Kembali ke tab Input Perjalanan.</div>';
    return;
  }

  const previousId = Number(previousValue);
  select.value = previousValue !== '' && selectedEmpIds.has(previousId) ? previousValue : String([...selectedEmpIds][0]);
  loadDPRNo();
  renderDPR();
}

function loadDPRNo() {
  const select = document.getElementById('dprPegawai');
  document.getElementById('dprNoSPD').value = select.value === '' ? '' : (spdPerEmployee[Number(select.value)] || '');
}

function onDPREmployeeChange() {
  loadDPRNo();
  renderDPR();
}

function saveDPRNoSPD() {
  const select = document.getElementById('dprPegawai');
  if (select.value === '') return;
  const empId = Number(select.value);
  const value = document.getElementById('dprNoSPD').value.trim();
  syncEmpSpdInputs(empId, value);
  renderDPR();
}

function renderDPR() {
  const out = document.getElementById('dprOut');
  const select = document.getElementById('dprPegawai');
  if (select.value === '') {
    out.innerHTML = '';
    return;
  }
  const emp = employees.find(employee => employee.id === Number(select.value));
  if (!emp) {
    out.innerHTML = '';
    return;
  }

  const sbm = getSBM();
  if (!sbm || sbm.provinsi !== 'DKI JAKARTA') {
    out.innerHTML = '<div class="alert-warn">⚠️ Lembar Daftar Pengeluaran Riil (DPR) hanya untuk Perjalanan Dinas dalam kota DKI Jakarta (DPR Rp 170.000). Untuk provinsi selain DKI Jakarta, pengeluaran riil tidak tersedia.</div>';
    return;
  }
  const biaya = hitungBiaya(emp);

  const alamat = document.getElementById('cfg_alamatKuitansi').value;
  const kotaAsal = document.getElementById('cfg_kotaAsal').value;
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const tujuan = getTujuanDisplay(kotaTeks);
  const rawSPD = (spdPerEmployee[emp.id] || '').trim();
  const noSPD = rawSPD || '<span class="spd-missing-badge">[No. SPD Wajib Diisi]</span>';
  const tanggalSPD = formatTgl(document.getElementById('tglSPD').value);
  const ppkNama = document.getElementById('cfg_ppkNama').value;
  const ppkNip = document.getElementById('cfg_ppkNip').value;
  const ppkJabatan = document.getElementById('cfg_ppkJabatan').value;
  const dprAmount = Number(biaya.dpr);

  out.innerHTML = `
    <section class="dpr-area">
      <header class="kuitansi-perorangan-header lembar-kendali-header">
        <img src="logo-pkp.webp" alt="" class="kuitansi-perorangan-logo lembar-kendali-logo">
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
              <tr>
                <td class="tc">1</td>
                <td>
                  <div class="dpr-uraian-title">Daftar Pengeluaran Riil</div>
                  <div>${kotaAsal} - ${tujuan} (PP)</div>
                  <div>1 orang x 1 hari x @${dprAmount.toLocaleString('id-ID')}</div>
                </td>
                <td class="dpr-jumlah">${rp(dprAmount)}</td>
              </tr>
              <tr><td colspan="2" class="dpr-total-label">Jumlah</td><td class="dpr-jumlah">${rp(dprAmount)}</td></tr>
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

function printDPR() {
  const select = document.getElementById('dprPegawai');
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
    const input = document.getElementById('dprNoSPD');
    if (input) { input.focus(); input.classList.add('has-error'); }
    return;
  }
  const clearPrintMode = () => document.body.classList.remove('print-dpr');
  document.body.classList.add('print-dpr');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}
