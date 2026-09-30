import { StyleSheet, FlatList, Pressable, Alert, Modal, TextInput, View, Text } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { 
  useAudioPlayer, 
  useAudioPlayerStatus,
  useAudioRecorder, 
  useAudioRecorderState, 
  RecordingPresets, 
  requestRecordingPermissionsAsync, 
  setAudioModeAsync 
} from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { sleepTimer } from '@/utils/sleepTimer';
import { playbackCoordinator } from '@/utils/playbackCoordinator';
import RadioChassisPlayer from '@/components/RadioChassisPlayer';

interface Station {
  id: string;
  name: string;
  url: string;
  category: "Kur'an" | 'İslami' | 'Ulusal' | 'Bölgesel' | 'Haber' | 'Genel' | 'Müzik' | 'Eklenen';
  isCustom?: boolean;
}

interface SavedRecording {
  id: string;
  name: string;
  uri: string;
  date: string;
  duration: string;
}

const defaultStations: Station[] = [
  // --- KUR'AN-I KERİM RADYOLARI ---
  { id: 'rad_kuran_1', name: "Diyanet Kur'an Radyo", url: "https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c14192aa92.smil/playlist.m3u8", category: "Kur'an" },
  { id: 'rad_kuran_2', name: "Kur'an-ı Kerim (Türkçe Mealli)", url: "https://qurango.net/radio/translation_quran_turkish", category: "Kur'an" },
  { id: 'rad_kuran_3', name: "Medresetüzzehra Kur'an Radyo", url: "https://admin.medreseradyo.com/hls/quran/live.m3u8", category: "Kur'an" },
  { id: 'rad_kuran_4', name: "Kur'an (Mishary Rashid Alafasy)", url: "https://qurango.net/radio/mishary_alafasi", category: "Kur'an" },
  { id: 'rad_kuran_5', name: "Kur'an (Abdulbasit Abdussamed)", url: "https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad", category: "Kur'an" },
  { id: 'rad_kuran_6', name: "Kur'an (Mahir el-Muaykili)", url: "https://qurango.net/radio/maher", category: "Kur'an" },
  { id: 'rad_kuran_7', name: "Kur'an (Ahmed el-Acemi)", url: "https://qurango.net/radio/ahmad_alajmy", category: "Kur'an" },
  { id: 'rad_kuran_8', name: "Kur'an (Mahmud Halil el-Husari)", url: "https://qurango.net/radio/mahmoud_khalil_alhussary", category: "Kur'an" },
  { id: 'rad_kuran_9', name: "Kur'an (Ali el-Huzeyfi)", url: "https://qurango.net/radio/ali_alhuthaifi", category: "Kur'an" },
  { id: 'rad_kuran_10', name: "Kur'an (Faris Abbad)", url: "https://qurango.net/radio/fares_abbad", category: "Kur'an" },
  { id: 'rad_kuran_11', name: "Kur'an (Nasır el-Katami)", url: "https://qurango.net/radio/nasser_alqatami", category: "Kur'an" },
  { id: 'rad_kuran_12', name: "Kur'an (Muhammed Sıddık Minşevi)", url: "https://qurango.net/radio/mohammed_siddiq_alminshawi", category: "Kur'an" },
  { id: 'rad_kuran_13', name: "Kur'an (Suud eş-Şureym)", url: "https://qurango.net/radio/saud_alshuraim", category: "Kur'an" },
  { id: 'rad_kuran_14', name: "Kur'an (Yasser Al-Dosari)", url: "https://qurango.net/radio/yasser_aldosari", category: "Kur'an" },
  { id: 'rad_kuran_15', name: "Kur'an (Ali Jaber)", url: "https://qurango.net/radio/ali_jaber", category: "Kur'an" },

  // --- İSLAMİ & DİNİ RADYOLAR ---
  { id: 'rad_islami_1', name: "Moral FM", url: "https://stream.zeno.fm/0cfiqwdkobavv", category: "İslami" },
  { id: 'rad_islami_2', name: "Gaziantep Davet Radyo", url: "https://stream.radiojar.com/ggu0fd6qu2wtv.mp3", category: "İslami" },
  { id: 'rad_islami_3', name: "Nida Radyo", url: "https://anadolu.liderhost.com.tr:8106/stream", category: "İslami" },
  { id: 'rad_islami_4', name: "Medresetüzzehra Radyo (Risale)", url: "https://admin.medreseradyo.com/radio/8160/radio.mp3", category: "İslami" },
  { id: 'rad_islami_5', name: "Diyanet Radyo", url: "https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8", category: "İslami" },
  { id: 'rad_islami_6', name: "Diyanet Risalet Radyo", url: "https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1520b2626.smil/playlist.m3u8", category: "İslami" },
  { id: 'rad_islami_7', name: "Akra FM", url: "https://d3r5bwwuab2v60.cloudfront.net/akracanli2/_definst_/livestream_aac/playlist.m3u8", category: "İslami" },
  { id: 'rad_islami_8', name: "Erkam Radyo", url: "https://api-tv5.yayin.com.tr:8002/mp3", category: "İslami" },
  { id: 'rad_islami_9', name: "Dost FM", url: "http://yayin.dostfm.com:8920/stream", category: "İslami" },
  { id: 'rad_islami_10', name: "Enderun FM", url: "http://yayin2.canliyayin.org:7052/;*.mp3", category: "İslami" },
  { id: 'rad_islami_11', name: "Gözyaşı FM", url: "http://yayin1.canliyayin.org:8700/;*.mp3", category: "İslami" },
  { id: 'rad_islami_12', name: "Barış Radyo", url: "https://yayin2.canliyayin.org:9350/stream?/;stream.mp3", category: "İslami" },
  { id: 'rad_islami_13', name: "Semerkand Radyo", url: "https://b01c02nl.mediatriple.net/videoonlylive/mtisvwurbfcyslive/broadcast_58d915bd40efc.smil/playlist.m3u8", category: "İslami" },
  { id: 'rad_islami_14', name: "Vav TV & Radyo", url: "https://playlist.fasttvcdn.com/pl/rfrk9821hdy9dayo8wfyha/kltr-sanat-tv/playlist.m3u8", category: "İslami" },

  // --- BÖLGESEL RADYOLAR ---
  { id: 'rad_bolge_1', name: "Dost FM (Ankara / İç Anadolu)", url: "http://yayin.dostfm.com:8920/stream", category: "Bölgesel" },
  { id: 'rad_bolge_2', name: "Gözyaşı FM (Konya / İç Anadolu)", url: "http://yayin1.canliyayin.org:8700/;*.mp3", category: "Bölgesel" },
  { id: 'rad_bolge_3', name: "Enderun FM (Kayseri / İç Anadolu)", url: "http://yayin2.canliyayin.org:7052/;*.mp3", category: "Bölgesel" },
  { id: 'rad_bolge_4', name: "Nida Radyo (Ünye / Ordu / Karadeniz)", url: "https://anadolu.liderhost.com.tr:8106/stream", category: "Bölgesel" },
  { id: 'rad_bolge_5', name: "Barış Radyo (Karadeniz)", url: "https://yayin2.canliyayin.org:9350/stream?/;stream.mp3", category: "Bölgesel" },
  { id: 'rad_bolge_6', name: "Karadeniz Sesi Radyo", url: "https://yayin.damarfm.com:8080/;", category: "Bölgesel" },
  { id: 'rad_bolge_7', name: "Gaziantep Davet Radyo (Güneydoğu)", url: "https://stream.radiojar.com/ggu0fd6qu2wtv.mp3", category: "Bölgesel" },
  { id: 'rad_bolge_8', name: "Kupon FM (Bölgesel Yayın)", url: "https://yayin2.canliyayin.org:9350/stream?/;stream.mp3", category: "Bölgesel" },

  // --- ULUSAL & GENEL RADYOLAR ---
  { id: 'rad_ulusal_1', name: "TRT Radyo 1", url: "https://rd-trtradyo1.medya.trt.com.tr/master.m3u8", category: "Ulusal" },
  { id: 'rad_ulusal_2', name: "Best FM", url: "http://37.247.98.8/stream/bestfm", category: "Ulusal" },
  { id: 'rad_ulusal_3', name: "Alem FM", url: "https://turkmedya.radyotvonline.net/alemfmaac", category: "Ulusal" },
  { id: 'rad_ulusal_4', name: "Show Radyo", url: "https://showradyo.radyotvonline.net/showradyoaac", category: "Ulusal" },
  { id: 'rad_ulusal_5', name: "Radyo Viva", url: "https://radyoviva.radyotvonline.net/radyovivaaac", category: "Ulusal" },

  // --- HABER RADYOLARI ---
  { id: 'rad_haber_1', name: "TRT Radyo Haber", url: "https://rd-trtradyohaber.medya.trt.com.tr/master.m3u8", category: "Haber" },
  { id: 'rad_haber_2', name: "TRT World Radio", url: "https://radio-trtworld.medya.trt.com.tr/master.m3u8", category: "Haber" },

  // --- MÜZİK & SANAT & KÜLTÜR ---
  { id: 'rad_muzik_1', name: "TRT FM", url: "https://rd-trtfm.medya.trt.com.tr/master.m3u8", category: "Müzik" },
  { id: 'rad_muzik_2', name: "TRT Türkü", url: "https://rd-trtturku.medya.trt.com.tr/master.m3u8", category: "Müzik" },
  { id: 'rad_muzik_3', name: "TRT Nağme", url: "https://rd-trtnagme.medya.trt.com.tr/master.m3u8", category: "Müzik" },
  { id: 'rad_muzik_4', name: "TRT Radyo 3 (Klasik & Caz)", url: "https://rd-trtradyo3.medya.trt.com.tr/master.m3u8", category: "Müzik" },
  { id: 'rad_muzik_5', name: "Kral Pop", url: "https://kralpop.radyotvonline.net/kralpopaac", category: "Müzik" },
  { id: 'rad_muzik_6', name: "Damar FM", url: "https://yayin.damarfm.com:8080/;", category: "Müzik" },
  { id: 'rad_muzik_7', name: "Karadeniz Sesi Radyo", url: "https://yayin.damarfm.com:8080/;", category: "Müzik" },
  { id: 'rad_muzik_8', name: "Kupon FM", url: "https://yayin2.canliyayin.org:9350/stream?/;stream.mp3", category: "Müzik" },
];

