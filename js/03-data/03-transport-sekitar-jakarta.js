// =====================================================================
// SATUAN BIAYA TRANSPORTASI DARI DKI JAKARTA KE KABUPATEN/KOTA SEKITAR (ONE WAY)
// Dasar: PMK SBM TA 2026 (Halaman 68)
// Catatan: Nilai yang tercantum dalam tabel PMK adalah ONE WAY (sekali jalan).
// Untuk perjalanan dinas PP (Pulang-Pergi), tarif SBM Transport / DPR dikali 2 (x 2).
// =====================================================================
const sbmTransportSekitarJakarta = [
  { id: 'kota_bekasi', nama: 'Kota Bekasi', provId: 12, provName: 'JAWA BARAT', oneWay: 256000, pp: 512000, regex: /kota\s+bekasi|kodya\s+bekasi/i },
  { id: 'kab_bekasi', nama: 'Kab. Bekasi', provId: 12, provName: 'JAWA BARAT', oneWay: 256000, pp: 512000, regex: /kab(\.|upaten)?\s+bekasi/i },
  { id: 'bekasi', nama: 'Kota/Kab. Bekasi', provId: 12, provName: 'JAWA BARAT', oneWay: 256000, pp: 512000, regex: /\bbekasi\b/i },
  { id: 'kab_bogor', nama: 'Kab. Bogor', provId: 12, provName: 'JAWA BARAT', oneWay: 270000, pp: 540000, regex: /kab(\.|upaten)?\s+bogor/i },
  { id: 'kota_bogor', nama: 'Kota Bogor', provId: 12, provName: 'JAWA BARAT', oneWay: 270000, pp: 540000, regex: /kota\s+bogor|kodya\s+bogor/i },
  { id: 'bogor', nama: 'Kota/Kab. Bogor', provId: 12, provName: 'JAWA BARAT', oneWay: 270000, pp: 540000, regex: /\bbogor\b/i },
  { id: 'kota_depok', nama: 'Kota Depok', provId: 12, provName: 'JAWA BARAT', oneWay: 248000, pp: 496000, regex: /\bdepok\b/i },
  { id: 'tangsel', nama: 'Kota Tangerang Selatan', provId: 11, provName: 'BANTEN', oneWay: 258000, pp: 516000, regex: /tangerang\s+selatan|tangsel/i },
  { id: 'kab_tangerang', nama: 'Kab. Tangerang', provId: 11, provName: 'BANTEN', oneWay: 279000, pp: 558000, regex: /kab(\.|upaten)?\s+tangerang|tigaraksa/i },
  { id: 'kota_tangerang', nama: 'Kota Tangerang', provId: 11, provName: 'BANTEN', oneWay: 258000, pp: 516000, regex: /\btangerang\b/i },
  { id: 'kep_seribu', nama: 'Kepulauan Seribu', provId: 13, provName: 'DKI JAKARTA', oneWay: 386000, pp: 772000, regex: /seribu|pulau\s+seribu|pramuka|tidung|pari|kelapa|harapan/i }
];

function getSbmSekitarJakarta(kotaTeks, kotaAsalTeks) {
  const tujuan = String(kotaTeks !== undefined ? kotaTeks : (typeof document !== 'undefined' ? (document.getElementById('kotaTujuan')?.value || '') : '')).trim();
  const asal = String(kotaAsalTeks !== undefined ? kotaAsalTeks : (typeof document !== 'undefined' ? (document.getElementById('cfg_kotaAsal')?.value || 'Jakarta') : 'Jakarta')).trim();

  if (!tujuan) return null;

  for (const item of sbmTransportSekitarJakarta) {
    if (item.regex.test(tujuan)) {
      return item;
    }
  }

  // Jika tujuan Jakarta dan asal adalah kota sekitar
  if (/jakarta/i.test(tujuan)) {
    for (const item of sbmTransportSekitarJakarta) {
      if (item.regex.test(asal)) {
        return item;
      }
    }
  }

  return null;
}

