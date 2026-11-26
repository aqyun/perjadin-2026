// =====================================================================
// KALKULATOR SIMULASI PERHITUNGAN BIAYA PERDIN (NON-SPJ / READ-ONLY ROLE)
// Menggunakan referensi tarif resmi PMK Nomor 32 Tahun 2025 (SBM 2026)
// =====================================================================
const simState = {
  initialized: false,
  provId: 16,          // Default: JAWA TIMUR
  cityId: 'sby_kota',  // Default: Kota Surabaya
  wasDkiLocal: false,
  lastJenis: 'biasa'
};

function getSimHotelPagu(sbm, gol) {
  if (!sbm) return 0;
  if (gol === 'I') return sbm.h1 || 0;
  if (gol === 'II') return sbm.h2 || 0;
  if (String(gol || '').startsWith('IV')) return sbm.h4 || 0;
  return sbm.h3 || 0;
}

function formatSimNumber(val) {
  const num = typeof parseNumber === 'function' ? parseNumber(val) : (Number(val) || 0);
  return num > 0 ? num.toLocaleString('id-ID') : '';
}

function resolveSimDestination(provId, cityIdOrObj) {
  const list = Array.isArray(sbmData) ? sbmData : [];
  const sbm = list.find(x => String(x.id) === String(provId)) || list.find(x => x.id === 16) || list[0] || null;
  let cityObj = null;
  if (cityIdOrObj && typeof cityIdOrObj === 'object') {
    cityObj = cityIdOrObj;
  } else if (typeof cityIdOrObj === 'string' && cityIdOrObj !== 'all' && cityIdOrObj !== 'ibukota' && typeof daftarKotaSbm !== 'undefined') {
    cityObj = daftarKotaSbm.find(x => x.id === cityIdOrObj) || null;
  }
  return { sbm, cityObj };
}

function initSimulasiKalkulator() {
  const selProv = document.getElementById('simSelectProv');
  if (!selProv || !Array.isArray(sbmData)) return;

  populateSbmProvinceSelect(selProv, simState.provId || 16);

  if (!simState.initialized) {
    simState.initialized = true;
    selProv.value = simState.provId || 16;
    populateSbmCitySelect(document.getElementById('simSelectCity'), selProv.value, simState.cityId || 'sby_kota');
    onSimProvChange(selProv.value, simState.cityId || 'sby_kota');
    return;
  }

  onSimParamChange();
}

function onSimProvChange(provId, cityIdOrObj = null) {
  if (!Array.isArray(sbmData)) return;
  const { sbm } = resolveSimDestination(provId, null);
  if (!sbm) return;

  const selProv = document.getElementById('simSelectProv');
  if (selProv && String(selProv.value) !== String(sbm.id)) {
    selProv.value = sbm.id;
  }
  simState.provId = sbm.id;

  let cityObj = null;
  if (cityIdOrObj && typeof cityIdOrObj === 'object') {
    cityObj = cityIdOrObj;
  } else if (typeof cityIdOrObj === 'string' && cityIdOrObj !== 'all' && typeof daftarKotaSbm !== 'undefined') {
    cityObj = daftarKotaSbm.find(x => x.id === cityIdOrObj && String(x.provId) === String(sbm.id)) || null;
  }

  simState.cityId = cityObj ? cityObj.id : 'all';

  const selCity = document.getElementById('simSelectCity');
  if (selCity) {
    if (selCity.dataset.provId !== String(sbm.id) || selCity.options.length === 0) {
      populateSbmCitySelect(selCity, sbm.id, simState.cityId);
    } else {
      selCity.value = simState.cityId;
    }
  }

  syncSimDestinationRules(sbm, cityObj);
  onSimParamChange();
}

function onSimCityChange(cityId) {
  if (!cityId || cityId === 'all' || cityId === 'ibukota') {
    simState.cityId = cityId || 'all';
    const selProv = document.getElementById('simSelectProv');
    const provId = selProv ? selProv.value : simState.provId;
    const { sbm } = resolveSimDestination(provId, null);
    syncSimDestinationRules(sbm, null);
    onSimParamChange();
    return;
  }
  const city = (typeof daftarKotaSbm !== 'undefined') ? daftarKotaSbm.find(x => x.id === cityId) : null;
  if (city) {
    onSimProvChange(city.provId, city);
  }
}

function syncSimDestinationRules(sbm, cityObj) {
  if (!sbm) return;
  const isDki = sbm.provinsi === 'DKI JAKARTA';
  const isKepSeribu = !!(cityObj && (cityObj.id === 'kep_seribu' || /seribu/i.test(cityObj.nama)));
  const isDkiLocal = isDki && !isKepSeribu;
  const isBodetabek = !!(cityObj && cityObj.isBodetabek);
  const formatRp = typeof rp === 'function' ? rp : (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const safeEsc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s || '');

  // Auto-sesuaikan jenis kegiatan saat masuk/keluar DKI Dalam Kota
  const jenisEl = document.getElementById('simJenisKegiatan');
  const cbHotel = document.getElementById('simCbHotel');
  const malamEl = document.getElementById('simMalam');
  const btnMinusMalam = document.getElementById('btnSimMalamMinus');
  const btnPlusMalam = document.getElementById('btnSimMalamPlus');
  const malamHelper = document.getElementById('simMalamHelper');
  const hotelBox = document.getElementById('simHotelBox');
  const hotelCapPill = document.getElementById('simHotelCapPill');
  const hotelManualEl = document.getElementById('simHotelManual');
  const transportManualEl = document.getElementById('simTransportManual');
  const lokalManualEl = document.getElementById('simLokalManual');

  if (jenisEl && !['biasa', 'rapat', 'diklat', 'fullboard'].includes(jenisEl.value)) {
    jenisEl.value = 'biasa';
  }
  simState.wasDkiLocal = isDkiLocal;

  // Aturan Khusus DKI Jakarta: Tanpa biaya penginapan / hotel (Hotel = Rp 0, malam = 0)
  if (isDkiLocal) {
    const hariEl = document.getElementById('simHari');
    if (hariEl) {
      hariEl.value = 1;
    }
    if (cbHotel) {
      cbHotel.checked = false;
      cbHotel.disabled = true;
    }
    if (malamEl) {
      malamEl.value = 0;
      malamEl.disabled = true;
      malamEl.setAttribute('max', '0');
    }
    if (btnMinusMalam) btnMinusMalam.disabled = true;
    if (btnPlusMalam) btnPlusMalam.disabled = true;
    if (malamHelper) malamHelper.textContent = '(0 hari 0 malam)';
    if (hotelBox) hotelBox.style.display = 'none';
    if (hotelCapPill) hotelCapPill.textContent = 'DKI: 0 Hari 0 Malam (Rp 0)';
  } else {
    if (cbHotel) {
      cbHotel.disabled = false;
      const curMalam = parseInt(malamEl?.value, 10) || 0;
      if (curMalam > 0) cbHotel.checked = true;
    }
    if (malamEl) {
      malamEl.disabled = false;
      malamEl.setAttribute('max', '30');
    }
    if (btnMinusMalam) btnMinusMalam.disabled = false;
    if (btnPlusMalam) btnPlusMalam.disabled = false;
    if (malamHelper) malamHelper.textContent = '(Hari − 1)';
  }

  // Reset prefill manual jika destinasi berganti agar tetap sinkron saat user memilih mode manual nanti
  if (hotelManualEl && document.getElementById('simHotelMode')?.value !== 'manual') hotelManualEl.value = '';
  if (transportManualEl && document.getElementById('simTransportMode')?.value !== 'manual') transportManualEl.value = '';
  if (lokalManualEl && document.getElementById('simLokalMode')?.value !== 'manual') lokalManualEl.value = '';

  // Render notice tujuan (Modern Pagu Strip)
  const noticeEl = document.getElementById('simLocationNotice');
  if (noticeEl) {
    if (isKepSeribu) {
      noticeEl.innerHTML = `
        <div class="sim-pagu-strip sim-pagu-strip-blue">
          <div class="sim-pagu-strip-head">
            <span class="sim-pagu-tag">⛴️ Plafon Pagu SBM — KEPULAUAN SERIBU</span>
            <span class="sim-pagu-pill-badge">PMK 32/2025</span>
          </div>
          <div class="sim-pagu-metrics">
            <div class="sim-pagu-item"><span>UH Khusus:</span> <strong>Rp 210.000 / hari</strong></div>
            <div class="sim-pagu-item"><span>Kapal Laut PP:</span> <strong>Rp 772.000</strong></div>
            <div class="sim-pagu-item"><span>Transport Lokal:</span> <strong>Termasuk PP</strong></div>
          </div>
        </div>
      `;
    } else if (isBodetabek && cityObj.transportPP) {
      noticeEl.innerHTML = `
        <div class="sim-pagu-strip sim-pagu-strip-yellow">
          <div class="sim-pagu-strip-head">
            <span class="sim-pagu-tag">🚗 Plafon Wilayah Bodetabek — ${safeEsc(cityObj.nama)}</span>
            <span class="sim-pagu-pill-badge">PMK 32/2025</span>
          </div>
          <div class="sim-pagu-metrics">
            <div class="sim-pagu-item"><span>UH Penuh:</span> <strong>${formatRp(sbm.uh || 0)} / hari</strong></div>
            <div class="sim-pagu-item"><span>Transport Darat PP:</span> <strong>${formatRp(cityObj.transportPP)}</strong></div>
            <div class="sim-pagu-item"><span>Taksi:</span> <strong>Termasuk PP</strong></div>
          </div>
        </div>
      `;
    } else if (isDkiLocal) {
      noticeEl.innerHTML = `
        <div class="sim-pagu-strip sim-pagu-strip-dki">
          <div class="sim-pagu-strip-head">
            <span class="sim-pagu-tag">🏛️ Ketentuan Khusus Penugasan DKI Jakarta</span>
            <span class="sim-pagu-pill-badge">PMK 32/2025</span>
          </div>
          <div class="sim-pagu-metrics">
            <div class="sim-pagu-item"><span>Uang Harian:</span> <strong>Rp 0 (Tanpa Uang Harian)</strong></div>
            <div class="sim-pagu-item"><span>Penginapan:</span> <strong>Rp 0 (0 Hari 0 Malam)</strong></div>
            <div class="sim-pagu-item"><span>Total Biaya Penugasan:</span> <strong>Flat Rp 170.000 (DPR)</strong></div>
          </div>
        </div>
      `;
    } else {
      noticeEl.innerHTML = `
        <div class="sim-pagu-strip sim-pagu-strip-green">
          <div class="sim-pagu-strip-head">
            <span class="sim-pagu-tag">✈️ Plafon Acuan Resmi SBM — ${safeEsc(sbm.provinsi)}</span>
            <span class="sim-pagu-pill-badge">PMK 32/2025</span>
          </div>
          <div class="sim-pagu-metrics">
            <div class="sim-pagu-item"><span>UH Penuh:</span> <strong>${formatRp(sbm.uh || 0)} / hari</strong></div>
            <div class="sim-pagu-item"><span>Tiket Pesawat PP:</span> <strong>${sbm.tiket ? formatRp(sbm.tiket) : 'Jalur Darat'}</strong></div>
            <div class="sim-pagu-item"><span>Taksi &amp; Bandara PP:</span> <strong>${formatRp((sbm.jktPP || 0) + (sbm.taxi || 0))}</strong></div>
          </div>
        </div>
      `;
    }
  }

  // Sync active chip
  document.querySelectorAll('.sim-chip-btn').forEach(btn => {
    const targetChip = btn.getAttribute('data-sim-chip');
    const isMatch = cityObj ? targetChip === cityObj.id : (isDkiLocal && targetChip === 'all');
    btn.classList.toggle('active', !!isMatch);
  });
}

