import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import {
  CatalogTvStation,
  CatalogRadioStation,
  CatalogMp4Video,
  defaultTvCatalog,
  defaultRadioCatalog,
  defaultMp4Catalog,
  tvCategories,
  radioCategories,
  mp4Categories,
  quranCategories,
} from '@/constants/mediaCatalog';
import {
  Qari,
  Surah,
  qarisList,
  surahsList,
  getSurahAudioUrl,
} from '@/constants/quranData';
import { playbackCoordinator } from '@/utils/playbackCoordinator';
import { sleepTimer } from '@/utils/sleepTimer';

type ActiveMediaKind = 'radio' | 'quran' | 'tv' | 'mp4';
type ModalSection = 'TV' | 'RADIO' | 'MP4' | 'QURAN' | 'ALL';
type CockpitThemeKey = 'neonBlue' | 'midnightGold' | 'emeraldMatrix';

interface SavedRecording {
  id: string;
  name: string;
  uri: string;
  date: string;
  duration: string;
}

const COCKPIT_THEMES: Record<
  CockpitThemeKey,
  {
    name: string;
    desc: string;
    outerBg: string;
    bezelBg: string;
    cardBg: string;
    cardBorder: string;
    dockBg: string;
    musicCardBg: string;
    musicCardAccent: string;
    waveBoxBg: string;
    neonPrimary: string;
    neonSecondary: string;
  }
> = {
  neonBlue: {
    name: 'Neon Mavi & Mor Kokpit (Orijinal)',
    desc: 'Fotoğraftaki mavi-mor multimedya ekran teması',
    outerBg: '#040B24',
    bezelBg: '#081542',
    cardBg: '#0F297A',
    cardBorder: '#2563EB',
    dockBg: '#0A1D56',
    musicCardBg: '#7E22CE',
    musicCardAccent: '#D946EF',
    waveBoxBg: '#2563EB',
    neonPrimary: '#38BDF8',
    neonSecondary: '#C084FC',
  },
  midnightGold: {
    name: 'Gece Siyah & Kehribar Kokpit',
    desc: 'Gece sürüşü ve karanlık ortam için göz yormayan tema',
    outerBg: '#05070B',
    bezelBg: '#0B0F19',
    cardBg: '#131C2E',
    cardBorder: '#D97706',
    dockBg: '#0F172A',
    musicCardBg: '#78350F',
    musicCardAccent: '#F59E0B',
    waveBoxBg: '#B45309',
    neonPrimary: '#FBBF24',
    neonSecondary: '#38BDF8',
  },
  emeraldMatrix: {
    name: 'Zümrüt Huzur Kokpit',
    desc: 'İslami zümrüt yeşili ve turkuaz multimedya teması',
    outerBg: '#021814',
    bezelBg: '#052922',
    cardBg: '#064E3B',
    cardBorder: '#10B981',
    dockBg: '#04392E',
    musicCardBg: '#0F766E',
    musicCardAccent: '#2DD4BF',
    waveBoxBg: '#059669',
    neonPrimary: '#34D399',
    neonSecondary: '#38BDF8',
  },
};

const TR_DAYS = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

