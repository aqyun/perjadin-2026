// =====================================================================
// MODE TAMPILAN (terang / gelap / otomatis)
// =====================================================================
const THEME_STORAGE_KEY = 'perjadin-theme';
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');

function getThemeMode() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return ['light', 'dark', 'auto'].includes(saved) ? saved : 'auto';
}

function applyThemeMode(mode) {
  const dark = mode === 'dark' || (mode === 'auto' && themeMedia.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

function markThemeButtons(mode) {
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeMode === mode);
  });
}

function setThemeMode(mode) {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyThemeMode(mode);
  markThemeButtons(mode);
}

function initTheme() {
  const mode = getThemeMode();
  applyThemeMode(mode);
  markThemeButtons(mode);
  const onChange = () => { if (getThemeMode() === 'auto') applyThemeMode('auto'); };
  if (themeMedia.addEventListener) themeMedia.addEventListener('change', onChange);
  else themeMedia.addListener(onChange);
}

initTheme();

// =====================================================================
// DATA PEGAWAI (dari sheet KARYAWAN)
// =====================================================================
const employees = [
  {id: 0,nama:'Yenita Sari, S.H., M.H.',nip:'197905172002122002',pangkat:'Pembina Tingkat 1',gol:'IV/b',jabatan:'Kepala Biro Komunikasi Publik'},
  {id: 1,nama:'Arif Fajar Alfalaqy, S.Sos., M.Sc.',nip:'198305152008011009',pangkat:'Pembina',gol:'IV/a',jabatan:'Kabag. Pengelolaan Dokumentasi dan Hubungan Media'},
  {id: 2,nama:'Rendhi Mirad, S.Sos., M.S.E.',nip:'198205212006041002',pangkat:'Pembina',gol:'IV/a',jabatan:'Kabag. Pelayanan Publik dan Publikasi'},
  {id: 3,nama:'Dwi Handoko, S.Kom., M.Si., M.MT.',nip:'198811112010121002',pangkat:'Penata Tingkat I',gol:'III/d',jabatan:'Kepala Subbagian Tata Usaha'},
  {id: 4,nama:'Ristyan Mega Putra, S.Sos, M.Si.',nip:'198310142010121001',pangkat:'Penata Tingkat I',gol:'III/d',jabatan:'Pranata Humas Ahli Muda'},
  {id: 5,nama:'Ahmad Jayadi, S.Hum, M.T.',nip:'198702182010121003',pangkat:'Penata Tingkat I',gol:'III/d',jabatan:'Kepala Subbagian Tata Usaha'},
  {id: 6,nama:'Erwin Alimudin, S.Ds.',nip:'199305222019031006',pangkat:'Penata Muda Tingkat I',gol:'III/b',jabatan:'Pranata Humas Ahli Pertama'},
  { id: 7, nama: 'Bio Bhirawan, S.T., M.Si.', nip: '199209052019031004', pangkat: 'Penata Muda Tingkat I', gol: 'III/b', jabatan: 'Analis Perumahan' },
  {id: 8,nama:'Ishaq Abdullah, S.Ars.',nip:'199505122020121002',pangkat:'Penata Muda Tingkat I',gol:'III/b',jabatan:'Penata Kelola Perumahan Ahli Pertama'},
  {id: 9,nama:'Annisa Zetta Afiatni, S.I.Kom.',nip:'199401312023212027',pangkat:'-',gol:'IX',jabatan:'Pranata Humas Ahli Pertama'},
  {id: 10,nama:'Gita Nawangsari Estika Putri, S.Kom.I.',nip:'199401042023212032',pangkat:'-',gol:'IX',jabatan:'Pranata Humas Ahli Pertama'},
  {id: 11,nama:'Nur Rahma Aziza, S.I.Kom.',nip:'199901012023212005',pangkat:'-',gol:'IX',jabatan:'Pranata Humas Ahli Pertama'},
  {id: 12,nama:'Bambang Ismanto, A.Md.',nip:'199505252024211005',pangkat:'-',gol:'VII',jabatan:'Pranata Komputer Terampil'},
  {id: 13,nama:'Lisa Rahmawati Dewi Syam, S.H., M.H.',nip:'199009162025212062',pangkat:'-',gol:'IX',jabatan:'Arsiparis Ahli Pertama'},
  {id: 14,nama:'Refly Saprilaturyandi, S.Kom.',nip:'198504232025211049',pangkat:'-',gol:'IX',jabatan:'Pranata Komputer Ahli Pertama'},
  {id: 15,nama:'Rudiyana Harris, S.E.',nip:'198912202025211044',pangkat:'-',gol:'IX',jabatan:'Analis Kebijakan Ahli Pertama'},
  {id: 16,nama:'Fitrah Faizal, S.T.',nip:'198802242025211047',pangkat:'-',gol:'IX',jabatan:'Penata Layanan Operasional'},
  {id: 17,nama:'Wahyu Ady Sulistyo, S.T.',nip:'198407022025211043',pangkat:'-',gol:'IX',jabatan:'Penata Layanan Operasional'},
  {id: 18,nama:'Aisyah Putri Robbani, S.Ars',nip:'199706262025062015',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Bangunan Gedung dan Kawasan Permukiman Ahli Pertama'},
  {id: 19,nama:'Akhdiyat Dewa Galenica, S.I.Kom.',nip:'200212262025061003',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 20,nama:'Ameta Dian Fachirah Tarigan, S.I.Kom',nip:'199906202025062017',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 21,nama:'Aqyun Rista Maulidin, S.Tr.Kom.',nip:'200205302025062010',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Komputer Ahli Pertama'},
  {id: 22,nama:'Ardilamita Febrimasya, S.K.Pm.',nip:'200203122025062008',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 23,nama:'Atini Rahmatika Fauzi Murod, S.K.Pm.',nip:'199903172025062014',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 24,nama:'Avifah Setiyani, S.I.Kom.',nip:'199909222025062015',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 25,nama:'Deshinta Firstiana Sari, S.I.Kom.',nip:'198912152025062003',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 26,nama:'Digna Margareth Rismauli, S.I.Kom.',nip:'199310142025062008',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 27,nama:'Dimas Novel Calvindoro Damarjati, S.I.Kom.',nip:'199906182025061012',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 28,nama:'Emanuel Van Fernando Sibarani, S.I.Kom',nip:'199611092025061011',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 29,nama:'Fatmawati, S.T.',nip:'200002182025062015',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Perumahan Ahli Pertama'},
  {id: 30,nama:'Gayatri Puspita Sari, S.I.Kom',nip:'200001172025062013',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 31,nama:'Indar Amila Azizah, S.I.Kom',nip:'200006052025062023',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 32,nama:'Kinanti Juli Astuti, S.I.Kom.',nip:'200107292025062013',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 33,nama:'Leonardo Abet Zebe, S.Ars',nip:'200206092025061006',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Perumahan Ahli Pertama'},
  {id: 34,nama:'Madya Puspa Faradina, B.A.',nip:'199711182025062011',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 35,nama:'Maharani Bilqist Caroline, S.T.',nip:'200009262025062013',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Bangunan Gedung dan Kawasan Permukiman Ahli Pertama'},
  {id: 36,nama:'Melly Nur Fatimah, S.T.',nip:'199805282025062014',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Perumahan Ahli Pertama'},
  {id: 37,nama:'Michael Prilas Simanjuntak, S.T.',nip:'200204112025061006',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Perumahan Ahli Pertama'},
  {id: 38,nama:'Muhammad Ihsan Yudanto, S.T.',nip:'199802252025061010',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Perumahan Ahli Pertama'},
  {id: 39,nama:'Muhammad Ilham Bintang, S.K.Pm.',nip:'200010192025061007',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 40,nama:'Nabela Aristya Fajrin, S.Akt.',nip:'200003022025062014',pangkat:'Penata Muda',gol:'III/a',jabatan:'Analis Pengelolaan Keuangan APBN Ahli Pertama'},
  {id: 41,nama:'Novia Dwi Purwanti, S.K.Pm.',nip:'200111112025062016',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 42,nama:'Raden Bintang Agna Fadhila, S.I.Kom.',nip:'200111022025061007',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 43,nama:'Ratu Budhi Sejati, S.I.Kom.',nip:'199610232025062013',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 44,nama:'Ridho Halasan Sinaga, S.I.Kom.',nip:'200108122025061008',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 45,nama:'Rifky Aji Rahmandita, S.I.Kom',nip:'199902242025061006',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 46,nama:'Risyanti Ananti Putri, S.IP',nip:'199906192025062020',pangkat:'Penata Muda',gol:'III/a',jabatan:'Arsiparis Ahli Pertama'},
  {id: 47,nama:'Sahrul Hari Nugroho, S.T',nip:'199906032025061009',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Bangunan Gedung dan Kawasan Permukiman'},
  {id: 48,nama:'Shafa Kamila, S.I.Kom.',nip:'200111162025062019',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 49,nama:'Utari Liani Narulita, S.I.Kom.',nip:'200104142025062021',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 50,nama:'Vania Adita Siagian, S.T.',nip:'199910242025062017',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Perumahan Ahli Pertama'},
  {id: 51,nama:'Vera Siringo Ringo, S.Ikom.',nip:'199602052025062013',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 52,nama:'Widya Cantika Sisnawar, S.I.Kom.',nip:'200101192025062013',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 53,nama:'Yogi Andre Yonatan Pakpahan, S.P.W.K',nip:'199511272025061006',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Bangunan Gedung dan Kawasan Permukiman Ahli Pertama'},
  {id: 54,nama:'Yovita Rimbawati, S.I.Kom.',nip:'199107312025062006',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 55,nama:'Zahra Puspa Noviandini, S.Ars.',nip:'199711012025062009',pangkat:'Penata Muda',gol:'III/a',jabatan:'Penata Kelola Perumahan Ahli Pertama'},
  {id: 56,nama:'Zhafira Alya Miftach, S.I.Kom',nip:'199910012025062019',pangkat:'Penata Muda',gol:'III/a',jabatan:'Pranata Hubungan Masyarakat Ahli Pertama'},
  {id: 57,nama:'Adolfus Manuel, S.Ak.',nip:'-',pangkat:'-',gol:'-',jabatan:'Staf Biro Umum'},
];

// =====================================================================
// DATA SBM (dari sheet Master - PMK)
// Fields: uh=uang harian 100%, jktPP=transport JKT PP, taxi=taxi lokal,
//         h4=hotel Eselon III/Gol IV, h3=hotel Eselon IV/Gol III,
//         h2=hotel Eselon II, h1=hotel Eselon I, tiket=tiket pesawat PP
// =====================================================================
const sbmData = [
  {id:1,provinsi:'NANGROE ACEH DARUSSALAM',ibukota:'Banda Aceh',uh:360000,jktPP:512000,taxi:254000,dpr:766000,h1:4774000,h2:3526000,h4:1578000,h3:770000,tiket:4492000},
  {id:2,provinsi:'SUMATERA UTARA',ibukota:'Medan',uh:370000,jktPP:512000,taxi:616000,dpr:1128000,h1:4960000,h2:2195000,h4:1188000,h3:699000,tiket:3808000},
  {id:3,provinsi:'RIAU',ibukota:'Pekanbaru',uh:370000,jktPP:512000,taxi:202000,dpr:714000,h1:3820000,h2:3119000,h4:1650000,h3:852000,tiket:3016000},
  {id:4,provinsi:'KEPULAUAN RIAU',ibukota:'Tanjung Pinang',uh:370000,jktPP:512000,taxi:330000,dpr:842000,h1:5772000,h2:2318000,h4:1297000,h3:792000,tiket:0},
  {id:5,provinsi:'JAMBI',ibukota:'Jambi',uh:370000,jktPP:512000,taxi:294000,dpr:806000,h1:5004000,h2:4102000,h4:1225000,h3:580000,tiket:2460000},
  {id:6,provinsi:'SUMATERA BARAT',ibukota:'Padang',uh:380000,jktPP:512000,taxi:380000,dpr:892000,h1:5236000,h2:3332000,h4:1353000,h3:701000,tiket:2952000},
  {id:7,provinsi:'SUMATERA SELATAN',ibukota:'Palembang',uh:380000,jktPP:512000,taxi:358000,dpr:870000,h1:6298000,h2:3083000,h4:1966000,h3:861000,tiket:2268000},
  {id:8,provinsi:'LAMPUNG',ibukota:'Bandar Lampung',uh:380000,jktPP:512000,taxi:336000,dpr:848000,h1:4491000,h2:2488000,h4:1539000,h3:580000,tiket:1583000},
  {id:9,provinsi:'BENGKULU',ibukota:'Bengkulu',uh:380000,jktPP:512000,taxi:218000,dpr:730000,h1:2140000,h2:1628000,h4:1546000,h3:692000,tiket:2621000},
  {id:10,provinsi:'BANGKA BELITUNG',ibukota:'Pangkal Pinang',uh:410000,jktPP:512000,taxi:194000,dpr:706000,h1:4134000,h2:2838000,h4:1957000,h3:676000,tiket:2139000},
  {id:11,provinsi:'BANTEN',ibukota:'Serang',uh:370000,jktPP:0,taxi:536000,dpr:536000,h1:5725000,h2:2373000,h4:1301000,h3:724000,tiket:0},
  {id:12,provinsi:'JAWA BARAT',ibukota:'Bandung',uh:430000,jktPP:512000,taxi:400000,dpr:912000,h1:5812000,h2:2755000,h4:1298000,h3:686000,tiket:0},
  {id:13,provinsi:'DKI JAKARTA',ibukota:'Jakarta',uh:530000,jktPP:0,taxi:512000,dpr:512000,h1:8720000,h2:2063000,h4:992000,h3:730000,tiket:0},
  {id:14,provinsi:'JAWA TENGAH',ibukota:'Semarang',uh:370000,jktPP:512000,taxi:216000,dpr:728000,h1:5728000,h2:1998000,h4:1201000,h3:810000,tiket:2182000},
  {id:15,provinsi:'D.I. YOGYAKARTA',ibukota:'Yogyakarta',uh:420000,jktPP:512000,taxi:534000,dpr:1046000,h1:5017000,h2:2695000,h4:1495000,h3:845000,tiket:2268000},
  {id:16,provinsi:'JAWA TIMUR',ibukota:'Surabaya',uh:410000,jktPP:512000,taxi:466000,dpr:978000,h1:4449000,h2:2007000,h4:1153000,h3:814000,tiket:2674000},
  {id:17,provinsi:'BALI',ibukota:'Denpasar',uh:480000,jktPP:512000,taxi:454000,dpr:966000,h1:6848000,h2:2433000,h4:1685000,h3:1138000,tiket:3262000},
  {id:18,provinsi:'NUSA TENGGARA BARAT',ibukota:'Mataram',uh:440000,jktPP:512000,taxi:462000,dpr:974000,h1:4375000,h2:2648000,h4:1418000,h3:907000,tiket:3230000},
  {id:19,provinsi:'NUSA TENGGARA TIMUR',ibukota:'Kupang',uh:430000,jktPP:512000,taxi:232000,dpr:744000,h1:3750000,h2:2133000,h4:1355000,h3:688000,tiket:5081000},
  {id:20,provinsi:'KALIMANTAN BARAT',ibukota:'Pontianak',uh:380000,jktPP:512000,taxi:342000,dpr:854000,h1:2654000,h2:1923000,h4:1125000,h3:538000,tiket:2781000},
  {id:21,provinsi:'KALIMANTAN TENGAH',ibukota:'Palangkaraya',uh:360000,jktPP:512000,taxi:268000,dpr:780000,h1:4901000,h2:3391000,h4:1160000,h3:659000,tiket:2984000},
  {id:22,provinsi:'KALIMANTAN SELATAN',ibukota:'Banjarmasin',uh:380000,jktPP:512000,taxi:360000,dpr:872000,h1:4797000,h2:3316000,h4:1500000,h3:697000,tiket:2995000},
  {id:23,provinsi:'KALIMANTAN TIMUR',ibukota:'Samarinda',uh:430000,jktPP:512000,taxi:1066000,dpr:1578000,h1:4000000,h2:2188000,h4:1507000,h3:804000,tiket:3797000},
  {id:24,provinsi:'KALIMANTAN UTARA',ibukota:'Tanjung Selor',uh:430000,jktPP:512000,taxi:436000,dpr:948000,h1:4000000,h2:2735000,h4:1507000,h3:904000,tiket:4057000},
  {id:25,provinsi:'SULAWESI UTARA',ibukota:'Manado',uh:370000,jktPP:512000,taxi:276000,dpr:788000,h1:4919000,h2:2290000,h4:1270000,h3:978000,tiket:5102000},
  {id:26,provinsi:'GORONTALO',ibukota:'Gorontalo',uh:370000,jktPP:512000,taxi:530000,dpr:1042000,h1:4168000,h2:3107000,h4:1606000,h3:955000,tiket:4824000},
  {id:27,provinsi:'SULAWESI BARAT',ibukota:'Mamuju',uh:410000,jktPP:512000,taxi:626000,dpr:1138000,h1:4076000,h2:3098000,h4:1344000,h3:704000,tiket:4867000},
  {id:28,provinsi:'SULAWESI SELATAN',ibukota:'Makassar',uh:430000,jktPP:512000,taxi:374000,dpr:886000,h1:4820000,h2:1938000,h4:1423000,h3:745000,tiket:3829000},
  {id:29,provinsi:'SULAWESI TENGAH',ibukota:'Palu',uh:370000,jktPP:512000,taxi:330000,dpr:842000,h1:2309000,h2:2027000,h4:1679000,h3:951000,tiket:5113000},
  {id:30,provinsi:'SULAWESI TENGGARA',ibukota:'Kendari',uh:380000,jktPP:512000,taxi:342000,dpr:854000,h1:3088800,h2:2574000,h4:1297000,h3:786000,tiket:4182000},
  {id:31,provinsi:'MALUKU',ibukota:'Ambon',uh:380000,jktPP:512000,taxi:576000,dpr:1088000,h1:3467000,h2:3240000,h4:1059000,h3:667000,tiket:7081000},
  {id:32,provinsi:'MALUKU UTARA',ibukota:'Sofifi',uh:430000,jktPP:512000,taxi:430000,dpr:942000,h1:4612000,h2:3843000,h4:1160000,h3:654000,tiket:0},
  {id:33,provinsi:'PAPUA',ibukota:'Jayapura',uh:580000,jktPP:512000,taxi:1026000,dpr:1538000,h1:3872000,h2:3318000,h4:2521000,h3:1038000,tiket:8193000},
  {id:34,provinsi:'PAPUA BARAT',ibukota:'Manokwari',uh:480000,jktPP:512000,taxi:472000,dpr:984000,h1:3872000,h2:3341000,h4:2056000,h3:967000,tiket:10824000},
  {id:35,provinsi:'PAPUA BARAT DAYA',ibukota:'-',uh:480000,jktPP:0,taxi:0,dpr:0,h1:3872000,h2:3341000,h4:2056000,h3:967000,tiket:0},
  {id:36,provinsi:'PAPUA TENGAH',ibukota:'-',uh:580000,jktPP:0,taxi:0,dpr:0,h1:3859000,h2:3318000,h4:2521000,h3:1038000,tiket:0},
  {id:37,provinsi:'PAPUA SELATAN',ibukota:'-',uh:580000,jktPP:0,taxi:0,dpr:0,h1:5673000,h2:4877000,h4:3706000,h3:1526000,tiket:0},
  {id:38,provinsi:'PAPUA PEGUNUNGAN',ibukota:'-',uh:580000,jktPP:0,taxi:0,dpr:0,h1:5711000,h2:4911000,h4:3731000,h3:1536000,tiket:0},
];

// =====================================================================
// STATE
// =====================================================================
let selectedEmpIds = new Set();
let currentFilter = '';
let currentRateProvinceId = '';
let dprAutoCheckedForDki = false;
let spdPerEmployee = {};
let provinceFoodRates = {};
try {
  provinceFoodRates = JSON.parse(localStorage.getItem('provinceFoodRates') || '{}');
} catch (error) {
  provinceFoodRates = {};
}

// =====================================================================
// INIT
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Populate provinsi dropdown
  const sel = document.getElementById('provinsiTujuan');
  sbmData.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = formatProvinsi(s.provinsi);
    sel.appendChild(opt);
  });
  renderEmployeeList();
  const datePill = document.getElementById('datePill');
  if (datePill) {
    datePill.textContent = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  }
  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tglST').value = today;
  document.getElementById('tglSPD').value = today;
  document.getElementById('tglBerangkat').value = today;
  document.getElementById('tglKembali').value = today;
  hitungLama();
  updateSbmWarnings();
  initWelcomeModal();
});

// =====================================================================
// TABS
// =====================================================================
const tabMeta = {
  input: ['Input Perjalanan', 'Formulir'],
  nominatif: ['Daftar Nominatif', 'Rekapitulasi'],
  'rekap-kuitansi': ['Rekap Kuitansi', 'Rekapitulasi'],
  'kuitansi-perorangan': ['Kuitansi Perorangan', 'Dokumen'],
  'sppd-perorangan': ['SPPD Perorangan', 'Dokumen'],
  'lembar-kendali': ['Lembar Kendali', 'Rekapitulasi'],
  'rekap-rincian': ['Rekap Rincian', 'Rekapitulasi'],
  'rekap-spt': ['Rekap Surat Tugas', 'Rekapitulasi'],
  rincian: ['Rincian per Orang', 'Dokumen'],
  dpr: ['DPR Perorangan', 'Dokumen'],
  pengaturan: ['Pengaturan', 'Sistem']
};

function showTab(name) {
  const panel = document.getElementById('tab-' + name);
  if (!panel) return;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  panel.classList.add('active');
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  const meta = tabMeta[name] || ['Perjalanan Dinas', 'Menu'];
  const titleEl = document.getElementById('pageTitle');
  const eyebrowEl = document.getElementById('pageEyebrow');
  if (titleEl) titleEl.textContent = meta[0];
  if (eyebrowEl) eyebrowEl.textContent = meta[1];
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'rincian') populateRincianSelect();
  if (name === 'dpr') populateDPRSelect();
  if (name === 'nominatif') renderNominatif();
  if (name === 'rekap-kuitansi') renderRekapKuitansi();
  if (name === 'kuitansi-perorangan') populateKuitansiPeroranganSelect();
  if (name === 'sppd-perorangan') populateSPPDSelect();
  if (name === 'lembar-kendali') renderLembarKendali();
  if (name === 'rekap-rincian') renderRekapRincian();
  if (name === 'rekap-spt') renderRekapSPT();
}

function toggleSidebar() {
  document.body.classList.toggle('sidebar-open');
  const btn = document.querySelector('.burger');
  if (btn) btn.setAttribute('aria-expanded', document.body.classList.contains('sidebar-open') ? 'true' : 'false');
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  const btn = document.querySelector('.burger');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

// =====================================================================
// JENDELA / POPUP SELAMAT DATANG (WELCOME MODAL)
// =====================================================================
function openWelcome() {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeWelcome() {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  const checkbox = document.getElementById('welcomeDontShow');
  if (checkbox && checkbox.checked) {
    try {
      localStorage.setItem('perdinku_welcome_dismissed', '1');
    } catch (e) {}
  }
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function handleWelcomeBackdrop(event) {
  if (event.target && event.target.id === 'welcomeOverlay') {
    closeWelcome();
  }
}

function initWelcomeModal() {
  let isDismissed = false;
  try {
    isDismissed = localStorage.getItem('perdinku_welcome_dismissed') === '1';
  } catch (e) {}

  if (!isDismissed) {
    setTimeout(() => {
      openWelcome();
    }, 450);
  }
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeSidebar();
    closeWelcome();
  }
});

document.addEventListener('input', () => { updateSbmWarnings(); refreshHotelSummaries(); });
document.addEventListener('change', () => { updateSbmWarnings(); refreshHotelSummaries(); });

// =====================================================================
// EMPLOYEE LIST
// =====================================================================
function getInitials(nama) {
  return nama.replace(/[^A-Za-z\s]/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

function renderEmployeeList() {
  const box = document.getElementById('empListBox');
  const q = document.getElementById('empSearch').value.toLowerCase();
  const filtered = employees.filter(e => e.nama.toLowerCase().includes(q) || e.jabatan.toLowerCase().includes(q));
  box.innerHTML = filtered.map(e => `
    <div class="emp-item ${selectedEmpIds.has(e.id)?'selected':''}" onclick="toggleEmployee(${e.id})">
      <input type="checkbox" ${selectedEmpIds.has(e.id)?'checked':''} onclick="event.stopPropagation();toggleEmployee(${e.id})">
      <span class="emp-avatar">${getInitials(e.nama)}</span>
      <div class="emp-text">
        <div class="emp-name">${e.nama}</div>
        <div class="emp-detail">Gol. ${e.gol}<span class="sep">·</span>${e.jabatan}<span class="sep">·</span>NIP: ${e.nip}</div>
      </div>
    </div>
  `).join('') || '<div style="padding:16px;text-align:center;color:#9aabc0;font-size:13px">Tidak ada hasil</div>';
}

function filterEmployees() { renderEmployeeList(); }

function toggleEmployee(id) {
  if (selectedEmpIds.has(id)) { selectedEmpIds.delete(id); empTripSegments.delete(id); }
  else selectedEmpIds.add(id);
  renderEmployeeList();
  renderSelectedTags();
  renderTripDates();
  refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();
}

function renderSelectedTags() {
  const box = document.getElementById('selectedBox');
  const count = document.getElementById('countSelected');
  if (selectedEmpIds.size === 0) {
    box.innerHTML = '<span class="empty-note">Belum ada pegawai dipilih</span>';
    count.textContent = '0';
    return;
  }
  count.textContent = selectedEmpIds.size;
  box.innerHTML = [...selectedEmpIds].map(id => {
    const e = employees.find(x => x.id === id);
    return `<span class="emp-tag">${e.nama.split(',')[0]} <span class="rm" onclick="toggleEmployee(${id})">×</span></span>`;
  }).join('');
}

function renderTripDates() {
  const block = document.getElementById('tripDatesBlock');
  const list = document.getElementById('tripDatesList');
  if (!block || !list) return;
  if (selectedEmpIds.size === 0) { block.style.display = 'none'; list.innerHTML = ''; return; }
  block.style.display = '';
  const g1 = document.getElementById('tglBerangkat').value;
  const g2 = document.getElementById('tglKembali').value;
  const globalText = g1 && g2 ? `${formatTgl(g1)} – ${formatTgl(g2)}` : 'belum diisi';
  list.innerHTML = [...selectedEmpIds].map(id => {
    const e = employees.find(x => x.id === id);
    if (!e) return '';
    const name = e.nama.split(',')[0];
    const segs = empTripSegments.get(id) || [];
    if (!segs.length) {
      return `<div class="trip-row">
        <div class="trip-name" title="${e.nama}">${name}</div>
        <div class="trip-follow">Ikut tanggal perjalanan (${globalText})</div>
        <button type="button" class="trip-btn" onclick="setEmpDates(${id})">Atur tanggal</button>
      </div>`;
    }
    const segHtml = segs.map((s, i) => `
      <span class="trip-seg">
        <input type="date" value="${s.start}" onchange="updateEmpSegment(${id},${i},'start',this.value)">
        <span class="trip-sep">s.d.</span>
        <input type="date" value="${s.end}" onchange="updateEmpSegment(${id},${i},'end',this.value)">
        <button type="button" class="trip-seg-rm" title="Hapus tanggal" onclick="removeEmpSegment(${id},${i})">×</button>
      </span>`).join('');
    return `<div class="trip-row">
      <div class="trip-name" title="${e.nama}">${name}</div>
      <div class="trip-segs">${segHtml}</div>
      <div class="trip-actions">
        <button type="button" class="trip-btn" onclick="addEmpSegment(${id})">+ Tanggal</button>
        <button type="button" class="trip-btn trip-btn-reset" onclick="resetEmpDates(${id})">Ikut global</button>
      </div>
    </div>`;
  }).join('');
}

function setEmpDates(id) {
  const g1 = document.getElementById('tglBerangkat').value;
  const g2 = document.getElementById('tglKembali').value || g1;
  if (!g1) return;
  empTripSegments.set(id, [{ start: g1, end: g2 }]);
  renderTripDates();
}

function addEmpSegment(id) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.push({ start: '', end: '' });
  empTripSegments.set(id, segs);
  renderTripDates();
}

function updateEmpSegment(id, index, field, value) {
  const segs = [...(empTripSegments.get(id) || [])];
  if (!segs[index]) return;
  segs[index][field] = value;
  if (field === 'start' && (!segs[index].end || segs[index].end < value)) segs[index].end = value;
  if (field === 'end' && segs[index].start && value && value < segs[index].start) segs[index].start = value;
  empTripSegments.set(id, segs);
  renderTripDates();
}

function removeEmpSegment(id, index) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.splice(index, 1);
  if (segs.length) empTripSegments.set(id, segs);
  else empTripSegments.delete(id);
  renderTripDates();
}

function resetEmpDates(id) {
  empTripSegments.delete(id);
  renderTripDates();
}

function clearAll() {
  selectedEmpIds.clear();
  empTripSegments.clear();
  renderEmployeeList();
  renderSelectedTags();
  renderTripDates();
  refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();
}

// =====================================================================
// SBM & LAMA TUGAS
// =====================================================================
function getSBM() {
  const id = parseInt(document.getElementById('provinsiTujuan').value);
  return sbmData.find(s => s.id === id) || null;
}

const PROVINSI_AKRONIM = new Set(['DKI', 'D.I.']);

function formatProvinsi(nama) {
  return String(nama || '')
    .split(/\s+/)
    .map(word => PROVINSI_AKRONIM.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function kotaDenganProvinsi(kota) {
  const text = String(kota || '').trim();
  const sbm = getSBM();
  if (!text || !sbm) return text;
  const provinsi = formatProvinsi(sbm.provinsi);
  const lower = text.toLowerCase();
  if (lower.includes(sbm.provinsi.toLowerCase()) || lower.includes(provinsi.toLowerCase())) return text;
  return `${text}, ${provinsi}`;
}

function changeProvince() {
  saveProvinceFoodRates();
  currentRateProvinceId = document.getElementById('provinsiTujuan').value;
  const rates = provinceFoodRates[currentRateProvinceId] || {};
  document.getElementById('tarifMakan').value = rates.makan || 0;
  document.getElementById('tarifSnack').value = rates.snack || 0;
  document.getElementById('dprManual').value = '';
  const cbDPR = document.getElementById('cbDPR');
  if (getSBM()?.provinsi === 'DKI JAKARTA' && !cbDPR.checked) {
    cbDPR.checked = true;
    dprAutoCheckedForDki = true;
  } else if (getSBM()?.provinsi !== 'DKI JAKARTA' && dprAutoCheckedForDki) {
    cbDPR.checked = false;
    dprAutoCheckedForDki = false;
  }
  updateDPRInput();
  updateSBMPreview();
  updateSbmWarnings();
}

function markDPRManual() {
  dprAutoCheckedForDki = false;
}

function updateDPRInput() {
  const sbm = getSBM();
  const isDkiJakarta = sbm?.provinsi === 'DKI JAKARTA';
  const isDprChecked = document.getElementById('cbDPR').checked;
  document.getElementById('dprManualField').style.display = isDprChecked && sbm && !isDkiJakarta ? 'block' : 'none';
}

function saveProvinceFoodRates() {
  if (!currentRateProvinceId) return;
  provinceFoodRates[currentRateProvinceId] = {
    makan: Math.max(0, Number(document.getElementById('tarifMakan').value) || 0),
    snack: Math.max(0, Number(document.getElementById('tarifSnack').value) || 0)
  };
  localStorage.setItem('provinceFoodRates', JSON.stringify(provinceFoodRates));
}

function toggleKonsumsiFields() {
  document.getElementById('konsumsiFields').style.display =
    document.getElementById('jenisKegiatan').value === 'rapat' ? 'grid' : 'none';
}

function toggleHotelFields() {
  const checked = document.getElementById('cbHotel').checked;
  document.getElementById('hotelFields').style.display = checked ? 'grid' : 'none';
  if (checked && !document.querySelectorAll('#hotelList .hotel-row').length) {
    addHotelRow(getDays().nights || 1);
  }
}

function addHotelRow(nights = 1) {
  const row = document.createElement('div');
  row.className = 'hotel-row';
  row.innerHTML = `
    <label class="hotel-field"><span>Nama hotel (opsional)</span><input type="text" class="hotel-name" placeholder="Contoh: Hotel Nusa Dua"></label>
    <label class="hotel-field hotel-field-nights"><span>Malam</span><input type="number" class="hotel-nights" min="0" step="1" value="${nights}"></label>
    <label class="hotel-field"><span>Harga per malam (Rp)</span><input type="number" class="hotel-price" min="0" step="1000" placeholder="Isi harga manual"></label>
    <button class="btn btn-warn btn-sm" type="button" onclick="removeHotelRow(this)">Hapus</button>
    <div class="hotel-guests"></div>
    <div class="hotel-summary"></div>
  `;
  document.getElementById('hotelList').appendChild(row);
  renderHotelGuests(row);
  updateSbmWarnings();
}

function renderHotelGuests(row) {
  const box = row.querySelector('.hotel-guests');
  if (!box) return;
  if (selectedEmpIds.size === 0) {
    box.innerHTML = '<div class="hotel-guests-empty">Pilih pegawai dulu untuk menentukan yang dibebani biaya kamar.</div>';
    return;
  }
  const existing = [...row.querySelectorAll('.hotel-guest-check')];
  const knownIds = existing.map(cb => Number(cb.dataset.employeeId));
  const checkedIds = existing.filter(cb => cb.checked).map(cb => Number(cb.dataset.employeeId));
  const selected = [...selectedEmpIds].sort((a, b) => a - b);
  box.innerHTML = `
    <span class="hotel-guests-title">Pegawai yang menanggung kamar — biaya kamar penuh per pegawai</span>
    <div class="hotel-guest-list">
      ${selected.map(id => {
        const emp = employees.find(e => e.id === id);
        const isChecked = existing.length ? checkedIds.includes(id) || !knownIds.includes(id) : true;
        return `<label class="hotel-guest"><input type="checkbox" class="hotel-guest-check" data-employee-id="${id}" ${isChecked ? 'checked' : ''}><span>${emp.nama}</span></label>`;
      }).join('')}
    </div>
  `;
  updateHotelSummary(row);
}

function updateHotelSummary(row) {
  const el = row.querySelector('.hotel-summary');
  if (!el) return;
  const nights = Math.max(0, Number(row.querySelector('.hotel-nights').value) || 0);
  const price = Math.max(0, Number(row.querySelector('.hotel-price').value) || 0);
  const roomTotal = nights * price;
  if (roomTotal <= 0) {
    el.textContent = '';
    return;
  }
  const count = row.querySelectorAll('.hotel-guest-check:checked').length;
  el.textContent = count
    ? `Total kamar ${rp(roomTotal)} — ${rp(roomTotal)} per pegawai × ${count} pegawai = ${rp(roomTotal * count)}`
    : `Total kamar ${rp(roomTotal)} — belum ada pegawai dicentang, biaya belum masuk rincian.`;
}

function refreshHotelSummaries() {
  document.querySelectorAll('#hotelList .hotel-row').forEach(updateHotelSummary);
}

function refreshHotelGuests() {
  document.querySelectorAll('#hotelList .hotel-row').forEach(renderHotelGuests);
}

function removeHotelRow(button) {
  button.closest('.hotel-row').remove();
  updateSbmWarnings();
}

function getHotelEntries() {
  return [...document.querySelectorAll('#hotelList .hotel-row')].map(row => ({
    name: row.querySelector('.hotel-name').value.trim(),
    nights: Math.max(0, Number(row.querySelector('.hotel-nights').value) || 0),
    price: Math.max(0, Number(row.querySelector('.hotel-price').value) || 0),
    employeeIds: [...row.querySelectorAll('.hotel-guest-check:checked')].map(cb => Number(cb.dataset.employeeId))
  })).filter(item => item.name || item.price > 0);
}

const TRANSPORT_COST_RE = /\b(grab|grabcar|gojek|goride|gocar|grabbike|ojek|ojol|maxim|toll|tol|bensin|bbm|pertamax|pertalite|solar|parkir|taxi|taksi|angkot|transport)\b/i;
const TOLL_COST_RE = /\b(toll|tol)\b/i;
const TICKET_COST_RE = /\b(tiket|kereta|whoosh|pesawat|kapal|ferry|feri|speedboat)\b/i;
const TICKET_CATEGORY_RULES = [
  { re: /\b(pesawat|penerbangan|flight)\b/i, label: 'Tiket Pesawat Udara' },
  { re: /\bwhoosh\b/i, label: 'Tiket Whoosh' },
  { re: /\bkereta\b/i, label: 'Tiket Kereta Api' },
  { re: /\b(kapal|ferry|feri|speedboat)\b/i, label: 'Tiket Kapal' }
];

function getTicketCostLabel(name) {
  const rule = TICKET_CATEGORY_RULES.find(item => item.re.test(name));
  return rule ? rule.label : name;
}

function addCustomCost() {
  const row = document.createElement('div');
  row.className = 'custom-cost-row';
  row.dataset.kindAuto = '1';
  row.innerHTML = `
    <div class="form-group">
      <label>Nama biaya</label>
      <input type="text" class="custom-cost-name" placeholder="Contoh: Grab, Tol, atau Tiket kapal" oninput="detectCustomCostKind(this)">
      <div class="custom-kind" role="group" aria-label="Kelompok biaya">
        <button type="button" class="custom-kind-btn active" data-kind="other" aria-pressed="true" onclick="setCustomCostKind(this)">Biaya lain</button>
        <button type="button" class="custom-kind-btn" data-kind="tiket" aria-pressed="false" onclick="setCustomCostKind(this)">Tiket</button>
        <button type="button" class="custom-kind-btn" data-kind="transport" aria-pressed="false" onclick="setCustomCostKind(this)">Transport PP</button>
      </div>
      <div class="custom-route">
        <span class="custom-route-title">Keterangan rute (opsional)</span>
        <div class="custom-route-fields">
          <label class="custom-route-field custom-route-pickup"><span class="custom-route-label-pickup">Titik jemput</span><input type="text" class="custom-cost-pickup" placeholder="Contoh: Stasiun Gambir"></label>
          <label class="custom-route-field custom-route-dropoff"><span class="custom-route-label-dropoff">Titik antar</span><input type="text" class="custom-cost-dropoff" placeholder="Contoh: Rumah"></label>
        </div>
      </div>
    </div>
    <div class="custom-cost-assignees"></div>
    <button class="btn btn-warn btn-sm" type="button" onclick="removeCustomCostRow(this)">Hapus</button>
  `;
  document.getElementById('customCostList').appendChild(row);
  renderCustomCostAssignments(row);
}

function removeCustomCostRow(button) {
  button.closest('.custom-cost-row').remove();
  updateSbmWarnings();
}

function setCustomCostKind(button) {
  const row = button.closest('.custom-cost-row');
  row.dataset.kindAuto = '0';
  applyCustomCostKind(row, button.dataset.kind);
}

function detectCustomCostKind(input) {
  const row = input.closest('.custom-cost-row');
  if (row.dataset.kindAuto === '0') return;
  const value = input.value;
  const kind = TICKET_COST_RE.test(value) ? 'tiket' : TRANSPORT_COST_RE.test(value) ? 'transport' : 'other';
  applyCustomCostKind(row, kind);
}

function applyCustomCostKind(row, kind) {
  row.querySelectorAll('.custom-kind-btn').forEach(btn => {
    const active = btn.dataset.kind === kind;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  updateCustomCostRouteFields(row);
  updateSbmWarnings();
}

function updateCustomCostRouteFields(row) {
  const kind = row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other';
  const name = row.querySelector('.custom-cost-name')?.value || '';
  const isTicket = kind === 'tiket';
  const isToll = kind === 'transport' && TOLL_COST_RE.test(name);
  const pickupLabel = row.querySelector('.custom-route-label-pickup');
  const dropoffLabel = row.querySelector('.custom-route-label-dropoff');
  const pickupInput = row.querySelector('.custom-cost-pickup');
  const dropoffInput = row.querySelector('.custom-cost-dropoff');
  const dropoffField = row.querySelector('.custom-route-dropoff');
  const fields = row.querySelector('.custom-route-fields');

  if (isTicket) {
    pickupLabel.textContent = 'Keberangkatan';
    dropoffLabel.textContent = 'Kedatangan';
    pickupInput.placeholder = 'Contoh: Stasiun Gambir';
    dropoffInput.placeholder = 'Contoh: Bandung';
  } else if (isToll) {
    pickupLabel.textContent = 'Keterangan tol';
    pickupInput.placeholder = 'Contoh: Tol Cipularang';
  } else {
    pickupLabel.textContent = 'Titik jemput';
    dropoffLabel.textContent = 'Titik antar';
    pickupInput.placeholder = 'Contoh: Stasiun Gambir';
    dropoffInput.placeholder = 'Contoh: Rumah';
  }

  dropoffField.style.display = isToll ? 'none' : '';
  fields.classList.toggle('single', isToll);
}

function renderCustomCostAssignments(row) {
  const assignments = row.querySelector('.custom-cost-assignees');
  let currentAmounts = {};
  try {
    currentAmounts = JSON.parse(row.dataset.amounts || '{}');
  } catch (error) {
    currentAmounts = {};
  }
  row.querySelectorAll('.custom-cost-amount').forEach(input => {
    currentAmounts[input.dataset.employeeId] = input.value;
  });
  row.dataset.amounts = JSON.stringify(currentAmounts);

  if (selectedEmpIds.size === 0) {
    assignments.innerHTML = '<div class="custom-cost-empty">Pilih pegawai untuk mengatur nominal per orang.</div>';
    return;
  }

  assignments.innerHTML = [...selectedEmpIds].map(id => {
    const emp = employees.find(employee => employee.id === id);
    return `
      <label class="custom-cost-assignee">
        <span>${emp.nama}</span>
        <input type="number" class="custom-cost-amount" data-employee-id="${id}" min="0" step="1000" value="${currentAmounts[id] ?? 0}" oninput="updateCustomCostAmount(this)" aria-label="Biaya ${row.querySelector('.custom-cost-name').value || 'tambahan'} untuk ${emp.nama}">
      </label>
    `;
  }).join('');
}

function updateCustomCostAmount(input) {
  const row = input.closest('.custom-cost-row');
  let amounts = {};
  try {
    amounts = JSON.parse(row.dataset.amounts || '{}');
  } catch (error) {
    amounts = {};
  }
  amounts[input.dataset.employeeId] = input.value;
  row.dataset.amounts = JSON.stringify(amounts);
}

function refreshCustomCostAssignments() {
  document.querySelectorAll('.custom-cost-row').forEach(renderCustomCostAssignments);
}

function getCustomCosts() {
  return [...document.querySelectorAll('.custom-cost-row')].map(row => {
    const name = row.querySelector('.custom-cost-name').value.trim();
    const kind = row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other';
    const isToll = kind === 'transport' && TOLL_COST_RE.test(name);
    return {
      name,
      kind,
      pickup: row.querySelector('.custom-cost-pickup')?.value.trim() || '',
      dropoff: isToll ? '' : row.querySelector('.custom-cost-dropoff')?.value.trim() || '',
      amounts: Object.fromEntries([...row.querySelectorAll('.custom-cost-amount')].map(input => [
        input.dataset.employeeId,
        Math.max(0, Number(input.value) || 0)
      ]))
    };
  }).filter(item => item.name);
}

function updateSBMPreview() {
  const sbm = getSBM();
  const pv = document.getElementById('sbmPreview');
  if (!sbm) { pv.style.display = 'none'; return; }
  pv.style.display = 'block';
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';
  document.getElementById('sbm_uh').textContent = isDkiJakarta ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.uh);
  document.getElementById('sbm_h4').textContent = rp(sbm.h4);
  document.getElementById('sbm_h3').textContent = rp(sbm.h3);
  document.getElementById('sbm_jkt').textContent = sbm.jktPP ? rp(sbm.jktPP) : '(tidak ada/dalam kota)';
  document.getElementById('sbm_taxi').textContent = sbm.taxi ? rp(sbm.taxi) : '-';
  const manualDpr = Number(document.getElementById('dprManual').value) || 0;
  document.getElementById('sbm_dpr').textContent = isDkiJakarta ? `${rp(170000)} (otomatis)` : manualDpr ? rp(manualDpr) : '(isi manual)';
  document.getElementById('sbm_tiket').textContent = sbm.tiket ? rp(sbm.tiket) : '(tidak ada tiket pesawat)';
}

function escHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function updateSbmWarnings() {
  const box = document.getElementById('sbmWarnings');
  if (!box) return;
  const sbm = getSBM();
  const items = [];
  if (sbm) {
    const selected = [...selectedEmpIds].sort((a, b) => a - b);
    const cbHotel = document.getElementById('cbHotel').checked;
    const cbDPR = document.getElementById('cbDPR').checked;
    const cbTiket = document.getElementById('cbTiket').checked;
    const customCosts = getCustomCosts();
    const dprBase = cbDPR ? (sbm.provinsi === 'DKI JAKARTA' ? 170000 : Number(document.getElementById('dprManual').value) || 0) : 0;

    if (cbHotel) {
      getHotelEntries().forEach(item => {
        if (item.price <= 0) return;
        item.employeeIds.forEach(id => {
          const emp = employees.find(e => e.id === id);
          if (!emp) return;
          const rate = getHotelRate(sbm, emp.gol);
          if (rate && item.price > rate) {
            items.push({
              title: `Penginapan — ${item.name || 'Hotel'} (${emp.nama.split(',')[0]})`,
              text: `${rp(item.price)}/malam melebihi SBM Gol ${emp.gol} sebesar ${rp(item.price - rate)}. SBM ${rp(rate)}/malam.`
            });
          }
        });
      });
    }

    if (sbm.dpr > 0 && (dprBase > 0 || customCosts.some(item => item.kind === 'transport'))) {
      selected.forEach(id => {
        const emp = employees.find(e => e.id === id);
        const transportExtra = customCosts.reduce((total, item) => total + (item.kind === 'transport' ? item.amounts[String(id)] || 0 : 0), 0);
        const total = dprBase + transportExtra;
        if (total > sbm.dpr) {
          items.push({
            title: `Transport — ${emp.nama.split(',')[0]}`,
            text: `${rp(total)} melebihi SBM DPR ${rp(sbm.dpr)} sebesar ${rp(total - sbm.dpr)}.`
          });
        }
      });
    }

    if (sbm.tiket > 0) {
      const ticketGroups = new Map();
      if (cbTiket) ticketGroups.set('Tiket Pesawat Udara', []);
      customCosts.forEach(item => {
        if (item.kind !== 'tiket') return;
        const label = getTicketCostLabel(item.name);
        if (!ticketGroups.has(label)) ticketGroups.set(label, []);
        ticketGroups.get(label).push(item);
      });
      ticketGroups.forEach((list, label) => {
        selected.forEach(id => {
          const emp = employees.find(e => e.id === id);
          const ticketExtra = list.reduce((total, item) => total + (item.amounts[String(id)] || 0), 0);
          const total = ticketExtra + (label === 'Tiket Pesawat Udara' && cbTiket ? sbm.tiket : 0);
          if (total > sbm.tiket) {
            items.push({
              sptjm: true,
              title: `${label} — ${emp.nama.split(',')[0]}`,
              text: `${rp(total)} melebihi SBM sebesar ${rp(total - sbm.tiket)}.`
            });
          }
        });
      });
    }
  }

  if (!items.length) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }
  box.style.display = 'grid';
  box.innerHTML = items.map(item => `
    <div class="sbm-warning${item.sptjm ? ' is-sptjm' : ''}">
      <span class="sbm-warning-ico" aria-hidden="true">!</span>
      <div class="sbm-warning-body">
        <strong>${escHtml(item.title)}</strong>
        <span>${escHtml(item.text)}</span>
      </div>
      <span class="sbm-warning-badge${item.sptjm ? '' : ' is-soft'}">${item.sptjm ? 'Buatkan SPTJM' : 'Info SBM'}</span>
    </div>`).join('');
}

function syncTglSPD() {
  const tglST = document.getElementById('tglST').value;
  if (tglST) document.getElementById('tglSPD').value = tglST;
}

function hitungLama() {
  const tgl1 = document.getElementById('tglBerangkat').value;
  const tgl2 = document.getElementById('tglKembali').value;
  if (!tgl1 || !tgl2) {
    if (typeof renderTripDates === 'function') renderTripDates();
    return;
  }
  const d1 = new Date(tgl1), d2 = new Date(tgl2);
  const diffDays = Math.round((d2 - d1) / 86400000) + 1;
  document.getElementById('lamaTugas').value = diffDays <= 0 ? 'Tanggal tidak valid' : `${diffDays} Hari`;
  if (typeof renderTripDates === 'function') renderTripDates();
}

function getDays() {
  const tgl1 = document.getElementById('tglBerangkat').value;
  const tgl2 = document.getElementById('tglKembali').value;
  if (!tgl1 || !tgl2) return { days: 0, nights: 0 };
  const d1 = new Date(tgl1), d2 = new Date(tgl2);
  const days = Math.max(0, Math.round((d2 - d1) / 86400000) + 1);
  return { days, nights: Math.max(0, days - 1) };
}

const empTripSegments = new Map();

function daySpan(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
}

function getEmpSegments(empId) {
  const custom = empTripSegments.get(empId);
  if (custom && custom.length) {
    return custom.filter(s => s.start && s.end).map(s => ({
      start: s.start,
      end: s.end < s.start ? s.start : s.end
    }));
  }
  const tgl1 = document.getElementById('tglBerangkat').value;
  const tgl2 = document.getElementById('tglKembali').value;
  return tgl1 && tgl2 ? [{ start: tgl1, end: tgl2 }] : [];
}

function getEmpDays(empId) {
  let days = 0, nights = 0;
  getEmpSegments(empId).forEach(seg => {
    const span = daySpan(seg.start, seg.end);
    days += span;
    nights += Math.max(0, span - 1);
  });
  return { days, nights };
}

function expandTripDays(segments) {
  const pad = n => String(n).padStart(2, '0');
  const days = new Set();
  segments.forEach(seg => {
    const cur = new Date(seg.start);
    const end = new Date(seg.end);
    while (cur <= end) {
      days.add(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
      cur.setDate(cur.getDate() + 1);
    }
  });
  return [...days].sort();
}

function formatTanggalList(isoDates) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const groups = [];
  isoDates.forEach(iso => {
    const d = new Date(iso);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.days.push(d.getDate());
    else groups.push({ key, days: [d.getDate()], month: months[d.getMonth()], year: d.getFullYear() });
  });
  return groups.map(g => `${g.days.join(', ')} ${g.month} ${g.year}`).join(', ');
}

function getHotelRate(sbm, gol) {
  if (!sbm) return 0;
  if (gol.startsWith('IV')) return sbm.h4;
  if (gol === 'I' || gol === 'II') return sbm.h2;
  return sbm.h3; // Gol III, IX, VIII, VII, dll → rate Eselon IV/Gol III
}

function hitungBiaya(emp) {
  const sbm = getSBM();
  const customCosts = getCustomCosts().map(item => ({
    name: item.name,
    amount: item.amounts[emp.id] || 0,
    isTransport: item.kind === 'transport',
    isTicket: item.kind === 'tiket',
    pickup: item.pickup,
    dropoff: item.dropoff
  }));
  const customTotal = customCosts.reduce((total, item) => total + item.amount, 0);
  if (!sbm) return { uh: 0, uhGross: 0, mealDeduction: 0, snackDeduction: 0, hotel: 0, representatif: 0, representatifRate: 0, dpr: 0, tiket: 0, customCosts, total: customTotal };
  const { days, nights } = getEmpDays(emp.id);
  const cbUH = document.getElementById('cbUH').checked;
  const cbHotel = document.getElementById('cbHotel').checked;
  const cbDPR = document.getElementById('cbDPR').checked;
  const cbTiket = document.getElementById('cbTiket').checked;
  const uhPercent = Number(document.getElementById('uhPersentase').value) || 1;
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';
  const uhGross = cbUH && !isDkiJakarta ? sbm.uh * days * uhPercent : 0;
  const isMeeting = document.getElementById('jenisKegiatan').value === 'rapat';
  const mealRequested = isMeeting ? (Number(document.getElementById('tarifMakan').value) || 0) * (Number(document.getElementById('jumlahMakan').value) || 0) * days : 0;
  const snackRequested = isMeeting ? (Number(document.getElementById('tarifSnack').value) || 0) * (Number(document.getElementById('jumlahSnack').value) || 0) * days : 0;
  const mealDeduction = Math.min(uhGross, mealRequested);
  const snackDeduction = Math.min(Math.max(0, uhGross - mealDeduction), snackRequested);
  const uh = uhGross - mealDeduction - snackDeduction;
  const hotelEntries = getHotelEntries();
  let hotel = 0;
  const hotelDetails = [];
  if (cbHotel) {
    if (hotelEntries.length) {
      hotelEntries.forEach(item => {
        if (!item.employeeIds.includes(emp.id)) return;
        const roomTotal = item.nights * item.price;
        if (roomTotal <= 0) return;
        hotel += roomTotal;
        hotelDetails.push({ name: item.name, nights: item.nights, price: item.price, total: roomTotal });
      });
    } else {
      hotel = getHotelRate(sbm, emp.gol) * nights;
    }
  }
  const isKepalaBiro = /kepala biro/i.test(emp.jabatan || '');
  const representatifRate = isKepalaBiro ? (isDkiJakarta ? 75000 : 150000) : 0;
  const representatif = representatifRate * days;
  const dprVal = cbDPR ? (isDkiJakarta ? 170000 : Number(document.getElementById('dprManual').value) || 0) : 0;
  const tiketVal = cbTiket ? sbm.tiket : 0;
  return { uh, uhGross, mealDeduction, snackDeduction, hotel, hotelDetails, representatif, representatifRate, dpr: dprVal, tiket: tiketVal, customCosts, total: uh + hotel + representatif + dprVal + tiketVal + customTotal };
}

// =====================================================================
// FORMAT HELPERS
// =====================================================================
function rp(n) {
  if (!n || n === 0) return 'Rp 0';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function formatTgl(str) {
  if (!str) return '-';
  const d = new Date(str);
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function jabatanDuaBaris(text) {
  return String(text || '').replace(/Pejabat Pembuat Komitmen\s+(?=Sekretariat Jenderal)/, 'Pejabat Pembuat Komitmen<br>');
}

function terbilang(angka) {
  const satuan = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan',
    'Sepuluh','Sebelas','Dua Belas','Tiga Belas','Empat Belas','Lima Belas','Enam Belas',
    'Tujuh Belas','Delapan Belas','Sembilan Belas'];
  if (angka === 0) return 'Nol';
  if (angka < 20) return satuan[angka];
  if (angka < 100) return satuan[Math.floor(angka/10)*10===20?2:Math.floor(angka/10)] + (Math.floor(angka/10)>1?' Puluh ':' Puluh ') + satuan[angka % 10];
  function helper(n) {
    if (n === 0) return '';
    if (n < 20) return satuan[n] + ' ';
    if (n < 100) return satuan[Math.floor(n/10)] + ' Puluh ' + (n%10?satuan[n%10]+' ':'');
    if (n < 200) return 'Seratus ' + helper(n - 100);
    if (n < 1000) return satuan[Math.floor(n/100)] + ' Ratus ' + helper(n % 100);
    if (n < 2000) return 'Seribu ' + helper(n - 1000);
    if (n < 1000000) return helper(Math.floor(n/1000)) + 'Ribu ' + helper(n % 1000);
    if (n < 1000000000) return helper(Math.floor(n/1000000)) + 'Juta ' + helper(n % 1000000);
    return helper(Math.floor(n/1000000000)) + 'Miliar ' + helper(n % 1000000000);
  }
  return helper(angka).trim() + ' Rupiah';
}

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
  const paymentText = [agenda || `Perjalanan dinas ke ${kotaTeks ? kotaDenganProvinsi(kotaTeks) : '-'}`, kegiatan ? `Output ${kegiatan}` : '']
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

function saveKuitansiPeroranganSPD() {
  const select = document.getElementById('kuitansiPeroranganPegawai');
  if (select.value === '') return;
  const value = document.getElementById('kuitansiPeroranganNoSPD').value.trim();
  spdPerEmployee[Number(select.value)] = value;
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
  const tujuan = kotaTeks ? kotaDenganProvinsi(kotaTeks) : (getSBM()?.ibukota || '-');
  const paymentText = `Biaya Perjalanan Dinas atas nama ${emp.nama}`;
  const mak = `${document.getElementById('kodeKegiatan').value} ${document.getElementById('kodeSubKegiatan').value} ${document.getElementById('mak').value}`;
  const noSPD = spdPerEmployee[emp.id] || '-';
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
  spdPerEmployee[Number(select.value)] = document.getElementById('sppdNoSPD').value.trim();
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
  const tujuan = kotaTeks ? kotaDenganProvinsi(kotaTeks) : (sbm ? `${sbm.ibukota}, ${formatProvinsi(sbm.provinsi)}` : '-');
  const noSPD = spdPerEmployee[emp.id] || '-';
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
  const transport = document.getElementById('cbTiket').checked ? 'Pesawat Udara' : 'Transportasi Darat';
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
  const tujuan = kotaTeks ? kotaDenganProvinsi(kotaTeks) : (sbm ? `${sbm.ibukota}, ${formatProvinsi(sbm.provinsi)}` : '-');
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
    'Tanda Tangan pada Link Monitoring Perdin'
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
          <col style="width:14%"><col style="width:13%"><col style="width:2%"><col style="width:35%">
          <col style="width:14%"><col style="width:2%"><col style="width:20%">
        </colgroup>
        <tr><th colspan="2" class="lembar-kendali-meta-label">PELAKSANA PERTANGGUNGJAWABAN</th><td class="lembar-kendali-meta-separator">:</td><td class="lembar-kendali-meta-value">${pelaksana}</td><th class="lembar-kendali-meta-label">SPM</th><td class="lembar-kendali-meta-separator">:</td><td class="lembar-kendali-meta-value">${nomorSPM}</td></tr>
        <tr><td colspan="4"></td><th class="lembar-kendali-meta-label">SP2D</th><td class="lembar-kendali-meta-separator">:</td><td class="lembar-kendali-meta-value">${nomorSPD}</td></tr>
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
  const tujuan = kotaTeks ? kotaDenganProvinsi(kotaTeks) : (sbm ? `${sbm.ibukota}, ${formatProvinsi(sbm.provinsi)}` : '-');
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
  if (cbDPR || hasTransportCost) {
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
  const kotaTujuan = kotaTeks ? kotaDenganProvinsi(kotaTeks) :
    (sbm ? `${sbm.ibukota}, ${formatProvinsi(sbm.provinsi)}` : '-');
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
              <td>${emp.nama}<br><span>NIP. ${emp.nip}</span></td>
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
        <div class="rekap-spt-signature-space"></div>
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
  const kotaTujuan = kotaTeks ? kotaDenganProvinsi(kotaTeks) : (sbm ? sbm.ibukota + ', ' + formatProvinsi(sbm.provinsi) : '-');
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
            <col style="width:4%"><col style="width:23%"><col style="width:5%"><col style="width:16%">
            <col style="width:13%"><col style="width:9.5%"><col style="width:10%"><col style="width:8.5%"><col style="width:11%">
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
  spdPerEmployee[Number(select.value)] = document.getElementById('rincianNoSPD').value.trim();
  renderRincian();
}

function mergeRincianKeterangan(rowsHtml) {
  const tbody = document.createElement('tbody');
  tbody.innerHTML = rowsHtml;
  const rows = [...tbody.children];
  let blankStart = null;
  rows.forEach((tr, index) => {
    const ket = tr.querySelector('td.rincian-ket-cell');
    if (!ket) {
      blankStart = null;
      return;
    }
    if (!ket.textContent.trim()) {
      if (blankStart === null) blankStart = index;
      return;
    }
    if (blankStart !== null && tr.dataset.mergeKetUp === 'true') {
      const target = rows[blankStart].querySelector('td.rincian-ket-cell');
      target.innerHTML = ket.innerHTML;
      target.rowSpan = index - blankStart + 1;
      for (let i = blankStart + 1; i <= index; i++) {
        rows[i].querySelector('td.rincian-ket-cell')?.remove();
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
  const kotaTujuan = kotaTeks ? kotaDenganProvinsi(kotaTeks) : (sbm ? sbm.ibukota : '-');
  const noSPD = spdPerEmployee[emp.id] || '___/SPD/Birkom/___/____';
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
  const uhKeterangan = uhPercent < 1 ? 'Menggunakan Kendaraan Dinas Operasional' : '';
  if (cbUH && b.uhGross > 0) {
    rincianRows += `<tr class="rincian-ket-row"><td class="tc">${no++}</td><td>Uang Harian ${uhPercent*100}%<br><span style="padding-left:12px">${days} hari &nbsp; X &nbsp; Rp &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${Number(sbm?sbm.uh:0).toLocaleString('id-ID')}</span></td><td class="tr">${rp(b.uhGross)}</td><td class="rincian-ket-cell">${uhKeterangan}</td></tr>`;
  }
  if (b.mealDeduction > 0) {
    const mealCount = Number(document.getElementById('jumlahMakan').value) || 0;
    rincianRows += `<tr><td class="tc">${no++}</td><td>Pengurangan uang makan<br><span style="font-size:10px;color:#718096">${days} hari × ${mealCount} kali × ${rp(Number(document.getElementById('tarifMakan').value)||0)}</span></td><td class="tr">- ${rp(b.mealDeduction)}</td><td class="rincian-ket-cell"></td></tr>`;
  }
  if (b.snackDeduction > 0) {
    const snackCount = Number(document.getElementById('jumlahSnack').value) || 0;
    rincianRows += `<tr><td class="tc">${no++}</td><td>Pengurangan snack<br><span style="font-size:10px;color:#718096">${days} hari × ${snackCount} kali × ${rp(Number(document.getElementById('tarifSnack').value)||0)}</span></td><td class="tr">- ${rp(b.snackDeduction)}</td><td class="rincian-ket-cell"></td></tr>`;
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
  if ((cbDPR && b.dpr > 0) || transportExtra > 0) {
    const dprUraian = cbDPR && sbm?.provinsi === 'DKI JAKARTA'
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
            <colgroup><col><col><col style="width:120px"></colgroup>
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
        <colgroup><col style="width:40px"><col><col><col style="width:120px"></colgroup>
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
            <td style="text-align:center;font-weight:700">${rp(b.total)}</td>
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
  spdPerEmployee[Number(select.value)] = document.getElementById('dprNoSPD').value.trim();
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
    out.innerHTML = '<div class="alert-warn">⚠️ Lembar Daftar Pengeluaran Riil hanya untuk Perjalanan Dinas dalam kota DKI Jakarta (DPR Rp 170.000).</div>';
    return;
  }
  const biaya = hitungBiaya(emp);
  if (!biaya.dpr) {
    out.innerHTML = '<div class="alert-warn">⚠️ Biaya DPR belum dicentang di Input Perjalanan.</div>';
    return;
  }

  const alamat = document.getElementById('cfg_alamatKuitansi').value;
  const kotaAsal = document.getElementById('cfg_kotaAsal').value;
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const tujuan = kotaTeks ? kotaDenganProvinsi(kotaTeks) : '-';
  const noSPD = spdPerEmployee[emp.id] || '-';
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
  const clearPrintMode = () => document.body.classList.remove('print-dpr');
  document.body.classList.add('print-dpr');
  window.addEventListener('afterprint', clearPrintMode, { once: true });
  window.print();
}

// =====================================================================
// SIMPAN / MUAT EXCEL
// =====================================================================
const EXCEL_TRIP_FIELDS = [
  ['Nomor Surat Tugas (ST)', 'noST', 'text'],
  ['Tanggal Surat Tugas', 'tglST', 'date'],
  ['Tanggal SPD', 'tglSPD', 'date'],
  ['Tanggal Berangkat', 'tglBerangkat', 'date'],
  ['Tanggal Kembali', 'tglKembali', 'date'],
  ['Provinsi Tujuan', 'provinsiTujuan', 'select'],
  ['Kota / Kabupaten Tujuan', 'kotaTujuan', 'text'],
  ['Agenda / Maksud Perjalanan', 'agenda', 'text'],
  ['Kode Kegiatan', 'kodeKegiatan', 'text'],
  ['Kode Sub Kegiatan', 'kodeSubKegiatan', 'text'],
  ['MAK', 'mak', 'text'],
  ['Biaya Uang Harian', 'cbUH', 'check'],
  ['Biaya Hotel', 'cbHotel', 'check'],
  ['Biaya DPR', 'cbDPR', 'check'],
  ['Biaya Tiket Pesawat PP', 'cbTiket', 'check'],
  ['Persentase Uang Harian', 'uhPersentase', 'select'],
  ['Nominal DPR Manual', 'dprManual', 'number'],
  ['Jenis Kegiatan', 'jenisKegiatan', 'select'],
  ['Tarif Makan per Kali', 'tarifMakan', 'number'],
  ['Makan Disediakan per Hari', 'jumlahMakan', 'number'],
  ['Tarif Snack per Kali', 'tarifSnack', 'number'],
  ['Snack Disediakan per Hari', 'jumlahSnack', 'number'],
  ['Lembar Kendali - Tanggal Masuk Berkas', 'lk_tanggalMasuk', 'date'],
  ['Lembar Kendali - Pelaksana', 'lk_pelaksana', 'text'],
  ['Lembar Kendali - Nomor SPM', 'lk_nomorSPM', 'text'],
  ['Lembar Kendali - Nomor SPD', 'lk_nomorSPD', 'text'],
  ['Lembar Kendali - Jenis Perjalanan', 'lk_jenisPerjalanan', 'select']
];

const EXCEL_SETTING_FIELDS = [
  ['Nama Satker', 'cfg_satker'],
  ['Alamat Satker', 'cfg_alamatSatker'],
  ['Kode Satker', 'cfg_kodeSatker'],
  ['Bank dan No. Rekening', 'cfg_bank'],
  ['Nomor Bukti Kuitansi', 'cfg_noBuktiKuitansi'],
  ['Kota Asal', 'cfg_kotaAsal'],
  ['Alamat Kop Kuitansi', 'cfg_alamatKuitansi'],
  ['Output', 'cfg_kegiatan'],
  ['Nama PPK', 'cfg_ppkNama'],
  ['NIP PPK', 'cfg_ppkNip'],
  ['Jabatan PPK', 'cfg_ppkJabatan'],
  ['Nama Bendahara Pengeluaran', 'cfg_bendNama'],
  ['NIP Bendahara', 'cfg_bendNip'],
  ['Nama PP-SPM', 'cfg_ppspmNama'],
  ['NIP PP-SPM', 'cfg_ppspmNip'],
  ['Nama Verifikator PPK', 'cfg_verifikatorNama'],
  ['NIP Verifikator PPK', 'cfg_verifikatorNip']
];

const EXCEL_SEGMENT_SLOTS = 5;

function excelPad2(n) {
  return String(n).padStart(2, '0');
}

function excelIsoDate(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date && !isNaN(value)) {
    return `${value.getFullYear()}-${excelPad2(value.getMonth() + 1)}-${excelPad2(value.getDate())}`;
  }
  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value);
    return d ? `${d.y}-${excelPad2(d.m)}-${excelPad2(d.d)}` : '';
  }
  const s = String(value).trim().replace(/^'/, '');
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${excelPad2(m[2])}-${excelPad2(m[3])}`;
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) return `${m[3]}-${excelPad2(m[2])}-${excelPad2(m[1])}`;
  const bulan = {
    januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
    juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agu: 8, ags: 8, sep: 9, okt: 10, nov: 11, des: 12
  };
  m = s.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (m && bulan[m[2]]) return `${m[3]}-${excelPad2(bulan[m[2]])}-${excelPad2(m[1])}`;
  return '';
}

function excelNumber(value) {
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function excelBool(value) {
  return ['ya', 'yes', 'true', '1', 'v', 'y', '√', '✓'].includes(String(value ?? '').trim().toLowerCase());
}

function excelOptionText(select) {
  if (!select.value) return '';
  return (select.selectedOptions[0]?.textContent || select.value).trim();
}

function excelSetSelect(selectId, value) {
  const select = document.getElementById(selectId);
  const text = String(value ?? '').trim();
  if (!select || !text) return false;
  const normalized = text.toLowerCase();
  const options = [...select.options];
  const match = options.find(o => o.value === text)
    || options.find(o => o.textContent.trim().toLowerCase() === normalized)
    || options.find(o => o.textContent.toLowerCase().includes(normalized))
    || options.find(o => normalized.includes(o.textContent.trim().toLowerCase()));
  if (!match) return false;
  select.value = match.value;
  return true;
}

function excelFindEmployee(nama, nip) {
  const nipDigits = String(nip ?? '').replace(/\D/g, '');
  if (nipDigits) {
    const byNip = employees.find(e => e.nip.replace(/\D/g, '') === nipDigits);
    if (byNip) return byNip;
  }
  const norm = String(nama ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!norm) return null;
  return employees.find(e => e.nama.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) || null;
}

function excelSheetRows(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
}

function excelAddSheet(wb, name, rows, widths) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (widths) ws['!cols'] = widths.map(wch => ({ wch }));
  XLSX.utils.book_append_sheet(wb, ws, name);
}

function excelGetCustomCostRows() {
  const kindLabel = { other: 'Biaya lain', tiket: 'Tiket', transport: 'Transport PP' };
  return [...document.querySelectorAll('.custom-cost-row')].map(row => {
    let amounts = {};
    try {
      amounts = JSON.parse(row.dataset.amounts || '{}');
    } catch (error) {
      amounts = {};
    }
    row.querySelectorAll('.custom-cost-amount').forEach(input => {
      amounts[input.dataset.employeeId] = Math.max(0, Number(input.value) || 0);
    });
    const kind = row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other';
    return {
      name: row.querySelector('.custom-cost-name').value.trim(),
      kind,
      kindLabel: kindLabel[kind] || 'Biaya lain',
      pickup: row.querySelector('.custom-cost-pickup')?.value.trim() || '',
      dropoff: row.querySelector('.custom-cost-dropoff')?.value.trim() || '',
      amounts
    };
  }).filter(item => item.name);
}

function excelGetHotelRows() {
  return [...document.querySelectorAll('#hotelList .hotel-row')].map(row => ({
    name: row.querySelector('.hotel-name').value.trim(),
    nights: Math.max(0, Number(row.querySelector('.hotel-nights').value) || 0),
    price: Math.max(0, Number(row.querySelector('.hotel-price').value) || 0),
    guestIds: [...row.querySelectorAll('.hotel-guest-check:checked')].map(cb => Number(cb.dataset.employeeId))
  })).filter(item => item.name || item.price > 0);
}

function exportPerjadinExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Pustaka Excel (xlsx.full.min.js) tidak termuat. Periksa file di folder aplikasi.');
    return;
  }
  const wb = XLSX.utils.book_new();
  const now = new Date();
  const stamp = `${now.getFullYear()}-${excelPad2(now.getMonth() + 1)}-${excelPad2(now.getDate())} ${excelPad2(now.getHours())}:${excelPad2(now.getMinutes())}`;

  excelAddSheet(wb, 'Info', [
    ['Informasi', 'Nilai'],
    ['Aplikasi', 'Perjadin — Setjen Kementerian PKP'],
    ['Versi format', 1],
    ['Dibuat', stamp],
    ['Cara pakai', 'Ubah isian pada sheet Perjalanan, Pegawai, Biaya Lain, dan Hotel, lalu simpan file ini. Buka kembali aplikasi dan klik "Muat Excel".'],
    ['Format tanggal', 'Gunakan YYYY-MM-DD (contoh 2026-11-14).'],
    ['Pegawai', 'Hapus baris pegawai jika tidak ikut. Kosongkan tanggal per pegawai agar mengikuti tanggal global.'],
    ['Biaya Lain', 'Satu baris = satu pegawai. Nominal per pegawai diisi di kolom terakhir.']
  ], [22, 110]);

  excelAddSheet(wb, 'Perjalanan', [
    ['Keterangan', 'Nilai'],
    ...EXCEL_TRIP_FIELDS.map(([label, id, type]) => {
      const el = document.getElementById(id);
      if (!el) return [label, ''];
      if (type === 'check') return [label, el.checked ? 'Ya' : 'Tidak'];
      if (type === 'select') return [label, excelOptionText(el)];
      return [label, el.value];
    })
  ], [42, 70]);

  const empIds = [...selectedEmpIds].sort((a, b) => a - b);
  const empHeader = ['No', 'Nama', 'NIP', 'Gol', 'Jabatan', 'Nomor SPD Pegawai'];
  for (let i = 1; i <= EXCEL_SEGMENT_SLOTS; i++) empHeader.push(`Tgl Berangkat ${i}`, `Tgl Kembali ${i}`);
  const empRows = empIds.map((id, index) => {
    const emp = employees.find(e => e.id === id);
    const segs = (empTripSegments.get(id) || []).filter(s => s.start && s.end).slice(0, EXCEL_SEGMENT_SLOTS);
    const row = [index + 1, emp?.nama || '', emp?.nip || '', emp?.gol || '', emp?.jabatan || '', spdPerEmployee[id] || ''];
    for (let i = 0; i < EXCEL_SEGMENT_SLOTS; i++) {
      const seg = segs[i];
      row.push(seg ? seg.start : '', seg ? seg.end : '');
    }
    return row;
  });
  const empWidths = [5, 42, 22, 8, 52, 26];
  for (let i = 0; i < EXCEL_SEGMENT_SLOTS; i++) empWidths.push(14, 14);
  excelAddSheet(wb, 'Pegawai', [empHeader, ...empRows], empWidths);

  const costRows = [['No', 'Uraian Biaya', 'Jenis', 'Titik Jemput / Keberangkatan', 'Titik Antar / Kedatangan', 'Pegawai', 'Nominal (Rp)']];
  excelGetCustomCostRows().forEach((cost, index) => {
    if (!empIds.length) {
      costRows.push([index + 1, cost.name, cost.kindLabel, cost.pickup, cost.dropoff, '', 0]);
      return;
    }
    empIds.forEach(id => {
      const emp = employees.find(e => e.id === id);
      costRows.push([index + 1, cost.name, cost.kindLabel, cost.pickup, cost.dropoff, emp?.nama || '', cost.amounts[String(id)] || 0]);
    });
  });
  excelAddSheet(wb, 'Biaya Lain', costRows, [5, 30, 14, 28, 28, 38, 16]);

  const hotelRows = [['No', 'Nama Hotel', 'Malam', 'Harga per Malam (Rp)', 'Pegawai (pisah ";")']];
  excelGetHotelRows().forEach((hotel, index) => {
    const names = hotel.guestIds
      .map(id => employees.find(e => e.id === id)?.nama)
      .filter(Boolean)
      .join('; ');
    hotelRows.push([index + 1, hotel.name, hotel.nights, hotel.price, names]);
  });
  excelAddSheet(wb, 'Hotel', hotelRows, [5, 34, 8, 20, 60]);

  excelAddSheet(wb, 'Pengaturan', [
    ['Keterangan', 'Nilai'],
    ...EXCEL_SETTING_FIELDS.map(([label, id]) => [label, document.getElementById(id)?.value || ''])
  ], [32, 80]);

  const kota = document.getElementById('kotaTujuan').value.trim();
  const tgl = document.getElementById('tglBerangkat').value || '';
  const rawName = `Perjadin_${kota || 'Dinas'}_${tgl || stamp.slice(0, 10)}`;
  const safeName = rawName.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '_');
  XLSX.writeFile(wb, `${safeName}.xlsx`);
}

function importPerjadinExcel(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (typeof XLSX === 'undefined') {
    alert('Pustaka Excel (xlsx.full.min.js) tidak termuat. Periksa file di folder aplikasi.');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const wb = XLSX.read(new Uint8Array(event.target.result), { type: 'array', cellDates: true });
      if (!wb.Sheets['Perjalanan'] || !wb.Sheets['Pegawai']) {
        throw new Error('Sheet "Perjalanan" atau "Pegawai" tidak ditemukan. Gunakan file hasil tombol Simpan Excel.');
      }
      const info = applyPerjadinExcel(wb);
      let message = `Data berhasil dimuat dari Excel (${info.employees} pegawai).`;
      if (info.unknown.length) message += `\n\nPegawai tidak dikenali dan dilewati:\n${info.unknown.join(', ')}`;
      alert(message);
    } catch (error) {
      console.error(error);
      alert('Gagal memuat Excel: ' + error.message);
    } finally {
      input.value = '';
    }
  };
  reader.onerror = () => {
    alert('Gagal membaca file Excel.');
    input.value = '';
  };
  reader.readAsArrayBuffer(file);
}

function applyPerjadinExcel(wb) {
  const unknownNames = [];
  const tripRows = excelSheetRows(wb, 'Perjalanan');
  const tripMap = new Map();
  tripRows.slice(1).forEach(row => {
    const label = String(row[0] ?? '').trim();
    if (label) tripMap.set(label, row[1] ?? '');
  });

  selectedEmpIds.clear();
  empTripSegments.clear();
  spdPerEmployee = {};
  document.getElementById('customCostList').innerHTML = '';
  document.getElementById('hotelList').innerHTML = '';

  EXCEL_TRIP_FIELDS.forEach(([label, id, type]) => {
    if (!tripMap.has(label)) return;
    const value = tripMap.get(label);
    const el = document.getElementById(id);
    if (!el) return;
    if (type === 'check') {
      el.checked = excelBool(value);
    } else if (type === 'select') {
      const found = excelSetSelect(id, value);
      if (found && id === 'provinsiTujuan') changeProvince();
    } else if (type === 'date') {
      el.value = excelIsoDate(value);
    } else if (type === 'number') {
      const num = excelNumber(value);
      el.value = String(value).trim() === '' ? '' : String(num);
    } else {
      el.value = String(value ?? '').trim();
    }
  });

  excelSheetRows(wb, 'Pengaturan').slice(1).forEach(row => {
    const label = String(row[0] ?? '').trim();
    const field = EXCEL_SETTING_FIELDS.find(([l]) => l === label);
    if (!field) return;
    const el = document.getElementById(field[1]);
    if (el) el.value = String(row[1] ?? '').trim();
  });

  const empRows = excelSheetRows(wb, 'Pegawai');
  const empHeader = (empRows[0] || []).map(cell => String(cell).trim().toLowerCase());
  const col = name => empHeader.indexOf(name.toLowerCase());
  const cols = {
    nama: col('Nama'), nip: col('NIP'), spd: col('Nomor SPD Pegawai')
  };
  const pairs = [];
  for (let i = 1; i <= 10; i++) {
    const b = col(`Tgl Berangkat ${i}`);
    const k = col(`Tgl Kembali ${i}`);
    if (b >= 0 && k >= 0) pairs.push({ start: b, end: k });
  }
  if (cols.nama >= 0) {
    empRows.slice(1).forEach(row => {
      const emp = excelFindEmployee(row[cols.nama], cols.nip >= 0 ? row[cols.nip] : '');
      if (!emp) {
        const unknown = String(row[cols.nama] ?? '').trim();
        if (unknown) unknownNames.push(unknown);
        return;
      }
      selectedEmpIds.add(emp.id);
      const segs = [];
      pairs.forEach(pair => {
        let start = excelIsoDate(row[pair.start]);
        let end = excelIsoDate(row[pair.end]);
        if (!start && !end) return;
        if (!start) start = end;
        if (!end) end = start;
        if (end < start) end = start;
        segs.push({ start, end });
      });
      if (segs.length) empTripSegments.set(emp.id, segs);
      const noSpd = cols.spd >= 0 ? String(row[cols.spd] ?? '').trim() : '';
      if (noSpd) spdPerEmployee[emp.id] = noSpd;
    });
  }

  renderEmployeeList();
  renderSelectedTags();
  renderTripDates();

  document.getElementById('hotelList').innerHTML = '';
  excelSheetRows(wb, 'Hotel').slice(1).forEach(row => {
    const name = String(row[1] ?? '').trim();
    const nights = excelNumber(row[2]);
    const price = excelNumber(row[3]);
    if (!name && !price) return;
    addHotelRow(nights);
    const hotelRow = document.getElementById('hotelList').lastElementChild;
    hotelRow.querySelector('.hotel-name').value = name;
    hotelRow.querySelector('.hotel-price').value = price ? String(price) : '';
    const guestNames = String(row[4] ?? '')
      .split(';')
      .map(part => part.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(Boolean);
    hotelRow.querySelectorAll('.hotel-guest-check').forEach(cb => {
      const emp = employees.find(e => e.id === Number(cb.dataset.employeeId));
      const norm = (emp?.nama || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      cb.checked = guestNames.includes(norm);
    });
    updateHotelSummary(hotelRow);
  });
  toggleHotelFields();

  const costGroups = new Map();
  excelSheetRows(wb, 'Biaya Lain').slice(1).forEach(row => {
    const name = String(row[1] ?? '').trim();
    if (!name) return;
    const groupKey = `${String(row[0] ?? '').trim()}|${name.toLowerCase()}`;
    if (!costGroups.has(groupKey)) {
      costGroups.set(groupKey, {
        name,
        kindText: String(row[2] ?? '').trim().toLowerCase(),
        pickup: String(row[3] ?? '').trim(),
        dropoff: String(row[4] ?? '').trim(),
        amounts: {}
      });
    }
    const emp = excelFindEmployee(row[5], '');
    if (emp) {
      costGroups.get(groupKey).amounts[emp.id] = excelNumber(row[6]);
    }
  });

  costGroups.forEach(cost => {
    addCustomCost();
    const costRow = document.getElementById('customCostList').lastElementChild;
    const kind = cost.kindText.includes('tiket') ? 'tiket'
      : cost.kindText.includes('transport') ? 'transport' : 'other';
    costRow.dataset.kindAuto = '0';
    costRow.querySelector('.custom-cost-name').value = cost.name;
    applyCustomCostKind(costRow, kind);
    costRow.querySelector('.custom-cost-pickup').value = cost.pickup;
    costRow.querySelector('.custom-cost-dropoff').value = cost.dropoff;
    costRow.querySelectorAll('.custom-cost-amount').forEach(inp => {
      const amount = cost.amounts[inp.dataset.employeeId] || 0;
      inp.value = amount > 0 ? String(amount) : '0';
    });
    renderCustomCostAssignments(costRow);
  });

  hitungLama();
  markDPRManual();
  updateDPRInput();
  toggleKonsumsiFields();
  updateSBMPreview();
  refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();

  const activeTab = document.querySelector('.tab-content.active');
  if (activeTab && activeTab.id.startsWith('tab-')) {
    showTab(activeTab.id.slice(4));
  }
  return { employees: selectedEmpIds.size, unknown: unknownNames };
}