function quickSelectSimCity(cityId) {
  if (cityId === 'all' || cityId === 'jkt_pusat' || cityId === 'jkt_dki') {
    onSimProvChange(13, 'all');
    return;
  }
  const city = (typeof daftarKotaSbm !== 'undefined') ? daftarKotaSbm.find(x => x.id === cityId) : null;
  if (!city) return;
  onSimProvChange(city.provId, city);
}

function onSimSearchInput(keyword) {
  const q = String(keyword || '').trim().toLowerCase();
  const resBox = document.getElementById('simSearchResults');
  const clearBtn = document.getElementById('btnSimSearchClear');
  if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

  if (!resBox) return;
  if (!q) {
    resBox.style.display = 'none';
    resBox.innerHTML = '';
    return;
  }

  resBox.innerHTML = buildSbmSearchResultsHtml(keyword, 'selectSimCityFromSearch', 'selectSimProvFromSearch');
  resBox.style.display = 'block';
}

function selectSimCityFromSearch(cityId) {
  const city = (typeof daftarKotaSbm !== 'undefined') ? daftarKotaSbm.find(x => x.id === cityId) : null;
  if (!city) return;
  onSimProvChange(city.provId, city);
  clearSimSearch();
}

function selectSimProvFromSearch(provId) {
  onSimProvChange(provId, null);
  clearSimSearch();
}

function clearSimSearch() {
  const input = document.getElementById('simSearchInput');
  const resBox = document.getElementById('simSearchResults');
  const clearBtn = document.getElementById('btnSimSearchClear');
  if (input) input.value = '';
  if (resBox) {
    resBox.style.display = 'none';
    resBox.innerHTML = '';
  }
  if (clearBtn) clearBtn.style.display = 'none';
}

let simLimitAlertTimer = null;

function showSimLimitAlert(message) {
  const alertEl = document.getElementById('simLimitAlert');
  const textEl = document.getElementById('simLimitAlertText');
  if (textEl) textEl.textContent = message;
  if (alertEl) {
    alertEl.style.display = 'flex';
  }
  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Batas Plafon SBM Diterapkan', message);
  }
  if (simLimitAlertTimer) clearTimeout(simLimitAlertTimer);
  simLimitAlertTimer = setTimeout(() => {
    closeSimLimitAlert();
  }, 7500);
}

function closeSimLimitAlert() {
  const alertEl = document.getElementById('simLimitAlert');
  if (alertEl) alertEl.style.display = 'none';
  if (simLimitAlertTimer) {
    clearTimeout(simLimitAlertTimer);
    simLimitAlertTimer = null;
  }
}

function getSimInputLimit(inputId) {
  const { sbm, cityObj } = resolveSimDestination(simState.provId, simState.cityId);
  if (!sbm) return null;
  const isDki = sbm.provinsi === 'DKI JAKARTA';
  const isKepSeribu = !!(cityObj && (cityObj.id === 'kep_seribu' || /seribu/i.test(cityObj.nama)));
  const isDkiLocal = isDki && !isKepSeribu;
  const isBodetabek = !!(cityObj && cityObj.isBodetabek);
  const golongan = document.getElementById('simGolongan')?.value || 'III';
  const formatRp = typeof rp === 'function' ? rp : (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  if (inputId === 'simHari') {
    return { max: 30, min: 1, label: 'Lama Tugas', unit: 'Hari', desc: 'Maksimal durasi penugasan perjalanan dinas adalah 30 hari sesuai ketentuan.' };
  }
  if (inputId === 'simMalam') {
    const hariVal = parseInt(document.getElementById('simHari')?.value, 10) || 1;
    const maxMalam = isDkiLocal ? 0 : Math.max(0, hariVal);
    return {
      max: maxMalam,
      min: 0,
      label: 'Malam Hotel',
      unit: 'Malam',
      desc: isDkiLocal
        ? 'DKI Jakarta tidak menganggarkan biaya penginapan / hotel (0 malam).'
        : `Malam menginap tidak boleh melebihi jumlah hari tugas (${hariVal} hari).`
    };
  }
  if (inputId === 'simHotelManual') {
    const pagu = isDkiLocal ? 0 : getSimHotelPagu(sbm, golongan);
    return {
      max: pagu,
      min: 0,
      label: `Tarif Hotel (Gol. ${golongan})`,
      unit: 'Rp',
      desc: isDkiLocal
        ? 'DKI Jakarta tidak menganggarkan biaya penginapan / hotel (Rp 0).'
        : `Plafon maksimal tarif hotel Gol. ${golongan} untuk ${sbm.provinsi} adalah ${formatRp(pagu)}/malam.`
    };
  }
  if (inputId === 'simTransportManual') {
    const transArah = document.getElementById('simTransportArah')?.value || 'pp';
    const arahFactor = (transArah === 'berangkat' || transArah === 'pulang') ? 0.5 : 1.0;
    let baseCap = 0;
    if (isDkiLocal) {
      baseCap = 170000;
    } else if (isKepSeribu) {
      baseCap = 772000;
    } else if (isBodetabek && cityObj?.transportPP) {
      baseCap = cityObj.transportPP;
    } else {
      const tiket = sbm.tiket || 0;
      const taksi = (sbm.jktPP || 0) + (sbm.taxi || 0);
      baseCap = (tiket > 0 ? tiket : 1000000) + taksi;
    }
    const maxVal = Math.round(baseCap * arahFactor);
    const arahLabel = transArah === 'pp' ? 'PP' : (transArah === 'berangkat' ? 'Berangkat' : 'Pulang');
    return {
      max: maxVal,
      min: 0,
      label: `Transportasi (${arahLabel})`,
      unit: 'Rp',
      desc: `Plafon maksimal transport SBM rute ini (${arahLabel}) adalah ${formatRp(maxVal)}.`
    };
  }
  if (inputId === 'simLokalManual') {
    const lokalSbmCap = isDkiLocal ? 170000 : ((isKepSeribu || isBodetabek) ? 0 : ((sbm.jktPP || 0) + (sbm.taxi || 0)));
    const maxVal = lokalSbmCap > 0 ? lokalSbmCap : 1000000;
    return {
      max: maxVal,
      min: 0,
      label: 'Transport Lokal / Taksi',
      unit: 'Rp',
      desc: `Plafon maksimal transport lokal/taksi untuk destinasi ini adalah ${formatRp(maxVal)}.`
    };
  }
  return null;
}

function adjustSimStepper(inputId, delta) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const limit = getSimInputLimit(inputId);
  const min = limit ? limit.min : (parseInt(el.getAttribute('min'), 10) || 0);
  const max = limit ? limit.max : (parseInt(el.getAttribute('max'), 10) || 30);
  const current = parseInt(el.value, 10);
  const baseVal = isNaN(current) ? (isNaN(min) ? 0 : min) : current;
  let next = baseVal + delta;
  if (!isNaN(min)) next = Math.max(min, next);
  if (!isNaN(max)) {
    if (next > max) {
      next = max;
      if (limit) showSimLimitAlert(`Batas maksimal ${limit.label} adalah ${limit.max} ${limit.unit}. ${limit.desc}`);
    }
  }
  el.value = next;

  if (inputId === 'simHari') {
    onSimHariChange();
  } else if (inputId === 'simMalam') {
    onSimMalamChange();
  } else {
    onSimParamChange();
  }
}

