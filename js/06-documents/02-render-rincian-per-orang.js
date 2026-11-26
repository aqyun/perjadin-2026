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