export default function MultimediaCockpit() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height || width >= 680;

  // Live Clock & Date
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dayStr = TR_DAYS[now.getDay()];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Catalogs (built-in + custom persisted)
  const [tvList, setTvList] = useState<CatalogTvStation[]>(defaultTvCatalog);
  const [radioList, setRadioList] = useState<CatalogRadioStation[]>(defaultRadioCatalog);
  const [mp4List, setMp4List] = useState<CatalogMp4Video[]>(defaultMp4Catalog);

  // Active Media Selections
  const [activeKind, setActiveKind] = useState<ActiveMediaKind>('radio');
  const [viewportMode, setViewportMode] = useState<'visualizer' | 'video'>('visualizer');

  const [currentRadio, setCurrentRadio] = useState<CatalogRadioStation>(defaultRadioCatalog[0]);
  const [currentTv, setCurrentTv] = useState<CatalogTvStation>(defaultTvCatalog[6]); // Mekke TV
  const [currentMp4, setCurrentMp4] = useState<CatalogMp4Video>(defaultMp4Catalog[0]); // Fatiha MP4
  const [currentQari, setCurrentQari] = useState<Qari>(qarisList[0]);
  const [currentSurah, setCurrentSurah] = useState<Surah>(surahsList[0]);

  // Theme & Equalizer Preset
  const [themeKey, setThemeKey] = useState<CockpitThemeKey>('neonBlue');
  const [eqPreset, setEqPreset] = useState<'Normal' | 'Kur\'an Net Ses' | 'Derin Bas' | 'Canlı Stüdyo'>('Kur\'an Net Ses');
  const theme = COCKPIT_THEMES[themeKey];

  // Category & Channel Modal State (Hidden by default, opens ONLY when clicked!)
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [modalSection, setModalSection] = useState<ModalSection>('MP4');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Add Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newMediaType, setNewMediaType] = useState<'mp4' | 'tv' | 'radio'>('mp4');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  // EQ / Recorder / Sleep Timer / Theme Modal State
  const [eqModalVisible, setEqModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);

  // Audio & Video Active URLs (Explicit state so player hooks always reload and auto-play)
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const audioPlayer = useAudioPlayer(activeAudioUrl);
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  const isAudioPlaying = Boolean(audioStatus.playing);

  const videoViewRef = useRef<VideoView>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoPosSec, setVideoPosSec] = useState(0);
  const [videoDurSec, setVideoDurSec] = useState(0);

  const videoPlayer = useVideoPlayer(activeVideoUrl, (p) => {
    p.loop = true;
    p.staysActiveInBackground = true;
    p.showNowPlayingNotification = true;
    if (activeVideoUrl) {
      p.play();
    }
  });

  // Voice Recorder
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 300);

  // Configure Audio Session & Load Custom Data
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});

    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@cockpit_theme_v1');
        if (savedTheme && (savedTheme === 'neonBlue' || savedTheme === 'midnightGold' || savedTheme === 'emeraldMatrix')) {
          setThemeKey(savedTheme);
        }
        const savedCustomMp4 = await AsyncStorage.getItem('@cockpit_custom_mp4_v1');
        if (savedCustomMp4) {
          const parsed: CatalogMp4Video[] = JSON.parse(savedCustomMp4);
          setMp4List([...parsed, ...defaultMp4Catalog]);
        }
        const savedCustomTv = await AsyncStorage.getItem('@cockpit_custom_tv_v1');
        if (savedCustomTv) {
          const parsed: CatalogTvStation[] = JSON.parse(savedCustomTv);
          setTvList([...parsed, ...defaultTvCatalog]);
        }
        const savedCustomRadio = await AsyncStorage.getItem('@cockpit_custom_radio_v1');
        if (savedCustomRadio) {
          const parsed: CatalogRadioStation[] = JSON.parse(savedCustomRadio);
          setRadioList([...parsed, ...defaultRadioCatalog]);
        }
        const savedRecs = await AsyncStorage.getItem('@user_voice_recordings_v1');
        if (savedRecs) {
          setRecordings(JSON.parse(savedRecs));
        }
      } catch {}
    })();
  }, []);

  // Sleep Timer Subscription
  useEffect(() => {
    const unsubTick = sleepTimer.subscribe((remSec: number) => {
      setSleepRemaining(remSec > 0 ? Math.ceil(remSec / 60) : null);
    });
    const unsubStop = sleepTimer.onExpire(() => {
      try {
        audioPlayer.pause();
      } catch {}
      try {
        videoPlayer.pause();
      } catch {}
    });
    return () => {
      unsubTick();
      unsubStop();
    };
  }, [audioPlayer, videoPlayer]);

  // Playback Coordinator Subscription (Pause if another tab starts playing)
  useEffect(() => {
    const stopAudioAndVideo = () => {
      try {
        audioPlayer.pause();
      } catch {}
      try {
        videoPlayer.pause();
      } catch {}
    };
    const unsubRadio = playbackCoordinator.register('radio', () => {
      try {
        videoPlayer.pause();
      } catch {}
    });
    const unsubTv = playbackCoordinator.register('tv', () => {
      try {
        audioPlayer.pause();
      } catch {}
    });
    const unsubMp4 = playbackCoordinator.register('mp4', () => {
      try {
        audioPlayer.pause();
      } catch {}
    });
    const unsubQuran = playbackCoordinator.register('quran', () => {
      try {
        videoPlayer.pause();
      } catch {}
    });
    return () => {
      unsubRadio();
      unsubTv();
      unsubMp4();
      unsubQuran();
      stopAudioAndVideo();
    };
  }, [audioPlayer, videoPlayer]);

  // Track Video Status & Progress
  useEffect(() => {
    const sub = videoPlayer.addListener('playingChange', (ev) => {
      setIsVideoPlaying(ev.isPlaying);
    });
    const timer = setInterval(() => {
      try {
        setVideoPosSec(Math.floor(videoPlayer.currentTime || 0));
        setVideoDurSec(Math.floor(videoPlayer.duration || 0));
      } catch {}
    }, 1000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [videoPlayer]);

  // Auto-advance Quran Surah when finished
  useEffect(() => {
    if (
      activeKind === 'quran' &&
      audioStatus.didJustFinish
    ) {
      const idx = surahsList.findIndex((s) => s.code === currentSurah.code);
      const nextIdx = (idx + 1) % surahsList.length;
      const nextSurah = surahsList[nextIdx];
      setCurrentSurah(nextSurah);
      setActiveAudioUrl(getSurahAudioUrl(currentQari, nextSurah));
    }
  }, [activeKind, audioStatus.didJustFinish, currentSurah, currentQari]);

  // Auto-play audio whenever activeAudioUrl updates
  useEffect(() => {
    if (activeAudioUrl && audioPlayer) {
      try {
        audioPlayer.play();
      } catch {}
    }
  }, [activeAudioUrl, audioPlayer]);

  // Auto-play video whenever activeVideoUrl updates
  useEffect(() => {
    if (activeVideoUrl && videoPlayer) {
      try {
        videoPlayer.play();
      } catch {}
    }
  }, [activeVideoUrl, videoPlayer]);

  // Pause video when switching to audio and vice versa
  const playRadioStation = useCallback(
    (station: CatalogRadioStation) => {
      playbackCoordinator.notifyActive('radio');
      try {
        videoPlayer.pause();
      } catch {}
      setActiveVideoUrl(null);
      setCurrentRadio(station);
      setActiveKind('radio');
      setViewportMode('visualizer');
      if (activeAudioUrl === station.url) {
        try {
          audioPlayer.play();
        } catch {}
      } else {
        setActiveAudioUrl(station.url);
      }
    },
    [activeAudioUrl, audioPlayer, videoPlayer]
  );

  const playQuranSurah = useCallback(
    (qari: Qari, surah: Surah) => {
      playbackCoordinator.notifyActive('quran');
      try {
        videoPlayer.pause();
      } catch {}
      setActiveVideoUrl(null);
      setCurrentQari(qari);
      setCurrentSurah(surah);
      setActiveKind('quran');
      setViewportMode('visualizer');
      const nextUrl = getSurahAudioUrl(qari, surah);
      if (activeAudioUrl === nextUrl) {
        try {
          audioPlayer.play();
        } catch {}
      } else {
        setActiveAudioUrl(nextUrl);
      }
    },
    [activeAudioUrl, audioPlayer, videoPlayer]
  );

  const playTvStation = useCallback(
    (station: CatalogTvStation) => {
      playbackCoordinator.notifyActive('tv');
      try {
        audioPlayer.pause();
      } catch {}
      setActiveAudioUrl(null);
      setCurrentTv(station);
      setActiveKind('tv');
      setViewportMode('video');
      if (activeVideoUrl === station.url) {
        try {
          videoPlayer.play();
        } catch {}
      } else {
        setActiveVideoUrl(station.url);
      }
    },
    [activeVideoUrl, audioPlayer, videoPlayer]
  );

  const playMp4Video = useCallback(
    (video: CatalogMp4Video) => {
      playbackCoordinator.notifyActive('mp4');
      try {
        audioPlayer.pause();
      } catch {}
      setActiveAudioUrl(null);
      setCurrentMp4(video);
      setActiveKind('mp4');
      setViewportMode('video');
      if (activeVideoUrl === video.url) {
        try {
          videoPlayer.replay();
          videoPlayer.play();
        } catch {}
      } else {
        setActiveVideoUrl(video.url);
      }
    },
    [activeVideoUrl, audioPlayer, videoPlayer]
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Optional: keep playing in background when screen blurs
      };
    }, [])
  );

  // Transport helpers for Music/Quran Card (Top-Right)
  const toggleQuranPlay = () => {
    if (activeKind !== 'quran' || !activeAudioUrl) {
      playQuranSurah(currentQari, currentSurah);
      return;
    }
    if (isAudioPlaying) {
      audioPlayer.pause();
    } else {
      playbackCoordinator.notifyActive('quran');
      try {
        videoPlayer.pause();
      } catch {}
      setActiveVideoUrl(null);
      audioPlayer.play();
    }
  };

  const stepQuranSurah = (dir: -1 | 1) => {
    const idx = surahsList.findIndex((s) => s.code === currentSurah.code);
    const nextIdx = (idx + dir + surahsList.length) % surahsList.length;
    playQuranSurah(currentQari, surahsList[nextIdx]);
  };

  // Transport helpers for Radio Card (Bottom-Left)
  const toggleRadioPlay = () => {
    if (activeKind !== 'radio' || !activeAudioUrl) {
      playRadioStation(currentRadio);
      return;
    }
    if (isAudioPlaying) {
      audioPlayer.pause();
    } else {
      playbackCoordinator.notifyActive('radio');
      try {
        videoPlayer.pause();
      } catch {}
      setActiveVideoUrl(null);
      audioPlayer.play();
    }
  };

  const stepRadioStation = (dir: -1 | 1) => {
    const idx = radioList.findIndex((r) => r.id === currentRadio.id);
    const nextIdx = (idx + dir + radioList.length) % radioList.length;
    playRadioStation(radioList[nextIdx]);
  };

  // Transport helpers for Video/TV Viewport (Center-Left)
  const toggleVideoPlay = () => {
    if ((activeKind !== 'tv' && activeKind !== 'mp4') || !activeVideoUrl) {
      playMp4Video(currentMp4);
      return;
    }
    if (isVideoPlaying) {
      videoPlayer.pause();
    } else {
      try {
        audioPlayer.pause();
      } catch {}
      setActiveAudioUrl(null);
      videoPlayer.play();
    }
  };

  const stepVideoItem = (dir: -1 | 1) => {
    if (activeKind === 'tv') {
      const idx = tvList.findIndex((t) => t.id === currentTv.id);
      const nextIdx = (idx + dir + tvList.length) % tvList.length;
      playTvStation(tvList[nextIdx]);
    } else {
      const idx = mp4List.findIndex((m) => m.id === currentMp4.id);
      const nextIdx = (idx + dir + mp4List.length) % mp4List.length;
      playMp4Video(mp4List[nextIdx]);
    }
  };

  const seekVideoBy = (seconds: number) => {
    try {
      videoPlayer.seekBy(seconds);
    } catch {}
  };

  // Open Category Modal (Categories first! Never clutter main screen!)
  const openCategoriesModal = (section: ModalSection) => {
    setModalSection(section);
    setSelectedCategoryKey(null);
    setSearchQuery('');
    setCategoryModalVisible(true);
  };

  // Save Custom Media (MP4 / TV / Radio)
  const handleAddCustomMedia = async () => {
    const title = newMediaTitle.trim();
    const url = newMediaUrl.trim();
    if (!title || !url) {
      Alert.alert('Eksik Bilgi', 'Lütfen medya adını ve yayın/MP4 bağlantısını girin.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Geçersiz Bağlantı', 'Bağlantı http:// veya https:// ile başlamalıdır.');
      return;
    }

    if (newMediaType === 'mp4') {
      const item: CatalogMp4Video = {
        id: `custom_mp4_${Date.now()}`,
        title,
        subtitle: 'Kullanıcı Özel MP4 Video',
        url,
        category: 'Özel MP4',
        quality: 'HD MP4',
        isCustom: true,
      };
      const updated = [item, ...mp4List];
      setMp4List(updated);
      const customs = updated.filter((x) => x.isCustom);
      await AsyncStorage.setItem('@cockpit_custom_mp4_v1', JSON.stringify(customs));
      playMp4Video(item);
    } else if (newMediaType === 'tv') {
      const item: CatalogTvStation = {
        id: `custom_tv_${Date.now()}`,
        name: title,
        url,
        category: 'Genel',
        isCustom: true,
      };
      const updated = [item, ...tvList];
      setTvList(updated);
      const customs = updated.filter((x) => x.isCustom);
      await AsyncStorage.setItem('@cockpit_custom_tv_v1', JSON.stringify(customs));
      playTvStation(item);
    } else {
      const item: CatalogRadioStation = {
        id: `custom_rad_${Date.now()}`,
        name: title,
        url,
        category: 'Genel',
        freq: 'FM 100.0',
        isCustom: true,
      };
      const updated = [item, ...radioList];
      setRadioList(updated);
      const customs = updated.filter((x) => x.isCustom);
      await AsyncStorage.setItem('@cockpit_custom_radio_v1', JSON.stringify(customs));
      playRadioStation(item);
    }

    setNewMediaTitle('');
    setNewMediaUrl('');
    setAddModalVisible(false);
  };

  // Voice Recording Controls
  const toggleRecording = async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
        const uri = recorder.uri;
        if (uri) {
          const item: SavedRecording = {
            id: `rec_${Date.now()}`,
            name: `Ses Kaydı ${recordings.length + 1}`,
            uri,
            date: new Date().toLocaleString('tr-TR'),
            duration: `${Math.max(1, Math.round((recorderState.durationMillis || 1000) / 1000))} sn`,
          };
          const updated = [item, ...recordings];
          setRecordings(updated);
          await AsyncStorage.setItem('@user_voice_recordings_v1', JSON.stringify(updated));
        }
      } else {
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('İzin Gerekli', 'Ses kaydı için mikrofon izni vermeniz gerekmektedir.');
          return;
        }
        await recorder.prepareToRecordAsync();
        recorder.record();
      }
    } catch {
      Alert.alert('Bilgi', 'Ses kaydı işlemi başlatılamadı.');
    }
  };

  const shareRecording = async (rec: SavedRecording) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(rec.uri);
      }
    } catch {}
  };

  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  // Determine Top Center Digital Readout for Cockpit Visualizer
  const digitalMainValue =
    activeKind === 'radio'
      ? (currentRadio.freq || 'FM 87.5').replace('FM ', '')
      : activeKind === 'quran'
      ? currentSurah.code
      : activeKind === 'mp4'
      ? 'MP4'
      : 'CANLI';

  const digitalUnitLabel =
    activeKind === 'radio'
      ? 'MHz • FM RADYO'
      : activeKind === 'quran'
      ? `${currentSurah.name.toUpperCase()} SÛRESİ`
      : activeKind === 'mp4'
      ? '1080p HD VİDEO'
      : 'HD TV YAYINI';

  const isAnythingPlaying = isAudioPlaying || isVideoPlaying;

  // Render Left Vertical Dock (Matches reference photo left column)
  const renderLeftDock = () => (
    <View
      style={[
        styles.leftDock,
        { backgroundColor: theme.dockBg, borderColor: theme.cardBorder + '55' },
        !isLandscape && styles.leftDockPortrait,
      ]}>
      {/* Date & Day Header */}
      <View style={styles.dockDateBox}>
        <Text style={styles.dockDateText}>{dateStr}</Text>
        <Text style={styles.dockDayText}>{dayStr}</Text>
      </View>

      {/* Middle Quick Action Icons */}
      <View style={[styles.dockIconsColumn, !isLandscape && styles.dockIconsRow]}>
        {/* 1. Navigation / Viewport Mode Toggle (Arrow/Compass icon in photo) */}
        <Pressable
          style={[
            styles.dockIconBtn,
            viewportMode === 'video' && { backgroundColor: theme.neonPrimary + '33', borderColor: theme.neonPrimary },
          ]}
          onPress={() => {
            if (viewportMode === 'video') {
              setViewportMode('visualizer');
            } else {
              if (!activeVideoUrl) {
                playMp4Video(currentMp4);
              } else {
                setViewportMode('video');
              }
            }
          }}>
          <Text style={styles.dockIconSymbol}>🧭</Text>
        </Pressable>

        {/* 2. Audio / Radio Quick Selector (Bluetooth/Audio icon in photo) */}
        <Pressable
          style={[
            styles.dockIconBtn,
            activeKind === 'radio' && { backgroundColor: theme.neonPrimary + '33', borderColor: theme.neonPrimary },
          ]}
          onPress={() => openCategoriesModal('RADIO')}>
          <Text style={styles.dockIconSymbol}>ᛒ</Text>
        </Pressable>

        {/* 3. Settings / EQ / Sleep Timer (Gear icon in photo) */}
        <Pressable
          style={styles.dockIconBtn}
          onPress={() => setEqModalVisible(true)}>
          <Text style={styles.dockIconSymbol}>⚙️</Text>
        </Pressable>
      </View>

      {/* Bottom Glowing Cyan-Purple Layers Button (Categories popup button in photo) */}
      <Pressable
        style={[
          styles.dockLayersBtn,
          { backgroundColor: theme.musicCardBg, borderColor: theme.neonPrimary },
        ]}
        onPress={() => openCategoriesModal('ALL')}>
        <View style={styles.dockLayersInnerGlow}>
          <Text style={styles.dockLayersIcon}>🗂️</Text>
          <Text style={styles.dockLayersLabel}>KATEGORİ</Text>
        </View>
      </Pressable>
    </View>
  );

  // Render Main Center-Left Visual Viewport Card (Digital Highway Visualizer OR Live VideoView)
  const renderMainViewportCard = () => (
    <View
      style={[
        styles.mainViewportCard,
        { borderColor: theme.cardBorder + '88' },
        !isLandscape && styles.mainViewportCardPortrait,
      ]}>
      {viewportMode === 'video' ? (
        <View style={styles.videoViewportContainer}>
          <VideoView
            ref={videoViewRef}
            player={videoPlayer}
            style={styles.cockpitVideoView}
            contentFit="contain"
            nativeControls={false}
            allowsPictureInPicture
          />

          {/* Top Overlay Badge inside Video Viewport */}
          <View style={styles.videoTopOverlay}>
            <View style={styles.videoFormatBadge}>
              <View style={[styles.liveDot, isVideoPlaying && styles.liveDotActive]} />
              <Text style={styles.videoFormatBadgeText}>
                {activeKind === 'tv' ? '📺 CANLI TV' : '🎬 MP4 VİDEO'}
              </Text>
            </View>
            <Text style={styles.videoOverlayTitle} numberOfLines={1}>
              {activeKind === 'tv' ? currentTv.name : currentMp4.title}
            </Text>
            <Pressable
              style={styles.videoSwitchModeChip}
              onPress={() => setViewportMode('visualizer')}>
              <Text style={styles.videoSwitchModeChipText}>🚘 Kokpit</Text>
            </Pressable>
          </View>

          {/* Bottom Transport Controls inside Video Viewport */}
          <View style={styles.videoBottomOverlay}>
            {activeKind === 'mp4' && videoDurSec > 0 && (
              <View style={styles.videoSeekRow}>
                <Text style={styles.videoTimeLabel}>{formatTime(videoPosSec)}</Text>
                <View style={styles.videoProgressBarTrack}>
                  <View
                    style={[
                      styles.videoProgressBarFill,
                      {
                        width: `${Math.min(100, Math.round((videoPosSec / Math.max(1, videoDurSec)) * 100))}%`,
                        backgroundColor: theme.neonPrimary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.videoTimeLabel}>{formatTime(videoDurSec)}</Text>
              </View>
            )}

            <View style={styles.videoControlButtonsRow}>
              <Pressable
                style={styles.videoCtrlSmallBtn}
                onPress={() => openCategoriesModal(activeKind === 'tv' ? 'TV' : 'MP4')}>
                <Text style={styles.videoCtrlSmallText}>🗂️ Kategori</Text>
              </Pressable>

              {activeKind === 'mp4' && (
                <Pressable style={styles.videoCtrlIconBtn} onPress={() => seekVideoBy(-15)}>
                  <Text style={styles.videoCtrlIconText}>⏪15</Text>
                </Pressable>
              )}

              <Pressable style={styles.videoCtrlIconBtn} onPress={() => stepVideoItem(-1)}>
                <Text style={styles.videoCtrlIconText}>⏮</Text>
              </Pressable>

              <Pressable
                style={[styles.videoCtrlPlayBtn, { backgroundColor: theme.neonPrimary }]}
                onPress={toggleVideoPlay}>
                <Text style={styles.videoCtrlPlayText}>{isVideoPlaying ? '⏸' : '▶'}</Text>
              </Pressable>

              <Pressable style={styles.videoCtrlIconBtn} onPress={() => stepVideoItem(1)}>
                <Text style={styles.videoCtrlIconText}>⏭</Text>
              </Pressable>

              {activeKind === 'mp4' && (
                <Pressable style={styles.videoCtrlIconBtn} onPress={() => seekVideoBy(15)}>
                  <Text style={styles.videoCtrlIconText}>15⏩</Text>
                </Pressable>
              )}

              <Pressable
                style={styles.videoCtrlSmallBtn}
                onPress={() => {
                  try {
                    videoViewRef.current?.enterFullscreen();
                  } catch {}
                }}>
                <Text style={styles.videoCtrlSmallText}>⛶ Tam</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        /* NEON DIGITAL HIGHWAY & HORIZON COCKPIT VISUALIZER (Matches photo center screen!) */
        <Pressable
          style={[styles.highwayVisualizer, { backgroundColor: '#07164E' }]}
          onPress={() => {
            if (activeKind === 'tv' || activeKind === 'mp4') {
              setViewportMode('video');
            } else {
              openCategoriesModal(activeKind === 'radio' ? 'RADIO' : 'QURAN');
            }
          }}>
          {/* Top Sky Glow & Digital Speedometer-Style Readout */}
          <View style={styles.skySection}>
            <View style={styles.topReadoutRow}>
              <Pressable
                style={styles.cockpitCategoryPill}
                onPress={() => openCategoriesModal('TV')}>
                <Text style={styles.cockpitCategoryPillText}>📺 Canlı TV</Text>
              </Pressable>

              <View style={styles.digitalCenterCluster}>
                <Text style={styles.digitalBigNumber}>{digitalMainValue}</Text>
                <Text style={styles.digitalUnitText}>{digitalUnitLabel}</Text>
              </View>

              <Pressable
                style={styles.cockpitCategoryPill}
                onPress={() => {
                  setViewportMode('video');
                  if (activeKind !== 'tv' && activeKind !== 'mp4') {
                    playMp4Video(currentMp4);
                  }
                }}>
                <Text style={styles.cockpitCategoryPillText}>🎬 Video Ekran</Text>
              </Pressable>
            </View>

            {/* Glowing White/Cyan Horizon Ridges (Just like the mountains/waves in the photo!) */}
            <View style={styles.horizonGlowLine} />
            <View style={styles.horizonMountainLeft} />
            <View style={styles.horizonMountainRight} />
          </View>

          {/* Perspective Neon Highway Road & Center Vehicle / Audio Core */}
          <View style={styles.roadSection}>
            {/* Perspective Grid Lines */}
            <View style={[styles.roadLaneLeftOuter, { borderColor: theme.neonPrimary + '55' }]} />
            <View style={[styles.roadLaneLeftInner, { borderColor: theme.neonPrimary }]} />
            <View style={[styles.roadLaneRightInner, { borderColor: theme.neonPrimary }]} />
            <View style={[styles.roadLaneRightOuter, { borderColor: theme.neonPrimary + '55' }]} />

            {/* Center Cockpit Car / Audio Emblem */}
            <View style={styles.centerCockpitEmblemBox}>
              <View style={[styles.carSilhouetteRoof, { borderColor: theme.neonPrimary }]} />
              <View style={[styles.carSilhouetteBody, { borderColor: theme.neonPrimary }]}>
                {/* Red/Magenta Tail Light Bar (like the sports car in the photo) */}
                <View style={styles.carTaillightLeft} />
                <View style={styles.carLicensePlate}>
                  <Text style={styles.carLicenseText}>
                    {activeKind === 'radio'
                      ? 'RADYO FM'
                      : activeKind === 'quran'
                      ? 'KURAN 114'
                      : activeKind === 'tv'
                      ? 'CANLI TV'
                      : 'MP4 HD'}
                  </Text>
                </View>
                <View style={styles.carTaillightRight} />
              </View>

              {/* Active Media Title Banner under the car */}
              <View style={styles.roadNowPlayingBanner}>
                <Text style={styles.roadNowPlayingTitle} numberOfLines={1}>
                  {activeKind === 'radio'
                    ? `📻 ${currentRadio.name}`
                    : activeKind === 'quran'
                    ? `📖 ${currentSurah.number}. ${currentSurah.name} (${currentQari.name})`
                    : activeKind === 'tv'
                    ? `📺 ${currentTv.name}`
                    : `🎬 ${currentMp4.title}`}
                </Text>
                <Text style={styles.roadNowPlayingHint}>
                  {isAnythingPlaying ? '🟢 Yayında • Kategori seçmek için dokunun' : '⏸ Hazır • Oynatmak veya kategori açmak için dokunun'}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );

  // Render Top-Right Purple/Magenta Card ("Müzik / Kur'an" card in reference photo)
  const renderMusicQuranCard = () => (
    <Pressable
      style={[
        styles.musicQuranCard,
        { backgroundColor: theme.musicCardBg, borderColor: theme.musicCardAccent + '88' },
        !isLandscape && styles.musicQuranCardPortrait,
      ]}
      onPress={() => openCategoriesModal('QURAN')}>
      {/* Translucent Circular Disc Watermark in Top-Right (exact match to photo) */}
      <View style={styles.discWatermarkOuter}>
        <View style={styles.discWatermarkInner}>
          <Text style={styles.discWatermarkIcon}>♪</Text>
        </View>
      </View>

      {/* Top Title & Active Qari / Surah Info */}
      <View style={styles.musicCardHeader}>
        <View style={styles.musicCardTitleRow}>
          <Text style={styles.musicCardTitle}>Müzik • Kur&apos;an</Text>
          <View style={styles.categoryOpenHintBadge}>
            <Text style={styles.categoryOpenHintText}>Kategoriler ▾</Text>
          </View>
        </View>
        <Text style={styles.musicCardSurahName} numberOfLines={1}>
          {currentSurah.number}. {currentSurah.name} Sûresi ({currentSurah.arabicName})
        </Text>
        <Text style={styles.musicCardQariName} numberOfLines={1}>
          🎙️ {currentQari.name}
        </Text>
      </View>

      {/* Bottom Transport Controls: Prev | Circular Play/Pause | Next */}
      <View style={styles.musicCardControlsRow}>
        <Pressable
          style={styles.musicStepBtn}
          onPress={(e) => {
            e.stopPropagation();
            stepQuranSurah(-1);
          }}>
          <Text style={styles.musicStepIcon}>⏮</Text>
        </Pressable>

        <Pressable
          style={[styles.musicPlayCircleBtn, { backgroundColor: theme.musicCardAccent }]}
          onPress={(e) => {
            e.stopPropagation();
            toggleQuranPlay();
          }}>
          <Text style={styles.musicPlayCircleIcon}>
            {activeKind === 'quran' && isAudioPlaying ? '⏸' : '▶'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.musicStepBtn}
          onPress={(e) => {
            e.stopPropagation();
            stepQuranSurah(1);
          }}>
          <Text style={styles.musicStepIcon}>⏭</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  // Render Bottom-Left Deep Blue Card ("Radyo FM 87.5" + Neon Soundwave Square in reference photo)
  const renderRadioCard = () => (
    <Pressable
      style={[
        styles.radioCard,
        { backgroundColor: theme.cardBg, borderColor: theme.cardBorder + '88' },
        !isLandscape && styles.radioCardPortrait,
      ]}
      onPress={() => openCategoriesModal('RADIO')}>
      {/* Left Column: Title, FM Frequency, Station Name, Transport Controls */}
      <View style={styles.radioCardLeftCol}>
        <View style={styles.radioHeaderRow}>
          <Text style={styles.radioCardTitle}>Radyo</Text>
          <Text style={styles.radioCategoryHint}>Kategori Seç ▾</Text>
        </View>

        <Text style={styles.radioFreqBigText} numberOfLines={1}>
          {currentRadio.freq || 'FM 87.5'}
        </Text>
        <Text style={styles.radioStationSubText} numberOfLines={1}>
          {currentRadio.name}
        </Text>

        <View style={styles.radioControlsRow}>
          <Pressable
            style={styles.radioCtrlBtn}
            onPress={(e) => {
              e.stopPropagation();
              stepRadioStation(-1);
            }}>
            <Text style={styles.radioCtrlIcon}>⏮</Text>
          </Pressable>

          <Pressable
            style={[
              styles.radioCtrlBtn,
              activeKind === 'radio' && isAudioPlaying && { backgroundColor: theme.neonPrimary + '44' },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              toggleRadioPlay();
            }}>
            <Text style={styles.radioCtrlIcon}>
              {activeKind === 'radio' && isAudioPlaying ? '⏸' : '▶'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.radioCtrlBtn}
            onPress={(e) => {
              e.stopPropagation();
              stepRadioStation(1);
            }}>
            <Text style={styles.radioCtrlIcon}>⏭</Text>
          </Pressable>
        </View>
      </View>

      {/* Right Column: Glowing Neon Soundwave Square (Exact match to photo!) */}
      <Pressable
        style={[
          styles.radioWaveSquare,
          { backgroundColor: theme.waveBoxBg, borderColor: theme.neonPrimary + '99' },
        ]}
        onPress={() => openCategoriesModal('RADIO')}>
        <View style={styles.waveBarsContainer}>
          {[0.35, 0.6, 0.95, 0.5, 0.85, 1.0, 0.65, 0.4, 0.75].map((ratio, idx) => {
            const activeBoost =
              activeKind === 'radio' && isAudioPlaying
                ? idx % 2 === 0
                  ? 1.0
                  : 0.7
                : 0.45;
            return (
              <View
                key={idx}
                style={[
                  styles.waveBarItem,
                  {
                    height: Math.max(8, Math.round(52 * ratio * activeBoost)),
                    backgroundColor: idx % 3 === 0 ? '#F472B6' : idx % 2 === 0 ? '#38BDF8' : '#C084FC',
                  },
                ]}
              />
            );
          })}
        </View>
      </Pressable>
    </Pressable>
  );

  // Render Bottom-Right "Uygulamalar" Card (Video, Canlı TV, EQ, Tema, Galeri, + icons)
  const renderAppsCard = () => (
    <View
      style={[
        styles.appsCard,
        { backgroundColor: theme.cardBg, borderColor: theme.cardBorder + '88' },
        !isLandscape && styles.appsCardPortrait,
      ]}>
      <View style={styles.appsHeaderRow}>
        <Text style={styles.appsCardTitle}>Uygulamalar</Text>
        <Text style={styles.appsCardHint}>Kategorileri açmak için dokunun</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.appsIconsRow}>
        {/* 1. Video (MP4) - Matches blue/purple play icon in photo */}
        <Pressable
          style={styles.appTileItem}
          onPress={() => openCategoriesModal('MP4')}>
          <View style={[styles.appTileIconBox, { backgroundColor: '#3B82F6' }]}>
            <View style={styles.appTilePlayCircle}>
              <Text style={styles.appTilePlayTriangle}>▶</Text>
            </View>
          </View>
          <Text style={styles.appTileLabel}>Video</Text>
        </Pressable>

        {/* 2. Canlı TV - Opens TV Categories */}
        <Pressable
          style={styles.appTileItem}
          onPress={() => openCategoriesModal('TV')}>
          <View style={[styles.appTileIconBox, { backgroundColor: '#0284C7' }]}>
            <Text style={styles.appTileEmoji}>📺</Text>
          </View>
          <Text style={styles.appTileLabel}>Canlı TV</Text>
        </Pressable>

        {/* 3. EQ / Ses Kayıt - Matches red-orange EQ sliders icon in photo */}
        <Pressable
          style={styles.appTileItem}
          onPress={() => setEqModalVisible(true)}>
          <View style={[styles.appTileIconBox, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.appTileSlidersText}>🎚️</Text>
          </View>
          <Text style={styles.appTileLabel}>EQ</Text>
        </Pressable>

        {/* 4. Tema - Matches orange/blue diagonal brush icon in photo */}
        <Pressable
          style={styles.appTileItem}
          onPress={() => setThemeModalVisible(true)}>
          <View style={[styles.appTileIconBox, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.appTileEmoji}>🎨</Text>
          </View>
          <Text style={styles.appTileLabel}>Tema</Text>
        </Pressable>

        {/* 5. Galeri / Tüm Rehber - Matches sky/sand gallery icon in photo */}
        <Pressable
          style={styles.appTileItem}
          onPress={() => openCategoriesModal('ALL')}>
          <View style={[styles.appTileIconBox, { backgroundColor: '#38BDF8' }]}>
            <Text style={styles.appTileEmoji}>🖼️</Text>
          </View>
          <Text style={styles.appTileLabel}>Galeri</Text>
        </Pressable>

        {/* 6. + (Yeni Kanal / MP4 Ekle) - Matches '+' icon in photo */}
        <Pressable
          style={styles.appTileItem}
          onPress={() => setAddModalVisible(true)}>
          <View style={[styles.appTileIconBox, styles.appTilePlusBox]}>
            <Text style={styles.appTilePlusSymbol}>＋</Text>
          </View>
          <Text style={styles.appTileLabel}>Ekle</Text>
        </Pressable>
      </ScrollView>
    </View>
  );

  // Determine filtered items inside the Category Modal once a Category is clicked
  const getCategoryListForSection = () => {
    if (modalSection === 'TV') return tvCategories;
    if (modalSection === 'RADIO') return radioCategories;
    if (modalSection === 'MP4') return mp4Categories;
    if (modalSection === 'QURAN') return quranCategories;
    return [];
  };

  const qNorm = searchQuery.trim().toLowerCase();

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: theme.outerBg,
          paddingTop: Math.max(insets.top, 6),
          paddingBottom: Math.max(insets.bottom, 6),
          paddingLeft: Math.max(insets.left, 8),
          paddingRight: Math.max(insets.right, 8),
        },
      ]}>
      {/* COCKPIT BEZEL FRAME */}
      <View style={[styles.cockpitBezel, { backgroundColor: theme.bezelBg, borderColor: theme.cardBorder + '66' }]}>
        {/* 1. TOP STATUS BAR (Matches photo top bar: Back, Home, App Switcher, Signal, Clock) */}
        <View style={styles.topStatusBar}>
          <View style={styles.topStatusLeft}>
            <Pressable
              style={styles.topNavIconBtn}
              onPress={() => {
                if (viewportMode === 'video') setViewportMode('visualizer');
              }}>
              <Text style={styles.topNavIconText}>↩</Text>
            </Pressable>
            <Pressable
              style={styles.topNavIconBtn}
              onPress={() => setViewportMode('visualizer')}>
              <Text style={styles.topNavIconText}>◯</Text>
            </Pressable>
            <Pressable
              style={styles.topNavIconBtn}
              onPress={() => openCategoriesModal('ALL')}>
              <Text style={styles.topNavIconText}>▢</Text>
            </Pressable>
            <Pressable
              style={styles.topNavIconBtn}
              onPress={() => {
                if (viewportMode === 'video') {
                  setViewportMode('visualizer');
                } else {
                  if (!activeVideoUrl) {
                    playMp4Video(currentMp4);
                  } else {
                    setViewportMode('video');
                  }
                }
              }}>
              <Text style={styles.topNavIconText}>🗔</Text>
            </Pressable>

            <View style={[styles.activeSourcePill, { borderColor: theme.neonPrimary + '88' }]}>
              <View style={[styles.liveDot, isAnythingPlaying && styles.liveDotActive]} />
              <Text style={styles.activeSourcePillText} numberOfLines={1}>
                {activeKind === 'radio'
                  ? `RADYO: ${currentRadio.name}`
                  : activeKind === 'quran'
                  ? `KUR'AN: ${currentSurah.name} (${currentQari.name})`
                  : activeKind === 'tv'
                  ? `TV: ${currentTv.name}`
                  : `MP4: ${currentMp4.title}`}
              </Text>
            </View>
          </View>

          <View style={styles.topStatusRight}>
            {sleepRemaining !== null && (
              <View style={styles.sleepBadge}>
                <Text style={styles.sleepBadgeText}>⏱️ {sleepRemaining} dk</Text>
              </View>
            )}
            <Text style={styles.statusIconText}>📶</Text>
            <Text style={styles.statusIconText}>ᛒ</Text>
            <Text style={styles.statusIconText}>🔊</Text>
            <Text style={styles.statusIconText}>🛜</Text>
            <Text style={styles.clockText}>{timeStr}</Text>
          </View>
        </View>

        {/* 2. MAIN COCKPIT BODY */}
        {isLandscape ? (
          <View style={styles.cockpitBodyLandscape}>
            {/* Left Vertical Dock */}
            {renderLeftDock()}

            {/* Right 2x2 Grid Area */}
            <View style={styles.cockpitGridArea}>
              {/* Top Row: Center-Left Main Viewport (62%) + Top-Right Music/Quran Card (38%) */}
              <View style={styles.cockpitTopRow}>
                <View style={styles.topRowLeftCol}>{renderMainViewportCard()}</View>
                <View style={styles.topRowRightCol}>{renderMusicQuranCard()}</View>
              </View>

              {/* Bottom Row: Bottom-Left Radio Card (46%) + Bottom-Right Apps Card (54%) */}
              <View style={styles.cockpitBottomRow}>
                <View style={styles.bottomRowLeftCol}>{renderRadioCard()}</View>
                <View style={styles.bottomRowRightCol}>{renderAppsCard()}</View>
              </View>
            </View>
          </View>
        ) : (
          /* Portrait Responsive Cockpit Layout (Same exact cards arranged cleanly for vertical screen) */
          <ScrollView
            style={styles.cockpitBodyPortrait}
            contentContainerStyle={styles.cockpitBodyPortraitContent}
            showsVerticalScrollIndicator={false}>
            {renderLeftDock()}
            {renderMainViewportCard()}
            <View style={styles.portraitMiddleRow}>
              <View style={styles.portraitHalfCol}>{renderRadioCard()}</View>
              <View style={styles.portraitHalfCol}>{renderMusicQuranCard()}</View>
            </View>
            {renderAppsCard()}
          </ScrollView>
        )}
      </View>

      {/* =====================================================================
          CATEGORY-FIRST POPUP MODAL (Kategoriler tıklanınca açılır!)
         ===================================================================== */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { backgroundColor: '#081542', borderColor: theme.neonPrimary }]}>
            {/* Modal Top Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                {selectedCategoryKey !== null && (
                  <Pressable
                    style={styles.modalBackBtn}
                    onPress={() => {
                      setSelectedCategoryKey(null);
                      setSearchQuery('');
                    }}>
                    <Text style={styles.modalBackBtnText}>⬅ Kategoriler</Text>
                  </Pressable>
                )}
                <Text style={styles.modalTitle}>
                  {modalSection === 'MP4'
                    ? '🎬 MP4 Video Kategorileri'
                    : modalSection === 'TV'
                    ? '📺 Canlı TV Kategorileri'
                    : modalSection === 'RADIO'
                    ? '📻 Canlı Radyo Kategorileri'
                    : modalSection === 'QURAN'
                    ? "📖 Kur'an-ı Kerim Kategorileri"
                    : '🗂️ Tüm Medya Kategorileri'}
                </Text>
              </View>

              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.modalCloseBtnText}>✕ Kapat</Text>
              </Pressable>
            </View>

            {/* Quick Section Switcher Tabs inside Modal */}
            <View style={styles.modalSectionTabsRow}>
              {(
                [
                  { key: 'MP4', label: '🎬 MP4 Video' },
                  { key: 'TV', label: '📺 Canlı TV' },
                  { key: 'RADIO', label: '📻 Radyo' },
                  { key: 'QURAN', label: "📖 Kur'an (114)" },
                ] as { key: ModalSection; label: string }[]
              ).map((tab) => {
                const active = modalSection === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    style={[
                      styles.modalSectionTab,
                      active && { backgroundColor: theme.neonPrimary, borderColor: '#FFF' },
                    ]}
                    onPress={() => {
                      setModalSection(tab.key);
                      setSelectedCategoryKey(null);
                      setSearchQuery('');
                    }}>
                    <Text style={[styles.modalSectionTabText, active && { color: '#040B24', fontWeight: '900' }]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* STEP 1: SHOW CATEGORIES ONLY (until a category is clicked!) */}
            {modalSection === 'ALL' ? (
              <ScrollView contentContainerStyle={styles.categoryCardsGrid}>
                <Pressable
                  style={[styles.bigSectionCard, { borderColor: '#38BDF8' }]}
                  onPress={() => {
                    setModalSection('MP4');
                    setSelectedCategoryKey(null);
                  }}>
                  <Text style={styles.bigSectionIcon}>🎬</Text>
                  <View style={styles.bigSectionTextCol}>
                    <Text style={styles.bigSectionTitle}>MP4 Video Kategorileri</Text>
                    <Text style={styles.bigSectionDesc}>
                      Görüntülü Kur&apos;an MP4, Mekke & Medine, Belgesel ve Doğa MP4 Videoları ({mp4List.length} Video)
                    </Text>
                  </View>
                  <Text style={styles.bigSectionArrow}>➔</Text>
                </Pressable>

                <Pressable
                  style={[styles.bigSectionCard, { borderColor: '#F43F5E' }]}
                  onPress={() => {
                    setModalSection('TV');
                    setSelectedCategoryKey(null);
                  }}>
                  <Text style={styles.bigSectionIcon}>📺</Text>
                  <View style={styles.bigSectionTextCol}>
                    <Text style={styles.bigSectionTitle}>Canlı TV Kategorileri</Text>
                    <Text style={styles.bigSectionDesc}>
                      İslami TV, Ulusal, Haber, Bölgesel, Spor, Belgesel ve Çocuk Kanalları ({tvList.length} Kanal)
                    </Text>
                  </View>
                  <Text style={styles.bigSectionArrow}>➔</Text>
                </Pressable>

                <Pressable
                  style={[styles.bigSectionCard, { borderColor: '#10B981' }]}
                  onPress={() => {
                    setModalSection('RADIO');
                    setSelectedCategoryKey(null);
                  }}>
                  <Text style={styles.bigSectionIcon}>📻</Text>
                  <View style={styles.bigSectionTextCol}>
                    <Text style={styles.bigSectionTitle}>Canlı Radyo Kategorileri</Text>
                    <Text style={styles.bigSectionDesc}>
                      7/24 Kur&apos;an Radyoları, İslami, Ulusal, Haber, Bölgesel ve Müzik FM ({radioList.length} İstasyon)
                    </Text>
                  </View>
                  <Text style={styles.bigSectionArrow}>➔</Text>
                </Pressable>

                <Pressable
                  style={[styles.bigSectionCard, { borderColor: '#C084FC' }]}
                  onPress={() => {
                    setModalSection('QURAN');
                    setSelectedCategoryKey(null);
                  }}>
                  <Text style={styles.bigSectionIcon}>📖</Text>
                  <View style={styles.bigSectionTextCol}>
                    <Text style={styles.bigSectionTitle}>Kur&apos;an-ı Kerim & Kâriler (114 Sûre)</Text>
                    <Text style={styles.bigSectionDesc}>
                      Türk Hafızlar, Huzur Kıraatleri ve Kâbe İmamlarından 114 Sûre Hatim ({qarisList.length} Hafız)
                    </Text>
                  </View>
                  <Text style={styles.bigSectionArrow}>➔</Text>
                </Pressable>

                {/* Optional Link to Classic Full Tab Screens */}
                <View style={styles.classicPagesRow}>
                  <Pressable
                    style={styles.classicPageChip}
                    onPress={() => {
                      setCategoryModalVisible(false);
                      router.push('/(tabs)/tv');
                    }}>
                    <Text style={styles.classicPageChipText}>📺 Klasik TV Sayfası</Text>
                  </Pressable>
                  <Pressable
                    style={styles.classicPageChip}
                    onPress={() => {
                      setCategoryModalVisible(false);
                      router.push('/(tabs)/mp4' as any);
                    }}>
                    <Text style={styles.classicPageChipText}>🎬 Klasik MP4 Sayfası</Text>
                  </Pressable>
                  <Pressable
                    style={styles.classicPageChip}
                    onPress={() => {
                      setCategoryModalVisible(false);
                      router.push('/(tabs)/kariler');
                    }}>
                    <Text style={styles.classicPageChipText}>📖 Klasik Kur&apos;an Sayfası</Text>
                  </Pressable>
                </View>
              </ScrollView>
            ) : selectedCategoryKey === null ? (
              /* CATEGORY CARDS LIST FOR SELECTED SECTION */
              <ScrollView contentContainerStyle={styles.categoryCardsGrid}>
                {getCategoryListForSection().map((cat) => (
                  <Pressable
                    key={cat.key}
                    style={styles.categoryCardItem}
                    onPress={() => setSelectedCategoryKey(cat.key)}>
                    <View style={styles.categoryCardIconCircle}>
                      <Text style={styles.categoryCardIconText}>{cat.icon}</Text>
                    </View>
                    <View style={styles.categoryCardTextCol}>
                      <Text style={styles.categoryCardTitle}>{cat.label}</Text>
                      <Text style={styles.categoryCardDesc}>{cat.desc}</Text>
                    </View>
                    <Text style={styles.categoryCardChevron}>Aç ➔</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              /* STEP 2: ITEMS INSIDE THE CLICKED CATEGORY */
              <View style={styles.categoryItemsWrapper}>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Kanal, MP4 video, hafız veya sûre ara..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />

                {modalSection === 'MP4' && (
                  <FlatList
                    data={mp4List.filter(
                      (m) =>
                        (selectedCategoryKey === 'Tümü' || m.category === selectedCategoryKey) &&
                        (!qNorm ||
                          m.title.toLowerCase().includes(qNorm) ||
                          m.subtitle.toLowerCase().includes(qNorm))
                    )}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const isCurrent = activeKind === 'mp4' && currentMp4.id === item.id;
                      return (
                        <Pressable
                          style={[styles.mediaListRow, isCurrent && styles.mediaListRowActive]}
                          onPress={() => {
                            playMp4Video(item);
                            setCategoryModalVisible(false);
                          }}>
                          <Text style={styles.mediaListRowIcon}>🎬</Text>
                          <View style={styles.mediaListRowTextCol}>
                            <Text style={styles.mediaListRowTitle}>{item.title}</Text>
                            <Text style={styles.mediaListRowSub}>
                              {item.subtitle} • {item.quality || 'MP4'}
                            </Text>
                          </View>
                          <Text style={styles.mediaListRowPlayBadge}>
                            {isCurrent ? '🟢 OYNUYOR' : '▶ OYNAT'}
                          </Text>
                        </Pressable>
                      );
                    }}
                  />
                )}

                {modalSection === 'TV' && (
                  <FlatList
                    data={tvList.filter(
                      (t) =>
                        (selectedCategoryKey === 'Tümü' || t.category === selectedCategoryKey) &&
                        (!qNorm || t.name.toLowerCase().includes(qNorm))
                    )}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const isCurrent = activeKind === 'tv' && currentTv.id === item.id;
                      return (
                        <Pressable
                          style={[styles.mediaListRow, isCurrent && styles.mediaListRowActive]}
                          onPress={() => {
                            playTvStation(item);
                            setCategoryModalVisible(false);
                          }}>
                          <Text style={styles.mediaListRowIcon}>📺</Text>
                          <View style={styles.mediaListRowTextCol}>
                            <Text style={styles.mediaListRowTitle}>{item.name}</Text>
                            <Text style={styles.mediaListRowSub}>{item.category} Kanalı • HD</Text>
                          </View>
                          <Text style={styles.mediaListRowPlayBadge}>
                            {isCurrent ? '🟢 AÇIK' : '▶ İZLE'}
                          </Text>
                        </Pressable>
                      );
                    }}
                  />
                )}

                {modalSection === 'RADIO' && (
                  <FlatList
                    data={radioList.filter(
                      (r) =>
                        (selectedCategoryKey === 'Tümü' || r.category === selectedCategoryKey) &&
                        (!qNorm || r.name.toLowerCase().includes(qNorm))
                    )}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const isCurrent = activeKind === 'radio' && currentRadio.id === item.id;
                      return (
                        <Pressable
                          style={[styles.mediaListRow, isCurrent && styles.mediaListRowActive]}
                          onPress={() => {
                            playRadioStation(item);
                            setCategoryModalVisible(false);
                          }}>
                          <Text style={styles.mediaListRowIcon}>📻</Text>
                          <View style={styles.mediaListRowTextCol}>
                            <Text style={styles.mediaListRowTitle}>{item.name}</Text>
                            <Text style={styles.mediaListRowSub}>
                              {item.freq || 'FM 100.0'} • {item.category} Radyosu
                            </Text>
                          </View>
                          <Text style={styles.mediaListRowPlayBadge}>
                            {isCurrent ? '🟢 ÇALIYOR' : '▶ DİNLE'}
                          </Text>
                        </Pressable>
                      );
                    }}
                  />
                )}

                {modalSection === 'QURAN' && (
                  <View style={{ flex: 1 }}>
                    {/* Horizontal Qari Selector inside the chosen Qari Category */}
                    <Text style={styles.qariSubHeader}>Hafız / Kâri Seçin:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.qariChipsScroll}
                      contentContainerStyle={styles.qariChipsRow}>
                      {qarisList
                        .filter(
                          (q) =>
                            selectedCategoryKey === 'Tümü' || q.category === selectedCategoryKey
                        )
                        .map((qari) => {
                          const selected = currentQari.id === qari.id;
                          return (
                            <Pressable
                              key={qari.id}
                              style={[
                                styles.qariChip,
                                selected && { backgroundColor: theme.musicCardAccent, borderColor: '#FFF' },
                              ]}
                              onPress={() => setCurrentQari(qari)}>
                              <Text style={styles.qariChipName}>{qari.name}</Text>
                            </Pressable>
                          );
                        })}
                    </ScrollView>

                    {/* 114 Surahs List */}
                    <FlatList
                      data={surahsList.filter(
                        (s) =>
                          !qNorm ||
                          s.name.toLowerCase().includes(qNorm) ||
                          s.number.includes(qNorm)
                      )}
                      keyExtractor={(item) => item.code}
                      renderItem={({ item }) => {
                        const isCurrent =
                          activeKind === 'quran' && currentSurah.code === item.code;
                        return (
                          <Pressable
                            style={[styles.mediaListRow, isCurrent && styles.mediaListRowActive]}
                            onPress={() => {
                              playQuranSurah(currentQari, item);
                              setCategoryModalVisible(false);
                            }}>
                            <Text style={styles.mediaListRowIcon}>📖</Text>
                            <View style={styles.mediaListRowTextCol}>
                              <Text style={styles.mediaListRowTitle}>
                                {item.number}. {item.name} Sûresi ({item.arabicName})
                              </Text>
                              <Text style={styles.mediaListRowSub}>
                                {currentQari.name} • {item.ayahCount} Ayet
                              </Text>
                            </View>
                            <Text style={styles.mediaListRowPlayBadge}>
                              {isCurrent ? '🟢 OKUNUYOR' : '▶ DİNLE'}
                            </Text>
                          </Pressable>
                        );
                      }}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* =====================================================================
          EQ, SES KAYIT & UYKU ZAMANLAYICI MODAL
         ===================================================================== */}
      <Modal
        visible={eqModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEqModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.smallModalBox, { borderColor: theme.neonPrimary }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎚️ Ekolayzır, Ses Kayıt & Uyku</Text>
              <Pressable style={styles.modalCloseBtn} onPress={() => setEqModalVisible(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.smallModalSectionLabel}>Ses & Ekolayzır Profili</Text>
            <View style={styles.presetRow}>
              {(['Normal', "Kur'an Net Ses", 'Derin Bas', 'Canlı Stüdyo'] as const).map((preset) => (
                <Pressable
                  key={preset}
                  style={[
                    styles.presetChip,
                    eqPreset === preset && { backgroundColor: theme.neonPrimary },
                  ]}
                  onPress={() => setEqPreset(preset)}>
                  <Text
                    style={[
                      styles.presetChipText,
                      eqPreset === preset && { color: '#040B24', fontWeight: '900' },
                    ]}>
                    {preset}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.smallModalSectionLabel}>⏱️ Otomatik Uyku Zamanlayıcı</Text>
            <View style={styles.presetRow}>
              {[15, 30, 60, 90, 0].map((mins) => (
                <Pressable
                  key={mins}
                  style={[
                    styles.presetChip,
                    (mins === 0 ? sleepRemaining === null : sleepRemaining === mins) && {
                      backgroundColor: '#10B981',
                    },
                  ]}
                  onPress={() => sleepTimer.setTimer(mins)}>
                  <Text style={styles.presetChipText}>
                    {mins === 0 ? 'Kapat' : `${mins} dk`}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.smallModalSectionLabel}>🎙️ Canlı Ses Kaydedici</Text>
            <Pressable
              style={[
                styles.recordActionBtn,
                recorderState.isRecording && { backgroundColor: '#DC2626' },
              ]}
              onPress={toggleRecording}>
              <Text style={styles.recordActionBtnText}>
                {recorderState.isRecording
                  ? '⏹ Kaydı Durdur ve Kaydet'
                  : '🔴 Mikrofon / Ses Kaydını Başlat'}
              </Text>
            </Pressable>

            {recordings.slice(0, 3).map((rec) => (
              <View key={rec.id} style={styles.recordingItemRow}>
                <Text style={styles.recordingItemText} numberOfLines={1}>
                  🎵 {rec.name} ({rec.duration})
                </Text>
                <Pressable style={styles.shareSmallBtn} onPress={() => shareRecording(rec)}>
                  <Text style={styles.shareSmallBtnText}>Paylaş</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* =====================================================================
          TEMA SEÇİCİ MODAL
         ===================================================================== */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.smallModalBox, { borderColor: theme.neonPrimary }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎨 Kokpit Tema Seçimi</Text>
              <Pressable style={styles.modalCloseBtn} onPress={() => setThemeModalVisible(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </Pressable>
            </View>

            {(['neonBlue', 'midnightGold', 'emeraldMatrix'] as CockpitThemeKey[]).map((k) => {
              const t = COCKPIT_THEMES[k];
              const selected = themeKey === k;
              return (
                <Pressable
                  key={k}
                  style={[
                    styles.themeSelectRow,
                    selected && { borderColor: t.neonPrimary, backgroundColor: '#1E293B' },
                  ]}
                  onPress={async () => {
                    setThemeKey(k);
                    await AsyncStorage.setItem('@cockpit_theme_v1', k);
                    setThemeModalVisible(false);
                  }}>
                  <View style={[styles.themeColorPreview, { backgroundColor: t.cardBg, borderColor: t.musicCardAccent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.themeOptionTitle}>{t.name}</Text>
                    <Text style={styles.themeOptionDesc}>{t.desc}</Text>
                  </View>
                  {selected && <Text style={{ color: '#38BDF8', fontWeight: '900' }}>✓ Aktif</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* =====================================================================
          + YENİ MP4 / TV / RADYO EKLE MODAL
         ===================================================================== */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.smallModalBox, { borderColor: theme.neonPrimary }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>➕ Yeni MP4 / TV / Radyo Ekle</Text>
              <Pressable style={styles.modalCloseBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.presetRow}>
              {(
                [
                  { key: 'mp4', label: '🎬 MP4 Video' },
                  { key: 'tv', label: '📺 Canlı TV (.m3u8)' },
                  { key: 'radio', label: '📻 Radyo (.mp3)' },
                ] as const
              ).map((opt) => (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.presetChip,
                    newMediaType === opt.key && { backgroundColor: theme.neonPrimary },
                  ]}
                  onPress={() => setNewMediaType(opt.key)}>
                  <Text
                    style={[
                      styles.presetChipText,
                      newMediaType === opt.key && { color: '#040B24', fontWeight: '900' },
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Başlık (Örn: Yasin Sûresi MP4 / Özel TV)"
              placeholderTextColor="#94A3B8"
              value={newMediaTitle}
              onChangeText={setNewMediaTitle}
            />
            <TextInput
              style={[styles.modalSearchInput, { marginTop: 8 }]}
              placeholder="https://... (.mp4, .m3u8 veya .mp3 adresi)"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={newMediaUrl}
              onChangeText={setNewMediaUrl}
            />

            <Pressable
              style={[styles.recordActionBtn, { backgroundColor: '#2563EB', marginTop: 12 }]}
              onPress={handleAddCustomMedia}>
              <Text style={styles.recordActionBtnText}>💾 Kokpite Kaydet ve Oynat</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  cockpitBezel: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 2,
    padding: 8,
    overflow: 'hidden',
  },
  topStatusBar: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  topStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  topNavIconBtn: {
    width: 28,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavIconText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  activeSourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 4,
    maxWidth: 270,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#64748B',
    marginRight: 6,
  },
  liveDotActive: {
    backgroundColor: '#22C55E',
  },
  activeSourcePillText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  topStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sleepBadge: {
    backgroundColor: '#065F46',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sleepBadgeText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '800',
  },
  statusIconText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  clockText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 2,
  },
  cockpitBodyLandscape: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  cockpitBodyPortrait: {
    flex: 1,
  },
  cockpitBodyPortraitContent: {
    gap: 8,
    paddingBottom: 10,
  },
  portraitMiddleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  portraitHalfCol: {
    flex: 1,
  },
  leftDock: {
    width: 84,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftDockPortrait: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dockDateBox: {
    alignItems: 'center',
  },
  dockDateText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  dockDayText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  dockIconsColumn: {
    alignItems: 'center',
    gap: 12,
  },
  dockIconsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dockIconBtn: {
    width: 44,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconSymbol: {
    color: '#FFFFFF',
    fontSize: 19,
  },
  dockLayersBtn: {
    width: 68,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  dockLayersInnerGlow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLayersIcon: {
    fontSize: 20,
  },
  dockLayersLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },
  cockpitGridArea: {
    flex: 1,
    gap: 8,
  },
  cockpitTopRow: {
    flex: 58,
    flexDirection: 'row',
    gap: 8,
  },
  topRowLeftCol: {
    flex: 64,
  },
  topRowRightCol: {
    flex: 36,
  },
  cockpitBottomRow: {
    flex: 42,
    flexDirection: 'row',
    gap: 8,
  },
  bottomRowLeftCol: {
    flex: 45,
  },
  bottomRowRightCol: {
    flex: 55,
  },
  mainViewportCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#05103A',
  },
  mainViewportCardPortrait: {
    height: 225,
    flex: 0,
  },
  videoViewportContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  cockpitVideoView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  videoTopOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(4, 11, 36, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  videoFormatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  videoFormatBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  videoOverlayTitle: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  videoSwitchModeChip: {
    backgroundColor: 'rgba(126, 34, 206, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoSwitchModeChipText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  videoBottomOverlay: {
    backgroundColor: 'rgba(4, 11, 36, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  videoSeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videoTimeLabel: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  videoProgressBarTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  videoProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  videoControlButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoCtrlSmallBtn: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  videoCtrlSmallText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
  },
  videoCtrlIconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  videoCtrlIconText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  videoCtrlPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCtrlPlayText: {
    color: '#040B24',
    fontSize: 15,
    fontWeight: '900',
  },
  highwayVisualizer: {
    flex: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  skySection: {
    flex: 46,
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 10,
    position: 'relative',
  },
  topReadoutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  cockpitCategoryPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cockpitCategoryPillText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
  },
  digitalCenterCluster: {
    alignItems: 'center',
  },
  digitalBigNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  digitalUnitText: {
    color: '#BAE6FD',
    fontSize: 10,
    fontWeight: '800',
    marginTop: -2,
  },
  horizonGlowLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#E0F2FE',
    shadowColor: '#38BDF8',
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  horizonMountainLeft: {
    position: 'absolute',
    bottom: 2,
    left: '8%',
    width: '44%',
    height: 18,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 80,
    backgroundColor: 'rgba(224, 242, 254, 0.35)',
  },
  horizonMountainRight: {
    position: 'absolute',
    bottom: 2,
    right: '8%',
    width: '44%',
    height: 16,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 60,
    backgroundColor: 'rgba(186, 230, 253, 0.3)',
  },
  roadSection: {
    flex: 54,
    backgroundColor: '#05103A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  roadLaneLeftOuter: {
    position: 'absolute',
    top: -10,
    bottom: -20,
    left: '16%',
    width: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: '32deg' }],
  },
  roadLaneLeftInner: {
    position: 'absolute',
    top: -10,
    bottom: -20,
    left: '31%',
    width: 3,
    borderLeftWidth: 2.5,
    transform: [{ rotate: '18deg' }],
  },
  roadLaneRightInner: {
    position: 'absolute',
    top: -10,
    bottom: -20,
    right: '31%',
    width: 3,
    borderRightWidth: 2.5,
    transform: [{ rotate: '-18deg' }],
  },
  roadLaneRightOuter: {
    position: 'absolute',
    top: -10,
    bottom: -20,
    right: '16%',
    width: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '-32deg' }],
  },
  centerCockpitEmblemBox: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  carSilhouetteRoof: {
    width: 64,
    height: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
  carSilhouetteBody: {
    width: 96,
    height: 26,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  carTaillightLeft: {
    width: 18,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F43F5E',
  },
  carLicensePlate: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  carLicenseText: {
    color: '#040B24',
    fontSize: 7,
    fontWeight: '900',
  },
  carTaillightRight: {
    width: 18,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F43F5E',
  },
  roadNowPlayingBanner: {
    marginTop: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(8, 21, 66, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  roadNowPlayingTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    maxWidth: 250,
  },
  roadNowPlayingHint: {
    color: '#93C5FD',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  musicQuranCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  musicQuranCardPortrait: {
    height: 155,
    flex: 0,
  },
  discWatermarkOuter: {
    position: 'absolute',
    top: -14,
    right: -14,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discWatermarkInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discWatermarkIcon: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 20,
    fontWeight: '900',
  },
  musicCardHeader: {
    zIndex: 2,
  },
  musicCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  musicCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  categoryOpenHintBadge: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryOpenHintText: {
    color: '#F5D0FE',
    fontSize: 9,
    fontWeight: '800',
  },
  musicCardSurahName: {
    color: '#FDF4FF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  musicCardQariName: {
    color: '#E9D5FF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  musicCardControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 6,
    zIndex: 2,
  },
  musicStepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicStepIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  musicPlayCircleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    elevation: 6,
  },
  musicPlayCircleIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  radioCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  radioCardPortrait: {
    height: 155,
    flex: 0,
  },
  radioCardLeftCol: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
  },
  radioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioCardTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },
  radioCategoryHint: {
    color: '#93C5FD',
    fontSize: 9,
    fontWeight: '800',
  },
  radioFreqBigText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  radioStationSubText: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '700',
  },
  radioControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  radioCtrlBtn: {
    width: 32,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCtrlIcon: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  radioWaveSquare: {
    width: 82,
    height: 82,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  waveBarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  waveBarItem: {
    width: 4,
    borderRadius: 2,
  },
  appsCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  appsCardPortrait: {
    height: 128,
    flex: 0,
  },
  appsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appsCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  appsCardHint: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  appsIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  appTileItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  appTilePlayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTilePlayTriangle: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 2,
  },
  appTileEmoji: {
    fontSize: 22,
  },
  appTileSlidersText: {
    fontSize: 22,
  },
  appTilePlusBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  appTilePlusSymbol: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  appTileLabel: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  /* MODAL STYLES */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.86)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 680,
    height: '88%',
    borderRadius: 20,
    borderWidth: 2,
    padding: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalBackBtn: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  modalBackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    flexShrink: 1,
  },
  modalCloseBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  modalSectionTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  modalSectionTab: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSectionTabText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
  },
  categoryCardsGrid: {
    gap: 10,
    paddingBottom: 18,
  },
  bigSectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F297A',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  bigSectionIcon: {
    fontSize: 30,
  },
  bigSectionTextCol: {
    flex: 1,
  },
  bigSectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  bigSectionDesc: {
    color: '#BAE6FD',
    fontSize: 12,
    marginTop: 2,
  },
  bigSectionArrow: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '900',
  },
  classicPagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  classicPageChip: {
    flex: 1,
    minWidth: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  classicPageChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
  },
  categoryCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102C82',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  categoryCardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardIconText: {
    fontSize: 22,
  },
  categoryCardTextCol: {
    flex: 1,
  },
  categoryCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  categoryCardDesc: {
    color: '#93C5FD',
    fontSize: 11,
    marginTop: 2,
  },
  categoryCardChevron: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
  },
  categoryItemsWrapper: {
    flex: 1,
  },
  modalSearchInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 10,
  },
  mediaListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 41, 122, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    borderRadius: 12,
    padding: 11,
    marginBottom: 8,
    gap: 10,
  },
  mediaListRowActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#38BDF8',
  },
  mediaListRowIcon: {
    fontSize: 20,
  },
  mediaListRowTextCol: {
    flex: 1,
  },
  mediaListRowTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  mediaListRowSub: {
    color: '#93C5FD',
    fontSize: 11,
    marginTop: 2,
  },
  mediaListRowPlayBadge: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
  },
  qariSubHeader: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  qariChipsScroll: {
    maxHeight: 42,
    marginBottom: 10,
  },
  qariChipsRow: {
    gap: 8,
    alignItems: 'center',
  },
  qariChip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  qariChipName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  smallModalBox: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#081542',
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
  },
  smallModalSectionLabel: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  presetChipText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  recordActionBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  recordActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  recordingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  recordingItemText: {
    color: '#E2E8F0',
    fontSize: 11,
    flex: 1,
  },
  shareSmallBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shareSmallBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  themeSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  themeColorPreview: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
  },
  themeOptionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  themeOptionDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});