function onSimHariChange() {
  const hariEl = document.getElementById('simHari');
  const malamEl = document.getElementById('simMalam');
  const cbHotel = document.getElementById('simCbHotel');
  let hari = parseInt(hariEl?.value, 10);
  const limitHari = getSimInputLimit('simHari');
  if (isNaN(hari) || hari < 1) hari = 1;
  if (limitHari && hari > limitHari.max) {
    hari = limitHari.max;
    showSimLimitAlert(`Maksimal durasi penugasan perjalanan dinas adalah ${limitHari.max} hari.`);
  }
  if (hariEl && String(hariEl.value) !== String(hari)) hariEl.value = hari;

  const { sbm, cityObj } = resolveSimDestination(simState.provId, simState.cityId);
  const isDkiLocal = sbm && sbm.provinsi === 'DKI JAKARTA' && !(cityObj && (cityObj.id === 'kep_seribu' || /seribu/i.test(cityObj.nama)));

  if (isDkiLocal) {
    if (malamEl) {
      malamEl.value = 0;
      malamEl.disabled = true;
    }
    if (cbHotel) {
      cbHotel.checked = false;
      cbHotel.disabled = true;
    }
  } else {
    const nextMalam = Math.max(0, hari - 1);
    if (malamEl) {
      malamEl.value = nextMalam;
      malamEl.disabled = false;
    }
    if (cbHotel) {
      cbHotel.disabled = false;
      cbHotel.checked = nextMalam > 0;
    }
  }
  onSimParamChange();
}

function onSimMalamChange() {
  const malamEl = document.getElementById('simMalam');
  if (!malamEl) return;
  const { sbm, cityObj } = resolveSimDestination(simState.provId, simState.cityId);
  const isDkiLocal = sbm && sbm.provinsi === 'DKI JAKARTA' && !(cityObj && (cityObj.id === 'kep_seribu' || /seribu/i.test(cityObj.nama)));

  if (isDkiLocal) {
    malamEl.value = 0;
    malamEl.disabled = true;
    showSimLimitAlert('Penugasan dalam kota DKI Jakarta tidak menganggarkan biaya penginapan/hotel (0 malam).');
    onSimParamChange();
    return;
  }

  let val = parseInt(malamEl.value, 10);
  if (isNaN(val) || val < 0) val = 0;
  const limitMalam = getSimInputLimit('simMalam');
  if (limitMalam && val > limitMalam.max) {
    val = limitMalam.max;
    malamEl.value = val;
    showSimLimitAlert(`Malam hotel disesuaikan ke maksimal ${val} malam (mengikuti durasi hari tugas).`);
  } else {
    malamEl.value = val;
  }

  const cbHotel = document.getElementById('simCbHotel');
  if (cbHotel) {
    cbHotel.checked = val > 0;
  }
  onSimParamChange();
}

