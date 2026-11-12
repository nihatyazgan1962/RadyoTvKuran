export interface CatalogTvStation {
  id: string;
  name: string;
  url: string;
  category: 'MP4 Video' | 'İslami' | 'Ulusal' | 'Haber' | 'Bölgesel' | 'Spor' | 'Çocuk' | 'Genel';
  isCustom?: boolean;
}

export interface CatalogRadioStation {
  id: string;
  name: string;
  url: string;
  category: "Kur'an" | 'İslami' | 'Ulusal' | 'Bölgesel' | 'Haber' | 'Müzik' | 'Genel';
  freq?: string;
  isCustom?: boolean;
}

export interface CatalogMp4Video {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  category: "Kur'an MP4" | 'Mekke & Medine' | 'İslami & Belgesel' | 'Doğa & Huzur' | 'Özel MP4';
  durationLabel?: string;
  quality?: string;
  isCustom?: boolean;
}

export const tvCategories = [
  { key: 'MP4 Video', label: '🎬 MP4 Video & Görüntülü Yayınlar', icon: '🎬', desc: "Kur'an Tilaveti, Belgesel, Doğa ve MP4 Videoları" },
  { key: 'İslami', label: '🕌 Dini & Tasavvuf TV', icon: '🌙', desc: 'Mekke & Medine Canlı, Diyanet TV, Vav TV, Semerkand...' },
  { key: 'Ulusal', label: '🇹🇷 Ulusal Kanallar (TR)', icon: '📡', desc: 'TRT 1, Star, TV8, Kanal 7, Beyaz TV, 360 TV...' },
  { key: 'Haber', label: '📰 Haber & Gündem TV', icon: '🎙️', desc: 'TRT Haber, NTV, Ülke TV, TVNET, TGRT Haber, Akit TV...' },
  { key: 'Bölgesel', label: '🏙️ Bölgesel & Yerel TV', icon: '🏛️', desc: 'Marmara, Ege, Akdeniz, Karadeniz, İç ve Doğu Anadolu...' },
  { key: 'Spor', label: '⚽ Spor, Belgesel & Müzik TV', icon: '🏆', desc: 'TRT Spor, TRT Belgesel, TGRT Belgesel, TRT Müzik...' },
  { key: 'Çocuk', label: '👶 Çocuk & Aile TV', icon: '🎨', desc: 'TRT Çocuk, TRT Diyanet Çocuk...' },
  { key: 'Tümü', label: '📺 Tüm TV & MP4 Kanalları', icon: '📺', desc: 'Tüm Ulusal, Bölgesel, İslami ve MP4 Kanallar' },
];

export const radioCategories = [
  { key: "Kur'an", label: "📖 Kur'an-ı Kerim Radyoları", icon: '📖', desc: "Diyanet Kur'an, Mealli Kur'an, Kâbe İmamları 7/24 Hatim" },
  { key: 'İslami', label: '🕌 İslami & Tasavvuf Radyoları', icon: '🌙', desc: 'Moral FM, Akra FM, Diyanet Radyo, Dost FM, Erkam...' },
  { key: 'Ulusal', label: '📡 Ulusal & Genel Radyolar', icon: '🇹🇷', desc: 'TRT Radyo 1, Best FM, Alem FM, Show Radyo, Radyo Viva...' },
  { key: 'Haber', label: '📰 Canlı Haber Radyoları', icon: '🎙️', desc: 'TRT Radyo Haber, TRT World Radio...' },
  { key: 'Bölgesel', label: '🏙️ Bölgesel & Yerel Radyolar', icon: '🏛️', desc: 'Dost FM Ankara, Gözyaşı FM Konya, Enderun FM, Nida...' },
  { key: 'Müzik', label: '🎵 Sanat, Türkü & Müzik', icon: '🎶', desc: 'TRT FM, TRT Türkü, TRT Nağme, Kral Pop, Damar FM...' },
  { key: 'Tümü', label: '📻 Tüm Canlı Radyolar', icon: '📻', desc: 'Kesintisiz Tüm Radyo İstasyonları' },
];

