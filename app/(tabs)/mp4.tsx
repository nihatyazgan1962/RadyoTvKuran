import {
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sleepTimer } from '@/utils/sleepTimer';
import { playbackCoordinator } from '@/utils/playbackCoordinator';
import { Qari, Surah, qarisList, surahsList, getSurahAudioUrl } from '@/constants/quranData';

export interface MediaHubItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  mediaType: 'mp4' | 'tv' | 'radio' | 'quran';
  category:
    | "Kur'an MP4"
    | 'Mekke & Medine MP4'
    | 'İslami & Belgesel MP4'
    | 'Canlı TV'
    | 'Canlı Radyo'
    | "Kur'an 114 Sure"
    | 'Özel Eklenen';
  subGroup?: string;
  durationLabel?: string;
  formatBadge: 'MP4 HD' | '1080p MP4' | 'CANLI TV' | 'CANLI RADYO' | "KUR'AN MP3";
  arabicTitle?: string;
  isCustom?: boolean;
}

type HubPlayMode = 'sequence' | 'loopOne' | 'shuffle';
type HubTabKey = 'ALL' | 'MP4' | 'TV' | 'RADIO' | 'QURAN' | 'CUSTOM';

export const builtInMediaItems: MediaHubItem[] = [
  // ==========================================
  // 1. GÖRÜNTÜLÜ KUR'AN-I KERİM & MEKKE MP4 VİDEOLARI
  // ==========================================
  {
    id: 'mp4_kuran_ihlas',
    title: '112. İhlâs Sûresi - Görüntülü Tilavet (MP4)',
    subtitle: 'Arapça Hat & Meal Altyazılı • Hızlı HD MP4 Video',
    url: 'https://archive.org/download/youtube-0wWGJ_GZzQw/0wWGJ_GZzQw.mp4',
    mediaType: 'mp4',
    category: "Kur'an MP4",
    subGroup: 'Görüntülü Sureler (MP4)',
    durationLabel: '01:05',
    formatBadge: 'MP4 HD',
    arabicTitle: 'سورة الإخلاص',
  },
  {
    id: 'mp4_kuran_enam',
    title: '6. En\'âm Sûresi Seçme Ayetler - Hani Ar-Rifai (MP4)',
    subtitle: 'Huşû Veren Görüntülü Tilavet • HD MP4',
    url: 'https://archive.org/download/youtube-lHT14tuaGRE/lHT14tuaGRE.mp4',
    mediaType: 'mp4',
    category: "Kur'an MP4",
    subGroup: 'Görüntülü Sureler (MP4)',
    durationLabel: '03:12',
    formatBadge: 'MP4 HD',
    arabicTitle: 'سورة الأنعام',
  },
  {
    id: 'mp4_kuran_isra',
    title: '17. İsrâ Sûresi - Görüntülü Tilavet (MP4)',
    subtitle: 'Ebû Cafer Kıraati • Görüntülü MP4 Formatı',
    url: 'https://archive.org/download/youtube-v0ckopz6q4Y/v0ckopz6q4Y.mp4',
    mediaType: 'mp4',
    category: "Kur'an MP4",
    subGroup: 'Görüntülü Sureler (MP4)',
    durationLabel: '08:20',
    formatBadge: 'MP4 HD',
    arabicTitle: 'سورة الإسراء',
  },
  {
    id: 'mp4_kuran_zariyat',
    title: '51. Zâriyât Sûresi - Saad Al-Ghamdi (MP4)',
    subtitle: 'Görüntülü Hatim ve Meal Eşliğinde MP4',
    url: 'https://archive.org/download/adh-dhariyat-saad-al-ghamdi-ranjbaban/Adh-Dhariyat-Saad-al-Ghamdi.mp4',
    mediaType: 'mp4',
    category: "Kur'an MP4",
    subGroup: 'Görüntülü Sureler (MP4)',
    durationLabel: '09:45',
    formatBadge: 'MP4 HD',
    arabicTitle: 'سورة الذاريات',
  },
  {
    id: 'mp4_kuran_necm',
    title: '53. Necm Sûresi - Mahmud Halil el-Husari (MP4)',
    subtitle: 'Yazılı Ayet Takip & Öğretmen Kıraati • MP4 Video',
    url: 'https://archive.org/download/video_quran_by_rewayt_warsh_by_alhosary_sorat_053/video_quran_by_rewayt_warsh_by_alhosary_sorat_053.mp4',
    mediaType: 'mp4',
    category: "Kur'an MP4",
    subGroup: 'Görüntülü Sureler (MP4)',
    durationLabel: '11:30',
    formatBadge: 'MP4 HD',
    arabicTitle: 'سورة النجم',
  },
  {
    id: 'mp4_haremeyn_kabe',
    title: 'Kâbe-i Muazzama Akşam Namazı - Sudeysi (MP4)',
    subtitle: 'Mekke-i Mükerreme • Mescid-i Haram Canlı Kayıt MP4',
    url: 'https://archive.org/download/January152011MakkahMaghrib/SheikhSudais_Maghrib_1-15-11_512kb.mp4',
    mediaType: 'mp4',
    category: 'Mekke & Medine MP4',
    subGroup: 'Haremeyn MP4',
    durationLabel: '09:15',
    formatBadge: 'MP4 HD',
    arabicTitle: 'المسجد الحرام',
  },
  {
    id: 'mp4_haremeyn_muaykili',
    title: 'Mescid-i Haram Namaz & Tilavet - Mahir el-Muaykili (MP4)',
    subtitle: 'Kâbe İmamı Mahir el-Muaykili • Haremeyn MP4',
    url: 'https://archive.org/download/February52011MakkahMaghrib/SheikhMuayqali_Maghrib_2-5-11_512kb.mp4',
    mediaType: 'mp4',
    category: 'Mekke & Medine MP4',
    subGroup: 'Haremeyn MP4',
    durationLabel: '08:50',
    formatBadge: 'MP4 HD',
    arabicTitle: 'مكة المكرمة',
  },
  {
    id: 'mp4_belgesel_kainat',
    title: 'Evren, Uzay ve Kâinat Tefekkür Belgeseli (MP4)',
    subtitle: 'Yüksek Çözünürlüklü MP4 Belgesel Akışı',
    url: 'https://archive.org/download/Space_0/space3_512kb.mp4',
    mediaType: 'mp4',
    category: 'İslami & Belgesel MP4',
    subGroup: 'Belgesel & Doğa MP4',
    durationLabel: '04:30',
    formatBadge: '1080p MP4',
  },
  {
    id: 'mp4_doga_vadiler',
    title: 'Okyanuslar, Denizler ve Doğa Harikaları (MP4)',
    subtitle: 'Tefekkür ve Dinlenme Videosu • HD MP4',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    mediaType: 'mp4',
    category: 'İslami & Belgesel MP4',
    subGroup: 'Belgesel & Doğa MP4',
    durationLabel: '00:46',
    formatBadge: '1080p MP4',
  },
  {
    id: 'mp4_doga_ufuk',
    title: 'Çiçeklerin Açılışı & Doğa Huzur Videosu (MP4)',
    subtitle: 'Hızlı HD MP4 Video Formatı',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    mediaType: 'mp4',
    category: 'İslami & Belgesel MP4',
    subGroup: 'Belgesel & Doğa MP4',
    durationLabel: '00:06',
    formatBadge: '1080p MP4',
  },

  // ==========================================
  // 2. CANLI TV KANALLARI (YERLEŞİK TV REHBERİ)
  // ==========================================
  {
    id: 'hub_tv_mekke',
    title: 'MEKKE TV (Kâbe-i Muazzama Canlı)',
    subtitle: '7/24 Mescid-i Haram Canlı Yayın • İslami TV',
    url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'İslami & Haremeyn TV',
    formatBadge: 'CANLI TV',
    arabicTitle: 'قناة القرآن الكريم',
  },
  {
    id: 'hub_tv_medine',
    title: 'MEDİNE TV (Mescid-i Nebevî Canlı)',
    subtitle: '7/24 Ravza-i Mutahhara Canlı Yayın • İslami TV',
    url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'İslami & Haremeyn TV',
    formatBadge: 'CANLI TV',
    arabicTitle: 'قناة السنة النبوية',
  },
  {
    id: 'hub_tv_diyanet',
    title: 'DİYANET TV HD',
    subtitle: 'Diyanet İşleri Başkanlığı Resmi TV Kanalı',
    url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3bf95a47e07.smil/playlist.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'İslami & Haremeyn TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_vav',
    title: 'VAV TV HD',
    subtitle: "Kur'an, İslam Kültür ve Medeniyet Kanalı",
    url: 'https://playlist.fasttvcdn.com/pl/rfrk9821hdy9dayo8wfyha/kltr-sanat-tv/playlist.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'İslami & Haremeyn TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_semerkand',
    title: 'SEMERKAND TV HD',
    subtitle: 'Tasavvuf, Sohbet ve Aile Kanalı',
    url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtisvwurbfcyslive/broadcast_58d915bd40efc.smil/playlist.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'İslami & Haremeyn TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_lalegul',
    title: 'LALEGÜL TV HD',
    subtitle: 'Sohbet, İlim ve İrfan Yayınları',
    url: 'https://lbl.netmedya.net/hls/lalegultv.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'İslami & Haremeyn TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_dost',
    title: 'DOST TV HD',
    subtitle: 'İslami Sohbet, Kur’an ve Kültür TV',
    url: 'https://dost.stream.emsal.im/tv/live.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'İslami & Haremeyn TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_rehber',
    title: 'REHBER TV HD',
    subtitle: 'Dini, Haber ve Kültür Yayınları',
    url: 'https://cdn4.yayin.com.tr/rehbertv/tracks-v1a1/mono.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'İslami & Haremeyn TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_trt1',
    title: 'TRT 1 HD',
    subtitle: 'Türkiye Radyo Televizyon Kurumu • Ulusal TV',
    url: 'https://tv-trt1.medya.trt.com.tr/master.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Ulusal & Haber TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_trthaber',
    title: 'TRT HABER HD',
    subtitle: '7/24 Sıcak Gündem ve Haber Yayını',
    url: 'https://tv-trthaber.medya.trt.com.tr/master.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Ulusal & Haber TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_kanal7',
    title: 'KANAL 7 HD',
    subtitle: 'Ulusal & Aile Televizyonu',
    url: 'https://kanal7-live.daioncdn.net/kanal7/kanal7.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Ulusal & Haber TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_ulke',
    title: 'ÜLKE TV HD',
    subtitle: 'Haber, Analiz ve Gündem TV',
    url: 'https://livetv.radyotvonline.net/kanal7live/ulketv/playlist.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Ulusal & Haber TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_tvnet',
    title: 'TVNET HD',
    subtitle: 'Haber ve Belgesel Kanalı',
    url: 'https://tvnet-live.lg.mncdn.com/tvnet/tvnet/playlist.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Ulusal & Haber TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_tgrthaber',
    title: 'TGRT HABER HD',
    subtitle: 'Canlı Haber ve Ekonomi Yayını',
    url: 'https://canli.tgrthaber.com/tgrt.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Ulusal & Haber TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_ntv',
    title: 'NTV HD',
    subtitle: 'Ulusal Haber ve Belgesel Kanalı',
    url: 'https://dogus.daioncdn.net/ntv/ntv.m3u8?app=ntv_web',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Ulusal & Haber TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_trtbelgesel',
    title: 'TRT BELGESEL HD',
    subtitle: 'Doğa, Tarih, Kültür ve Keşif Belgeselleri',
    url: 'https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Belgesel, Spor & Çocuk TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_trtspor',
    title: 'TRT SPOR HD',
    subtitle: 'Canlı Spor Karşılaşmaları ve Gündemi',
    url: 'https://tv-trtspor1.medya.trt.com.tr/master.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Belgesel, Spor & Çocuk TV',
    formatBadge: 'CANLI TV',
  },
  {
    id: 'hub_tv_trtdiyanetcocuk',
    title: 'TRT DİYANET ÇOCUK HD',
    subtitle: 'Çocuklar İçin Değerler Eğitimi & Çizgi Film',
    url: 'https://tv-trtdiyanetcocuk.medya.trt.com.tr/master.m3u8',
    mediaType: 'tv',
    category: 'Canlı TV',
    subGroup: 'Belgesel, Spor & Çocuk TV',
    formatBadge: 'CANLI TV',
  },

  // ==========================================
  // 3. CANLI RADYO KANALLARI (YERLEŞİK RADYO REHBERİ)
  // ==========================================
  {
    id: 'hub_rad_diyanet_kuran',
    title: "Diyanet Kur'an Radyo",
    subtitle: "7/24 Kesintisiz Kur'an-ı Kerim ve Meal Yayını",
    url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c14192aa92.smil/playlist.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: "Kur'an Radyoları",
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_kuran_mealli',
    title: "Kur'an-ı Kerim Radyosu (Türkçe Mealli)",
    subtitle: '24 Saat Arapça Tilavet ve Türkçe Meal',
    url: 'https://qurango.net/radio/translation_quran_turkish',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: "Kur'an Radyoları",
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_medrese_kuran',
    title: "Medresetüzzehra Kur'an Radyo",
    subtitle: 'Kesintisiz Hatim ve Tilavet Yayını',
    url: 'https://admin.medreseradyo.com/hls/quran/live.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: "Kur'an Radyoları",
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_alafasy',
    title: "Kur'an Radyo (Mishary Rashid Alafasy)",
    subtitle: '7/24 Mishary Alafasy Hatim Yayını',
    url: 'https://qurango.net/radio/mishary_alafasi',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: "Kur'an Radyoları",
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_abdulbasit',
    title: "Kur'an Radyo (Abdulbasit Abdussamed)",
    subtitle: 'Mısır Efsane Kıraat • 7/24 Canlı Radyo',
    url: 'https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: "Kur'an Radyoları",
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_maher',
    title: "Kur'an Radyo (Mahir el-Muaykili)",
    subtitle: 'Kâbe İmamı • 7/24 Kesintisiz Tilavet',
    url: 'https://qurango.net/radio/maher',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: "Kur'an Radyoları",
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_diyanet',
    title: 'Diyanet Radyo',
    subtitle: 'İslami Sohbet, İlahi ve Kültür Radyosu',
    url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_risalet',
    title: 'Diyanet Risalet Radyo',
    subtitle: 'Siyer-i Nebi, Hadis ve Asr-ı Saadet Yayınları',
    url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1520b2626.smil/playlist.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_moral',
    title: 'Moral FM',
    subtitle: 'İslami Sohbet, Tefsir ve Gündem Radyosu',
    url: 'https://stream.zeno.fm/0cfiqwdkobavv',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_akra',
    title: 'Akra FM',
    subtitle: 'İlim, Kültür, Tasavvuf ve Eğitim Yayınları',
    url: 'https://d3r5bwwuab2v60.cloudfront.net/akracanli2/_definst_/livestream_aac/playlist.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_erkam',
    title: 'Erkam Radyo',
    subtitle: 'Tasavvuf, Sohbet ve İrfan Radyosu',
    url: 'https://api-tv5.yayin.com.tr:8002/mp3',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_semerkand',
    title: 'Semerkand Radyo',
    subtitle: 'Gönül Frekansı • Sohbet & İlahi',
    url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtisvwurbfcyslive/broadcast_58d915bd40efc.smil/playlist.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_trtradyo1',
    title: 'TRT Radyo 1',
    subtitle: 'Ulusal Haber, Kültür ve Eğitim Radyosu',
    url: 'https://rd-trtradyo1.medya.trt.com.tr/master.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_trtturku',
    title: 'TRT Türkü',
    subtitle: 'Anadolu Halk Müziği ve Türkülerimiz',
    url: 'https://rd-trtturku.medya.trt.com.tr/master.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
  {
    id: 'hub_rad_trtnagme',
    title: 'TRT Nağme',
    subtitle: 'Türk Sanat Müziği Seçkin Eserleri',
    url: 'https://rd-trtnagme.medya.trt.com.tr/master.m3u8',
    mediaType: 'radio',
    category: 'Canlı Radyo',
    subGroup: 'İslami & Ulusal Radyolar',
    formatBadge: 'CANLI RADYO',
  },
];

export default function Mp4Screen() {
  const [customItems, setCustomItems] = useState<MediaHubItem[]>([]);
  const [activeTab, setActiveTab] = useState<HubTabKey>('ALL');
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [selectedQari, setSelectedQari] = useState<Qari>(qarisList[0]);
  const [selectedItem, setSelectedItem] = useState<MediaHubItem>(builtInMediaItems[0]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [playMode, setPlayMode] = useState<HubPlayMode>('sequence');
  const [showControls, setShowControls] = useState(true);
  const [eqBars, setEqBars] = useState<number[]>([14, 28, 20, 34, 18, 26, 36, 22, 30, 16, 24, 32]);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoViewRef = useRef<VideoView | null>(null);
  const hasHandledEndRef = useRef(false);

  // Add / Quick Play Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'mp4' | 'tv' | 'radio'>('mp4');

  // Qari Picker Modal for 114 Surahs
  const [qariModalVisible, setQariModalVisible] = useState(false);

  // Sleep Timer
  const [sleepSeconds, setSleepSeconds] = useState<number>(sleepTimer.getRemainingSeconds());
  const [sleepModalVisible, setSleepModalVisible] = useState(false);

  useEffect(() => {
    const unsub = sleepTimer.subscribe((sec) => setSleepSeconds(sec));
    return () => unsub();
  }, []);

  // Build 114 Surah items dynamically for the selected Qari
  const quranSurahItems: MediaHubItem[] = surahsList.map((surah: Surah) => ({
    id: `hub_quran_${selectedQari.id}_${surah.code}`,
    title: `${surah.number}. ${surah.name} Sûresi`,
    subtitle: `${selectedQari.name} • ${surah.ayahCount} Ayet-i Kerime`,
    url: getSurahAudioUrl(selectedQari, surah),
    mediaType: 'quran',
    category: "Kur'an 114 Sure",
    subGroup: selectedQari.name,
    formatBadge: "KUR'AN MP3",
    arabicTitle: surah.arabicName,
  }));

  const allItems: MediaHubItem[] = [...customItems, ...builtInMediaItems, ...quranSurahItems];

  const filteredItems = allItems.filter((item) => {
    const matchesTab =
      activeTab === 'ALL'
        ? item.mediaType !== 'quran' ||
          item.id.endsWith('_001') ||
          item.id.endsWith('_036') ||
          item.id.endsWith('_055') ||
          item.id.endsWith('_067')
        : activeTab === 'MP4'
          ? item.mediaType === 'mp4'
          : activeTab === 'TV'
            ? item.mediaType === 'tv'
            : activeTab === 'RADIO'
              ? item.mediaType === 'radio'
              : activeTab === 'QURAN'
                ? item.mediaType === 'quran' || item.category === "Kur'an MP4"
                : Boolean(item.isCustom);

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.arabicTitle && item.arabicTitle.includes(searchQuery));

    return matchesTab && matchesSearch;
  });

  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4500);
  };

  const handlePlayerTap = () => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      resetControlsTimer();
    }
  };

  const loadCustomMedia = async () => {
    try {
      const stored = await AsyncStorage.getItem('customMp4Videos');
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized: MediaHubItem[] = parsed.map((p: any) => ({
          id: p.id || 'custom_' + Date.now().toString(),
          title: p.title || p.name || 'Özel Medya',
          subtitle: p.subtitle || 'Kullanıcı Eklenen Yayın',
          url: p.url,
          mediaType: p.mediaType || 'mp4',
          category: 'Özel Eklenen',
          formatBadge: p.mediaType === 'tv' ? 'CANLI TV' : p.mediaType === 'radio' ? 'CANLI RADYO' : 'MP4 HD',
          isCustom: true,
        }));
        setCustomItems(normalized);
      } else {
        setCustomItems([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCustomMedia();
    }, [])
  );

  // Video player (for MP4 & Live TV)
  const videoPlayer = useVideoPlayer(activeVideoUrl, (p) => {
    p.loop = playMode === 'loopOne';
    p.staysActiveInBackground = true;
    p.showNowPlayingNotification = true;
    p.playbackRate = playbackSpeed;
    if (activeVideoUrl) {
      p.play();
    }
  });

  // Audio player (for Live Radio & 114 Surahs Quran)
  const audioPlayer = useAudioPlayer(activeAudioUrl);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  const isVideoMode = selectedItem.mediaType === 'mp4' || selectedItem.mediaType === 'tv';

  const playMediaItem = (item: MediaHubItem) => {
    playbackCoordinator.notifyActive('mp4');
    hasHandledEndRef.current = false;
    setSelectedItem(item);

    if (item.mediaType === 'mp4' || item.mediaType === 'tv') {
      // Stop audio player if running
      if (audioPlayer) {
        try {
          audioPlayer.pause();
          audioPlayer.setActiveForLockScreen(false);
        } catch {}
      }
      setActiveAudioUrl(null);
      if (activeVideoUrl === item.url && videoPlayer) {
        videoPlayer.replay();
        videoPlayer.play();
      } else {
        setActiveVideoUrl(item.url);
      }
      setIsPlaying(true);
    } else {
      // Stop video player if running
      if (videoPlayer) {
        try {
          videoPlayer.pause();
        } catch {}
      }
      setActiveVideoUrl(null);
      setActiveAudioUrl(item.url);
      setIsPlaying(true);
    }
    resetControlsTimer();
  };

  useEffect(() => {
    if (activeVideoUrl && videoPlayer) {
      playbackCoordinator.notifyActive('mp4');
      try {
        videoPlayer.play();
      } catch {}
    }
  }, [activeVideoUrl, videoPlayer]);

  useEffect(() => {
    if (activeAudioUrl && audioPlayer) {
      playbackCoordinator.notifyActive('mp4');
      audioPlayer.play();
      try {
        audioPlayer.setActiveForLockScreen(true, {
          title: selectedItem.title,
          artist: selectedItem.subtitle,
        });
      } catch {}
    }
  }, [activeAudioUrl, audioPlayer, selectedItem]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(console.error);

    const unsubSleep = sleepTimer.onExpire(() => {
      try {
        videoPlayer?.pause();
        audioPlayer?.pause();
        setIsPlaying(false);
      } catch {}
    });

    const unsubCoord = playbackCoordinator.register('mp4', () => {
      try {
        videoPlayer?.pause();
        audioPlayer?.pause();
        setIsPlaying(false);
      } catch {}
    });

    return () => {
      unsubSleep();
      unsubCoord();
    };
  }, [videoPlayer, audioPlayer]);

  const playNextItem = () => {
    const list = filteredItems.length > 0 ? filteredItems : allItems;
    if (!list.length) return;
    const currentIndex = list.findIndex((i) => i.id === selectedItem.id);
    if (playMode === 'shuffle' && list.length > 1) {
      const nextIndex = (currentIndex + 3) % list.length;
      playMediaItem(list[nextIndex]);
      return;
    }
    const nextIndex = (currentIndex + 1) % list.length;
    playMediaItem(list[nextIndex]);
  };

  const playPrevItem = () => {
    const list = filteredItems.length > 0 ? filteredItems : allItems;
    if (!list.length) return;
    const currentIndex = list.findIndex((i) => i.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    playMediaItem(list[prevIndex]);
  };

  // Poll status for both Video and Audio modes + animate equalizer
  useEffect(() => {
    const interval = setInterval(() => {
      if (isVideoMode && videoPlayer && activeVideoUrl) {
        try {
          const playingNow = Boolean(videoPlayer.playing);
          const cur = Number(videoPlayer.currentTime || 0);
          const dur = Number(videoPlayer.duration || 0);
          setIsPlaying(playingNow);
          setCurrentTime(cur);
          setDuration(dur);

          if (
            selectedItem.mediaType === 'mp4' &&
            dur > 1 &&
            cur >= dur - 0.6 &&
            !playingNow &&
            !hasHandledEndRef.current
          ) {
            hasHandledEndRef.current = true;
            if (playMode === 'loopOne') {
              videoPlayer.replay();
              videoPlayer.play();
              hasHandledEndRef.current = false;
            } else {
              playNextItem();
            }
          } else if (cur < dur - 1.5) {
            hasHandledEndRef.current = false;
          }
        } catch {}
      } else if (!isVideoMode && activeAudioUrl) {
        const playingNow = Boolean(audioStatus.playing);
        const cur = Number(audioStatus.currentTime || 0);
        const dur = Number(audioStatus.duration || 0);
        setIsPlaying(playingNow);
        setCurrentTime(cur);
        setDuration(dur);

        if (playingNow) {
          setEqBars((prev) => prev.map((_, idx) => ((idx * 7 + Math.floor(cur * 10)) % 26) + 10));
        }

        if (audioStatus.didJustFinish && !hasHandledEndRef.current) {
          hasHandledEndRef.current = true;
          if (playMode === 'loopOne') {
            audioPlayer.seekTo(0);
            audioPlayer.play();
            hasHandledEndRef.current = false;
          } else {
            playNextItem();
          }
        } else if (!audioStatus.didJustFinish) {
          hasHandledEndRef.current = false;
        }
      }
    }, 300);

    return () => clearInterval(interval);
  });

  const togglePlayPause = () => {
    if (isVideoMode) {
      if (!activeVideoUrl) {
        playMediaItem(selectedItem);
        return;
      }
      try {
        if (videoPlayer.playing) {
          videoPlayer.pause();
          setIsPlaying(false);
        } else {
          playbackCoordinator.notifyActive('mp4');
          videoPlayer.play();
          setIsPlaying(true);
        }
      } catch {}
    } else {
      if (!activeAudioUrl) {
        playMediaItem(selectedItem);
        return;
      }
      try {
        if (audioStatus.playing) {
          audioPlayer.pause();
          setIsPlaying(false);
        } else {
          playbackCoordinator.notifyActive('mp4');
          audioPlayer.play();
          setIsPlaying(true);
        }
      } catch {}
    }
    resetControlsTimer();
  };

  const seekBySeconds = (delta: number) => {
    if (isVideoMode && videoPlayer && activeVideoUrl) {
      try {
        videoPlayer.seekBy(delta);
        setCurrentTime(Math.max(0, Math.min(duration || 99999, (videoPlayer.currentTime || 0) + delta)));
      } catch {}
    } else if (!isVideoMode && audioPlayer && activeAudioUrl) {
      try {
        const nextPos = Math.max(0, Math.min(duration || 99999, (audioStatus.currentTime || 0) + delta));
        audioPlayer.seekTo(nextPos);
        setCurrentTime(nextPos);
      } catch {}
    }
    resetControlsTimer();
  };

  const seekToPercent = (percent: number) => {
    if (duration <= 0) return;
    const target = Math.max(0, Math.min(duration, (percent / 100) * duration));
    if (isVideoMode && videoPlayer && activeVideoUrl) {
      try {
        const delta = target - Number(videoPlayer.currentTime || 0);
        videoPlayer.seekBy(delta);
        setCurrentTime(target);
      } catch {}
    } else if (!isVideoMode && audioPlayer && activeAudioUrl) {
      try {
        audioPlayer.seekTo(target);
        setCurrentTime(target);
      } catch {}
    }
    resetControlsTimer();
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoPlayer) {
      try {
        Object.assign(videoPlayer, { playbackRate: nextSpeed });
      } catch {}
    }
    resetControlsTimer();
  };

  const cyclePlayMode = () => {
    const modes: HubPlayMode[] = ['sequence', 'loopOne', 'shuffle'];
    const next = modes[(modes.indexOf(playMode) + 1) % modes.length];
    setPlayMode(next);
    if (videoPlayer) {
      try {
        Object.assign(videoPlayer, { loop: next === 'loopOne' });
      } catch {}
    }
    resetControlsTimer();
  };

  const handleAddMedia = async (playImmediately = false) => {
    if (!newUrl.trim()) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir MP4, TV (m3u8) veya Radyo (mp3) linki giriniz.');
      return;
    }
    const cleanUrl = newUrl.trim();
    const cleanTitle =
      newTitle.trim() ||
      (newMediaType === 'mp4' ? 'Özel MP4 Video' : newMediaType === 'tv' ? 'Özel Canlı TV' : 'Özel Radyo');
    const cleanSub =
      newSubtitle.trim() ||
      (newMediaType === 'mp4'
        ? 'Kullanıcı MP4 Video Akışı'
        : newMediaType === 'tv'
          ? 'Kullanıcı Canlı TV Akışı'
          : 'Kullanıcı Canlı Radyo Akışı');

    const newItem: MediaHubItem = {
      id: 'custom_mp4_' + Date.now().toString(),
      title: cleanTitle,
      subtitle: cleanSub,
      url: cleanUrl,
      mediaType: newMediaType,
      category: 'Özel Eklenen',
      formatBadge:
        newMediaType === 'tv' ? 'CANLI TV' : newMediaType === 'radio' ? 'CANLI RADYO' : 'MP4 HD',
      isCustom: true,
    };

    try {
      const stored = await AsyncStorage.getItem('customMp4Videos');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newItem);
      await AsyncStorage.setItem('customMp4Videos', JSON.stringify(list));

      setCustomItems([newItem, ...customItems]);
      setNewTitle('');
      setNewSubtitle('');
      setNewUrl('');
      setAddModalVisible(false);

      if (playImmediately) {
        playMediaItem(newItem);
      } else {
        Alert.alert('Başarılı', `${cleanTitle} kütüphanenize eklendi.`);
      }
    } catch {
      Alert.alert('Hata', 'Kayıt eklenemedi.');
    }
  };

  const deleteCustomItem = async (id: string) => {
    Alert.alert('Kaydı Sil', 'Bu özel yayını silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const stored = await AsyncStorage.getItem('customMp4Videos');
            if (stored) {
              const updated = JSON.parse(stored).filter((v: any) => v.id !== id);
              await AsyncStorage.setItem('customMp4Videos', JSON.stringify(updated));
              setCustomItems(customItems.filter((v) => v.id !== id));
            }
          } catch {}
        },
      },
    ]);
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec) || sec < 0) return '00:00';
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const getModeLabel = () => {
    if (playMode === 'loopOne') return '🔁 Tekrar';
    if (playMode === 'shuffle') return '🔀 Karışık';
    return '➡️ Sırayla';
  };

  const hubTabs: { key: HubTabKey; label: string; icon: string }[] = [
    { key: 'ALL', label: 'Tümü', icon: '🌟' },
    { key: 'MP4', label: 'MP4 Video', icon: '🎬' },
    { key: 'TV', label: 'Canlı TV', icon: '📺' },
    { key: 'RADIO', label: 'Radyolar', icon: '📻' },
    { key: 'QURAN', label: "114 Sure Kur'an", icon: '📖' },
    { key: 'CUSTOM', label: 'Eklenenler', icon: '📂' },
  ];

  const isStreamActive = Boolean(activeVideoUrl || activeAudioUrl);

  return (
    <View style={styles.container}>
      {/* Top Multi-Format Header Bar */}
      <View style={styles.topActionBar}>
        <View style={styles.formatPillRow}>
          <View style={styles.formatPillPrimary}>
            <Text style={styles.formatPillPrimaryText}>🎬 MP4 • TV • RADYO • KUR'AN</Text>
          </View>
          <Pressable
            style={[styles.sleepMiniBtn, sleepSeconds > 0 && styles.sleepMiniBtnActive]}
            onPress={() => setSleepModalVisible(true)}
          >
            <Text style={styles.sleepMiniBtnText}>
              {sleepSeconds > 0 ? `⏳ ${formatTime(sleepSeconds)}` : '🌙 Uyku'}
            </Text>
          </Pressable>
        </View>
        <Pressable style={styles.addMp4Btn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addMp4BtnText}>+ MP4 / TV / Radyo Ekle</Text>
        </Pressable>
      </View>

      {/* Unified Multi-Format Video & Audio Chassis */}
      <View style={styles.playerSection}>
        <Pressable style={styles.videoViewport} onPress={handlePlayerTap}>
          {isStreamActive && isVideoMode && activeVideoUrl ? (
            <View style={styles.videoWrapper}>
              <VideoView
                ref={videoViewRef}
                style={styles.video}
                player={videoPlayer}
                nativeControls={false}
                allowsPictureInPicture
                startsPictureInPictureAutomatically
              />
              {showControls && (
                <View style={styles.playerOverlay}>
                  <View style={styles.overlayTopBar}>
                    <View
                      style={[
                        styles.mp4FormatBadge,
                        selectedItem.mediaType === 'tv' && { backgroundColor: '#E11D48' },
                      ]}
                    >
                      <Text style={styles.mp4FormatBadgeText}>{selectedItem.formatBadge}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.overlayTitle} numberOfLines={1}>
                        {selectedItem.title}
                      </Text>
                      <Text style={styles.overlaySubtitle} numberOfLines={1}>
                        {selectedItem.subtitle}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.fullscreenBtn}
                      onPress={() => {
                        try {
                          videoViewRef.current?.enterFullscreen();
                        } catch {}
                      }}
                    >
                      <Text style={styles.fullscreenBtnText}>⛶ Tam Ekran</Text>
                    </Pressable>
                  </View>

                  <View style={styles.overlayCenterRow}>
                    <Pressable style={styles.transportBtn} onPress={playPrevItem}>
                      <Text style={styles.transportBtnText}>⏮️</Text>
                    </Pressable>
                    {selectedItem.mediaType === 'mp4' && (
                      <Pressable style={styles.seekBtn} onPress={() => seekBySeconds(-15)}>
                        <Text style={styles.seekBtnText}>-15sn</Text>
                      </Pressable>
                    )}
                    <Pressable style={styles.centerPlayBtn} onPress={togglePlayPause}>
                      <Text style={styles.centerPlayBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
                    </Pressable>
                    {selectedItem.mediaType === 'mp4' && (
                      <Pressable style={styles.seekBtn} onPress={() => seekBySeconds(15)}>
                        <Text style={styles.seekBtnText}>+15sn</Text>
                      </Pressable>
                    )}
                    <Pressable style={styles.transportBtn} onPress={playNextItem}>
                      <Text style={styles.transportBtnText}>⏭️</Text>
                    </Pressable>
                  </View>

                  <View style={styles.overlayBottomBar}>
                    {selectedItem.mediaType === 'mp4' && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                        </View>
                        <View style={styles.seekTapSegmentsRow}>
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pct) => (
                            <Pressable
                              key={pct}
                              style={styles.seekTapSegment}
                              onPress={() => seekToPercent(pct - 5)}
                            />
                          ))}
                        </View>
                      </View>
                    )}
                    <View style={styles.bottomMetaRow}>
                      <Text style={styles.timeCounterText}>
                        {selectedItem.mediaType === 'tv'
                          ? '🔴 CANLI TV YAYINI AÇIK'
                          : `${formatTime(currentTime)} / ${duration > 0 ? formatTime(duration) : selectedItem.durationLabel || '00:00'}`}
                      </Text>
                      <View style={styles.bottomRightChips}>
                        {selectedItem.mediaType === 'mp4' && (
                          <Pressable style={styles.controlChip} onPress={cyclePlaybackSpeed}>
                            <Text style={styles.controlChipText}>⚡ {playbackSpeed}x</Text>
                          </Pressable>
                        )}
                        <Pressable style={styles.controlChip} onPress={cyclePlayMode}>
                          <Text style={styles.controlChipText}>{getModeLabel()}</Text>
                        </Pressable>
                        <Pressable
                          style={styles.controlChip}
                          onPress={() => {
                            try {
                              videoViewRef.current?.startPictureInPicture();
                            } catch {}
                          }}
                        >
                          <Text style={styles.controlChipText}>🖼️ PiP</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : isStreamActive && !isVideoMode && activeAudioUrl ? (
            /* Rich Visual Audio Studio Screen for Live Radio & 114 Surah Quran */
            <View style={styles.audioVisualizerScreen}>
              <View style={styles.audioTopRow}>
                <View
                  style={[
                    styles.mp4FormatBadge,
                    selectedItem.mediaType === 'radio'
                      ? { backgroundColor: '#059669' }
                      : { backgroundColor: '#0284C7' },
                  ]}
                >
                  <Text style={styles.mp4FormatBadgeText}>{selectedItem.formatBadge}</Text>
                </View>
                <Text style={styles.audioLiveStatus}>
                  {isPlaying ? '🔊 KESİNTİSİZ SES AKIŞI AÇIK' : '⏸ DURAKLATILDI'}
                </Text>
                <Pressable style={styles.controlChip} onPress={cyclePlayMode}>
                  <Text style={styles.controlChipText}>{getModeLabel()}</Text>
                </Pressable>
              </View>

              <View style={styles.audioCenterContent}>
                {selectedItem.arabicTitle && (
                  <Text style={styles.arabicCalligraphyText}>{selectedItem.arabicTitle}</Text>
                )}
                <Text style={styles.audioMainTitle} numberOfLines={1}>
                  {selectedItem.title}
                </Text>
                <Text style={styles.audioSubtitle} numberOfLines={1}>
                  {selectedItem.subtitle}
                </Text>

                {/* Equalizer Spectrum */}
                <View style={styles.eqRow}>
                  {eqBars.map((h, i) => (
                    <View
                      key={i}
                      style={[
                        styles.eqBar,
                        {
                          height: isPlaying ? h : 5,
                          backgroundColor:
                            selectedItem.mediaType === 'radio' ? '#34D399' : '#38BDF8',
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              {selectedItem.mediaType === 'quran' && duration > 0 && (
                <View style={styles.audioProgressSection}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progressPercent}%`, backgroundColor: '#38BDF8' },
                        ]}
                      />
                    </View>
                    <View style={styles.seekTapSegmentsRow}>
                      {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pct) => (
                        <Pressable
                          key={pct}
                          style={styles.seekTapSegment}
                          onPress={() => seekToPercent(pct - 5)}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.audioTimeRow}>
                    <Text style={styles.timeCounterText}>{formatTime(currentTime)}</Text>
                    <Text style={styles.timeCounterText}>{formatTime(duration)}</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Pressable
              style={styles.placeholderBox}
              onPress={() => playMediaItem(selectedItem)}
            >
              <View style={styles.placeholderIconCircle}>
                <Text style={{ fontSize: 30 }}>🎬</Text>
              </View>
              <Text style={styles.placeholderTitle}>{selectedItem.title}</Text>
              <Text style={styles.placeholderSub}>
                ▶ Başlatmak için dokunun • MP4 Video, Canlı TV, Radyo ve 114 Sure Kur'an
              </Text>
              <View style={styles.placeholderBadgesRow}>
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>🎬 MP4 Video</Text>
                </View>
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>📺 Canlı TV</Text>
                </View>
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>📻 Radyo</Text>
                </View>
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>📖 114 Sure</Text>
                </View>
              </View>
            </Pressable>
          )}
        </Pressable>

        {/* Hardware-Style Transport Bar below Player */}
        <View style={styles.quickDeckBar}>
          <Pressable style={styles.deckBtn} onPress={playPrevItem}>
            <Text style={styles.deckBtnText}>⏮️ Önceki</Text>
          </Pressable>
          <Pressable style={styles.deckBtn} onPress={() => seekBySeconds(-15)}>
            <Text style={styles.deckBtnText}>⏪ -15s</Text>
          </Pressable>
          <Pressable
            style={[styles.deckPlayBtn, isPlaying && styles.deckPlayBtnActive]}
            onPress={togglePlayPause}
          >
            <Text style={styles.deckPlayBtnText}>
              {isPlaying ? '⏸ DURAKLAT' : '▶ OYNAT / BAŞLAT'}
            </Text>
          </Pressable>
          <Pressable style={styles.deckBtn} onPress={() => seekBySeconds(15)}>
            <Text style={styles.deckBtnText}>+15s ⏩</Text>
          </Pressable>
          <Pressable style={styles.deckBtn} onPress={playNextItem}>
            <Text style={styles.deckBtnText}>Sonraki ⏭️</Text>
          </Pressable>
        </View>
      </View>

      {/* Kategori Aç / Kapat Düğmesi (Varsayılan Olarak Gizli, Tıklanınca Açılır) */}
      <View style={styles.filterTabsWrapper}>
        <Pressable
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1E293B',
            borderWidth: 1,
            borderColor: '#334155',
            borderRadius: 8,
            paddingVertical: 9,
            paddingHorizontal: 14,
            marginHorizontal: 10,
          }}
          onPress={() => setCategoriesVisible(!categoriesVisible)}
        >
          <Text style={{ color: '#C4B5FD', fontSize: 13, fontWeight: 'bold' }}>
            {categoriesVisible ? '▴ Kategorileri Gizle' : '📂 Kategoriler (Tıkla Aç ▾)'}
          </Text>
          <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '600' }}>
            {(hubTabs.find((t) => t.key === activeTab) || hubTabs[0]).icon}{' '}
            {(hubTabs.find((t) => t.key === activeTab) || hubTabs[0]).label}
          </Text>
        </Pressable>

        {categoriesVisible && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filterTabsScroll, { marginTop: 8 }]}
          >
            {hubTabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  style={[styles.filterTabChip, active && styles.filterTabChipActive]}
                  onPress={() => {
                    setActiveTab(tab.key);
                    setCategoriesVisible(false);
                  }}
                >
                  <Text style={styles.filterTabIcon}>{tab.icon}</Text>
                  <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Search & Qari Selector Bar */}
      <View style={styles.searchAndQariBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="MP4 video, TV kanalı, radyo veya sure ara..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {(activeTab === 'QURAN' || activeTab === 'ALL') && (
          <Pressable style={styles.qariSelectorBtn} onPress={() => setQariModalVisible(true)}>
            <Text style={styles.qariSelectorBtnText} numberOfLines={1}>
              🎙️ Kâri: {selectedQari.name} ▾
            </Text>
          </Pressable>
        )}
      </View>

      {/* Media List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxTitle}>Bu bölümde aramanıza uygun yayın bulunamadı.</Text>
            <Pressable style={styles.emptyAddBtn} onPress={() => setAddModalVisible(true)}>
              <Text style={styles.emptyAddBtnText}>+ Özel MP4 / TV / Radyo Linki Ekle</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedItem.id === item.id && isStreamActive;
          const badgeColor =
            item.mediaType === 'mp4'
              ? '#7C3AED'
              : item.mediaType === 'tv'
                ? '#E11D48'
                : item.mediaType === 'radio'
                  ? '#059669'
                  : '#0284C7';
          const iconEmoji =
            item.mediaType === 'mp4'
              ? '🎬'
              : item.mediaType === 'tv'
                ? '📺'
                : item.mediaType === 'radio'
                  ? '📻'
                  : '📖';

          return (
            <Pressable
              style={[styles.videoCard, isSelected && styles.videoCardActive]}
              onPress={() => playMediaItem(item)}
            >
              <View style={styles.videoCardLeft}>
                <View
                  style={[
                    styles.mp4ThumbBox,
                    { borderColor: badgeColor },
                    isSelected && { backgroundColor: badgeColor },
                  ]}
                >
                  <Text style={styles.mp4ThumbIcon}>{isSelected && isPlaying ? '🔊' : iconEmoji}</Text>
                  <Text style={styles.mp4ThumbBadge}>
                    {item.mediaType === 'mp4'
                      ? 'MP4'
                      : item.mediaType === 'tv'
                        ? 'TV'
                        : item.mediaType === 'radio'
                          ? 'FM'
                          : 'SURE'}
                  </Text>
                </View>

                <View style={styles.videoCardInfo}>
                  <View style={styles.titleWithArabicRow}>
                    <Text
                      style={[styles.videoCardTitle, isSelected && styles.videoCardTitleActive]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {item.arabicTitle && (
                      <Text style={styles.cardArabicBadge}>{item.arabicTitle}</Text>
                    )}
                  </View>
                  <Text style={styles.videoCardSub} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                  <View style={styles.videoMetaBadgesRow}>
                    <View style={[styles.metaChip, { borderColor: badgeColor }]}>
                      <Text style={[styles.metaChipText, { color: '#E2E8F0' }]}>
                        {item.formatBadge}
                      </Text>
                    </View>
                    {item.subGroup && (
                      <View style={styles.metaChipSecondary}>
                        <Text style={styles.metaChipSecondaryText}>{item.subGroup}</Text>
                      </View>
                    )}
                    {item.durationLabel && (
                      <View style={styles.metaChipSecondary}>
                        <Text style={styles.metaChipSecondaryText}>⏱ {item.durationLabel}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.videoCardActions}>
                <View
                  style={[
                    styles.playCircle,
                    isSelected && { backgroundColor: badgeColor },
                  ]}
                >
                  <Text style={styles.playCircleText}>
                    {isSelected ? (isPlaying ? '⏸' : '▶') : '▶'}
                  </Text>
                </View>
                {item.isCustom && (
                  <Pressable style={styles.deleteBtn} onPress={() => deleteCustomItem(item.id)}>
                    <Text style={styles.deleteBtnText}>Sil</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      {/* MODAL: Add Custom MP4 / TV / Radio */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>➕ MP4 Video, TV veya Radyo Ekle</Text>
            <Text style={styles.modalDesc}>
              Kendi <Text style={{ fontWeight: 'bold' }}>.mp4</Text> video,{' '}
              <Text style={{ fontWeight: 'bold' }}>.m3u8</Text> canlı TV veya{' '}
              <Text style={{ fontWeight: 'bold' }}>.mp3</Text> radyo bağlantınızı ekleyin.
            </Text>

            <View style={styles.modalCatRow}>
              {(
                [
                  { key: 'mp4', label: '🎬 MP4 Video' },
                  { key: 'tv', label: '📺 Canlı TV' },
                  { key: 'radio', label: '📻 Canlı Radyo' },
                ] as const
              ).map((t) => (
                <Pressable
                  key={t.key}
                  style={[
                    styles.modalCatChip,
                    newMediaType === t.key && styles.modalCatChipActive,
                  ]}
                  onPress={() => setNewMediaType(t.key)}
                >
                  <Text
                    style={[
                      styles.modalCatChipText,
                      newMediaType === t.key && styles.modalCatChipTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Yayın / Video Başlığı"
              placeholderTextColor="#94A3B8"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Alt Başlık / Açıklama (İsteğe bağlı)"
              placeholderTextColor="#94A3B8"
              value={newSubtitle}
              onChangeText={setNewSubtitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Yayın Linki (https://... .mp4 / .m3u8 / .mp3)"
              placeholderTextColor="#94A3B8"
              value={newUrl}
              onChangeText={setNewUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActionRow}>
              <Pressable
                style={[styles.modalActionBtn, styles.modalCancelBtn]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </Pressable>
              <Pressable
                style={[styles.modalActionBtn, styles.modalSaveBtn]}
                onPress={() => handleAddMedia(false)}
              >
                <Text style={styles.modalSaveText}>💾 Kaydet</Text>
              </Pressable>
              <Pressable
                style={[styles.modalActionBtn, styles.modalPlayNowBtn]}
                onPress={() => handleAddMedia(true)}
              >
                <Text style={styles.modalSaveText}>▶ Kaydet & Oynat</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Select Qari for 114 Surahs */}
      <Modal visible={qariModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>🎙️ Kur'an-ı Kerim Kârisi Seçin</Text>
            <Text style={styles.modalDesc}>
              114 Sûre-i Şerif seçtiğiniz hafızın kıraatiyle oynatılır:
            </Text>
            <FlatList
              data={qarisList}
              keyExtractor={(q) => q.id}
              renderItem={({ item: q }) => {
                const isSel = q.id === selectedQari.id;
                return (
                  <Pressable
                    style={[styles.qariModalItem, isSel && styles.qariModalItemActive]}
                    onPress={() => {
                      setSelectedQari(q);
                      setQariModalVisible(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.qariModalName, isSel && { color: '#38BDF8' }]}>
                        {q.name}
                      </Text>
                      <Text style={styles.qariModalSub}>{q.title}</Text>
                    </View>
                    <Text style={{ color: isSel ? '#38BDF8' : '#64748B', fontWeight: 'bold' }}>
                      {isSel ? '✓ Seçili' : 'Seç ›'}
                    </Text>
                  </Pressable>
                );
              }}
            />
            <Pressable
              style={[styles.modalActionBtn, styles.modalCancelBtn, { marginTop: 10, flex: 0 }]}
              onPress={() => setQariModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Kapat</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL: Sleep Timer */}
      <Modal visible={sleepModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🌙 Uyku Zamanlayıcısı</Text>
            <Text style={styles.modalDesc}>
              Belirlediğiniz süre sonunda MP4 video, TV, radyo ve Kur'an yayınları otomatik olarak durdurulur.
            </Text>
            <View style={styles.sleepGrid}>
              {[10, 15, 20, 30, 45, 60].map((mins) => (
                <Pressable
                  key={mins}
                  style={styles.sleepPresetBtn}
                  onPress={() => {
                    sleepTimer.setTimer(mins);
                    setSleepModalVisible(false);
                  }}
                >
                  <Text style={styles.sleepPresetText}>{mins} Dakika</Text>
                </Pressable>
              ))}
            </View>
            {sleepSeconds > 0 && (
              <Pressable
                style={styles.sleepCancelBtn}
                onPress={() => {
                  sleepTimer.cancelTimer();
                  setSleepModalVisible(false);
                }}
              >
                <Text style={styles.sleepCancelText}>❌ Zamanlayıcıyı Kapat</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.modalActionBtn, styles.modalCancelBtn, { marginTop: 10, flex: 0 }]}
              onPress={() => setSleepModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Kapat</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  topActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  formatPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formatPillPrimary: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  formatPillPrimaryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  sleepMiniBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sleepMiniBtnActive: {
    backgroundColor: '#065F46',
    borderColor: '#10B981',
  },
  sleepMiniBtnText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  addMp4Btn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  addMp4BtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  playerSection: {
    backgroundColor: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#1E293B',
  },
  videoViewport: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * (9 / 16),
    backgroundColor: '#050811',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 10, 20, 0.52)',
    justifyContent: 'space-between',
    padding: 10,
  },
  overlayTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
  },
  mp4FormatBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  mp4FormatBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  overlayTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  overlaySubtitle: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  fullscreenBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  fullscreenBtnText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  overlayCenterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  transportBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  transportBtnText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  seekBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
  },
  seekBtnText: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '800',
  },
  centerPlayBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  centerPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overlayBottomBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressContainer: {
    position: 'relative',
    height: 14,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
  },
  seekTapSegmentsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  seekTapSegment: {
    flex: 1,
    height: '100%',
  },
  bottomMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeCounterText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomRightChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#475569',
  },
  controlChipText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  audioVisualizerScreen: {
    flex: 1,
    backgroundColor: '#07131F',
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#0F2942',
  },
  audioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioLiveStatus: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  audioCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  arabicCalligraphyText: {
    color: '#FBBF24',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  audioMainTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  audioSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  eqRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 36,
    marginTop: 8,
  },
  eqBar: {
    width: 5,
    borderRadius: 2.5,
  },
  audioProgressSection: {
    marginTop: 2,
  },
  audioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#090D16',
  },
  placeholderIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 1,
    borderColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  placeholderTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  placeholderSub: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },
  placeholderBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  specBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  specBadgeText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  quickDeckBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: '#111827',
    gap: 6,
  },
  deckBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  deckBtnText: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '700',
  },
  deckPlayBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 7,
    borderRadius: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  deckPlayBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#F87171',
  },
  deckPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  filterTabsWrapper: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 8,
  },
  filterTabsScroll: {
    paddingHorizontal: 10,
    gap: 8,
  },
  filterTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterTabChipActive: {
    backgroundColor: '#6D28D9',
    borderColor: '#A78BFA',
  },
  filterTabIcon: {
    fontSize: 13,
  },
  filterTabText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  searchAndQariBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#151C2C',
    borderWidth: 1,
    borderColor: '#263147',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#FFFFFF',
    fontSize: 12,
  },
  qariSelectorBtn: {
    backgroundColor: '#0369A1',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    maxWidth: 165,
  },
  qariSelectorBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyBoxTitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyAddBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  videoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#111827',
  },
  videoCardActive: {
    backgroundColor: '#1E1B4B',
    borderLeftWidth: 4,
    borderLeftColor: '#A855F7',
  },
  videoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  mp4ThumbBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mp4ThumbIcon: {
    fontSize: 16,
  },
  mp4ThumbBadge: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 1,
  },
  videoCardInfo: {
    flex: 1,
  },
  titleWithArabicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  videoCardTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  videoCardTitleActive: {
    color: '#E9D5FF',
  },
  cardArabicBadge: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: 'bold',
  },
  videoCardSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  videoMetaBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaChip: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  metaChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  metaChipSecondary: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaChipSecondaryText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  videoCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 14,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 10,
  },
  modalCatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    justifyContent: 'center',
  },
  modalCatChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalCatChipActive: {
    backgroundColor: '#6D28D9',
    borderColor: '#A78BFA',
  },
  modalCatChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  modalCatChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#334155',
  },
  modalSaveBtn: {
    backgroundColor: '#059669',
  },
  modalPlayNowBtn: {
    backgroundColor: '#7C3AED',
  },
  modalCancelText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qariModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  qariModalItemActive: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
  },
  qariModalName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qariModalSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  sleepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  sleepPresetBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: '30%',
    alignItems: 'center',
  },
  sleepPresetText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sleepCancelBtn: {
    backgroundColor: '#991B1B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  sleepCancelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
