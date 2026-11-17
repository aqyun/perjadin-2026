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

function parseNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^\d]/g, '');
  return cleaned ? Number(cleaned) : 0;
}

function formatTgl(str) {
  if (!str) return '-';
  const d = new Date(str);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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

