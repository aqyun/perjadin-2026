// =====================================================================
// VIEWER SBM COCKPIT & KAMUS TARIF (DASHBOARD)
// Mematuhi 100% PMK Nomor 32 Tahun 2025 & Aturan Transport Sekitar Jakarta
// =====================================================================
let currentViewerSbmCityId = 'all';

function populateSbmProvinceSelect(selProv, defaultProvId = 13) {
  if (!selProv || !Array.isArray(sbmData)) return;
  if (selProv.options.length > 1) return;
  selProv.innerHTML = '';
  sbmData.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.provinsi;
    if (String(s.id) === String(defaultProvId)) {
      opt.selected = true;
    }
    selProv.appendChild(opt);
  });
}

function populateSbmCitySelect(selCity, provId, selectedCityId = null) {
  if (!selCity || !Array.isArray(sbmData)) return;
  const sbm = sbmData.find(x => String(x.id) === String(provId)) || sbmData[0];
  const provCities = (typeof getDaftarKotaByProvinsi === 'function')
    ? getDaftarKotaByProvinsi(provId)
    : [];

  selCity.innerHTML = '';
  selCity.dataset.provId = String(sbm.id);

  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = (sbm.provinsi === 'DKI JAKARTA')
    ? 'Seluruh Wilayah DKI Jakarta'
    : `Seluruh Kota/Kabupaten di ${sbm.provinsi}`;
  if (!selectedCityId || selectedCityId === 'all') {
    optAll.selected = true;
  }
  selCity.appendChild(optAll);

  if (provCities.length > 0) {
    provCities.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      let label = c.nama || '';
      if (!/^(kota|kab\.|kabupaten)\b/i.test(label.trim()) && c.tipe) {
        label = `${c.tipe} ${label}`;
      }
      if (c.isBodetabek) label += ' (Bodetabek PMK Hal 68)';
      if (c.isKhusus) label += ' (Khusus PMK Hal 15 & 68)';
      opt.textContent = label;
      if (selectedCityId && c.id === selectedCityId) {
        opt.selected = true;
      }
      selCity.appendChild(opt);
    });
  } else if (sbm.ibukota && sbm.ibukota !== '-') {
    const optIbukota = document.createElement('option');
    optIbukota.value = 'ibukota';
    optIbukota.textContent = `Kota ${sbm.ibukota}`;
    optIbukota.selected = true;
    selCity.appendChild(optIbukota);
  }
}

function initViewerSbmCockpit() {
  const selProv = document.getElementById('viewerSbmSelectProv');
  if (!selProv || !Array.isArray(sbmData)) return;

  populateSbmProvinceSelect(selProv, 13);

  const curProvVal = selProv.value || 13;
  populateViewerSbmCities(curProvVal, currentViewerSbmCityId);
  onViewerSbmProvChange(curProvVal, currentViewerSbmCityId);
}

function populateViewerSbmCities(provId, selectedCityId = null) {
  populateSbmCitySelect(document.getElementById('viewerSbmSelectCity'), provId, selectedCityId);
}

