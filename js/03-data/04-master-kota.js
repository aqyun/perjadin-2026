// =====================================================================
// MASTER DAFTAR KOTA / KABUPATEN INDONESIA & MAPPING PROVINSI SBM 2026
// Aturan pembayaran SBM tetap 100% mengikuti PMK Nomor 32 Tahun 2025
// =====================================================================
const daftarKotaSbm = [
  // DKI JAKARTA (id: 13)
  { id: 'jkt_pusat', nama: 'Jakarta Pusat', provId: 13, provName: 'DKI JAKARTA', tipe: 'Kota' },
  { id: 'jkt_selatan', nama: 'Jakarta Selatan', provId: 13, provName: 'DKI JAKARTA', tipe: 'Kota' },
  { id: 'jkt_timur', nama: 'Jakarta Timur', provId: 13, provName: 'DKI JAKARTA', tipe: 'Kota' },
  { id: 'jkt_barat', nama: 'Jakarta Barat', provId: 13, provName: 'DKI JAKARTA', tipe: 'Kota' },
  { id: 'jkt_utara', nama: 'Jakarta Utara', provId: 13, provName: 'DKI JAKARTA', tipe: 'Kota' },
  { id: 'kep_seribu', nama: 'Kepulauan Seribu', provId: 13, provName: 'DKI JAKARTA', tipe: 'Kabupaten', isKhusus: true, transportPP: 772000, oneWay: 386000, uhKhusus: 210000, catatan: 'Transport kapal laut PP Rp 772.000 (one way Rp 386.000) & UH Rp 210.000 (PMK Hal 15 & 68)' },

  // JAWA BARAT (id: 12)
  { id: 'bdg_kota', nama: 'Kota Bandung', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota', isIbukota: true },
  { id: 'bgr_kota', nama: 'Kota Bogor', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota', isBodetabek: true, transportPP: 540000, oneWay: 270000, catatan: 'Wilayah Bodetabek PMK Hal 68: Transport Darat PP Rp 540.000 (one way Rp 270.000)' },
  { id: 'bgr_kab', nama: 'Kab. Bogor', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten', isBodetabek: true, transportPP: 540000, oneWay: 270000, catatan: 'Wilayah Bodetabek PMK Hal 68: Transport Darat PP Rp 540.000 (one way Rp 270.000)' },
  { id: 'bks_kota', nama: 'Kota Bekasi', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota', isBodetabek: true, transportPP: 512000, oneWay: 256000, catatan: 'Wilayah Bodetabek PMK Hal 68: Transport Darat PP Rp 512.000 (one way Rp 256.000)' },
  { id: 'bks_kab', nama: 'Kab. Bekasi', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten', isBodetabek: true, transportPP: 512000, oneWay: 256000, catatan: 'Wilayah Bodetabek PMK Hal 68: Transport Darat PP Rp 512.000 (one way Rp 256.000)' },
  { id: 'dpk_kota', nama: 'Kota Depok', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota', isBodetabek: true, transportPP: 496000, oneWay: 248000, catatan: 'Wilayah Bodetabek PMK Hal 68: Transport Darat PP Rp 496.000 (one way Rp 248.000)' },
  { id: 'crb_kota', nama: 'Kota Cirebon', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota' },
  { id: 'crb_kab', nama: 'Kab. Cirebon', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'skb_kota', nama: 'Kota Sukabumi', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota' },
  { id: 'skb_kab', nama: 'Kab. Sukabumi', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'tsm_kota', nama: 'Kota Tasikmalaya', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota' },
  { id: 'cmh_kota', nama: 'Kota Cimahi', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota' },
  { id: 'bjr_kota', nama: 'Kota Banjar', provId: 12, provName: 'JAWA BARAT', tipe: 'Kota' },
  { id: 'bdg_kab', nama: 'Kab. Bandung', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'kbb_kab', nama: 'Kab. Bandung Barat', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'sbg_kab', nama: 'Kab. Subang', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'krw_kab', nama: 'Kab. Karawang', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'pwk_kab', nama: 'Kab. Purwakarta', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'cjr_kab', nama: 'Kab. Cianjur', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'grt_kab', nama: 'Kab. Garut', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'smd_kab', nama: 'Kab. Sumedang', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'idr_kab', nama: 'Kab. Indramayu', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'mjl_kab', nama: 'Kab. Majalengka', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'kng_kab', nama: 'Kab. Kuningan', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'cms_kab', nama: 'Kab. Ciamis', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },
  { id: 'pgd_kab', nama: 'Kab. Pangandaran', provId: 12, provName: 'JAWA BARAT', tipe: 'Kabupaten' },

  // BANTEN (id: 11)
  { id: 'srg_kota', nama: 'Kota Serang', provId: 11, provName: 'BANTEN', tipe: 'Kota', isIbukota: true },
  { id: 'tgr_kota', nama: 'Kota Tangerang', provId: 11, provName: 'BANTEN', tipe: 'Kota', isBodetabek: true, transportPP: 516000, oneWay: 258000, catatan: 'Wilayah Bodetabek PMK Hal 68: Transport Darat PP Rp 516.000 (one way Rp 258.000)' },
  { id: 'tgs_kota', nama: 'Kota Tangerang Selatan (Tangsel)', provId: 11, provName: 'BANTEN', tipe: 'Kota', isBodetabek: true, transportPP: 516000, oneWay: 258000, catatan: 'Wilayah Bodetabek PMK Hal 68: Transport Darat PP Rp 516.000 (one way Rp 258.000)' },
  { id: 'tgr_kab', nama: 'Kab. Tangerang', provId: 11, provName: 'BANTEN', tipe: 'Kabupaten', isBodetabek: true, transportPP: 558000, oneWay: 279000, catatan: 'Wilayah Bodetabek PMK Hal 68: Transport Darat PP Rp 558.000 (one way Rp 279.000)' },
  { id: 'clg_kota', nama: 'Kota Cilegon', provId: 11, provName: 'BANTEN', tipe: 'Kota' },
  { id: 'srg_kab', nama: 'Kab. Serang', provId: 11, provName: 'BANTEN', tipe: 'Kabupaten' },
  { id: 'pdg_kab', nama: 'Kab. Pandeglang', provId: 11, provName: 'BANTEN', tipe: 'Kabupaten' },
  { id: 'lbk_kab', nama: 'Kab. Lebak (Rangkasbitung)', provId: 11, provName: 'BANTEN', tipe: 'Kabupaten' },

  // JAWA TENGAH (id: 14)
  { id: 'smg_kota', nama: 'Kota Semarang', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kota', isIbukota: true },
  { id: 'slo_kota', nama: 'Kota Surakarta (Solo)', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kota' },
  { id: 'mgl_kota', nama: 'Kota Magelang', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kota' },
  { id: 'slt_kota', nama: 'Kota Salatiga', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kota' },
  { id: 'pkl_kota', nama: 'Kota Pekalongan', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kota' },
  { id: 'tgl_kota', nama: 'Kota Tegal', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kota' },
  { id: 'pwt_kab', nama: 'Purwokerto (Kab. Banyumas)', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kota/Kabupaten' },
  { id: 'clp_kab', nama: 'Kab. Cilacap', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'kds_kab', nama: 'Kab. Kudus', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'klt_kab', nama: 'Kab. Klaten', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'byl_kab', nama: 'Kab. Boyolali', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'skh_kab', nama: 'Kab. Sukoharjo', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'wng_kab', nama: 'Kab. Wonogiri', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'kra_kab', nama: 'Kab. Karanganyar', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'srg_kab', nama: 'Kab. Sragen', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'jpr_kab', nama: 'Kab. Jepara', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'dmk_kab', nama: 'Kab. Demak', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'kdl_kab', nama: 'Kab. Kendal', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'btg_kab', nama: 'Kab. Batang', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'pml_kab', nama: 'Kab. Pemalang', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'bbs_kab', nama: 'Kab. Brebes', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'tmg_kab', nama: 'Kab. Temanggung', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'wns_kab', nama: 'Kab. Wonosobo (Dieng)', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'kbm_kab', nama: 'Kab. Kebumen', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },
  { id: 'pwr_kab', nama: 'Kab. Purworejo', provId: 14, provName: 'JAWA TENGAH', tipe: 'Kabupaten' },

  // D.I. YOGYAKARTA (id: 15)
  { id: 'jog_kota', nama: 'Kota Yogyakarta', provId: 15, provName: 'D.I. YOGYAKARTA', tipe: 'Kota', isIbukota: true },
  { id: 'slm_kab', nama: 'Kab. Sleman', provId: 15, provName: 'D.I. YOGYAKARTA', tipe: 'Kabupaten' },
  { id: 'btl_kab', nama: 'Kab. Bantul', provId: 15, provName: 'D.I. YOGYAKARTA', tipe: 'Kabupaten' },
  { id: 'klp_kab', nama: 'Kab. Kulon Progo (Wates / YIA)', provId: 15, provName: 'D.I. YOGYAKARTA', tipe: 'Kabupaten' },
  { id: 'gnk_kab', nama: 'Kab. Gunungkidul (Wonosari)', provId: 15, provName: 'D.I. YOGYAKARTA', tipe: 'Kabupaten' },

  // JAWA TIMUR (id: 16)
  { id: 'sby_kota', nama: 'Kota Surabaya', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota', isIbukota: true },
  { id: 'mlg_kota', nama: 'Kota Malang', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota' },
  { id: 'mlg_kab', nama: 'Kab. Malang', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'btu_kota', nama: 'Kota Batu', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota' },
  { id: 'kdr_kota', nama: 'Kota Kediri', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota' },
  { id: 'mdn_kota', nama: 'Kota Madiun', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota' },
  { id: 'blt_kota', nama: 'Kota Blitar', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota' },
  { id: 'pbl_kota', nama: 'Kota Probolinggo', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota' },
  { id: 'psr_kota', nama: 'Kota Pasuruan', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota' },
  { id: 'mjk_kota', nama: 'Kota Mojokerto', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kota' },
  { id: 'sda_kab', nama: 'Kab. Sidoarjo', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'grs_kab', nama: 'Kab. Gresik', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'bwi_kab', nama: 'Kab. Banyuwangi', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'jbr_kab', nama: 'Kab. Jember', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'bjn_kab', nama: 'Kab. Bojonegoro', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'lmg_kab', nama: 'Kab. Lamongan', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'tbn_kab', nama: 'Kab. Tuban', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'jmb_kab', nama: 'Kab. Jombang', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'bkl_kab', nama: 'Kab. Bangkalan (Madura)', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'pmk_kab', nama: 'Kab. Pamekasan (Madura)', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },
  { id: 'smn_kab', nama: 'Kab. Sumenep (Madura)', provId: 16, provName: 'JAWA TIMUR', tipe: 'Kabupaten' },

  // BALI (id: 17)
  { id: 'dps_kota', nama: 'Kota Denpasar', provId: 17, provName: 'BALI', tipe: 'Kota', isIbukota: true },
  { id: 'bdg_bali', nama: 'Kab. Badung (Kuta / Seminyak / Nusa Dua)', provId: 17, provName: 'BALI', tipe: 'Kabupaten' },
  { id: 'gny_kab', nama: 'Kab. Gianyar (Ubud)', provId: 17, provName: 'BALI', tipe: 'Kabupaten' },
  { id: 'tbn_bali', nama: 'Kab. Tabanan', provId: 17, provName: 'BALI', tipe: 'Kabupaten' },
  { id: 'bll_kab', nama: 'Kab. Buleleng (Singaraja)', provId: 17, provName: 'BALI', tipe: 'Kabupaten' },
  { id: 'krg_kab', nama: 'Kab. Karangasem', provId: 17, provName: 'BALI', tipe: 'Kabupaten' },
  { id: 'klk_kab', nama: 'Kab. Klungkung (Nusa Penida)', provId: 17, provName: 'BALI', tipe: 'Kabupaten' },

  // NUSA TENGGARA BARAT (id: 18)
  { id: 'mtr_kota', nama: 'Kota Mataram', provId: 18, provName: 'NUSA TENGGARA BARAT', tipe: 'Kota', isIbukota: true },
  { id: 'lbt_kab', nama: 'Kab. Lombok Barat (Senggigi)', provId: 18, provName: 'NUSA TENGGARA BARAT', tipe: 'Kabupaten' },
  { id: 'lbtg_kab', nama: 'Kab. Lombok Tengah (Mandalika)', provId: 18, provName: 'NUSA TENGGARA BARAT', tipe: 'Kabupaten' },
  { id: 'lbtm_kab', nama: 'Kab. Lombok Timur', provId: 18, provName: 'NUSA TENGGARA BARAT', tipe: 'Kabupaten' },
  { id: 'lbu_kab', nama: 'Kab. Lombok Utara (Gili Trawangan)', provId: 18, provName: 'NUSA TENGGARA BARAT', tipe: 'Kabupaten' },
  { id: 'sbw_kab', nama: 'Kab. Sumbawa', provId: 18, provName: 'NUSA TENGGARA BARAT', tipe: 'Kabupaten' },
  { id: 'bma_kota', nama: 'Kota Bima', provId: 18, provName: 'NUSA TENGGARA BARAT', tipe: 'Kota' },

  // NUSA TENGGARA TIMUR (id: 19)
  { id: 'kpg_kota', nama: 'Kota Kupang', provId: 19, provName: 'NUSA TENGGARA TIMUR', tipe: 'Kota', isIbukota: true },
  { id: 'lbj_kab', nama: 'Labuan Bajo (Kab. Manggarai Barat)', provId: 19, provName: 'NUSA TENGGARA TIMUR', tipe: 'Kota/Kabupaten' },
  { id: 'end_kab', nama: 'Kab. Ende', provId: 19, provName: 'NUSA TENGGARA TIMUR', tipe: 'Kabupaten' },
  { id: 'mmr_kab', nama: 'Maumere (Kab. Sikka)', provId: 19, provName: 'NUSA TENGGARA TIMUR', tipe: 'Kota/Kabupaten' },
  { id: 'wgp_kab', nama: 'Waingapu (Kab. Sumba Timur)', provId: 19, provName: 'NUSA TENGGARA TIMUR', tipe: 'Kota/Kabupaten' },
  { id: 'atb_kab', nama: 'Atambua (Kab. Belu)', provId: 19, provName: 'NUSA TENGGARA TIMUR', tipe: 'Kota/Kabupaten' },

  // SUMATERA UTARA (id: 2)
  { id: 'mdn_sumut', nama: 'Kota Medan', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kota', isIbukota: true },
  { id: 'bnj_kota', nama: 'Kota Binjai', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kota' },
  { id: 'pms_kota', nama: 'Kota Pematang Siantar', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kota' },
  { id: 'tbt_kota', nama: 'Kota Tebing Tinggi', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kota' },
  { id: 'sbg_sumut', nama: 'Kota Sibolga', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kota' },
  { id: 'psp_kota', nama: 'Kota Padang Sidempuan', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kota' },
  { id: 'dsr_kab', nama: 'Kab. Deli Serdang', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kabupaten' },
  { id: 'kro_kab', nama: 'Kab. Karo (Berastagi)', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kabupaten' },
  { id: 'tba_kab', nama: 'Danau Toba (Kab. Toba / Samosir)', provId: 2, provName: 'SUMATERA UTARA', tipe: 'Kabupaten' },

  // SUMATERA BARAT (id: 6)
  { id: 'pdg_kota', nama: 'Kota Padang', provId: 6, provName: 'SUMATERA BARAT', tipe: 'Kota', isIbukota: true },
  { id: 'bkt_kota', nama: 'Kota Bukittinggi', provId: 6, provName: 'SUMATERA BARAT', tipe: 'Kota' },
  { id: 'pyk_kota', nama: 'Kota Payakumbuh', provId: 6, provName: 'SUMATERA BARAT', tipe: 'Kota' },
  { id: 'prm_kota', nama: 'Kota Pariaman', provId: 6, provName: 'SUMATERA BARAT', tipe: 'Kota' },
  { id: 'slk_kota', nama: 'Kota Solok', provId: 6, provName: 'SUMATERA BARAT', tipe: 'Kota' },

  // RIAU & KEPRI (id: 3 & 4)
  { id: 'pbr_kota', nama: 'Kota Pekanbaru', provId: 3, provName: 'RIAU', tipe: 'Kota', isIbukota: true },
  { id: 'dmi_kota', nama: 'Kota Dumai', provId: 3, provName: 'RIAU', tipe: 'Kota' },
  { id: 'kmp_kab', nama: 'Kab. Kampar (Bangkinang)', provId: 3, provName: 'RIAU', tipe: 'Kabupaten' },
  { id: 'sik_kab', nama: 'Kab. Siak', provId: 3, provName: 'RIAU', tipe: 'Kabupaten' },
  { id: 'tjp_kota', nama: 'Kota Tanjung Pinang', provId: 4, provName: 'KEPULAUAN RIAU', tipe: 'Kota', isIbukota: true },
  { id: 'btm_kota', nama: 'Kota Batam', provId: 4, provName: 'KEPULAUAN RIAU', tipe: 'Kota' },
  { id: 'btn_kab', nama: 'Kab. Bintan (Lagoi)', provId: 4, provName: 'KEPULAUAN RIAU', tipe: 'Kabupaten' },
  { id: 'krm_kab', nama: 'Kab. Karimun', provId: 4, provName: 'KEPULAUAN RIAU', tipe: 'Kabupaten' },
  { id: 'ntn_kab', nama: 'Kab. Natuna (Ranai)', provId: 4, provName: 'KEPULAUAN RIAU', tipe: 'Kabupaten' },

  // SUMATERA SELATAN & LAMPUNG (id: 7 & 8)
  { id: 'plb_kota', nama: 'Kota Palembang', provId: 7, provName: 'SUMATERA SELATAN', tipe: 'Kota', isIbukota: true },
  { id: 'pbm_kota', nama: 'Kota Prabumulih', provId: 7, provName: 'SUMATERA SELATAN', tipe: 'Kota' },
  { id: 'pga_kota', nama: 'Kota Pagar Alam', provId: 7, provName: 'SUMATERA SELATAN', tipe: 'Kota' },
  { id: 'llg_kota', nama: 'Kota Lubuklinggau', provId: 7, provName: 'SUMATERA SELATAN', tipe: 'Kota' },
  { id: 'bdl_kota', nama: 'Kota Bandar Lampung', provId: 8, provName: 'LAMPUNG', tipe: 'Kota', isIbukota: true },
  { id: 'mtr_lpg', nama: 'Kota Metro', provId: 8, provName: 'LAMPUNG', tipe: 'Kota' },

  // KALIMANTAN TIMUR (id: 23)
  { id: 'smd_kaltim', nama: 'Kota Samarinda', provId: 23, provName: 'KALIMANTAN TIMUR', tipe: 'Kota', isIbukota: true },
  { id: 'bpn_kota', nama: 'Kota Balikpapan', provId: 23, provName: 'KALIMANTAN TIMUR', tipe: 'Kota' },
  { id: 'ikn_ppu', nama: 'IKN Nusantara (Penajam Paser Utara)', provId: 23, provName: 'KALIMANTAN TIMUR', tipe: 'Kota/Kabupaten', catatan: 'Pusat Ibu Kota Nusantara (IKN) SBM Kaltim PMK 32/2025' },
  { id: 'btg_kaltim', nama: 'Kota Bontang', provId: 23, provName: 'KALIMANTAN TIMUR', tipe: 'Kota' },
  { id: 'kkt_kab', nama: 'Tenggarong (Kab. Kutai Kartanegara)', provId: 23, provName: 'KALIMANTAN TIMUR', tipe: 'Kota/Kabupaten' },
  { id: 'bru_kab', nama: 'Kab. Berau (Kepulauan Derawan)', provId: 23, provName: 'KALIMANTAN TIMUR', tipe: 'Kabupaten' },

  // KALIMANTAN BARAT & SELATAN (id: 20 & 22)
  { id: 'ptk_kota', nama: 'Kota Pontianak', provId: 20, provName: 'KALIMANTAN BARAT', tipe: 'Kota', isIbukota: true },
  { id: 'skw_kota', nama: 'Kota Singkawang', provId: 20, provName: 'KALIMANTAN BARAT', tipe: 'Kota' },
  { id: 'bjm_kota', nama: 'Kota Banjarmasin', provId: 22, provName: 'KALIMANTAN SELATAN', tipe: 'Kota', isIbukota: true },
  { id: 'bjb_kota', nama: 'Kota Banjarbaru', provId: 22, provName: 'KALIMANTAN SELATAN', tipe: 'Kota' },

  // SULAWESI SELATAN & UTARA (id: 28 & 25)
  { id: 'mks_kota', nama: 'Kota Makassar', provId: 28, provName: 'SULAWESI SELATAN', tipe: 'Kota', isIbukota: true },
  { id: 'par_kota', nama: 'Kota Parepare', provId: 28, provName: 'SULAWESI SELATAN', tipe: 'Kota' },
  { id: 'plp_kota', nama: 'Kota Palopo', provId: 28, provName: 'SULAWESI SELATAN', tipe: 'Kota' },
  { id: 'trj_kab', nama: 'Tana Toraja & Toraja Utara (Rantepao)', provId: 28, provName: 'SULAWESI SELATAN', tipe: 'Kabupaten' },
  { id: 'blk_kab', nama: 'Kab. Bulukumba (Tanjung Bira)', provId: 28, provName: 'SULAWESI SELATAN', tipe: 'Kabupaten' },
  { id: 'mnd_kota', nama: 'Kota Manado', provId: 25, provName: 'SULAWESI UTARA', tipe: 'Kota', isIbukota: true },
  { id: 'btg_sulut', nama: 'Kota Bitung', provId: 25, provName: 'SULAWESI UTARA', tipe: 'Kota' },
  { id: 'tmh_kota', nama: 'Kota Tomohon', provId: 25, provName: 'SULAWESI UTARA', tipe: 'Kota' },

  // SULAWESI TENGAH & TENGGARA (id: 29 & 30)
  { id: 'plu_kota', nama: 'Kota Palu', provId: 29, provName: 'SULAWESI TENGAH', tipe: 'Kota', isIbukota: true },
  { id: 'kdr_sultra', nama: 'Kota Kendari', provId: 30, provName: 'SULAWESI TENGGARA', tipe: 'Kota', isIbukota: true },
  { id: 'bau_kota', nama: 'Kota Baubau (Buton)', provId: 30, provName: 'SULAWESI TENGGARA', tipe: 'Kota' },
  { id: 'wkt_kab', nama: 'Kab. Wakatobi', provId: 30, provName: 'SULAWESI TENGGARA', tipe: 'Kabupaten' },

  // MALUKU & MALUKU UTARA (id: 31 & 32)
  { id: 'amb_kota', nama: 'Kota Ambon', provId: 31, provName: 'MALUKU', tipe: 'Kota', isIbukota: true },
  { id: 'tnt_kota', nama: 'Kota Ternate', provId: 32, provName: 'MALUKU UTARA', tipe: 'Kota' },
  { id: 'tdr_kota', nama: 'Kota Tidore Kepulauan', provId: 32, provName: 'MALUKU UTARA', tipe: 'Kota' },
  { id: 'sff_kota', nama: 'Sofifi (Ibukota Maluku Utara)', provId: 32, provName: 'MALUKU UTARA', tipe: 'Kota', isIbukota: true },

  // WILAYAH PAPUA (id: 33, 34, 35, 36, 37, 38)
  { id: 'jyp_kota', nama: 'Kota Jayapura', provId: 33, provName: 'PAPUA', tipe: 'Kota', isIbukota: true },
  { id: 'stn_kab', nama: 'Sentani (Kab. Jayapura)', provId: 33, provName: 'PAPUA', tipe: 'Kota/Kabupaten' },
  { id: 'bik_kab', nama: 'Kab. Biak Numfor', provId: 33, provName: 'PAPUA', tipe: 'Kabupaten' },
  { id: 'mnk_kab', nama: 'Kab. Manokwari', provId: 34, provName: 'PAPUA BARAT', tipe: 'Kabupaten', isIbukota: true },
  { id: 'fkf_kab', nama: 'Kab. Fakfak', provId: 34, provName: 'PAPUA BARAT', tipe: 'Kabupaten' },
  { id: 'srg_papua', nama: 'Kota Sorong', provId: 35, provName: 'PAPUA BARAT DAYA', tipe: 'Kota' },
  { id: 'rja_kab', nama: 'Raja Ampat (Waisai)', provId: 35, provName: 'PAPUA BARAT DAYA', tipe: 'Kabupaten' },
  { id: 'tim_kab', nama: 'Timika (Kab. Mimika)', provId: 36, provName: 'PAPUA TENGAH', tipe: 'Kota/Kabupaten' },
  { id: 'nbr_kab', nama: 'Kab. Nabire', provId: 36, provName: 'PAPUA TENGAH', tipe: 'Kabupaten' },
  { id: 'mrk_kab', nama: 'Kab. Merauke', provId: 37, provName: 'PAPUA SELATAN', tipe: 'Kabupaten' },
  { id: 'wmn_kab', nama: 'Wamena (Kab. Jayawijaya)', provId: 38, provName: 'PAPUA PEGUNUNGAN', tipe: 'Kabupaten' }
];

// Helper functions pencarian kota
function getDaftarKotaByProvinsi(provId) {
  if (!provId) return daftarKotaSbm;
  return daftarKotaSbm.filter(x => Number(x.provId) === Number(provId));
}

function cariKotaSbm(keyword) {
  if (!keyword || !keyword.trim()) return [];
  const q = keyword.trim().toLowerCase();
  return daftarKotaSbm.filter(x => 
    x.nama.toLowerCase().includes(q) || 
    x.provName.toLowerCase().includes(q) ||
    (x.catatan && x.catatan.toLowerCase().includes(q))
  );
}

if (typeof window !== 'undefined') {
  window.daftarKotaSbm = daftarKotaSbm;
  window.getDaftarKotaByProvinsi = getDaftarKotaByProvinsi;
  window.cariKotaSbm = cariKotaSbm;
}