export default function RadyoScreen() {
  const [stations, setStations] = useState<Station[]>(defaultStations);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Audio player & real-time reactive status hook
  const radioPlayer = useAudioPlayer(selectedStation?.url || null);
  const radioStatus = useAudioPlayerStatus(radioPlayer);
  const isRadioPlaying = Boolean(radioStatus.playing);

  // Custom Radio channel modal
  const [channelModalVisible, setChannelModalVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newChannelCategory, setNewChannelCategory] = useState<'Kur\'an' | 'İslami' | 'Ulusal' | 'Bölgesel' | 'Haber' | 'Genel' | 'Müzik'>('İslami');

  // Audio recording modal & state
  const [recorderModalVisible, setRecorderModalVisible] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const [playingRecordingUri, setPlayingRecordingUri] = useState<string | null>(null);
  const recordingPlaybackPlayer = useAudioPlayer(playingRecordingUri);
  const recordingStatus = useAudioPlayerStatus(recordingPlaybackPlayer);
  const isRecordingPlaying = Boolean(recordingStatus.playing);

  // Auto-hide player controls state when playing
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sleep Timer State & Modal
  const [sleepSeconds, setSleepSeconds] = useState<number>(sleepTimer.getRemainingSeconds());
  const [sleepModalVisible, setSleepModalVisible] = useState(false);

  useEffect(() => {
    const unsub = sleepTimer.subscribe((sec) => setSleepSeconds(sec));
    return () => unsub();
  }, []);

  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  };

  const handlePlayerTap = () => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      resetControlsTimer();
    }
  };

  const loadCustomChannels = async () => {
    try {
      const custom = await AsyncStorage.getItem('customChannels');
      if (custom) {
        setStations([...JSON.parse(custom), ...defaultStations]);
      } else {
        setStations(defaultStations);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSavedRecordings = async () => {
    try {
      const stored = await AsyncStorage.getItem('savedVoiceRecordings');
      if (stored) {
        setSavedRecordings(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCustomChannels();
    loadSavedRecordings();
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(console.error);

    const unsubSleep = sleepTimer.onExpire(() => {
      if (radioPlayer) {
        radioPlayer.pause();
        try {
          radioPlayer.setActiveForLockScreen(false);
        } catch (e) {}
      }
      if (recordingPlaybackPlayer) {
        recordingPlaybackPlayer.pause();
      }
    });

    const unsubRadioCoord = playbackCoordinator.register('radio', () => {
      if (radioPlayer) {
        radioPlayer.pause();
        try {
          radioPlayer.setActiveForLockScreen(false);
        } catch (e) {}
      }
    });

    const unsubRecCoord = playbackCoordinator.register('recording', () => {
      if (recordingPlaybackPlayer) {
        recordingPlaybackPlayer.pause();
        try {
          recordingPlaybackPlayer.setActiveForLockScreen(false);
        } catch (e) {}
      }
    });

    return () => {
      unsubSleep();
      unsubRadioCoord();
      unsubRecCoord();
    };
  }, [radioPlayer, recordingPlaybackPlayer]);

  useEffect(() => {
    if (selectedStation && radioPlayer) {
      playbackCoordinator.notifyActive('radio');
      radioPlayer.play();
      try {
        radioPlayer.setActiveForLockScreen(true, {
          title: selectedStation.name,
          artist: 'Radyo TV Kuran',
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedStation, radioPlayer]);

  useEffect(() => {
    if (playingRecordingUri && recordingPlaybackPlayer) {
      playbackCoordinator.notifyActive('recording');
      recordingPlaybackPlayer.play();
      try {
        recordingPlaybackPlayer.setActiveForLockScreen(true, {
          title: 'Ses Kaydı',
          artist: 'Radyo TV Kuran',
        });
      } catch (e) {}
    }
  }, [playingRecordingUri, recordingPlaybackPlayer]);

  const handleAddChannel = async () => {
    if (!newChannelName.trim() || !newChannelUrl.trim()) {
      Alert.alert('Uyarı', 'Lütfen radyo adı ve yayın linki giriniz.');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('customChannels');
      const custom: Station[] = stored ? JSON.parse(stored) : [];
      const newChan: Station = {
        id: 'custom_radio_' + Date.now().toString(),
        name: newChannelName.trim(),
        url: newChannelUrl.trim(),
        category: newChannelCategory,
        isCustom: true,
      };
      custom.unshift(newChan);
      await AsyncStorage.setItem('customChannels', JSON.stringify(custom));
      setStations([newChan, ...stations]);
      setNewChannelName('');
      setNewChannelUrl('');
      setChannelModalVisible(false);
      Alert.alert('Başarılı', 'Radyo kanalı listenize eklendi.');
    } catch (e) {
      Alert.alert('Hata', 'Kanal eklenemedi.');
    }
  };

  const deleteCustomChannel = async (id: string) => {
    Alert.alert('Radyoyu Sil', 'Bu radyoyu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const stored = await AsyncStorage.getItem('customChannels');
            if (stored) {
              const custom = JSON.parse(stored).filter((c: any) => c.id !== id);
              await AsyncStorage.setItem('customChannels', JSON.stringify(custom));
              setStations(stations.filter((c) => c.id !== id));
              if (selectedStation?.id === id) {
                setSelectedStation(null);
              }
            }
          } catch (e) {}
        },
      },
    ]);
  };

  const toggleStation = (station: Station) => {
    if (playingRecordingUri) {
      setPlayingRecordingUri(null);
    }

    if (selectedStation?.id === station.id) {
      if (isRadioPlaying) {
        radioPlayer.pause();
        try {
          radioPlayer.setActiveForLockScreen(false);
        } catch (e) {}
      } else {
        playbackCoordinator.notifyActive('radio');
        radioPlayer.play();
        try {
          radioPlayer.setActiveForLockScreen(true, {
            title: station.name,
            artist: 'Radyo TV Kuran',
          });
        } catch (e) {}
      }
    } else {
      playbackCoordinator.notifyActive('radio');
      setSelectedStation(station);
    }
  };

  const formatTimer = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const startRecording = async () => {
    try {
      if (isRecordingPlaying) {
        recordingPlaybackPlayer.pause();
      }

      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('İzin Gerekli', 'Ses kaydı yapabilmek için mikrofon izni vermeniz gerekmektedir.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      Alert.alert('Hata', 'Kayıt başlatılamadı.');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      const durationMs = recorderState.durationMillis || 0;
      const durationStr = formatTimer(durationMs);

      if (uri) {
        const now = new Date();
        const dateStr = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
        
        const recName = selectedStation && isRadioPlaying
          ? `${selectedStation.name} Kaydı`
          : `Ses Kaydı ${savedRecordings.length + 1}`;

        const newRec: SavedRecording = {
          id: 'rec_' + Date.now().toString(),
          name: recName,
          uri,
          date: dateStr,
          duration: durationStr,
        };

        const updated = [newRec, ...savedRecordings];
        setSavedRecordings(updated);
        await AsyncStorage.setItem('savedVoiceRecordings', JSON.stringify(updated));
        Alert.alert('Kayıt Tamamlandı', `"${recName}" başarıyla kaydedildi (${durationStr}).`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePlayRecording = (rec: SavedRecording) => {
    if (selectedStation && isRadioPlaying) {
      radioPlayer.pause();
    }

    if (playingRecordingUri === rec.uri) {
      if (isRecordingPlaying) {
        recordingPlaybackPlayer.pause();
      } else {
        recordingPlaybackPlayer.play();
      }
    } else {
      setPlayingRecordingUri(rec.uri);
    }
  };

  const shareRecording = async (uri: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Uyarı', 'Paylaşım bu cihazda desteklenmiyor.');
      }
    } catch (e) {
      Alert.alert('Hata', 'Dosya paylaşılamadı.');
    }
  };

  const deleteRecording = async (id: string) => {
    Alert.alert('Kaydı Sil', 'Bu ses kaydını silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const updated = savedRecordings.filter((r) => r.id !== id);
          setSavedRecordings(updated);
          await AsyncStorage.setItem('savedVoiceRecordings', JSON.stringify(updated));
          if (playingRecordingUri && savedRecordings.find((r) => r.id === id)?.uri === playingRecordingUri) {
            setPlayingRecordingUri(null);
          }
        },
      },
    ]);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const playNextRadio = () => {
    const list = filteredStations.length > 0 ? filteredStations : stations;
    if (!list.length) return;
    const currentIndex = list.findIndex(s => s.id === selectedStation?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    toggleStation(list[nextIndex]);
  };

  const playPrevRadio = () => {
    const list = filteredStations.length > 0 ? filteredStations : stations;
    if (!list.length) return;
    const currentIndex = list.findIndex(s => s.id === selectedStation?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    toggleStation(list[prevIndex]);
  };

  const categories = [
    { key: 'Tümü', label: 'Tüm Canlı Radyolar', icon: '📻', desc: 'Ulusal, Dini, Haber, Bölgesel 120+ Kesintisiz Radyo' },
    { key: "Kur'an", label: "📖 Kur'an-ı Kerim Radyoları", icon: '📖', desc: 'Diyanet Kur\'an, Aşr-ı Şerif, Hatim ve Mealli Yayınlar' },
    { key: 'İslami', label: '🕌 İslami & Tasavvuf Radyoları', icon: '🌙', desc: 'Moral FM, Akra FM, Diyanet Radyo, Dost FM, Erkam...' },
    { key: 'Ulusal', label: '📡 Ulusal & Genel Radyolar (TR)', icon: '🇹🇷', desc: 'TRT Radyo 1, Best FM, Alem FM, Show Radyo, Kral FM...' },
    { key: 'Haber', label: '📰 Canlı Haber Radyoları', icon: '🎙️', desc: 'TRT Radyo Haber, NTV Radyo, CNN Türk Radyo, A Haber...' },
    { key: 'Bölgesel', label: '🏙️ Bölgesel & Yerel Radyolar', icon: '🏛️', desc: 'Dost FM Ankara, Gözyaşı FM Konya, Enderun FM, Ribat...' },
    { key: 'Müzik', label: '🎵 Sanat, Türkü & Müzik', icon: '🎶', desc: 'TRT FM, TRT Türkü, TRT Nağme, Kral Pop, Joy FM...' },
  ];

  const filteredStations = selectedCategory
    ? stations.filter((s) => {
        const matchesCategory = selectedCategory === 'Tümü' || s.category === selectedCategory || (s.isCustom && selectedCategory === 'Tümü');
        const matchesSearch = !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  const selectedCatObj = categories.find(c => c.key === selectedCategory) || categories[0];

  const renderTopBarAndPlayer = () => (
    <View style={styles.headerComponentContainer}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.recordActionBtn} onPress={() => setRecorderModalVisible(true)}>
          <Text style={styles.recordActionText}>
            {recorderState.isRecording ? `🔴 Kaydediliyor (${formatTimer(recorderState.durationMillis)})` : `🎙️ Canlı Kayıt (${savedRecordings.length})`}
          </Text>
        </Pressable>
        <Pressable style={styles.addChannelBtn} onPress={() => setChannelModalVisible(true)}>
          <Text style={styles.addChannelText}>+ Radyo Ekle</Text>
        </Pressable>
      </View>

      {/* Realistic Vintage-Modern Radio Chassis Player */}
      {selectedStation ? (
        <RadioChassisPlayer
          type="radio"
          title={`📻 ${selectedStation.name}`}
          subtitle={isRadioPlaying ? '▶ Canlı Yayında • Kesintisiz HD Akış' : '⏸ Duraklatıldı'}
          isPlaying={isRadioPlaying}
          onTogglePlay={() => toggleStation(selectedStation)}
          onNext={playNextRadio}
          onPrev={playPrevRadio}
          isRecording={recorderState.isRecording}
          recordDurationText={formatTimer(recorderState.durationMillis)}
          onToggleRecord={recorderState.isRecording ? stopRecording : startRecording}
          sleepSeconds={sleepSeconds}
          onSleepTimerPress={() => setSleepModalVisible(true)}
          frequencyText={`${(88 + ((selectedStation.name.length * 7) % 200) / 10).toFixed(1)} MHz FM STEREO`}
          showControls={showControls}
          onTap={handlePlayerTap}
        />
      ) : (
        <RadioChassisPlayer
          type="radio"
          title="📻 MOBİL CANLI TR RADYO"
          subtitle="Bir kategori seçip dinlemek istediğiniz radyoyu başlatın"
          isPlaying={false}
          onTogglePlay={() => {}}
          sleepSeconds={sleepSeconds}
          onSleepTimerPress={() => setSleepModalVisible(true)}
          frequencyText="104.5 MHz FM BEKLEMEDE"
          showControls={false}
          onTap={() => {}}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Controls & Now Playing */}
      {renderTopBarAndPlayer()}

      {/* DURUM 1: Ana Ekranda Sadece Kategoriler Görünür */}
      {!selectedCategory ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoryMenuContent}
          ListHeaderComponent={
            <View style={styles.categoryMenuHeader}>
              <Text style={styles.categoryMenuTitle}>📑 RADYO KATEGORİLERİ</Text>
              <Text style={styles.categoryMenuSubtitle}>Dinlemek istediğiniz yayınlar için bir kategori seçin:</Text>
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
                  <Text style={styles.categoryMenuBadgeText}>{count} Radyo ›</Text>
                </View>
              </Pressable>
            );
          }}
        />
      ) : (
        /* DURUM 2: Bir Kategoriye Tıklandığında Radyolar Görünür */
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
                style={styles.radioSearchInput}
                placeholder={`${selectedCatObj.label} içinde ara...`}
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <View style={styles.listHeaderBar}>
                <Text style={styles.listHeaderTitle}>
                  {selectedCatObj.label} ({filteredStations.length} Radyo)
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = selectedStation?.id === item.id;
            return (
              <Pressable 
                style={[styles.stationCard, isSelected && styles.playingCard]} 
                onPress={() => toggleStation(item)}
              >
                <View style={styles.stationInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.stationName, isSelected && styles.stationNameSelected]}>
                      {item.name}
                    </Text>
                    {item.category && (
                      <View style={styles.tagBadgeContainer}>
                        <Text style={styles.tagBadgeText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                  {isSelected && (
                    <Text style={[styles.playingText, !isRadioPlaying && styles.pausedText]}>
                      {isRadioPlaying ? '▶ Canlı Çalıyor...' : '⏸ Duraklatıldı'}
                    </Text>
                  )}
                  {item.isCustom && <Text style={styles.customBadge}>Eklediğiniz Radyo</Text>}
                </View>

                <View style={styles.cardRightAction}>
                  <View style={[styles.miniStatusIndicator, isSelected && (isRadioPlaying ? styles.indicatorPlaying : styles.indicatorPaused)]}>
                    <Text style={styles.miniStatusIcon}>
                      {isSelected ? (isRadioPlaying ? '🔊' : '⏸') : '▶'}
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

      {/* MODAL: Kanal Ekle */}
      <Modal visible={channelModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Radyo Kanalı Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="Radyo Adı (Örn: Moral FM)"
              placeholderTextColor="#888"
              value={newChannelName}
              onChangeText={setNewChannelName}
            />
            <TextInput
              style={styles.input}
              placeholder="Yayın Linki (URL / m3u8 / mp3)"
              placeholderTextColor="#888"
              value={newChannelUrl}
              onChangeText={setNewChannelUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Category selection inside modal */}
            <Text style={styles.modalSubLabel}>Kategori Seçin:</Text>
            <View style={styles.modalCategoryRow}>
              {(["Kur'an", 'İslami', 'Ulusal', 'Bölgesel', 'Haber', 'Genel', 'Müzik'] as const).map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.modalCatBadge, newChannelCategory === cat && styles.modalCatBadgeActive]}
                  onPress={() => setNewChannelCategory(cat)}
                >
                  <Text style={[styles.modalCatText, newChannelCategory === cat && styles.modalCatTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setChannelModalVisible(false)}>
                <Text style={styles.modalBtnText}>İptal</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={handleAddChannel}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Kaydet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Ses Kaydı Düzenle & Dinle */}
      <Modal visible={recorderModalVisible} animationType="slide" transparent={false}>
        <View style={styles.recorderModalContainer}>
          <View style={styles.recorderHeader}>
            <Text style={styles.recorderTitle}>🎙️ Ses Kaydedici & Kayıtlarım</Text>
            <Pressable style={styles.closeBtn} onPress={() => setRecorderModalVisible(false)}>
              <Text style={styles.closeBtnText}>✕ Kapat</Text>
            </Pressable>
          </View>

          {/* If radio is active, show banner */}
          {selectedStation && isRadioPlaying && (
            <View style={styles.radioActiveBanner}>
              <Text style={styles.radioActiveBannerText}>
                📻 Şu an dinlenen: <Text style={{ fontWeight: 'bold' }}>{selectedStation.name}</Text>
              </Text>
              <Text style={styles.radioActiveBannerSub}>
                Radyo çalmaya devam ederken mikrofon ile sesini kaydedebilirsiniz.
              </Text>
            </View>
          )}

          {/* Recording Studio Box */}
          <View style={styles.recordBox}>
            <Text style={styles.recordTimer}>
              {recorderState.isRecording ? `🔴 ${formatTimer(recorderState.durationMillis)}` : '00:00'}
            </Text>
            <Text style={styles.recordStatusText}>
              {recorderState.isRecording 
                ? 'Kayıt yapılıyor... Konuşabilir veya radyo sesini kaydedebilirsiniz.' 
                : 'Kayıt başlatmak için aşağıdaki butona basın.'}
            </Text>
            <Pressable
              style={[styles.bigRecordBtn, recorderState.isRecording ? styles.bigStopBtn : styles.bigStartBtn]}
              onPress={recorderState.isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.bigRecordBtnText}>
                {recorderState.isRecording ? '⏹ Kaydı Bitir ve Kaydet' : '🔴 Kayda Başla'}
              </Text>
            </Pressable>
          </View>

          {/* Saved Recordings Section */}
          <View style={styles.recordingsListHeader}>
            <Text style={styles.recordingsListTitle}>Kayıt Geçmişi ({savedRecordings.length})</Text>
          </View>

          {savedRecordings.length === 0 ? (
            <View style={styles.emptyRecordings}>
              <Text style={styles.emptyText}>Henüz kayıtlı bir ses dosyası bulunmuyor.</Text>
            </View>
          ) : (
            <FlatList
              data={savedRecordings}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 30 }}
              renderItem={({ item }) => {
                const isPlayingThis = playingRecordingUri === item.uri && isRecordingPlaying;
                return (
                  <View style={styles.recordingCard}>
                    <View style={styles.recordingMeta}>
                      <Text style={styles.recordingName}>{item.name}</Text>
                      <Text style={styles.recordingDate}>{item.date} • Süre: {item.duration}</Text>
                    </View>
                    <View style={styles.recordingActions}>
                      <Pressable 
                        style={[styles.recActionBtn, isPlayingThis ? styles.recPauseBtn : styles.recPlayBtn]}
                        onPress={() => togglePlayRecording(item)}
                      >
                        <Text style={styles.recActionBtnText}>{isPlayingThis ? '⏸ Durdur' : '▶ Dinle'}</Text>
                      </Pressable>
                      <Pressable style={[styles.recActionBtn, styles.recShareBtn]} onPress={() => shareRecording(item.uri)}>
                        <Text style={styles.recActionBtnText}>Paylaş</Text>
                      </Pressable>
                      <Pressable style={[styles.recActionBtn, styles.recDeleteBtn]} onPress={() => deleteRecording(item.id)}>
                        <Text style={[styles.recActionBtnText, { color: '#d32f2f' }]}>Sil</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </Modal>

      {/* Quick Sleep Timer Modal on Radio Screen */}
      <Modal visible={sleepModalVisible} animationType="fade" transparent>
        <View style={styles.sleepModalOverlay}>
          <View style={styles.sleepModalContent}>
            <View style={styles.sleepModalHeader}>
              <Text style={styles.sleepModalTitle}>🌙 Uyku Modu (Süre Ölçer)</Text>
              {sleepSeconds > 0 && (
                <View style={styles.activeTimerBadgeModal}>
                  <Text style={styles.activeTimerTextModal}>⏳ {Math.floor(sleepSeconds / 60)}:{('0' + (sleepSeconds % 60)).slice(-2)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.sleepModalDesc}>
              Radyo yayınının otomatik olarak durdurulacağı süreyi seçiniz:
            </Text>
            <View style={styles.sleepModalPresetsGrid}>
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((mins) => {
                const isSelected = sleepSeconds > 0 && Math.abs(Math.ceil(sleepSeconds / 60) - mins) <= 1;
                return (
                  <Pressable
                    key={mins}
                    style={[
                      styles.sleepPresetModalBtn,
                      isSelected && styles.sleepPresetModalBtnActive
                    ]}
                    onPress={() => {
                      sleepTimer.setTimer(mins);
                      setSleepModalVisible(false);
                      Alert.alert('Uyku Modu Aktif', `Radyo ${mins} dakika sonra otomatik kapanacaktır.`);
                    }}
                  >
                    <Text style={[
                      styles.sleepPresetModalText,
                      isSelected && styles.sleepPresetModalTextActive
                    ]}>
                      {mins} dk
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {sleepSeconds > 0 && (
              <Pressable
                style={styles.cancelSleepModalBtn}
                onPress={() => {
                  sleepTimer.cancelTimer();
                  setSleepModalVisible(false);
                  Alert.alert('Uyku Modu İptal Edildi', 'Zamanlayıcı kapatıldı.');
                }}
              >
                <Text style={styles.cancelSleepModalText}>❌ Süre Ölçeri Kapat</Text>
              </Pressable>
            )}
            <Pressable style={styles.closeSleepModalBtn} onPress={() => setSleepModalVisible(false)}>
              <Text style={styles.closeSleepModalText}>Kapat</Text>
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
    backgroundColor: '#f8fafc',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recordActionBtn: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  recordActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  addChannelBtn: {
    backgroundColor: '#1b5e20',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  addChannelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  nowPlayingBar: {
    backgroundColor: '#1b5e20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  miniBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  miniBarInfo: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  miniBarTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniBarHint: {
    color: '#c8e6c9',
    fontSize: 11,
    marginTop: 2,
  },
  miniPlayPauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayPauseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullControlsCol: {
    flexDirection: 'column',
    gap: 10,
    backgroundColor: 'transparent',
  },
  nowPlayingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  liveBadgeSmall: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveBadgeSmallText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  nowPlayingControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'transparent',
  },
  radioZapBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  radioZapBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  fullControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  nowPlayingInfo: {
    flex: 1,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  nowPlayingTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  nowPlayingSubtitle: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  nowPlayingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  miniRecordBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  miniRecordBtnStart: {
    backgroundColor: '#c62828',
  },
  miniRecordBtnStop: {
    backgroundColor: '#212121',
  },
  miniRecordBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playPauseBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  playColor: {
    backgroundColor: '#2e7d32',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  pauseColor: {
    backgroundColor: '#d32f2f',
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  playPauseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  headerComponentContainer: {
    backgroundColor: '#f8fafc',
  },
  categoryToggleSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryToggleIcon: {
    fontSize: 20,
  },
  categoryToggleSub: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  categoryToggleTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  categoryToggleRight: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryToggleActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchAndActionBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#ffffff',
  },
  radioSearchInput: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#1e293b',
    fontSize: 13,
    marginBottom: 4,
  },
  // Vertical Categories Section (Alt Alta Sıralı)
  categoriesVerticalSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoriesHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
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
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryRowItemActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
    borderLeftWidth: 4,
    borderLeftColor: '#1b5e20',
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
    color: '#334155',
  },
  categoryRowLabelActive: {
    color: '#1b5e20',
    fontWeight: 'bold',
  },
  categoryCountBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountBadgeActive: {
    backgroundColor: '#2e7d32',
  },
  categoryCountText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  categoryCountTextActive: {
    color: '#ffffff',
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
    color: '#1b5e20',
    letterSpacing: 0.5,
  },
  categoryMenuSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  categoryMenuCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    color: '#1e293b',
  },
  categoryMenuCardDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  categoryMenuBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  categoryMenuBadgeText: {
    color: '#1b5e20',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Inside Category View Header Styles
  categoryListHeader: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  backToCategoriesBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  backToCategoriesText: {
    color: '#1b5e20',
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentCategoryBadge: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  listHeaderBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  stationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  stationInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
  },
  playingCard: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  stationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  stationNameSelected: {
    color: '#15803d',
  },
  tagBadgeContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tagBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  playingText: {
    color: '#16a34a',
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  pausedText: {
    color: '#d97706',
  },
  customBadge: {
    color: '#ea580c',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
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
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorPlaying: {
    backgroundColor: '#dcfce7',
  },
  indicatorPaused: {
    backgroundColor: '#fef3c7',
  },
  miniStatusIcon: {
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  deleteBtnText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
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
  },
  input: {
    height: 44,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  modalSubLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 6,
    marginTop: 4,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  modalCatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  modalCatBadgeActive: {
    backgroundColor: '#1b5e20',
  },
  modalCatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  modalCatTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: '#eee',
  },
  saveBtn: {
    backgroundColor: '#1b5e20',
  },
  modalBtnText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#555',
  },
  recorderModalContainer: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  recorderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recorderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  radioActiveBanner: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  radioActiveBannerText: {
    color: '#1b5e20',
    fontSize: 14,
  },
  radioActiveBannerSub: {
    color: '#388e3c',
    fontSize: 12,
    marginTop: 2,
  },
  recordBox: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recordTimer: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#d32f2f',
    letterSpacing: 1.5,
  },
  recordStatusText: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
    marginBottom: 18,
    textAlign: 'center',
  },
  bigRecordBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  bigStartBtn: {
    backgroundColor: '#d32f2f',
  },
  bigStopBtn: {
    backgroundColor: '#212121',
  },
  bigRecordBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingsListHeader: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  recordingsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyRecordings: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  recordingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recordingMeta: {
    backgroundColor: 'transparent',
  },
  recordingName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  recordingDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  recActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  recPlayBtn: {
    backgroundColor: '#e8f5e9',
  },
  recPauseBtn: {
    backgroundColor: '#ffebee',
  },
  recShareBtn: {
    backgroundColor: '#e3f2fd',
  },
  recDeleteBtn: {
    backgroundColor: '#fbe9e7',
  },
  recActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d32',
  },
  sleepModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sleepModalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sleepModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34D399',
  },
  activeTimerBadgeModal: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTimerTextModal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sleepModalDesc: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 18,
  },
  sleepModalPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  sleepPresetModalBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 70,
    alignItems: 'center',
  },
  sleepPresetModalBtnActive: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  sleepPresetModalText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sleepPresetModalTextActive: {
    color: '#34D399',
  },
  cancelSleepModalBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelSleepModalText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  closeSleepModalBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeSleepModalText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