export const mp4Categories = [
  { key: "Kur'an MP4", label: "📖 Kur'an-ı Kerim MP4 Videoları", icon: '🕌', desc: 'Görüntülü Sure Tilavetleri, Ayetel Kürsi ve Kısa Sureler MP4' },
  { key: 'Mekke & Medine', label: '🕋 Mekke & Medine MP4 Klipleri', icon: '🌙', desc: 'Kâbe-i Muazzama, Mescid-i Nebevî ve Haremeyn MP4' },
  { key: 'İslami & Belgesel', label: '🎞️ İslami, Kültür & Tefekkür MP4', icon: '📽️', desc: 'Kâinat, Tarih, Medeniyet ve Tefekkür MP4 Belgeselleri' },
  { key: 'Doğa & Huzur', label: '🌿 Doğa & Huzur MP4 Videoları', icon: '🏞️', desc: 'HD Doğa Manzaraları, Vadiler ve Dinlendirici MP4' },
  { key: 'Özel MP4', label: '📂 Eklediğim Özel MP4 Videoları', icon: '➕', desc: 'Kendi eklediğiniz harici .mp4 video bağlantıları' },
  { key: 'Tümü', label: '🎬 Tüm MP4 Videoları', icon: '🎬', desc: 'Tüm MP4 Video Arşivi' },
];

export const quranCategories = [
  { key: 'TR', label: '🇹🇷 Meşhur Türk Hafızlar & Kâriler', icon: '🕌', desc: 'İshak Danış, Fatih Çollak, İlhan Tok, Tayyar Altıkulaç' },
  { key: 'HUZUR', label: '🕊️ Huzur & Huşû Kıraatleri', icon: '🌙', desc: 'Hazza Al-Balushi, Mansoor Al-Salimi, Raad Al-Kurdi, İdris Ebker' },
  { key: 'WORLD', label: '🕋 Kâbe, Medine & Dünya İmamları', icon: '🌍', desc: 'Sudeysi, Muaykili, Alafasy, Abdulbasit, Şureym, Dosari...' },
  { key: 'Tümü', label: '📖 Tüm Seçkin Kâriler (114 Sûre)', icon: '📖', desc: '26 Seçkin Hafızdan 114 Sûre-i Şerif Tilaveti' },
];