function onSimCurrencyInput(el) {
  if (!el) return;
  const raw = typeof parseNumber === 'function' ? parseNumber(el.value) : Number(String(el.value || '').replace(/[^\d]/g, '')) || 0;
  const limit = getSimInputLimit(el.id);
  const formatRp = typeof rp === 'function' ? rp : (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  if (limit && limit.max !== undefined && raw > limit.max) {
    el.value = limit.max > 0 ? limit.max.toLocaleString('id-ID') : '';
    showSimLimitAlert(`Input ${limit.label} tidak boleh melebihi batas SBM: ${formatRp(limit.max)}. ${limit.desc}`);
  } else {
    el.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
  }
  onSimParamChange();
}

function computeSimulasiData() {
  const formatRp = typeof rp === 'function' ? rp : (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const { sbm, cityObj } = resolveSimDestination(simState.provId, simState.cityId);
  if (!sbm) return null;

  const isDki = sbm.provinsi === 'DKI JAKARTA';
  const isKepSeribu = !!(cityObj && (cityObj.id === 'kep_seribu' || /seribu/i.test(cityObj.nama)));
  const isDkiLocal = isDki && !isKepSeribu;
  const isBodetabek = !!(cityObj && cityObj.isBodetabek);

  const hari = Math.max(1, Math.min(30, parseInt(document.getElementById('simHari')?.value, 10) || 1));
  const malam = isDkiLocal ? 0 : Math.max(0, Math.min(hari, parseInt(document.getElementById('simMalam')?.value, 10) || 0));
  const peserta = 1; // Khusus perorangan (1 Pegawai)
  const golongan = document.getElementById('simGolongan')?.value || 'III';
  const jenis = document.getElementById('simJenisKegiatan')?.value || 'biasa';

  const destLabel = cityObj
    ? (isDki ? `DKI JAKARTA — ${cityObj.nama}` : `${cityObj.nama} (${sbm.provinsi})`)
    : sbm.provinsi;

  // ATURAN KHUSUS DKI JAKARTA:
  // Seluruh kegiatan di wilayah DKI Jakarta (kecuali Kep. Seribu):
  // 1. Tidak ada uang harian sama sekali (mau > 8 jam pun tetap Rp 0)
  // 2. Tidak ada biaya penginapan / hotel (Rp 0)
  // 3. Flat seluruh kegiatan hanya memperoleh Rp 170.000 (DPR Transport Lokal)
  if (isDkiLocal) {
    return {
      sbm,
      cityObj,
      destLabel,
      isDki: true,
      isDkiLocal: true,
      isKepSeribu: false,
      isBodetabek: false,
      hari: 1,
      malam: 0,
      peserta: 1,
      golongan,
      jenis,
      cbUh: false,
      uhRate: 0,
      effectivePct: 0,
      uhLabel: 'Uang Harian DKI (Tanpa Uang Harian)',
      uhGrossPerPerson: 0,
      cbKonsumsi: false,
      makanKali: 0,
      snackKali: 0,
      konsumsiPerDay: 0,
      konsumsiDeductPerPerson: 0,
      uhNetPerPerson: 0,
      uhTotal: 0,
      cbHotel: false,
      hotelMode: 'sbm',
      hotelModeLabel: 'DKI: Tanpa Penginapan (0 Hari 0 Malam)',
      hotelPaguRate: 0,
      hotelRateUsed: 0,
      kamarCount: 1,
      hotelTotal: 0,
      hotelSbmCapTotal: 0,
      hotelExceed: 0,
      cbTransport: true,
      transportArah: 'pp',
      transportMode: 'sbm',
      transportLabel: 'DPR Transport Lokal DKI Jakarta (Flat)',
      transportSub: 'Biaya flat seluruh penugasan dalam kota DKI Jakarta (PMK 32/2025)',
      transportSbmCapRate: 170000,
      transportPerPerson: 170000,
      transportTotal: 170000,
      transportExceed: 0,
      cbLokal: false,
      lokalMode: 'sbm',
      lokalLabel: 'Transport Lokal',
      lokalSbmAutoPerPerson: 0,
      lokalPerPerson: 0,
      lokalTotal: 0,
      lokalExceed: 0,
      cbRep: false,
      repRate: 0,
      repTotal: 0,
      biayaLainPerPerson: 0,
      biayaLainTotal: 0,
      transCombinedTotal: 170000,
      lainCombinedTotal: 0,
      grandTotal: 170000,
      avgPerPerson: 170000,
      sbmCapTotal: 170000,
      exceedTotal: 0,
      formatRp
    };
  }

  // 1. Uang Harian & Potongan Konsumsi
  const cbUh = !!document.getElementById('simCbUh')?.checked;
  let uhPercent = parseFloat(document.getElementById('simUhPercent')?.value ?? '1');
  if (isNaN(uhPercent) || (uhPercent !== 0.6 && uhPercent !== 1)) uhPercent = 1;

  let uhRate = 0;
  let effectivePct = 1;
  let uhLabel = 'Uang Harian';

  if (jenis === 'diklat') {
    uhRate = sbm.diklat || 110000;
    effectivePct = 1;
    uhLabel = 'Uang Harian Diklat';
  } else if (jenis === 'fullboard') {
    uhRate = sbm.fullboard || 130000;
    effectivePct = 1;
    uhLabel = 'Uang Harian Fullboard';
  } else if (isDkiLocal) {
    uhRate = 210000;
    effectivePct = uhPercent;
    uhLabel = effectivePct === 0.6 ? 'Uang Harian DKI (60% Kendaraan Dinas)' : 'Uang Harian DKI (> 8 Jam)';
  } else if (isKepSeribu) {
    uhRate = 210000;
    effectivePct = uhPercent;
    uhLabel = effectivePct === 0.6 ? 'Uang Harian Kep. Seribu (60% Kendaraan Dinas)' : 'Uang Harian Kep. Seribu';
  } else if (jenis === 'rapat') {
    uhRate = sbm.uh || 0;
    effectivePct = uhPercent;
    uhLabel = effectivePct === 0.6 ? 'Uang Harian Rapat (60% Kendaraan Dinas)' : 'Uang Harian Rapat';
  } else {
    // biasa
    uhRate = sbm.uh || 0;
    effectivePct = uhPercent;
    uhLabel = effectivePct === 0.6 ? 'Uang Harian (60% Kendaraan Dinas)' : 'Uang Harian Penuh';
  }

  const uhGrossPerPerson = (cbUh && uhRate > 0)
    ? Math.round(uhRate * hari * effectivePct)
    : 0;

  // Konsumsi: Jika Rapat, otomatis selalu dipotong 1x makan dan 1x snack per hari
  const isRapat = (jenis === 'rapat');
  const cbKonsumsi = isRapat ? true : (jenis === 'diklat' || jenis === 'fullboard' ? false : !!document.getElementById('simCbKonsumsi')?.checked);
  const rawMakan = parseInt(document.getElementById('simMakanKali')?.value, 10);
  const rawSnack = parseInt(document.getElementById('simSnackKali')?.value, 10);
  const makanKali = isRapat
    ? (isNaN(rawMakan) || rawMakan < 1 ? 1 : Math.min(5, rawMakan))
    : Math.max(0, Math.min(5, isNaN(rawMakan) ? 1 : rawMakan));
  const snackKali = isRapat
    ? (isNaN(rawSnack) || rawSnack < 1 ? 1 : Math.min(5, rawSnack))
    : Math.max(0, Math.min(5, isNaN(rawSnack) ? 0 : rawSnack));
  const makanRate = sbm.makan || 0;
  const snackRate = sbm.snack || 0;
  const konsumsiPerDay = (makanRate * makanKali) + (snackRate * snackKali);
  const rawKonsumsiPerPerson = (cbUh && cbKonsumsi && uhGrossPerPerson > 0) ? konsumsiPerDay * hari : 0;
  const konsumsiDeductPerPerson = Math.min(uhGrossPerPerson, rawKonsumsiPerPerson);
  const uhNetPerPerson = Math.max(0, uhGrossPerPerson - konsumsiDeductPerPerson);
  const uhTotal = uhNetPerPerson;

  // 2. Penginapan / Hotel (DKI Jakarta Tanpa Penginapan = Rp 0)
  const hotelPaguRate = isDkiLocal ? 0 : getSimHotelPagu(sbm, golongan);
  const cbHotel = isDkiLocal ? false : !!document.getElementById('simCbHotel')?.checked;
  const hotelMode = document.getElementById('simHotelMode')?.value || 'sbm';
  const kamarCount = 1;

  let hotelRateUsed = 0;
  let hotelModeLabel = isDkiLocal ? 'DKI: Tanpa Penginapan (Rp 0)' : 'Sesuai Pagu SBM';
  if (!isDkiLocal && cbHotel && malam > 0) {
    if (hotelMode === 'atcost_30') {
      hotelRateUsed = Math.round(hotelPaguRate * 0.3);
      hotelModeLabel = '30% Tanpa Bukti Hotel';
    } else if (hotelMode === 'manual') {
      const manualVal = typeof parseNumber === 'function' ? parseNumber(document.getElementById('simHotelManual')?.value) : 0;
      hotelRateUsed = Math.min(hotelPaguRate, manualVal);
      hotelModeLabel = 'Tarif Riil Hotel';
    } else {
      hotelRateUsed = hotelPaguRate;
      hotelModeLabel = `Pagu SBM Gol. ${golongan}`;
    }
  }
  const hotelTotal = (!isDkiLocal && cbHotel && malam > 0) ? hotelRateUsed * malam : 0;
  const hotelSbmCapTotal = (!isDkiLocal && cbHotel && malam > 0) ? hotelPaguRate * malam : 0;
  const hotelExceed = Math.max(0, hotelTotal - hotelSbmCapTotal);

  // 3. TRANSPORTASI (BERANGKAT & PULANG) TUNGGAL & TERKONSOLIDASI
  const cbTransport = !!document.getElementById('simCbTransport')?.checked;
  const transportArah = document.getElementById('simTransportArah')?.value || 'pp';
  const transportMode = document.getElementById('simTransportMode')?.value || 'sbm';
  const arahFactor = (transportArah === 'berangkat' || transportArah === 'pulang') ? 0.5 : 1.0;
  const arahShort = transportArah === 'berangkat' ? 'Berangkat' : (transportArah === 'pulang' ? 'Pulang' : 'PP');

  let transportTotal = 0;
  let transportLabel = 'Transportasi';
  let transportSub = '';
  let transportSbmCapRate = 0;

  if (isDkiLocal) {
    transportSbmCapRate = 170000;
    transportTotal = cbTransport ? 170000 : 0;
    transportLabel = 'Transportasi Dalam Kota DKI (DPR Flat)';
    transportSub = cbTransport ? 'DPR Transport Lokal DKI Jakarta' : 'Dinonaktifkan dalam simulasi';
  } else if (isKepSeribu) {
    const fullCap = 772000;
    transportSbmCapRate = Math.round(fullCap * arahFactor);
    if (cbTransport) {
      if (transportMode === 'manual') {
        const manualTrans = typeof parseNumber === 'function' ? parseNumber(document.getElementById('simTransportManual')?.value) : 0;
        transportTotal = Math.min(transportSbmCapRate, manualTrans);
      } else {
        transportTotal = transportSbmCapRate;
      }
    }
    transportLabel = `Tiket Kapal Laut Kep. Seribu (${arahShort})`;
    transportSub = cbTransport ? `${formatRp(transportTotal)} (${arahShort})` : 'Dinonaktifkan dalam simulasi';
  } else if (isBodetabek && cityObj?.transportPP) {
    const fullCap = cityObj.transportPP;
    transportSbmCapRate = Math.round(fullCap * arahFactor);
    if (cbTransport) {
      if (transportMode === 'manual') {
        const manualTrans = typeof parseNumber === 'function' ? parseNumber(document.getElementById('simTransportManual')?.value) : 0;
        transportTotal = Math.min(transportSbmCapRate, manualTrans);
      } else {
        transportTotal = transportSbmCapRate;
      }
    }
    transportLabel = `Transportasi Darat ${cityObj.nama} (${arahShort})`;
    transportSub = cbTransport ? `${formatRp(transportTotal)} (${arahShort})` : 'Dinonaktifkan dalam simulasi';
  } else {
    // Luar kota reguler: Satukan Tiket Pesawat + Taksi Bandara / Lokal
    const tiketSbm = sbm.tiket || 0;
    const taksiSbm = (sbm.jktPP || 0) + (sbm.taxi || 0);
    const tiketRate = Math.round(tiketSbm * arahFactor);
    const taksiRate = Math.round(taksiSbm * arahFactor);
    const fullCap = Math.round(((tiketSbm > 0 ? tiketSbm : 1000000) + taksiSbm) * arahFactor);
    transportSbmCapRate = fullCap;

    if (cbTransport) {
      if (transportMode === 'tiket_only') {
        transportTotal = tiketRate;
        transportLabel = `Tiket Antarkota (${arahShort})`;
        transportSub = `${formatRp(transportTotal)} (${arahShort}, tanpa taksi)`;
      } else if (transportMode === 'taksi_only') {
        transportTotal = taksiRate;
        transportLabel = `Taksi Bandara & Lokal (${arahShort})`;
        transportSub = `${formatRp(transportTotal)} (${arahShort}, tanpa tiket pesawat)`;
      } else if (transportMode === 'manual') {
        const manualTrans = typeof parseNumber === 'function' ? parseNumber(document.getElementById('simTransportManual')?.value) : 0;
        transportTotal = Math.min(transportSbmCapRate, manualTrans);
        transportLabel = `Transportasi Riil (${arahShort})`;
        transportSub = `${formatRp(transportTotal)} (Riil disesuaikan batas SBM)`;
      } else {
        // Mode Otomatis SBM (Tiket + Taksi)
        transportTotal = Math.round(((tiketSbm > 0 ? tiketSbm : 0) + taksiSbm) * arahFactor);
        transportLabel = tiketSbm > 0
          ? `Transportasi (Tiket & Taksi SBM — ${arahShort})`
          : `Transportasi (Darat & Taksi SBM — ${arahShort})`;
        transportSub = tiketSbm > 0
          ? `Tiket ${formatRp(tiketRate)} + Taksi ${formatRp(taksiRate)} (${arahShort})`
          : `Transport Darat & Taksi Resmi SBM (${arahShort})`;
      }
    } else {
      transportLabel = `Transportasi (${arahShort})`;
      transportSub = 'Dinonaktifkan dalam simulasi';
    }
  }

  const transportExceed = 0;
  const transCombinedTotal = transportTotal;
  const lokalTotal = 0; // Legacy backwards-compatibility

  // 4. SECTION 4: UANG REPRESENTASI PEJABAT (OPSIONAL)
  const cbRep = !!document.getElementById('simCbRep')?.checked;
  const repRate = cbRep ? (isDki ? 75000 : 150000) : 0;
  const repTotal = repRate * hari;

  const lainCombinedTotal = repTotal;
  const grandTotal = uhTotal + hotelTotal + transCombinedTotal + repTotal;
  const avgPerPerson = grandTotal;
  const exceedTotal = hotelExceed + transportExceed;
  const sbmCapTotal = uhTotal + hotelSbmCapTotal + transportSbmCapRate + repTotal;

  return {
    sbm,
    cityObj,
    destLabel,
    isDki,
    isDkiLocal,
    isKepSeribu,
    isBodetabek,
    hari,
    malam,
    peserta: 1,
    golongan,
    jenis,
    cbUh,
    uhRate,
    effectivePct,
    uhLabel,
    uhGrossPerPerson,
    cbKonsumsi,
    makanKali,
    snackKali,
    konsumsiPerDay,
    konsumsiDeductPerPerson,
    uhNetPerPerson,
    uhTotal,
    cbHotel,
    hotelMode,
    hotelModeLabel,
    hotelPaguRate,
    hotelRateUsed,
    kamarCount: 1,
    hotelTotal,
    hotelSbmCapTotal,
    hotelExceed,
    cbTransport,
    transportArah,
    transportMode,
    transportLabel,
    transportSub,
    transportSbmCapRate,
    transportPerPerson: transportTotal,
    transportTotal,
    transportExceed,
    cbLokal: false,
    lokalMode: 'sbm',
    lokalLabel: 'Transport Lokal',
    lokalSbmAutoPerPerson: 0,
    lokalPerPerson: 0,
    lokalTotal: 0,
    lokalExceed: 0,
    cbRep,
    repRate,
    repTotal,
    transCombinedTotal,
    lainCombinedTotal,
    grandTotal,
    avgPerPerson,
    sbmCapTotal,
    exceedTotal,
    formatRp
  };
}

function onSimParamChange() {
  const { sbm, cityObj } = resolveSimDestination(simState.provId, simState.cityId);
  if (!sbm) return;

  const isDki = sbm.provinsi === 'DKI JAKARTA';
  const isKepSeribu = !!(cityObj && (cityObj.id === 'kep_seribu' || /seribu/i.test(cityObj.nama)));
  const isDkiLocal = isDki && !isKepSeribu;
  const isBodetabek = !!(cityObj && cityObj.isBodetabek);
  const formatRp = typeof rp === 'function' ? rp : (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  // Toggle visibility & helper hints
  const jenis = document.getElementById('simJenisKegiatan')?.value || 'biasa';
  const uhPctSelect = document.getElementById('simUhPercent');
  if (uhPctSelect) {
    uhPctSelect.disabled = (jenis === 'diklat' || jenis === 'fullboard');
    if (uhPctSelect.disabled) {
      uhPctSelect.value = '1';
    }
  }

  // Konsumsi: Jika Rapat, otomatis langsung aktif dan dipotong 1x makan + 1x snack SBM/hari
  const isRapat = (jenis === 'rapat');
  const cbKonsumsiEl = document.getElementById('simCbKonsumsi');
  const makanKaliEl = document.getElementById('simMakanKali');
  const snackKaliEl = document.getElementById('simSnackKali');
  const konsumsiBox = document.getElementById('simKonsumsiBox');
  const konsumsiHint = document.getElementById('simKonsumsiHint');
  const konsumsiRow = document.querySelector('.sim-sub-toggle-row');
  const konsumsiTitle = document.querySelector('.sim-sub-switch-title');

  if (isRapat) {
    if (cbKonsumsiEl) {
      cbKonsumsiEl.checked = true;
      cbKonsumsiEl.disabled = true;
    }
    if (makanKaliEl && (!makanKaliEl.value || parseInt(makanKaliEl.value, 10) < 1)) makanKaliEl.value = '1';
    if (snackKaliEl && (!snackKaliEl.value || parseInt(snackKaliEl.value, 10) < 1)) snackKaliEl.value = '1';
    if (konsumsiRow) konsumsiRow.style.display = 'block';
    if (konsumsiBox) konsumsiBox.style.display = 'block';
    if (konsumsiTitle) konsumsiTitle.textContent = 'Potong Konsumsi Rapat (1x Makan + 1x Snack SBM Otomatis)';
    if (konsumsiHint) {
      konsumsiHint.innerHTML = `Otomatis dipotong konsumsi rapat SBM: <strong>1x Makan (${formatRp(sbm.makan || 0)})</strong> + <strong>1x Snack (${formatRp(sbm.snack || 0)})</strong> per hari tugas.`;
    }
  } else if (jenis === 'diklat' || jenis === 'fullboard') {
    if (cbKonsumsiEl) {
      cbKonsumsiEl.checked = false;
      cbKonsumsiEl.disabled = true;
    }
    if (konsumsiBox) konsumsiBox.style.display = 'none';
    if (konsumsiRow) konsumsiRow.style.display = 'none';
  } else {
    // Biasa
    if (simState.lastJenis === 'rapat' && cbKonsumsiEl && cbKonsumsiEl.disabled) {
      cbKonsumsiEl.checked = false;
      if (snackKaliEl) snackKaliEl.value = '0';
    }
    if (cbKonsumsiEl) {
      cbKonsumsiEl.disabled = false;
    }
    if (konsumsiTitle) konsumsiTitle.textContent = 'Potong Konsumsi Rapat (Makan & Snack SBM)';
    if (konsumsiRow) konsumsiRow.style.display = 'block';
    if (konsumsiBox) konsumsiBox.style.display = cbKonsumsiEl && cbKonsumsiEl.checked ? 'block' : 'none';
    if (konsumsiHint) {
      konsumsiHint.textContent = 'Potongan mengikuti standar Makan & Snack SBM provinsi tujuan.';
    }
  }
  simState.lastJenis = jenis;

  // Kontrol Uang Harian (DKI Jakarta Tanpa Uang Harian)
  const cbUhEl = document.getElementById('simCbUh');
  const uhPercentWrap = document.getElementById('simUhPercentWrap');
  if (isDkiLocal) {
    if (cbUhEl) {
      cbUhEl.checked = false;
      cbUhEl.disabled = true;
    }
    if (uhPercentWrap) {
      uhPercentWrap.style.display = 'none';
    }
  } else {
    if (cbUhEl) {
      cbUhEl.disabled = false;
    }
    if (uhPercentWrap) {
      uhPercentWrap.style.display = 'block';
    }
  }

  // Kontrol Hotel & Malam
  const cbHotel = document.getElementById('simCbHotel');
  const hotelBox = document.getElementById('simHotelBox');
  const hotelCapPill = document.getElementById('simHotelCapPill');
  const malamEl = document.getElementById('simMalam');
  const btnMinusMalam = document.getElementById('btnSimMalamMinus');
  const btnPlusMalam = document.getElementById('btnSimMalamPlus');
  const malamHelper = document.getElementById('simMalamHelper');

  if (isDkiLocal) {
    if (cbHotel) {
      cbHotel.checked = false;
      cbHotel.disabled = true;
    }
    if (hotelBox) hotelBox.style.display = 'none';
    if (hotelCapPill) hotelCapPill.textContent = 'DKI: Tanpa Penginapan (Rp 0)';
    if (malamEl) {
      malamEl.value = 0;
      malamEl.disabled = true;
    }
    if (btnMinusMalam) btnMinusMalam.disabled = true;
    if (btnPlusMalam) btnPlusMalam.disabled = true;
    if (malamHelper) malamHelper.textContent = '(DKI: 0 mlm)';
  } else {
    if (cbHotel) {
      cbHotel.disabled = false;
    }
    if (hotelBox) hotelBox.style.display = cbHotel && cbHotel.checked ? 'block' : 'none';
    if (malamEl) {
      malamEl.disabled = false;
    }
    if (btnMinusMalam) btnMinusMalam.disabled = false;
    if (btnPlusMalam) btnPlusMalam.disabled = false;
    if (malamHelper) malamHelper.textContent = '(Hari − 1)';
  }

  const golongan = document.getElementById('simGolongan')?.value || 'III';
  const hotelPagu = isDkiLocal ? 0 : getSimHotelPagu(sbm, golongan);
  if (!isDkiLocal && hotelCapPill) {
    hotelCapPill.textContent = `Pagu: ${formatRp(hotelPagu)}/mlm`;
  }

  const hotelMode = document.getElementById('simHotelMode')?.value || 'sbm';
  const hotelManualEl = document.getElementById('simHotelManual');
  const hotelManualWrap = document.getElementById('simHotelManualWrap');
  if (!isDkiLocal && hotelMode === 'manual' && hotelManualEl && !hotelManualEl.value) {
    hotelManualEl.value = formatSimNumber(hotelPagu);
  }
  if (hotelManualWrap) {
    hotelManualWrap.style.display = (!isDkiLocal && cbHotel && cbHotel.checked && hotelMode === 'manual') ? 'block' : 'none';
  }

  // Transport visibility & prefill
  const cbTransport = !!document.getElementById('simCbTransport')?.checked;
  const transportArah = document.getElementById('simTransportArah')?.value || 'pp';
  const transportMode = document.getElementById('simTransportMode')?.value || 'sbm';
  const transportBox = document.getElementById('simTransportBox');
  const transportManualWrap = document.getElementById('simTransportManualWrap');
  const transportManualEl = document.getElementById('simTransportManual');
  if (transportBox) transportBox.style.display = cbTransport ? 'block' : 'none';
  if (transportManualWrap) transportManualWrap.style.display = (cbTransport && transportMode === 'manual') ? 'block' : 'none';

  const arahFactor = (transportArah === 'berangkat' || transportArah === 'pulang') ? 0.5 : 1.0;
  let transSbmCap = 0;
  if (isDkiLocal) {
    transSbmCap = 170000;
  } else if (isKepSeribu) {
    transSbmCap = Math.round(772000 * arahFactor);
  } else if (isBodetabek && cityObj?.transportPP) {
    transSbmCap = Math.round(cityObj.transportPP * arahFactor);
  } else {
    const tiket = sbm.tiket || 0;
    const taksi = (sbm.jktPP || 0) + (sbm.taxi || 0);
    transSbmCap = Math.round(((tiket > 0 ? tiket : 1000000) + taksi) * arahFactor);
  }

  if (transportMode === 'manual' && transportManualEl && !transportManualEl.value && transSbmCap > 0) {
    transportManualEl.value = formatSimNumber(transSbmCap);
  }
  const transCapPill = document.getElementById('simTransportCapPill');
  if (transCapPill) {
    if (isDkiLocal) {
      transCapPill.textContent = 'DPR: Rp 170.000 (Flat)';
    } else {
      const arahTag = transportArah === 'pp' ? 'PP' : '1 Jalan';
      transCapPill.textContent = `SBM: ${formatRp(transSbmCap)} (${arahTag})`;
    }
  }

  // Section 4: Representasi Cap Pill
  const repCapPill = document.getElementById('simRepCapPill');
  if (repCapPill) {
    repCapPill.textContent = isDki ? 'Pagu: Rp 75.000/hari' : 'Pagu: Rp 150.000/hari';
  }

  const data = computeSimulasiData();
  if (!data) return;

  // Update konsumsi hint with exact calculated numbers
  const konsumsiHintEl = document.getElementById('simKonsumsiHint');
  if (konsumsiHintEl) {
    if (!data.cbUh || data.uhGrossPerPerson === 0) {
      konsumsiHintEl.textContent = 'Tidak ada potongan konsumsi karena Uang Harian saat ini Rp 0.';
    } else {
      konsumsiHintEl.textContent = `Potongan ${formatRp(data.konsumsiPerDay)}/hari (Makan ${formatRp(sbm.makan || 0)} x ${data.makanKali}, Snack ${formatRp(sbm.snack || 0)} x ${data.snackKali}). Total dipotong: ${formatRp(data.konsumsiDeductPerPerson)}.`;
    }
  }

  renderSimulasiResult(data);
}

function renderSimulasiResult(data) {
  const { formatRp } = data;
  const safeEsc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s || '');

  const destBadge = document.getElementById('simResDestBadge');
  if (destBadge) destBadge.textContent = data.destLabel;

  const metaBadge = document.getElementById('simResMetaBadge');
  if (metaBadge) metaBadge.textContent = `${data.hari} Hari • ${data.malam} Malam • Perorangan`;

  const grandTotalEl = document.getElementById('simResGrandTotal');
  if (grandTotalEl) grandTotalEl.textContent = formatRp(data.grandTotal);

  const terbilangEl = document.getElementById('simResTerbilang');
  if (terbilangEl) {
    if (data.grandTotal === 0) {
      terbilangEl.textContent = 'Nol Rupiah';
    } else if (typeof terbilang === 'function') {
      terbilangEl.textContent = terbilang(data.grandTotal);
    } else {
      terbilangEl.textContent = formatRp(data.grandTotal);
    }
  }

  const compBadge = document.getElementById('simResComplianceBadge');
  if (compBadge) {
    if (data.exceedTotal > 0) {
      compBadge.className = 'sim-compliance-pill is-warn';
      compBadge.innerHTML = `<svg class="ico-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><span>Melebihi Pagu SBM (+${formatRp(data.exceedTotal)})</span>`;
    } else {
      compBadge.className = 'sim-compliance-pill is-ok';
      compBadge.innerHTML = `<svg class="ico-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m4 12 5 5L20 6"/></svg><span>Memenuhi Pagu SBM 2026</span>`;
    }
  }

  const sbmCapEl = document.getElementById('simResSbmCap');
  if (sbmCapEl) sbmCapEl.textContent = formatRp(data.sbmCapTotal);

  const hotelCapEl = document.getElementById('simResHotelCap');
  if (hotelCapEl) {
    hotelCapEl.textContent = data.isDkiLocal ? 'Rp 0 (DKI)' : `${formatRp(data.hotelPaguRate)}/mlm`;
  }

  // Visual composition bar
  const total = data.grandTotal;
  const pctUh = total > 0 ? Math.round((data.uhTotal / total) * 100) : 0;
  const pctHotel = total > 0 ? Math.round((data.hotelTotal / total) * 100) : 0;
  const pctTrans = total > 0 ? Math.round((data.transCombinedTotal / total) * 100) : 0;
  const pctLain = total > 0 ? Math.max(0, 100 - pctUh - pctHotel - pctTrans) : 0;

  const setSeg = (id, pct) => {
    const el = document.getElementById(id);
    if (el) el.style.width = `${pct}%`;
  };
  setSeg('simSegUh', pctUh);
  setSeg('simSegHotel', pctHotel);
  setSeg('simSegTrans', pctTrans);
  setSeg('simSegLain', pctLain);

  const legendEl = document.getElementById('simCompLegend');
  if (legendEl) {
    const items = [
      { cls: 'seg-uh', label: 'Uang Harian', pct: pctUh },
      { cls: 'seg-hotel', label: 'Penginapan', pct: pctHotel },
      { cls: 'seg-trans', label: 'Transportasi', pct: pctTrans }
    ];
    if (data.repTotal > 0) {
      items.push({ cls: 'seg-lain', label: 'Representasi', pct: pctLain });
    }
    legendEl.innerHTML = items.map(it =>
      `<span class="sim-legend-item"><i class="sim-legend-dot ${it.cls}"></i>${it.label} <strong>${it.pct}%</strong></span>`
    ).join('');
  }

  // Breakdown rows
  const rows = [];
  const uhFormulaParts = [`${formatRp(data.uhRate)} × ${data.hari} hr`];
  if (Math.round(data.effectivePct * 100) !== 100 && data.uhRate > 0) {
    uhFormulaParts.push(`(${Math.round(data.effectivePct * 100)}%)`);
  }
  if (data.konsumsiDeductPerPerson > 0) {
    if (data.jenis === 'rapat') {
      uhFormulaParts.push(`− konsumsi ${formatRp(data.konsumsiDeductPerPerson)} (1x makan + 1x snack SBM/hr)`);
    } else {
      uhFormulaParts.push(`− konsumsi ${formatRp(data.konsumsiDeductPerPerson)}`);
    }
  }
  rows.push({
    title: data.uhLabel,
    sub: data.isDkiLocal && data.jenis === 'diklat' ? 'DKI Jakarta: Tanpa Uang Harian Diklat' : (data.cbUh ? uhFormulaParts.join(' ') : 'Dinonaktifkan dalam simulasi'),
    amount: data.uhTotal,
    warn: '',
    icon: '💼',
    avatarCls: 'av-uh'
  });

  const hotelSub = data.isDkiLocal
    ? 'DKI Jakarta: Tanpa biaya penginapan (0 hari 0 malam)'
    : (!data.cbHotel
      ? 'Tanpa penginapan (0 hari 0 malam)'
      : (data.malam === 0
        ? 'Tanpa penginapan (0 hari 0 malam)'
        : `${data.hotelModeLabel} • ${formatRp(data.hotelRateUsed)} × ${data.malam} mlm`));
  rows.push({
    title: 'Penginapan / Hotel',
    sub: hotelSub,
    amount: data.hotelTotal,
    warn: data.hotelExceed > 0 ? `+${formatRp(data.hotelExceed)} di atas pagu` : '',
    icon: '🏨',
    avatarCls: 'av-hotel'
  });

  // TUNGGAL: 1 Baris Transportasi (Berangkat & Pulang)
  rows.push({
    title: data.transportLabel,
    sub: data.transportSub,
    amount: data.transportTotal,
    warn: '',
    icon: '✈️',
    avatarCls: 'av-trans'
  });

  // SECTION 4: Representasi Pejabat (Hanya muncul jika aktif / ada nilai)
  if (data.repTotal > 0) {
    rows.push({
      title: 'Uang Representatif Pejabat',
      sub: `${formatRp(data.repRate)}/hari × ${data.hari} hr (Eselon I / II / Karo)`,
      amount: data.repTotal,
      warn: '',
      icon: '🎖️',
      avatarCls: 'av-rep'
    });
  }

  const listEl = document.getElementById('simBreakdownList');
  if (listEl) {
    listEl.innerHTML = rows.map(r => {
      const isZero = r.amount === 0;
      return `
      <div class="sim-breakdown-row ${isZero ? 'is-zero' : ''}">
        <div class="sim-br-left">
          <span class="sim-br-avatar ${r.avatarCls || 'av-uh'}">${r.icon || '📌'}</span>
          <div class="sim-br-text">
            <strong class="sim-br-title">${safeEsc(r.title)}</strong>
            <span class="sim-br-sub">${safeEsc(r.sub)}</span>
            ${r.warn ? `<span class="sim-br-warn">${safeEsc(r.warn)}</span>` : ''}
          </div>
        </div>
        <div class="sim-br-right">
          <strong class="sim-br-amt ${isZero ? 'is-zero' : ''}">${formatRp(r.amount)}</strong>
        </div>
      </div>
    `;
    }).join('');
  }

  // Referensi singkat SBM
  const refProv = document.getElementById('simRefProvName');
  if (refProv) refProv.textContent = data.sbm.provinsi;

  const refGrid = document.getElementById('simRefGrid');
  if (refGrid) {
    const uhRefVal = data.isKepSeribu ? 210000 : (data.isDkiLocal ? 0 : (data.sbm.uh || 0));
    const transRefVal = data.transportSbmCapRate;
    const refItems = [
      { k: 'Uang Harian', v: data.isDkiLocal ? 'Rp 0 (Tanpa UH)' : formatRp(uhRefVal) },
      { k: 'Hotel Gol. III', v: data.isDkiLocal ? 'Rp 0 (DKI)' : formatRp(data.sbm.h3 || 0) },
      { k: 'Hotel Gol. IV', v: data.isDkiLocal ? 'Rp 0 (DKI)' : formatRp(data.sbm.h4 || 0) },
      { k: 'Tiket Antarkota PP', v: (data.sbm.tiket && data.sbm.tiket > 0) ? formatRp(data.sbm.tiket) : (data.isKepSeribu ? 'Rp 772.000 (Laut)' : (data.isDkiLocal ? 'Rp 170.000 (DPR)' : 'Jalur Darat')) },
      { k: 'Taksi / Bandara PP', v: (data.isDkiLocal || data.isKepSeribu || data.isBodetabek) ? 'Termasuk Flat' : formatRp((data.sbm.jktPP || 0) + (data.sbm.taxi || 0)) },
      { k: 'Diklat / Pelatihan', v: data.isDkiLocal ? 'Rp 170.000 (Flat)' : formatRp(data.sbm.diklat || 0) }
    ];
    refGrid.innerHTML = refItems.map(it => `
      <div class="sim-ref-item">
        <span>${safeEsc(it.k)}</span>
        <strong>${safeEsc(it.v)}</strong>
      </div>
    `).join('');
  }
}

function copySimulasiSummary() {
  const data = computeSimulasiData();
  if (!data) return;
  const { formatRp } = data;
  const uhDetailLine = data.konsumsiDeductPerPerson > 0
    ? `- ${data.uhLabel}: ${formatRp(data.uhTotal)} (Potong konsumsi ${formatRp(data.konsumsiDeductPerPerson)})`
    : `- ${data.uhLabel}: ${formatRp(data.uhTotal)}`;
  const lines = [
    `SIMULASI ESTIMASI BIAYA PERJALANAN DINAS (SBM 2026)`,
    `Tujuan: ${data.destLabel}`,
    `Durasi & Subjek: ${data.hari} Hari / ${data.malam} Malam • Perorangan (Gol. ${data.golongan})`,
    `Skema Kegiatan: ${data.jenis === 'rapat' ? 'Rapat Biasa' : (data.jenis === 'diklat' ? 'Diklat/Pelatihan' : (data.jenis === 'fullboard' ? 'Fullboard' : 'Perjalanan Dinas Biasa'))}`,
    `----------------------------------------`,
    uhDetailLine,
    `- Penginapan (${data.isDkiLocal ? 'DKI: 0 hari 0 malam' : (data.malam === 0 ? 'Tanpa Penginapan (0 hari 0 malam)' : data.hotelModeLabel + ', ' + data.malam + ' mlm')}): ${formatRp(data.hotelTotal)}`,
    `- ${data.transportLabel}: ${formatRp(data.transportTotal)}`
  ];
  if (data.repTotal > 0) lines.push(`- Uang Representatif: ${formatRp(data.repTotal)}`);
  lines.push(`----------------------------------------`);
  lines.push(`TOTAL ESTIMASI PERORANGAN: ${formatRp(data.grandTotal)}`);
  lines.push(`Status Pagu SBM: ${data.exceedTotal > 0 ? 'Melebihi Pagu SBM (+' + formatRp(data.exceedTotal) + ')' : 'Memenuhi Pagu SBM 2026'}`);

  const text = lines.join('\n');
  const notifyOk = () => {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Ringkasan Estimasi Disalin', 'Hasil simulasi biaya berhasil disalin ke clipboard.');
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(notifyOk).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); notifyOk(); } catch (_) {}
      document.body.removeChild(ta);
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); notifyOk(); } catch (_) {}
    document.body.removeChild(ta);
  }
}

