// =====================================================================
// FORMAT HELPERS & UTILITIES (PerdinKu)
// Helper format mata uang, tanggal, terbilang, teks
// =====================================================================

// =====================================================================
// FORMAT HELPERS
// =====================================================================
function rp(n) {
  if (!n || n === 0) return 'Rp 0';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getProvinsiDisplayName(val) {
  if (!val && val !== 0) return '';
  const str = String(val).trim();
  if (!str || str === '-') return '';
  if (/^\d+$/.test(str)) {
    const id = parseInt(str, 10);
    const s = (typeof sbmData !== 'undefined' && Array.isArray(sbmData))
      ? sbmData.find(item => item.id === id)
      : null;
    if (s && s.provinsi) {
      return (typeof formatProvinsi === 'function') ? formatProvinsi(s.provinsi) : s.provinsi;
    }
  }
  return (typeof formatProvinsi === 'function') ? formatProvinsi(str) : str;
}
window.getProvinsiDisplayName = getProvinsiDisplayName;

function parseNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^\d]/g, '');
  return cleaned ? Number(cleaned) : 0;
}

function formatTgl(str) {
  if (!str) return '-';
  const match = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  if (match) {
    const day = parseInt(match[3], 10);
    const monthIdx = parseInt(match[2], 10) - 1;
    const year = match[1];
    return `${day} ${months[monthIdx] || ''} ${year}`;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTglPendek(str) {
  return formatTgl(str);
}

function jabatanDuaBaris(text) {
  return String(text || '').replace(
    /Pejabat Pembuat Komitmen\s+(?=Sekretariat Jenderal)/,
    'Pejabat Pembuat Komitmen<br>'
  );
}

function terbilang(angka) {
  const satuan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan',
    'Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas',
    'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'
  ];

  if (angka === 0) return 'Nol';
  if (angka < 20) return satuan[angka];
  if (angka < 100) {
    const tens = Math.floor(angka / 10);
    const tenWord = tens * 10 === 20 ? satuan[2] : satuan[tens];
    return tenWord + ' Puluh ' + (satuan[angka % 10] || '').trim();
  }

  function helper(n) {
    if (n === 0) return '';
    if (n < 20) return satuan[n] + ' ';
    if (n < 100) return satuan[Math.floor(n / 10)] + ' Puluh ' + (n % 10 ? satuan[n % 10] + ' ' : '');
    if (n < 200) return 'Seratus ' + helper(n - 100);
    if (n < 1000) return satuan[Math.floor(n / 100)] + ' Ratus ' + helper(n % 100);
    if (n < 2000) return 'Seribu ' + helper(n - 1000);
    if (n < 1000000) return helper(Math.floor(n / 1000)) + 'Ribu ' + helper(n % 1000);
    if (n < 1000000000) return helper(Math.floor(n / 1000000)) + 'Juta ' + helper(n % 1000000);
    return helper(Math.floor(n / 1000000000)) + 'Miliar ' + helper(n % 1000000000);
  }

  return helper(angka).trim() + ' Rupiah';
}

function toDDMMYYYY(str) {
  if (!str) return '';
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    return `${m[3]}-${m[2]}-${m[1]}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const yr = d.getFullYear();
    return `${day}-${mon}-${yr}`;
  }
  return String(str);
}

function formatTglKegiatan(str1, str2) {
  if (!str1 && !str2) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}-${m}-${y}`;
  }
  if (str1 && !str2) return toDDMMYYYY(str1);
  if (!str1 && str2) return toDDMMYYYY(str2);

  const m1 = String(str1).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const m2 = String(str2).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m1 || !m2) {
    const f1 = toDDMMYYYY(str1);
    const f2 = toDDMMYYYY(str2);
    return f1 === f2 ? f1 : `${f1} - ${f2}`;
  }

  const y1 = m1[1], mon1 = m1[2], day1 = m1[3];
  const y2 = m2[1], mon2 = m2[2], day2 = m2[3];

  if (y1 === y2 && mon1 === mon2 && day1 === day2) {
    return `${day1}-${mon1}-${y1}`;
  } else if (y1 === y2 && mon1 === mon2) {
    const dStart = parseInt(day1, 10) <= parseInt(day2, 10) ? day1 : day2;
    const dEnd = parseInt(day1, 10) <= parseInt(day2, 10) ? day2 : day1;
    return `${dStart}-${dEnd}-${mon1}-${y1}`;
  } else if (y1 === y2) {
    return `${day1}-${mon1}-${y1} - ${day2}-${mon2}-${y1}`;
  } else {
    return `${day1}-${mon1}-${y1} - ${day2}-${mon2}-${y2}`;
  }
}

