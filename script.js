// =====================================================================
// DATA & STATE (PerdinKu)
// Data pegawai, data master SBM, dan state aplikasi
// =====================================================================

// =====================================================================
// DATA PEGAWAI (dari sheet KARYAWAN)
// =====================================================================
const LOGO_PKP_BASE64 = 'data:image/webp;base64,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';

const employees = [
  { id: 0, nama: 'Yenita Sari, S.H., M.H.', nip: '197905172002122002', pangkat: 'Pembina Tingkat 1', gol: 'IV/b', jabatan: 'Kepala Biro Komunikasi Publik' },
  { id: 1, nama: 'Arif Fajar Alfalaqy, S.Sos., M.Sc.', nip: '198305152008011009', pangkat: 'Pembina', gol: 'IV/a', jabatan: 'Kabag. Pengelolaan Dokumentasi dan Hubungan Media' },
  { id: 2, nama: 'Rendhi Mirad, S.Sos., M.S.E.', nip: '198205212006041002', pangkat: 'Pembina Tingkat 1', gol: 'IV/b', jabatan: 'Kabag. Pelayanan Publik dan Publikasi' },
  { id: 4, nama: 'Ristyan Mega Putra, S.Sos, M.Si.', nip: '198310142010121001', pangkat: 'Penata Tingkat I', gol: 'III/d', jabatan: 'Pranata Humas Ahli Muda' },
  { id: 5, nama: 'Ahmad Jayadi, S.Hum, M.T.', nip: '198702182010121003', pangkat: 'Penata Tingkat I', gol: 'III/d', jabatan: 'Kepala Subbagian Tata Usaha' },
  { id: 6, nama: 'Erwin Alimudin, S.Ds.', nip: '199305222019031006', pangkat: 'Penata Muda Tingkat I', gol: 'III/b', jabatan: 'Pranata Humas Ahli Pertama' },
  { id: 7, nama: 'Bio Bhirawan, S.T., M.Si.', nip: '199209052019031004', pangkat: 'Penata Muda Tingkat I', gol: 'III/b', jabatan: 'Analis Perumahan' },
  { id: 8, nama: 'Ishaq Abdullah, S.Ars.', nip: '199505122020121002', pangkat: 'Penata Muda Tingkat I', gol: 'III/b', jabatan: 'Penata Kelola Perumahan Ahli Pertama' },
  { id: 9, nama: 'Annisa Zetta Afiatni, S.I.Kom.', nip: '199401312023212027', pangkat: '-', gol: 'IX', jabatan: 'Pranata Humas Ahli Pertama' },
  { id: 10, nama: 'Gita Nawangsari Estika Putri, S.Kom.I.', nip: '199401042023212032', pangkat: '-', gol: 'IX', jabatan: 'Pranata Humas Ahli Pertama' },
  { id: 11, nama: 'Nur Rahma Aziza, S.I.Kom.', nip: '199901012023212005', pangkat: '-', gol: 'IX', jabatan: 'Pranata Humas Ahli Pertama' },
  { id: 12, nama: 'Bambang Ismanto, A.Md.', nip: '199505252024211005', pangkat: '-', gol: 'VII', jabatan: 'Pranata Komputer Terampil' },
  { id: 13, nama: 'Lisa Rahmawati Dewi Syam, S.H., M.H.', nip: '199009162025212062', pangkat: '-', gol: 'IX', jabatan: 'Arsiparis Ahli Pertama' },
  { id: 14, nama: 'Refly Saprilaturyandi, S.Kom.', nip: '198504232025211049', pangkat: '-', gol: 'IX', jabatan: 'Pranata Komputer Ahli Pertama' },
  { id: 15, nama: 'Rudiyana Harris, S.E.', nip: '198912202025211044', pangkat: '-', gol: 'IX', jabatan: 'Analis Kebijakan Ahli Pertama' },
  { id: 16, nama: 'Fitrah Faizal, S.T.', nip: '198802242025211047', pangkat: '-', gol: 'IX', jabatan: 'Penata Layanan Operasional' },
  { id: 17, nama: 'Wahyu Ady Sulistyo, S.T.', nip: '198407022025211043', pangkat: '-', gol: 'IX', jabatan: 'Penata Layanan Operasional' },
  { id: 18, nama: 'Aisyah Putri Robbani, S.Ars', nip: '199706262025062015', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Bangunan Gedung dan Kawasan Permukiman Ahli Pertama' },
  { id: 19, nama: 'Akhdiyat Dewa Galenica, S.I.Kom.', nip: '200212262025061003', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 20, nama: 'Ameta Dian Fachirah Tarigan, S.I.Kom', nip: '199906202025062017', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 21, nama: 'Aqyun Rista Maulidin, S.Tr.Kom.', nip: '200205302025062010', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Komputer Ahli Pertama' },
  { id: 22, nama: 'Ardilamita Febrimasya, S.K.Pm.', nip: '200203122025062008', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 23, nama: 'Atini Rahmatika Fauzi Murod, S.K.Pm.', nip: '199903172025062014', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 24, nama: 'Avifah Setiyani, S.I.Kom.', nip: '199909222025062015', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 25, nama: 'Deshinta Firstiana Sari, S.I.Kom.', nip: '198912152025062003', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 26, nama: 'Digna Margareth Rismauli, S.I.Kom.', nip: '199310142025062008', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 27, nama: 'Dimas Novel Calvindoro Damarjati, S.I.Kom.', nip: '199906182025061012', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 28, nama: 'Emanuel Van Fernando Sibarani, S.I.Kom', nip: '199611092025061011', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 29, nama: 'Fatmawati, S.T.', nip: '200002182025062015', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Perumahan Ahli Pertama' },
  { id: 30, nama: 'Gayatri Puspita Sari, S.I.Kom', nip: '200001172025062013', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 31, nama: 'Indar Amila Azizah, S.I.Kom', nip: '200006052025062023', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 32, nama: 'Kinanti Juli Astuti, S.I.Kom.', nip: '200107292025062013', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 33, nama: 'Leonardo Abet Zebe, S.Ars', nip: '200206092025061006', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Perumahan Ahli Pertama' },
  { id: 34, nama: 'Madya Puspa Faradina, B.A.', nip: '199711182025062011', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 35, nama: 'Maharani Bilqist Caroline, S.T.', nip: '200009262025062013', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Bangunan Gedung dan Kawasan Permukiman Ahli Pertama' },
  { id: 36, nama: 'Melly Nur Fatimah, S.T.', nip: '199805282025062014', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Perumahan Ahli Pertama' },
  { id: 37, nama: 'Michael Prilas Simanjuntak, S.T.', nip: '200204112025061006', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Perumahan Ahli Pertama' },
  { id: 38, nama: 'Muhammad Ihsan Yudanto, S.T.', nip: '199802252025061010', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Perumahan Ahli Pertama' },
  { id: 39, nama: 'Muhammad Ilham Bintang, S.K.Pm.', nip: '200010192025061007', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 40, nama: 'Nabela Aristya Fajrin, S.Akt.', nip: '200003022025062014', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Analis Pengelolaan Keuangan APBN Ahli Pertama' },
  { id: 41, nama: 'Novia Dwi Purwanti, S.K.Pm.', nip: '200111112025062016', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 42, nama: 'Raden Bintang Agna Fadhila, S.I.Kom.', nip: '200111022025061007', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 43, nama: 'Ratu Budhi Sejati, S.I.Kom.', nip: '199610232025062013', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 44, nama: 'Ridho Halasan Sinaga, S.I.Kom.', nip: '200108122025061008', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 45, nama: 'Rifky Aji Rahmandita, S.I.Kom', nip: '199902242025061006', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 46, nama: 'Risyanti Ananti Putri, S.IP', nip: '199906192025062020', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Arsiparis Ahli Pertama' },
  { id: 47, nama: 'Sahrul Hari Nugroho, S.T', nip: '199906032025061009', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Bangunan Gedung dan Kawasan Permukiman' },
  { id: 48, nama: 'Shafa Kamila, S.I.Kom.', nip: '200111162025062019', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 49, nama: 'Utari Liani Narulita, S.I.Kom.', nip: '200104142025062021', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 50, nama: 'Vania Adita Siagian, S.T.', nip: '199910242025062017', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Perumahan Ahli Pertama' },
  { id: 51, nama: 'Vera Siringo Ringo, S.Ikom.', nip: '199602052025062013', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 52, nama: 'Widya Cantika Sisnawar, S.I.Kom.', nip: '200101192025062013', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 53, nama: 'Yogi Andre Yonatan Pakpahan, S.P.W.K', nip: '199511272025061006', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Bangunan Gedung dan Kawasan Permukiman Ahli Pertama' },
  { id: 54, nama: 'Yovita Rimbawati, S.I.Kom.', nip: '199107312025062006', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 55, nama: 'Zahra Puspa Noviandini, S.Ars.', nip: '199711012025062009', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Penata Kelola Perumahan Ahli Pertama' },
  { id: 56, nama: 'Zhafira Alya Miftach, S.I.Kom', nip: '199910012025062019', pangkat: 'Penata Muda', gol: 'III/a', jabatan: 'Pranata Hubungan Masyarakat Ahli Pertama' },
  { id: 57, nama: 'Adolfus Manuel, S.Ak.', nip: '-', pangkat: '-', gol: '-', jabatan: 'Staf Biro Umum' },
];

// =====================================================================
// DATA SBM (dari sheet Master - PMK)
// Fields: uh=uang harian 100%, diklat=uang harian diklat, fullboard=uang harian fullboard,
//         jktPP=transport JKT PP, taxi=taxi lokal,
//         h4=hotel Eselon III/Gol IV, h3=hotel Eselon IV/Gol III,
//         h2=hotel Eselon II, h1=hotel Eselon I, tiket=tiket pesawat PP
// =====================================================================
const sbmData = [
  { id: 1, provinsi: 'NANGROE ACEH DARUSSALAM', ibukota: 'Banda Aceh', uh: 360000, diklat: 110000, fullboard: 130000, makan: 51000, snack: 21000, jktPP: 500000, taxi: 246000, dpr: 746000, h1: 5109000, h2: 3526000, h4: 1578000, h3: 770000, tiket: 4807000 },
  { id: 2, provinsi: 'SUMATERA UTARA', ibukota: 'Medan', uh: 370000, diklat: 110000, fullboard: 130000, makan: 47000, snack: 17000, jktPP: 500000, taxi: 556000, dpr: 1056000, h1: 4960000, h2: 2195000, h4: 1188000, h3: 699000, tiket: 4054000 },
  { id: 3, provinsi: 'RIAU', ibukota: 'Pekanbaru', uh: 370000, diklat: 110000, fullboard: 130000, makan: 52000, snack: 18000, jktPP: 500000, taxi: 198000, dpr: 698000, h1: 3820000, h2: 3119000, h4: 1650000, h3: 852000, tiket: 3016000 },
  { id: 4, provinsi: 'KEPULAUAN RIAU', ibukota: 'Tanjung Pinang', uh: 370000, diklat: 110000, fullboard: 130000, makan: 44000, snack: 25000, jktPP: 500000, taxi: 318000, dpr: 818000, h1: 6177000, h2: 2481000, h4: 1388000, h3: 792000, tiket: 0 },
  { id: 5, provinsi: 'JAMBI', ibukota: 'Jambi', uh: 370000, diklat: 110000, fullboard: 130000, makan: 54000, snack: 19000, jktPP: 500000, taxi: 266000, dpr: 766000, h1: 5004000, h2: 4102000, h4: 1252000, h3: 580000, tiket: 2584000 },
  { id: 6, provinsi: 'SUMATERA BARAT', ibukota: 'Padang', uh: 380000, diklat: 110000, fullboard: 130000, makan: 45000, snack: 19000, jktPP: 500000, taxi: 342000, dpr: 842000, h1: 5603000, h2: 3373000, h4: 1353000, h3: 701000, tiket: 3159000 },
  { id: 7, provinsi: 'SUMATERA SELATAN', ibukota: 'Palembang', uh: 380000, diklat: 110000, fullboard: 130000, makan: 61000, snack: 19000, jktPP: 500000, taxi: 324000, dpr: 824000, h1: 6298000, h2: 3134000, h4: 1966000, h3: 861000, tiket: 2268000 },
  { id: 8, provinsi: 'LAMPUNG', ibukota: 'Bandar Lampung', uh: 380000, diklat: 110000, fullboard: 130000, makan: 43000, snack: 21000, jktPP: 500000, taxi: 324000, dpr: 824000, h1: 4806000, h2: 2663000, h4: 1539000, h3: 621000, tiket: 1583000 },
  { id: 9, provinsi: 'BENGKULU', ibukota: 'Bengkulu', uh: 380000, diklat: 110000, fullboard: 130000, makan: 48000, snack: 16000, jktPP: 500000, taxi: 212000, dpr: 712000, h1: 2140000, h2: 1628000, h4: 1546000, h3: 692000, tiket: 2770000 },
  { id: 10, provinsi: 'BANGKA BELITUNG', ibukota: 'Pangkal Pinang', uh: 410000, diklat: 120000, fullboard: 130000, makan: 48000, snack: 19000, jktPP: 500000, taxi: 188000, dpr: 688000, h1: 4424000, h2: 2838000, h4: 1957000, h3: 724000, tiket: 2139000 },
  { id: 11, provinsi: 'BANTEN', ibukota: 'Serang', uh: 370000, diklat: 110000, fullboard: 130000, makan: 54000, snack: 21000, jktPP: 0, taxi: 600000, dpr: 600000, h1: 5725000, h2: 2373000, h4: 1301000, h3: 775000, tiket: 0 },
  { id: 12, provinsi: 'JAWA BARAT', ibukota: 'Bandung', uh: 430000, diklat: 130000, fullboard: 130000, makan: 54000, snack: 22000, jktPP: 500000, taxi: 360000, dpr: 860000, h1: 5812000, h2: 2755000, h4: 1366000, h3: 735000, tiket: 0 },
  { id: 13, provinsi: 'DKI JAKARTA', ibukota: 'Jakarta', uh: 530000, diklat: 160000, fullboard: 130000, makan: 57000, snack: 24000, jktPP: 0, taxi: 500000, dpr: 500000, h1: 9331000, h2: 2084000, h4: 1062000, h3: 730000, tiket: 0 },
  { id: 14, provinsi: 'JAWA TENGAH', ibukota: 'Semarang', uh: 370000, diklat: 110000, fullboard: 130000, makan: 57000, snack: 17000, jktPP: 500000, taxi: 210000, dpr: 710000, h1: 6129000, h2: 2138000, h4: 1286000, h3: 810000, tiket: 2182000 },
  { id: 15, provinsi: 'D.I. YOGYAKARTA', ibukota: 'Yogyakarta', uh: 420000, diklat: 130000, fullboard: 130000, makan: 57000, snack: 17000, jktPP: 500000, taxi: 516000, dpr: 1016000, h1: 5100000, h2: 2695000, h4: 1600000, h3: 845000, tiket: 2268000 },
  { id: 16, provinsi: 'JAWA TIMUR', ibukota: 'Surabaya', uh: 410000, diklat: 120000, fullboard: 130000, makan: 49000, snack: 23000, jktPP: 500000, taxi: 450000, dpr: 950000, h1: 4449000, h2: 2007000, h4: 1234000, h3: 814000, tiket: 2674000 },
  { id: 17, provinsi: 'BALI', ibukota: 'Denpasar', uh: 480000, diklat: 140000, fullboard: 130000, makan: 52000, snack: 22000, jktPP: 500000, taxi: 438000, dpr: 938000, h1: 7328000, h2: 2433000, h4: 1754000, h3: 1138000, tiket: 3262000 },
  { id: 18, provinsi: 'NUSA TENGGARA BARAT', ibukota: 'Mataram', uh: 440000, diklat: 130000, fullboard: 130000, makan: 51000, snack: 19000, jktPP: 500000, taxi: 448000, dpr: 948000, h1: 4682000, h2: 2648000, h4: 1418000, h3: 907000, tiket: 3230000 },
  { id: 19, provinsi: 'NUSA TENGGARA TIMUR', ibukota: 'Kupang', uh: 430000, diklat: 130000, fullboard: 130000, makan: 52000, snack: 22000, jktPP: 500000, taxi: 210000, dpr: 710000, h1: 4013000, h2: 2283000, h4: 1450000, h3: 737000, tiket: 5081000 },
  { id: 20, provinsi: 'KALIMANTAN BARAT', ibukota: 'Pontianak', uh: 380000, diklat: 110000, fullboard: 130000, makan: 51000, snack: 17000, jktPP: 500000, taxi: 330000, dpr: 830000, h1: 2654000, h2: 1923000, h4: 1125000, h3: 576000, tiket: 2781000 },
  { id: 21, provinsi: 'KALIMANTAN TENGAH', ibukota: 'Palangkaraya', uh: 360000, diklat: 110000, fullboard: 130000, makan: 42000, snack: 16000, jktPP: 500000, taxi: 260000, dpr: 760000, h1: 4901000, h2: 3391000, h4: 1189000, h3: 706000, tiket: 2984000 },
  { id: 22, provinsi: 'KALIMANTAN SELATAN', ibukota: 'Banjarmasin', uh: 380000, diklat: 110000, fullboard: 130000, makan: 51000, snack: 18000, jktPP: 500000, taxi: 348000, dpr: 848000, h1: 4797000, h2: 3316000, h4: 1500000, h3: 746000, tiket: 3205000 },
  { id: 23, provinsi: 'KALIMANTAN TIMUR', ibukota: 'Samarinda', uh: 430000, diklat: 130000, fullboard: 130000, makan: 48000, snack: 27000, jktPP: 500000, taxi: 600000, dpr: 1100000, h1: 4000000, h2: 2342000, h4: 1507000, h3: 804000, tiket: 3797000 },
  { id: 24, provinsi: 'KALIMANTAN UTARA', ibukota: 'Tanjung Selor', uh: 430000, diklat: 130000, fullboard: 130000, makan: 53000, snack: 22000, jktPP: 500000, taxi: 422000, dpr: 922000, h1: 4000000, h2: 2854000, h4: 1507000, h3: 904000, tiket: 4341000 },
  { id: 25, provinsi: 'SULAWESI UTARA', ibukota: 'Manado', uh: 370000, diklat: 110000, fullboard: 130000, makan: 59000, snack: 27000, jktPP: 500000, taxi: 268000, dpr: 768000, h1: 5264000, h2: 2290000, h4: 1270000, h3: 978000, tiket: 5460000 },
  { id: 26, provinsi: 'GORONTALO', ibukota: 'Gorontalo', uh: 370000, diklat: 110000, fullboard: 130000, makan: 45000, snack: 16000, jktPP: 500000, taxi: 512000, dpr: 1012000, h1: 4168000, h2: 3107000, h4: 1606000, h3: 955000, tiket: 5162000 },
  { id: 27, provinsi: 'SULAWESI BARAT', ibukota: 'Mamuju', uh: 410000, diklat: 120000, fullboard: 130000, makan: 54000, snack: 22000, jktPP: 500000, taxi: 566000, dpr: 1066000, h1: 4076000, h2: 3098000, h4: 1344000, h3: 704000, tiket: 5208000 },
  { id: 28, provinsi: 'SULAWESI SELATAN', ibukota: 'Makassar', uh: 430000, diklat: 130000, fullboard: 130000, makan: 59000, snack: 26000, jktPP: 500000, taxi: 362000, dpr: 862000, h1: 4820000, h2: 1938000, h4: 1423000, h3: 745000, tiket: 3829000 },
  { id: 29, provinsi: 'SULAWESI TENGAH', ibukota: 'Palu', uh: 370000, diklat: 110000, fullboard: 130000, makan: 48000, snack: 19000, jktPP: 500000, taxi: 298000, dpr: 798000, h1: 2309000, h2: 2166000, h4: 1679000, h3: 951000, tiket: 5113000 },
  { id: 30, provinsi: 'SULAWESI TENGGARA', ibukota: 'Kendari', uh: 380000, diklat: 110000, fullboard: 130000, makan: 49000, snack: 22000, jktPP: 500000, taxi: 308000, dpr: 808000, h1: 3089000, h2: 2755000, h4: 1297000, h3: 786000, tiket: 4265000 },
  { id: 31, provinsi: 'MALUKU', ibukota: 'Ambon', uh: 380000, diklat: 110000, fullboard: 130000, makan: 64000, snack: 25000, jktPP: 500000, taxi: 558000, dpr: 1058000, h1: 3467000, h2: 3240000, h4: 1059000, h3: 667000, tiket: 7081000 },
  { id: 32, provinsi: 'MALUKU UTARA', ibukota: 'Sofifi', uh: 430000, diklat: 130000, fullboard: 130000, makan: 63000, snack: 26000, jktPP: 500000, taxi: 416000, dpr: 916000, h1: 4612000, h2: 3843000, h4: 1160000, h3: 654000, tiket: 0 },
  { id: 33, provinsi: 'PAPUA', ibukota: 'Jayapura', uh: 580000, diklat: 170000, fullboard: 130000, makan: 62000, snack: 33000, jktPP: 500000, taxi: 924000, dpr: 1424000, h1: 3859000, h2: 3318000, h4: 2521000, h3: 1038000, tiket: 8767000 },
  { id: 34, provinsi: 'PAPUA BARAT', ibukota: 'Manokwari', uh: 480000, diklat: 140000, fullboard: 130000, makan: 62000, snack: 28000, jktPP: 500000, taxi: 456000, dpr: 956000, h1: 3872000, h2: 3575000, h4: 2056000, h3: 967000, tiket: 10824000 },
  { id: 35, provinsi: 'PAPUA BARAT DAYA', ibukota: '-', uh: 480000, diklat: 140000, fullboard: 130000, makan: 62000, snack: 28000, jktPP: 0, taxi: 0, dpr: 0, h1: 3872000, h2: 3575000, h4: 2056000, h3: 967000, tiket: 0 },
  { id: 36, provinsi: 'PAPUA TENGAH', ibukota: '-', uh: 580000, diklat: 170000, fullboard: 130000, makan: 62000, snack: 33000, jktPP: 0, taxi: 0, dpr: 0, h1: 3859000, h2: 3318000, h4: 2521000, h3: 1038000, tiket: 0 },
  { id: 37, provinsi: 'PAPUA SELATAN', ibukota: '-', uh: 580000, diklat: 170000, fullboard: 130000, makan: 92000, snack: 42000, jktPP: 0, taxi: 0, dpr: 0, h1: 5673000, h2: 4877000, h4: 3706000, h3: 1526000, tiket: 0 },
  { id: 38, provinsi: 'PAPUA PEGUNUNGAN', ibukota: '-', uh: 580000, diklat: 170000, fullboard: 130000, makan: 93000, snack: 42000, jktPP: 0, taxi: 0, dpr: 0, h1: 5711000, h2: 4911000, h4: 3731000, h3: 1536000, tiket: 0 },
];

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
  { id: 'kep_seribu', nama: 'Kepulauan Seribu', provId: 13, provName: 'DKI JAKARTA', oneWay: 386000, pp: 772000, regex: /seribu|pulau\s+seribu/i }
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


// =====================================================================
// SBM & PERHITUNGAN BIAYA (PerdinKu)
// Perhitungan uang harian, hotel, transportasi, DPR, dan tarif SBM
// =====================================================================

// =====================================================================
// SBM & LAMA TUGAS
// =====================================================================
function adjustSbmForSekitarJakarta(sbm) {
  const kotaTujuan = typeof document !== 'undefined' ? (document.getElementById('kotaTujuan')?.value || '') : '';
  const sekitar = typeof getSbmSekitarJakarta === 'function' ? getSbmSekitarJakarta(kotaTujuan) : null;
  if (sekitar) {
    const baseSbm = sbm || (typeof sbmData !== 'undefined' ? sbmData.find(s => s.id === sekitar.provId) : null);
    if (!baseSbm) return null;
    return {
      ...baseSbm,
      isSekitarJakarta: true,
      sekitarJakarta: sekitar,
      jktPP: sekitar.pp,       // SBM Transport Jakarta - Daerah Sekitar PP (One Way x 2)
      taxi: 0,                 // Termasuk dalam rute PP
      dpr: sekitar.pp,         // Batas SBM Transport / DPR = One Way x 2
      dprOneWay: sekitar.oneWay
    };
  }
  return sbm;
}

function getSBM() {
  if (isMultiProvActive()) {
    const id1 = parseInt(document.getElementById('provinsiTujuan1')?.value || document.getElementById('provinsiTujuan')?.value);
    const s1 = (typeof sbmData !== 'undefined' && Array.isArray(sbmData)) ? sbmData.find(s => s.id === id1) : null;
    if (s1) return adjustSbmForSekitarJakarta(s1);
  }
  const id = parseInt(document.getElementById('provinsiTujuan')?.value);
  const s = (typeof sbmData !== 'undefined' && Array.isArray(sbmData)) ? (sbmData.find(item => item.id === id) || null) : null;
  return adjustSbmForSekitarJakarta(s);
}

const PROVINSI_AKRONIM = new Set(['DKI', 'D.I.']);

function formatProvinsi(nama) {
  return String(nama || '')
    .split(/\s+/)
    .map(word => PROVINSI_AKRONIM.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function getProvShortName(provName) {
  if (!provName) return '';
  const up = String(provName).toUpperCase();
  if (up.includes('BARAT') && up.includes('NUSA TENGGARA')) return 'NTB';
  if (up.includes('TIMUR') && up.includes('NUSA TENGGARA')) return 'NTT';
  if (up === 'DKI JAKARTA') return 'DKI Jakarta';
  if (up === 'D.I. YOGYAKARTA' || up === 'DI YOGYAKARTA' || up === 'DAERAH ISTIMEWA YOGYAKARTA') return 'D.I. Yogyakarta';
  return formatProvinsi(provName);
}

function isMultiProvActive() {
  return !!document.getElementById('cbMultiProvinsi')?.checked;
}

function getMultiProvData() {
  if (!isMultiProvActive()) return null;
  const id1 = parseInt(document.getElementById('provinsiTujuan1')?.value || document.getElementById('provinsiTujuan')?.value);
  const id2 = parseInt(document.getElementById('provinsiTujuan2')?.value);
  const sbm1 = sbmData.find(s => s.id === id1) || null;
  const sbm2 = sbmData.find(s => s.id === id2) || null;
  if (!sbm1 || !sbm2) return null;

  const totalDays = getDays().days || 1;
  let d1 = parseInt(document.getElementById('hariProvinsi1')?.value);
  let d2 = parseInt(document.getElementById('hariProvinsi2')?.value);

  if (isNaN(d1) || d1 <= 0) d1 = Math.max(1, Math.floor(totalDays / 2));
  if (isNaN(d2) || d2 <= 0) d2 = Math.max(1, totalDays - d1);

  return {
    sbm1,
    sbm2,
    days1: d1,
    days2: d2
  };
}

function toggleMultiProvinsi() {
  const isChecked = !!document.getElementById('cbMultiProvinsi')?.checked;
  const sec = document.getElementById('multiProvSection');
  const mainProvGroup = document.getElementById('mainProvinsiGroup') || document.querySelector('[data-field="provinsiTujuan"]');
  if (sec) sec.style.display = isChecked ? 'block' : 'none';
  if (mainProvGroup) {
    mainProvGroup.style.display = isChecked ? 'none' : '';
    if (isChecked) mainProvGroup.classList.remove('has-error');
  }

  if (isChecked) {
    const mainProv = document.getElementById('provinsiTujuan')?.value;
    const prov1 = document.getElementById('provinsiTujuan1');
    if (prov1 && mainProv && !prov1.value) {
      prov1.value = mainProv;
    }
    const totalDays = getDays().days || 1;
    const elDays1 = document.getElementById('hariProvinsi1');
    const elDays2 = document.getElementById('hariProvinsi2');
    if (elDays1 && (!elDays1.value || parseInt(elDays1.value) <= 0)) {
      elDays1.value = Math.max(1, Math.floor(totalDays / 2));
    }
    if (elDays2 && (!elDays2.value || parseInt(elDays2.value) <= 0)) {
      elDays2.value = Math.max(1, totalDays - parseInt(elDays1.value || 1));
    }
    const lblTotal = document.getElementById('multiProvTotalLama');
    if (lblTotal) lblTotal.textContent = `${totalDays} Hari`;
  } else {
    const prov1Val = document.getElementById('provinsiTujuan1')?.value;
    const mainProv = document.getElementById('provinsiTujuan');
    if (mainProv && prov1Val && !mainProv.value) {
      mainProv.value = prov1Val;
      changeProvince();
    }
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function onMultiProvChange(idx) {
  const p1 = document.getElementById('provinsiTujuan1');
  const p2 = document.getElementById('provinsiTujuan2');
  const main = document.getElementById('provinsiTujuan');
  if (p1 && p1.value && main) {
    main.value = p1.value;
  }
  if (p1 && typeof updateFieldFilledStatus === 'function') updateFieldFilledStatus(p1);
  if (p2 && typeof updateFieldFilledStatus === 'function') updateFieldFilledStatus(p2);
  const sbm = getSBM();
  if (sbm) {
    const makanRate = sbm.makan || 0;
    const snackRate = sbm.snack || 0;
    const isManualMakan = !!document.getElementById('cbTarifMakanManual')?.checked;
    const elMakan = document.getElementById('tarifMakan');
    if (elMakan && !isManualMakan) elMakan.value = makanRate ? rp(makanRate) : '0';
    const elSnack = document.getElementById('tarifSnack');
    if (elSnack) elSnack.value = snackRate ? rp(snackRate) : '0';
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function onMultiProvDaysChange(idx) {
  const totalDays = getDays().days || 1;
  const el1 = document.getElementById('hariProvinsi1');
  const el2 = document.getElementById('hariProvinsi2');
  if (!el1 || !el2) return;

  if (idx === 1) {
    let d1 = parseInt(el1.value);
    if (!isNaN(d1)) {
      if (d1 >= totalDays && totalDays > 1) {
        d1 = totalDays - 1;
        el1.value = d1;
      }
      if (d1 > 0) {
        el2.value = Math.max(1, totalDays - d1);
      }
    }
  } else if (idx === 2) {
    let d2 = parseInt(el2.value);
    if (!isNaN(d2)) {
      if (d2 >= totalDays && totalDays > 1) {
        d2 = totalDays - 1;
        el2.value = d2;
      }
      if (d2 > 0) {
        el1.value = Math.max(1, totalDays - d2);
      }
    }
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
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

function getTujuanDisplay(kotaTeks) {
  const text = String(kotaTeks || '').trim();
  const multi = getMultiProvData();
  if (multi) {
    const p1 = formatProvinsi(multi.sbm1.provinsi);
    const p2 = formatProvinsi(multi.sbm2.provinsi);
    if (text) return `${text} (${p1} & ${p2})`;
    return `${p1} & ${p2}`;
  }
  if (text) return kotaDenganProvinsi(text);
  const sbm = getSBM();
  return sbm ? `${sbm.ibukota}, ${formatProvinsi(sbm.provinsi)}` : '-';
}

function changeProvince() {
  currentRateProvinceId = document.getElementById('provinsiTujuan').value;
  const sbm = getSBM();
  const makanRate = sbm ? (sbm.makan || 0) : 0;
  const snackRate = sbm ? (sbm.snack || 0) : 0;
  const isManualMakan = !!document.getElementById('cbTarifMakanManual')?.checked;
  const elMakan = document.getElementById('tarifMakan');
  if (elMakan && !isManualMakan) elMakan.value = makanRate ? rp(makanRate) : '0';
  const elSnack = document.getElementById('tarifSnack');
  if (elSnack) elSnack.value = snackRate ? rp(snackRate) : '0';
  const elDpr = document.getElementById('dprManual');
  if (elDpr) elDpr.value = '';
  const isDki = sbm && sbm.provinsi === 'DKI JAKARTA';
  const cbDPR = document.getElementById('cbDPR');
  if (cbDPR) cbDPR.checked = isDki;
  dprAutoCheckedForDki = isDki;
  const noteJkt = document.getElementById('noteJakartaDPR');
  if (noteJkt) noteJkt.style.display = isDki ? 'block' : 'none';
  updateDPRInput();
  updateSBMPreview();
  updateSbmWarnings();
  if (typeof renderRincianTransportEditor === 'function') {
    renderRincianTransportEditor();
  }
}

function markDPRManual() {
  dprAutoCheckedForDki = false;
}

function updateDPRInput() {
  const el = document.getElementById('dprManualField');
  if (el) el.style.display = 'none';
}

function saveProvinceFoodRates() {
  if (!currentRateProvinceId) return;
  provinceFoodRates[currentRateProvinceId] = {
    makan: Math.max(0, parseNumber(document.getElementById('tarifMakan')?.value) || 0),
    snack: Math.max(0, parseNumber(document.getElementById('tarifSnack')?.value) || 0)
  };
  localStorage.setItem('provinceFoodRates', JSON.stringify(provinceFoodRates));
}

function toggleTarifMakanManual() {
  const cb = document.getElementById('cbTarifMakanManual');
  const input = document.getElementById('tarifMakan');
  const label = document.getElementById('labelTarifMakan');
  const jmMakan = document.getElementById('jumlahMakan');
  const cbKonsumsiBiasa = document.getElementById('cbKonsumsiBiasa');
  const toggleWrap = document.getElementById('manualMealModeToggle');
  const wrapDetail = document.getElementById('manualMealDetailWrap');
  const gTarif = document.getElementById('tarifMakanGroup');
  const gHari = document.getElementById('hariMakanGroup');
  const gJumlah = document.getElementById('jumlahMakanGroup');
  if (!input) return;

  const isManual = !!cb?.checked;
  if (isManual) {
    if (toggleWrap) toggleWrap.style.display = 'inline-flex';
    input.removeAttribute('readonly');
    input.classList.remove('is-readonly');
    if (label) label.textContent = 'Tarif Makan Manual (Rp/kali)';

    if (cbKonsumsiBiasa && !cbKonsumsiBiasa.checked) {
      cbKonsumsiBiasa.checked = true;
      const kf = document.getElementById('konsumsiFields');
      if (kf) kf.style.display = 'grid';
    }

    if (jmMakan && (Number(jmMakan.value) <= 0 || !jmMakan.value)) {
      jmMakan.value = '1';
    }

    const mode = document.getElementById('manualMakanMode')?.value || 'flat';
    setManualMealMode(mode);
  } else {
    if (toggleWrap) toggleWrap.style.display = 'none';
    if (wrapDetail) wrapDetail.style.display = 'none';
    if (gTarif) gTarif.style.display = '';
    if (gHari) gHari.style.display = '';
    if (gJumlah) gJumlah.style.display = '';

    input.setAttribute('readonly', 'readonly');
    input.classList.add('is-readonly');
    if (label) label.textContent = 'Tarif Makan SBM (Rp/kali)';
    const sbm = getSBM();
    const makanRate = sbm ? (sbm.makan || 0) : 0;
    input.value = makanRate ? rp(makanRate) : '0';
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function setManualMealMode(mode) {
  const modeInput = document.getElementById('manualMakanMode');
  if (modeInput) modeInput.value = mode;

  const btnFlat = document.getElementById('btnMealModeFlat');
  const btnDetail = document.getElementById('btnMealModeDetail');
  const wrapDetail = document.getElementById('manualMealDetailWrap');
  const gTarif = document.getElementById('tarifMakanGroup');
  const gHari = document.getElementById('hariMakanGroup');
  const gJumlah = document.getElementById('jumlahMakanGroup');

  if (mode === 'detail') {
    if (btnFlat) btnFlat.classList.remove('is-active');
    if (btnDetail) btnDetail.classList.add('is-active');
    if (gTarif) gTarif.style.display = 'none';
    if (gHari) gHari.style.display = 'none';
    if (gJumlah) gJumlah.style.display = 'none';
    if (wrapDetail) wrapDetail.style.display = 'block';

    const tbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
    if (tbody && tbody.children.length === 0) {
      const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
      for (let i = 1; i <= tripDays; i++) {
        addManualMealRow(`Hari ${i}`, 'Makan Siang');
      }
    }
  } else {
    // flat
    if (btnFlat) btnFlat.classList.add('is-active');
    if (btnDetail) btnDetail.classList.remove('is-active');
    if (wrapDetail) wrapDetail.style.display = 'none';
    if (gTarif) gTarif.style.display = '';
    if (gHari) gHari.style.display = '';
    if (gJumlah) gJumlah.style.display = '';
  }

  onManualMealRowChange();
}

function toggleDetailMakanSection(forceState) {
  setManualMealMode(forceState !== false ? 'detail' : 'flat');
}

function setManualMakanMode(mode) {
  setManualMealMode(mode);
}

function getManualMealDayOptions(selectedDay = 'Hari 1') {
  const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
  const count = Math.max(1, tripDays);
  let options = '';
  for (let i = 1; i <= count; i++) {
    const val = `Hari ${i}`;
    const sel = val === selectedDay ? 'selected' : '';
    options += `<option value="${val}" ${sel}>${val}</option>`;
  }
  const selMatch = selectedDay && selectedDay.match(/Hari\s+(\d+)/i);
  if (selMatch && parseInt(selMatch[1]) > count) {
    options += `<option value="${selectedDay}" selected>${selectedDay}</option>`;
  }
  return options;
}

const MANUAL_MEAL_SESSIONS = ['Makan Siang', 'Makan Malam', 'Makan Pagi', 'Makan Lainnya'];

function getManualMealSessionOptions(selectedSession = 'Makan Siang') {
  return MANUAL_MEAL_SESSIONS.map(s => `<option value="${s}" ${s === selectedSession ? 'selected' : ''}>${s}</option>`).join('');
}

function openMealDuplicateModal(day, session) {
  const overlay = document.getElementById('mealDuplicateOverlay');
  const msgEl = document.getElementById('mealDuplicateMsg');
  const titleEl = document.getElementById('mealDuplicateTitle');
  const sessionName = session || 'Makan Siang';
  const dayName = day || 'hari tersebut';

  if (day === 'seluruh hari') {
    if (titleEl) titleEl.textContent = 'Semua Sesi Makan Sudah Diinput';
    if (msgEl) {
      const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
      msgEl.textContent = `Semua sesi makan untuk ${tripDays} hari perjalanan dinas sudah diinput lengkap. Tidak ada sesi makan yang dapat ditambahkan lagi.`;
    }
  } else {
    if (titleEl) titleEl.textContent = 'Sesi Makan Sudah Diinput';
    if (msgEl) {
      msgEl.textContent = `Sesi ${sessionName} untuk ${dayName} sudah diinput sebelumnya. Tidak bisa menambahkan atau memilih sesi makan yang sama dua kali pada hari yang sama.`;
    }
  }

  if (overlay) {
    overlay.classList.add('is-open');
  } else {
    alert(`Sesi ${sessionName} untuk ${dayName} sudah diinput sebelumnya!`);
  }

  if (typeof showValidationToast === 'function') {
    showValidationToast(null, `Sesi ${sessionName} untuk ${dayName} sudah diinput sebelumnya!`);
  }
}

function closeMealDuplicateModal() {
  const overlay = document.getElementById('mealDuplicateOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function handleMealDuplicateBackdrop(event) {
  if (event.target && event.target.id === 'mealDuplicateOverlay') {
    closeMealDuplicateModal();
  }
}

function getMaxMealRateForDay(dayStr) {
  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  let defaultRate = sbm ? (sbm.makan || 0) : 0;

  if (typeof isMultiProvActive === 'function' && isMultiProvActive()) {
    const mpData = typeof getMultiProvData === 'function' ? getMultiProvData() : null;
    if (mpData && dayStr) {
      const m = String(dayStr).match(/Hari\s+(\d+)/i);
      const dayNum = m ? parseInt(m[1]) : 1;
      const d1 = parseInt(document.getElementById('hariProvinsi1')?.value) || 0;
      if (dayNum > d1 && mpData.sbm2 && mpData.sbm2.makan) {
        return mpData.sbm2.makan;
      } else if (mpData.sbm1 && mpData.sbm1.makan) {
        return mpData.sbm1.makan;
      }
    }
  }
  return defaultRate;
}

function openSbmLimitModal(componentOrOptions, maxRate, provName) {
  let title = 'Melebihi Batas SBM Daerah';
  let component = 'Biaya';
  let limitRate = maxRate;
  let province = provName;
  let customMsg = '';

  if (typeof componentOrOptions === 'object' && componentOrOptions !== null) {
    title = componentOrOptions.title || title;
    component = componentOrOptions.component || component;
    limitRate = componentOrOptions.maxRate !== undefined ? componentOrOptions.maxRate : maxRate;
    province = componentOrOptions.provName || provName;
    customMsg = componentOrOptions.msg || '';
  } else if (typeof componentOrOptions === 'string') {
    component = componentOrOptions;
  }

  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  if (!province && sbm) {
    province = typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi;
  }

  const overlay = document.getElementById('mealLimitOverlay');
  const titleEl = document.getElementById('mealLimitTitle');
  const msgEl = document.getElementById('mealLimitMsg');
  const maxFormatted = typeof rp === 'function' ? rp(limitRate) : `Rp ${Number(limitRate || 0).toLocaleString('id-ID')}`;

  if (titleEl) titleEl.textContent = title;
  if (msgEl) {
    if (customMsg) {
      msgEl.innerHTML = customMsg;
    } else {
      const provLabel = province ? ` untuk provinsi <strong>${province}</strong>` : '';
      msgEl.innerHTML = `Komponen <strong>${component}</strong>${provLabel} tidak boleh melebihi ketentuan Standar Biaya Masukan (SBM) sebesar <strong>${maxFormatted}</strong>. Nilai otomatis disesuaikan ke batas maksimum SBM.`;
    }
  }

  if (overlay) {
    overlay.classList.add('is-open');
  } else {
    alert(`⚠️ MELEBIHI BATAS SBM\n\nKomponen ${component}${province ? ' untuk ' + province : ''} tidak boleh melebihi batas SBM sebesar ${maxFormatted}. Nilai otomatis disesuaikan ke batas maksimum.`);
  }

  if (typeof showValidationToast === 'function') {
    showValidationToast(null, `${component} melebihi batas SBM ${maxFormatted}! Otomatis disesuaikan.`);
  }
}

function openMealLimitModal(dayName, maxRate) {
  const dayLabel = dayName ? ` untuk ${dayName}` : '';
  openSbmLimitModal({
    title: 'Melebihi Batas SBM Daerah',
    component: `Tarif Makan Riil${dayLabel}`,
    maxRate: maxRate,
    msg: `Tarif makan riil per orang${dayLabel} tidak boleh melebihi Standar Biaya Masukan (SBM) daerah tujuan sebesar <strong>${typeof rp === 'function' ? rp(maxRate) : 'Rp ' + maxRate}</strong>. Nilai otomatis disesuaikan ke batas maksimal SBM.`
  });
}

function closeMealLimitModal() {
  const overlay = document.getElementById('mealLimitOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function handleMealLimitBackdrop(event) {
  if (event.target && event.target.id === 'mealLimitOverlay') {
    closeMealLimitModal();
  }
}

function handleManualMealSelectChange(selectEl) {
  if (!selectEl) return;
  if (!selectEl.dataset) selectEl.dataset = {};
  const row = selectEl.closest ? selectEl.closest('.manual-meal-row') : selectEl.parentElement?.closest('.manual-meal-row');
  if (!row) return;

  const daySel = row.querySelector('.manual-meal-day');
  const sessionSel = row.querySelector('.manual-meal-session');
  if (!daySel || !sessionSel) return;

  const currentDay = daySel.value;
  const currentSession = sessionSel.value;

  const allRows = document.querySelectorAll('.manual-meal-row');
  let duplicateFound = false;

  allRows.forEach(otherRow => {
    if (otherRow === row) return;
    const otherDay = otherRow.querySelector('.manual-meal-day')?.value;
    const otherSession = otherRow.querySelector('.manual-meal-session')?.value;
    if (otherDay === currentDay && otherSession === currentSession) {
      duplicateFound = true;
    }
  });

  if (duplicateFound) {
    const prevVal = selectEl.dataset.prevValue;
    if (prevVal) {
      selectEl.value = prevVal;
    }
    openMealDuplicateModal(currentDay, currentSession);
    return;
  }

  selectEl.dataset.prevValue = selectEl.value;

  if (selectEl.classList.contains('manual-meal-day')) {
    const priceInput = row.querySelector('.manual-meal-price');
    if (priceInput) {
      const curVal = parseNumber(priceInput.value);
      const newMax = getMaxMealRateForDay(currentDay);
      if (newMax > 0 && curVal > newMax) {
        priceInput.value = rp(newMax);
        openMealLimitModal(currentDay, newMax);
      }
    }
  }

  onManualMealRowChange();
}

function addManualMealRow(day = null, session = null, price = '') {
  const tbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
  if (!tbody) return null;

  const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
  const currentCount = tbody.children.length;

  const takenSet = new Set();
  const existingRows = tbody.querySelectorAll ? tbody.querySelectorAll('.manual-meal-row') : (tbody.children || []);
  Array.from(existingRows).forEach(r => {
    const d = r.querySelector ? r.querySelector('.manual-meal-day')?.value : null;
    const s = r.querySelector ? r.querySelector('.manual-meal-session')?.value : null;
    if (d && s) takenSet.add(`${d}||${s}`);
  });

  if (!day || !session) {
    let candidateDay = null;
    let candidateSession = null;
    const standardSessions = ['Makan Siang', 'Makan Malam', 'Makan Pagi', 'Makan Lainnya'];

    for (const s of standardSessions) {
      for (let d = 1; d <= tripDays; d++) {
        const key = `Hari ${d}||${s}`;
        if (!takenSet.has(key)) {
          candidateDay = `Hari ${d}`;
          candidateSession = s;
          break;
        }
      }
      if (candidateDay) break;
    }

    if (!candidateDay) {
      openMealDuplicateModal('seluruh hari', 'Semua sesi makan');
      return null;
    }

    day = candidateDay;
    session = candidateSession;
  } else {
    const key = `${day}||${session}`;
    if (takenSet.has(key)) {
      openMealDuplicateModal(day, session);
      return null;
    }
  }

  const maxRate = getMaxMealRateForDay(day);
  let effectivePrice = (price !== null && price !== '' && price !== undefined) ? parseNumber(price) : maxRate;
  if (maxRate > 0 && effectivePrice > maxRate) {
    effectivePrice = maxRate;
  }

  const row = document.createElement('tr');
  row.className = 'manual-meal-row';
  row.innerHTML = `
    <td class="tc manual-meal-row-num">${currentCount + 1}</td>
    <td>
      <select class="manual-meal-day" onfocus="this.dataset.prevValue=this.value" onchange="handleManualMealSelectChange(this)">
        ${getManualMealDayOptions(day)}
      </select>
    </td>
    <td>
      <select class="manual-meal-session" onfocus="this.dataset.prevValue=this.value" onchange="handleManualMealSelectChange(this)">
        ${getManualMealSessionOptions(session)}
      </select>
    </td>
    <td>
      <input type="text" class="manual-meal-price" value="${effectivePrice > 0 ? (typeof rp === 'function' ? rp(effectivePrice) : effectivePrice) : ''}" placeholder="Rp 0" oninput="formatManualMealPriceInput(this); onManualMealRowChange();">
    </td>
    <td class="tc">
      <button type="button" class="manual-meal-btn-del" onclick="removeManualMealRow(this)" title="Hapus sesi makan ini">✕</button>
    </td>
  `;
  tbody.appendChild(row);

  const daySel = row.querySelector('.manual-meal-day');
  if (daySel) {
    daySel.value = day;
    if (!daySel.dataset) daySel.dataset = {};
    daySel.dataset.prevValue = day;
  }
  const sessionSel = row.querySelector('.manual-meal-session');
  if (sessionSel) {
    sessionSel.value = session;
    if (!sessionSel.dataset) sessionSel.dataset = {};
    sessionSel.dataset.prevValue = session;
  }

  reindexManualMealRows();
  onManualMealRowChange();
  return row;
}

function refreshManualMealDayOptions() {
  const tbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
  if (!tbody) return;
  const tripDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;

  const rows = [...(tbody.querySelectorAll ? tbody.querySelectorAll('.manual-meal-row') : (tbody.children || []))];
  rows.forEach(row => {
    const dayVal = row.querySelector ? row.querySelector('.manual-meal-day')?.value : null;
    const m = dayVal && dayVal.match(/Hari\s+(\d+)/i);
    if (m && parseInt(m[1]) > tripDays && tripDays > 0) {
      if (typeof row.remove === 'function') row.remove();
    }
  });

  const daySelects = tbody.querySelectorAll ? tbody.querySelectorAll('.manual-meal-day') : [];
  daySelects.forEach(sel => {
    const currentVal = sel.value;
    sel.innerHTML = getManualMealDayOptions(currentVal);
    sel.value = currentVal;
    if (!sel.dataset) sel.dataset = {};
    sel.dataset.prevValue = currentVal;
  });

  reindexManualMealRows();
  onManualMealRowChange();
}

function removeManualMealRow(btn) {
  const row = btn.closest('.manual-meal-row');
  if (row) {
    row.remove();
    reindexManualMealRows();
    onManualMealRowChange();
  }
}

function reindexManualMealRows() {
  const rows = document.querySelectorAll('.manual-meal-row');
  rows.forEach((row, idx) => {
    const numEl = row.querySelector('.manual-meal-row-num');
    if (numEl) numEl.textContent = idx + 1;
  });
}

function formatManualMealPriceInput(input) {
  const row = input.closest ? input.closest('.manual-meal-row') : input.parentElement?.closest('.manual-meal-row');
  const dayVal = row?.querySelector ? row.querySelector('.manual-meal-day')?.value : null;
  const maxRate = getMaxMealRateForDay(dayVal);
  const num = parseNumber(input.value);

  if (maxRate > 0 && num > maxRate) {
    input.value = typeof rp === 'function' ? rp(maxRate) : `Rp ${maxRate}`;
    openMealLimitModal(dayVal, maxRate);
    return;
  }

  if (num > 0) {
    input.value = typeof rp === 'function' ? rp(num) : `Rp ${num}`;
  } else if (input.value.trim() !== '') {
    input.value = '';
  }
}

function getManualMealEntries() {
  const rows = document.querySelectorAll('.manual-meal-row');
  const entries = [];
  rows.forEach((row, idx) => {
    const day = row.querySelector('.manual-meal-day')?.value || `Hari ${idx + 1}`;
    const session = row.querySelector('.manual-meal-session')?.value || 'Makan Siang';
    const price = parseNumber(row.querySelector('.manual-meal-price')?.value) || 0;
    if (price > 0) {
      entries.push({ id: idx + 1, day, session, price });
    }
  });
  return entries;
}

function updateManualMealSummary() {
  const sumEl = document.getElementById('manualMealSummary');
  if (!sumEl) return;
  const entries = getManualMealEntries();
  const total = entries.reduce((s, e) => s + e.price, 0);
  sumEl.textContent = `Total Potongan: ${entries.length} kali makan = ${rp(total)}`;
}

function onManualMealRowChange() {
  updateManualMealSummary();
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function onTarifMakanManualInput() {
  const cb = document.getElementById('cbTarifMakanManual');
  if (!cb?.checked) return;
  const jmMakan = document.getElementById('jumlahMakan');
  if (jmMakan && (Number(jmMakan.value) <= 0 || !jmMakan.value)) {
    jmMakan.value = '1';
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function onKonsumsiInputChange() {
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function toggleKonsumsiFields() {
  const jenis = document.getElementById('jenisKegiatan')?.value || 'biasa';
  const optBiasaWrap = document.getElementById('optKonsumsiBiasaWrap');
  const konsumsiFields = document.getElementById('konsumsiFields');
  const cbKonsumsiBiasa = document.getElementById('cbKonsumsiBiasa');
  const jmMakan = document.getElementById('jumlahMakan');

  if (jenis === 'rapat') {
    if (optBiasaWrap) optBiasaWrap.style.display = 'none';
    if (konsumsiFields) konsumsiFields.style.display = 'grid';
    if (jmMakan && (Number(jmMakan.value) <= 0 || !jmMakan.value)) {
      jmMakan.value = '1';
    }
  } else if (jenis === 'biasa') {
    if (optBiasaWrap) optBiasaWrap.style.display = 'flex';
    if (konsumsiFields) {
      konsumsiFields.style.display = cbKonsumsiBiasa?.checked ? 'grid' : 'none';
      if (cbKonsumsiBiasa?.checked) {
        if (jmMakan && (Number(jmMakan.value) <= 0 || !jmMakan.value)) {
          jmMakan.value = '1';
        }
      }
    }
  } else {
    // fullboard or diklat
    if (optBiasaWrap) optBiasaWrap.style.display = 'none';
    if (konsumsiFields) konsumsiFields.style.display = 'none';
  }
  updateSBMPreview();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function toggleUHFields() {
  const cb = document.getElementById('cbUH');
  const uhFields = document.getElementById('uhFields');
  if (!cb) return;

  const isChecked = !!cb.checked;
  if (uhFields) {
    uhFields.style.display = isChecked ? 'block' : 'none';
  }

  if (isChecked) {
    toggleKonsumsiFields();
  }

  updateSBMPreview();
  updateSbmWarnings();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
}

function toggleHotelFields() {
  const checked = document.getElementById('cbHotel').checked;
  document.getElementById('hotelFields').style.display = checked ? 'grid' : 'none';
  if (checked && !document.querySelectorAll('#hotelList .hotel-row').length) {
    addHotelRow(getDays().nights || 1);
  }
}

function formatHotelPriceInput(input) {
  const num = parseNumber(input.value);
  if (num > 0) {
    input.value = typeof rp === 'function' ? rp(num) : `Rp ${num}`;
  } else if (input.value.trim() !== '') {
    input.value = '';
  }
}

function addHotelRow(nights = 1, price = '') {
  const row = document.createElement('div');
  row.className = 'hotel-row';
  const displayPrice = price ? (typeof rp === 'function' ? rp(price) : price) : '';
  row.innerHTML = `
    <label class="hotel-field"><span>Nama hotel (opsional)</span><input type="text" class="hotel-name" placeholder="Contoh: Hotel Nusa Dua"></label>
    <label class="hotel-field hotel-field-nights"><span>Malam</span><input type="number" class="hotel-nights" min="0" step="1" value="${nights}"></label>
    <label class="hotel-field"><span>Harga per malam (Rp)</span><input type="text" class="hotel-price" value="${displayPrice}" placeholder="Isi harga manual" oninput="formatHotelPriceInput(this); updateHotelSummary(this.closest('.hotel-row'))"></label>
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
  const selected = [...selectedEmpIds];
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
  if (!row) return;
  const el = row.querySelector('.hotel-summary');
  if (!el) return;
  const nights = Math.max(0, Number(row.querySelector('.hotel-nights')?.value) || 0);
  const price = Math.max(0, parseNumber(row.querySelector('.hotel-price')?.value) || 0);
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
    name: row.querySelector('.hotel-name')?.value.trim() || '',
    nights: Math.max(0, Number(row.querySelector('.hotel-nights')?.value) || 0),
    price: Math.max(0, parseNumber(row.querySelector('.hotel-price')?.value) || 0),
    employeeIds: [...row.querySelectorAll('.hotel-guest-check:checked')].map(cb => Number(cb.dataset.employeeId))
  })).filter(item => item.name || item.price > 0);
}

const TRANSPORT_COST_RE = /\b(grab|grabcar|gojek|goride|gocar|grabbike|ojek|ojol|maxim|toll|tol|bensin|bbm|pertamax|pertalite|solar|parkir|taxi|taksi|angkot|mrt|krl|lrt|commuterline|tj|transjakarta|busway|transport)\b/i;
const TOLL_COST_RE = /\b(toll|tol)\b/i;
const TICKET_COST_RE = /\b(tiket|kereta|whoosh|pesawat|kapal|ferry|feri|speedboat)\b/i;
const TICKET_CATEGORY_RULES = [
  { re: /\b(kereta|kai)\b/i, label: 'Tiket Kereta' },
  { re: /\b(pesawat|penerbangan|flight)\b/i, label: 'Tiket Pesawat' },
  { re: /\bwhoosh\b/i, label: 'Tiket Whoosh' },
  { re: /\b(kapal|ferry|feri|speedboat|pelni)\b/i, label: 'Tiket Kapal' },
  { re: /\b(bus|travel|shuttle|damri)\b/i, label: 'Tiket Bus/Travel' }
];

function getTicketCostLabel(name) {
  if (!name) return 'Tiket Perjalanan';
  const rule = TICKET_CATEGORY_RULES.find(item => item.re.test(name));
  if (rule) return rule.label;
  let cleaned = name
    .replace(/\s*[\(\[]?\s*(pp|pulang\s*pergi|pergi|berangkat|pulang)\s*[\)\]]?\s*/gi, ' ')
    .replace(/\s*-\s*(pp|pulang\s*pergi|pergi|berangkat|pulang)\s*$/gi, '')
    .trim();
  if (!cleaned.toLowerCase().startsWith('tiket')) {
    cleaned = 'Tiket ' + cleaned;
  }
  return cleaned || 'Tiket Perjalanan';
}

function addCustomCost() {
  if (typeof isTripToDki === 'function' && isTripToDki()) {
    openDkiTransportModal();
    return;
  }
  const row = document.createElement('div');
  row.className = 'custom-cost-row';
  row.dataset.kindAuto = '1';
  row.innerHTML = `
    <div class="custom-cost-top">
      <div class="custom-cost-field custom-cost-name-field">
        <label class="custom-cost-label">Nama Biaya</label>
        <input type="text" class="custom-cost-name" placeholder="Contoh: Grab, Tol, Tiket kapal, atau Bensin" oninput="detectCustomCostKind(this)">
      </div>
      <div class="custom-cost-field custom-cost-kind-field">
        <label class="custom-cost-label">Kategori</label>
        <div class="custom-kind" role="group" aria-label="Kelompok biaya">
          <button type="button" class="custom-kind-btn active" data-kind="other" aria-pressed="true" onclick="setCustomCostKind(this)">Biaya lain</button>
          <button type="button" class="custom-kind-btn" data-kind="tiket" aria-pressed="false" onclick="setCustomCostKind(this)">Tiket</button>
          <button type="button" class="custom-kind-btn" data-kind="transport" aria-pressed="false" onclick="setCustomCostKind(this)">Transport PP</button>
        </div>
      </div>
      <div class="custom-cost-field custom-cost-del-field">
        <label class="custom-cost-label custom-cost-del-label" aria-hidden="true">&nbsp;</label>
        <button class="btn btn-warn custom-cost-del-btn" type="button" onclick="removeCustomCostRow(this)">Hapus</button>
      </div>
    </div>
    <div class="custom-route">
      <span class="custom-route-title">Keterangan Rute (Opsional)</span>
      <div class="custom-route-fields">
        <label class="custom-route-field custom-route-pickup"><span class="custom-route-label-pickup">Titik jemput</span><input type="text" class="custom-cost-pickup" placeholder="Contoh: Stasiun Gambir"></label>
        <label class="custom-route-field custom-route-dropoff"><span class="custom-route-label-dropoff">Titik antar</span><input type="text" class="custom-cost-dropoff" placeholder="Contoh: Rumah"></label>
      </div>
    </div>
    <div class="custom-cost-assignees-box">
      <div class="custom-cost-assignees-header">
        <span class="custom-cost-assignees-title">Nominal Biaya per Pegawai</span>
        <span class="custom-cost-assignees-tip">Diisi sesuai pembagian biaya untuk masing-masing pegawai</span>
      </div>
      <div class="custom-cost-assignees"></div>
    </div>
  `;
  document.getElementById('customCostList').appendChild(row);
  renderCustomCostAssignments(row);
  updateCustomCostRouteFields(row);
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
  const routeBox = row.querySelector('.custom-route');

  if (pickupLabel && dropoffLabel && pickupInput && dropoffInput) {
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
  }

  if (dropoffField) dropoffField.style.display = isToll ? 'none' : '';
  if (fields) fields.classList.toggle('single', isToll);
  if (routeBox) {
    const hasRouteVal = !!(pickupInput?.value?.trim() || dropoffInput?.value?.trim());
    routeBox.style.display = (kind === 'other' && !hasRouteVal) ? 'none' : '';
  }
}

function formatCustomCostAmountInput(input) {
  const num = parseNumber(input.value);
  if (num > 0) {
    input.value = typeof rp === 'function' ? rp(num) : `Rp ${num}`;
  } else if (input.value.trim() !== '') {
    input.value = '';
  }
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
    const val = parseNumber(input.value);
    if (val > 0) {
      currentAmounts[input.dataset.employeeId] = val;
    }
  });
  row.dataset.amounts = JSON.stringify(currentAmounts);

  if (selectedEmpIds.size === 0) {
    assignments.innerHTML = '<div class="custom-cost-empty">Pilih pegawai di Langkah 1 untuk mengatur nominal per orang.</div>';
    return;
  }

  assignments.innerHTML = [...selectedEmpIds].map(id => {
    const emp = employees.find(employee => employee.id === id);
    const rawVal = currentAmounts[id];
    const numVal = parseNumber(rawVal);
    const displayVal = numVal > 0 ? (typeof rp === 'function' ? rp(numVal) : 'Rp ' + numVal) : '';
    return `
      <label class="custom-cost-assignee">
        <span title="${emp ? emp.nama : ''}">${emp ? emp.nama : ''}</span>
        <input type="text" class="custom-cost-amount" data-employee-id="${id}" placeholder="Rp 0" value="${displayVal}" oninput="formatCustomCostAmountInput(this); updateCustomCostAmount(this)" aria-label="Biaya ${row.querySelector('.custom-cost-name')?.value || 'tambahan'} untuk ${emp ? emp.nama : ''}">
      </label>
    `;
  }).join('');
}

function updateCustomCostAmount(input) {
  const row = input.closest('.custom-cost-row');
  if (!row) return;
  let amounts = {};
  try {
    amounts = JSON.parse(row.dataset.amounts || '{}');
  } catch (error) {
    amounts = {};
  }
  const num = parseNumber(input.value);
  if (num > 0) {
    amounts[input.dataset.employeeId] = num;
  } else {
    delete amounts[input.dataset.employeeId];
  }
  row.dataset.amounts = JSON.stringify(amounts);
}

function refreshCustomCostAssignments() {
  document.querySelectorAll('.custom-cost-row').forEach(renderCustomCostAssignments);
}

function getCustomCosts() {
  return [...document.querySelectorAll('.custom-cost-row')].map(row => {
    const name = row.querySelector('.custom-cost-name')?.value.trim() || '';
    const kind = row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other';
    const isToll = kind === 'transport' && TOLL_COST_RE.test(name);
    return {
      name,
      kind,
      pickup: row.querySelector('.custom-cost-pickup')?.value.trim() || '',
      dropoff: isToll ? '' : row.querySelector('.custom-cost-dropoff')?.value.trim() || '',
      amounts: Object.fromEntries([...row.querySelectorAll('.custom-cost-amount')].map(input => [
        input.dataset.employeeId,
        Math.max(0, parseNumber(input.value) || 0)
      ]))
    };
  }).filter(item => item.name);
}

function updateSBMPreview() {
  const sbm = getSBM();
  const pv = document.getElementById('sbmPreview');
  if (!pv) return;
  if (!sbm) { pv.style.display = 'none'; return; }
  pv.style.display = 'block';
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';
  const multi = getMultiProvData();
  const cbUH = document.getElementById('cbUH');
  const isUHActive = !cbUH || cbUH.checked;

  const elUH = document.getElementById('sbm_uh');
  if (elUH) {
    if (!isUHActive) {
      elUH.textContent = `${rp(0)} (tidak dipilih)`;
    } else if (multi) {
      const p1 = getProvShortName(multi.sbm1.provinsi);
      const p2 = getProvShortName(multi.sbm2.provinsi);
      elUH.textContent = `${rp(multi.sbm1.uh)} (${p1}) & ${rp(multi.sbm2.uh)} (${p2})`;
    } else {
      elUH.textContent = isDkiJakarta ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.uh);
    }
  }
  const elDiklat = document.getElementById('sbm_diklat');
  if (elDiklat) elDiklat.textContent = !isUHActive ? `${rp(0)} (tidak dipilih)` : (isDkiJakarta ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.diklat || 110000));
  const elFullboard = document.getElementById('sbm_fullboard');
  if (elFullboard) elFullboard.textContent = !isUHActive ? `${rp(0)} (tidak dipilih)` : (isDkiJakarta ? `${rp(0)} (tidak dibayarkan)` : rp(sbm.fullboard || 130000));
  const isManualMakan = !!document.getElementById('cbTarifMakanManual')?.checked;
  const wrapDetail = document.getElementById('manualMealDetailWrap');
  const isDetailOpen = wrapDetail && wrapDetail.style.display !== 'none';
  const modeVal = document.getElementById('manualMakanMode')?.value || 'flat';
  const isDetailMode = modeVal === 'detail' || isDetailOpen;
  const manualMealEntries = isManualMakan ? getManualMealEntries() : [];
  const useDetail = isManualMakan && isDetailMode && manualMealEntries.length > 0;
  const manualMakanRate = parseNumber(document.getElementById('tarifMakan')?.value);
  const elMakan = document.getElementById('sbm_makan');
  if (elMakan) {
    if (isManualMakan) {
      if (useDetail) {
        const total = manualMealEntries.reduce((s, e) => s + e.price, 0);
        elMakan.textContent = `${rp(total)} (${manualMealEntries.length}x makan riil)`;
      } else {
        elMakan.textContent = `${rp(manualMakanRate)} (Manual)`;
      }
    } else {
      elMakan.textContent = rp(sbm.makan || 0);
    }
  }
  const elSnack = document.getElementById('sbm_snack');
  if (elSnack) elSnack.textContent = rp(sbm.snack || 0);
  document.getElementById('sbm_h4').textContent = rp(sbm.h4);
  document.getElementById('sbm_h3').textContent = rp(sbm.h3);

  if (sbm.isSekitarJakarta && sbm.sekitarJakarta) {
    document.getElementById('sbm_jkt').textContent = `${rp(sbm.jktPP)} (PP)`;
    document.getElementById('sbm_taxi').textContent = '- (termasuk rute PP)';
    document.getElementById('sbm_dpr').textContent = `${rp(sbm.dpr)} (PP: ${rp(sbm.dprOneWay)} x 2)`;
  } else {
    document.getElementById('sbm_jkt').textContent = sbm.jktPP ? rp(sbm.jktPP) : '(tidak ada/dalam kota)';
    document.getElementById('sbm_taxi').textContent = sbm.taxi ? rp(sbm.taxi) : '-';
    document.getElementById('sbm_dpr').textContent = isDkiJakarta ? `${rp(170000)} (otomatis)` : '- (hanya DKI Jakarta)';
  }
  document.getElementById('sbm_tiket').textContent = sbm.tiket ? rp(sbm.tiket) : '(tidak ada tiket pesawat)';

  const isDkiTarget = isDkiJakarta || (multi && ((multi.sbm1 && multi.sbm1.provinsi === 'DKI JAKARTA') || (multi.sbm2 && multi.sbm2.provinsi === 'DKI JAKARTA')));
  const noteJkt = document.getElementById('noteJakartaDPR');
  if (noteJkt) {
    if (sbm.isSekitarJakarta && sbm.sekitarJakarta) {
      noteJkt.style.display = 'block';
      noteJkt.innerHTML = `*Transport Jakarta &harr; ${sbm.sekitarJakarta.nama}: ${rp(sbm.dprOneWay)} (One Way) &times; 2 = <strong>${rp(sbm.dpr)} PP</strong> <span class="note-link">(Cek PMK Hal 68 ↗)</span>`;
      noteJkt.setAttribute('onclick', 'openPmkModal(68)');
      noteJkt.setAttribute('title', 'Klik untuk membuka dokumen resmi PMK Hal 68 (Transport Jakarta ke Daerah Sekitar)');
    } else if (isDkiTarget) {
      noteJkt.style.display = 'block';
      noteJkt.innerHTML = `*Khusus DKI Jakarta tidak mendapatkan uang harian. Tetapi, DPR yang dibayarkan sebesar Rp170.000 <span class="note-link">(Cek PMK Hal 69 ↗)</span>`;
      noteJkt.setAttribute('onclick', 'openPmkModal(69)');
      noteJkt.setAttribute('title', 'Klik untuk membuka dokumen resmi PMK Hal 69');
    } else {
      noteJkt.style.display = 'none';
    }
  }
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
    const selected = [...selectedEmpIds];
    const cbHotel = document.getElementById('cbHotel').checked;
    const cbTiket = document.getElementById('cbTiket').checked;
    const customCosts = getCustomCosts();
    const isDki = sbm.provinsi === 'DKI JAKARTA';
    const dprBase = isDki ? 170000 : 0;
    const cbDPR = isDki;

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
          const detailNote = sbm.isSekitarJakarta ? ` (One Way ${rp(sbm.dprOneWay)} x 2 PP)` : '';
          items.push({
            title: `Transport — ${emp.nama.split(',')[0]}`,
            text: `${rp(total)} melebihi SBM DPR ${rp(sbm.dpr)}${detailNote} sebesar ${rp(total - sbm.dpr)}.`
          });
        }
      });
    }

    if (sbm.tiket > 0) {
      const ticketGroups = new Map();
      const planeLabel = 'Tiket Pesawat';
      if (cbTiket) ticketGroups.set(planeLabel, []);
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
          const total = ticketExtra + (label === planeLabel && cbTiket ? sbm.tiket : 0);
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
  if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();
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
  const elHariMakan = document.getElementById('hariMakan');
  if (elHariMakan && !elHariMakan.value && diffDays > 0) {
    elHariMakan.placeholder = `${diffDays} (default)`;
  }
  const elHariSnack = document.getElementById('hariSnack');
  if (elHariSnack && !elHariSnack.value && diffDays > 0) {
    elHariSnack.placeholder = `${diffDays} (default)`;
  }
  const lblMultiTotal = document.getElementById('multiProvTotalLama');
  if (lblMultiTotal && diffDays > 0) {
    lblMultiTotal.textContent = `${diffDays} Hari`;
  }
  if (isMultiProvActive() && diffDays > 0) {
    const el1 = document.getElementById('hariProvinsi1');
    const el2 = document.getElementById('hariProvinsi2');
    if (el1 && el2) {
      const d1 = parseInt(el1.value) || 0;
      const d2 = parseInt(el2.value) || 0;
      if (d1 <= 0 || d2 <= 0 || (d1 + d2 !== diffDays)) {
        el1.value = Math.max(1, Math.floor(diffDays / 2));
        el2.value = Math.max(1, diffDays - parseInt(el1.value));
      }
    }
  }
  if (typeof renderTripDates === 'function') renderTripDates();
  if (typeof refreshManualMealDayOptions === 'function') refreshManualMealDayOptions();
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

// =====================================================================
// PENGATURAN KOMPONEN BIAYA PERORANGAN (Rincian per Orang Cockpit)
// =====================================================================
let employeeCostConfig = {};
let employeeTransports = {};
let currentCockpitTab = 'uh';

function getDefaultCostConfig(empId) {
  const isMealManual = !!document.getElementById('cbTarifMakanManual')?.checked;
  const isMeeting = document.getElementById('jenisKegiatan')?.value === 'rapat';
  const isBiasaWithKonsumsi = document.getElementById('jenisKegiatan')?.value === 'biasa' && !!document.getElementById('cbKonsumsiBiasa')?.checked;
  const hasKonsumsi = isMeeting || isBiasaWithKonsumsi || isMealManual;
  const rawMealDays = Number(document.getElementById('hariMakan')?.value);
  const rawMealCount = Number(document.getElementById('jumlahMakan')?.value);
  const rawSnackCount = Number(document.getElementById('jumlahSnack')?.value);
  const rawHotelNights = Number(document.getElementById('rc_hotelNights')?.value);
  const rawHotelPrice = (typeof parseNumber === 'function' ? parseNumber(document.getElementById('rc_hotelPrice')?.value) : Number(document.getElementById('rc_hotelPrice')?.value)) || 0;

  return {
    isCustomized: false,
    uhActive: document.getElementById('cbUH') ? document.getElementById('cbUH').checked : true,
    uhPercent: Number(document.getElementById('uhPersentase')?.value) || 1,
    jenisKeg: document.getElementById('jenisKegiatan')?.value || 'biasa',
    hasKonsumsi: hasKonsumsi,
    mealMode: isMealManual ? 'manual' : 'sbm',
    mealDays: (!isNaN(rawMealDays) && rawMealDays > 0) ? rawMealDays : null,
    mealCount: (!isNaN(rawMealCount) && rawMealCount > 0) ? rawMealCount : (isMealManual ? 1 : 0),
    snackCount: (!isNaN(rawSnackCount) && rawSnackCount > 0) ? rawSnackCount : 0,
    manualMeals: (typeof getManualMealEntries === 'function') ? getManualMealEntries() : [],
    hotelActive: document.getElementById('cbHotel') ? document.getElementById('cbHotel').checked : false,
    hotelMode: 'sbm',
    hotelName: '',
    hotelNights: rawHotelNights || 1,
    hotelPrice: rawHotelPrice,
    tickets: []
  };
}

function getEmployeeCostConfig(empId) {
  const key = String(empId);
  if (!employeeCostConfig[key] || !employeeCostConfig[key].isCustomized) {
    employeeCostConfig[key] = getDefaultCostConfig(empId);
  }
  return employeeCostConfig[key];
}

function setEmployeeCostConfig(empId, cfg) {
  const key = String(empId);
  employeeCostConfig[key] = cfg;
}

function clearEmployeeCostConfig() {
  employeeCostConfig = {};
}

function copyCurrentRincianConfigToAll() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Pilih pegawai terlebih dahulu.');
    return;
  }
  const currentEmpId = Number(select.value);
  if (isNaN(currentEmpId)) {
    alert('Pilih pegawai terlebih dahulu.');
    return;
  }
  const currentEmp = employees.find(e => e.id === currentEmpId);
  const currentName = currentEmp ? currentEmp.nama.split(',')[0] : 'pegawai ini';

  const cfg = getEmployeeCostConfig(currentEmpId);
  const trans = getEmployeeTransports(currentEmpId);

  let count = 0;
  [...selectedEmpIds].forEach(id => {
    if (id === currentEmpId) return;
    const cloned = JSON.parse(JSON.stringify(cfg));
    cloned.isCustomized = true;
    employeeCostConfig[String(id)] = cloned;
    employeeTransports[String(id)] = JSON.parse(JSON.stringify(trans));
    count++;
  });

  renderRincianEmpPills();
  renderRincianCockpit(currentEmpId);
  if (typeof renderRincian === 'function') renderRincian();

  alert(`✓ Pengaturan komponen biaya ${currentName} berhasil diterapkan ke seluruh (${count}) pegawai lainnya.`);
}

function switchRincianCockpitTab(tabKey) {
  currentCockpitTab = tabKey;
  document.querySelectorAll('.rincian-cockpit-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabKey);
  });
  document.querySelectorAll('.rincian-cockpit-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `pane_${tabKey}`);
  });
}

function renderRincianEmpPills() {
  const container = document.getElementById('rincianEmpPills');
  if (!container) return;
  const select = document.getElementById('rincianPegawai');
  const currentEmpId = (select && select.value !== '') ? Number(select.value) : null;

  if (selectedEmpIds.size === 0) {
    container.innerHTML = '<span class="empty-hint" style="padding:10px;color:var(--text-sub);">Belum ada pegawai dipilih</span>';
    return;
  }

  container.innerHTML = [...selectedEmpIds].map(id => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return '';
    const isActive = emp.id === currentEmpId;
    const b = hitungBiaya(emp);
    const shortName = emp.nama.split(',')[0];
    const initials = shortName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const fullSpd = (spdPerEmployee[emp.id] || '').trim();
    const spdPrefix = typeof getSpdNumberPrefix === 'function' ? getSpdNumberPrefix(fullSpd) : fullSpd.split('/')[0];
    const spdLabel = spdPrefix ? `SPD: ${spdPrefix}` : 'SPD: Kosong';
    const spdClass = spdPrefix ? 'is-set' : 'is-empty';

    return `
      <button type="button" class="rincian-emp-chip ${isActive ? 'active' : ''}" onclick="switchRincianEmployee(${emp.id})">
        <span class="emp-chip-avatar">${initials}</span>
        <div class="emp-chip-info">
          <div class="emp-chip-row-top">
            <span class="emp-chip-name">${typeof escHtml === 'function' ? escHtml(shortName) : shortName}</span>
            <span class="chip-spd-tag ${spdClass}">${spdLabel}</span>
          </div>
          <div class="emp-chip-row-bottom">
            <span class="emp-chip-sub">Gol. ${typeof escHtml === 'function' ? escHtml(emp.gol || '-') : (emp.gol || '-')}</span>
            <span class="emp-chip-total">${typeof rp === 'function' ? rp(b.total) : 'Rp ' + b.total}</span>
          </div>
        </div>
      </button>
    `;
  }).join('');
}

function switchRincianEmployee(empId) {
  const select = document.getElementById('rincianPegawai');
  if (select) {
    select.value = String(empId);
  }
  if (typeof loadRincianSPD === 'function') loadRincianSPD();
  renderRincianEmpPills();
  renderRincianCockpit(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function updateCockpitKpi(targetEmpId) {
  const select = document.getElementById('rincianPegawai');
  const empId = targetEmpId !== undefined ? Number(targetEmpId) : ((select && select.value !== '') ? Number(select.value) : null);
  if (empId === null || isNaN(empId)) return;

  const emp = employees.find(e => e.id === empId);
  if (!emp) return;
  const b = hitungBiaya(emp);

  const kpiTotalEl = document.getElementById('rincianKpiTotal');
  const kpiSubEl = document.getElementById('rincianKpiSub');
  const kpiUhVal = document.getElementById('kpiUhVal');
  const kpiHotelVal = document.getElementById('kpiHotelVal');
  const kpiTiketVal = document.getElementById('kpiTiketVal');
  const kpiTransportVal = document.getElementById('kpiTransportVal');

  if (kpiTotalEl) kpiTotalEl.textContent = typeof rp === 'function' ? rp(b.total) : 'Rp ' + b.total;
  if (kpiSubEl) kpiSubEl.innerHTML = `<strong>${typeof escHtml === 'function' ? escHtml(emp.nama) : emp.nama}</strong> &bull; ${emp.nip ? 'NIP ' + (typeof escHtml === 'function' ? escHtml(emp.nip) : emp.nip) : 'Gol. ' + (typeof escHtml === 'function' ? escHtml(emp.gol) : emp.gol)}`;
  if (kpiUhVal) kpiUhVal.textContent = typeof rp === 'function' ? rp(b.uh) : 'Rp ' + b.uh;
  if (kpiHotelVal) kpiHotelVal.textContent = typeof rp === 'function' ? rp(b.hotel) : 'Rp ' + b.hotel;
  const ticketTotal = b.tiket + (b.customCosts.filter(c => c.isTicket).reduce((s, c) => s + c.amount, 0));
  if (kpiTiketVal) kpiTiketVal.textContent = typeof rp === 'function' ? rp(ticketTotal) : 'Rp ' + ticketTotal;
  const transTotal = b.dpr + (b.customCosts.filter(c => c.isTransport).reduce((s, c) => s + c.amount, 0));
  if (kpiTransportVal) kpiTransportVal.textContent = typeof rp === 'function' ? rp(transTotal) : 'Rp ' + transTotal;

  if (typeof renderRincianEmpPills === 'function') renderRincianEmpPills();
}

function renderRincianCockpit(targetEmpId) {
  const select = document.getElementById('rincianPegawai');
  const empId = targetEmpId !== undefined ? Number(targetEmpId) : ((select && select.value !== '') ? Number(select.value) : null);
  if (empId === null || isNaN(empId)) return;

  const emp = employees.find(e => e.id === empId);
  if (!emp) return;

  const cfg = getEmployeeCostConfig(empId);
  const sbm = getSBM();
  const { days, nights } = getEmpDays(empId);
  const b = hitungBiaya(emp);

  // Update Spotlight Card
  const activeAvatarEl = document.getElementById('activeEmpAvatar');
  const activeNameEl = document.getElementById('activeEmpName');
  const activeMetaEl = document.getElementById('activeEmpMeta');
  const activeTipEl = document.getElementById('activeSpdTip');
  const shortName = emp.nama.split(',')[0];
  const initials = shortName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const fullSpd = (spdPerEmployee[emp.id] || '').trim();
  const spdPrefix = typeof getSpdNumberPrefix === 'function' ? getSpdNumberPrefix(fullSpd) : fullSpd.split('/')[0];

  if (activeAvatarEl) activeAvatarEl.textContent = initials;
  if (activeNameEl) activeNameEl.textContent = emp.nama;
  if (activeMetaEl) activeMetaEl.innerHTML = `Gol. <strong>${typeof escHtml === 'function' ? escHtml(emp.gol || '-') : (emp.gol || '-')}</strong> &bull; ${emp.nip ? 'NIP ' + (typeof escHtml === 'function' ? escHtml(emp.nip) : emp.nip) : (emp.jabatan ? (typeof escHtml === 'function' ? escHtml(emp.jabatan) : emp.jabatan) : 'Pegawai')}`;
  if (activeTipEl) {
    activeTipEl.textContent = fullSpd ? `Format lengkap: ${fullSpd}` : `Format: [Nomor] + ${typeof getSpdSuffix === 'function' ? getSpdSuffix() : '/SPD/Birkom/...'}`;
  }

  // Update input SPD value for active employee
  const spdInputEl = document.getElementById('rincianNoSPD');
  if (spdInputEl) spdInputEl.value = spdPrefix || '';
  if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();

  // Update KPI Overview
  updateCockpitKpi(empId);

  // Pane 1: Uang Harian
  const uhActiveEl = document.getElementById('rc_uhActive');
  const uhBodyEl = document.getElementById('rc_uhBody');
  const uhRateEl = document.getElementById('rc_uhRateHighlight');
  const uhPercentEl = document.getElementById('rc_uhPercent');
  const jenisKegEl = document.getElementById('rc_jenisKeg');
  const hasKonsumsiEl = document.getElementById('rc_hasKonsumsi');
  const konsumsiBodyEl = document.getElementById('rc_konsumsiBody');

  if (uhActiveEl) uhActiveEl.checked = !!cfg.uhActive;
  if (uhBodyEl) uhBodyEl.style.display = cfg.uhActive ? 'block' : 'none';
  if (uhRateEl) uhRateEl.textContent = `Tarif SBM: ${typeof rp === 'function' ? rp(sbm ? sbm.uh : 0) : 'Rp ' + (sbm ? sbm.uh : 0)} / hari (${days} hari)`;
  if (uhPercentEl) uhPercentEl.value = String(cfg.uhPercent ?? 1);
  if (jenisKegEl) jenisKegEl.value = cfg.jenisKeg || 'biasa';
  if (hasKonsumsiEl) hasKonsumsiEl.checked = !!cfg.hasKonsumsi;
  if (konsumsiBodyEl) konsumsiBodyEl.style.display = cfg.hasKonsumsi ? 'block' : 'none';

  // Meal submode
  const btnMealSbm = document.getElementById('rc_btnMealSbm');
  const btnMealManual = document.getElementById('rc_btnMealManual');
  const mealSbmWrap = document.getElementById('rc_mealSbmWrap');
  const mealManualWrap = document.getElementById('rc_mealManualWrap');
  const isManualMeal = cfg.mealMode === 'manual';

  if (btnMealSbm) btnMealSbm.classList.toggle('active', !isManualMeal);
  if (btnMealManual) btnMealManual.classList.toggle('active', isManualMeal);
  const radMealSbm = typeof document.querySelector === 'function' ? document.querySelector('input[name="rc_mealMode"][value="sbm"]') : null;
  const radMealManual = typeof document.querySelector === 'function' ? document.querySelector('input[name="rc_mealMode"][value="manual"]') : null;
  if (radMealSbm) radMealSbm.checked = !isManualMeal;
  if (radMealManual) radMealManual.checked = isManualMeal;

  if (mealSbmWrap) mealSbmWrap.style.display = isManualMeal ? 'none' : 'grid';
  if (mealManualWrap) mealManualWrap.style.display = isManualMeal ? 'block' : 'none';

  const mealDaysEl = document.getElementById('rc_mealDays') || document.getElementById('rc_hariMakan');
  const mealCountEl = document.getElementById('rc_mealCount') || document.getElementById('rc_makanCount');
  const snackCountEl = document.getElementById('rc_snackCount');
  if (mealDaysEl) mealDaysEl.value = cfg.mealDays ?? days;
  if (mealCountEl) mealCountEl.value = cfg.mealCount ?? (isManualMeal ? 1 : 0);
  if (snackCountEl) snackCountEl.value = cfg.snackCount ?? 0;

  renderCockpitManualMeals(empId);

  const deductSummaryEl = document.getElementById('rc_deductionSummary');
  const deductAmountEl = document.getElementById('rc_deductionAmount');
  const netUhAmountEl = document.getElementById('rc_netUhAmount');
  const totalDeduct = (b.mealDeduction || 0) + (b.snackDeduction || 0);

  if (deductAmountEl) deductAmountEl.textContent = typeof rp === 'function' ? (totalDeduct > 0 ? '- ' + rp(totalDeduct) : 'Rp 0') : (totalDeduct > 0 ? '- Rp ' + totalDeduct : 'Rp 0');
  if (netUhAmountEl) netUhAmountEl.textContent = typeof rp === 'function' ? rp(b.uh) : 'Rp ' + b.uh;
  if (deductSummaryEl && !deductAmountEl) {
    deductSummaryEl.innerHTML = `Total Potongan Konsumsi: <strong>${typeof rp === 'function' ? rp(totalDeduct) : 'Rp ' + totalDeduct}</strong>`;
  }

  // Update UH Effective Rate summary card
  const uhEffectiveRateEl = document.getElementById('rc_uhEffectiveRate');
  const uhEffectiveSubEl = document.getElementById('rc_uhEffectiveSub');
  if (uhEffectiveRateEl) {
    const effRate = Math.round((sbm ? sbm.uh : 0) * (cfg.uhPercent ?? 1));
    uhEffectiveRateEl.textContent = typeof rp === 'function' ? rp(effRate) : 'Rp ' + effRate;
  }
  if (uhEffectiveSubEl) {
    const persenText = (cfg.uhPercent === 0.6) ? '60% (Kendaraan Dinas)' : '100% (Standar Penuh)';
    uhEffectiveSubEl.textContent = `${persenText} • ${days} hari dinas`;
  }

  // Meal & snack rate badges
  const mealRateBadge = document.getElementById('rc_mealRateBadge');
  const snackRateBadge = document.getElementById('rc_snackRateBadge');
  if (mealRateBadge) mealRateBadge.textContent = `@ ${typeof rp === 'function' ? rp(sbm ? sbm.makan : 0) : 'Rp ' + (sbm ? sbm.makan : 0)}`;
  if (snackRateBadge) snackRateBadge.textContent = `@ ${typeof rp === 'function' ? rp(sbm ? sbm.snack : 0) : 'Rp ' + (sbm ? sbm.snack : 0)}`;

  // Pane 2: Hotel
  const hotelActiveEl = document.getElementById('rc_hotelActive');
  const hotelBodyEl = document.getElementById('rc_hotelBody');
  const btnHotelSbm = document.getElementById('rc_btnHotelSbm');
  const btnHotelManual = document.getElementById('rc_btnHotelManual');
  const hotelSbmCard = document.getElementById('rc_hotelSbmCard');
  const hotelManualCard = document.getElementById('rc_hotelManualCard');
  const isManualHotel = cfg.hotelMode === 'manual';

  if (hotelActiveEl) hotelActiveEl.checked = !!cfg.hotelActive;
  if (hotelBodyEl) hotelBodyEl.style.display = cfg.hotelActive ? 'block' : 'none';
  if (btnHotelSbm) btnHotelSbm.classList.toggle('active', !isManualHotel);
  if (btnHotelManual) btnHotelManual.classList.toggle('active', isManualHotel);
  const radHotelSbm = typeof document.querySelector === 'function' ? document.querySelector('input[name="rc_hotelMode"][value="sbm"]') : null;
  const radHotelManual = typeof document.querySelector === 'function' ? document.querySelector('input[name="rc_hotelMode"][value="manual"]') : null;
  if (radHotelSbm) radHotelSbm.checked = !isManualHotel;
  if (radHotelManual) radHotelManual.checked = isManualHotel;

  if (hotelSbmCard) hotelSbmCard.style.display = isManualHotel ? 'none' : 'block';
  if (hotelManualCard) hotelManualCard.style.display = isManualHotel ? 'grid' : 'none';

  const sbmRate = sbm ? getHotelRate(sbm, emp.gol) : 0;
  const hotelGolLabel = document.getElementById('rc_hotelGolLabel');
  const hotelSbmRate = document.getElementById('rc_hotelSbmRate');
  const hotelRatePerNight = document.getElementById('rc_hotelRatePerNight');
  const hotelNightsLabel = document.getElementById('rc_hotelNightsLabel');
  const hotelSbmNights = document.getElementById('rc_hotelSbmNights');
  const hotelSbmTotal = document.getElementById('rc_hotelSbmTotal');
  const hotelProvNameEl = document.getElementById('rc_hotelProvName');

  const activeNights = (cfg.hotelNights > 0) ? cfg.hotelNights : (nights > 0 ? nights : 1);

  if (hotelGolLabel) hotelGolLabel.textContent = `Gol. ${emp.gol || '-'}`;
  if (hotelSbmRate) hotelSbmRate.textContent = typeof rp === 'function' ? rp(sbmRate) : 'Rp ' + sbmRate;
  if (hotelRatePerNight) hotelRatePerNight.textContent = typeof rp === 'function' ? rp(sbmRate) : 'Rp ' + sbmRate;
  if (hotelNightsLabel) hotelNightsLabel.textContent = `${activeNights} malam`;
  if (hotelSbmNights) hotelSbmNights.value = activeNights;
  if (hotelSbmTotal) hotelSbmTotal.textContent = typeof rp === 'function' ? rp(sbmRate * activeNights) : 'Rp ' + (sbmRate * activeNights);
  if (hotelProvNameEl) hotelProvNameEl.textContent = `PMK SBM 2026 • ${sbm ? (typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi) : 'Provinsi Tujuan'}`;

  const hotelNameEl = document.getElementById('rc_hotelName') || document.getElementById('rc_hotelNameSbm');
  const hotelNameManualEl = document.getElementById('rc_hotelNameManual');
  if (hotelNameEl) hotelNameEl.value = cfg.hotelName || '';
  if (hotelNameManualEl) hotelNameManualEl.value = cfg.hotelName || '';

  const hotelNightsEl = document.getElementById('rc_hotelNights') || document.getElementById('rc_hotelNightsManual');
  if (hotelNightsEl && hotelNightsEl.tagName === 'INPUT') hotelNightsEl.value = cfg.hotelNights || nights || 1;

  const hotelPriceEl = document.getElementById('rc_hotelPrice') || document.getElementById('rc_hotelRateManual');
  if (hotelPriceEl) hotelPriceEl.value = cfg.hotelPrice ? (typeof rp === 'function' ? rp(cfg.hotelPrice) : 'Rp ' + cfg.hotelPrice) : '';

  // Pane 3: Tiket
  renderCockpitTickets(empId);

  // Pane 4: Transport
  renderRincianTransportEditor(empId);

  // Keep active cockpit tab visible
  if (typeof switchCockpitTab === 'function') {
    switchCockpitTab(currentCockpitTab || 'uh');
  }
}

function onCockpitUHChange(isBlur = false) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.uhActive = !!document.getElementById('rc_uhActive')?.checked;
  cfg.uhPercent = Number(document.getElementById('rc_uhPercent')?.value) || 1;
  cfg.jenisKeg = document.getElementById('rc_jenisKeg')?.value || 'biasa';
  const mealDaysEl = document.getElementById('rc_mealDays') || document.getElementById('rc_hariMakan');
  const mealCountEl = document.getElementById('rc_mealCount') || document.getElementById('rc_makanCount');
  const snackCountEl = document.getElementById('rc_snackCount');

  cfg.mealDays = Number(mealDaysEl?.value) || null;
  cfg.mealCount = Number(mealCountEl?.value) || 0;
  cfg.snackCount = Number(snackCountEl?.value) || 0;

  const uhBodyEl = document.getElementById('rc_uhBody');
  if (uhBodyEl) uhBodyEl.style.display = cfg.uhActive ? 'block' : 'none';

  const deductSummaryEl = document.getElementById('rc_deductionSummary');
  if (deductSummaryEl) {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const b = hitungBiaya(emp);
      const totalDeduct = (b.mealDeduction || 0) + (b.snackDeduction || 0);
      deductSummaryEl.innerHTML = `Total Potongan Konsumsi: <strong>${typeof rp === 'function' ? rp(totalDeduct) : 'Rp ' + totalDeduct}</strong>`;
    }
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function onCockpitKonsumsiToggle() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.hasKonsumsi = !!document.getElementById('rc_hasKonsumsi')?.checked;

  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function setCockpitMealMode(mode) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.mealMode = mode;

  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function renderCockpitManualMeals(empId) {
  const tbody = document.getElementById('rc_manualMealList') || document.getElementById('rc_manualMealRows');
  if (!tbody) return;

  const cfg = getEmployeeCostConfig(empId);
  const meals = cfg.manualMeals || [];
  const { days } = getEmpDays(empId);

  if (meals.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:12px; color:var(--text-sub);">
          Belum ada sesi makan riil. Klik <strong>+ Tambah Sesi Makan</strong> di bawah.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = meals.map((m, idx) => {
    let dayOptions = '';
    const maxDays = Math.max(days || 1, 1);
    for (let d = 1; d <= maxDays; d++) {
      const selected = m.day == d ? 'selected' : '';
      dayOptions += `<option value="${d}" ${selected}>Hari ${d}</option>`;
    }

    const dispAmount = m.price > 0 ? (typeof rp === 'function' ? rp(m.price) : 'Rp ' + m.price) : '';

    return `
      <tr data-idx="${idx}">
        <td style="text-align:center;">${idx + 1}</td>
        <td>
          <select class="cockpit-meal-day form-input-sm" onchange="onCockpitManualMealChange(this, ${idx}, true)">
            ${dayOptions}
          </select>
        </td>
        <td>
          <select class="cockpit-meal-session form-input-sm" onchange="onCockpitManualMealChange(this, ${idx}, true)">
            <option value="Makan Pagi" ${m.session === 'Makan Pagi' ? 'selected' : ''}>Makan Pagi</option>
            <option value="Makan Siang" ${m.session === 'Makan Siang' ? 'selected' : ''}>Makan Siang</option>
            <option value="Makan Malam" ${m.session === 'Makan Malam' ? 'selected' : ''}>Makan Malam</option>
          </select>
        </td>
        <td>
          <input type="text" class="cockpit-meal-price form-input-sm" placeholder="Rp 0" value="${dispAmount}" onfocus="this.select()" oninput="onCockpitManualMealChange(this, ${idx}, false)" onblur="onCockpitManualMealChange(this, ${idx}, true)">
        </td>
        <td style="text-align:center;">
          <button type="button" class="manual-meal-btn-del btn-del-sm" onclick="removeCockpitManualMealRow(${idx})" title="Hapus sesi makan" aria-label="Hapus sesi makan">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function addCockpitManualMealRow() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (!cfg.manualMeals) cfg.manualMeals = [];

  const { days } = getEmpDays(empId);
  const maxDays = Math.max(days || 1, 1);

  let targetDay = 1;
  let targetSession = 'Makan Siang';
  const sessions = ['Makan Pagi', 'Makan Siang', 'Makan Malam'];

  let found = false;
  for (let d = 1; d <= maxDays; d++) {
    for (const s of sessions) {
      const exists = cfg.manualMeals.some(m => m.day == d && m.session === s);
      if (!exists) {
        targetDay = d;
        targetSession = s;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    alert(`Seluruh sesi makan untuk durasi perjalanan (${maxDays} hari) sudah terinput.`);
    return;
  }

  cfg.manualMeals.push({
    day: targetDay,
    session: targetSession,
    price: 0
  });

  renderCockpitManualMeals(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function removeCockpitManualMealRow(idx) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (cfg.manualMeals && cfg.manualMeals[idx]) {
    cfg.manualMeals.splice(idx, 1);
  }

  renderCockpitManualMeals(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function onCockpitManualMealChange(el, idx, isBlur = false) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  if (!cfg.manualMeals || !cfg.manualMeals[idx]) return;

  const row = el.closest ? el.closest('tr') : el.parentElement?.closest('tr');
  if (!row) return;

  const dayVal = Number(row.querySelector('.cockpit-meal-day')?.value) || 1;
  const sessionVal = row.querySelector('.cockpit-meal-session')?.value || 'Makan Siang';
  let priceVal = (typeof parseNumber === 'function' ? parseNumber(row.querySelector('.cockpit-meal-price')?.value) : Number(row.querySelector('.cockpit-meal-price')?.value)) || 0;

  if (isBlur) {
    const isDuplicate = cfg.manualMeals.some((m, i) => i !== idx && m.day == dayVal && m.session === sessionVal);
    if (isDuplicate) {
      alert(`Perhatian: Hari ${dayVal} untuk sesi ${sessionVal} sudah pernah diinput.`);
    }

    const sbm = typeof getSBM === 'function' ? getSBM() : null;
    if (sbm && sbm.makan > 0 && priceVal > sbm.makan) {
      priceVal = sbm.makan;
      const priceInput = row.querySelector('.cockpit-meal-price');
      if (priceInput) priceInput.value = typeof rp === 'function' ? rp(sbm.makan) : `Rp ${sbm.makan}`;
      openMealLimitModal(`Hari ${dayVal}`, sbm.makan);
    } else {
      const priceInput = row.querySelector('.cockpit-meal-price');
      if (priceInput && priceVal > 0) {
        priceInput.value = typeof rp === 'function' ? rp(priceVal) : `Rp ${priceVal}`;
      }
    }
  }

  cfg.isCustomized = true;
  cfg.manualMeals[idx].day = dayVal;
  cfg.manualMeals[idx].session = sessionVal;
  cfg.manualMeals[idx].price = priceVal;

  const deductSummaryEl = document.getElementById('rc_deductionSummary');
  if (deductSummaryEl) {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const b = hitungBiaya(emp);
      const totalDeduct = (b.mealDeduction || 0) + (b.snackDeduction || 0);
      deductSummaryEl.innerHTML = `Total Potongan Konsumsi: <strong>${typeof rp === 'function' ? rp(totalDeduct) : 'Rp ' + totalDeduct}</strong>`;
    }
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function switchCockpitTab(tabKey) {
  if (!tabKey) tabKey = 'uh';
  currentCockpitTab = tabKey;

  // Update tabs
  const tabs = (typeof document.querySelectorAll === 'function') ? (document.querySelectorAll('.rincian-cockpit-tab') || []) : [];
  tabs.forEach(btn => {
    const isTarget = typeof btn.getAttribute === 'function' ? (btn.getAttribute('data-tab') === tabKey) : (btn.dataset && btn.dataset.tab === tabKey);
    btn.classList.toggle('active', isTarget);
    if (typeof btn.setAttribute === 'function') {
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    }
  });

  // Update panes
  const panes = (typeof document.querySelectorAll === 'function') ? (document.querySelectorAll('.rincian-cockpit-pane') || []) : [];
  panes.forEach(pane => {
    pane.classList.remove('active');
  });
  const targetPane = document.getElementById('pane_' + tabKey);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Ensure content in active pane is rendered
  const select = document.getElementById('rincianPegawai');
  const empId = select && select.value !== '' ? Number(select.value) : null;
  if (empId !== null && !isNaN(empId)) {
    if (tabKey === 'tiket') {
      if (typeof renderCockpitTickets === 'function') renderCockpitTickets(empId);
    } else if (tabKey === 'transport') {
      if (typeof renderRincianTransportEditor === 'function') renderRincianTransportEditor(empId);
    }
  }
}

function onCockpitHotelModeChange(mode) {
  setCockpitHotelMode(mode);
}

function onCockpitMealModeChange(mode) {
  setCockpitMealMode(mode);
}

function onCockpitHotelChange(isBlur = false, inputEl = null) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  const emp = employees.find(e => e.id === empId);
  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.hotelActive = !!document.getElementById('rc_hotelActive')?.checked;

  const hotelBodyEl = document.getElementById('rc_hotelBody');
  if (hotelBodyEl) hotelBodyEl.style.display = cfg.hotelActive ? 'block' : 'none';

  if (cfg.hotelMode === 'manual') {
    const nameEl = document.getElementById('rc_hotelNameManual') || document.getElementById('rc_hotelName');
    const nightsEl = document.getElementById('rc_hotelNights') || document.getElementById('rc_hotelNightsManual');
    const priceEl = document.getElementById('rc_hotelPrice') || document.getElementById('rc_hotelRateManual');

    if (nameEl) cfg.hotelName = nameEl.value || '';
    if (nightsEl && nightsEl.tagName === 'INPUT') cfg.hotelNights = Number(nightsEl.value) || 1;
    if (priceEl) {
      cfg.hotelPrice = (typeof parseNumber === 'function' ? parseNumber(priceEl.value) : Number(priceEl.value)) || 0;
    }
  } else {
    const nameEl = document.getElementById('rc_hotelName') || document.getElementById('rc_hotelNameManual') || document.getElementById('rc_hotelNameSbm');
    const sbmNightsEl = document.getElementById('rc_hotelSbmNights');
    if (nameEl) cfg.hotelName = nameEl.value || '';
    if (sbmNightsEl && sbmNightsEl.tagName === 'INPUT') cfg.hotelNights = Number(sbmNightsEl.value) || 1;
    const sbmRate = sbm ? getHotelRate(sbm, emp ? emp.gol : '') : 0;
    const hotelSbmTotal = document.getElementById('rc_hotelSbmTotal');
    if (hotelSbmTotal) {
      const activeNights = cfg.hotelNights || 1;
      hotelSbmTotal.textContent = typeof rp === 'function' ? rp(sbmRate * activeNights) : 'Rp ' + (sbmRate * activeNights);
    }
  }

  if (isBlur) {
    const priceEl = document.getElementById('rc_hotelPrice') || document.getElementById('rc_hotelRateManual');
    if (sbm && emp && cfg.hotelMode === 'manual') {
      const sbmHotelRate = typeof getHotelRate === 'function' ? getHotelRate(sbm, emp.gol) : 0;
      if (sbmHotelRate > 0 && cfg.hotelPrice > sbmHotelRate) {
        cfg.hotelPrice = sbmHotelRate;
        if (priceEl) priceEl.value = typeof rp === 'function' ? rp(sbmHotelRate) : `Rp ${sbmHotelRate}`;
        openSbmLimitModal({
          title: 'Melebihi Batas Plafon SBM Hotel',
          component: `Tarif Hotel Golongan ${emp.gol}`,
          maxRate: sbmHotelRate,
          provName: sbm.provinsi,
          msg: `Tarif hotel per malam untuk <strong>Golongan ${emp.gol}</strong> di <strong>${typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi}</strong> tidak boleh melebihi batas Standar Biaya Masukan (SBM) sebesar <strong>${typeof rp === 'function' ? rp(sbmHotelRate) : 'Rp ' + sbmHotelRate}</strong> / malam. Nilai otomatis disesuaikan ke pagu maksimal SBM.`
        });
      }
    }
    if (priceEl && cfg.hotelPrice > 0) {
      priceEl.value = typeof rp === 'function' ? rp(cfg.hotelPrice) : `Rp ${cfg.hotelPrice}`;
    }
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function setCockpitHotelMode(mode) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  cfg.hotelMode = mode;

  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function stepHotelSbmNights(delta) {
  const el = document.getElementById('rc_hotelSbmNights');
  if (!el) return;
  const curr = parseInt(el.value, 10) || 1;
  const next = Math.max(1, curr + delta);
  el.value = next;
  onCockpitHotelChange(false, el);
}

function stepHotelManualNights(delta) {
  const el = document.getElementById('rc_hotelNights');
  if (!el) return;
  const curr = parseInt(el.value, 10) || 1;
  const next = Math.max(1, curr + delta);
  el.value = next;
  onCockpitHotelChange(false, el);
}

function renderCockpitTickets(empId) {
  const container = document.getElementById('rc_ticketList');
  const totalBadge = document.getElementById('rc_ticketTotalBadge');
  if (!container) return;

  const cfg = getEmployeeCostConfig(empId);
  const tickets = cfg.tickets || [];
  let total = 0;

  if (tickets.length === 0) {
    container.innerHTML = `
      <div class="emp-trans-empty">
        Belum ada tiket perjalanan untuk pegawai ini.
        Gunakan tombol <strong>+ Kereta Api</strong>, <strong>+ Pesawat</strong>, atau <strong>+ Tiket Terpisah</strong> di atas.
      </div>`;
  } else {
    container.innerHTML = tickets.map((t, idx) => {
      total += (t.amount || 0);
      const dispAmount = t.amount > 0 ? (typeof rp === 'function' ? rp(t.amount) : 'Rp ' + t.amount) : '';
      const dir = t.direction || 'pp';
      return `
        <div class="emp-trans-row" data-idx="${idx}">
          <div class="emp-trans-col emp-trans-name-col">
            <label class="emp-trans-label">Jenis Tiket</label>
            <input type="text" class="cockpit-ticket-name" placeholder="Tiket Kereta Api / Pesawat..." value="${typeof escHtml === 'function' ? escHtml(t.name || '') : (t.name || '')}" oninput="onCockpitTicketChange(this, ${idx}, false)" onblur="onCockpitTicketChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-dir-col">
            <label class="emp-trans-label">Perjalanan / Arah</label>
            <select class="cockpit-ticket-direction" onchange="onCockpitTicketDirectionChange(this, ${idx})">
              <option value="pp" ${dir === 'pp' ? 'selected' : ''}>Pulang-Pergi (PP)</option>
              <option value="pergi" ${dir === 'pergi' ? 'selected' : ''}>Berangkat (Pergi)</option>
              <option value="pulang" ${dir === 'pulang' ? 'selected' : ''}>Pulang Saja</option>
            </select>
          </div>
          <div class="emp-trans-col emp-trans-route-col">
            <label class="emp-trans-label">Rute Perjalanan</label>
            <input type="text" class="cockpit-ticket-route" placeholder="Contoh: Jakarta - Yogyakarta (PP)" value="${typeof escHtml === 'function' ? escHtml(t.route || '') : (t.route || '')}" oninput="onCockpitTicketChange(this, ${idx}, false)" onblur="onCockpitTicketChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-amount-col">
            <label class="emp-trans-label">Harga Tiket (Rp)</label>
            <input type="text" class="cockpit-ticket-amount" placeholder="Rp 0" value="${dispAmount}" onfocus="this.select()" oninput="onCockpitTicketChange(this, ${idx}, false)" onblur="onCockpitTicketChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-del-col">
            <label class="emp-trans-label">&nbsp;</label>
            <button type="button" class="btn btn-warn emp-trans-del-btn" onclick="removeCockpitTicket(${idx})">Hapus</button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (totalBadge) {
    totalBadge.innerHTML = `Total Tiket: <strong>${typeof rp === 'function' ? rp(total) : 'Rp ' + total}</strong>`;
  }
}

function onCockpitTicketDirectionChange(selectEl, idx) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  if (!cfg.tickets || !cfg.tickets[idx]) return;

  const dir = selectEl.value || 'pp';
  cfg.isCustomized = true;
  cfg.tickets[idx].direction = dir;

  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const kotaTujuan = document.getElementById('kotaTujuan')?.value || '';

  let newRoute = '';
  if (dir === 'pp') {
    newRoute = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan} (PP)` : '';
  } else if (dir === 'pergi') {
    newRoute = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan}` : '';
  } else if (dir === 'pulang') {
    newRoute = (kotaAsal && kotaTujuan) ? `${kotaTujuan} - ${kotaAsal}` : '';
  }

  if (newRoute) {
    cfg.tickets[idx].route = newRoute;
    const row = selectEl.closest ? selectEl.closest('.emp-trans-row') : selectEl.parentElement?.closest('.emp-trans-row');
    const routeInput = row ? row.querySelector('.cockpit-ticket-route') : null;
    if (routeInput) routeInput.value = newRoute;
  }

  // Update suggested name if generic
  let currentName = cfg.tickets[idx].name || '';
  const baseName = currentName.replace(/\s*\((Berangkat|Pulang|PP|Pergi)\)\s*/gi, '').trim();
  if (baseName) {
    let suggestedName = baseName;
    if (dir === 'pergi') suggestedName = `${baseName} (Berangkat)`;
    else if (dir === 'pulang') suggestedName = `${baseName} (Pulang)`;
    else if (dir === 'pp') suggestedName = baseName;

    cfg.tickets[idx].name = suggestedName;
    const row = selectEl.closest ? selectEl.closest('.emp-trans-row') : selectEl.parentElement?.closest('.emp-trans-row');
    const nameInput = row ? row.querySelector('.cockpit-ticket-name') : null;
    if (nameInput) nameInput.value = suggestedName;
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function addCockpitTicketPreset(name, direction = 'pp') {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (!cfg.tickets) cfg.tickets = [];

  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const kotaTujuan = document.getElementById('kotaTujuan')?.value || '';

  let defaultRoute = '';
  if (direction === 'pergi') {
    defaultRoute = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan}` : '';
  } else if (direction === 'pulang') {
    defaultRoute = (kotaAsal && kotaTujuan) ? `${kotaTujuan} - ${kotaAsal}` : '';
  } else {
    defaultRoute = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan} (PP)` : '';
  }

  cfg.tickets.push({
    id: 'tkt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: name,
    direction: direction,
    route: defaultRoute,
    amount: 0
  });

  renderCockpitTickets(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function addCockpitSeparateTicketsPreset(name = 'Tiket Kereta Api') {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (!cfg.tickets) cfg.tickets = [];

  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';
  const kotaTujuan = document.getElementById('kotaTujuan')?.value || '';

  const rutePergi = (kotaAsal && kotaTujuan) ? `${kotaAsal} - ${kotaTujuan}` : '';
  const rutePulang = (kotaAsal && kotaTujuan) ? `${kotaTujuan} - ${kotaAsal}` : '';

  cfg.tickets.push({
    id: 'tkt_' + Date.now() + '_dep_' + Math.random().toString(36).substr(2, 4),
    name: `${name} (Berangkat)`,
    direction: 'pergi',
    route: rutePergi,
    amount: 0
  });

  cfg.tickets.push({
    id: 'tkt_' + Date.now() + '_ret_' + Math.random().toString(36).substr(2, 4),
    name: `${name} (Pulang)`,
    direction: 'pulang',
    route: rutePulang,
    amount: 0
  });

  renderCockpitTickets(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function removeCockpitTicket(idx) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  cfg.isCustomized = true;
  if (cfg.tickets && cfg.tickets[idx]) {
    cfg.tickets.splice(idx, 1);
  }

  renderCockpitTickets(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
}

function onCockpitTicketChange(inputEl, idx, isBlur = false) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;

  const cfg = getEmployeeCostConfig(empId);
  if (!cfg.tickets || !cfg.tickets[idx]) return;

  const row = inputEl.closest ? inputEl.closest('.emp-trans-row') : inputEl.parentElement?.closest('.emp-trans-row');
  if (!row) return;

  const nameVal = row.querySelector('.cockpit-ticket-name')?.value || '';
  const dirVal = row.querySelector('.cockpit-ticket-direction')?.value || cfg.tickets[idx].direction || 'pp';
  const routeVal = row.querySelector('.cockpit-ticket-route')?.value || '';
  let amountVal = (typeof parseNumber === 'function' ? parseNumber(row.querySelector('.cockpit-ticket-amount')?.value) : Number(row.querySelector('.cockpit-ticket-amount')?.value)) || 0;

  cfg.isCustomized = true;
  cfg.tickets[idx].name = nameVal;
  cfg.tickets[idx].direction = dirVal;
  cfg.tickets[idx].route = routeVal;
  cfg.tickets[idx].amount = amountVal;

  const sbm = typeof getSBM === 'function' ? getSBM() : null;

  if (isBlur) {
    if (sbm) {
      let maxTicket = (sbm.tiket && sbm.tiket > 0) ? sbm.tiket : (sbm.dpr > 0 ? Math.max(sbm.dpr, 1000000) : 2500000);
      if (dirVal === 'pergi' || dirVal === 'pulang') {
        maxTicket = Math.round(maxTicket / 2);
      }
      if (amountVal > maxTicket) {
        // Sesuai PMK: Tiket diperkenankan melebihi SBM kebutuhan riil dengan melampirkan SPTJM
        const dirLabel = dirVal === 'pp' ? 'Tiket Perjalanan (PP)' : (dirVal === 'pergi' ? 'Tiket Berangkat' : 'Tiket Pulang');
        openSbmLimitModal({
          title: 'Perhatian: Tiket Melebihi Pagu SBM (Wajib SPTJM)',
          component: dirLabel,
          maxRate: maxTicket,
          provName: sbm.provinsi,
          msg: `Harga ${dirLabel} sebesar <strong>${typeof rp === 'function' ? rp(amountVal) : 'Rp ' + amountVal}</strong> melebihi pagu Standar Biaya Masukan (SBM) untuk tujuan <strong>${typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi}</strong> (Pagu SBM: <strong>${typeof rp === 'function' ? rp(maxTicket) : 'Rp ' + maxTicket}</strong>).<br><br>⚠️ <em>Catatan Pertanggungjawaban (PMK):</em><br>Pengeluaran tiket yang melebihi standar biaya diperkenankan sesuai harga riil, <strong>namun jangan lupa untuk membuat dan melampirkan Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)</strong> dari PPK / Pelaksana Perjalanan Dinas.<br><br><em>Nominal riil Rp ${Number(amountVal).toLocaleString('id-ID')} tetap dipertahankan dan dihitung penuh ke dalam kuitansi &amp; rincian biaya.</em>`
        });
      }
    }
    const amtInput = row.querySelector('.cockpit-ticket-amount');
    if (amtInput && amountVal > 0) {
      amtInput.value = typeof rp === 'function' ? rp(amountVal) : `Rp ${amountVal}`;
    }
    if (typeof renderRincian === 'function') renderRincian();
  }

  const totalBadge = document.getElementById('rc_ticketTotalBadge');
  if (totalBadge) {
    const total = (cfg.tickets || []).reduce((sum, t) => sum + (t.amount || 0), 0);
    totalBadge.innerHTML = `Total Tiket: <strong>${typeof rp === 'function' ? rp(total) : 'Rp ' + total}</strong>`;
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

// =====================================================================
// TRANSPORT LOKAL / DPR PERORANGAN (Rincian per Orang)
// =====================================================================
function isTripToDki() {
  const kotaTujuan = typeof document !== 'undefined' ? (document.getElementById('kotaTujuan')?.value || '') : '';
  const sekitar = typeof getSbmSekitarJakarta === 'function' ? getSbmSekitarJakarta(kotaTujuan) : null;
  // Jika tujuan adalah salah satu daerah sekitar Jakarta (termasuk Kepulauan Seribu),
  // maka bukan perjalanan dalam kota Jakarta flat Rp 170.000, melainkan tarif SBM Sekitar Jakarta (One Way x 2 = PP)
  if (sekitar) {
    return false;
  }
  if (typeof isMultiProvActive === 'function' && isMultiProvActive()) {
    const multi = typeof getMultiProvData === 'function' ? getMultiProvData() : null;
    if (multi && ((multi.sbm1 && multi.sbm1.provinsi === 'DKI JAKARTA') || (multi.sbm2 && multi.sbm2.provinsi === 'DKI JAKARTA'))) {
      return true;
    }
  }
  const id = parseInt(document.getElementById('provinsiTujuan')?.value);
  const sbm = (typeof sbmData !== 'undefined' && Array.isArray(sbmData)) ? (sbmData.find(s => s.id === id) || null) : null;
  return !!(sbm && sbm.provinsi === 'DKI JAKARTA');
}

function openDkiTransportModal() {
  const overlay = document.getElementById('dkiTransportOverlay');
  if (overlay) {
    overlay.classList.add('is-open');
  } else {
    alert('⚠️ PERJALANAN DINAS DKI JAKARTA\n\nUntuk kegiatan perjalanan dinas di DKI Jakarta, komponen transport menggunakan tarif tetap Daftar Pengeluaran Riil (DPR) sebesar Rp 170.000 / orang secara default/otomatis sesuai ketentuan SBM, sehingga tidak dapat ditambah atau diedit dengan rincian transport manual.');
  }
}

function closeDkiTransportModal() {
  const overlay = document.getElementById('dkiTransportOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function handleDkiTransportBackdrop(e) {
  if (e.target && e.target.id === 'dkiTransportOverlay') {
    closeDkiTransportModal();
  }
}

function getEmployeeTransports(empId) {
  const key = String(empId);
  if (!employeeTransports[key]) {
    employeeTransports[key] = [];
  }
  return employeeTransports[key];
}

function setEmployeeTransports(empId, list) {
  const key = String(empId);
  employeeTransports[key] = Array.isArray(list) ? list : [];
}

function clearEmployeeTransports() {
  employeeTransports = {};
}

function getTransportDateColor(empId, date = '') {
  const cfg = typeof getEmployeeCostConfig === 'function' ? getEmployeeCostConfig(empId) : null;
  if (!cfg) return '#fef3c7';
  if (date && cfg.transportDateColors && cfg.transportDateColors[date]) {
    return cfg.transportDateColors[date];
  }
  return cfg.transportDateColor || '#fef3c7';
}

function setTransportDateColor(empId, color) {
  const cfg = typeof getEmployeeCostConfig === 'function' ? getEmployeeCostConfig(empId) : null;
  if (!cfg) return;
  cfg.transportDateColor = color;
  cfg.isCustomized = true;
  setEmployeeCostConfig(empId, cfg);
  renderRincianTransportEditor(empId);
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof renderDPR === 'function') renderDPR();
}

function setTransportDateColorForDate(empId, date, color) {
  const cfg = typeof getEmployeeCostConfig === 'function' ? getEmployeeCostConfig(empId) : null;
  if (!cfg) return;
  if (!cfg.transportDateColors) cfg.transportDateColors = {};
  cfg.transportDateColors[date] = color;
  cfg.isCustomized = true;
  setEmployeeCostConfig(empId, cfg);
  renderRincianTransportEditor(empId);
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof renderDPR === 'function') renderDPR();
}

function renderRincianTransportEditor(targetEmpId) {
  const select = document.getElementById('rincianPegawai');
  const rowsContainer = document.getElementById('rincianTransportRows');
  const summaryEl = document.getElementById('rincianTransportSummary');
  if (!rowsContainer) return;

  const empId = targetEmpId !== undefined ? Number(targetEmpId) : ((select && select.value !== '') ? Number(select.value) : null);
  if (empId === null || isNaN(empId)) {
    rowsContainer.innerHTML = '';
    return;
  }

  // Jika tujuan DKI JAKARTA: Transport otomatis tarif tetap DPR Rp 170.000
  if (isTripToDki()) {
    rowsContainer.innerHTML = `
      <div class="emp-trans-dki-notice" style="background: linear-gradient(135deg, rgba(37,99,235,0.06), rgba(59,130,246,0.12)); border: 1.5px solid rgba(59,130,246,0.35); border-radius: 12px; padding: 18px 20px; margin: 10px 0;">
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <span style="font-size: 28px; line-height: 1;">🏛️</span>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #1e40af; margin-bottom: 5px;">Perjalanan Dinas Dalam Kota DKI Jakarta (Tarif Tetap DPR)</div>
            <p style="margin: 0 0 8px 0; font-size: 12.5px; color: #1e3a8a; line-height: 1.5;">
              Sesuai ketentuan SBM TA 2026, biaya transport kegiatan di DKI Jakarta telah ditetapkan berupa <strong>Daftar Pengeluaran Riil (DPR) sebesar Rp 170.000 / orang</strong> secara default/otomatis.
            </p>
            <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 6px;">
              🔒 Transport Terkunci: Default Rp 170.000 (Otomatis)
            </div>
          </div>
        </div>
      </div>
    `;
    if (summaryEl) {
      summaryEl.innerHTML = `Transport DKI: <strong>Rp 170.000 (DPR Otomatis)</strong>`;
    }
    return;
  }

  const emp = employees.find(e => e.id === empId);
  const list = getEmployeeTransports(empId);
  let total = 0;

  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  const isSekitar = sbm && sbm.isSekitarJakarta && sbm.sekitarJakarta;
  const sekitarBannerHtml = isSekitar ? `
    <div class="emp-trans-sekitar-banner">
      <div class="emp-trans-sekitar-text">
        <span class="sekitar-label">🚆 SBM Transport Jakarta &harr; ${sbm.sekitarJakarta.nama} (PP):</span>
        <span class="sekitar-detail">Tarif SBM One Way <strong>${rp(sbm.dprOneWay)}</strong> &times; 2 = Maks DPR <strong>${rp(sbm.dpr)} PP</strong></span>
      </div>
      <div class="emp-trans-sekitar-actions">
        <button type="button" class="btn-isi-sbm-pp" onclick="addSekitarJakartaTransportPreset()" title="Isi otomatis 1 baris transport tarif penuh SBM (${rp(sbm.dpr)})">+ Isi SBM PP (${rp(sbm.dpr)})</button>
        <button type="button" class="btn-pmk-hal-link" onclick="openPmkModal(68)" title="Cek Dokumen Resmi PMK Hal 68">PMK Hal 68 ↗</button>
      </div>
    </div>
  ` : '';

  const currentColor = getTransportDateColor(empId);
  const colorToolbarHtml = `
    <div class="transport-toolbar-row">
      <div class="transport-color-picker-wrap">
        <span class="trans-toolbar-label">🎨 Warna Header Tanggal (DPR):</span>
        <div class="trans-color-presets">
          <button type="button" class="trans-color-swatch ${currentColor==='#fef3c7'?'active':''}" style="background:#fef3c7" onclick="setTransportDateColor('${empId}', '#fef3c7')" title="Kuning Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#e0f2fe'?'active':''}" style="background:#e0f2fe" onclick="setTransportDateColor('${empId}', '#e0f2fe')" title="Biru Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#f1f5f9'?'active':''}" style="background:#f1f5f9" onclick="setTransportDateColor('${empId}', '#f1f5f9')" title="Abu-abu Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#dcfce7'?'active':''}" style="background:#dcfce7" onclick="setTransportDateColor('${empId}', '#dcfce7')" title="Hijau Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#ede9fe'?'active':''}" style="background:#ede9fe" onclick="setTransportDateColor('${empId}', '#ede9fe')" title="Ungu Lembut"></button>
          <button type="button" class="trans-color-swatch ${currentColor==='#ffffff'?'active':''}" style="background:#ffffff; border:1px solid #cbd5e1;" onclick="setTransportDateColor('${empId}', '#ffffff')" title="Putih/Tanpa Warna"></button>
          <label class="trans-color-custom-btn" title="Pilih warna kustom bebas">
            <input type="color" value="${currentColor}" onchange="setTransportDateColor('${empId}', this.value)">
            <span>Kustom</span>
          </label>
        </div>
      </div>
      <div class="trans-hint-text">
        <small style="color:var(--text-muted, #64748b);">💡 Baris dengan tanggal sama akan otomatis dikelompokkan</small>
      </div>
    </div>
  `;

  if (list.length === 0) {
    rowsContainer.innerHTML = sekitarBannerHtml + colorToolbarHtml + `
      <div class="emp-trans-empty">
        Belum ada rincian transport untuk ${emp ? emp.nama.split(',')[0] : 'pegawai ini'}.
        Gunakan tombol <strong>+ Grab</strong>, <strong>+ Gojek</strong>, <strong>+ MRT</strong>, <strong>+ KRL</strong>, dll. di atas atau klik <strong>Tambah Baris Transport</strong>.
      </div>`;
  } else {
    rowsContainer.innerHTML = sekitarBannerHtml + colorToolbarHtml + list.map((item, idx) => {
      total += (item.amount || 0);
      const dispAmount = item.amount > 0 ? (typeof rp === 'function' ? rp(item.amount) : 'Rp ' + item.amount) : '';
      return `
        <div class="emp-trans-row" data-idx="${idx}">
          <div class="emp-trans-col emp-trans-date-col">
            <label class="emp-trans-label">Tanggal</label>
            <input type="date" class="emp-trans-date" value="${item.date || ''}" onchange="onEmployeeTransportRowChange(this, ${idx}, true)" oninput="onEmployeeTransportRowChange(this, ${idx}, false)">
          </div>
          <div class="emp-trans-col emp-trans-name-col">
            <label class="emp-trans-label">Jenis / Moda</label>
            <input type="text" class="emp-trans-name" placeholder="Grab, MRT, Tol..." value="${typeof escHtml === 'function' ? escHtml(item.name || '') : (item.name || '')}" list="listTransportPresets" oninput="onEmployeeTransportRowChange(this, ${idx}, false)" onblur="onEmployeeTransportRowChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-pickup-col">
            <label class="emp-trans-label">Titik Jemput</label>
            <input type="text" class="emp-trans-pickup" placeholder="Contoh: Rumah / Stasiun Gambir" value="${typeof escHtml === 'function' ? escHtml(item.pickup || '') : (item.pickup || '')}" oninput="onEmployeeTransportRowChange(this, ${idx}, false)" onblur="onEmployeeTransportRowChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-dropoff-col">
            <label class="emp-trans-label">Titik Antar</label>
            <input type="text" class="emp-trans-dropoff" placeholder="Contoh: Stasiun Halim / Kantor" value="${typeof escHtml === 'function' ? escHtml(item.dropoff || '') : (item.dropoff || '')}" oninput="onEmployeeTransportRowChange(this, ${idx}, false)" onblur="onEmployeeTransportRowChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-amount-col">
            <label class="emp-trans-label">Biaya / Tarif (Rp)</label>
            <input type="text" class="emp-trans-amount" placeholder="Rp 0" value="${dispAmount}" onfocus="this.select()" oninput="onEmployeeTransportRowChange(this, ${idx}, false)" onblur="onEmployeeTransportRowChange(this, ${idx}, true)">
          </div>
          <div class="emp-trans-col emp-trans-del-col">
            <label class="emp-trans-label">&nbsp;</label>
            <button type="button" class="btn btn-warn emp-trans-del-btn" onclick="removeEmployeeTransportRow(${idx})">Hapus</button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (summaryEl) {
    const sbmDprLimit = (sbm && sbm.dpr > 0) ? sbm.dpr : 0;
    const limitLabel = sbmDprLimit > 0 ? ` <span style="font-weight: normal; color: #64748b;">(Maks SBM: ${typeof rp === 'function' ? rp(sbmDprLimit) : 'Rp ' + sbmDprLimit} PP)</span>` : '';
    summaryEl.innerHTML = `Total Transport: <strong>${typeof rp === 'function' ? rp(total) : 'Rp ' + total}</strong>${limitLabel}`;
  }
}

function addSekitarJakartaTransportPreset() {
  const sbm = typeof getSBM === 'function' ? getSBM() : null;
  if (!sbm || !sbm.isSekitarJakarta) return;
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  const empId = Number(select.value);
  if (isNaN(empId)) return;
  const list = getEmployeeTransports(empId);
  const lastDate = (list.length > 0 && list[list.length - 1].date)
    ? list[list.length - 1].date
    : (document.getElementById('tglBerangkat')?.value || '');
  const kotaAsal = document.getElementById('cfg_kotaAsal')?.value || 'Jakarta';

  const currentTotal = list.reduce((sum, it) => sum + (it.amount || 0), 0);
  const remainingPagu = Math.max(0, sbm.dpr - currentTotal);
  const amountToFill = list.length === 0 ? sbm.dpr : remainingPagu;

  list.push({
    id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    date: lastDate,
    name: `Transport ${kotaAsal} - ${sbm.sekitarJakarta.nama} (PP)`,
    pickup: 'Rumah / Kantor',
    dropoff: `Lokasi Tugas (${sbm.sekitarJakarta.nama})`,
    amount: amountToFill
  });
  setEmployeeTransports(empId, list);
  renderRincianTransportEditor(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
}

function onKotaTujuanChange() {
  const val = (document.getElementById('kotaTujuan')?.value || '').trim();
  const sekitar = typeof getSbmSekitarJakarta === 'function' ? getSbmSekitarJakarta(val) : null;
  if (sekitar) {
    const provSel = document.getElementById('provinsiTujuan');
    if (provSel && String(provSel.value) !== String(sekitar.provId)) {
      provSel.value = sekitar.provId;
      if (typeof changeProvince === 'function') {
        changeProvince();
        return;
      }
    }
  }
  if (typeof updateSBMPreview === 'function') updateSBMPreview();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  if (typeof renderRincianTransportEditor === 'function') {
    const sel = document.getElementById('rincianPegawai');
    if (sel && sel.value) renderRincianTransportEditor(sel.value);
  }
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof renderDPR === 'function') renderDPR();
}

function addEmployeeTransportPreset(presetName) {
  if (isTripToDki()) {
    openDkiTransportModal();
    return;
  }
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  const empId = Number(select.value);
  if (isNaN(empId)) {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  addEmployeeTransportRow(presetName);
}

function addEmployeeTransportRow(presetName = '') {
  if (isTripToDki()) {
    openDkiTransportModal();
    return;
  }
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  const empId = Number(select.value);
  if (isNaN(empId)) {
    alert('Silakan pilih pegawai terlebih dahulu pada daftar pegawai di atas.');
    return;
  }
  const list = getEmployeeTransports(empId);
  const lastDate = (list.length > 0 && list[list.length - 1].date)
    ? list[list.length - 1].date
    : (document.getElementById('tglBerangkat')?.value || '');
  list.push({
    id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    date: lastDate,
    name: presetName,
    pickup: '',
    dropoff: '',
    amount: 0
  });
  setEmployeeTransports(empId, list);
  renderRincianTransportEditor(empId);
  renderRincianCockpit(empId);
  renderRincianEmpPills();
  if (typeof renderRincian === 'function') renderRincian();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
}

function removeEmployeeTransportRow(idx) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;
  const list = getEmployeeTransports(empId);
  if (list[idx]) {
    list.splice(idx, 1);
    setEmployeeTransports(empId, list);
    renderRincianTransportEditor(empId);
    renderRincianCockpit(empId);
    renderRincianEmpPills();
    if (typeof renderRincian === 'function') renderRincian();
    if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  }
}

function onEmployeeTransportRowChange(el, idx, isBlur = false) {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
  const empId = Number(select.value);
  if (isNaN(empId)) return;
  const list = getEmployeeTransports(empId);
  const row = el.closest ? el.closest('.emp-trans-row') : el.parentElement?.closest('.emp-trans-row');
  if (!row || !list[idx]) return;

  const dateVal = row.querySelector('.emp-trans-date')?.value || '';
  const nameVal = row.querySelector('.emp-trans-name')?.value || '';
  const pickupVal = row.querySelector('.emp-trans-pickup')?.value || '';
  const dropoffVal = row.querySelector('.emp-trans-dropoff')?.value || '';
  let amountVal = (typeof parseNumber === 'function' ? parseNumber(row.querySelector('.emp-trans-amount')?.value) : Number(row.querySelector('.emp-trans-amount')?.value)) || 0;

  list[idx].date = dateVal;
  list[idx].name = nameVal;
  list[idx].pickup = pickupVal;
  list[idx].dropoff = dropoffVal;
  list[idx].amount = amountVal;
  setEmployeeTransports(empId, list);

  const sbm = typeof getSBM === 'function' ? getSBM() : null;

  if (isBlur) {
    if (sbm && sbm.dpr > 0) {
      const maxDpr = sbm.dpr;
      const otherRowsTotal = list.reduce((sum, item, i) => i === idx ? sum : sum + (item.amount || 0), 0);
      const maxAllowedForRow = Math.max(0, maxDpr - otherRowsTotal);

      if (amountVal > maxAllowedForRow) {
        amountVal = maxAllowedForRow;
        list[idx].amount = maxAllowedForRow;
        setEmployeeTransports(empId, list);
        const amtInput = row.querySelector('.emp-trans-amount');
        if (amtInput) amtInput.value = maxAllowedForRow > 0 ? (typeof rp === 'function' ? rp(maxAllowedForRow) : `Rp ${maxAllowedForRow}`) : '';

        const areaName = sbm.isSekitarJakarta ? `rute Jakarta &harr; ${sbm.sekitarJakarta.nama} (PP)` : (typeof formatProvinsi === 'function' ? formatProvinsi(sbm.provinsi) : sbm.provinsi);
        const detailCalculation = sbm.isSekitarJakarta ? ` (One Way ${typeof rp === 'function' ? rp(sbm.dprOneWay) : sbm.dprOneWay} &times; 2 = ${typeof rp === 'function' ? rp(maxDpr) : maxDpr} PP sesuai PMK SBM Hal 68)` : '';

        openSbmLimitModal({
          title: 'Melebihi Batas SBM Transport / DPR',
          component: 'Biaya Transportasi',
          maxRate: maxDpr,
          provName: sbm.provinsi,
          msg: `Total biaya transport/DPR untuk pegawai ini pada <strong>${areaName}</strong> tidak boleh melebihi batas SBM DPR sebesar <strong>${typeof rp === 'function' ? rp(maxDpr) : 'Rp ' + maxDpr}</strong>${detailCalculation}. Nilai baris ini otomatis disesuaikan ke sisa pagu maksimal (<strong>${typeof rp === 'function' ? rp(maxAllowedForRow) : 'Rp ' + maxAllowedForRow}</strong>).`
        });
      }
    }
    const amtInput = row.querySelector('.emp-trans-amount');
    if (amtInput && amountVal > 0) {
      amtInput.value = typeof rp === 'function' ? rp(amountVal) : `Rp ${amountVal}`;
    }
    if (typeof renderRincian === 'function') renderRincian();
    if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  }

  const summaryEl = document.getElementById('rincianTransportSummary');
  if (summaryEl) {
    const total = list.reduce((sum, it) => sum + (it.amount || 0), 0);
    const limitLabel = (sbm && sbm.dpr > 0) ? ` <span style="font-weight: normal; color: #64748b;">(Maks SBM: ${typeof rp === 'function' ? rp(sbm.dpr) : 'Rp ' + sbm.dpr} PP)</span>` : '';
    summaryEl.innerHTML = `Total Transport: <strong>${typeof rp === 'function' ? rp(total) : 'Rp ' + total}</strong>${limitLabel}`;
  }

  updateCockpitKpi(empId);
  if (typeof renderRincian === 'function') renderRincian();
}

function getHotelRate(sbm, gol) {
  if (!sbm) return 0;
  if (gol.startsWith('IV')) return sbm.h4;
  if (gol === 'I' || gol === 'II') return sbm.h2;
  return sbm.h3; // Gol III, IX, VIII, VII, dll → rate Eselon IV/Gol III
}

function hitungBiaya(emp) {
  const sbm = getSBM();
  const cfg = getEmployeeCostConfig(emp.id);

  // Tickets for this employee
  const employeeTickets = (cfg.tickets || []).filter(t => t && t.amount > 0).map(t => ({
    name: t.name || 'Tiket Perjalanan',
    amount: t.amount,
    isTransport: false,
    isTicket: true,
    pickup: '',
    dropoff: t.route || ''
  }));

  // Individual Transports for this employee
  const indTransports = (getEmployeeTransports(emp.id) || [])
    .filter(t => t && t.name && t.amount > 0)
    .map(t => ({
      name: t.name,
      amount: t.amount,
      isTransport: true,
      isTicket: false,
      pickup: t.pickup || '',
      dropoff: t.dropoff || '',
      date: t.date || ''
    }));

  // Global custom costs (if any configured from customCostList)
  const globalCustomCosts = (typeof getCustomCosts === 'function' ? getCustomCosts() : []).map(item => ({
    name: item.name,
    amount: (item.amounts && item.amounts[emp.id]) ? item.amounts[emp.id] : 0,
    isTransport: item.kind === 'transport',
    isTicket: item.kind === 'tiket',
    pickup: item.pickup,
    dropoff: item.dropoff
  })).filter(c => c.amount > 0);

  const isDkiTarget = typeof isTripToDki === 'function' ? isTripToDki() : (sbm && sbm.provinsi === 'DKI JAKARTA');
  const allowedTransports = isDkiTarget ? [] : indTransports;
  const allowedGlobals = isDkiTarget ? globalCustomCosts.filter(c => !c.isTransport) : globalCustomCosts;

  const customCosts = [...allowedGlobals, ...employeeTickets, ...allowedTransports];
  const customTotal = customCosts.reduce((total, item) => total + item.amount, 0);

  const jenisKeg = cfg.jenisKeg || document.getElementById('jenisKegiatan')?.value || 'biasa';

  if (!sbm) {
    return {
      uh: 0,
      uhGross: 0,
      uhBaseRate: 0,
      uhTitle: 'Uang Harian',
      effectivePercent: 1,
      jenisKeg,
      isMealManual: cfg.mealMode === 'manual',
      mealDeduction: 0,
      snackDeduction: 0,
      mealRate: 0,
      mealCount: 0,
      snackRate: 0,
      snackCount: 0,
      hotel: 0,
      hotelDetails: [],
      representatif: 0,
      representatifRate: 0,
      dpr: 0,
      tiket: 0,
      customCosts,
      total: customTotal
    };
  }

  const { days, nights } = getEmpDays(emp.id);
  const cbUH = cfg.uhActive;
  const cbHotel = cfg.hotelActive;
  const uhPercent = cfg.uhPercent ?? (Number(document.getElementById('uhPersentase')?.value) || 1);
  const isDkiJakarta = sbm.provinsi === 'DKI JAKARTA';

  let uhBaseRate = 0;
  let uhTitle = '';
  let effectivePercent = 1;

  if (jenisKeg === 'diklat') {
    uhBaseRate = sbm.diklat || 110000;
    uhTitle = 'Uang Harian Diklat';
    effectivePercent = 1;
  } else if (jenisKeg === 'fullboard') {
    uhBaseRate = sbm.fullboard || 130000;
    uhTitle = 'Uang Harian Fullboard';
    effectivePercent = 1;
  } else {
    uhBaseRate = sbm.uh;
    effectivePercent = uhPercent;
    uhTitle = `Uang Harian ${Math.round(uhPercent * 100)}%`;
  }

  const multiProv = typeof getMultiProvData === 'function' ? getMultiProvData() : null;
  const isMultiProv = !!multiProv;
  let uhGross1 = 0, uhGross2 = 0;
  let uhRate1 = 0, uhRate2 = 0;
  let days1 = 0, days2 = 0;
  let sbm1 = null, sbm2 = null;

  if (isMultiProv) {
    sbm1 = multiProv.sbm1;
    sbm2 = multiProv.sbm2;
    days1 = multiProv.days1;
    days2 = multiProv.days2;

    if (jenisKeg === 'diklat') {
      uhRate1 = sbm1.diklat || 110000;
      uhRate2 = sbm2.diklat || 110000;
    } else if (jenisKeg === 'fullboard') {
      uhRate1 = sbm1.fullboard || 130000;
      uhRate2 = sbm2.fullboard || 130000;
    } else {
      uhRate1 = sbm1.uh || 0;
      uhRate2 = sbm2.uh || 0;
    }
    uhGross1 = cbUH ? Math.round(uhRate1 * days1 * effectivePercent) : 0;
    uhGross2 = cbUH ? Math.round(uhRate2 * days2 * effectivePercent) : 0;
  }

  const uhGross = isMultiProv
    ? (uhGross1 + uhGross2)
    : (cbUH && !isDkiJakarta ? Math.round(uhBaseRate * days * effectivePercent) : 0);

  const hasKonsumsi = cbUH && cfg.hasKonsumsi;
  const isMealManual = cfg.mealMode === 'manual';
  const manualMealEntries = (cfg.manualMeals || []).filter(m => m && m.price > 0);
  const useDetail = hasKonsumsi && isMealManual && manualMealEntries.length > 0;

  let mealRate = 0;
  let mealCount = 0;
  let mealDays = 0;
  let mealRequested = 0;

  if (useDetail) {
    mealRequested = manualMealEntries.reduce((sum, item) => sum + item.price, 0);
    mealCount = manualMealEntries.length;
    mealDays = new Set(manualMealEntries.map(e => e.day)).size;
    mealRate = mealCount > 0 ? Math.round(mealRequested / mealCount) : 0;
  } else if (hasKonsumsi) {
    const rawManualMeal = (typeof parseNumber === 'function' ? parseNumber(document.getElementById('tarifMakan')?.value) : Number(document.getElementById('tarifMakan')?.value)) || 0;
    mealRate = isMealManual ? Math.max(0, rawManualMeal) : (sbm?.makan || (isMultiProv ? sbm1?.makan : 0) || 0);
    const rawCount = Number(document.getElementById('jumlahMakan')?.value);
    mealCount = cfg.mealCount || ((!isNaN(rawCount) && rawCount > 0) ? rawCount : (isMealManual && rawManualMeal > 0 ? 1 : 0));
    const rawDays = Number(document.getElementById('hariMakan')?.value);
    mealDays = (cfg.mealDays && cfg.mealDays > 0) ? cfg.mealDays : ((!isNaN(rawDays) && rawDays > 0) ? rawDays : days);
    mealRequested = mealRate * mealCount * mealDays;
  }

  const snackRate = sbm?.snack || (isMultiProv ? sbm1?.snack : 0) || 0;
  const snackCount = cfg.snackCount || 0;
  const snackDays = days;
  const snackRequested = (hasKonsumsi && snackCount > 0) ? snackRate * snackCount * snackDays : 0;

  const mealDeduction = Math.min(uhGross, mealRequested);
  const snackDeduction = Math.min(Math.max(0, uhGross - mealDeduction), snackRequested);
  const uh = uhGross - mealDeduction - snackDeduction;

  // Hotel
  let hotel = 0;
  const hotelDetails = [];
  if (cbHotel) {
    if (cfg.hotelMode === 'manual') {
      const hNights = (cfg.hotelNights > 0) ? cfg.hotelNights : nights;
      const hPrice = cfg.hotelPrice || 0;
      const hTotal = hNights * hPrice;
      if (hTotal > 0) {
        hotel = hTotal;
        hotelDetails.push({ name: cfg.hotelName || 'Penginapan / Hotel', nights: hNights, price: hPrice, total: hTotal });
      }
    } else {
      const hotelEntries = typeof getHotelEntries === 'function' ? getHotelEntries() : [];
      if (hotelEntries.length) {
        hotelEntries.forEach(item => {
          if (!item.employeeIds.includes(emp.id)) return;
          const roomTotal = item.nights * item.price;
          if (roomTotal <= 0) return;
          hotel += roomTotal;
          hotelDetails.push({ name: item.name, nights: item.nights, price: item.price, total: roomTotal });
        });
      } else {
        const hRate = getHotelRate(sbm, emp.gol);
        const hNights = (cfg.hotelNights > 0) ? cfg.hotelNights : (nights > 0 ? nights : 1);
        hotel = hRate * hNights;
        if (hotel > 0) {
          const hName = cfg.hotelName ? `${cfg.hotelName} (Gol. ${emp.gol})` : `Tarif SBM (Gol. ${emp.gol})`;
          hotelDetails.push({ name: hName, nights: hNights, price: hRate, total: hotel });
        }
      }
    }
  }

  const isKepalaBiro = /kepala biro/i.test(emp.jabatan || '');
  const representatifRate = isKepalaBiro ? (isDkiJakarta ? 75000 : 150000) : 0;
  const representatif = representatifRate * days;

  // DPR otomatis Rp 170.000 hanya jika tujuan DKI JAKARTA
  const dprVal = isDkiTarget ? 170000 : 0;
  const tiketVal = (document.getElementById('cbTiket')?.checked && sbm) ? sbm.tiket : 0;

  return {
    uh,
    uhGross,
    uhBaseRate,
    uhTitle,
    effectivePercent,
    jenisKeg,
    isMealManual,
    mealDeduction,
    snackDeduction,
    mealRate,
    mealCount,
    mealDays,
    manualMode: useDetail ? 'detail' : 'flat',
    mealDetails: useDetail ? manualMealEntries : [],
    snackRate,
    snackCount,
    snackDays,
    hotel,
    hotelDetails,
    representatif,
    representatifRate,
    dpr: dprVal,
    tiket: tiketVal,
    customCosts,
    total: uh + hotel + representatif + dprVal + tiketVal + customTotal,
    isMultiProv,
    multiProvData: isMultiProv ? {
      sbm1,
      sbm2,
      days1,
      days2,
      uhRate1,
      uhRate2,
      uhGross1,
      uhGross2,
      title1: `Uang Harian ${typeof getProvShortName === 'function' ? getProvShortName(sbm1.provinsi) : sbm1.provinsi}`,
      title2: `Uang Harian ${typeof getProvShortName === 'function' ? getProvShortName(sbm2.provinsi) : sbm2.provinsi}`
    } : null
  };
}

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
}

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
  if (!select || select.value === '') return;
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
  '524111': { desc: 'Kegiatan di luar kota', jenis: 'Luar Kota (luar jakarta)' },
  '524119': { desc: 'Rapat di luar kota', jenis: 'Luar Kota (luar jakarta)' },
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
  const elJenis = document.getElementById('lk_jenisPerjalanan');
  if (elJenis && !elJenis.dataset.userEdited) {
    syncJenisPerjalananFromMak();
  }
  const jenisPerjalanan = elJenis ? elJenis.value : 'Luar Kota (luar jakarta)';
  const kotaTeks = document.getElementById('kotaTujuan').value.trim();
  const tujuan = getTujuanDisplay(kotaTeks);
  const tujuanPerjalanan = document.getElementById('agenda').value.trim() || tujuan;
  const akunKegiatan = `${document.getElementById('kodeKegiatan').value}.${document.getElementById('kodeSubKegiatan').value}.${document.getElementById('mak').value}`;
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
  if (typeof renderRincianEmpPills === 'function') renderRincianEmpPills();
  if (typeof renderRincianCockpit === 'function') renderRincianCockpit();
  if (typeof renderRincianTransportEditor === 'function') renderRincianTransportEditor();
  renderRincian();
}

function loadRincianSPD() {
  const select = document.getElementById('rincianPegawai');
  if (!select || select.value === '') return;
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
      let deductionBlock = '';
      if (b.mealDeduction > 0 || b.snackDeduction > 0) {
        let deductionRows = '';
        if (b.mealDeduction > 0) {
          if (b.mealDetails && b.mealDetails.length > 0) {
            const detailRowsHtml = b.mealDetails.map(m =>
              `<span style="padding-left:12px; display:block;">• ${escHtml(m.day)} (${escHtml(m.session)}): 1 &times; ${rp(m.price)}</span>`
            ).join('');
            deductionRows += `
              <tr>
                <td style="padding-left:24px;">
                  * Makan (${b.mealDetails.length} kali makan):<br>
                  ${detailRowsHtml}
                </td>
                <td class="tr" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
                <td style="vertical-align:bottom;">${mealKet}</td>
              </tr>`;
          } else {
            deductionRows += `
              <tr>
                <td style="padding-left:24px;">
                  * Makan<br>
                  <span style="padding-left:12px;">${b.mealDays} hari &times; ${b.mealCount} kali &times; ${rp(b.mealRate)}</span>
                </td>
                <td class="tr" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
                <td style="vertical-align:bottom;">${mealKet}</td>
              </tr>`;
          }
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
        <td colspan="3" class="rincian-subtbl-cell" style="padding:0">
          <table class="rincian-subtbl">
            <colgroup><col class="col-rincian-biaya"><col class="col-rincian-jumlah" style="width:125px"><col class="col-rincian-ket" style="width:250px"></colgroup>
            <tbody>
              <tr>
                <td class="live-editable" contenteditable="true">${b.multiProvData.title1}<br><span style="padding-left:12px">${b.multiProvData.days1} hari &nbsp; X &nbsp; ${rp(b.multiProvData.uhRate1)}</span></td>
                <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">${rp(b.multiProvData.uhGross1)}</td>
                <td class="live-editable" contenteditable="true">${uhKeterangan}</td>
              </tr>
              <tr>
                <td class="live-editable" contenteditable="true">${b.multiProvData.title2}<br><span style="padding-left:12px">${b.multiProvData.days2} hari &nbsp; X &nbsp; ${rp(b.multiProvData.uhRate2)}</span></td>
                <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">${rp(b.multiProvData.uhGross2)}</td>
                <td class="live-editable" contenteditable="true"></td>
              </tr>
              ${deductionBlock}
            </tbody>
          </table>
        </td>
      </tr>`;
    } else if (b.mealDeduction > 0 || b.snackDeduction > 0) {
      let deductionRows = '';
      if (b.mealDeduction > 0) {
        if (b.mealDetails && b.mealDetails.length > 0) {
          const detailRowsHtml = b.mealDetails.map(m =>
            `<span style="padding-left:12px; display:block;">• ${escHtml(m.day)} (${escHtml(m.session)}): 1 &times; ${rp(m.price)}</span>`
          ).join('');
          deductionRows += `
            <tr>
              <td class="live-editable" contenteditable="true" style="padding-left:24px;">
                * Makan (${b.mealDetails.length} kali makan):<br>
                ${detailRowsHtml}
              </td>
              <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
              <td class="live-editable" contenteditable="true" style="vertical-align:bottom;">${mealKet}</td>
            </tr>`;
        } else {
          deductionRows += `
            <tr>
              <td class="live-editable" contenteditable="true" style="padding-left:24px;">
                * Makan<br>
                <span style="padding-left:12px;">${b.mealDays} hari &times; ${b.mealCount} kali &times; ${rp(b.mealRate)}</span>
              </td>
              <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.mealDeduction)}</td>
              <td class="live-editable" contenteditable="true" style="vertical-align:bottom;">${mealKet}</td>
            </tr>`;
        }
      }
      if (b.snackDeduction > 0) {
        deductionRows += `
          <tr>
            <td class="live-editable" contenteditable="true" style="padding-left:24px;">
              * Snack<br>
              <span style="padding-left:12px;">${b.snackDays} hari &times; ${b.snackCount} kali &times; ${rp(b.snackRate)}</span>
            </td>
            <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">- ${rp(b.snackDeduction)}</td>
            <td class="live-editable" contenteditable="true"></td>
          </tr>`;
      }
      rincianRows += `<tr>
        <td class="tc">${no++}</td>
        <td colspan="3" class="rincian-subtbl-cell" style="padding:0">
          <table class="rincian-subtbl">
            <colgroup><col class="col-rincian-biaya"><col class="col-rincian-jumlah" style="width:125px"><col class="col-rincian-ket" style="width:250px"></colgroup>
            <tbody>
              <tr>
                <td class="live-editable" contenteditable="true">${b.uhTitle || 'Uang Harian'}<br><span style="padding-left:12px">${days} hari &nbsp; X &nbsp; ${rp(b.uhBaseRate)}</span></td>
                <td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()" style="vertical-align:bottom;">${rp(b.uhGross)}</td>
                <td class="live-editable" contenteditable="true">${uhKeterangan}</td>
              </tr>
              <tr>
                <td class="live-editable" contenteditable="true" style="padding-left:12px;">Terpotong konsumsi:</td>
                <td></td>
                <td></td>
              </tr>
              ${deductionRows}
            </tbody>
          </table>
        </td>
      </tr>`;
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

        detailRows = sortedKeys.map(dateKey => {
          let headerHtml = '';
          const items = groups[dateKey];
          const groupColor = (typeof getTransportDateColor === 'function') ? getTransportDateColor(emp.id, dateKey) : '#fef3c7';

          if (dateKey !== 'tanpa_tanggal') {
            const dateDisplay = typeof formatTgl === 'function' ? formatTgl(dateKey) : dateKey;
            headerHtml = `
              <tr class="rincian-date-group-row" style="background-color: ${groupColor}; font-weight: 700;">
                <td class="live-editable" contenteditable="true" style="padding-left: 18px; font-weight: 700; color: #000; background-color: ${groupColor};">
                  ${dateDisplay}
                  <input type="color" class="date-color-picker no-print" value="${groupColor}" onchange="setTransportDateColorForDate('${emp.id}', '${dateKey}', this.value)" title="Ganti warna baris ${dateDisplay}">
                </td>
                <td class="tr" style="background-color: ${groupColor};"></td>
                <td class="live-editable" contenteditable="true" style="background-color: ${groupColor};"></td>
              </tr>`;
          }

          const itemsHtml = items.map(item => {
            const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
            const paddingLeft = dateKey !== 'tanpa_tanggal' ? '28px' : '24px';
            return `<tr><td class="live-editable" contenteditable="true" style="padding-left: ${paddingLeft};"><em>${escHtml(item.name)}</em></td><td class="tr live-editable" contenteditable="true"><em>${rp(item.amount)}</em></td><td class="live-editable" contenteditable="true">${escHtml(route)}</td></tr>`;
          }).join('');

          return headerHtml + itemsHtml;
        }).join('');
      } else {
        detailRows = transportCosts.map(item => {
          const route = [item.pickup, item.dropoff].filter(Boolean).join(' - ');
          return `<tr><td class="live-editable" contenteditable="true" style="padding-left:24px"><em>${escHtml(item.name)}</em></td><td class="tr live-editable" contenteditable="true"><em>${rp(item.amount)}</em></td><td class="live-editable" contenteditable="true">${escHtml(route)}</td></tr>`;
        }).join('');
      }
      rincianRows += `<tr>
        <td class="tc">${no++}</td>
        <td colspan="3" class="rincian-subtbl-cell" style="padding:0">
          <table class="rincian-subtbl">
            <colgroup><col class="col-rincian-biaya"><col class="col-rincian-jumlah" style="width:125px"><col class="col-rincian-ket" style="width:250px"></colgroup>
            <tbody>
              <tr><td class="live-editable" contenteditable="true">${dprUraian}</td><td class="tr live-editable tr-amount" contenteditable="true" oninput="onRincianDocAmountChange()"><strong>${rp(transportTotal)}</strong></td><td class="live-editable" contenteditable="true"></td></tr>
              <tr><td class="live-editable" contenteditable="true" style="padding-left:12px"><em>Rincian Transport:</em></td><td></td><td></td></tr>
              ${detailRows}
            </tbody>
          </table>
        </td>
      </tr>`;
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
    <div class="emp-bundle-doc" style="background:#ffffff; color:#000000;">
      ${sections.map((sec, idx) => `
        ${idx > 0 ? '<div class="html2pdf__page-break"></div>' : ''}
        <div class="doc-page-section">
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
  if (!select || select.value === '') return;
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



// =====================================================================
// EKSPOR & IMPOR EXCEL (PerdinKu)
// Penyimpanan data dan pembacaan ulang berkas spreadsheet perjalanan
// =====================================================================

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
  ['Tarif Makan SBM', 'tarifMakan', 'text'],
  ['Hari Disediakan Makan', 'hariMakan', 'number'],
  ['Makan Disediakan per Hari', 'jumlahMakan', 'number'],
  ['Tarif Snack SBM', 'tarifSnack', 'text'],
  ['Hari Disediakan Snack', 'hariSnack', 'number'],
  ['Snack Disediakan per Hari', 'jumlahSnack', 'number'],
  ['Multi-Provinsi', 'cbMultiProvinsi', 'check'],
  ['Provinsi Tujuan 1', 'provinsiTujuan1', 'select'],
  ['Hari di Provinsi 1', 'hariProvinsi1', 'number'],
  ['Provinsi Tujuan 2', 'provinsiTujuan2', 'select'],
  ['Hari di Provinsi 2', 'hariProvinsi2', 'number'],
  ['Konsumsi Perjalanan Biasa', 'cbKonsumsiBiasa', 'check'],
  ['Tarif Makan Manual', 'cbTarifMakanManual', 'check'],
  ['Mode Tarif Makan Manual', 'manualMakanMode', 'text'],
  ['Metode Pembayaran', 'metodePembayaran', 'select'],
  ['Lembar Kendali - Tanggal Masuk Berkas', 'lk_tanggalMasuk', 'date'],
  ['Lembar Kendali - Pelaksana', 'lk_pelaksana', 'text'],
  ['Lembar Kendali - Nomor SPM', 'lk_nomorSPM', 'text'],
  ['Lembar Kendali - Nomor SPD', 'lk_nomorSPD', 'text'],
  ['Lembar Kendali - Jenis Perjalanan', 'lk_jenisPerjalanan', 'select'],
  ['Lembar Kendali - Metode Pembayaran', 'lk_metodePembayaran', 'select']
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
  ['NIP Verifikator PPK', 'cfg_verifikatorNip'],
  ['Nama Pemegang KKP', 'cfg_kkpNama'],
  ['NIP Pemegang KKP', 'cfg_kkpNip'],
  ['Pangkat/Gol Pemegang KKP', 'cfg_kkpPangkat'],
  ['Jabatan Pemegang KKP', 'cfg_kkpJabatan'],
  ['Unit Kerja Pemegang KKP', 'cfg_kkpUnit'],
  ['Nama di Kartu KKP', 'cfg_kkpKartuNama'],
  ['Nomor Kartu KKP', 'cfg_kkpNomor']
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
  const rows = [...document.querySelectorAll('.custom-cost-row')].map(row => {
    let amounts = {};
    try {
      amounts = JSON.parse(row.dataset.amounts || '{}');
    } catch (error) {
      amounts = {};
    }
    row.querySelectorAll('.custom-cost-amount').forEach(input => {
      amounts[input.dataset.employeeId] = Math.max(0, typeof parseNumber === 'function' ? parseNumber(input.value) : Number(input.value) || 0);
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

  // Sertakan rincian transport perorangan dari menu Rincian per Orang
  if (typeof employeeTransports === 'object') {
    Object.keys(employeeTransports).forEach(empIdStr => {
      const list = employeeTransports[empIdStr] || [];
      list.forEach(item => {
        if (!item || !item.name || !(item.amount > 0)) return;
        rows.push({
          name: item.name,
          kind: 'transport',
          kindLabel: 'Transport PP',
          pickup: item.pickup || '',
          dropoff: item.dropoff || '',
          amounts: { [empIdStr]: item.amount }
        });
      });
    });
  }

  return rows;
}

function excelGetHotelRows() {
  return [...document.querySelectorAll('#hotelList .hotel-row')].map(row => ({
    name: row.querySelector('.hotel-name').value.trim(),
    nights: Math.max(0, Number(row.querySelector('.hotel-nights').value) || 0),
    price: Math.max(0, typeof parseNumber === 'function' ? parseNumber(row.querySelector('.hotel-price').value) : Number(row.querySelector('.hotel-price').value) || 0),
    guestIds: [...row.querySelectorAll('.hotel-guest-check:checked')].map(cb => Number(cb.dataset.employeeId))
  })).filter(item => item.name || item.price > 0);
}

function exportPerjadinExcel(mode = 'excel') {
  if (typeof saveCurrentTripToHistory === 'function') {
    try { saveCurrentTripToHistory(false); } catch (e) {}
  }
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

  // Pertahankan urutan pemilihan awal pegawai (jangan di-sort abjad/ID)
  const empIds = [...selectedEmpIds];
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

  if (typeof getManualMealEntries === 'function') {
    const mealRows = [['No', 'Hari', 'Sesi Makan', 'Tarif (Rp)']];
    getManualMealEntries().forEach((m, idx) => {
      mealRows.push([idx + 1, m.day, m.session, m.price]);
    });
    excelAddSheet(wb, 'Rincian Makan', mealRows, [5, 14, 20, 18]);
  }

  excelAddSheet(wb, 'Pengaturan', [
    ['Keterangan', 'Nilai'],
    ...EXCEL_SETTING_FIELDS.map(([label, id]) => [label, document.getElementById(id)?.value || ''])
  ], [32, 80]);

  const naming = (typeof getPerjadinNamingInfo === 'function')
    ? getPerjadinNamingInfo()
    : {
        excelFileName: `Perjadin_${document.getElementById('kotaTujuan')?.value || 'Dinas'}.xlsx`,
        folderName: `PERJADIN ${document.getElementById('kotaTujuan')?.value || 'DINAS'}`,
        empIds
      };

  if (mode === 'zip' || mode === 'all') {
    // Mode ZIP: buat folder kegiatan & kompilasi seluruh berkas PDF + Excel dalam 1 arsip ZIP
    if (empIds.length > 0 && typeof html2pdf !== 'undefined') {
      exportPerjadinActivityFolder(wb, naming);
    } else {
      XLSX.writeFile(wb, naming.excelFileName);
    }
  } else {
    // Mode Excel murni: Simpan berkas Excel (.xlsx) langsung tanpa kompilasi ZIP/PDF (cepat & ringan)
    XLSX.writeFile(wb, naming.excelFileName);
    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Excel Berhasil Disimpan',
        `File "${naming.excelFileName}" berhasil diunduh dan tersimpan di Riwayat Perjalanan.`
      );
    }
    // Auto-reset formulir setelah berhasil disimpan ke Excel (data telah aman di Riwayat)
    setTimeout(() => {
      if (typeof resetPerjadinForm === 'function') {
        resetPerjadinForm(false);
      }
    }, 450);
  }
}

function exportPerjadinZip() {
  exportPerjadinExcel('zip');
}

window.exportPerjadinExcel = exportPerjadinExcel;
window.exportPerjadinZip = exportPerjadinZip;

function getEmployeeDocFilePrefix(emp, allEmps) {
  if (!emp) return 'Pegawai';
  const firstName = (typeof getNamaDepan === 'function') ? getNamaDepan(emp.nama) : emp.nama.split(',')[0].trim().split(/\s+/)[0];
  const duplicates = (allEmps || []).filter(e => {
    const fn = (typeof getNamaDepan === 'function') ? getNamaDepan(e.nama) : e.nama.split(',')[0].trim().split(/\s+/)[0];
    return fn.toLowerCase() === firstName.toLowerCase();
  });
  if (duplicates.length > 1) {
    const clean = emp.nama.split(',')[0].trim();
    const words = clean.split(/\s+/);
    return `${words[0]} ${words[1] || ''}`.trim();
  }
  return firstName;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a && a.parentNode) a.parentNode.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1200);
}

async function generatePdfBlobFromHtml(htmlContent, optOverrides = {}) {
  if (!htmlContent) {
    throw new Error('Konten HTML dokumen kosong');
  }

  // Gunakan DOMParser agar manipulasi dan pembersihan elemen no-print 100% valid tanpa merusak struktur HTML
  let cleanHtml = '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    doc.querySelectorAll('.no-print, button, input').forEach(el => el.remove());
    doc.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    cleanHtml = doc.body.innerHTML;
  } catch (e) {
    cleanHtml = (htmlContent || '')
      .replace(/<button[\s\S]*?<\/button>/gi, '')
      .replace(/<input[^>]*>/gi, '')
      .replace(/contenteditable="[^"]*"/gi, '');
  }

  // Bungkus dalam container putih bersih agar hasil PDF selalu berlatar putih dan teks terbaca jelas
  cleanHtml = `<div style="background-color: #ffffff !important; color: #000000 !important; width: 100%; box-sizing: border-box;">${cleanHtml}</div>`;

  const orientation = (optOverrides && optOverrides.jsPDF && optOverrides.jsPDF.orientation) || 'portrait';
  const isLandscape = orientation === 'landscape';

  const defaultOpt = {
    margin: isLandscape ? [8, 8, 8, 8] : [6, 8, 6, 8],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 1.6,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: orientation },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  const finalOpt = Object.assign({}, defaultOpt, optOverrides);
  if (optOverrides.html2canvas) {
    finalOpt.html2canvas = Object.assign({}, defaultOpt.html2canvas, optOverrides.html2canvas);
  }
  if (optOverrides.pagebreak) {
    finalOpt.pagebreak = Object.assign({}, defaultOpt.pagebreak, optOverrides.pagebreak);
  }

  return await html2pdf().set(finalOpt).from(cleanHtml).output('blob');
}

function ensureExportProgressModal() {
  let overlay = document.getElementById('exportProgressOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'exportProgressOverlay';
    overlay.className = 'export-progress-overlay no-print';
    overlay.innerHTML = `
      <div class="export-progress-card" role="dialog" aria-modal="true" aria-labelledby="exportProgressTitle">
        <div class="export-progress-header">
          <div class="export-progress-icon">📦</div>
          <div class="export-progress-title-wrap">
            <h3 id="exportProgressTitle">Menyimpan & Membuat Berkas Perjadin</h3>
            <p id="exportProgressSubtitle">Folder: -</p>
          </div>
        </div>
        <div class="export-progress-bar-wrap">
          <div class="export-progress-bar" id="exportProgressBar" style="width: 5%"></div>
        </div>
        <div class="export-progress-status" id="exportProgressStatus">Mempersiapkan dokumen...</div>
        <div class="export-progress-file-list" id="exportProgressFileList"></div>
        <div class="export-progress-actions" id="exportProgressActions" style="display:none;"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showExportProgressModal(naming) {
  const overlay = ensureExportProgressModal();
  document.getElementById('exportProgressTitle').textContent = 'Menyimpan Excel & Membuat Berkas Perjadin';
  document.getElementById('exportProgressSubtitle').textContent = `Folder Kegiatan: ${naming.folderName}`;
  document.getElementById('exportProgressBar').style.width = '5%';
  document.getElementById('exportProgressStatus').textContent = 'Membuat file Excel dan mempersiapkan dokumen perorangan...';
  const fileListEl = document.getElementById('exportProgressFileList');
  fileListEl.innerHTML = `
    <div class="export-progress-item done">
      <span class="export-file-icon">📊</span>
      <span class="export-file-name">${naming.excelFileName}</span>
      <span class="export-file-badge">Tersimpan</span>
    </div>
  `;
  document.getElementById('exportProgressActions').style.display = 'none';
  overlay.style.display = 'flex';
}

function updateExportProgress(percent, statusText, addedFile) {
  const bar = document.getElementById('exportProgressBar');
  const status = document.getElementById('exportProgressStatus');
  const fileListEl = document.getElementById('exportProgressFileList');
  if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  if (status && statusText) status.textContent = statusText;
  if (fileListEl && addedFile) {
    const item = document.createElement('div');
    item.className = 'export-progress-item done';
    item.innerHTML = `
      <span class="export-file-icon">${addedFile.icon || '📄'}</span>
      <span class="export-file-name">${addedFile.name}</span>
      <span class="export-file-badge">Siap</span>
    `;
    fileListEl.appendChild(item);
    fileListEl.scrollTop = fileListEl.scrollHeight;
  }
}

function finishExportModal(folderName, fileList, zipBlob) {
  const bar = document.getElementById('exportProgressBar');
  const status = document.getElementById('exportProgressStatus');
  const title = document.getElementById('exportProgressTitle');
  const subtitle = document.getElementById('exportProgressSubtitle');
  const actions = document.getElementById('exportProgressActions');

  if (bar) bar.style.width = '100%';
  if (title) title.textContent = '✅ Selesai! Berkas & Folder Berhasil Dibuat';
  if (subtitle) subtitle.textContent = `Folder: ${folderName}`;
  if (status) status.textContent = `Semua dokumen perorangan & rekapitulasi (${fileList.length} berkas) telah lengkap dikemas ke dalam folder "${folderName}".`;

  if (actions) {
    actions.style.display = 'flex';
    actions.innerHTML = `
      <button type="button" class="btn btn-secondary btn-sm" id="btnDownloadZipAgain" title="Unduh kembali paket ZIP folder kegiatan">
        📦 Unduh Ulang ZIP
      </button>
      ${window.showDirectoryPicker ? `
      <button type="button" class="btn btn-primary btn-sm" id="btnSaveToDiskFolder" title="Simpan sebagai folder fisik langsung di komputer Anda">
        📁 Simpan ke Folder Disk
      </button>` : ''}
      <button type="button" class="btn btn-success btn-sm" onclick="closeExportProgressModal()">
        ✓ Tutup
      </button>
    `;

    const zipBtn = document.getElementById('btnDownloadZipAgain');
    if (zipBtn && zipBlob) {
      zipBtn.onclick = () => downloadBlob(zipBlob, `${folderName}.zip`);
    }

    const diskBtn = document.getElementById('btnSaveToDiskFolder');
    if (diskBtn) {
      diskBtn.onclick = async () => {
        try {
          diskBtn.disabled = true;
          diskBtn.textContent = '⏳ Menyimpan...';
          const rootDir = await window.showDirectoryPicker({ mode: 'readwrite' });
          const targetDir = await rootDir.getDirectoryHandle(folderName, { create: true });
          for (const item of fileList) {
            const fileHandle = await targetDir.getFileHandle(item.name, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(item.blob);
            await writable.close();
          }
          diskBtn.textContent = '✅ Tersimpan di Disk!';
          setTimeout(() => { if (diskBtn) { diskBtn.disabled = false; diskBtn.textContent = '📁 Simpan ke Folder Disk'; } }, 3000);
        } catch (e) {
          console.warn('Simpan ke disk dibatalkan:', e);
          if (diskBtn) {
            diskBtn.disabled = false;
            diskBtn.textContent = '📁 Simpan ke Folder Disk';
          }
        }
      };
    }
  }
}

function closeExportProgressModal() {
  const overlay = document.getElementById('exportProgressOverlay');
  if (overlay) overlay.style.display = 'none';
}

async function exportPerjadinActivityFolder(wb, naming) {
  showExportProgressModal(naming);

  const empIds = naming.empIds || [];
  const emps = empIds.map(id => employees.find(e => e.id === id)).filter(Boolean);

  const u8 = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const excelBlob = new Blob([u8], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const fileList = [];
  fileList.push({ name: naming.excelFileName, blob: excelBlob, icon: '📊' });

  const hasDpr = typeof isDPRAvailableForTrip === 'function' ? isDPRAvailableForTrip() : false;
  const docsPerEmp = hasDpr ? 5 : 4;
  const rekapTasks = 5; // Rekap Kuitansi, Rekap Rincian, Nominatif, Lembar Kendali, Rekap SPT
  const totalTasks = (emps.length * docsPerEmp) + rekapTasks;
  let currentTask = 0;

  for (let i = 0; i < emps.length; i++) {
    const emp = emps[i];
    const prefix = getEmployeeDocFilePrefix(emp, emps);

    await new Promise(r => setTimeout(r, 60));

    // A. Kuitansi
    currentTask++;
    updateExportProgress(
      Math.round((currentTask / (totalTasks + 1)) * 90),
      `Membuat Kuitansi ${prefix}... (${currentTask}/${totalTasks})`
    );
    try {
      const kuitansiHtml = typeof buildKuitansiHtml === 'function' ? buildKuitansiHtml(emp) : '';
      if (kuitansiHtml) {
        const kuitansiBlob = await generatePdfBlobFromHtml(kuitansiHtml);
        const docName = `${prefix} - Kuitansi.pdf`;
        fileList.push({ name: docName, blob: kuitansiBlob, icon: '🧾' });
        updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '🧾' });
      }
    } catch (err) {
      console.warn('Gagal membuat Kuitansi untuk ' + emp.nama, err);
    }

    await new Promise(r => setTimeout(r, 40));

    // B. Rincian Biaya
    currentTask++;
    updateExportProgress(
      Math.round((currentTask / (totalTasks + 1)) * 90),
      `Membuat Rincian Biaya ${prefix}... (${currentTask}/${totalTasks})`
    );
    try {
      const rincianHtml = typeof buildRincianHtml === 'function' ? buildRincianHtml(emp) : '';
      if (rincianHtml) {
        const rincianBlob = await generatePdfBlobFromHtml(rincianHtml);
        const docName = `${prefix} - Rincian Biaya.pdf`;
        fileList.push({ name: docName, blob: rincianBlob, icon: '📋' });
        updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '📋' });
      }
    } catch (err) {
      console.warn('Gagal membuat Rincian Biaya untuk ' + emp.nama, err);
    }

    await new Promise(r => setTimeout(r, 40));

    // C. DPR (jika ada)
    if (hasDpr) {
      currentTask++;
      updateExportProgress(
        Math.round((currentTask / (totalTasks + 1)) * 90),
        `Membuat DPR ${prefix}... (${currentTask}/${totalTasks})`
      );
      try {
        const dprHtml = typeof buildDPRHtml === 'function' ? buildDPRHtml(emp) : '';
        if (dprHtml) {
          const dprBlob = await generatePdfBlobFromHtml(dprHtml);
          const docName = `${prefix} - DPR.pdf`;
          fileList.push({ name: docName, blob: dprBlob, icon: '📝' });
          updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '📝' });
        }
      } catch (err) {
        console.warn('Gagal membuat DPR untuk ' + emp.nama, err);
      }
      await new Promise(r => setTimeout(r, 40));
    }

    // D. SPPD
    currentTask++;
    updateExportProgress(
      Math.round((currentTask / (totalTasks + 1)) * 90),
      `Membuat SPPD ${prefix}... (${currentTask}/${totalTasks})`
    );
    try {
      const sppdHtml = typeof buildSPPDHtml === 'function' ? buildSPPDHtml(emp) : '';
      if (sppdHtml) {
        const sppdBlob = await generatePdfBlobFromHtml(sppdHtml);
        const docName = `${prefix} - SPPD.pdf`;
        fileList.push({ name: docName, blob: sppdBlob, icon: '📑' });
        updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '📑' });
      }
    } catch (err) {
      console.warn('Gagal membuat SPPD untuk ' + emp.nama, err);
    }

    await new Promise(r => setTimeout(r, 40));

    // E. Dokumen Lengkap per orang
    currentTask++;
    updateExportProgress(
      Math.round((currentTask / (totalTasks + 1)) * 90),
      `Menggabungkan seluruh dokumen ${prefix}... (${currentTask}/${totalTasks})`
    );
    try {
      const allDocsHtml = typeof buildAllDocsHtmlForEmp === 'function' ? buildAllDocsHtmlForEmp(emp) : '';
      if (allDocsHtml) {
        const allDocsBlob = await generatePdfBlobFromHtml(allDocsHtml);
        const docName = `${prefix} - Lengkap (Semua Dokumen).pdf`;
        fileList.push({ name: docName, blob: allDocsBlob, icon: '📁' });
        updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '📁' });
      }
    } catch (err) {
      console.warn('Gagal membuat dokumen lengkap untuk ' + emp.nama, err);
    }
  }

  // =========================================================================
  // DOKUMEN REKAPITULASI KEGIATAN KOLEKTIF
  // =========================================================================

  // 1. Rekap Kuitansi
  currentTask++;
  updateExportProgress(
    Math.round((currentTask / (totalTasks + 1)) * 90),
    `Membuat PDF Rekap Kuitansi... (${currentTask}/${totalTasks})`
  );
  try {
    if (typeof renderRekapKuitansi === 'function') renderRekapKuitansi();
    const el = document.getElementById('rekapKuitansiOut');
    const html = el ? el.innerHTML : '';
    if (html && !html.includes('alert-warn')) {
      const blob = await generatePdfBlobFromHtml(html, {
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });
      const docName = 'Rekap Kuitansi.pdf';
      fileList.push({ name: docName, blob: blob, icon: '🧾' });
      updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '🧾' });
    }
  } catch (err) {
    console.warn('Gagal membuat PDF Rekap Kuitansi', err);
  }
  await new Promise(r => setTimeout(r, 40));

  // 2. Rekap Rincian Biaya (Landscape)
  currentTask++;
  updateExportProgress(
    Math.round((currentTask / (totalTasks + 1)) * 90),
    `Membuat PDF Rekap Rincian Biaya... (${currentTask}/${totalTasks})`
  );
  try {
    if (typeof renderRekapRincian === 'function') renderRekapRincian();
    const el = document.getElementById('rekapRincianOut');
    const html = el ? el.innerHTML : '';
    if (html && !html.includes('alert-warn')) {
      const blob = await generatePdfBlobFromHtml(html, {
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      });
      const docName = 'Rekap Rincian Biaya.pdf';
      fileList.push({ name: docName, blob: blob, icon: '📋' });
      updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '📋' });
    }
  } catch (err) {
    console.warn('Gagal membuat PDF Rekap Rincian Biaya', err);
  }
  await new Promise(r => setTimeout(r, 40));

  // 3. Daftar Nominatif (Portrait)
  currentTask++;
  updateExportProgress(
    Math.round((currentTask / (totalTasks + 1)) * 90),
    `Membuat PDF Daftar Nominatif... (${currentTask}/${totalTasks})`
  );
  try {
    if (typeof renderNominatif === 'function') renderNominatif();
    const el = document.getElementById('nominatifOut');
    const html = el ? el.innerHTML : '';
    if (html && !html.includes('alert-warn')) {
      const blob = await generatePdfBlobFromHtml(html, {
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });
      const docName = 'Daftar Nominatif.pdf';
      fileList.push({ name: docName, blob: blob, icon: '👥' });
      updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '👥' });
    }
  } catch (err) {
    console.warn('Gagal membuat PDF Daftar Nominatif', err);
  }
  await new Promise(r => setTimeout(r, 40));

  // 4. Lembar Kendali
  currentTask++;
  updateExportProgress(
    Math.round((currentTask / (totalTasks + 1)) * 90),
    `Membuat PDF Lembar Kendali... (${currentTask}/${totalTasks})`
  );
  try {
    if (typeof renderLembarKendali === 'function') renderLembarKendali();
    const el = document.getElementById('lembarKendaliOut');
    const html = el ? el.innerHTML : '';
    if (html && !html.includes('alert-warn')) {
      const blob = await generatePdfBlobFromHtml(html, {
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });
      const docName = 'Lembar Kendali.pdf';
      fileList.push({ name: docName, blob: blob, icon: '📑' });
      updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '📑' });
    }
  } catch (err) {
    console.warn('Gagal membuat PDF Lembar Kendali', err);
  }
  await new Promise(r => setTimeout(r, 40));

  // 5. Rekap Surat Tugas
  currentTask++;
  updateExportProgress(
    Math.round((currentTask / (totalTasks + 1)) * 90),
    `Membuat PDF Rekap Surat Tugas... (${currentTask}/${totalTasks})`
  );
  try {
    if (typeof renderRekapSPT === 'function') renderRekapSPT();
    const el = document.getElementById('rekapSPTOut');
    const html = el ? el.innerHTML : '';
    if (html && !html.includes('alert-warn')) {
      const blob = await generatePdfBlobFromHtml(html, {
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });
      const docName = 'Rekap Surat Tugas.pdf';
      fileList.push({ name: docName, blob: blob, icon: '📜' });
      updateExportProgress(Math.round((currentTask / (totalTasks + 1)) * 90), null, { name: docName, icon: '📜' });
    }
  } catch (err) {
    console.warn('Gagal membuat PDF Rekap Surat Tugas', err);
  }
  await new Promise(r => setTimeout(r, 40));

  updateExportProgress(95, `Mengemas folder kegiatan "${naming.folderName}"...`);
  await new Promise(r => setTimeout(r, 60));

  let zipBlob = null;
  if (typeof JSZip !== 'undefined') {
    const zip = new JSZip();
    const folder = zip.folder(naming.folderName);
    for (const item of fileList) {
      folder.file(item.name, item.blob);
    }
    zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `${naming.folderName}.zip`);
  }

  updateExportProgress(100, `Selesai! Berkas tersimpan di folder "${naming.folderName}".`);
  finishExportModal(naming.folderName, fileList, zipBlob);
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
      if (id === 'noST' && typeof syncInputsFromFullNoST === 'function') {
        syncInputsFromFullNoST(el.value);
      }
    }
  });

  if (typeof toggleMultiProvinsi === 'function') toggleMultiProvinsi();
  if (typeof toggleUHFields === 'function') toggleUHFields();
  if (typeof toggleKonsumsiFields === 'function') toggleKonsumsiFields();
  if (typeof toggleTarifMakanManual === 'function') toggleTarifMakanManual();

  const mealRows = excelSheetRows(wb, 'Rincian Makan');
  if (mealRows.length > 1 && typeof addManualMealRow === 'function') {
    const list = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
    if (list) list.innerHTML = '';
    mealRows.slice(1).forEach(row => {
      const day = String(row[1] ?? '').trim();
      const session = String(row[2] ?? '').trim();
      const price = Number(row[3]) || 0;
      if (day || price) {
        addManualMealRow(day, session, price);
      }
    });
    if (typeof setManualMealMode === 'function') setManualMealMode('detail');
  } else {
    const loadedMode = document.getElementById('manualMakanMode')?.value || 'flat';
    if (typeof setManualMealMode === 'function') setManualMealMode(loadedMode);
  }

  const loadedMetode = document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS';
  if (typeof onMetodePembayaranChange === 'function') onMetodePembayaranChange(loadedMetode);

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

  if (typeof clearEmployeeTransports === 'function') {
    clearEmployeeTransports();
  }

  costGroups.forEach(cost => {
    const isTransport = cost.kindText.includes('transport');
    const empIds = Object.keys(cost.amounts || {}).filter(k => (cost.amounts[k] || 0) > 0);
    if (isTransport && empIds.length === 1 && typeof getEmployeeTransports === 'function' && typeof setEmployeeTransports === 'function') {
      const empId = Number(empIds[0]);
      const list = getEmployeeTransports(empId);
      list.push({
        id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: cost.name,
        pickup: cost.pickup || '',
        dropoff: cost.dropoff || '',
        amount: cost.amounts[empId]
      });
      setEmployeeTransports(empId, list);
      return;
    }

    addCustomCost();
    const costRow = document.getElementById('customCostList').lastElementChild;
    const kind = cost.kindText.includes('tiket') ? 'tiket'
      : cost.kindText.includes('transport') ? 'transport' : 'other';
    costRow.dataset.kindAuto = '0';
    costRow.querySelector('.custom-cost-name').value = cost.name;
    applyCustomCostKind(costRow, kind);
    costRow.querySelector('.custom-cost-pickup').value = cost.pickup;
    costRow.querySelector('.custom-cost-dropoff').value = cost.dropoff;
    costRow.dataset.amounts = JSON.stringify(cost.amounts || {});
    renderCustomCostAssignments(costRow);
  });

  if (typeof renderRincianTransportEditor === 'function') {
    renderRincianTransportEditor();
  }

  hitungLama();
  markDPRManual();
  updateDPRInput();
  if (typeof toggleUHFields === 'function') toggleUHFields();
  toggleKonsumsiFields();
  updateSBMPreview();
  refreshCustomCostAssignments();
  refreshHotelGuests();
  updateSbmWarnings();

  // Reset semua status error dan update status filled agar tidak ada merah-merah saat import / revisi / baca
  document.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
  document.querySelectorAll('.field-error-msg.is-visible').forEach(m => m.classList.remove('is-visible'));
  const selBox = document.getElementById('selectedBox');
  if (selBox) selBox.classList.remove('has-error');
  const empErr = document.getElementById('empErrorMsg');
  if (empErr) empErr.classList.remove('is-visible');
  if (typeof hideValidationToast === 'function') hideValidationToast();

  if (typeof updateFieldFilledStatus === 'function') {
    REQUIRED_FIELDS.forEach(f => {
      const el = document.getElementById(f.id);
      if (el) updateFieldFilledStatus(el);
    });
    ['provinsiTujuan1', 'provinsiTujuan2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) updateFieldFilledStatus(el);
    });
  }

  const activeTab = document.querySelector('.tab-content.active');
  if (activeTab && activeTab.id.startsWith('tab-')) {
    const tabName = activeTab.id.slice(4);
    if (tabName !== 'input') {
      if (typeof switchTabPanel === 'function') switchTabPanel(tabName);
    }
  }
  return { employees: selectedEmpIds.size, unknown: unknownNames };
}

// =====================================================================
// ANTARMUKA & INTERAKSI PENGGUNA (PerdinKu)
// Tema (Dark/Light), Navigasi Tab, Sidebar, Popup Selamat Datang,
// Pilihan Pegawai, dan Inisialisasi Aplikasi
// =====================================================================

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
// INIT
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Populate provinsi dropdowns
  ['provinsiTujuan', 'provinsiTujuan1', 'provinsiTujuan2'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sbmData.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = formatProvinsi(s.provinsi);
      sel.appendChild(opt);
    });
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
  if (typeof toggleUHFields === 'function') toggleUHFields();
  if (typeof toggleHotelFields === 'function') toggleHotelFields();
  updateSbmWarnings();
  setupRealtimeValidation();
  updateKKPBadgesAndNav();
  if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();
  if (typeof syncJenisPerjalananFromMak === 'function') syncJenisPerjalananFromMak();
  if (typeof updateStSuffixOptions === 'function') updateStSuffixOptions();
  const curNoST = document.getElementById('noST')?.value;
  if (curNoST && typeof syncInputsFromFullNoST === 'function') {
    syncInputsFromFullNoST(curNoST);
  } else if (typeof syncNoSTFromInputs === 'function') {
    syncNoSTFromInputs();
  }
  if (typeof initAutoSaveAndProtection === 'function') {
    initAutoSaveAndProtection();
  }
  initAppLoader();
});

// =====================================================================
// FORM VALIDATION & REQUIRED INDICATORS (!)
// =====================================================================
const REQUIRED_FIELDS = [
  { id: 'noST', label: 'Nomor Surat Tugas (ST)' },
  { id: 'tglST', label: 'Tanggal Surat Tugas' },
  { id: 'tglSPD', label: 'Tanggal SPD' },
  { id: 'tglBerangkat', label: 'Tanggal Berangkat' },
  { id: 'tglKembali', label: 'Tanggal Kembali' },
  { id: 'provinsiTujuan', label: 'Provinsi Tujuan' },
  { id: 'kotaTujuan', label: 'Kota / Kabupaten Tujuan' },
  { id: 'agenda', label: 'Agenda Perjalanan Dinas' },
  { id: 'kodeKegiatan', label: 'Kode Kegiatan' },
  { id: 'kodeSubKegiatan', label: 'Kode Sub Kegiatan' },
  { id: 'mak', label: 'MAK' }
];

let valToastTimer = null;

function validateTripForm() {
  const missing = [];

  REQUIRED_FIELDS.forEach(f => {
    if (f.id === 'provinsiTujuan' && typeof isMultiProvActive === 'function' && isMultiProvActive()) {
      const p1 = document.getElementById('provinsiTujuan1');
      const p2 = document.getElementById('provinsiTujuan2');
      const g1 = p1?.closest('.form-group');
      const g2 = p2?.closest('.form-group');
      const v1 = (p1?.value || '').trim();
      const v2 = (p2?.value || '').trim();
      if (!v1) {
        if (g1) g1.classList.add('has-error');
        missing.push({ el: p1, label: 'Provinsi Tujuan 1', id: 'provinsiTujuan1' });
      } else if (g1) {
        g1.classList.remove('has-error');
      }
      if (!v2) {
        if (g2) g2.classList.add('has-error');
        missing.push({ el: p2, label: 'Provinsi Tujuan 2', id: 'provinsiTujuan2' });
      } else if (g2) {
        g2.classList.remove('has-error');
      }
      return;
    }

    const el = document.getElementById(f.id);
    if (!el) return;
    const val = (el.value || '').trim();
    const group = el.closest('.form-group');
    if (!val) {
      if (group) group.classList.add('has-error');
      missing.push({ el, label: f.label, id: f.id });
    } else {
      if (group) group.classList.remove('has-error');
    }
  });

  // Cek tanggal kembali >= tanggal berangkat
  const tgl1 = document.getElementById('tglBerangkat')?.value;
  const tgl2 = document.getElementById('tglKembali')?.value;
  let dateMismatch = false;
  if (tgl1 && tgl2 && tgl2 < tgl1) {
    const group = document.getElementById('tglKembali')?.closest('.form-group');
    if (group) group.classList.add('has-error');
    missing.push({
      el: document.getElementById('tglKembali'),
      label: 'Tanggal Kembali (harus \u2265 Tanggal Berangkat)',
      id: 'tglKembali',
      customError: true
    });
    dateMismatch = true;
  }

  // Cek multi-provinsi pembagian hari
  if (typeof isMultiProvActive === 'function' && isMultiProvActive()) {
    const totalDays = (typeof getDays === 'function' ? getDays().days : 0) || 1;
    const h1 = parseInt(document.getElementById('hariProvinsi1')?.value) || 0;
    const h2 = parseInt(document.getElementById('hariProvinsi2')?.value) || 0;
    if (totalDays > 1 && (h1 <= 0 || h2 <= 0 || (h1 + h2 !== totalDays))) {
      missing.push({
        el: document.getElementById('hariProvinsi1'),
        label: `Pembagian hari (${h1} hr + ${h2} hr) harus sesuai total lama tugas (${totalDays} Hari)`,
        id: 'hariProvinsi1',
        customError: true
      });
    }
  }

  // Cek minimal 1 pegawai
  const selBox = document.getElementById('selectedBox');
  const empErr = document.getElementById('empErrorMsg');
  if (selectedEmpIds.size === 0) {
    if (selBox) selBox.classList.add('has-error');
    if (empErr) empErr.classList.add('is-visible');
    missing.push({
      el: selBox || document.getElementById('empSearch'),
      label: 'Minimal 1 Pegawai Ditugaskan',
      id: 'selectedBox'
    });
  } else {
    if (selBox) selBox.classList.remove('has-error');
    if (empErr) empErr.classList.remove('is-visible');
  }

  if (valToastTimer) clearTimeout(valToastTimer);
  valToastTimer = setTimeout(() => {
    hideValidationToast();
  }, 5000);

  // Return validation result so callers can check validity
  return { valid: missing.length === 0, missing, dateMismatch };
}

function showValidationToast(missingList, customMsg) {
  const toast = document.getElementById('valToast');
  if (!toast) return;
  const title = document.getElementById('valToastTitle');
  const desc = document.getElementById('valToastDesc');
  if (title) title.textContent = 'Isian Wajib Belum Lengkap';
  if (desc) {
    if (customMsg) {
      desc.textContent = customMsg;
    } else if (missingList && missingList.length > 0) {
      const names = missingList.slice(0, 3).map(m => m.label).join(', ');
      const more = missingList.length > 3 ? ` (+${missingList.length - 3} lainnya)` : '';
      desc.textContent = `Mohon lengkapi: ${names}${more}`;
    } else {
      desc.textContent = 'Mohon lengkapi semua isian bertanda (!) sebelum membuat dokumen.';
    }
  }
  toast.classList.add('is-show');
  if (valToastTimer) clearTimeout(valToastTimer);
  valToastTimer = setTimeout(() => {
    hideValidationToast();
  }, 5000);
}

function hideValidationToast() {
  const toast = document.getElementById('valToast');
  if (toast) toast.classList.remove('is-show');
  if (valToastTimer) {
    clearTimeout(valToastTimer);
    valToastTimer = null;
  }
}

let refreshToastTimer = null;

function showRefreshToast(title = 'Dokumen Berhasil Diperbarui', desc = 'Kalkulasi dan tampilan dokumen telah disegarkan.') {
  const toast = document.getElementById('refreshToast');
  if (!toast) return;
  const titleEl = document.getElementById('refreshToastTitle');
  const descEl = document.getElementById('refreshToastDesc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  toast.classList.add('is-show');
  if (refreshToastTimer) clearTimeout(refreshToastTimer);
  refreshToastTimer = setTimeout(() => {
    hideRefreshToast();
  }, 3500);
}

function hideRefreshToast() {
  const toast = document.getElementById('refreshToast');
  if (toast) toast.classList.remove('is-show');
  if (refreshToastTimer) {
    clearTimeout(refreshToastTimer);
    refreshToastTimer = null;
  }
}

function refreshDocument(btn, renderFnName) {
  if (!btn) {
    const activeTab = document.querySelector('.tab-content.active');
    btn = activeTab ? activeTab.querySelector('.btn-primary') : null;
  }
  if (!btn) return;
  if (btn.dataset.isRefreshing === 'true') return; // Cegah double-click selama durasi 3 detik
  btn.dataset.isRefreshing = 'true';
  btn.disabled = true;
  btn.classList.add('is-refreshing');

  const origHTML = btn.innerHTML;

  // Temukan elemen kontainer dokumen di tab yang sedang aktif
  const tabPane = btn.closest('.tab-content') || document.querySelector('.tab-content.active');
  const docContainer = tabPane ? (tabPane.querySelector('.doc-page, [id$="Out"], .doc-preview-wrap, .kuitansi-area, .sppd-sheet, .kendali-page, .rekap-page') || tabPane) : null;
  if (docContainer) {
    docContainer.classList.add('doc-refresh-loading');
  }

  // Pra-sinkronisasi data & kalkulasi sebelum render
  try {
    if (typeof syncJenisPerjalananFromMak === 'function') syncJenisPerjalananFromMak();
    if (typeof updateDPRInput === 'function') updateDPRInput();
    if (typeof hitungBiaya === 'function' && typeof selectedEmpIds !== 'undefined' && typeof employees !== 'undefined') {
      [...selectedEmpIds].forEach(id => {
        const emp = employees.find(e => e.id === id);
        if (emp) hitungBiaya(emp);
      });
    }
  } catch (err) {
    console.warn('Sync on refresh error:', err);
  }

  // Tampilkan spinner dan status menyegarkan (durasi 1 detik)
  btn.innerHTML = `<svg class="ico is-refresh-spin"><use href="#i-refresh"></use></svg><span>Menyegarkan...</span>`;

  // Jalankan setelah tepat 1.000 ms (1 detik)
  setTimeout(() => {
    // Eksekusi fungsi render spesifik tab dokumen
    try {
      if (renderFnName === 'renderKuitansiPerorangan') {
        const sel = document.getElementById('kuitansiPeroranganPegawai');
        if (!sel || !sel.value) {
          if (typeof populateKuitansiPeroranganSelect === 'function') populateKuitansiPeroranganSelect();
          else if (typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
        } else {
          if (typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
        }
      } else if (renderFnName === 'renderSPPDPerorangan') {
        const sel = document.getElementById('sppdPegawai');
        if (!sel || !sel.value) {
          if (typeof populateSPPDSelect === 'function') populateSPPDSelect();
          else if (typeof renderSPPDPerorangan === 'function') renderSPPDPerorangan();
        } else {
          if (typeof renderSPPDPerorangan === 'function') renderSPPDPerorangan();
        }
      } else if (renderFnName === 'renderRincian') {
        const sel = document.getElementById('rincianPegawai') || document.getElementById('rincianBiayaPegawai');
        if (!sel || !sel.value) {
          if (typeof populateRincianSelect === 'function') populateRincianSelect();
          else if (typeof renderRincian === 'function') renderRincian();
        } else {
          if (typeof renderRincian === 'function') renderRincian();
        }
      } else if (renderFnName === 'renderDPR') {
        const sel = document.getElementById('dprPegawai');
        if (!sel || !sel.value) {
          if (typeof populateDPRSelect === 'function') populateDPRSelect();
          else if (typeof renderDPR === 'function') renderDPR();
        } else {
          if (typeof renderDPR === 'function') renderDPR();
        }
      } else if (typeof window[renderFnName] === 'function') {
        window[renderFnName]();
      } else if (typeof renderFnName === 'function') {
        renderFnName();
      }
    } catch (err) {
      console.error('Render on refresh error:', err);
    }

    // Hilangkan efek visual loading pada dokumen
    if (docContainer) {
      docContainer.classList.remove('doc-refresh-loading');
    }

    // Tampilkan state sukses pada tombol
    btn.innerHTML = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;display:inline-block;"><polyline points="20 6 9 17 4 12"/></svg><span>Diperbarui!</span>`;

    // Tentukan label dokumen untuk toast
    let docLabel = 'Dokumen';
    const fnStr = String(renderFnName);
    if (fnStr.includes('Nominatif')) docLabel = 'Daftar Nominatif';
    else if (fnStr.includes('RekapKuitansi')) docLabel = 'Rekap Kuitansi';
    else if (fnStr.includes('KuitansiPerorangan')) docLabel = 'Kuitansi Perorangan';
    else if (fnStr.includes('SPPD')) docLabel = 'SPPD Perorangan';
    else if (fnStr.includes('LembarKendali')) docLabel = 'Lembar Kendali';
    else if (fnStr.includes('RekapRincian')) docLabel = 'Rekap Rincian';
    else if (fnStr.includes('RekapSPT')) docLabel = 'Rekap SPT';
    else if (fnStr.includes('Rincian')) docLabel = 'Rincian Biaya';
    else if (fnStr.includes('DPR')) docLabel = 'Lembar DPR';

    showRefreshToast(`${docLabel} Berhasil Diperbarui`, `Data kalkulasi dan tampilan dokumen telah disegarkan.`);

    // Kembalikan tombol ke keadaan semula setelah 800ms
    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.disabled = false;
      btn.classList.remove('is-refreshing');
      btn.dataset.isRefreshing = 'false';
    }, 800);
  }, 1000);
}

window.showRefreshToast = showRefreshToast;
window.hideRefreshToast = hideRefreshToast;
window.refreshDocument = refreshDocument;

// =====================================================================
// NOMOR SURAT TUGAS (ST) PREFIX & SUFFIX HANDLER
// =====================================================================
function getStYear() {
  const tgl = document.getElementById('tglST')?.value;
  if (tgl) {
    const yr = new Date(tgl + 'T00:00:00').getFullYear();
    if (yr && !isNaN(yr)) return yr;
  }
  return 2026;
}

function updateStSuffixOptions() {
  const yr = getStYear();
  const sel = document.getElementById('noSTSuffix');
  const opt1Val = `/ST/Sj.07/${yr}`;
  const opt2Val = `/ST/Sj/${yr}`;

  if (sel && sel.options && sel.options.length >= 2) {
    const curVal = sel.value;
    const isSjOnly = curVal.includes('/ST/Sj/') && !curVal.includes('/ST/Sj.');
    sel.options[0].value = opt1Val;
    sel.options[0].textContent = opt1Val;
    sel.options[1].value = opt2Val;
    sel.options[1].textContent = opt2Val;
    sel.value = isSjOnly ? opt2Val : opt1Val;
  }
}

function setStSuffix(suffixPattern) {
  const yr = getStYear();
  const sel = document.getElementById('noSTSuffix');
  const actualSuffix = suffixPattern.replace(/\/\d{4}$/, `/${yr}`);
  if (sel) {
    sel.value = actualSuffix;
    onStSuffixSelectChange();
  }
}

function onStSuffixSelectChange() {
  syncNoSTFromInputs();
}

function syncNoSTFromInputs() {
  const numInput = document.getElementById('noSTNum');
  const suffixSel = document.getElementById('noSTSuffix');
  const fullInput = document.getElementById('noST');
  if (!fullInput) return;

  const num = (numInput?.value || '').trim();
  const suffix = suffixSel?.value || '/ST/Sj.07/2026';

  if (!num) {
    fullInput.value = '';
  } else if (num.includes('/')) {
    fullInput.value = num;
  } else {
    fullInput.value = `${num}${suffix}`;
  }

  const group = fullInput.closest('.form-group');
  if (group) {
    if (fullInput.value) {
      group.classList.remove('has-error');
      const wrap = group.querySelector('.st-prefix-wrap');
      if (wrap) wrap.classList.remove('has-error');
    }
  }
}

function syncInputsFromFullNoST(fullVal) {
  const numInput = document.getElementById('noSTNum');
  const suffixSel = document.getElementById('noSTSuffix');
  const fullInput = document.getElementById('noST');
  if (!fullInput) return;

  const raw = String(fullVal || '').trim();
  fullInput.value = raw;

  if (!numInput || !suffixSel) return;
  if (!raw) {
    numInput.value = '';
    return;
  }

  const match = raw.match(/^([^\/]+)(\/.*)$/);
  if (match) {
    numInput.value = match[1].trim();
    const matchedSuffix = match[2].trim();
    let found = false;
    for (let i = 0; i < suffixSel.options.length; i++) {
      if (suffixSel.options[i].value === matchedSuffix) {
        suffixSel.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = matchedSuffix;
      opt.textContent = matchedSuffix;
      suffixSel.appendChild(opt);
      suffixSel.value = matchedSuffix;
    }
  } else {
    numInput.value = raw;
  }
  onStSuffixSelectChange();
}

window.getStYear = getStYear;
window.updateStSuffixOptions = updateStSuffixOptions;
window.setStSuffix = setStSuffix;
window.onStSuffixSelectChange = onStSuffixSelectChange;
window.syncNoSTFromInputs = syncNoSTFromInputs;
window.syncInputsFromFullNoST = syncInputsFromFullNoST;

function updateFieldFilledStatus(el) {
  if (!el) return;
  const ctrl = el.closest('.field-control');
  if (!ctrl) return;
  const icon = ctrl.querySelector('.field-inner-icon');
  const val = (el.value || '').trim();
  if (val) {
    ctrl.classList.add('is-filled');
    if (icon) {
      icon.style.display = 'none';
      icon.textContent = '';
      icon.title = '';
    }
  } else {
    ctrl.classList.remove('is-filled');
    if (icon) {
      icon.style.display = 'inline-flex';
      icon.textContent = '!';
      icon.title = 'Wajib diisi';
    }
  }
}

function setupRealtimeValidation() {
  REQUIRED_FIELDS.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el) return;
    const group = el.closest('.form-group');
    // Set initial status
    updateFieldFilledStatus(el);

    ['input', 'change'].forEach(evt => {
      el.addEventListener(evt, () => {
        updateFieldFilledStatus(el);
        if ((el.value || '').trim()) {
          if (group) group.classList.remove('has-error');
        }
      });
    });
    el.addEventListener('blur', () => {
      updateFieldFilledStatus(el);
      if (!(el.value || '').trim()) {
        if (group) group.classList.add('has-error');
      }
    });
  });

  const stNum = document.getElementById('noSTNum');
  if (stNum) {
    ['input', 'change'].forEach(evt => {
      stNum.addEventListener(evt, () => {
        syncNoSTFromInputs();
      });
    });
    stNum.addEventListener('blur', () => {
      syncNoSTFromInputs();
      const el = document.getElementById('noST');
      const group = el?.closest('.form-group');
      if (group && !(el?.value || '').trim()) {
        group.classList.add('has-error');
      }
    });
  }

  ['provinsiTujuan1', 'provinsiTujuan2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const group = el.closest('.form-group');
    updateFieldFilledStatus(el);
    ['input', 'change'].forEach(evt => {
      el.addEventListener(evt, () => {
        updateFieldFilledStatus(el);
        if ((el.value || '').trim()) {
          if (group) group.classList.remove('has-error');
        }
      });
    });
    el.addEventListener('blur', () => {
      updateFieldFilledStatus(el);
      if (!(el.value || '').trim() && typeof isMultiProvActive === 'function' && isMultiProvActive()) {
        if (group) group.classList.add('has-error');
      }
    });
  });
}

// =====================================================================
// APP SPLASH LOADER (5 DETIK) & TAB LAZY LOADING
// =====================================================================
function initAppLoader() {
  const loader = document.getElementById('appLoader');
  if (!loader) return;
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  const status = document.getElementById('loaderStatus');

  const duration = 4800; // ~5 detik (4.8s progress + fade out = 5.2s total)
  const startTime = performance.now();

  const stages = [
    { threshold: 18, text: 'Memuat modul dan komponen sistem...' },
    { threshold: 38, text: 'Sinkronisasi tarif PMK SBM 2026...' },
    { threshold: 62, text: 'Menyiapkan template dokumen & SPPD...' },
    { threshold: 82, text: 'Menginisialisasi modul kuitansi & nominatif...' },
    { threshold: 99, text: 'Memuat antarmuka pengguna...' },
    { threshold: 100, text: 'Aplikasi siap digunakan!' }
  ];

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const currentPct = Math.round(ease * 100);

    if (fill) fill.style.width = currentPct + '%';
    if (pct) pct.textContent = currentPct + '%';

    const stage = stages.find(s => currentPct <= s.threshold) || stages[stages.length - 1];
    if (status && stage) status.textContent = stage.text;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        loader.classList.add('is-hidden');
        initWelcomeModalAfterLoader();
      }, 350);
    }
  }

  requestAnimationFrame(tick);
}

let pageLoaderTimer = null;

function showPageTransitionLoader(targetName, onSwitch) {
  const loader = document.getElementById('pageLoader');
  const textEl = document.getElementById('pageLoaderText');

  if (textEl) {
    const meta = tabMeta[targetName];
    const pageName = meta ? meta[0] : 'Halaman';
    textEl.textContent = `Memuat ${pageName}...`;
  }

  if (!loader) {
    if (onSwitch) onSwitch();
    return;
  }

  loader.classList.add('is-active');

  if (pageLoaderTimer) clearTimeout(pageLoaderTimer);
  pageLoaderTimer = setTimeout(() => {
    if (onSwitch) onSwitch();
    setTimeout(() => {
      loader.classList.remove('is-active');
    }, 100);
  }, 420);
}

function triggerTabProgress(callback) {
  const bar = document.getElementById('tabProgress');
  if (!bar) {
    if (callback) callback();
    return;
  }
  bar.classList.remove('is-done');
  bar.classList.add('is-loading');

  setTimeout(() => {
    if (callback) callback();
    bar.classList.remove('is-loading');
    bar.classList.add('is-done');
    setTimeout(() => {
      bar.classList.remove('is-done');
    }, 450);
  }, 220);
}

function initWelcomeModalAfterLoader() {
  let isDismissed = false;
  try {
    isDismissed = localStorage.getItem('perdinku_welcome_dismissed') === '1';
  } catch (e) {}

  if (!isDismissed) {
    setTimeout(() => {
      openWelcome();
    }, 300);
  }
}

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
  riwayat: ['Riwayat Perjalanan', 'Arsip & Revisi'],
  pengaturan: ['Pengaturan', 'Sistem']
};

function showTab(name) {
  const currentActive = document.querySelector('.tab-content.active');
  if (currentActive && currentActive.id === 'tab-' + name) {
    return;
  }
  if (name !== 'input' && name !== 'pengaturan' && name !== 'riwayat') {
    const val = validateTripForm();
    if (!val.valid) {
      showValidationToast(val.missing, val.dateMismatch ? 'Tanggal kembali tidak boleh sebelum tanggal berangkat!' : null);
      return;
    }
  }
  triggerTabProgress();
  showPageTransitionLoader(name, () => {
    switchTabPanel(name);
  });
}

function switchTabPanel(name) {
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
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  if (titleEl) {
    if (name === 'dpr' && isKKP) titleEl.textContent = 'DPR KKP Perorangan';
    else if (name === 'rekap-kuitansi' && isKKP) titleEl.textContent = 'Rekap Kuitansi KKP';
    else if (name === 'kuitansi-perorangan' && isKKP) titleEl.textContent = 'Kuitansi KKP Perorangan';
    else titleEl.textContent = meta[0];
  }
  if (eyebrowEl) eyebrowEl.textContent = meta[1];
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'riwayat' && typeof renderTripHistory === 'function') renderTripHistory();
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

function onMetodePembayaranChange(val) {
  const f1 = document.getElementById('metodePembayaran');
  const f2 = document.getElementById('lk_metodePembayaran');
  if (f1 && f1.value !== val) f1.value = val;
  if (f2 && f2.value !== val) f2.value = val;
  updateKKPBadgesAndNav();
  if (typeof renderCurrentTab === 'function') {
    renderCurrentTab();
  } else {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
      const tabId = activeTab.id.replace(/^tab-/, '');
      if (tabId === 'lembar-kendali' && typeof renderLembarKendali === 'function') renderLembarKendali();
      if (tabId === 'rekap-kuitansi' && typeof renderRekapKuitansi === 'function') renderRekapKuitansi();
      if (tabId === 'kuitansi-perorangan' && typeof renderKuitansiPerorangan === 'function') renderKuitansiPerorangan();
      if (tabId === 'dpr' && typeof renderDPR === 'function') renderDPR();
    }
  }
}

function updateKKPBadgesAndNav() {
  const isKKP = (document.getElementById('metodePembayaran')?.value || document.getElementById('lk_metodePembayaran')?.value || 'LS') === 'KKP';
  const dprNav = document.querySelector('.tab-btn[data-tab="dpr"] .nav-text');
  if (dprNav) {
    dprNav.textContent = isKKP ? 'DPR KKP' : 'DPR Perorangan';
  }
  const dprCard = document.querySelector('.action-card[onclick*="showTab(\'dpr\')"] .action-body strong');
  if (dprCard) {
    dprCard.textContent = isKKP ? 'DPR KKP Perorangan' : 'DPR Perorangan';
  }
  const dprCardSub = document.querySelector('.action-card[onclick*="showTab(\'dpr\')"] .action-body small');
  if (dprCardSub) {
    dprCardSub.textContent = isKKP ? 'Daftar pengeluaran riil KKP' : 'Daftar pengeluaran riil';
  }
  const titleEl = document.getElementById('dprCardTitle');
  if (titleEl) {
    titleEl.textContent = isKKP ? 'Pilih Pegawai untuk DPR KKP' : 'Pilih Pegawai untuk DPR';
  }
  const subEl = document.getElementById('dprCardSub');
  if (subEl) {
    subEl.textContent = isKKP ? 'Daftar pengeluaran riil perjalanan dinas jabatan dengan KKP per orang' : 'Daftar pengeluaran riil per orang';
  }
  const btnPrint = document.getElementById('labelPrintDPR');
  if (btnPrint) {
    btnPrint.textContent = isKKP ? 'Cetak DPR KKP' : 'Cetak DPR';
  }
  const btnPrintAll = document.getElementById('labelPrintAllDPR');
  if (btnPrintAll) {
    btnPrintAll.textContent = isKKP ? 'Cetak Semua DPR KKP' : 'Cetak Semua DPR';
  }
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
  initWelcomeModalAfterLoader();
}

// =====================================================================
// DOKUMEN RESMI PMK SBM 2026 MODAL VIEWER
// =====================================================================
const PMK_FILE_PATH = 'PMK_Nomor_32_Tahun_2025_SBM_2026.pdf';

function openPmkModal(defaultPage) {
  const overlay = document.getElementById('pmkOverlay');
  if (!overlay) return;
  const page = parseInt(defaultPage, 10) || 15;

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  const pill = document.querySelector(`.pmk-pill[data-page="${page}"]`) || document.querySelector('.pmk-pill');
  jumpPmkPage(page, pill);
}

function closePmkModal() {
  const overlay = document.getElementById('pmkOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function handlePmkBackdrop(event) {
  if (event.target && event.target.id === 'pmkOverlay') {
    closePmkModal();
  }
}

function jumpPmkPage(pageNum, btnEl) {
  const page = parseInt(pageNum, 10) || 15;
  const targetUrl = `${PMK_FILE_PATH}#page=${page}&zoom=page-width`;

  // 1. Update pills visual active state
  document.querySelectorAll('.pmk-pill').forEach(btn => {
    const p = parseInt(btn.getAttribute('data-page'), 10);
    btn.classList.toggle('active', p === page);
  });
  if (btnEl) {
    btnEl.classList.add('active');
    try {
      btnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch (e) {}
  }

  // 2. Update page input box if present
  const pageInput = document.getElementById('pmkPageInput');
  if (pageInput) pageInput.value = page;

  // 3. Update "Tab Baru" button href so opening in new tab also goes to this page
  const tabBtn = document.getElementById('pmkNewTabBtn');
  if (tabBtn) tabBtn.href = targetUrl;

  // 4. Force Edge / Chromium PDF re-navigation via fresh iframe element
  const oldIframe = document.getElementById('pmkPdfFrame');
  const container = document.querySelector('.pmk-body');
  if (container) {
    const newIframe = document.createElement('iframe');
    newIframe.id = 'pmkPdfFrame';
    newIframe.className = 'pmk-iframe';
    newIframe.title = 'PDF Viewer PMK SBM 2026';
    newIframe.src = targetUrl;

    if (oldIframe && oldIframe.parentNode) {
      oldIframe.parentNode.replaceChild(newIframe, oldIframe);
    } else {
      container.appendChild(newIframe);
    }
  }
}

function jumpPmkFromInput() {
  const input = document.getElementById('pmkPageInput');
  if (!input) return;
  let p = parseInt(input.value, 10);
  if (isNaN(p) || p < 1) p = 1;
  if (p > 110) p = 110;
  input.value = p;
  const pill = document.querySelector(`.pmk-pill[data-page="${p}"]`);
  jumpPmkPage(p, pill);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeSidebar();
    closeWelcome();
    closePmkModal();
    if (typeof closeMealDuplicateModal === 'function') closeMealDuplicateModal();
  }
});

document.addEventListener('input', (e) => { 
  updateSbmWarnings(); 
  refreshHotelSummaries(); 
  const rincianTab = document.getElementById('tab-rincian');
  if (rincianTab && rincianTab.classList.contains('active')) {
    if (!e.target.closest('#rincianOut') && !e.target.closest('#rincianCockpit')) {
      if (typeof renderRincian === 'function') renderRincian();
    }
  }
});
document.addEventListener('change', (e) => { 
  updateSbmWarnings(); 
  refreshHotelSummaries(); 
  const rincianTab = document.getElementById('tab-rincian');
  if (rincianTab && rincianTab.classList.contains('active')) {
    if (!e.target.closest('#rincianOut') && !e.target.closest('#rincianCockpit')) {
      if (typeof renderRincian === 'function') renderRincian();
    }
  }
});

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
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function renderSelectedTags() {
  const box = document.getElementById('selectedBox');
  const count = document.getElementById('countSelected');
  const empErr = document.getElementById('empErrorMsg');
  if (selectedEmpIds.size === 0) {
    box.innerHTML = '<span class="empty-note">Belum ada pegawai dipilih</span>';
    count.textContent = '0';
    return;
  }
  if (box) box.classList.remove('has-error');
  if (empErr) empErr.classList.remove('is-visible');
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
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function addEmpSegment(id) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.push({ start: '', end: '' });
  empTripSegments.set(id, segs);
  renderTripDates();
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function updateEmpSegment(id, index, field, value) {
  const segs = [...(empTripSegments.get(id) || [])];
  if (!segs[index]) return;
  segs[index][field] = value;
  if (field === 'start' && (!segs[index].end || segs[index].end < value)) segs[index].end = value;
  if (field === 'end' && segs[index].start && value && value < segs[index].start) segs[index].start = value;
  empTripSegments.set(id, segs);
  renderTripDates();
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function removeEmpSegment(id, index) {
  const segs = [...(empTripSegments.get(id) || [])];
  segs.splice(index, 1);
  if (segs.length) empTripSegments.set(id, segs);
  else empTripSegments.delete(id);
  renderTripDates();
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

function resetEmpDates(id) {
  empTripSegments.delete(id);
  renderTripDates();
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
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
  if (typeof scheduleAutoSaveDraft === 'function') scheduleAutoSaveDraft();
}

// =====================================================================
// AUTOSAVE DRAFT & ACCIDENTAL REFRESH / UNLOAD PROTECTION
// =====================================================================
const PERJADIN_DRAFT_KEY = 'perdinku_active_draft_v1';
let autoSaveTimer = null;
window._isResetting = false;

function isPerjadinDraftDirty() {
  const noST = (document.getElementById('noSTNum')?.value || document.getElementById('noST')?.value || '').trim();
  const agenda = (document.getElementById('agenda')?.value || '').trim();
  const prov = (document.getElementById('provinsiTujuan')?.value || '').trim();
  const kota = (document.getElementById('kotaTujuan')?.value || '').trim();
  const tglST = (document.getElementById('tglST')?.value || '').trim();
  const empCount = (typeof selectedEmpIds !== 'undefined' && selectedEmpIds) ? selectedEmpIds.size : 0;
  return Boolean(noST || agenda || (prov && prov !== '-') || kota || empCount > 0);
}

function updateAutosaveIndicator(state) {
  const badge = document.getElementById('autosaveStatus');
  if (!badge) return;
  const textEl = badge.querySelector('.autosave-text');
  badge.classList.remove('is-saving', 'is-saved', 'is-clean');

  if (state === 'saving') {
    badge.classList.add('is-saving');
    if (textEl) textEl.textContent = 'Menyimpan...';
    badge.title = 'Sedang menyimpan perubahan draft ke browser...';
  } else if (state === 'saved') {
    badge.classList.add('is-saved');
    if (textEl) textEl.textContent = 'Draft Tersimpan';
    badge.title = 'Draft tersimpan otomatis di browser lokal Anda (aman dari refresh).';
  } else {
    badge.classList.add('is-clean');
    if (textEl) textEl.textContent = 'Draft Otomatis Aktif';
    badge.title = 'Penyimpanan otomatis aktif. Form siap digunakan.';
  }
}

function collectPerjadinDraftData() {
  const fields = {};
  const fieldIds = [
    'noST', 'noSTNum', 'noSTSuffix',
    'tglST', 'tglSPD', 'tglBerangkat', 'tglKembali', 'lamaTugas',
    'provinsiTujuan', 'kotaTujuan', 'agenda', 'kodeKegiatan', 'kodeSubKegiatan', 'mak',
    'cbUH', 'cbHotel', 'cbDPR', 'cbTiket',
    'persenUH', 'jenisKegiatan', 'cbKonsumsi',
    'jmlMakanRapat', 'jmlSnackRapat', 'tarifMakan', 'tarifSnack', 'cbTarifMakanManual',
    'cbMultiProvinsi', 'provinsiTujuan1', 'provinsiTujuan2', 'kotaTujuan1', 'kotaTujuan2',
    'hariProvinsi1', 'hariProvinsi2', 'cbKonsumsiBiasa', 'manualMakanMode', 'metodePembayaran',
    'lk_tanggalMasuk', 'lk_pelaksana', 'lk_nomorSPM', 'lk_nomorSPD', 'lk_jenisPerjalanan', 'lk_metodePembayaran'
  ];

  if (typeof EXCEL_SETTING_FIELDS !== 'undefined') {
    EXCEL_SETTING_FIELDS.forEach(([, id]) => {
      if (id && !fieldIds.includes(id)) fieldIds.push(id);
    });
  }

  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') {
      fields[id] = el.checked;
    } else {
      fields[id] = el.value;
    }
  });

  const empIds = (typeof selectedEmpIds !== 'undefined' && selectedEmpIds) ? [...selectedEmpIds] : [];
  const segments = [];
  if (typeof empTripSegments !== 'undefined' && empTripSegments) {
    empTripSegments.forEach((segs, id) => {
      segments.push([id, segs]);
    });
  }
  const spdMap = (typeof spdPerEmployee !== 'undefined' && spdPerEmployee) ? { ...spdPerEmployee } : {};
  const costCfg = (typeof employeeCostConfig !== 'undefined' && employeeCostConfig) ? employeeCostConfig : {};
  const transports = (typeof employeeTransports !== 'undefined' && employeeTransports) ? employeeTransports : {};

  const hotels = [];
  document.querySelectorAll('#hotelList .hotel-row').forEach(row => {
    hotels.push({
      name: row.querySelector('.hotel-name')?.value || '',
      nights: Number(row.querySelector('.hotel-nights')?.value) || 0,
      price: row.querySelector('.hotel-price')?.value || '',
      guestIds: [...row.querySelectorAll('.hotel-guest-check:checked')].map(cb => Number(cb.dataset.employeeId))
    });
  });

  const customCosts = [];
  document.querySelectorAll('.custom-cost-row').forEach(row => {
    let amounts = {};
    try { amounts = JSON.parse(row.dataset.amounts || '{}'); } catch(e) {}
    customCosts.push({
      name: row.querySelector('.custom-cost-name')?.value || '',
      kind: row.querySelector('.custom-kind-btn.active')?.dataset.kind || 'other',
      pickup: row.querySelector('.custom-cost-pickup')?.value || '',
      dropoff: row.querySelector('.custom-cost-dropoff')?.value || '',
      amounts
    });
  });

  const manualMeals = [];
  const mealTbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
  if (mealTbody) {
    const rows = mealTbody.querySelectorAll ? mealTbody.querySelectorAll('.manual-meal-row') : mealTbody.children;
    rows.forEach(row => {
      const day = row.querySelector('.manual-meal-day')?.value || '';
      const session = row.querySelector('.manual-meal-session')?.value || '';
      const price = row.querySelector('.manual-meal-price')?.value || '';
      if (day || session || price) {
        manualMeals.push({ day, session, price });
      }
    });
  }

  return {
    version: 1,
    savedAt: Date.now(),
    fields,
    empIds,
    segments,
    spdMap,
    costCfg,
    transports,
    hotels,
    customCosts,
    manualMeals
  };
}

function restorePerjadinDraftData(data) {
  if (!data || !data.fields) return false;

  Object.keys(data.fields).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = data.fields[id];
    if (el.type === 'checkbox') {
      el.checked = !!val;
    } else {
      el.value = val ?? '';
    }
  });

  if (data.fields.noST) {
    if (typeof syncInputsFromFullNoST === 'function') {
      syncInputsFromFullNoST(data.fields.noST);
    }
  } else if (data.fields.noSTNum) {
    const numEl = document.getElementById('noSTNum');
    if (numEl) numEl.value = data.fields.noSTNum;
    const sfxEl = document.getElementById('noSTSuffix');
    if (sfxEl && data.fields.noSTSuffix) sfxEl.value = data.fields.noSTSuffix;
    if (typeof syncNoSTFromInputs === 'function') syncNoSTFromInputs();
  }

  if (data.fields.provinsiTujuan && typeof changeProvince === 'function') {
    changeProvince();
  }

  if (typeof selectedEmpIds !== 'undefined' && Array.isArray(data.empIds)) {
    selectedEmpIds.clear();
    data.empIds.forEach(id => selectedEmpIds.add(Number(id)));
  }

  if (typeof empTripSegments !== 'undefined' && Array.isArray(data.segments)) {
    empTripSegments.clear();
    data.segments.forEach(([id, segs]) => {
      empTripSegments.set(Number(id), segs);
    });
  }

  if (typeof spdPerEmployee !== 'undefined' && data.spdMap) {
    spdPerEmployee = { ...data.spdMap };
  }

  if (typeof employeeCostConfig !== 'undefined' && data.costCfg) {
    employeeCostConfig = { ...data.costCfg };
  }
  if (typeof employeeTransports !== 'undefined' && data.transports) {
    employeeTransports = { ...data.transports };
  }

  if (typeof renderEmployeeList === 'function') renderEmployeeList();
  if (typeof renderSelectedTags === 'function') renderSelectedTags();
  if (typeof renderTripDates === 'function') renderTripDates();

  const hotelList = document.getElementById('hotelList');
  if (hotelList) {
    hotelList.innerHTML = '';
    if (Array.isArray(data.hotels) && data.hotels.length > 0) {
      data.hotels.forEach(h => {
        if (typeof addHotelRow === 'function') {
          addHotelRow(h.nights || 1);
          const row = hotelList.lastElementChild;
          if (row) {
            const nameEl = row.querySelector('.hotel-name');
            if (nameEl) nameEl.value = h.name || '';
            const priceEl = row.querySelector('.hotel-price');
            if (priceEl) priceEl.value = h.price || '';
            const nightsEl = row.querySelector('.hotel-nights');
            if (nightsEl && h.nights) nightsEl.value = h.nights;
            if (Array.isArray(h.guestIds)) {
              row.querySelectorAll('.hotel-guest-check').forEach(cb => {
                cb.checked = h.guestIds.includes(Number(cb.dataset.employeeId));
              });
            }
            if (typeof updateHotelSummary === 'function') updateHotelSummary(row);
          }
        }
      });
    }
  }

  const customCostList = document.getElementById('customCostList');
  if (customCostList) {
    customCostList.innerHTML = '';
    if (Array.isArray(data.customCosts) && data.customCosts.length > 0) {
      data.customCosts.forEach(c => {
        if (typeof addCustomCost === 'function') {
          addCustomCost();
          const row = customCostList.lastElementChild;
          if (row) {
            row.dataset.kindAuto = '0';
            const nameEl = row.querySelector('.custom-cost-name');
            if (nameEl) nameEl.value = c.name || '';
            if (typeof applyCustomCostKind === 'function') applyCustomCostKind(row, c.kind || 'other');
            const pickEl = row.querySelector('.custom-cost-pickup');
            if (pickEl) pickEl.value = c.pickup || '';
            const dropEl = row.querySelector('.custom-cost-dropoff');
            if (dropEl) dropEl.value = c.dropoff || '';
            row.dataset.amounts = JSON.stringify(c.amounts || {});
            if (typeof renderCustomCostAssignments === 'function') renderCustomCostAssignments(row);
          }
        }
      });
    }
  }

  if (Array.isArray(data.manualMeals) && data.manualMeals.length > 0 && typeof addManualMealRow === 'function') {
    const list = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
    if (list) {
      list.innerHTML = '';
      data.manualMeals.forEach(m => {
        addManualMealRow(m.day, m.session, m.price);
      });
    }
  }

  if (typeof toggleMultiProvinsi === 'function') toggleMultiProvinsi();
  if (typeof toggleUHFields === 'function') toggleUHFields();
  if (typeof toggleHotelFields === 'function') toggleHotelFields();
  if (typeof toggleKonsumsiFields === 'function') toggleKonsumsiFields();
  if (typeof toggleTarifMakanManual === 'function') toggleTarifMakanManual();
  if (typeof hitungLama === 'function') hitungLama();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  if (typeof updateAllSpdSuffixLabels === 'function') updateAllSpdSuffixLabels();
  if (typeof renderRincianTransportEditor === 'function') renderRincianTransportEditor();
  if (typeof refreshHotelSummaries === 'function') refreshHotelSummaries();

  return true;
}

function scheduleAutoSaveDraft() {
  updateAutosaveIndicator('saving');
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    try {
      if (isPerjadinDraftDirty()) {
        const draft = collectPerjadinDraftData();
        localStorage.setItem(PERJADIN_DRAFT_KEY, JSON.stringify(draft));
        updateAutosaveIndicator('saved');
      } else {
        updateAutosaveIndicator('clean');
      }
    } catch (e) {
      console.warn('Autosave error:', e);
    }
  }, 400);
}

function resetPerjadinForm(isSilent = false) {
  try {
    localStorage.removeItem(PERJADIN_DRAFT_KEY);
  } catch (e) {}

  if (typeof selectedEmpIds !== 'undefined' && selectedEmpIds) {
    selectedEmpIds.clear();
  }
  if (typeof empTripSegments !== 'undefined' && empTripSegments) {
    empTripSegments.clear();
  }
  if (typeof spdPerEmployee !== 'undefined') {
    spdPerEmployee = {};
  }
  if (typeof employeeCostConfig !== 'undefined') {
    employeeCostConfig = {};
  }
  if (typeof employeeTransports !== 'undefined') {
    employeeTransports = {};
  }

  const noSTNum = document.getElementById('noSTNum');
  if (noSTNum) noSTNum.value = '';
  const noST = document.getElementById('noST');
  if (noST) noST.value = '';
  const noSTSuffix = document.getElementById('noSTSuffix');
  if (noSTSuffix && noSTSuffix.options.length) noSTSuffix.selectedIndex = 0;

  const agenda = document.getElementById('agenda');
  if (agenda) agenda.value = '';
  const mak = document.getElementById('mak');
  if (mak) mak.value = '';

  const prov = document.getElementById('provinsiTujuan');
  if (prov) prov.value = '';
  const kota = document.getElementById('kotaTujuan');
  if (kota) kota.value = '';

  const today = new Date().toISOString().split('T')[0];
  ['tglST', 'tglSPD', 'tglBerangkat', 'tglKembali'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });

  const lamaTugas = document.getElementById('lamaTugas');
  if (lamaTugas) lamaTugas.value = '1 Hari';

  const cbMulti = document.getElementById('cbMultiProvinsi');
  if (cbMulti) cbMulti.checked = false;
  const sec = document.getElementById('multiProvSection');
  if (sec) sec.style.display = 'none';
  const mainProvGroup = document.getElementById('mainProvinsiGroup');
  if (mainProvGroup) mainProvGroup.style.display = '';
  ['provinsiTujuan1', 'provinsiTujuan2', 'kotaTujuan1', 'kotaTujuan2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['hariProvinsi1', 'hariProvinsi2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = 1;
  });

  const cbDPR = document.getElementById('cbDPR'); if (cbDPR) cbDPR.checked = true;
  const cbTiket = document.getElementById('cbTiket'); if (cbTiket) cbTiket.checked = false;
  const cbKonsumsi = document.getElementById('cbKonsumsi'); if (cbKonsumsi) cbKonsumsi.checked = false;
  const cbKonsumsiBiasa = document.getElementById('cbKonsumsiBiasa'); if (cbKonsumsiBiasa) cbKonsumsiBiasa.checked = false;
  const persenUH = document.getElementById('persenUH'); if (persenUH) persenUH.value = '100%';
  const jenisKegiatan = document.getElementById('jenisKegiatan'); if (jenisKegiatan) jenisKegiatan.value = 'biasa';
  const jmlMakan = document.getElementById('jmlMakanRapat'); if (jmlMakan) jmlMakan.value = 0;
  const jmlSnack = document.getElementById('jmlSnackRapat'); if (jmlSnack) jmlSnack.value = 0;

  const hotelList = document.getElementById('hotelList');
  if (hotelList) hotelList.innerHTML = '';
  const customCostList = document.getElementById('customCostList');
  if (customCostList) customCostList.innerHTML = '';
  const mealTbody = document.getElementById('manualMealTableBody') || document.getElementById('manualMealList');
  if (mealTbody) mealTbody.innerHTML = '';

  document.querySelectorAll('.field-error-msg.is-visible').forEach(m => m.classList.remove('is-visible'));
  document.querySelectorAll('.field-control.has-error').forEach(c => c.classList.remove('has-error'));
  document.querySelectorAll('.is-filled').forEach(el => el.classList.remove('is-filled'));
  const selBox = document.getElementById('selectedBox');
  if (selBox) selBox.classList.remove('has-error');
  if (typeof hideValidationToast === 'function') hideValidationToast();

  if (typeof hitungLama === 'function') hitungLama();
  if (typeof renderEmployeeList === 'function') renderEmployeeList();
  if (typeof renderSelectedTags === 'function') renderSelectedTags();
  if (typeof renderTripDates === 'function') renderTripDates();
  if (typeof updateSbmWarnings === 'function') updateSbmWarnings();
  if (typeof changeProvince === 'function') changeProvince();
  if (typeof toggleUHFields === 'function') toggleUHFields();
  if (typeof toggleHotelFields === 'function') toggleHotelFields();
  if (typeof renderTripHistory === 'function') renderTripHistory();

  if (typeof showTab === 'function') showTab('input');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!isSilent && typeof showRefreshToast === 'function') {
    showRefreshToast(
      'Formulir Dikosongkan',
      'Data sebelumnya tersimpan di tab Riwayat. Formulir kini siap untuk input perjalanan baru.'
    );
  }
}

function confirmResetPerjadinDraft() {
  const dirty = typeof isPerjadinDraftDirty === 'function' ? isPerjadinDraftDirty() : false;
  const msg = dirty
    ? 'Apakah Anda yakin ingin mengosongkan formulir?\n\nSemua isian formulir saat ini akan dikosongkan untuk memulai perjalanan baru. Data yang pernah disimpan tetap aman di tab Riwayat.'
    : 'Kosongkan formulir dan mulai perjalanan baru?';

  if (!confirm(msg)) return;

  resetPerjadinForm(false);
}

function initAutoSaveAndProtection() {
  window.addEventListener('beforeunload', (e) => {
    if (window._isResetting) return;
    if (isPerjadinDraftDirty()) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target && (e.target.id === 'searchEmp' || e.target.classList.contains('no-autosave'))) return;
    scheduleAutoSaveDraft();
  }, true);

  document.addEventListener('change', () => {
    scheduleAutoSaveDraft();
  }, true);

  try {
    const raw = localStorage.getItem(PERJADIN_DRAFT_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.fields) {
        const restored = restorePerjadinDraftData(data);
        if (restored) {
          updateAutosaveIndicator('saved');
          setTimeout(() => {
            if (typeof showRefreshToast === 'function') {
              showRefreshToast(
                'Draft Berhasil Dipulihkan',
                'Data formulir perjalanan dinas terakhir Anda dimuat kembali secara otomatis.'
              );
            }
          }, 300);
          return;
        }
      }
    }
  } catch (err) {
    console.warn('Gagal memulihkan draft otomatis:', err);
  }

  updateAutosaveIndicator('clean');
}

window.isPerjadinDraftDirty = isPerjadinDraftDirty;
window.collectPerjadinDraftData = collectPerjadinDraftData;
window.restorePerjadinDraftData = restorePerjadinDraftData;
window.scheduleAutoSaveDraft = scheduleAutoSaveDraft;
window.confirmResetPerjadinDraft = confirmResetPerjadinDraft;
window.updateAutosaveIndicator = updateAutosaveIndicator;
window.initAutoSaveAndProtection = initAutoSaveAndProtection;

// =====================================================================
// RIWAYAT PERJALANAN (TRIP HISTORY & REVISION ARCHIVE)
// =====================================================================
const TRIP_HISTORY_KEY = 'perdinku_trip_history_v1';

function getTripHistoryList() {
  try {
    const raw = localStorage.getItem(TRIP_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Gagal membaca riwayat perjalanan:', e);
    return [];
  }
}

function saveTripHistoryList(list) {
  try {
    localStorage.setItem(TRIP_HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Gagal menyimpan riwayat perjalanan:', e);
  }
}

function saveCurrentTripToHistory(isManual = false) {
  const draft = (typeof collectPerjadinDraftData === 'function') ? collectPerjadinDraftData() : null;
  if (!draft || !draft.fields) {
    if (isManual) alert('Formulir masih kosong.');
    return null;
  }

  const noST = (draft.fields.noST || draft.fields.noSTNum || '').trim();
  const agenda = (draft.fields.agenda || '').trim();
  const prov = (draft.fields.provinsiTujuan || '').trim();
  const empIds = draft.empIds || [];

  if (!noST && !agenda && empIds.length === 0) {
    if (isManual) alert('Formulir masih kosong. Silakan isi data perjalanan dinas terlebih dahulu.');
    return null;
  }

  let totalBiaya = 0;
  try {
    const emps = (typeof employees !== 'undefined' && Array.isArray(employees))
      ? empIds.map(id => employees.find(e => e.id === id)).filter(Boolean)
      : [];
    if (typeof hitungBiaya === 'function') {
      totalBiaya = emps.reduce((tot, emp) => tot + (hitungBiaya(emp)?.total || 0), 0);
    }
  } catch (e) {
    console.warn('Gagal menghitung total estimasi biaya:', e);
  }

  const empList = empIds.map(id => {
    const emp = (typeof employees !== 'undefined') ? employees.find(e => e.id === id) : null;
    return emp ? { id: emp.id, nama: emp.nama, jabatan: emp.jabatan, nip: emp.nip } : { id };
  });

  const tripId = 'trip_' + (noST ? noST.replace(/[^a-zA-Z0-9]/g, '_') : Date.now());
  let provTeks = '';
  if (draft.fields.cbMultiProvinsi) {
    const p1 = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(draft.fields.provinsiTujuan1) : draft.fields.provinsiTujuan1;
    const p2 = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(draft.fields.provinsiTujuan2) : draft.fields.provinsiTujuan2;
    provTeks = [p1, p2].filter(Boolean).join(' & ');
  } else {
    provTeks = (typeof getProvinsiDisplayName === 'function') ? getProvinsiDisplayName(prov) : prov;
  }

  const historyItem = {
    id: tripId,
    noST: noST || 'Tanpa Nomor ST',
    agenda: agenda || 'Tanpa Agenda Perjalanan',
    tglST: draft.fields.tglST || '',
    tglBerangkat: draft.fields.tglBerangkat || '',
    tglKembali: draft.fields.tglKembali || '',
    lamaTugas: draft.fields.lamaTugas || '',
    provinsiTujuan: provTeks || '',
    kotaTujuan: draft.fields.kotaTujuan || '',
    mak: draft.fields.mak || '',
    empCount: empIds.length,
    employees: empList,
    totalBiaya: totalBiaya,
    savedAt: new Date().toISOString(),
    draft: draft
  };

  const list = getTripHistoryList();
  const existingIdx = list.findIndex(item => item.id === historyItem.id || (noST && item.noST === noST));
  if (existingIdx >= 0) {
    list[existingIdx] = historyItem;
  } else {
    list.unshift(historyItem);
  }

  saveTripHistoryList(list);

  if (typeof renderTripHistory === 'function') {
    renderTripHistory();
  }

  if (isManual && typeof showRefreshToast === 'function') {
    showRefreshToast(
      'Perjalanan Tersimpan ke Riwayat',
      `Data perjalanan "${historyItem.noST}" berhasil dicatat ke riwayat.`
    );
  }

  return historyItem;
}

function loadTripFromHistory(id) {
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) {
    alert('Data riwayat perjalanan tidak ditemukan.');
    return;
  }

  if (typeof restorePerjadinDraftData === 'function') {
    restorePerjadinDraftData(item.draft);
  }

  try {
    localStorage.setItem(PERJADIN_DRAFT_KEY, JSON.stringify(item.draft));
  } catch (e) {}

  showTab('input');

  setTimeout(() => {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Perjalanan Dimuat untuk Revisi',
        `Data "${item.noST}" berhasil dimuat ke formulir. Silakan edit isian atau cetak dokumen yang diperlukan.`
      );
    }
  }, 250);
}

function duplicateTripFromHistory(id) {
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) return;

  const clonedDraft = JSON.parse(JSON.stringify(item.draft));
  clonedDraft.fields.noST = '';
  clonedDraft.fields.noSTNum = '';

  if (typeof restorePerjadinDraftData === 'function') {
    restorePerjadinDraftData(clonedDraft);
  }

  showTab('input');

  setTimeout(() => {
    if (typeof showRefreshToast === 'function') {
      showRefreshToast(
        'Perjalanan Berhasil Diduplikasi',
        `Isian pegawai dan rute telah dimuat. Silakan masukkan Nomor Surat Tugas baru untuk perjalanan ini.`
      );
    }
  }, 250);
}

function deleteTripFromHistory(id) {
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item) return;

  if (!confirm(`Hapus perjalanan "${item.noST}" dari riwayat?`)) return;

  const updated = list.filter(x => x.id !== id);
  saveTripHistoryList(updated);
  renderTripHistory();

  if (typeof showRefreshToast === 'function') {
    showRefreshToast('Riwayat Dihapus', `Perjalanan "${item.noST}" telah dihapus dari riwayat.`);
  }
}

function exportExcelFromHistory(id, mode = 'excel') {
  const list = getTripHistoryList();
  const item = list.find(x => x.id === id);
  if (!item || !item.draft) return;

  if (typeof restorePerjadinDraftData === 'function') {
    restorePerjadinDraftData(item.draft);
  }
  if (typeof exportPerjadinExcel === 'function') {
    exportPerjadinExcel(mode);
  }
}

function formatHistoryDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const pad = n => String(n).padStart(2, '0');
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
  } catch (e) {
    return isoStr;
  }
}

function renderTripHistory(filterText = '') {
  const container = document.getElementById('historyListContainer');
  const countBadge = document.getElementById('historyCountBadge');
  if (!container) return;

  const list = getTripHistoryList();
  const q = String(filterText || document.getElementById('historySearchInput')?.value || '').trim().toLowerCase();

  const filtered = list.filter(item => {
    if (!q) return true;
    const provDisplay = (typeof getProvinsiDisplayName === 'function')
      ? getProvinsiDisplayName(item.provinsiTujuan)
      : (item.provinsiTujuan || '');
    const searchTarget = [
      item.noST,
      item.agenda,
      provDisplay,
      item.kotaTujuan,
      item.mak,
      ...(item.employees || []).map(e => e.nama || '')
    ].join(' ').toLowerCase();
    return searchTarget.includes(q);
  });

  if (countBadge) {
    countBadge.textContent = `${list.length} Riwayat Tersimpan`;
  }

  const searchWrap = document.querySelector('.history-search-wrap');
  if (searchWrap) {
    searchWrap.classList.toggle('has-val', !!q);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="history-empty-card">
        <div class="history-empty-icon">
          <svg class="ico"><use href="#i-history"></use></svg>
        </div>
        <h3>Belum Ada Riwayat Perjalanan</h3>
        <p>Setiap kali Anda mengklik <strong>Simpan Data</strong> (unduh Excel) atau tombol <strong>Simpan ke Riwayat</strong>, arsip perjalanan dinas akan otomatis tersimpan di sini agar dapat Anda buka dan revisi kembali kapan saja.</p>
        <button type="button" class="btn btn-primary" onclick="showTab('input')">
          <svg class="ico"><use href="#i-edit"></use></svg>
          <span>Buka Formulir Input Perjalanan</span>
        </button>
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    const safeQ = (typeof escapeHtml === 'function') ? escapeHtml(q) : q;
    container.innerHTML = `
      <div class="history-empty-card">
        <div class="history-empty-icon">
          <svg class="ico"><use href="#i-search"></use></svg>
        </div>
        <h3>Tidak Ditemukan Hasil</h3>
        <p>Tidak ada riwayat yang cocok dengan kata kunci <em>"${safeQ}"</em>.</p>
        <button type="button" class="btn btn-secondary" onclick="clearHistorySearch()">
          <span>Bersihkan Pencarian</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const costFormatted = item.totalBiaya > 0
      ? ((typeof rp === 'function') ? rp(item.totalBiaya) : 'Rp ' + Number(item.totalBiaya).toLocaleString('id-ID'))
      : 'Rp 0';

    const tglTeks = (item.tglBerangkat && item.tglKembali)
      ? `${(typeof formatTgl === 'function' ? formatTgl(item.tglBerangkat) : item.tglBerangkat)} s.d. ${(typeof formatTgl === 'function' ? formatTgl(item.tglKembali) : item.tglKembali)}`
      : item.tglBerangkat || 'Tanggal belum diisi';

    const durationTeks = item.lamaTugas ? ` (${item.lamaTugas})` : '';
    const provDisplay = (typeof getProvinsiDisplayName === 'function')
      ? getProvinsiDisplayName(item.provinsiTujuan)
      : (item.provinsiTujuan || '');
    const kota = (item.kotaTujuan || '').trim();
    let destinationTeks = 'Belum ditentukan';
    if (kota && provDisplay) {
      if (kota.toLowerCase().includes(provDisplay.toLowerCase())) {
        destinationTeks = kota;
      } else {
        destinationTeks = `${kota}, ${provDisplay}`;
      }
    } else if (kota) {
      destinationTeks = kota;
    } else if (provDisplay) {
      destinationTeks = provDisplay;
    }
    const emps = item.employees || [];

    const safeNoST = (typeof escapeHtml === 'function') ? escapeHtml(item.noST) : item.noST;
    const safeMak = (typeof escapeHtml === 'function') ? escapeHtml(item.mak) : item.mak;
    const safeAgenda = (typeof escapeHtml === 'function') ? escapeHtml(item.agenda) : item.agenda;
    const safeDest = (typeof escapeHtml === 'function') ? escapeHtml(destinationTeks) : destinationTeks;
    const safeTgl = (typeof escapeHtml === 'function') ? escapeHtml(tglTeks) : tglTeks;
    const safeDuration = (typeof escapeHtml === 'function') ? escapeHtml(durationTeks) : durationTeks;

    const empPillsHtml = emps.slice(0, 5).map(e => {
      const shortName = (e.nama || '').split(',')[0];
      const safeName = (typeof escapeHtml === 'function') ? escapeHtml(shortName) : shortName;
      return `<span class="emp-pill">${safeName}</span>`;
    }).join('');

    const morePillHtml = emps.length > 5 ? `<span class="emp-pill more">+${emps.length - 5} lainnya</span>` : '';

    return `
      <div class="history-card" data-trip-id="${item.id}">
        <div class="history-card-top">
          <div class="history-card-st">
            <span class="history-st-badge">${safeNoST}</span>
            ${safeMak ? `<span class="history-mak-pill" title="Mata Anggaran Kegiatan (MAK)">${safeMak}</span>` : ''}
          </div>
          <div class="history-card-date">
            <svg class="ico"><use href="#i-calendar"></use></svg>
            <span>Disimpan: ${formatHistoryDate(item.savedAt)}</span>
          </div>
        </div>

        <div class="history-card-body">
          <h3 class="history-card-agenda">${safeAgenda}</h3>
          
          <div class="history-meta-grid">
            <div class="history-meta-item">
              <span class="meta-label">Tujuan</span>
              <span class="meta-val">${safeDest}</span>
            </div>
            <div class="history-meta-item">
              <span class="meta-label">Jadwal Pelaksanaan</span>
              <span class="meta-val">${safeTgl}${safeDuration}</span>
            </div>
            <div class="history-meta-item">
              <span class="meta-label">Pelaksana</span>
              <span class="meta-val">${item.empCount} Pegawai</span>
            </div>
            <div class="history-meta-item history-meta-cost">
              <span class="meta-label">Total Estimasi Biaya</span>
              <span class="meta-val cost-text">${costFormatted}</span>
            </div>
          </div>

          ${emps.length > 0 ? `
            <div class="history-emp-pills">
              ${empPillsHtml}
              ${morePillHtml}
            </div>
          ` : ''}
        </div>

        <div class="history-card-actions">
          <button type="button" class="btn btn-primary btn-sm" onclick="loadTripFromHistory('${item.id}')" title="Muat seluruh data perjalanan ini ke formulir untuk diedit/direvisi">
            <svg class="ico"><use href="#i-edit"></use></svg>
            <span>Buka & Edit / Revisi</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'excel')" title="Unduh file Excel perjalanan ini">
            <svg class="ico"><use href="#i-save"></use></svg>
            <span>Unduh Excel</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="exportExcelFromHistory('${item.id}', 'zip')" title="Unduh paket ZIP lengkap (Excel + Semua PDF)">
            <svg class="ico"><use href="#i-package"></use></svg>
            <span>Unduh ZIP</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="duplicateTripFromHistory('${item.id}')" title="Salin data perjalanan ini untuk membuat perjalanan baru">
            <svg class="ico"><use href="#i-plus"></use></svg>
            <span>Duplikat</span>
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="deleteTripFromHistory('${item.id}')" title="Hapus perjalanan ini dari riwayat">
            <svg class="ico"><use href="#i-trash"></use></svg>
            <span>Hapus</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterTripHistory() {
  const input = document.getElementById('historySearchInput');
  renderTripHistory(input?.value || '');
}

function clearHistorySearch() {
  const input = document.getElementById('historySearchInput');
  if (input) input.value = '';
  renderTripHistory('');
}

function toggleSaveMenu(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const group = document.getElementById('saveSplitGroup');
  const menu = document.getElementById('saveSplitMenu');
  const btnArrow = document.querySelector('.btn-split-arrow');
  if (!menu) return;
  const isHidden = menu.style.display === 'none' || !menu.style.display;
  if (isHidden) {
    menu.style.display = 'block';
    if (group) group.classList.add('open');
    if (btnArrow) btnArrow.setAttribute('aria-expanded', 'true');
  } else {
    menu.style.display = 'none';
    if (group) group.classList.remove('open');
    if (btnArrow) btnArrow.setAttribute('aria-expanded', 'false');
  }
}

function closeSaveMenu() {
  const group = document.getElementById('saveSplitGroup');
  const menu = document.getElementById('saveSplitMenu');
  const btnArrow = document.querySelector('.btn-split-arrow');
  if (menu) menu.style.display = 'none';
  if (group) group.classList.remove('open');
  if (btnArrow) btnArrow.setAttribute('aria-expanded', 'false');
}

function selectSaveMode(mode) {
  closeSaveMenu();
  if (typeof exportPerjadinExcel === 'function') {
    exportPerjadinExcel(mode);
  }
}

document.addEventListener('click', function (e) {
  const group = document.getElementById('saveSplitGroup');
  if (group && !group.contains(e.target)) {
    closeSaveMenu();
  }
});

window.toggleSaveMenu = toggleSaveMenu;
window.closeSaveMenu = closeSaveMenu;
window.selectSaveMode = selectSaveMode;

window.saveTripToHistory = saveTripToHistory;
window.saveCurrentTripToHistory = saveCurrentTripToHistory;
window.getTripHistoryList = getTripHistoryList;
window.loadTripFromHistory = loadTripFromHistory;
window.duplicateTripFromHistory = duplicateTripFromHistory;
window.deleteTripFromHistory = deleteTripFromHistory;
window.exportExcelFromHistory = exportExcelFromHistory;
window.resetPerjadinForm = resetPerjadinForm;
window.renderTripHistory = renderTripHistory;
window.filterTripHistory = filterTripHistory;
window.clearHistorySearch = clearHistorySearch;