function applySimulasiToFormInput() {
  const data = computeSimulasiData();
  if (!data) return;
  const provEl = document.getElementById('provinsiTujuan');
  const kotaEl = document.getElementById('kotaTujuan');
  if (provEl) {
    provEl.value = String(data.sbm.id);
    if (typeof changeProvince === 'function') changeProvince();
  }
  if (kotaEl) {
    const cleanCity = data.cityObj ? data.cityObj.nama : data.sbm.ibukota;
    kotaEl.value = cleanCity && cleanCity !== '-' ? cleanCity : data.sbm.provinsi;
  }
  const lamaEl = document.getElementById('lamaHari');
  if (lamaEl) {
    lamaEl.value = data.hari;
    if (typeof calcDuration === 'function') calcDuration();
  }
  const jenisEl = document.getElementById('jenisKegiatan');
  if (jenisEl && data.jenis) {
    jenisEl.value = data.jenis;
    if (typeof onJenisKegiatanChange === 'function') onJenisKegiatanChange();
  }
  if (typeof updateCockpitKpi === 'function') updateCockpitKpi();
  if (typeof showTab === 'function') showTab('input');
  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Simulasi Diterapkan', `Data tujuan ${data.destLabel} dan durasi ${data.hari} hari berhasil disalin ke Formulir Input Perjalanan.`);
  }
}

