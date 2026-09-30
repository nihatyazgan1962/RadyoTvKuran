import { StyleSheet, FlatList, Pressable, Dimensions, TextInput, Modal, Alert, View, Text } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sleepTimer } from '@/utils/sleepTimer';
import { playbackCoordinator } from '@/utils/playbackCoordinator';

interface TvStation {
  id: string;
  name: string;
  url: string;
  category: 'Ulusal' | 'Bölgesel' | 'Haber' | 'İslami' | 'Spor' | 'Çocuk' | 'Genel';
  isCustom?: boolean;
}

const defaultTvStations: TvStation[] = [
  // --- ULUSAL & GENEL TV KANALLARI ---
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

  // --- BÖLGESEL TV KANALLARI (TÜM BÖLGELER) ---
  // Marmara Bölgesi
  { id: 'tv_bolge_kocaeli', name: 'Kocaeli TV (Marmara)', url: 'https://edge.taksimbilisim.com/kocaelitv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_tv264', name: 'TV 264 (Sakarya)', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtdxkkitgbrckilive/broadcast_5ee244263fd6d.smil/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_astv', name: 'AS TV (Bursa)', url: 'https://live.artidijitalmedya.com/artidijital_astv/astv/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_ton', name: 'Ton TV (Çanakkale)', url: 'https://edge1.socialsmart.tv/tontv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_koroglu', name: 'Köroğlu TV (Bolu)', url: 'https://edge1.socialsmart.tv/koroglutv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_tekrumeli', name: 'Tek Rumeli TV (Trakya / Balkanlar)', url: 'https://edge1.socialsmart.tv/tekrumelitv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_rumeli', name: 'Rumeli TV (Marmara)', url: 'https://edge1.socialsmart.tv/rumelitv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_tempo', name: 'Tempo TV', url: 'https://edge1.socialsmart.tv/tempotv/bant1/playlist.m3u8', category: 'Bölgesel' },
  
  // Ege Bölgesi
  { id: 'tv_bolge_egetv', name: 'Ege TV (İzmir / Ege)', url: 'https://edge1.socialsmart.tv/egetv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_pamukkale', name: 'Pamukkale TV (Denizli)', url: 'https://edge1.socialsmart.tv/pamukkaletv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_drt', name: 'DRT Denizli TV', url: 'https://edge1.socialsmart.tv/drttv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_kanal3', name: 'Kanal 3 (Afyonkarahisar)', url: 'https://edge1.socialsmart.tv/kanal3/bant1/playlist.m3u8', category: 'Bölgesel' },

  // Akdeniz Bölgesi
  { id: 'tv_bolge_kanalv', name: 'Kanal V (Antalya / Akdeniz)', url: 'https://edge1.socialsmart.tv/kanalv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_hrt', name: 'HRT Akdeniz (Hatay)', url: 'https://edge1.socialsmart.tv/hrtakdeniz/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_aksu', name: 'Aksu TV (Kahramanmaraş)', url: 'https://edge1.socialsmart.tv/aksutv/bant1/playlist.m3u8', category: 'Bölgesel' },

  // Karadeniz Bölgesi
  { id: 'tv_bolge_caytv', name: 'Çay TV (Rize / Karadeniz)', url: 'https://edge1.socialsmart.tv/caytv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_mavikaradeniz', name: 'Mavi Karadeniz TV', url: 'https://edge1.socialsmart.tv/mavikaradeniz/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_altas', name: 'Altaş TV (Ordu)', url: 'https://edge1.socialsmart.tv/altastv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_kadirga', name: 'Kadırga TV (Trabzon)', url: 'https://edge1.socialsmart.tv/kadirgatv/bant1/playlist.m3u8', category: 'Bölgesel' },

  // İç Anadolu Bölgesi
  { id: 'tv_bolge_konyaolay', name: 'Konya Olay TV', url: 'https://live.artidijitalmedya.com/artidijital_konyaolaytv/konyaolaytv/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_tv1', name: 'TV 1 (Kayseri)', url: 'https://edge1.socialsmart.tv/tv1/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_hunat', name: 'Hunat TV (Kayseri)', url: 'https://edge1.socialsmart.tv/hunattv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_kanal58', name: 'Kanal 58 (Sivas)', url: 'https://edge1.socialsmart.tv/kanal58/bant1/playlist.m3u8', category: 'Bölgesel' },

  // Doğu ve Güneydoğu Anadolu Bölgesi
  { id: 'tv_bolge_kanal23', name: 'Kanal 23 (Elazığ / Doğu Anadolu)', url: 'https://cdn-kanal23.yayin.com.tr/kanal23/index.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_mercan', name: 'Mercan TV (Adıyaman)', url: 'https://edge1.socialsmart.tv/mercantv/bant1/playlist.m3u8', category: 'Bölgesel' },
  { id: 'tv_bolge_guneydogutv', name: 'Güneydoğu TV (Şanlıurfa)', url: 'https://edge1.socialsmart.tv/guneydogutv/bant1/playlist.m3u8', category: 'Bölgesel' },

  // --- HABER TV KANALLARI ---
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
  { id: 'tv_haber_13', name: 'TRT WORLD HD (English)', url: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8', category: 'Haber' },
  { id: 'tv_haber_14', name: 'TRT ARABİ HD (Arapça)', url: 'https://tv-trtarabi.medya.trt.com.tr/master.m3u8', category: 'Haber' },

  // --- İSLAMİ & DİNİ TV KANALLARI ---
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

  // --- SPOR & BELGESEL & MÜZİK KANALLARI ---
  { id: 'tv_spor_1', name: 'TRT SPOR HD', url: 'https://tv-trtspor1.medya.trt.com.tr/master.m3u8', category: 'Spor' },
  { id: 'tv_spor_2', name: 'TRT SPOR YILDIZ HD', url: 'https://tv-trtspor2.medya.trt.com.tr/master.m3u8', category: 'Spor' },
  { id: 'tv_spor_3', name: 'TRT BELGESEL HD', url: 'https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8', category: 'Spor' },
  { id: 'tv_spor_4', name: 'TGRT BELGESEL HD', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtsxxkzwwuqtglive/broadcast_5fe462afc6a0e.smil/playlist.m3u8', category: 'Spor' },
  { id: 'tv_spor_5', name: 'TRT MÜZİK HD', url: 'https://tv-trtmuzik.medya.trt.com.tr/master.m3u8', category: 'Spor' },
  { id: 'tv_spor_6', name: 'KRAL POP TV HD', url: 'https://dogus-live.daioncdn.net/kralpoptv/playlist.m3u8', category: 'Spor' },
  { id: 'tv_spor_7', name: 'POWER TV HD', url: 'https://livetv.powerapp.com.tr/powerTV/powerhd.smil/playlist.m3u8', category: 'Spor' },
  { id: 'tv_spor_8', name: 'POWER TÜRK TV HD', url: 'https://live.artidijitalmedya.com/artidijital_powerturktv/powerturktv/playlist.m3u8', category: 'Spor' },
  { id: 'tv_spor_9', name: 'NUMBER 1 TV HD', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtkgeuihrlfwlive/broadcast_5c9e17cd59e8b.smil/playlist.m3u8', category: 'Spor' },
  { id: 'tv_spor_10', name: 'NUMBER 1 TÜRK HD', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtkgeuihrlfwlive/broadcast_5c9e17cd59e8b.smil/playlist.m3u8', category: 'Spor' },

  // --- ÇOCUK & EĞİTİM KANALLARI ---
  { id: 'tv_cocuk_1', name: 'TRT DİYANET ÇOCUK HD', url: 'https://tv-trtdiyanetcocuk.medya.trt.com.tr/master.m3u8', category: 'Çocuk' },
  { id: 'tv_cocuk_2', name: 'TRT ÇOCUK HD', url: 'https://tv-trtcocuk.medya.trt.com.tr/master.m3u8', category: 'Çocuk' },
];

export default function TvScreen() {
  const [stations, setStations] = useState<TvStation[]>(defaultTvStations);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<TvStation | null>(null);

  // Auto-hide player controls state
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  const handlePlayerTap = () => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      resetControlsTimer();
    }
  };

  // Modal for adding custom TV channel
  const [modalVisible, setModalVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomTvChannels = async () => {
    try {
      const custom = await AsyncStorage.getItem('customTvChannels');
      if (custom) {
        setStations([...JSON.parse(custom), ...defaultTvStations]);
      } else {
        setStations(defaultTvStations);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCustomTvChannels();
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(console.error);

    const unsubSleep = sleepTimer.onExpire(() => {
      if (player) {
        player.pause();
      }
    });

    return () => unsubSleep();
  }, []);

  const handleAddChannel = async () => {
    if (!newChannelName.trim() || !newChannelUrl.trim()) {
      Alert.alert('Uyarı', 'Lütfen kanal adı ve yayın linki giriniz.');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('customTvChannels');
      const custom: TvStation[] = stored ? JSON.parse(stored) : [];
      const newChan: TvStation = {
        id: 'custom_tv_' + Date.now().toString(),
        name: newChannelName.trim(),
        url: newChannelUrl.trim(),
        category: 'Genel',
        isCustom: true,
      };
      custom.unshift(newChan);
      await AsyncStorage.setItem('customTvChannels', JSON.stringify(custom));
      setStations([newChan, ...stations]);
      setNewChannelName('');
      setNewChannelUrl('');
      setModalVisible(false);
      Alert.alert('Başarılı', 'TV kanalı listenize eklendi.');
    } catch (e) {
      Alert.alert('Hata', 'Kanal eklenemedi.');
    }
  };

  const deleteCustomChannel = async (id: string) => {
    Alert.alert('Kanalı Sil', 'Bu kanalı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const stored = await AsyncStorage.getItem('customTvChannels');
            if (stored) {
              const custom = JSON.parse(stored).filter((c: any) => c.id !== id);
              await AsyncStorage.setItem('customTvChannels', JSON.stringify(custom));
              setStations(stations.filter((c) => c.id !== id));
              if (selectedStation?.id === id) {
                setSelectedStation(null);
                setCurrentUrl(null);
              }
            }
          } catch (e) {}
        },
      },
    ]);
  };

  // When TV tab comes into focus, immediately silence radio and background Quran
  useFocusEffect(
    useCallback(() => {
      playbackCoordinator.notifyActive('tv');
    }, [])
  );

  const player = useVideoPlayer(currentUrl, (p) => {
    p.loop = true;
    p.staysActiveInBackground = true;
    p.showNowPlayingNotification = true;
    if (currentUrl) {
      p.play();
    }
  });

  useEffect(() => {
    const unsubTv = playbackCoordinator.register('tv', () => {
      if (player) {
        try {
          player.pause();
        } catch (e) {}
      }
    });
    return () => unsubTv();
  }, [player]);

  const playStation = (station: TvStation) => {
    playbackCoordinator.notifyActive('tv');
    setSelectedStation(station);
    setCurrentUrl(station.url);
    resetControlsTimer();
  };

  const playNextChannel = () => {
    const list = filteredStations.length > 0 ? filteredStations : stations;
    if (!list.length) return;
    const currentIndex = list.findIndex(s => s.id === selectedStation?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    playStation(list[nextIndex]);
  };

  const playPrevChannel = () => {
    const list = filteredStations.length > 0 ? filteredStations : stations;
    if (!list.length) return;
    const currentIndex = list.findIndex(s => s.id === selectedStation?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    playStation(list[prevIndex]);
  };

  const categories = [
    { key: 'Tümü', label: 'Tüm Canlı TV Kanalları', icon: '📺', desc: 'Ulusal, Bölgesel ve Tematik 75+ Canlı Kanal' },
    { key: 'Ulusal', label: '🇹🇷 Ulusal Kanallar (TR)', icon: '📡', desc: 'TRT 1, ATV, Show TV, Star, TV8, Kanal 7, NOW...' },
    { key: 'Haber', label: '📰 Haber & Gündem TV', icon: '🎙️', desc: 'TRT Haber, A Haber, NTV, Habertürk, CNN Türk, TVNET...' },
    { key: 'İslami', label: '🕌 Dini & Tasavvuf TV', icon: '🌙', desc: 'Mekke & Medine Canlı, Diyanet TV, Vav TV, Semerkand...' },
    { key: 'Bölgesel', label: '🏙️ Bölgesel & Yerel TV', icon: '🏛️', desc: 'Marmara, Ege, Akdeniz, Karadeniz, İç Anadolu...' },
    { key: 'Spor', label: '⚽ Spor & Müzik TV', icon: '🏆', desc: 'TRT Spor, Belgesel, Power TV, Kral Pop, Dream Türk...' },
    { key: 'Çocuk', label: '👶 Çocuk & Aile TV', icon: '🎨', desc: 'TRT Çocuk, TRT Diyanet Çocuk, Minika...' },
  ];

  const filteredStations = selectedCategory
    ? stations.filter((s) => {
        const matchesCategory = selectedCategory === 'Tümü' || s.category === selectedCategory || s.isCustom;
        const matchesSearch = !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  const selectedCatObj = categories.find(c => c.key === selectedCategory) || categories[0];

  const renderPlayer = () => (
    <Pressable style={styles.playerContainer} onPress={handlePlayerTap}>
      {selectedStation && currentUrl ? (
        <View style={styles.videoWrapper}>
          <VideoView
            style={styles.video}
            player={player}
            allowsPictureInPicture
            startsPictureInPictureAutomatically
          />
          {showControls && (
            <View style={styles.playerOverlay}>
              {/* Top Controls Bar */}
              <View style={styles.playerOverlayTop}>
                <View style={styles.liveBadge}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.liveBadgeText}>CANLI</Text>
                </View>
                <Text style={styles.nowPlayingText} numberOfLines={1}>
                  {selectedStation.name}
                </Text>
                <View style={styles.hdBadge}>
                  <Text style={styles.hdBadgeText}>HD</Text>
                </View>
              </View>

              {/* Center Channel Zap Controls */}
              <View style={styles.playerOverlayCenter}>
                <Pressable style={styles.zapBtn} onPress={playPrevChannel}>
                  <Text style={styles.zapBtnText}>⏮️ Önceki</Text>
                </Pressable>
                <Pressable 
                  style={styles.zapCenterPlayBtn} 
                  onPress={() => {
                    if (player.playing) {
                      player.pause();
                    } else {
                      player.play();
                    }
                  }}
                >
                  <Text style={styles.zapCenterPlayText}>{player.playing ? '⏸' : '▶'}</Text>
                </Pressable>
                <Pressable style={styles.zapBtn} onPress={playNextChannel}>
                  <Text style={styles.zapBtnText}>Sonraki ⏭️</Text>
                </Pressable>
              </View>

              {/* Bottom Hint */}
              <View style={styles.playerOverlayBottom}>
                <Text style={styles.tapToHideText}>👆 Ekrana dokunarak kontrolleri gizleyebilirsiniz</Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.video, styles.placeholderVideo]}>
          <Text style={{ fontSize: 44 }}>📺</Text>
          <Text style={styles.placeholderTitle}>Mobil Canlı TV Rehberi</Text>
          <Text style={styles.placeholderSubtitle}>Bir kategori seçerek canlı yayını başlatın</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Video Player (Her Zaman Üstte Yer Alır) */}
      {renderPlayer()}

      {/* DURUM 1: Ana Ekranda Sadece Kategoriler Görünür */}
      {!selectedCategory ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoryMenuContent}
          ListHeaderComponent={
            <View style={styles.categoryMenuHeader}>
              <Text style={styles.categoryMenuTitle}>📑 TV KATEGORİLERİ</Text>
              <Text style={styles.categoryMenuSubtitle}>İzlemek istediğiniz kanallar için bir kategori seçin:</Text>
            </View>
          }
          renderItem={({ item: cat }) => {
            const count = cat.key === 'Tümü'
              ? stations.length
              : stations.filter(s => s.category === cat.key).length;
            return (
              <Pressable
                style={styles.categoryMenuCard}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <View style={styles.categoryMenuLeft}>
                  <Text style={styles.categoryMenuIcon}>{cat.icon}</Text>
                  <View style={styles.categoryMenuTexts}>
                    <Text style={styles.categoryMenuCardTitle}>{cat.label}</Text>
                    <Text style={styles.categoryMenuCardDesc}>{cat.desc}</Text>
                  </View>
                </View>
                <View style={styles.categoryMenuBadge}>
                  <Text style={styles.categoryMenuBadgeText}>{count} Kanal ›</Text>
                </View>
              </Pressable>
            );
          }}
        />
      ) : (
        /* DURUM 2: Bir Kategoriye Tıklandığında Kanal Listesi Görünür */
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListHeaderComponent={
            <View style={styles.categoryListHeader}>
              {/* Back to Categories Button */}
              <Pressable 
                style={styles.backToCategoriesBtn} 
                onPress={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.backToCategoriesText}>‹ Kategorilere Dön</Text>
                <Text style={styles.currentCategoryBadge}>{selectedCatObj.icon} {selectedCatObj.label}</Text>
              </Pressable>

              {/* Search Bar */}
              <TextInput
                style={styles.channelSearchInput}
                placeholder={`${selectedCatObj.label} içinde ara...`}
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>
                  {selectedCatObj.label} ({filteredStations.length} Kanal)
                </Text>
                <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
                  <Text style={styles.addBtnText}>+ Kanal Ekle</Text>
                </Pressable>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = selectedStation?.id === item.id;
            return (
              <Pressable 
                style={[styles.stationCard, isSelected && styles.playingCard]} 
                onPress={() => playStation(item)}
              >
                <View style={styles.stationInfo}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.stationName, isSelected && styles.stationNameSelected]}>
                      {item.name}
                    </Text>
                    {item.category && (
                      <View style={styles.tagBadgeContainer}>
                        <Text style={styles.tagBadgeText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                  {isSelected && <Text style={styles.playingText}>▶ Canlı Yayın Açık</Text>}
                  {item.isCustom && <Text style={styles.customBadge}>Eklenen Özel Kanal</Text>}
                </View>

                <View style={styles.cardRightAction}>
                  <View style={[styles.miniStatusIndicator, isSelected && styles.indicatorActive]}>
                    <Text style={styles.miniStatusIcon}>
                      {isSelected ? '📺' : '▶'}
                    </Text>
                  </View>
                  {item.isCustom && (
                    <Pressable style={styles.deleteBtn} onPress={() => deleteCustomChannel(item.id)}>
                      <Text style={styles.deleteBtnText}>Sil</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {/* Modal for adding TV channel */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni TV Kanalı Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="Kanal Adı (Örn: Hilal TV)"
              placeholderTextColor="#888"
              value={newChannelName}
              onChangeText={setNewChannelName}
            />
            <TextInput
              style={styles.input}
              placeholder="Yayın Linki (m3u8 URL)"
              placeholderTextColor="#888"
              value={newChannelUrl}
              onChangeText={setNewChannelUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>İptal</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={handleAddChannel}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Kaydet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  playerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoWrapper: {
    position: 'relative',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * (9 / 16),
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 10,
  },
  playerOverlayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E11D48',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  hdBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  hdBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  playerOverlayCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  zapBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  zapBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  zapCenterPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E11D48',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  zapCenterPlayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerOverlayBottom: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 5,
    borderRadius: 6,
  },
  tapToHideText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
  },
  placeholderVideo: {
    width: Dimensions.get('window').width,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  placeholderTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 6,
  },
  placeholderSubtitle: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 3,
  },
  nowPlayingText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Main Category Menu Styles
  categoryMenuContent: {
    padding: 14,
    paddingBottom: 32,
  },
  categoryMenuHeader: {
    marginBottom: 14,
  },
  categoryMenuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#81c784',
    letterSpacing: 0.5,
  },
  categoryMenuSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  categoryMenuCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  categoryMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryMenuIcon: {
    fontSize: 28,
  },
  categoryMenuTexts: {
    flex: 1,
  },
  categoryMenuCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  categoryMenuCardDesc: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  categoryMenuBadge: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  categoryMenuBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Inside Category View Header Styles
  categoryListHeader: {
    backgroundColor: '#121212',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  backToCategoriesBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderWidth: 1,
    borderColor: '#383838',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  backToCategoriesText: {
    color: '#81c784',
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentCategoryBadge: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  channelSearchInput: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 8,
  },
  // Vertical Categories Section (Alt Alta Sıralı)
  categoriesVerticalSection: {
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoriesHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoriesVerticalList: {
    flexDirection: 'column',
    gap: 6,
  },
  categoryRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryRowItemActive: {
    backgroundColor: '#1b3a20',
    borderColor: '#2e7d32',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  categoryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  categoryRowIcon: {
    fontSize: 15,
  },
  categoryRowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  categoryRowLabelActive: {
    color: '#81c784',
    fontWeight: 'bold',
  },
  categoryCountBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountBadgeActive: {
    backgroundColor: '#2e7d32',
  },
  categoryCountText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  categoryCountTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    backgroundColor: '#181818',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
    backgroundColor: '#1c1c1c',
  },
  playingCard: {
    backgroundColor: '#1b3a20',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  stationInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
  },
  stationName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stationNameSelected: {
    color: '#81c784',
  },
  tagBadgeContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  tagBadgeText: {
    fontSize: 11,
    color: '#81c784',
    fontWeight: '600',
  },
  playingText: {
    color: '#4caf50',
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  customBadge: {
    color: '#64b5f6',
    marginTop: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardRightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  miniStatusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorActive: {
    backgroundColor: '#2e7d32',
  },
  miniStatusIcon: {
    fontSize: 13,
    color: '#ffffff',
  },
  deleteBtn: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#eee',
  },
  saveBtn: {
    backgroundColor: '#2e7d32',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
});