function onViewerSbmProvChange(provId, cityIdOrObj = null) {
  if (!Array.isArray(sbmData)) return;
  const sbm = sbmData.find(x => String(x.id) === String(provId)) || sbmData.find(x => x.provinsi === 'DKI JAKARTA') || sbmData[0];
  if (!sbm) return;

  const selProv = document.getElementById('viewerSbmSelectProv');
  if (selProv && String(selProv.value) !== String(sbm.id)) {
    selProv.value = sbm.id;
  }

  // Cari objek kota yang sesuai
  let cityObj = null;
  if (cityIdOrObj && typeof cityIdOrObj === 'object') {
    cityObj = cityIdOrObj;
  } else if (typeof cityIdOrObj === 'string' && cityIdOrObj !== 'all') {
    cityObj = (typeof daftarKotaSbm !== 'undefined') ? daftarKotaSbm.find(x => x.id === cityIdOrObj) : null;
  } else {
    const selCity = document.getElementById('viewerSbmSelectCity');
    if (selCity && selCity.value && selCity.value !== 'all') {
      cityObj = (typeof daftarKotaSbm !== 'undefined') ? daftarKotaSbm.find(x => x.id === selCity.value) : null;
    }
  }

  currentViewerSbmCityId = cityObj ? cityObj.id : 'all';

  // Sinkronkan dropdown kota jika provinsi baru
  const selCity = document.getElementById('viewerSbmSelectCity');
  if (selCity) {
    const currentProvInCity = selCity.querySelector('option:first-child')?.textContent || '';
    if (!currentProvInCity.includes(sbm.provinsi)) {
      populateViewerSbmCities(sbm.id, cityObj ? cityObj.id : null);
    } else if (cityObj) {
      selCity.value = cityObj.id;
    } else {
      selCity.value = 'all';
    }
  }

  // Update Active Badges: Langsung nama provinsi saja tanpa ibukota
  const activeNameEl = document.getElementById('viewerSbmActiveName');
  if (activeNameEl) {
    activeNameEl.textContent = sbm.provinsi;
  }

  const activeCityBadge = document.getElementById('viewerSbmActiveCityBadge');
  if (activeCityBadge) {
    activeCityBadge.textContent = (cityObj && cityObj.id !== 'all' && cityObj.id !== 'jkt_pusat') 
      ? `${cityObj.nama}` 
      : (sbm.provinsi === 'DKI JAKARTA' ? 'DKI Jakarta' : `Wilayah ${sbm.provinsi}`);
  }

  const zoneBadge = document.getElementById('viewerSbmZoneBadge');
  if (zoneBadge) {
    if (sbm.provinsi === 'DKI JAKARTA') zoneBadge.textContent = 'Jawa • Ibukota Negara';
    else if (cityObj && cityObj.isBodetabek) zoneBadge.textContent = 'Wilayah Penyangga Jakarta (Bodetabek)';
    else if (sbm.provinsi.includes('JAWA') || sbm.provinsi.includes('BANTEN') || sbm.provinsi.includes('YOGYAKARTA')) zoneBadge.textContent = 'Zona Pulau Jawa';
    else if (sbm.provinsi.includes('SUMATERA') || sbm.provinsi.includes('RIAU') || sbm.provinsi.includes('ACEH') || sbm.provinsi.includes('LAMPUNG') || sbm.provinsi.includes('JAMBI') || sbm.provinsi.includes('BENGKULU') || sbm.provinsi.includes('BANGKA')) zoneBadge.textContent = 'Zona Pulau Sumatera';
    else if (sbm.provinsi.includes('KALIMANTAN')) zoneBadge.textContent = 'Zona Pulau Kalimantan';
    else if (sbm.provinsi.includes('SULAWESI') || sbm.provinsi.includes('GORONTALO')) zoneBadge.textContent = 'Zona Pulau Sulawesi';
    else if (sbm.provinsi.includes('BALI') || sbm.provinsi.includes('NUSA TENGGARA')) zoneBadge.textContent = 'Zona Bali & Nusa Tenggara';
    else if (sbm.provinsi.includes('MALUKU')) zoneBadge.textContent = 'Zona Kepulauan Maluku';
    else if (sbm.provinsi.includes('PAPUA')) zoneBadge.textContent = 'Zona Wilayah Papua';
    else zoneBadge.textContent = 'Wilayah Indonesia';
  }

  // Hero Title: Langsung nama provinsi atau kota spesifik, jangan ada misal "Jakarta - Jakarta Pusat"
  const heroTitle = document.getElementById('viewerSbmHeroTitle');
  if (heroTitle) {
    if (sbm.provinsi === 'DKI JAKARTA') {
      if (cityObj && (cityObj.id === 'kep_seribu' || /seribu/i.test(cityObj.nama))) {
        heroTitle.textContent = 'DKI JAKARTA — Kepulauan Seribu';
      } else if (cityObj && cityObj.nama && cityObj.id !== 'all' && cityObj.id !== 'jkt_pusat' && cityObj.id !== 'jkt_dki') {
        heroTitle.textContent = `DKI JAKARTA — ${cityObj.nama}`;
      } else {
        heroTitle.textContent = 'DKI JAKARTA';
      }
    } else {
      if (cityObj && cityObj.id !== 'all') {
        heroTitle.textContent = `${cityObj.nama} (${sbm.provinsi})`;
      } else {
        heroTitle.textContent = sbm.provinsi;
      }
    }
  }

  const heroSub = document.getElementById('viewerSbmHeroSub');
  if (heroSub) {
    heroSub.textContent = `Dasar hukum tarif resmi mengikuti Peraturan Menteri Keuangan PMK Nomor 32 Tahun 2025 Lampiran Standar Biaya Masukan.`;
  }

  const isDki = sbm.provinsi === 'DKI JAKARTA';
  const isKepSeribu = cityObj && (cityObj.id === 'kep_seribu' || /seribu/i.test(cityObj.nama));
  const isDkiNoUh = isDki && !isKepSeribu;
  const isBodetabek = cityObj && cityObj.isBodetabek;
  const formatRp = typeof rp === 'function' ? rp : (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  // UPDATE 11 KARTU TARIF SBM
  // 1. Uang Harian
  const elUh = document.getElementById('vsbm_uh');
  const elUhUnit = document.getElementById('vsbm_uh_unit');
  if (elUh) {
    if (isKepSeribu) {
      elUh.textContent = formatRp(210000);
      if (elUhUnit) elUhUnit.textContent = '/ Orang / Hari (Kep. Seribu PMK Hal 15)';
    } else if (isDkiNoUh) {
      elUh.textContent = `${formatRp(0)} (tidak dibayarkan)`;
      if (elUhUnit) elUhUnit.textContent = 'Dalam kota: Tanpa Uang Harian (Flat Rp 170.000)';
    } else {
      elUh.textContent = formatRp(sbm.uh || 0);
      if (elUhUnit) elUhUnit.textContent = '/ Orang / Hari (OH) Penuh 100%';
    }
  }

  // 2. Uang Harian Diklat
  const elDiklat = document.getElementById('vsbm_diklat');
  if (elDiklat) {
    elDiklat.textContent = isDkiNoUh ? `${formatRp(0)} (tidak dibayarkan)` : formatRp(sbm.diklat || 110000);
  }

  // 3. Uang Harian Fullboard
  const elFullboard = document.getElementById('vsbm_fullboard');
  if (elFullboard) {
    elFullboard.textContent = isDkiNoUh ? `${formatRp(0)} (tidak dibayarkan)` : formatRp(sbm.fullboard || 130000);
  }

  // 4. Makan Rapat SBM
  const elMakan = document.getElementById('vsbm_makan');
  if (elMakan) {
    elMakan.textContent = formatRp(sbm.makan || 0);
  }

  // 5. Snack Rapat SBM
  const elSnack = document.getElementById('vsbm_snack');
  if (elSnack) {
    elSnack.textContent = formatRp(sbm.snack || 0);
  }

  // 6. Penginapan Gol IV
  const elH4 = document.getElementById('vsbm_h4');
  if (elH4) {
    elH4.textContent = isDkiNoUh ? `${formatRp(0)} (dalam kota)` : formatRp(sbm.h4 || 0);
  }

  // 7. Penginapan Gol III
  const elH3 = document.getElementById('vsbm_h3');
  if (elH3) {
    elH3.textContent = isDkiNoUh ? `${formatRp(0)} (dalam kota)` : formatRp(sbm.h3 || 0);
  }

  // 8. DPR Jakarta PP / Transport Darat
  const elJkt = document.getElementById('vsbm_jkt');
  if (elJkt) {
    if (isBodetabek && cityObj.transportPP) {
      elJkt.textContent = `${formatRp(cityObj.transportPP)}`;
    } else if (isKepSeribu) {
      elJkt.textContent = `${formatRp(772000)}`;
    } else {
      elJkt.textContent = sbm.jktPP ? formatRp(sbm.jktPP) : '- (dalam kota)';
    }
  }

  // 9. Taxi Lokal
  const elTaxi = document.getElementById('vsbm_taxi');
  if (elTaxi) {
    elTaxi.textContent = isDkiNoUh ? '- (dalam kota)' : (sbm.taxi ? formatRp(sbm.taxi) : '-');
  }

  // 10. DPR dibayarkan
  const elDpr = document.getElementById('vsbm_dpr');
  if (elDpr) {
    if (isDki) {
      elDpr.textContent = `${formatRp(170000)}`;
    } else {
      elDpr.textContent = '- (khusus DKI Jakarta)';
    }
  }

  // 11. Tiket Pesawat PP
  const elTiket = document.getElementById('vsbm_tiket');
  if (elTiket) {
    elTiket.textContent = sbm.tiket ? formatRp(sbm.tiket) : '- (jalur darat / tidak ada)';
  }

  // RENDER SPECIAL NOTICE BANNER
  const noticeBox = document.getElementById('viewerSbmSpecialNotice');
  if (noticeBox) {
    if (isBodetabek && cityObj.transportPP) {
      noticeBox.innerHTML = `
        <div class="sbm-notice-card notice-bodetabek">
          <div class="notice-badge">🚗 ATURAN TRANSPORT KHUSUS BODETABEK (PMK HAL 68)</div>
          <strong class="notice-headline">Transport Darat PP Resmi: ${formatRp(cityObj.transportPP)}</strong>
          <p class="notice-desc">Tujuan ke <strong>${cityObj.nama}</strong> memiliki ketentuan biaya transport darat PP sebesar <strong>${formatRp(cityObj.transportPP)}</strong> (one way ${formatRp(cityObj.oneWay)}). DPR dibayarkan sesuai bukti pengeluaran riil atau standar pagu SBM.</p>
        </div>
      `;
    } else if (isKepSeribu) {
      noticeBox.innerHTML = `
        <div class="sbm-notice-card notice-island">
          <div class="notice-badge">⛴️ ATURAN KHUSUS KEPULAUAN SERIBU (PMK HAL 15 &amp; 68)</div>
          <strong class="notice-headline">Uang Harian: Rp 210.000 | Tiket Kapal Laut: Rp 772.000 PP</strong>
          <p class="notice-desc">Perjalanan dinas ke Kepulauan Seribu mendapatkan uang harian resmi <strong>Rp 210.000 / hari</strong> (PMK Hal 15) dan satuan biaya sewa/tiket kapal laut PP sebesar <strong>Rp 772.000</strong> (one way Rp 386.000, PMK Hal 68).</p>
        </div>
      `;
    } else if (isDki) {
      noticeBox.innerHTML = `
        <div class="sbm-notice-card notice-dki">
          <div class="notice-badge">🏛️ KETENTUAN PERJALANAN DALAM KOTA DKI JAKARTA (PMK HAL 69)</div>
          <strong class="notice-headline">Uang Harian Rp 0 | Hotel Rp 0 | DPR Lokal Flat Rp 170.000</strong>
          <p class="notice-desc">Sesuai ketentuan, penugasan di wilayah DKI Jakarta tidak diberikan uang harian (biasa/diklat/fullboard) dan tanpa penginapan/hotel. Flat dibayarkan uang transport lokal (DPR) sebesar <strong>Rp 170.000</strong>.</p>
        </div>
      `;
    } else {
      noticeBox.innerHTML = `
        <div class="sbm-notice-card notice-luarkota">
          <div class="notice-badge">✈️ KETENTUAN PERJALANAN LUAR KOTA (${sbm.provinsi})</div>
          <strong class="notice-headline">Uang Harian 100%: ${formatRp(sbm.uh)} / Hari</strong>
          <p class="notice-desc">Tujuan ${cityObj ? cityObj.nama + ' (' + sbm.provinsi + ')' : sbm.provinsi} berhak atas Uang Harian penuh <strong>${formatRp(sbm.uh)}</strong>/hari, pagu hotel Gol. IV <strong>${formatRp(sbm.h4)}</strong>, Gol. III <strong>${formatRp(sbm.h3)}</strong>, taksi lokal <strong>${formatRp(sbm.taxi)}</strong>, dan tiket pesawat PP <strong>${sbm.tiket ? formatRp(sbm.tiket) : 'Jalur Darat'}</strong>.</p>
        </div>
      `;
    }
  }

  // Update state chip
  document.querySelectorAll('.sbm-chip-btn').forEach(btn => {
    btn.classList.toggle('active', !!cityObj && btn.getAttribute('data-chip') === cityObj.id);
  });
}

function onViewerSbmCityDropdownChange(cityId) {
  if (!cityId || cityId === 'all') {
    const selProv = document.getElementById('viewerSbmSelectProv');
    onViewerSbmProvChange(selProv ? selProv.value : 13, null);
    return;
  }
  const city = (typeof daftarKotaSbm !== 'undefined') ? daftarKotaSbm.find(x => x.id === cityId) : null;
  if (city) {
    onViewerSbmProvChange(city.provId, city);
  }
}

function quickSelectSbmCity(cityId) {
  if (cityId === 'all' || cityId === 'jkt_pusat' || cityId === 'jkt_dki') {
    const selProv = document.getElementById('viewerSbmSelectProv');
    if (selProv) selProv.value = 13;
    onViewerSbmProvChange(13, 'all');
    return;
  }
  const city = (typeof daftarKotaSbm !== 'undefined') ? daftarKotaSbm.find(x => x.id === cityId) : null;
  if (!city) return;
  const selProv = document.getElementById('viewerSbmSelectProv');
  if (selProv) selProv.value = city.provId;
  onViewerSbmProvChange(city.provId, city);
}

function buildSbmSearchResultsHtml(keyword, cityFnName, provFnName) {
  const q = String(keyword || '').trim().toLowerCase();
  const safeEsc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s || '');
  const matchedCities = (typeof cariKotaSbm === 'function') ? cariKotaSbm(q) : [];
  const matchedProvs = Array.isArray(sbmData)
    ? sbmData.filter(x => x.provinsi.toLowerCase().includes(q) || (x.ibukota && x.ibukota.toLowerCase().includes(q)))
    : [];

  if (matchedCities.length === 0 && matchedProvs.length === 0) {
    return `
      <div class="sbm-search-empty">
        Tidak ditemukan kota atau provinsi dengan kata kunci "<strong>${safeEsc(keyword)}</strong>".
      </div>
    `;
  }

  const formatRp = typeof rp === 'function' ? rp : (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  let html = '';

  if (matchedCities.length > 0) {
    html += `<div class="sbm-search-section-title">Kota &amp; Kabupaten (${matchedCities.length})</div>`;
    matchedCities.slice(0, 8).forEach(c => {
      const sbm = sbmData.find(x => Number(x.id) === Number(c.provId)) || {};
      const note = c.isBodetabek
        ? `<span class="search-bodetabek-tag">Bodetabek Transport PP ${formatRp(c.transportPP)}</span>`
        : `<span class="search-rate-tag">UH ${formatRp(sbm.uh || 0)} • Hotel IV ${formatRp(sbm.h4 || 0)}</span>`;
      html += `
        <div class="sbm-search-item" onclick="${cityFnName}('${c.id}')">
          <div class="search-item-left">
            <span class="search-item-ico">📍</span>
            <div>
              <strong>${safeEsc(/^(kota|kab\.|kabupaten)\b/i.test((c.nama || '').trim()) || !c.tipe ? c.nama : (c.tipe + ' ' + c.nama))}</strong>
              <small>${safeEsc(c.provName)}</small>
            </div>
          </div>
          <div class="search-item-right">
            ${note}
          </div>
        </div>
      `;
    });
  }

  if (matchedProvs.length > 0) {
    html += `<div class="sbm-search-section-title">Provinsi SBM (${matchedProvs.length})</div>`;
    matchedProvs.slice(0, 6).forEach(p => {
      html += `
        <div class="sbm-search-item" onclick="${provFnName}(${p.id})">
          <div class="search-item-left">
            <span class="search-item-ico">🏛️</span>
            <div>
              <strong>${safeEsc(p.provinsi)}</strong>
              <small>Provinsi SBM PMK 32/2025</small>
            </div>
          </div>
          <div class="search-item-right">
            <span class="search-rate-tag">UH ${formatRp(p.uh || 0)} • Tiket PP ${p.tiket ? formatRp(p.tiket) : 'Jalur Darat'}</span>
          </div>
        </div>
      `;
    });
  }

  return html;
}

function onViewerSbmSearchInput(keyword) {
  const q = String(keyword || '').trim().toLowerCase();
  const resBox = document.getElementById('viewerSbmSearchResults');
  const clearBtn = document.getElementById('btnSbmSearchClear');
  if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

  if (!resBox) return;

  if (!q) {
    resBox.style.display = 'none';
    resBox.innerHTML = '';
    return;
  }

  resBox.innerHTML = buildSbmSearchResultsHtml(keyword, 'selectCityFromSearch', 'selectProvFromSearch');
  resBox.style.display = 'block';
}

function selectCityFromSearch(cityId) {
  const city = (typeof daftarKotaSbm !== 'undefined') ? daftarKotaSbm.find(x => x.id === cityId) : null;
  if (!city) return;
  const selProv = document.getElementById('viewerSbmSelectProv');
  if (selProv) selProv.value = city.provId;
  onViewerSbmProvChange(city.provId, city);
  clearViewerSbmSearch();
}

function selectProvFromSearch(provId) {
  const selProv = document.getElementById('viewerSbmSelectProv');
  if (selProv) selProv.value = provId;
  onViewerSbmProvChange(provId, null);
  clearViewerSbmSearch();
}

function clearViewerSbmSearch() {
  const input = document.getElementById('viewerSbmSearchInput');
  const resBox = document.getElementById('viewerSbmSearchResults');
  const clearBtn = document.getElementById('btnSbmSearchClear');
  if (input) input.value = '';
  if (resBox) {
    resBox.style.display = 'none';
    resBox.innerHTML = '';
  }
  if (clearBtn) clearBtn.style.display = 'none';
}

function resetSbmViewerToDefault() {
  clearViewerSbmSearch();
  quickSelectSbmCity('jkt_pusat');
}