function resetSimulasiKalkulator() {
  clearSimSearch();
  closeSimLimitAlert();
  simState.wasDkiLocal = false;
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };

  setVal('simJenisKegiatan', 'biasa');
  setVal('simHari', 1);
  setVal('simMalam', 0);
  setVal('simPeserta', 1);
  setVal('simGolongan', 'III');
  setVal('simUhPercent', '1');
  setChk('simCbHotel', false);
  setVal('simMakanKali', 1);
  setVal('simSnackKali', 0);
  setVal('simHotelMode', 'sbm');
  setVal('simKamarMode', 'per_orang');
  setVal('simJumlahKamar', 1);
  setVal('simHotelManual', '');
  setVal('simTransportArah', 'pp');
  setVal('simTransportMode', 'sbm');
  setVal('simTransportManual', '');
  setVal('simLokalMode', 'sbm');
  setVal('simDkiDprMode', 'flat');
  setVal('simLokalManual', '');

  setChk('simCbUh', true);
  setChk('simCbKonsumsi', false);
  setChk('simCbHotel', true);
  setChk('simCbTransport', true);
  setChk('simCbLokal', true);
  setChk('simCbRep', false);

  onSimProvChange(16, 'sby_kota');
}

function openSimulasiFromSbmViewer() {
  const canEdit = (typeof canCurrentUserEdit === 'function') ? canCurrentUserEdit() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
  const isViewer = !canEdit && !!window.currentAuthUser;
  if (!isViewer) {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast('Fitur Khusus Viewer', 'Fitur simulasi biaya hanya diperuntukkan bagi akun role Viewer.');
    }
    return;
  }
  const selProv = document.getElementById('viewerSbmSelectProv');
  const selCity = document.getElementById('viewerSbmSelectCity');
  const provId = selProv ? (parseInt(selProv.value, 10) || 16) : 16;
  const cityId = selCity ? (selCity.value || 'all') : 'all';

  const simProv = document.getElementById('simSelectProv');
  if (simProv) populateSbmProvinceSelect(simProv, provId);
  simState.initialized = true;
  onSimProvChange(provId, cityId);

  if (typeof showTab === 'function') showTab('simulasi');
}

