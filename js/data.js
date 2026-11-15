// =====================================================================
// DATA & STATE (PerdinKu)
// Data pegawai, data master SBM, dan state aplikasi
// =====================================================================

// =====================================================================
// DATA PEGAWAI (dari sheet KARYAWAN)
// =====================================================================
const employees = [
  { id: 0, nama: 'Yenita Sari, S.H., M.H.', nip: '197905172002122002', pangkat: 'Pembina Tingkat 1', gol: 'IV/b', jabatan: 'Kepala Biro Komunikasi Publik' },
  { id: 1, nama: 'Arif Fajar Alfalaqy, S.Sos., M.Sc.', nip: '198305152008011009', pangkat: 'Pembina', gol: 'IV/a', jabatan: 'Kabag. Pengelolaan Dokumentasi dan Hubungan Media' },
  { id: 2, nama: 'Rendhi Mirad, S.Sos., M.S.E.', nip: '198205212006041002', pangkat: 'Pembina', gol: 'IV/a', jabatan: 'Kabag. Pelayanan Publik dan Publikasi' },
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
  { id: 1, provinsi: 'NANGROE ACEH DARUSSALAM', ibukota: 'Banda Aceh', uh: 360000, diklat: 110000, fullboard: 130000, makan: 51000, snack: 21000, jktPP: 512000, taxi: 254000, dpr: 766000, h1: 4774000, h2: 3526000, h4: 1578000, h3: 770000, tiket: 4492000 }, 
  { id: 2, provinsi: 'SUMATERA UTARA', ibukota: 'Medan', uh: 370000, diklat: 110000, fullboard: 130000, makan: 47000, snack: 17000, jktPP: 512000, taxi: 616000, dpr: 1128000, h1: 4960000, h2: 2195000, h4: 1188000, h3: 699000, tiket: 3808000 }, 
  { id: 3, provinsi: 'RIAU', ibukota: 'Pekanbaru', uh: 370000, diklat: 110000, fullboard: 130000, makan: 47000, snack: 21000, jktPP: 512000, taxi: 202000, dpr: 714000, h1: 3820000, h2: 3119000, h4: 1650000, h3: 852000, tiket: 3016000 }, 
  { id: 4, provinsi: 'KEPULAUAN RIAU', ibukota: 'Tanjung Pinang', uh: 370000, diklat: 110000, fullboard: 130000, makan: 47000, snack: 21000, jktPP: 512000, taxi: 330000, dpr: 842000, h1: 5772000, h2: 2318000, h4: 1297000, h3: 792000, tiket: 0 }, 
  { id: 5, provinsi: 'JAMBI', ibukota: 'Jambi', uh: 370000, diklat: 110000, fullboard: 130000, makan: 43000, snack: 19000, jktPP: 512000, taxi: 294000, dpr: 806000, h1: 5004000, h2: 4102000, h4: 1225000, h3: 580000, tiket: 2460000 }, 
  { id: 6, provinsi: 'SUMATERA BARAT', ibukota: 'Padang', uh: 380000, diklat: 110000, fullboard: 130000, makan: 45000, snack: 19000, jktPP: 512000, taxi: 380000, dpr: 892000, h1: 5236000, h2: 3332000, h4: 1353000, h3: 701000, tiket: 2952000 }, 
  { id: 7, provinsi: 'SUMATERA SELATAN', ibukota: 'Palembang', uh: 380000, diklat: 110000, fullboard: 130000, makan: 48000, snack: 22000, jktPP: 512000, taxi: 358000, dpr: 870000, h1: 6298000, h2: 3083000, h4: 1966000, h3: 861000, tiket: 2268000 }, 
  { id: 8, provinsi: 'LAMPUNG', ibukota: 'Bandar Lampung', uh: 380000, diklat: 110000, fullboard: 130000, makan: 45000, snack: 21000, jktPP: 512000, taxi: 336000, dpr: 848000, h1: 4491000, h2: 2488000, h4: 1539000, h3: 580000, tiket: 1583000 }, 
  { id: 9, provinsi: 'BENGKULU', ibukota: 'Bengkulu', uh: 380000, diklat: 110000, fullboard: 130000, makan: 44000, snack: 21000, jktPP: 512000, taxi: 218000, dpr: 730000, h1: 2140000, h2: 1628000, h4: 1546000, h3: 692000, tiket: 2621000 }, 
  { id: 10, provinsi: 'BANGKA BELITUNG', ibukota: 'Pangkal Pinang', uh: 410000, diklat: 120000, fullboard: 130000, makan: 47000, snack: 21000, jktPP: 512000, taxi: 194000, dpr: 706000, h1: 4134000, h2: 2838000, h4: 1957000, h3: 676000, tiket: 2139000 }, 
  { id: 11, provinsi: 'BANTEN', ibukota: 'Serang', uh: 370000, diklat: 110000, fullboard: 130000, makan: 54000, snack: 21000, jktPP: 0, taxi: 536000, dpr: 536000, h1: 5725000, h2: 2373000, h4: 1301000, h3: 724000, tiket: 0 }, 
  { id: 12, provinsi: 'JAWA BARAT', ibukota: 'Bandung', uh: 430000, diklat: 130000, fullboard: 130000, makan: 54000, snack: 22000, jktPP: 512000, taxi: 400000, dpr: 912000, h1: 5812000, h2: 2755000, h4: 1298000, h3: 686000, tiket: 0 }, 
  { id: 13, provinsi: 'DKI JAKARTA', ibukota: 'Jakarta', uh: 530000, diklat: 160000, fullboard: 130000, makan: 53000, snack: 24000, jktPP: 0, taxi: 512000, dpr: 512000, h1: 8720000, h2: 2063000, h4: 992000, h3: 730000, tiket: 0 }, 
  { id: 14, provinsi: 'JAWA TENGAH', ibukota: 'Semarang', uh: 370000, diklat: 110000, fullboard: 130000, makan: 57000, snack: 17000, jktPP: 512000, taxi: 216000, dpr: 728000, h1: 5728000, h2: 1998000, h4: 1201000, h3: 810000, tiket: 2182000 }, 
  { id: 15, provinsi: 'D.I. YOGYAKARTA', ibukota: 'Yogyakarta', uh: 420000, diklat: 130000, fullboard: 130000, makan: 44000, snack: 20000, jktPP: 512000, taxi: 534000, dpr: 1046000, h1: 5017000, h2: 2695000, h4: 1495000, h3: 845000, tiket: 2268000 }, 
  { id: 16, provinsi: 'JAWA TIMUR', ibukota: 'Surabaya', uh: 410000, diklat: 120000, fullboard: 130000, makan: 49000, snack: 23000, jktPP: 512000, taxi: 466000, dpr: 978000, h1: 4449000, h2: 2007000, h4: 1153000, h3: 814000, tiket: 2674000 }, 
  { id: 17, provinsi: 'BALI', ibukota: 'Denpasar', uh: 480000, diklat: 140000, fullboard: 130000, makan: 52000, snack: 22000, jktPP: 512000, taxi: 454000, dpr: 966000, h1: 6848000, h2: 2433000, h4: 1685000, h3: 1138000, tiket: 3262000 }, 
  { id: 18, provinsi: 'NUSA TENGGARA BARAT', ibukota: 'Mataram', uh: 440000, diklat: 130000, fullboard: 130000, makan: 46000, snack: 21000, jktPP: 512000, taxi: 462000, dpr: 974000, h1: 4375000, h2: 2648000, h4: 1418000, h3: 907000, tiket: 3230000 }, 
  { id: 19, provinsi: 'NUSA TENGGARA TIMUR', ibukota: 'Kupang', uh: 430000, diklat: 130000, fullboard: 130000, makan: 47000, snack: 23000, jktPP: 512000, taxi: 232000, dpr: 744000, h1: 3750000, h2: 2133000, h4: 1355000, h3: 688000, tiket: 5081000 }, 
  { id: 20, provinsi: 'KALIMANTAN BARAT', ibukota: 'Pontianak', uh: 380000, diklat: 110000, fullboard: 130000, makan: 51000, snack: 17000, jktPP: 512000, taxi: 342000, dpr: 854000, h1: 2654000, h2: 1923000, h4: 1125000, h3: 538000, tiket: 2781000 }, 
  { id: 21, provinsi: 'KALIMANTAN TENGAH', ibukota: 'Palangkaraya', uh: 360000, diklat: 110000, fullboard: 130000, makan: 42000, snack: 16000, jktPP: 512000, taxi: 268000, dpr: 780000, h1: 4901000, h2: 3391000, h4: 1160000, h3: 659000, tiket: 2984000 }, 
  { id: 22, provinsi: 'KALIMANTAN SELATAN', ibukota: 'Banjarmasin', uh: 380000, diklat: 110000, fullboard: 130000, makan: 46000, snack: 22000, jktPP: 512000, taxi: 360000, dpr: 872000, h1: 4797000, h2: 3316000, h4: 1500000, h3: 697000, tiket: 2995000 }, 
  { id: 23, provinsi: 'KALIMANTAN TIMUR', ibukota: 'Samarinda', uh: 430000, diklat: 130000, fullboard: 130000, makan: 51000, snack: 24000, jktPP: 512000, taxi: 1066000, dpr: 1578000, h1: 4000000, h2: 2188000, h4: 1507000, h3: 804000, tiket: 3797000 }, 
  { id: 24, provinsi: 'KALIMANTAN UTARA', ibukota: 'Tanjung Selor', uh: 430000, diklat: 130000, fullboard: 130000, makan: 51000, snack: 24000, jktPP: 512000, taxi: 436000, dpr: 948000, h1: 4000000, h2: 2735000, h4: 1507000, h3: 904000, tiket: 4057000 }, 
  { id: 25, provinsi: 'SULAWESI UTARA', ibukota: 'Manado', uh: 370000, diklat: 110000, fullboard: 130000, makan: 48000, snack: 23000, jktPP: 512000, taxi: 276000, dpr: 788000, h1: 4919000, h2: 2290000, h4: 1270000, h3: 978000, tiket: 5102000 }, 
  { id: 26, provinsi: 'GORONTALO', ibukota: 'Gorontalo', uh: 370000, diklat: 110000, fullboard: 130000, makan: 45000, snack: 22000, jktPP: 512000, taxi: 530000, dpr: 1042000, h1: 4168000, h2: 3107000, h4: 1606000, h3: 955000, tiket: 4824000 }, 
  { id: 27, provinsi: 'SULAWESI BARAT', ibukota: 'Mamuju', uh: 410000, diklat: 120000, fullboard: 130000, makan: 45000, snack: 22000, jktPP: 512000, taxi: 626000, dpr: 1138000, h1: 4076000, h2: 3098000, h4: 1344000, h3: 704000, tiket: 4867000 }, 
  { id: 28, provinsi: 'SULAWESI SELATAN', ibukota: 'Makassar', uh: 430000, diklat: 130000, fullboard: 130000, makan: 47000, snack: 23000, jktPP: 512000, taxi: 374000, dpr: 886000, h1: 4820000, h2: 1938000, h4: 1423000, h3: 745000, tiket: 3829000 }, 
  { id: 29, provinsi: 'SULAWESI TENGAH', ibukota: 'Palu', uh: 370000, diklat: 110000, fullboard: 130000, makan: 45000, snack: 22000, jktPP: 512000, taxi: 330000, dpr: 842000, h1: 2309000, h2: 2027000, h4: 1679000, h3: 951000, tiket: 5113000 }, 
  { id: 30, provinsi: 'SULAWESI TENGGARA', ibukota: 'Kendari', uh: 380000, diklat: 110000, fullboard: 130000, makan: 45000, snack: 22000, jktPP: 512000, taxi: 342000, dpr: 854000, h1: 3088800, h2: 2574000, h4: 1297000, h3: 786000, tiket: 4182000 }, 
  { id: 31, provinsi: 'MALUKU', ibukota: 'Ambon', uh: 380000, diklat: 110000, fullboard: 130000, makan: 50000, snack: 24000, jktPP: 512000, taxi: 576000, dpr: 1088000, h1: 3467000, h2: 3240000, h4: 1059000, h3: 667000, tiket: 7081000 }, 
  { id: 32, provinsi: 'MALUKU UTARA', ibukota: 'Sofifi', uh: 430000, diklat: 130000, fullboard: 130000, makan: 48000, snack: 24000, jktPP: 512000, taxi: 430000, dpr: 942000, h1: 4612000, h2: 3843000, h4: 1160000, h3: 654000, tiket: 0 }, 
  { id: 33, provinsi: 'PAPUA', ibukota: 'Jayapura', uh: 580000, diklat: 170000, fullboard: 130000, makan: 65000, snack: 30000, jktPP: 512000, taxi: 1026000, dpr: 1538000, h1: 3872000, h2: 3318000, h4: 2521000, h3: 1038000, tiket: 8193000 }, 
  { id: 34, provinsi: 'PAPUA BARAT', ibukota: 'Manokwari', uh: 480000, diklat: 140000, fullboard: 130000, makan: 58000, snack: 28000, jktPP: 512000, taxi: 472000, dpr: 984000, h1: 3872000, h2: 3341000, h4: 2056000, h3: 967000, tiket: 10824000 }, 
  { id: 35, provinsi: 'PAPUA BARAT DAYA', ibukota: '-', uh: 480000, diklat: 140000, fullboard: 130000, makan: 58000, snack: 28000, jktPP: 0, taxi: 0, dpr: 0, h1: 3872000, h2: 3341000, h4: 2056000, h3: 967000, tiket: 0 }, 
  { id: 36, provinsi: 'PAPUA TENGAH', ibukota: '-', uh: 580000, diklat: 170000, fullboard: 130000, makan: 75000, snack: 35000, jktPP: 0, taxi: 0, dpr: 0, h1: 3859000, h2: 3318000, h4: 2521000, h3: 1038000, tiket: 0 }, 
  { id: 37, provinsi: 'PAPUA SELATAN', ibukota: '-', uh: 580000, diklat: 170000, fullboard: 130000, makan: 75000, snack: 35000, jktPP: 0, taxi: 0, dpr: 0, h1: 5673000, h2: 4877000, h4: 3706000, h3: 1526000, tiket: 0 }, 
  { id: 38, provinsi: 'PAPUA PEGUNUNGAN', ibukota: '-', uh: 580000, diklat: 170000, fullboard: 130000, makan: 85000, snack: 40000, jktPP: 0, taxi: 0, dpr: 0, h1: 5711000, h2: 4911000, h4: 3731000, h3: 1536000, tiket: 0 }, 
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