function getNamaDepan(nama) {
  if (!nama) return 'Pegawai';
  const clean = String(nama).split(',')[0].trim();
  const words = clean.split(/\s+/).filter(w => !/^(dr\.|ir\.|drs\.|dra\.|prof\.|h\.|hj\.)/i.test(w));
  return words[0] || clean.split(/\s+/)[0] || 'Pegawai';
}

function getNamaPelakuPerjadin(empIds) {
  if (!empIds || !empIds.length) return 'Pegawai';
  const empList = (typeof employees !== 'undefined' && Array.isArray(employees)) ? employees : [];
  const names = empIds.map(id => {
    const emp = empList.find(e => e.id === id);
    return emp ? getNamaDepan(emp.nama) : '';
  }).filter(Boolean);

  if (names.length === 0) return 'Pegawai';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, ${names[1]}`;

  const combined = names.join(', ');
  if (names.length <= 3 && combined.length <= 40) {
    return combined;
  }
  return `${names[0]} dkk dan ${names.length - 1} Orang Lainnya`;
}

function getPerjadinNamingInfo() {
  const isKKP = ((document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP');
  const prefix = isKKP ? 'PERJADIN KKP' : 'PERJADIN';

  const tgl1 = document.getElementById('tglBerangkat')?.value;
  const tgl2 = document.getElementById('tglKembali')?.value;
  const tglKegiatan = formatTglKegiatan(tgl1, tgl2);

  const empIds = (typeof selectedEmpIds !== 'undefined' && selectedEmpIds) ? [...selectedEmpIds] : [];
  let grandTotal = 0;
  empIds.forEach(id => {
    const emp = (typeof employees !== 'undefined' && Array.isArray(employees)) ? employees.find(e => e.id === id) : null;
    if (emp && typeof hitungBiaya === 'function') {
      grandTotal += (hitungBiaya(emp).total || 0);
    }
  });
  const nominalStr = (typeof rp === 'function') ? rp(grandTotal) : `Rp ${grandTotal}`;
  const pelakuStr = getNamaPelakuPerjadin(empIds);

  const kotaTeks = (document.getElementById('kotaTujuan')?.value || '').trim();
  const provRaw = (document.getElementById('provinsiTujuan')?.value || '').trim();
  const provTeks = getProvinsiDisplayName(provRaw);
  const lokasi = (kotaTeks || provTeks || 'DINAS').toUpperCase();

  // Format Excel: PERJADIN/PERJADIN KKP_tanggal kegiatan_Nominal_nama pelaku perjadin
  const rawExcelBase = `${prefix}_${tglKegiatan}_${nominalStr}_${pelakuStr}`;
  const safeExcelBase = rawExcelBase.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
  const excelFileName = `${safeExcelBase}.xlsx`;

  // Folder: PERJADIN "tgl kegiatan" LOKASI
  const rawFolder = `PERJADIN ${tglKegiatan} ${lokasi}`;
  const safeFolderName = rawFolder.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    isKKP,
    prefix,
    tglKegiatan,
    nominalStr,
    pelakuStr,
    lokasi,
    excelFileName,
    folderName: safeFolderName,
    grandTotal,
    empIds
  };
}