function openSbmFromSimulasi() {
  const provId = simState.provId || 13;
  const cityId = simState.cityId || 'all';

  const viewerProv = document.getElementById('viewerSbmSelectProv');
  if (viewerProv) populateSbmProvinceSelect(viewerProv, provId);
  currentViewerSbmCityId = cityId || 'all';
  if (typeof onViewerSbmProvChange === 'function') {
    onViewerSbmProvChange(provId, cityId);
  }

  if (typeof showTab === 'function') showTab('sbm');
}

// Tutup dropdown hasil pencarian jika klik di luar
document.addEventListener('click', function(e) {
  const searchBox = document.querySelector('.sbm-search-city-box:not(.sim-search-city-box)');
  const resBox = document.getElementById('viewerSbmSearchResults');
  if (resBox && searchBox && !searchBox.contains(e.target)) {
    resBox.style.display = 'none';
  }
  const simSearchBox = document.querySelector('.sim-search-city-box');
  const simResBox = document.getElementById('simSearchResults');
  if (simResBox && simSearchBox && !simSearchBox.contains(e.target)) {
    simResBox.style.display = 'none';
  }
});

if (typeof window !== 'undefined') {
  window.openSbmLimitModal = openSbmLimitModal;
  window.openMealLimitModal = openMealLimitModal;
  window.closeMealLimitModal = closeMealLimitModal;
  window.handleMealLimitBackdrop = handleMealLimitBackdrop;
  window.updateCockpitKpi = updateCockpitKpi;
  window.onCockpitTicketChange = onCockpitTicketChange;
  window.onEmployeeTransportRowChange = onEmployeeTransportRowChange;
  window.onCockpitHotelChange = onCockpitHotelChange;
  window.onCockpitManualMealChange = onCockpitManualMealChange;
  window.onCockpitUHChange = onCockpitUHChange;
  window.switchCockpitTab = switchCockpitTab;
  window.initViewerSbmCockpit = initViewerSbmCockpit;
  window.onViewerSbmProvChange = onViewerSbmProvChange;
  window.populateViewerSbmCities = populateViewerSbmCities;
  window.onViewerSbmCityDropdownChange = onViewerSbmCityDropdownChange;
  window.quickSelectSbmCity = quickSelectSbmCity;
  window.onViewerSbmSearchInput = onViewerSbmSearchInput;
  window.selectCityFromSearch = selectCityFromSearch;
  window.selectProvFromSearch = selectProvFromSearch;
  window.clearViewerSbmSearch = clearViewerSbmSearch;
  window.resetSbmViewerToDefault = resetSbmViewerToDefault;
  window.initSimulasiKalkulator = initSimulasiKalkulator;
  window.onSimProvChange = onSimProvChange;
  window.onSimCityChange = onSimCityChange;
  window.quickSelectSimCity = quickSelectSimCity;
  window.onSimSearchInput = onSimSearchInput;
  window.selectSimCityFromSearch = selectSimCityFromSearch;
  window.selectSimProvFromSearch = selectSimProvFromSearch;
  window.clearSimSearch = clearSimSearch;
  window.adjustSimStepper = adjustSimStepper;
  window.onSimHariChange = onSimHariChange;
  window.onSimMalamChange = onSimMalamChange;
  window.onSimCurrencyInput = onSimCurrencyInput;
  window.onSimParamChange = onSimParamChange;
  window.computeSimulasiData = computeSimulasiData;
  window.copySimulasiSummary = copySimulasiSummary;
  window.applySimulasiToFormInput = applySimulasiToFormInput;
  window.resetSimulasiKalkulator = resetSimulasiKalkulator;
  window.openSimulasiFromSbmViewer = openSimulasiFromSbmViewer;
  window.openSbmFromSimulasi = openSbmFromSimulasi;
  window.showSimLimitAlert = showSimLimitAlert;
  window.closeSimLimitAlert = closeSimLimitAlert;
  window.getSimInputLimit = getSimInputLimit;
}
