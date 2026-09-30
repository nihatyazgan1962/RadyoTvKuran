export interface Surah {
  number: string;
  code: string;
  name: string;
  arabicName: string;
  ayahCount: number;
}

export interface Qari {
  id: string;
  name: string;
  title: string;
  country: 'TR' | 'WORLD' | 'HUZUR';
  category: 'TR' | 'WORLD' | 'HUZUR';
  type: 'mp3quran' | 'archive_ishak' | 'archive_fatih' | 'archive_ilhan' | 'archive_tayyar';
  server?: string;
  slug?: string;
}

export const qarisList: Qari[] = [
  // --- MEŞHUR TÜRK KARİLERİ ---
  { id: 'tr_1', name: 'Hafız İshak Danış', title: 'İstanbul Kasımpaşa Büyük Camii Baş İmamı (Hatim)', country: 'TR', category: 'TR', type: 'archive_ishak' },
  { id: 'tr_2', name: 'Prof. Dr. Fatih Çollak', title: 'Marmara İlahiyat Kıraat Üstadı (Hatim)', country: 'TR', category: 'TR', type: 'archive_fatih' },
  { id: 'tr_3', name: 'Hafız İlhan Tok', title: 'Diyanet & TRT Radyoları Baş Karisi (Hatim)', country: 'TR', category: 'TR', type: 'archive_ilhan' },
  { id: 'tr_4', name: 'Dr. Tayyar Altıkulaç', title: 'Eski Diyanet İşleri Başkanı & Kıraat Alimi (Hatim)', country: 'TR', category: 'TR', type: 'archive_tayyar' },

  // --- HUZUR KIRAATLERİ (Sakin & Huşû Tilavetler) ---
  { id: 'hz_hazza', name: 'Hazza Al-Balushi', title: '🕊️ Umman (Sakin & Huzur Tilaveti)', country: 'HUZUR', category: 'HUZUR', type: 'mp3quran', server: 'server11', slug: 'hazza' },
  { id: 'hz_bukhatir', name: 'Salah Bukhatir', title: '🕊️ BAE (Huşû Veren Tilavet)', country: 'HUZUR', category: 'HUZUR', type: 'mp3quran', server: 'server8', slug: 'bu_khtr' },
  { id: 'hz_1', name: 'Mansoor Al-Salimi', title: '🕊️ Huzur & Huşû Kıraatleri', country: 'HUZUR', category: 'HUZUR', type: 'mp3quran', server: 'server14', slug: 'mansor' },
  { id: 'hz_2', name: 'Raad Mohammad Al Kurdi', title: '🕊️ Huzur & Duygulu Tilavet', country: 'HUZUR', category: 'HUZUR', type: 'mp3quran', server: 'server6', slug: 'kurdi' },
  { id: 'hz_3', name: 'İdris Ebker', title: '🕊️ Huşû ve Gece Kıraatleri', country: 'HUZUR', category: 'HUZUR', type: 'mp3quran', server: 'server6', slug: 'abkr' },
  { id: 'hz_4', name: 'Halid el-Galil', title: '🕊️ Duygusal Huzur Tilaveti', country: 'HUZUR', category: 'HUZUR', type: 'mp3quran', server: 'server10', slug: 'jleel' },
  { id: 'hz_5', name: 'Nâsır el-Katâmî', title: '🕊️ Huzur Veren Huşû Kıraati', country: 'HUZUR', category: 'HUZUR', type: 'mp3quran', server: 'server6', slug: 'qtm' },
  { id: 'hz_6', name: 'Faris Abbad', title: '🕊️ Sakin & Dingin Tilavet', country: 'HUZUR', category: 'HUZUR', type: 'mp3quran', server: 'server8', slug: 'frs_a' },

  // --- MEŞHUR DÜNYA KARİLERİ (KÂBE & MEDİNE & MISIR) ---
  { id: 'w_1', name: 'Abdurrahman es-Sudeysi', title: 'Kâbe Baş İmamı (Mescid-i Haram)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server11', slug: 'sds' },
  { id: 'w_bandar', name: 'Bandar Baleela', title: 'Kâbe İmamı (Mescid-i Haram)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server6', slug: 'balilah' },
  { id: 'w_juhany', name: 'Abdullah el-Cüheni', title: 'Kâbe İmamı (Mescid-i Haram)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server13', slug: 'jhn' },
  { id: 'w_shuraim', name: 'Suud eş-Şureym', title: 'Kâbe Eski İmamı', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server7', slug: 'shur' },
  { id: 'w_2', name: 'Mishary Rashid Alafasy', title: 'Kuveyt (Rivayet Hafs)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server8', slug: 'afs' },
  { id: 'w_3', name: 'Abdulbasit Abdussamed', title: 'Mısır (Murattal)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server7', slug: 'basit' },
  { id: 'w_4', name: 'Maher Al-Muaiqly', title: 'Kâbe İmamı (Mescid-i Haram)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server12', slug: 'maher' },
  { id: 'w_5', name: 'Saad Al-Ghamdi', title: 'Suudi Arabistan', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server7', slug: 's_gmd' },
  { id: 'w_6', name: 'Yasser Al-Dosari', title: 'Kâbe İmamı (Mescid-i Haram)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server11', slug: 'yasser' },
  { id: 'w_huthaify', name: 'Ali el-Huzeyfi', title: 'Mescid-i Nebevî Baş İmamı (Medine)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server9', slug: 'hthfi' },
  { id: 'w_ayyub', name: 'Muhammed Eyyüb', title: 'Mescid-i Nebevî Eski İmamı (Medine)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server8', slug: 'ayyub' },
  { id: 'w_7', name: 'Ahmed el-Acemi', title: 'Suudi Arabistan', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server10', slug: 'ajm' },
  { id: 'w_8', name: 'Muhammed Sıddık el-Minşevi', title: 'Mısır (Murattal)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server10', slug: 'minsh' },
  { id: 'w_9', name: 'Mahmud Halil el-Husari', title: 'Mısır (Murattal)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server13', slug: 'husr' },
  { id: 'w_banna', name: 'Mahmud Ali el-Benna', title: 'Mısır (Efsane Kıraat)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server8', slug: 'bna' },
  { id: 'w_10', name: 'Ebubekir eş-Şâtırî', title: 'Suudi Arabistan', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server11', slug: 'shatri' },
  { id: 'w_11', name: 'Salih el-Budeyr', title: 'Mescid-i Nebevî İmamı', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server6', slug: 's_bud' },
  { id: 'w_sayegh', name: 'Tevfik es-Sayeğ', title: 'Suudi Arabistan', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server6', slug: 'twfeeq' },
  { id: 'w_basfar', name: 'Abdullah Basfar', title: 'Cidde / Suudi Arabistan', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server6', slug: 'bsfr' },
  { id: 'w_12', name: 'Ali Cabir (Ali Jaber)', title: 'Kâbe-i Muazzama Eski İmamı', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server11', slug: 'a_jbr' },
  { id: 'w_13', name: 'Mustafa İsmail', title: 'Mısır (Efsane Kariler)', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server8', slug: 'mustafa' },
  { id: 'w_14', name: 'Halid el-Kahtani', title: 'Suudi Arabistan', country: 'WORLD', category: 'WORLD', type: 'mp3quran', server: 'server10', slug: 'qht' },
];

export const fatihFilesMap: Record<string, string> = {
  "100": "100.mp3",
  "101": "101.mp3",
  "102": "102.mp3",
  "103": "103.mp3",
  "104": "104.mp3",
  "105": "105.mp3",
  "106": "106.mp3",
  "107": "107.mp3",
  "108": "108.mp3",
  "109": "109.mp3",
  "110": "110.mp3",
  "111": "111.mp3",
  "112": "112.mp3",
  "113": "113.mp3",
  "114": "114.mp3",
  "001": "001_Fatiha.mp3",
  "002": "002_Bakara.mp3",
  "003": "003_Ali_imran.mp3",
  "004": "004_Nisa.mp3",
  "005": "005_Maide.mp3",
  "006": "006_Enam.mp3",
  "007": "007_Araf.mp3",
  "008": "008_Enfal.mp3",
  "009": "009_Tevbe.mp3",
  "010": "010_Yunus.mp3",
  "011": "011_Hud.mp3",
  "012": "012_Yusuf.mp3",
  "013": "013_Rad.mp3",
  "014": "014_ibrahim.mp3",
  "015": "015_Hicr.mp3",
  "016": "016_Nahl.mp3",
  "017": "017_isra.mp3",
  "018": "018_Kehf.mp3",
  "019": "019_Meryem.mp3",
  "020": "020_Taha.mp3",
  "021": "021_Enbiya.mp3",
  "022": "022_Hac.mp3",
  "023": "023_Muminun.mp3",
  "024": "024_Nur.mp3",
  "025": "025_Furkan.mp3",
  "026": "026_Suara.mp3",
  "027": "027_Neml.mp3",
  "028": "028_Kasas.mp3",
  "029": "029_Ankebut.mp3",
  "030": "030_Rum.mp3",
  "031": "031_Lokman.mp3",
  "032": "032_Secde.mp3",
  "033": "033_Ahzab.mp3",
  "034": "034_Sebe.mp3",
  "035": "035_Fatir.mp3",
  "036": "036_Yasin.mp3",
  "037": "037_Saffat.mp3",
  "038": "038_Sad.mp3",
  "039": "039_Zumer.mp3",
  "040": "040_Mumin.mp3",
  "041": "041_Fussılet.mp3",
  "042": "042_Sura.mp3",
  "043": "043_Zuhruf.mp3",
  "044": "044_Duhan.mp3",
  "045": "045_Casiye.mp3",
  "046": "046_Ahkaf.mp3",
  "047": "047_Muhammet.mp3",
  "048": "048_Fetih.mp3",
  "049": "049_Hucurat.mp3",
  "050": "050_Kaf.mp3",
  "051": "051_Zariyat.mp3",
  "052": "052_Tur.mp3",
  "053": "053_Necm.mp3",
  "054": "054_Kamer.mp3",
  "055": "055_Rahman.mp3",
  "056": "056_Vakia.mp3",
  "057": "057.mp3",
  "058": "058.mp3",
  "059": "059.mp3",
  "060": "060.mp3",
  "061": "061.mp3",
  "062": "062.mp3",
  "063": "063.mp3",
  "064": "064.mp3",
  "065": "065.mp3",
  "066": "066.mp3",
  "067": "067.mp3",
  "068": "068.mp3",
  "069": "069.mp3",
  "070": "070.mp3",
  "071": "071.mp3",
  "072": "072.mp3",
  "073": "073.mp3",
  "074": "074.mp3",
  "075": "075.mp3",
  "076": "076.mp3",
  "077": "077.mp3",
  "078": "078.mp3",
  "079": "079.mp3",
  "080": "080.mp3",
  "081": "081.mp3",
  "082": "082.mp3",
  "083": "083.mp3",
  "084": "084.mp3",
  "085": "085.mp3",
  "086": "086.mp3",
  "087": "087.mp3",
  "088": "088.mp3",
  "089": "089.mp3",
  "090": "090.mp3",
  "091": "091.mp3",
  "092": "092.mp3",
  "093": "093.mp3",
  "094": "094.mp3",
  "095": "095.mp3",
  "096": "096.mp3",
  "097": "097.mp3",
  "098": "098.mp3",
  "099": "099.mp3"
};

export const ilhanFilesMap: Record<string, string> = {
  "100": "100-Adiyat Suresi.mp3",
  "101": "101-Kari’a Suresi.mp3",
  "102": "102-Tekasür Suresi.mp3",
  "103": "103-Asr Suresi.mp3",
  "104": "104-Hümeze Suresi.mp3",
  "105": "105-Fil Suresi.mp3",
  "106": "106-Kureyş Suresi.mp3",
  "107": "107-Ma’un Suresi.mp3",
  "108": "108-Kevser Suresi.mp3",
  "109": "109-Kâfirun Suresi.mp3",
  "110": "110-Nasr Suresi.mp3",
  "111": "111-Tebbet Suresi.mp3",
  "112": "112-İhlas Suresi.mp3",
  "113": "113-Felak Suresi.mp3",
  "114": "114-Nas Suresi.mp3",
  "001": "001-Fatiha Suresi.mp3",
  "002": "002-Bakara Suresi.mp3",
  "003": "003-Âl-i İmran Suresi.mp3",
  "004": "004-Nisa Suresi.mp3",
  "005": "005-Maide Suresi.mp3",
  "006": "006-En’âm Suresi.mp3",
  "007": "007-A’raf Suresi.mp3",
  "008": "008-Enfal Suresi.mp3",
  "009": "009-Tevbe Suresi.mp3",
  "010": "010-Yunus Suresi.mp3",
  "011": "011-Hud Suresi.mp3",
  "012": "012-Yusuf Suresi.mp3",
  "013": "013-Ra’d Suresi.mp3",
  "014": "014-İbrahim Suresi.mp3",
  "015": "015-Hicr Suresi.mp3",
  "016": "016-Nahl Suresi.mp3",
  "017": "017-İsra Suresi.mp3",
  "018": "018-Kehf Suresi.mp3",
  "019": "019-Meryem Suresi.mp3",
  "020": "020-Taha Suresi.mp3",
  "021": "021-Enbiya Suresi.mp3",
  "022": "022-Hac Suresi.mp3",
  "023": "023-Mü’minun Suresi.mp3",
  "024": "024-Nur Suresi.mp3",
  "025": "025-Furkan Suresi.mp3",
  "026": "026-Şuara Suresi.mp3",
  "027": "027-Neml Suresi.mp3",
  "028": "028-Kasas Suresi.mp3",
  "029": "029-Ankebut Suresi.mp3",
  "030": "030-Rum Suresi.mp3",
  "031": "031-Lokman Suresi.mp3",
  "032": "032-Secde Suresi.mp3",
  "033": "033-Ahzap Suresi.mp3",
  "034": "034-Sebe Suresi.mp3",
  "035": "035-Fatır Suresi.mp3",
  "036": "036-Yasin Suresi.mp3",
  "037": "037-Saffat Suresi.mp3",
  "038": "038-Sad Suresi.mp3",
  "039": "039-Zümer Suresi.mp3",
  "040": "040-Mü’min Suresi.mp3",
  "041": "041-Fussilet Suresi.mp3",
  "042": "042-Şura Suresi.mp3",
  "043": "043-Zuhruf Suresi.mp3",
  "044": "044-Duhan Suresi.mp3",
  "045": "045-Casiye Suresi.mp3",
  "046": "046-Ahkaf Suresi.mp3",
  "047": "047-Muhammed Suresi.mp3",
  "048": "048-Fetih Suresi.mp3",
  "049": "049-Hucurat Suresi.mp3",
  "050": "050-Kaf Suresi.mp3",
  "051": "051-Zâriyat Suresi.mp3",
  "052": "052-Tur Suresi.mp3",
  "053": "053-Necm Suresi.mp3",
  "054": "054-Kamer Suresi.mp3",
  "055": "055-Rahman Suresi.mp3",
  "056": "056-Vakia Suresi.mp3",
  "057": "057-Hadid Suresi.mp3",
  "058": "058-Mücadele Suresi.mp3",
  "059": "059-Haşr Suresi.mp3",
  "060": "060-Mümtehine Suresi.mp3",
  "061": "061-Saf Suresi.mp3",
  "062": "062-Cum’a Suresi.mp3",
  "063": "063-Münafikun Suresi.mp3",
  "064": "064-Tegabün Suresi.mp3",
  "065": "065-Talak Suresi.mp3",
  "066": "066-Tahrim Suresi.mp3",
  "067": "067-Mülk Suresi.mp3",
  "068": "068-Kalem Suresi.mp3",
  "069": "069-Hakka Suresi.mp3",
  "070": "070-Mearic Suresi.mp3",
  "071": "071-Nuh Suresi.mp3",
  "072": "072-Cin Suresi.mp3",
  "073": "073-Müzzemmil Suresi.mp3",
  "074": "074-Müddessir Suresi.mp3",
  "075": "075-Kıyamet Suresi.mp3",
  "076": "076-İnsan Suresi.mp3",
  "077": "077-Mürselat Suresi.mp3",
  "078": "078-Nebe Suresi.mp3",
  "079": "079-Naziat Suresi.mp3",
  "080": "080-Abese Suresi.mp3",
  "081": "081-Tekvir Suresi.mp3",
  "082": "082-İnfitar Suresi.mp3",
  "083": "083-Mutaffifin Suresi.mp3",
  "084": "084-İnşikak Suresi.mp3",
  "085": "085-Büruc Suresi.mp3",
  "086": "086-Tarık Suresi.mp3",
  "087": "087-A’la Suresi.mp3",
  "088": "088-Gaşiye Suresi.mp3",
  "089": "089-Fecr Suresi.mp3",
  "090": "090-Beled Suresi.mp3",
  "091": "091-Şems Suresi.mp3",
  "092": "092-Leyl Suresi.mp3",
  "093": "093-Duha Suresi.mp3",
  "094": "094-İnşirah Suresi.mp3",
  "095": "095-Tin Suresi.mp3",
  "096": "096-Alak Suresi.mp3",
  "097": "097-Kadir Suresi.mp3",
  "098": "098-Beyyine Suresi.mp3",
  "099": "099-Zilzâl Suresi.mp3"
};

export const tayyarFilesMap: Record<string, string> = {
  "100": "Adiyat.mp3",
  "101": "Karia.mp3",
  "102": "Tekasur.mp3",
  "103": "Asr.mp3",
  "104": "Humeze.mp3",
  "105": "Fil.mp3",
  "106": "Kureys.mp3",
  "107": "Maun.mp3",
  "108": "Kevser.mp3",
  "109": "Kaf.mp3",
  "110": "Nas.mp3",
  "111": "Tebbet.mp3",
  "112": "Ihlas.mp3",
  "113": "Felak.mp3",
  "114": "Nas.mp3",
  "001": "Fatiha.mp3",
  "002": "Bakara.mp3",
  "003": "Ali Imran.mp3",
  "004": "Nisa.mp3",
  "005": "Maide.mp3",
  "006": "Enam.mp3",
  "007": "Araf.mp3",
  "008": "Enfal.mp3",
  "009": "Tevbbe.mp3",
  "010": "Yunus.mp3",
  "011": "Hud.mp3",
  "012": "Yusuf.mp3",
  "013": "Rad.mp3",
  "014": "Ibrahim.mp3",
  "015": "Hicr.mp3",
  "016": "Nahl.mp3",
  "017": "Isra.mp3",
  "018": "Kehf.mp3",
  "019": "Meryem.mp3",
  "020": "Taha.mp3",
  "021": "Enbiya.mp3",
  "022": "Hac.mp3",
  "023": "Mumin.mp3",
  "024": "Nur.mp3",
  "025": "Furkan.mp3",
  "026": "Suara.mp3",
  "027": "Neml.mp3",
  "028": "Kasas.mp3",
  "029": "Ankebut.mp3",
  "030": "Rum.mp3",
  "031": "Lokman.mp3",
  "032": "Secde.mp3",
  "033": "Ahzab.mp3",
  "034": "Sebe.mp3",
  "035": "Fatir.mp3",
  "036": "Yasin.mp3",
  "037": "Saf.mp3",
  "038": "Sad.mp3",
  "039": "Zumer.mp3",
  "040": "Mumin.mp3",
  "041": "Fussilet.mp3",
  "042": "Sura.mp3",
  "043": "Zuhruf.mp3",
  "044": "Duha.mp3",
  "045": "Casiye.mp3",
  "046": "Ahkaf.mp3",
  "047": "Muhammed.mp3",
  "048": "Fetih.mp3",
  "049": "Hucurat.mp3",
  "050": "Kaf.mp3",
  "051": "Zariyat.mp3",
  "052": "Tur.mp3",
  "053": "Necm.mp3",
  "054": "Kamer.mp3",
  "055": "Rahman.mp3",
  "056": "Vakia.mp3",
  "057": "Hadid.mp3",
  "058": "Mucadele.mp3",
  "059": "Hasr.mp3",
  "060": "Mumtehine.mp3",
  "061": "Saf.mp3",
  "062": "Cuma.mp3",
  "063": "Munafikun.mp3",
  "064": "Tegabun.mp3",
  "065": "Talak.mp3",
  "066": "Tahrim.mp3",
  "067": "Mulk.mp3",
  "068": "Kalem.mp3",
  "069": "Hakka.mp3",
  "070": "Mearic.mp3",
  "071": "Nuh.mp3",
  "072": "Cin.mp3",
  "073": "Muzzemmil.mp3",
  "074": "Muddessir.mp3",
  "075": "Kiyamet.mp3",
  "076": "Insan.mp3",
  "077": "Murselat.mp3",
  "078": "Nebe.mp3",
  "079": "Naziat.mp3",
  "080": "Abese.mp3",
  "081": "Tekvir.mp3",
  "082": "Infitar.mp3",
  "083": "Mutaffifin.mp3",
  "084": "Insikak.mp3",
  "085": "Buruc.mp3",
  "086": "Tarik.mp3",
  "087": "Ala.mp3",
  "088": "Gasiye.mp3",
  "089": "Fecr.mp3",
  "090": "Beled.mp3",
  "091": "Sems.mp3",
  "092": "Leyl.mp3",
  "093": "Duha.mp3",
  "094": "Insirah.mp3",
  "095": "Tin.mp3",
  "096": "Ala.mp3",
  "097": "Kadir.mp3",
  "098": "Beyyine.mp3",
  "099": "Zilzal.mp3"
};

export const surahsList: Surah[] = [
  {
    "number": "1",
    "code": "001",
    "name": "Fâtiha Suresi",
    "arabicName": "سُورَةُ ٱلْفَاتِحَةِ",
    "ayahCount": 7
  },
  {
    "number": "2",
    "code": "002",
    "name": "Bakara Suresi",
    "arabicName": "سُورَةُ البَقَرَةِ",
    "ayahCount": 286
  },
  {
    "number": "3",
    "code": "003",
    "name": "Âl-i İmrân Suresi",
    "arabicName": "سُورَةُ آلِ عِمۡرَانَ",
    "ayahCount": 200
  },
  {
    "number": "4",
    "code": "004",
    "name": "Nisâ Suresi",
    "arabicName": "سُورَةُ النِّسَاءِ",
    "ayahCount": 176
  },
  {
    "number": "5",
    "code": "005",
    "name": "Mâide Suresi",
    "arabicName": "سُورَةُ المَائـِدَةِ",
    "ayahCount": 120
  },
  {
    "number": "6",
    "code": "006",
    "name": "En'âm Suresi",
    "arabicName": "سُورَةُ الأَنۡعَامِ",
    "ayahCount": 165
  },
  {
    "number": "7",
    "code": "007",
    "name": "A'râf Suresi",
    "arabicName": "سُورَةُ الأَعۡرَافِ",
    "ayahCount": 206
  },
  {
    "number": "8",
    "code": "008",
    "name": "Enfâl Suresi",
    "arabicName": "سُورَةُ الأَنفَالِ",
    "ayahCount": 75
  },
  {
    "number": "9",
    "code": "009",
    "name": "Tevbe Suresi",
    "arabicName": "سُورَةُ التَّوۡبَةِ",
    "ayahCount": 129
  },
  {
    "number": "10",
    "code": "010",
    "name": "Yûnus Suresi",
    "arabicName": "سُورَةُ يُونُسَ",
    "ayahCount": 109
  },
  {
    "number": "11",
    "code": "011",
    "name": "Hûd Suresi",
    "arabicName": "سُورَةُ هُودٍ",
    "ayahCount": 123
  },
  {
    "number": "12",
    "code": "012",
    "name": "Yûsuf Suresi",
    "arabicName": "سُورَةُ يُوسُفَ",
    "ayahCount": 111
  },
  {
    "number": "13",
    "code": "013",
    "name": "Ra'd Suresi",
    "arabicName": "سُورَةُ الرَّعۡدِ",
    "ayahCount": 43
  },
  {
    "number": "14",
    "code": "014",
    "name": "İbrâhîm Suresi",
    "arabicName": "سُورَةُ إِبۡرَاهِيمَ",
    "ayahCount": 52
  },
  {
    "number": "15",
    "code": "015",
    "name": "Hicr Suresi",
    "arabicName": "سُورَةُ الحِجۡرِ",
    "ayahCount": 99
  },
  {
    "number": "16",
    "code": "016",
    "name": "Nahl Suresi",
    "arabicName": "سُورَةُ النَّحۡلِ",
    "ayahCount": 128
  },
  {
    "number": "17",
    "code": "017",
    "name": "İsrâ Suresi",
    "arabicName": "سُورَةُ الإِسۡرَاءِ",
    "ayahCount": 111
  },
  {
    "number": "18",
    "code": "018",
    "name": "Kehf Suresi",
    "arabicName": "سُورَةُ الكَهۡفِ",
    "ayahCount": 110
  },
  {
    "number": "19",
    "code": "019",
    "name": "Meryem Suresi",
    "arabicName": "سُورَةُ مَرۡيَمَ",
    "ayahCount": 98
  },
  {
    "number": "20",
    "code": "020",
    "name": "Tâhâ Suresi",
    "arabicName": "سُورَةُ طه",
    "ayahCount": 135
  },
  {
    "number": "21",
    "code": "021",
    "name": "Enbiyâ Suresi",
    "arabicName": "سُورَةُ الأَنبِيَاءِ",
    "ayahCount": 112
  },
  {
    "number": "22",
    "code": "022",
    "name": "Hac Suresi",
    "arabicName": "سُورَةُ الحَجِّ",
    "ayahCount": 78
  },
  {
    "number": "23",
    "code": "023",
    "name": "Mü'minûn Suresi",
    "arabicName": "سُورَةُ المُؤۡمِنُونَ",
    "ayahCount": 118
  },
  {
    "number": "24",
    "code": "024",
    "name": "Nûr Suresi",
    "arabicName": "سُورَةُ النُّورِ",
    "ayahCount": 64
  },
  {
    "number": "25",
    "code": "025",
    "name": "Furkan Suresi",
    "arabicName": "سُورَةُ الفُرۡقَانِ",
    "ayahCount": 77
  },
  {
    "number": "26",
    "code": "026",
    "name": "Şuarâ Suresi",
    "arabicName": "سُورَةُ الشُّعَرَاءِ",
    "ayahCount": 227
  },
  {
    "number": "27",
    "code": "027",
    "name": "Neml Suresi",
    "arabicName": "سُورَةُ النَّمۡلِ",
    "ayahCount": 93
  },
  {
    "number": "28",
    "code": "028",
    "name": "Kasas Suresi",
    "arabicName": "سُورَةُ القَصَصِ",
    "ayahCount": 88
  },
  {
    "number": "29",
    "code": "029",
    "name": "Ankebût Suresi",
    "arabicName": "سُورَةُ العَنكَبُوتِ",
    "ayahCount": 69
  },
  {
    "number": "30",
    "code": "030",
    "name": "Rûm Suresi",
    "arabicName": "سُورَةُ الرُّومِ",
    "ayahCount": 60
  },
  {
    "number": "31",
    "code": "031",
    "name": "Lokmân Suresi",
    "arabicName": "سُورَةُ لُقۡمَانَ",
    "ayahCount": 34
  },
  {
    "number": "32",
    "code": "032",
    "name": "Secde Suresi",
    "arabicName": "سُورَةُ السَّجۡدَةِ",
    "ayahCount": 30
  },
  {
    "number": "33",
    "code": "033",
    "name": "Ahzâb Suresi",
    "arabicName": "سُورَةُ الأَحۡزَابِ",
    "ayahCount": 73
  },
  {
    "number": "34",
    "code": "034",
    "name": "Sebe' Suresi",
    "arabicName": "سُورَةُ سَبَإٍ",
    "ayahCount": 54
  },
  {
    "number": "35",
    "code": "035",
    "name": "Fâtır Suresi",
    "arabicName": "سُورَةُ فَاطِرٍ",
    "ayahCount": 45
  },
  {
    "number": "36",
    "code": "036",
    "name": "Yâsîn Suresi",
    "arabicName": "سُورَةُ يسٓ",
    "ayahCount": 83
  },
  {
    "number": "37",
    "code": "037",
    "name": "Sâffât Suresi",
    "arabicName": "سُورَةُ الصَّافَّاتِ",
    "ayahCount": 182
  },
  {
    "number": "38",
    "code": "038",
    "name": "Sâd Suresi",
    "arabicName": "سُورَةُ صٓ",
    "ayahCount": 88
  },
  {
    "number": "39",
    "code": "039",
    "name": "Zümer Suresi",
    "arabicName": "سُورَةُ الزُّمَرِ",
    "ayahCount": 75
  },
  {
    "number": "40",
    "code": "040",
    "name": "Mü'min (Gâfir) Suresi",
    "arabicName": "سُورَةُ غَافِرٍ",
    "ayahCount": 85
  },
  {
    "number": "41",
    "code": "041",
    "name": "Fussilet Suresi",
    "arabicName": "سُورَةُ فُصِّلَتۡ",
    "ayahCount": 54
  },
  {
    "number": "42",
    "code": "042",
    "name": "Şûrâ Suresi",
    "arabicName": "سُورَةُ الشُّورَىٰ",
    "ayahCount": 53
  },
  {
    "number": "43",
    "code": "043",
    "name": "Zuhruf Suresi",
    "arabicName": "سُورَةُ الزُّخۡرُفِ",
    "ayahCount": 89
  },
  {
    "number": "44",
    "code": "044",
    "name": "Duhân Suresi",
    "arabicName": "سُورَةُ الدُّخَانِ",
    "ayahCount": 59
  },
  {
    "number": "45",
    "code": "045",
    "name": "Câsiye Suresi",
    "arabicName": "سُورَةُ الجَاثِيَةِ",
    "ayahCount": 37
  },
  {
    "number": "46",
    "code": "046",
    "name": "Ahkâf Suresi",
    "arabicName": "سُورَةُ الأَحۡقَافِ",
    "ayahCount": 35
  },
  {
    "number": "47",
    "code": "047",
    "name": "Muhammed Suresi",
    "arabicName": "سُورَةُ مُحَمَّدٍ",
    "ayahCount": 38
  },
  {
    "number": "48",
    "code": "048",
    "name": "Fetih Suresi",
    "arabicName": "سُورَةُ الفَتۡحِ",
    "ayahCount": 29
  },
  {
    "number": "49",
    "code": "049",
    "name": "Hucurât Suresi",
    "arabicName": "سُورَةُ الحُجُرَاتِ",
    "ayahCount": 18
  },
  {
    "number": "50",
    "code": "050",
    "name": "Kâf Suresi",
    "arabicName": "سُورَةُ قٓ",
    "ayahCount": 45
  },
  {
    "number": "51",
    "code": "051",
    "name": "Zâriyât Suresi",
    "arabicName": "سُورَةُ الذَّارِيَاتِ",
    "ayahCount": 60
  },
  {
    "number": "52",
    "code": "052",
    "name": "Tûr Suresi",
    "arabicName": "سُورَةُ الطُّورِ",
    "ayahCount": 49
  },
  {
    "number": "53",
    "code": "053",
    "name": "Necm Suresi",
    "arabicName": "سُورَةُ النَّجۡمِ",
    "ayahCount": 62
  },
  {
    "number": "54",
    "code": "054",
    "name": "Kamer Suresi",
    "arabicName": "سُورَةُ القَمَرِ",
    "ayahCount": 55
  },
  {
    "number": "55",
    "code": "055",
    "name": "Rahmân Suresi",
    "arabicName": "سُورَةُ الرَّحۡمَٰن",
    "ayahCount": 78
  },
  {
    "number": "56",
    "code": "056",
    "name": "Vâkıa Suresi",
    "arabicName": "سُورَةُ الوَاقِعَةِ",
    "ayahCount": 96
  },
  {
    "number": "57",
    "code": "057",
    "name": "Hadîd Suresi",
    "arabicName": "سُورَةُ الحَدِيدِ",
    "ayahCount": 29
  },
  {
    "number": "58",
    "code": "058",
    "name": "Mücâdele Suresi",
    "arabicName": "سُورَةُ المُجَادلَةِ",
    "ayahCount": 22
  },
  {
    "number": "59",
    "code": "059",
    "name": "Haşr Suresi",
    "arabicName": "سُورَةُ الحَشۡرِ",
    "ayahCount": 24
  },
  {
    "number": "60",
    "code": "060",
    "name": "Mümtehine Suresi",
    "arabicName": "سُورَةُ المُمۡتَحنَةِ",
    "ayahCount": 13
  },
  {
    "number": "61",
    "code": "061",
    "name": "Saf Suresi",
    "arabicName": "سُورَةُ الصَّفِّ",
    "ayahCount": 14
  },
  {
    "number": "62",
    "code": "062",
    "name": "Cuma Suresi",
    "arabicName": "سُورَةُ الجُمُعَةِ",
    "ayahCount": 11
  },
  {
    "number": "63",
    "code": "063",
    "name": "Münâfikûn Suresi",
    "arabicName": "سُورَةُ المُنَافِقُونَ",
    "ayahCount": 11
  },
  {
    "number": "64",
    "code": "064",
    "name": "Teğâbün Suresi",
    "arabicName": "سُورَةُ التَّغَابُنِ",
    "ayahCount": 18
  },
  {
    "number": "65",
    "code": "065",
    "name": "Talâk Suresi",
    "arabicName": "سُورَةُ الطَّلَاقِ",
    "ayahCount": 12
  },
  {
    "number": "66",
    "code": "066",
    "name": "Tahrîm Suresi",
    "arabicName": "سُورَةُ التَّحۡرِيمِ",
    "ayahCount": 12
  },
  {
    "number": "67",
    "code": "067",
    "name": "Mülk (Tebâreke) Suresi",
    "arabicName": "سُورَةُ المُلۡكِ",
    "ayahCount": 30
  },
  {
    "number": "68",
    "code": "068",
    "name": "Kalem Suresi",
    "arabicName": "سُورَةُ القَلَمِ",
    "ayahCount": 52
  },
  {
    "number": "69",
    "code": "069",
    "name": "Hâkka Suresi",
    "arabicName": "سُورَةُ الحَاقَّةِ",
    "ayahCount": 52
  },
  {
    "number": "70",
    "code": "070",
    "name": "Meâric Suresi",
    "arabicName": "سُورَةُ المَعَارِجِ",
    "ayahCount": 44
  },
  {
    "number": "71",
    "code": "071",
    "name": "Nûh Suresi",
    "arabicName": "سُورَةُ نُوحٍ",
    "ayahCount": 28
  },
  {
    "number": "72",
    "code": "072",
    "name": "Cin Suresi",
    "arabicName": "سُورَةُ الجِنِّ",
    "ayahCount": 28
  },
  {
    "number": "73",
    "code": "073",
    "name": "Müzzemmil Suresi",
    "arabicName": "سُورَةُ المُزَّمِّلِ",
    "ayahCount": 20
  },
  {
    "number": "74",
    "code": "074",
    "name": "Müddessir Suresi",
    "arabicName": "سُورَةُ المُدَّثِّرِ",
    "ayahCount": 56
  },
  {
    "number": "75",
    "code": "075",
    "name": "Kıyâmet Suresi",
    "arabicName": "سُورَةُ القِيَامَةِ",
    "ayahCount": 40
  },
  {
    "number": "76",
    "code": "076",
    "name": "İnsân Suresi",
    "arabicName": "سُورَةُ الإِنسَانِ",
    "ayahCount": 31
  },
  {
    "number": "77",
    "code": "077",
    "name": "Mürselât Suresi",
    "arabicName": "سُورَةُ المُرۡسَلَاتِ",
    "ayahCount": 50
  },
  {
    "number": "78",
    "code": "078",
    "name": "Nebe (Amme) Suresi",
    "arabicName": "سُورَةُ النَّبَإِ",
    "ayahCount": 40
  },
  {
    "number": "79",
    "code": "079",
    "name": "Nâziât Suresi",
    "arabicName": "سُورَةُ النَّازِعَاتِ",
    "ayahCount": 46
  },
  {
    "number": "80",
    "code": "080",
    "name": "Abese Suresi",
    "arabicName": "سُورَةُ عَبَسَ",
    "ayahCount": 42
  },
  {
    "number": "81",
    "code": "081",
    "name": "Tekvîr Suresi",
    "arabicName": "سُورَةُ التَّكۡوِيرِ",
    "ayahCount": 29
  },
  {
    "number": "82",
    "code": "082",
    "name": "İnfitâr Suresi",
    "arabicName": "سُورَةُ الانفِطَارِ",
    "ayahCount": 19
  },
  {
    "number": "83",
    "code": "083",
    "name": "Mutaffifîn Suresi",
    "arabicName": "سُورَةُ المُطَفِّفِينَ",
    "ayahCount": 36
  },
  {
    "number": "84",
    "code": "084",
    "name": "İnşikâk Suresi",
    "arabicName": "سُورَةُ الانشِقَاقِ",
    "ayahCount": 25
  },
  {
    "number": "85",
    "code": "085",
    "name": "Bürûc Suresi",
    "arabicName": "سُورَةُ البُرُوجِ",
    "ayahCount": 22
  },
  {
    "number": "86",
    "code": "086",
    "name": "Târık Suresi",
    "arabicName": "سُورَةُ الطَّارِقِ",
    "ayahCount": 17
  },
  {
    "number": "87",
    "code": "087",
    "name": "A'lâ Suresi",
    "arabicName": "سُورَةُ الأَعۡلَىٰ",
    "ayahCount": 19
  },
  {
    "number": "88",
    "code": "088",
    "name": "Gâşiye Suresi",
    "arabicName": "سُورَةُ الغَاشِيَةِ",
    "ayahCount": 26
  },
  {
    "number": "89",
    "code": "089",
    "name": "Fecr Suresi",
    "arabicName": "سُورَةُ الفَجۡرِ",
    "ayahCount": 30
  },
  {
    "number": "90",
    "code": "090",
    "name": "Beled Suresi",
    "arabicName": "سُورَةُ البَلَدِ",
    "ayahCount": 20
  },
  {
    "number": "91",
    "code": "091",
    "name": "Şems Suresi",
    "arabicName": "سُورَةُ الشَّمۡسِ",
    "ayahCount": 15
  },
  {
    "number": "92",
    "code": "092",
    "name": "Leyl Suresi",
    "arabicName": "سُورَةُ اللَّيۡلِ",
    "ayahCount": 21
  },
  {
    "number": "93",
    "code": "093",
    "name": "Duhâ Suresi",
    "arabicName": "سُورَةُ الضُّحَىٰ",
    "ayahCount": 11
  },
  {
    "number": "94",
    "code": "094",
    "name": "İnşirâh Suresi",
    "arabicName": "سُورَةُ الشَّرۡحِ",
    "ayahCount": 8
  },
  {
    "number": "95",
    "code": "095",
    "name": "Tîn Suresi",
    "arabicName": "سُورَةُ التِّينِ",
    "ayahCount": 8
  },
  {
    "number": "96",
    "code": "096",
    "name": "Alak Suresi",
    "arabicName": "سُورَةُ العَلَقِ",
    "ayahCount": 19
  },
  {
    "number": "97",
    "code": "097",
    "name": "Kadir Suresi",
    "arabicName": "سُورَةُ القَدۡرِ",
    "ayahCount": 5
  },
  {
    "number": "98",
    "code": "098",
    "name": "Beyyine Suresi",
    "arabicName": "سُورَةُ البَيِّنَةِ",
    "ayahCount": 8
  },
  {
    "number": "99",
    "code": "099",
    "name": "Zilzâl Suresi",
    "arabicName": "سُورَةُ الزَّلۡزَلَةِ",
    "ayahCount": 8
  },
  {
    "number": "100",
    "code": "100",
    "name": "Âdiyât Suresi",
    "arabicName": "سُورَةُ العَادِيَاتِ",
    "ayahCount": 11
  },
  {
    "number": "101",
    "code": "101",
    "name": "Kâria Suresi",
    "arabicName": "سُورَةُ القَارِعَةِ",
    "ayahCount": 11
  },
  {
    "number": "102",
    "code": "102",
    "name": "Tekâsür Suresi",
    "arabicName": "سُورَةُ التَّكَاثُرِ",
    "ayahCount": 8
  },
  {
    "number": "103",
    "code": "103",
    "name": "Asr Suresi",
    "arabicName": "سُورَةُ العَصۡرِ",
    "ayahCount": 3
  },
  {
    "number": "104",
    "code": "104",
    "name": "Hümeze Suresi",
    "arabicName": "سُورَةُ الهُمَزَةِ",
    "ayahCount": 9
  },
  {
    "number": "105",
    "code": "105",
    "name": "Fîl Suresi",
    "arabicName": "سُورَةُ الفِيلِ",
    "ayahCount": 5
  },
  {
    "number": "106",
    "code": "106",
    "name": "Kureyş Suresi",
    "arabicName": "سُورَةُ قُرَيۡشٍ",
    "ayahCount": 4
  },
  {
    "number": "107",
    "code": "107",
    "name": "Mâûn Suresi",
    "arabicName": "سُورَةُ المَاعُونِ",
    "ayahCount": 7
  },
  {
    "number": "108",
    "code": "108",
    "name": "Kevser Suresi",
    "arabicName": "سُورَةُ الكَوۡثَرِ",
    "ayahCount": 3
  },
  {
    "number": "109",
    "code": "109",
    "name": "Kâfirûn Suresi",
    "arabicName": "سُورَةُ الكَافِرُونَ",
    "ayahCount": 6
  },
  {
    "number": "110",
    "code": "110",
    "name": "Nasr Suresi",
    "arabicName": "سُورَةُ النَّصۡرِ",
    "ayahCount": 3
  },
  {
    "number": "111",
    "code": "111",
    "name": "Tebbet Suresi",
    "arabicName": "سُورَةُ المَسَدِ",
    "ayahCount": 5
  },
  {
    "number": "112",
    "code": "112",
    "name": "İhlâs Suresi",
    "arabicName": "سُورَةُ الإِخۡلَاصِ",
    "ayahCount": 4
  },
  {
    "number": "113",
    "code": "113",
    "name": "Felak Suresi",
    "arabicName": "سُورَةُ الفَلَقِ",
    "ayahCount": 5
  },
  {
    "number": "114",
    "code": "114",
    "name": "Nâs Suresi",
    "arabicName": "سُورَةُ النَّاسِ",
    "ayahCount": 6
  }
];

export function getSurahAudioUrl(qari: Qari, surah: Surah): string {
  switch (qari.type) {
    case 'archive_ishak':
      return `https://archive.org/download/lifeways11_gmail_001_20180215_2321/${surah.code}.mp3`;
    case 'archive_fatih': {
      const fileName = fatihFilesMap[surah.code] || `${surah.code}.mp3`;
      return `https://archive.org/download/fatihcollakk/${encodeURIComponent(fileName)}`;
    }
    case 'archive_ilhan': {
      const fileName = ilhanFilesMap[surah.code] || `${surah.code}.mp3`;
      return `https://archive.org/download/LhanTokdinle/${encodeURIComponent(fileName)}`;
    }
    case 'archive_tayyar': {
      const fileName = tayyarFilesMap[surah.code] || `${surah.code}.mp3`;
      return `https://archive.org/download/tayyar_altikulac_sure_sure_hatim/${encodeURIComponent(fileName)}`;
    }
    case 'mp3quran':
    default:
      return `https://${qari.server || 'server8'}.mp3quran.net/${qari.slug || 'afs'}/${surah.code}.mp3`;
  }
}