export const defaultMp4Catalog: CatalogMp4Video[] = [
  {
    id: 'mp4_kuran_1',
    title: '112. İhlâs Sûresi - Görüntülü Tilavet (MP4)',
    subtitle: 'Arapça Hat & Meal Altyazılı • Hızlı HD MP4 Video',
    url: 'https://archive.org/download/youtube-0wWGJ_GZzQw/0wWGJ_GZzQw.mp4',
    category: "Kur'an MP4",
    durationLabel: '01:05',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_kuran_2',
    title: '6. En\'âm Sûresi Seçme Ayetler - Hani Ar-Rifai (MP4)',
    subtitle: 'Huşû Veren Görüntülü Tilavet • HD MP4',
    url: 'https://archive.org/download/youtube-lHT14tuaGRE/lHT14tuaGRE.mp4',
    category: "Kur'an MP4",
    durationLabel: '03:12',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_kuran_3',
    title: '17. İsrâ Sûresi - Görüntülü Tilavet (MP4)',
    subtitle: 'Ebû Cafer Kıraati • Görüntülü MP4 Formatı',
    url: 'https://archive.org/download/youtube-v0ckopz6q4Y/v0ckopz6q4Y.mp4',
    category: "Kur'an MP4",
    durationLabel: '08:20',
    quality: '720p MP4',
  },
  {
    id: 'mp4_kuran_4',
    title: '51. Zâriyât Sûresi - Saad Al-Ghamdi (MP4)',
    subtitle: 'Görüntülü Hatim ve Meal Eşliğinde MP4',
    url: 'https://archive.org/download/adh-dhariyat-saad-al-ghamdi-ranjbaban/Adh-Dhariyat-Saad-al-Ghamdi.mp4',
    category: "Kur'an MP4",
    durationLabel: '09:45',
    quality: '720p MP4',
  },
  {
    id: 'mp4_kuran_5',
    title: '53. Necm Sûresi - Mahmud Halil el-Husari (MP4)',
    subtitle: 'Yazılı Ayet Takip & Öğretmen Kıraati • MP4 Video',
    url: 'https://archive.org/download/video_quran_by_rewayt_warsh_by_alhosary_sorat_053/video_quran_by_rewayt_warsh_by_alhosary_sorat_053.mp4',
    category: "Kur'an MP4",
    durationLabel: '11:30',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_haremeyn_1',
    title: 'Kâbe-i Muazzama Akşam Namazı - Sudeysi (MP4)',
    subtitle: 'Mekke-i Mükerreme • Mescid-i Haram Canlı Kayıt MP4',
    url: 'https://archive.org/download/January152011MakkahMaghrib/SheikhSudais_Maghrib_1-15-11_512kb.mp4',
    category: 'Mekke & Medine',
    durationLabel: '09:15',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_haremeyn_2',
    title: 'Mescid-i Haram Namaz & Tilavet - Mahir el-Muaykili (MP4)',
    subtitle: 'Kâbe İmamı Mahir el-Muaykili • Haremeyn MP4',
    url: 'https://archive.org/download/February52011MakkahMaghrib/SheikhMuayqali_Maghrib_2-5-11_512kb.mp4',
    category: 'Mekke & Medine',
    durationLabel: '08:50',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_haremeyn_3',
    title: 'Mekke-i Mükerreme Harem-i Şerif - Saad Al-Ghamdi (MP4)',
    subtitle: 'Kâbe Tavaf ve Tilavet Görüntüleri • MP4',
    url: 'https://archive.org/download/June202008MakkahMaghrib/SheikhGhamdiMaghrib062008_512kb.mp4',
    category: 'Mekke & Medine',
    durationLabel: '07:40',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_haremeyn_4',
    title: 'Kâbe-i Muazzama Sabah Namazı Tilaveti (MP4)',
    subtitle: 'Mescid-i Haram Huzur Vakti • MP4 Video',
    url: 'https://archive.org/download/May152011MakkahFajr/SheikhTaalib_Fajr_5-15-11_512kb.mp4',
    category: 'Mekke & Medine',
    durationLabel: '11:10',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_belgesel_1',
    title: 'Evren, Uzay ve Kâinat Tefekkür Belgeseli (MP4)',
    subtitle: 'Gezegenler, Yıldızlar ve İlahi Nizam • HD MP4',
    url: 'https://archive.org/download/Space_0/space3_512kb.mp4',
    category: 'İslami & Belgesel',
    durationLabel: '04:30',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_belgesel_2',
    title: 'Okyanuslar, Denizler ve Canlılar Belgeseli (MP4)',
    subtitle: 'Denizaltı Dünyası ve Doğa Harikaları • HD MP4',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    category: 'İslami & Belgesel',
    durationLabel: '00:46',
    quality: '720p MP4',
  },
  {
    id: 'mp4_doga_1',
    title: 'Çiçeklerin Açılışı & Doğa Huzur Videosu (MP4)',
    subtitle: 'Tefekkür ve Dinlenme Videosu • Hızlı HD MP4',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    category: 'Doğa & Huzur',
    durationLabel: '00:06',
    quality: '1080p MP4',
  },
  {
    id: 'mp4_doga_2',
    title: 'Yeşil Doğa, Ağaçlar ve Bahçe Peyzajı (MP4)',
    subtitle: 'Dinlendirici Doğa Görüntüleri • MP4 Video',
    url: 'https://archive.org/download/landscapemanagement-tape11/Tape11Intro.mp4',
    category: 'Doğa & Huzur',
    durationLabel: '02:15',
    quality: 'HD MP4',
  },
  {
    id: 'mp4_doga_3',
    title: 'Yeşil Vadi & Kısa Animasyon Klip (MP4)',
    subtitle: 'Hızlı Test & Doğa MP4 Formatı',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    category: 'Doğa & Huzur',
    durationLabel: '00:10',
    quality: '720p MP4',
  },
];

export const defaultTvCatalog: CatalogTvStation[] = [
  // MP4 Videolar
  { id: 'tv_mp4_1', name: '112. İhlâs Sûresi Görüntülü Tilavet (MP4)', url: 'https://archive.org/download/youtube-0wWGJ_GZzQw/0wWGJ_GZzQw.mp4', category: 'MP4 Video' },
  { id: 'tv_mp4_2', name: 'En\'âm Sûresi Görüntülü - Hani Ar-Rifai (MP4)', url: 'https://archive.org/download/youtube-lHT14tuaGRE/lHT14tuaGRE.mp4', category: 'MP4 Video' },
  { id: 'tv_mp4_3', name: '17. İsrâ Sûresi Görüntülü Tilavet (MP4)', url: 'https://archive.org/download/youtube-v0ckopz6q4Y/v0ckopz6q4Y.mp4', category: 'MP4 Video' },
  { id: 'tv_mp4_4', name: 'Kâbe-i Muazzama Namaz - Sudeysi (MP4)', url: 'https://archive.org/download/January152011MakkahMaghrib/SheikhSudais_Maghrib_1-15-11_512kb.mp4', category: 'MP4 Video' },
  { id: 'tv_mp4_5', name: 'Okyanus & Kâinat Tefekkür Belgeseli (MP4)', url: 'https://vjs.zencdn.net/v/oceans.mp4', category: 'MP4 Video' },
  { id: 'tv_mp4_6', name: 'Doğa & Çiçekler HD Manzara (MP4)', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', category: 'MP4 Video' },

  // İslami & Dini TV
  { id: 'tv_islami_mekke', name: 'MEKKE TV (Kâbe Canlı)', url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8', category: 'İslami' },
  { id: 'tv_islami_medine', name: 'MEDİNE TV (Mescid-i Nebevî)', url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8', category: 'İslami' },
  { id: 'tv_islami_1', name: 'DİYANET TV HD', url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3bf95a47e07.smil/playlist.m3u8', category: 'İslami' },
  { id: 'tv_islami_2', name: 'VAV TV HD', url: 'https://playlist.fasttvcdn.com/pl/rfrk9821hdy9dayo8wfyha/kltr-sanat-tv/playlist.m3u8', category: 'İslami' },
  { id: 'tv_islami_3', name: 'SEMERKAND TV HD', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtisvwurbfcyslive/broadcast_58d915bd40efc.smil/playlist.m3u8', category: 'İslami' },
  { id: 'tv_islami_4', name: 'LALEGÜL TV HD', url: 'https://lbl.netmedya.net/hls/lalegultv.m3u8', category: 'İslami' },
  { id: 'tv_islami_5', name: 'DOST TV HD', url: 'https://dost.stream.emsal.im/tv/live.m3u8', category: 'İslami' },
  { id: 'tv_islami_6', name: 'REHBER TV HD', url: 'https://cdn4.yayin.com.tr/rehbertv/tracks-v1a1/mono.m3u8', category: 'İslami' },
  { id: 'tv_islami_7', name: 'MELTEM TV HD', url: 'https://vhxyrsly.rocketcdn.com/meltemtv/playlist.m3u8', category: 'İslami' },
  { id: 'tv_islami_8', name: 'ON4 TV HD', url: 'https://edge1.socialsmart.tv/on4/bant1/playlist.m3u8', category: 'İslami' },
  { id: 'tv_islami_9', name: 'QAF TV HD', url: 'https://customer-9vqui33qma2rownb.cloudflarestream.com/7792e558fe54e23bdd4b462ec275cdba/manifest/video.m3u8', category: 'İslami' },

  // Ulusal TV
  { id: 'tv_ulusal_1', name: 'TRT 1 HD', url: 'https://tv-trt1.medya.trt.com.tr/master.m3u8', category: 'Ulusal' },
  { id: 'tv_ulusal_2', name: 'STAR TV HD', url: 'https://dogus.daioncdn.net/startv/startv_720p.m3u8?app=a20ac41e-bdc3-4aa1-934d-26b484480ac9&ce=3&sid=8l4w3lst4co5', category: 'Ulusal' },
  { id: 'tv_ulusal_3', name: 'TV8 HD', url: 'https://tv8.daioncdn.net/tv8/tv8.m3u8?app=7ddc255a-ef47-4e81-ab14-c0e5f2949788&ce=3', category: 'Ulusal' },
  { id: 'tv_ulusal_4', name: 'KANAL 7 HD', url: 'https://kanal7-live.daioncdn.net/kanal7/kanal7.m3u8', category: 'Ulusal' },
  { id: 'tv_ulusal_5', name: 'BEYAZ TV HD', url: 'https://beyaztv-live.daioncdn.net/beyaztv/beyaztv.m3u8', category: 'Ulusal' },
  { id: 'tv_ulusal_6', name: '360 TV HD', url: 'https://turkmedya-live.ercdn.net/tv360/tv360.m3u8', category: 'Ulusal' },
  { id: 'tv_ulusal_7', name: 'TV 4 HD', url: 'https://turkmedya-live.ercdn.net/tv4/tv4.m3u8', category: 'Ulusal' },
  { id: 'tv_ulusal_8', name: 'TRT 2 (Kültür & Sanat)', url: 'https://tv-trt2.medya.trt.com.tr/master.m3u8', category: 'Ulusal' },
  { id: 'tv_ulusal_9', name: 'TRT TÜRK HD', url: 'https://tv-trtturk.medya.trt.com.tr/master.m3u8', category: 'Ulusal' },
  { id: 'tv_ulusal_10', name: 'TRT AVAZ HD', url: 'https://tv-trtavaz.medya.trt.com.tr/master.m3u8', category: 'Ulusal' },
  { id: 'tv_ulusal_11', name: 'TRT KÜRDİ HD', url: 'https://tv-trtkurdi.medya.trt.com.tr/master.m3u8', category: 'Ulusal' },

  // Haber TV
  { id: 'tv_haber_1', name: 'TRT HABER HD', url: 'https://tv-trthaber.medya.trt.com.tr/master.m3u8', category: 'Haber' },
  { id: 'tv_haber_2', name: 'NTV HD', url: 'https://dogus.daioncdn.net/ntv/ntv.m3u8?app=ntv_web', category: 'Haber' },
  { id: 'tv_haber_3', name: 'ÜLKE TV HD', url: 'https://livetv.radyotvonline.net/kanal7live/ulketv/playlist.m3u8', category: 'Haber' },
  { id: 'tv_haber_4', name: 'TVNET HD', url: 'https://tvnet-live.lg.mncdn.com/tvnet/tvnet/playlist.m3u8', category: 'Haber' },
  { id: 'tv_haber_5', name: 'TGRT HABER HD', url: 'https://canli.tgrthaber.com/tgrt.m3u8', category: 'Haber' },
  { id: 'tv_haber_6', name: 'AKİT TV HD', url: 'https://edge1.socialsmart.tv/akittv/bant1/playlist.m3u8', category: 'Haber' },
  { id: 'tv_haber_7', name: 'EKOTÜRK TV HD', url: 'https://edge1.socialsmart.tv/ekoturk/bant1/playlist.m3u8', category: 'Haber' },
  { id: 'tv_haber_8', name: 'TELE 1 HD', url: 'https://edge1.socialsmart.tv/tele1/bant1/playlist.m3u8', category: 'Haber' },
  { id: 'tv_haber_9', name: 'KRT TV HD', url: 'https://edge1.socialsmart.tv/krt/bant1/playlist.m3u8', category: 'Haber' },
  { id: 'tv_haber_10', name: 'FLASH HABER TV HD', url: 'https://edge1.socialsmart.tv/flashhabertv/bant1/playlist.m3u8', category: 'Haber' },
  { id: 'tv_haber_11', name: 'BBN TÜRK HD', url: 'https://edge1.socialsmart.tv/bbnturk/bant1/playlist.m3u8', category: 'Haber' },
  { id: 'tv_haber_12', name: 'TBMM TV (Meclis Canlı)', url: 'https://meclistv-live.ercdn.net/meclistv/meclistv.m3u8', category: 'Haber' },
  { id: 'tv_haber_13', name: 'TRT WORLD HD', url: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8', category: 'Haber' },
  { id: 'tv_haber_14', name: 'TRT ARABİ HD', url: 'https://tv-trtarabi.medya.trt.com.tr/master.m3u8', category: 'Haber' },

  // Bölgesel TV
  { id: 'tv_bolge_kocaeli', name: 'Kocaeli TV (Marmara)', url: 'https://edge.taksimbilisim.com/kocaelitv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_tv264', name: 'TV 264 (Sakarya)', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtdxkkitgbrckilive/broadcast_5ee244263fd6d.smil/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_astv', name: 'AS TV (Bursa)', url: 'https://live.artidijitalmedya.com/artidijital_astv/astv/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_egetv', name: 'Ege TV (İzmir)', url: 'https://edge1.socialsmart.tv/egetv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_kanalv', name: 'Kanal V (Antalya)', url: 'https://edge1.socialsmart.tv/kanalv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_caytv', name: 'Çay TV (Rize / Karadeniz)', url: 'https://edge1.socialsmart.tv/caytv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_kadirga', name: 'Kadırga TV (Trabzon)', url: 'https://edge1.socialsmart.tv/kadirgatv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_konyaolay', name: 'Konya Olay TV', url: 'https://live.artidijitalmedya.com/artidijital_konyaolaytv/konyaolaytv/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_kanal58', name: 'Kanal 58 (Sivas)', url: 'https://edge1.socialsmart.tv/kanal58/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_kanal23', name: 'Kanal 23 (Elazığ)', url: 'https://cdn-kanal23.yayin.com.tr/kanal23/index.m3u8', category: 'Bölgesel' },

  // Spor & Belgesel & Müzik
  { id: 'tv_spor_1', name: 'TRT SPOR HD', url: 'https://tv-trtspor1.medya.trt.com.tr/master.m3u8', category: 'Spor' },
  { id: 'tv_spor_2', name: 'TRT SPOR YILDIZ HD', url: 'https://tv-trtspor2.medya.trt.com.tr/master.m3u8', category: 'Spor' },
  { id: 'tv_spor_3', name: 'TRT BELGESEL HD', url: 'https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8', category: 'Spor' },
  { id: 'tv_spor_4', name: 'TGRT BELGESEL HD', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtsxxkzwwuqtglive/broadcast_5fe462afc6a0e.smil/playlist.m3u8', category: 'Spor' },
  { id: 'tv_spor_5', name: 'TRT MÜZİK HD', url: 'https://tv-trtmuzik.medya.trt.com.tr/master.m3u8', category: 'Spor' },

  // Çocuk
  { id: 'tv_cocuk_1', name: 'TRT DİYANET ÇOCUK HD', url: 'https://tv-trtdiyanetcocuk.medya.trt.com.tr/master.m3u8', category: 'Çocuk' },
  { id: 'tv_cocuk_2', name: 'TRT ÇOCUK HD', url: 'https://tv-trtcocuk.medya.trt.com.tr/master.m3u8', category: 'Çocuk' },
];

export const defaultRadioCatalog: CatalogRadioStation[] = [
  // Kur'an Radyoları
  { id: 'rad_kuran_1', name: "Diyanet Kur'an Radyo", url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c14192aa92.smil/playlist.m3u8', category: "Kur'an", freq: 'FM 104.2' },
  { id: 'rad_kuran_2', name: "Kur'an-ı Kerim (Türkçe Mealli)", url: 'https://qurango.net/radio/translation_quran_turkish', category: "Kur'an", freq: 'FM 98.4' },
  { id: 'rad_kuran_3', name: "Medresetüzzehra Kur'an Radyo", url: 'https://admin.medreseradyo.com/hls/quran/live.m3u8', category: "Kur'an", freq: 'FM 101.0' },
  { id: 'rad_kuran_4', name: "Kur'an (Mishary Rashid Alafasy)", url: 'https://qurango.net/radio/mishary_alafasi', category: "Kur'an", freq: 'FM 99.1' },
  { id: 'rad_kuran_5', name: "Kur'an (Abdulbasit Abdussamed)", url: 'https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad', category: "Kur'an", freq: 'FM 95.5' },
  { id: 'rad_kuran_6', name: "Kur'an (Mahir el-Muaykili)", url: 'https://qurango.net/radio/maher', category: "Kur'an", freq: 'FM 92.8' },
  { id: 'rad_kuran_7', name: "Kur'an (Ahmed el-Acemi)", url: 'https://qurango.net/radio/ahmad_alajmy', category: "Kur'an", freq: 'FM 90.2' },
  { id: 'rad_kuran_8', name: "Kur'an (Mahmud Halil el-Husari)", url: 'https://qurango.net/radio/mahmoud_khalil_alhussary', category: "Kur'an", freq: 'FM 93.4' },
  { id: 'rad_kuran_9', name: "Kur'an (Ali el-Huzeyfi)", url: 'https://qurango.net/radio/ali_alhuthaifi', category: "Kur'an", freq: 'FM 96.0' },
  { id: 'rad_kuran_12', name: "Kur'an (Muhammed Sıddık Minşevi)", url: 'https://qurango.net/radio/mohammed_siddiq_alminshawi', category: "Kur'an", freq: 'FM 102.6' },
  { id: 'rad_kuran_13', name: "Kur'an (Suud eş-Şureym)", url: 'https://qurango.net/radio/saud_alshuraim', category: "Kur'an", freq: 'FM 105.4' },
  { id: 'rad_kuran_14', name: "Kur'an (Yasser Al-Dosari)", url: 'https://qurango.net/radio/yasser_aldosari', category: "Kur'an", freq: 'FM 106.8' },

  // İslami Radyolar
  { id: 'rad_islami_1', name: 'Moral FM', url: 'https://stream.zeno.fm/0cfiqwdkobavv', category: 'İslami', freq: 'FM 105.0' },
  { id: 'rad_islami_5', name: 'Diyanet Radyo', url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8', category: 'İslami', freq: 'FM 102.8' },
  { id: 'rad_islami_6', name: 'Diyanet Risalet Radyo', url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1520b2626.smil/playlist.m3u8', category: 'İslami', freq: 'FM 103.4' },
  { id: 'rad_islami_7', name: 'Akra FM', url: 'https://d3r5bwwuab2v60.cloudfront.net/akracanli2/_definst_/livestream_aac/playlist.m3u8', category: 'İslami', freq: 'FM 107.6' },
  { id: 'rad_islami_8', name: 'Erkam Radyo', url: 'https://api-tv5.yayin.com.tr:8002/mp3', category: 'İslami', freq: 'FM 96.8' },
  { id: 'rad_islami_9', name: 'Dost FM', url: 'http://yayin.dostfm.com:8920/stream', category: 'İslami', freq: 'FM 89.2' },
  { id: 'rad_islami_10', name: 'Enderun FM', url: 'http://yayin2.canliyayin.org:7052/;*.mp3', category: 'İslami', freq: 'FM 88.2' },
  { id: 'rad_islami_11', name: 'Gözyaşı FM', url: 'http://yayin1.canliyayin.org:8700/;*.mp3', category: 'İslami', freq: 'FM 97.5' },
  { id: 'rad_islami_13', name: 'Semerkand Radyo', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtisvwurbfcyslive/broadcast_58d915bd40efc.smil/playlist.m3u8', category: 'İslami', freq: 'FM 105.8' },
  { id: 'rad_islami_14', name: 'Vav Radyo', url: 'https://playlist.fasttvcdn.com/pl/rfrk9821hdy9dayo8wfyha/kltr-sanat-tv/playlist.m3u8', category: 'İslami', freq: 'FM 105.2' },

  // Ulusal & Haber & Bölgesel & Müzik
  { id: 'rad_ulusal_1', name: 'TRT Radyo 1', url: 'https://rd-trtradyo1.medya.trt.com.tr/master.m3u8', category: 'Ulusal', freq: 'FM 95.6' },
  { id: 'rad_ulusal_2', name: 'Best FM', url: 'http://37.247.98.8/stream/bestfm', category: 'Ulusal', freq: 'FM 98.4' },
  { id: 'rad_ulusal_3', name: 'Alem FM', url: 'https://turkmedya.radyotvonline.net/alemfmaac', category: 'Ulusal', freq: 'FM 89.2' },
  { id: 'rad_ulusal_4', name: 'Show Radyo', url: 'https://showradyo.radyotvonline.net/showradyoaac', category: 'Ulusal', freq: 'FM 89.8' },
  { id: 'rad_haber_1', name: 'TRT Radyo Haber', url: 'https://rd-trtradyohaber.medya.trt.com.tr/master.m3u8', category: 'Haber', freq: 'FM 95.0' },
  { id: 'rad_bolge_1', name: 'Dost FM (Ankara)', url: 'http://yayin.dostfm.com:8920/stream', category: 'Bölgesel', freq: 'FM 91.2' },
  { id: 'rad_bolge_2', name: 'Gözyaşı FM (Konya)', url: 'http://yayin1.canliyayin.org:8700/;*.mp3', category: 'Bölgesel', freq: 'FM 97.5' },
  { id: 'rad_bolge_4', name: 'Nida Radyo (Karadeniz)', url: 'https://anadolu.liderhost.com.tr:8106/stream', category: 'Bölgesel', freq: 'FM 94.0' },
  { id: 'rad_muzik_1', name: 'TRT FM', url: 'https://rd-trtfm.medya.trt.com.tr/master.m3u8', category: 'Müzik', freq: 'FM 91.4' },
  { id: 'rad_muzik_2', name: 'TRT Türkü', url: 'https://rd-trtturku.medya.trt.com.tr/master.m3u8', category: 'Müzik', freq: 'FM 103.4' },
  { id: 'rad_muzik_3', name: 'TRT Nağme', url: 'https://rd-trtnagme.medya.trt.com.tr/master.m3u8', category: 'Müzik', freq: 'FM 101.6' },
];

