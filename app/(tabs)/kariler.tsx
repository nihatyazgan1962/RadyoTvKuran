import { StyleSheet, FlatList, Pressable, TextInput, View, Text, Alert, Modal } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Qari, Surah, qarisList, surahsList, getSurahAudioUrl } from '@/constants/quranData';
import { sleepTimer } from '@/utils/sleepTimer';
import { playbackCoordinator } from '@/utils/playbackCoordinator';
import RadioChassisPlayer from '@/components/RadioChassisPlayer';

type PlayMode = 'sequence' | 'loopOne' | 'loopAll' | 'shuffle';

export default function KarilerScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'Tümü' | 'TR' | 'HUZUR' | 'WORLD' | null>(null);
  const [selectedQari, setSelectedQari] = useState<Qari>(qarisList[0]);
  const [selectedSurah, setSelectedSurah] = useState<Surah>(surahsList[0]);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Playback modes: sequence (Sırayla), loopOne (Tekrar/Döngü), loopAll (Tümünü Döngü), shuffle (Karışık)
  const [playMode, setPlayMode] = useState<PlayMode>('sequence');

  // Auto-hide player controls when playing
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

  const player = useAudioPlayer(currentUrl);
  const playerStatus = useAudioPlayerStatus(player);
  const isPlaying = Boolean(playerStatus.playing);

  // Keep track of track end to trigger auto advance only once per finish
  const hasHandledFinishRef = useRef(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(console.error);

    const unsubscribeSleep = sleepTimer.onExpire(() => {
      if (player) {
        player.pause();
        try {
          player.setActiveForLockScreen(false);
        } catch (e) {}
      }
    });

    const unsubscribeQuranCoord = playbackCoordinator.register('quran', () => {
      if (player) {
        player.pause();
        try {
          player.setActiveForLockScreen(false);
        } catch (e) {}
      }
    });

    return () => {
      unsubscribeSleep();
      unsubscribeQuranCoord();
    };
  }, [player]);

  useEffect(() => {
    if (currentUrl && player) {
      playbackCoordinator.notifyActive('quran');
      player.play();
      hasHandledFinishRef.current = false;
      resetControlsTimer();
      try {
        player.setActiveForLockScreen(true, {
          title: `${selectedSurah.number}. ${selectedSurah.name} (${selectedSurah.arabicName})`,
          artist: `${selectedQari.name} - ${selectedQari.title}`,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUrl, player, selectedSurah, selectedQari]);

  // Handle Track End / Next Track auto-play based on mode
  useEffect(() => {
    if (playerStatus.didJustFinish && !hasHandledFinishRef.current) {
      hasHandledFinishRef.current = true;
      handleTrackEnd();
    }
    if (!playerStatus.didJustFinish) {
      hasHandledFinishRef.current = false;
    }
  }, [playerStatus.didJustFinish]);

  const handleTrackEnd = () => {
    const currentIndex = surahsList.findIndex((s) => s.code === selectedSurah.code);
    if (currentIndex === -1) return;

    if (playMode === 'loopOne') {
      if (player) {
        player.seekTo(0);
        playbackCoordinator.notifyActive('quran');
        player.play();
      }
    } else if (playMode === 'sequence') {
      if (currentIndex < surahsList.length - 1) {
        playSurah(selectedQari, surahsList[currentIndex + 1]);
      } else {
        if (player) player.pause();
      }
    } else if (playMode === 'loopAll') {
      const nextIndex = (currentIndex + 1) % surahsList.length;
      playSurah(selectedQari, surahsList[nextIndex]);
    } else if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * surahsList.length);
      playSurah(selectedQari, surahsList[randomIndex]);
    }
  };

  const playSurah = (qari: Qari, surah: Surah) => {
    playbackCoordinator.notifyActive('quran');
    const url = getSurahAudioUrl(qari, surah);
    setSelectedQari(qari);
    setSelectedSurah(surah);
    setCurrentUrl(url);
    resetControlsTimer();
  };

  const togglePlayback = () => {
    resetControlsTimer();
    if (!currentUrl) {
      playSurah(selectedQari, selectedSurah);
      return;
    }

    if (isPlaying) {
      player.pause();
      try {
        player.setActiveForLockScreen(false);
      } catch (e) {}
    } else {
      playbackCoordinator.notifyActive('quran');
      player.play();
      try {
        player.setActiveForLockScreen(true, {
          title: `${selectedSurah.number}. ${selectedSurah.name} (${selectedSurah.arabicName})`,
          artist: selectedQari.name,
        });
      } catch (e) {}
    }
  };

  const playPreviousSurah = () => {
    resetControlsTimer();
    const currentIndex = surahsList.findIndex((s) => s.code === selectedSurah.code);
    const prevIndex = (currentIndex - 1 + surahsList.length) % surahsList.length;
    playSurah(selectedQari, surahsList[prevIndex]);
  };

  const playNextSurah = () => {
    resetControlsTimer();
    const currentIndex = surahsList.findIndex((s) => s.code === selectedSurah.code);
    const nextIndex = (currentIndex + 1) % surahsList.length;
    playSurah(selectedQari, surahsList[nextIndex]);
  };

  const togglePlayMode = () => {
    resetControlsTimer();
    let nextMode: PlayMode = 'sequence';
    let modeName = 'Sırayla Çal (Otomatik Sonraki Sure)';

    if (playMode === 'sequence') {
      nextMode = 'loopOne';
      modeName = '🔂 Tekrar Çal (Aynı Sureyi Döngüye Al)';
    } else if (playMode === 'loopOne') {
      nextMode = 'loopAll';
      modeName = '🔁 Tümünü Döngü (114 Sureyi Baştan Sona Döndür)';
    } else if (playMode === 'loopAll') {
      nextMode = 'shuffle';
      modeName = '🔀 Karışık Çal (Rastgele Sure)';
    } else {
      nextMode = 'sequence';
      modeName = '⏭️ Sırayla Çal (Sıradaki Sureye Geç)';
    }

    setPlayMode(nextMode);
    Alert.alert('Çalma Modu Değiştirildi', modeName);
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const totalSec = Math.floor(sec);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const seekForward = () => {
    resetControlsTimer();
    if (player && playerStatus.duration) {
      const target = Math.min(playerStatus.duration, (playerStatus.currentTime || 0) + 15);
      player.seekTo(target);
    }
  };

  const seekBackward = () => {
    resetControlsTimer();
    if (player) {
      const target = Math.max(0, (playerStatus.currentTime || 0) - 15);
      player.seekTo(target);
    }
  };

  const getModeInfo = () => {
    switch (playMode) {
      case 'loopOne':
        return { icon: '🔂', label: 'Döngü', active: true };
      case 'loopAll':
        return { icon: '🔁', label: 'Tümünü Döngü', active: true };
      case 'shuffle':
        return { icon: '🔀', label: 'Karışık', active: true };
      case 'sequence':
      default:
        return { icon: '⏭️', label: 'Sırayla Çal', active: false };
    }
  };

  const categories = [
    { key: 'TR' as const, label: 'Türk Kâriler (Hatim)', icon: '🇹🇷', desc: 'Fatih Çollak, İshak Danış, Bünyamin Topçuoğlu, İlhan Tok...', count: qarisList.filter(q => q.category === 'TR').length },
    { key: 'HUZUR' as const, label: 'Huzur & Huşû Kıraatleri', icon: '🕊️', desc: 'Mishary Alafasy, Abdulbasit, Yasser Al-Dosari, Hazza Al-Balushi...', count: qarisList.filter(q => q.category === 'HUZUR').length },
    { key: 'WORLD' as const, label: 'Dünya Kârileri (Kâbe & Mısır)', icon: '🌍', desc: 'Mahir el-Muaykili, Abdurrahman es-Sudeys, Suud eş-Şureym...', count: qarisList.filter(q => q.category === 'WORLD').length },
    { key: 'Tümü' as const, label: 'Tüm Kâriler (Tüm Liste)', icon: '🌟', desc: 'Sistemde kayıtlı 23+ hatim ve kıraat kârisi', count: qarisList.length },
  ];

  const filteredQaris = qarisList.filter((q) => {
    if (!selectedCategory || selectedCategory === 'Tümü') return true;
    return q.category === selectedCategory;
  });

  const filteredSurahs = surahsList.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.arabicName.includes(searchQuery) ||
    s.number.includes(searchQuery)
  );

  const modeInfo = getModeInfo();
  const currentDuration = playerStatus.duration || 0;
  const currentTime = playerStatus.currentTime || 0;
  const progressPercent = currentDuration > 0 ? (currentTime / currentDuration) * 100 : 0;
  const selectedCatObj = categories.find(c => c.key === selectedCategory) || categories[0];

  const renderNowPlayingPlayer = () => {
    if (!currentUrl && !isPlaying) {
      return (
        <RadioChassisPlayer
          type="quran"
          title="📖 KUR'AN-I KERİM VE KÂRİLER"
          subtitle="Bir sure seçerek canlı kıraati başlatın"
          isPlaying={false}
          onTogglePlay={() => {}}
          sleepSeconds={sleepSeconds}
          onSleepTimerPress={() => setSleepModalVisible(true)}
          frequencyText="114.0 KURAN FM"
          showControls={false}
          onTap={() => {}}
        />
      );
    }

    return (
      <RadioChassisPlayer
        type="quran"
        title={`📖 ${selectedSurah.number}. ${selectedSurah.name} (${selectedSurah.arabicName})`}
        subtitle={`🎙️ ${selectedQari.name} ${selectedQari.country === 'TR' ? '🇹🇷 (Hatim)' : ''}`}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayback}
        onNext={playNextSurah}
        onPrev={playPreviousSurah}
        onSeekForward={seekForward}
        onSeekBackward={seekBackward}
        modeInfo={modeInfo}
        onToggleMode={togglePlayMode}
        sleepSeconds={sleepSeconds}
        onSleepTimerPress={() => setSleepModalVisible(true)}
        currentTime={currentTime}
        duration={currentDuration}
        frequencyText={`CÜZ ${Math.ceil(parseInt(selectedSurah.number || '1', 10) / 4) || 1} • 114.0 FM`}
        showControls={showControls}
        onTap={handlePlayerTap}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.headerComponentContainer}>
      {/* Back to Categories Button */}
      <View style={styles.categoryListHeader}>
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
      </View>

      {/* Selected Category Qari Horizontal List */}
      <View style={styles.qarisSection}>
        <Text style={styles.qariSelectHeader}>
          👤 Kâri / Okuyucu Seçiniz ({filteredQaris.length}):
        </Text>
        <FlatList
          data={filteredQaris}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.qarisScroll}
          renderItem={({ item: qari }) => {
            const isSelected = selectedQari.id === qari.id;
            const isTurkish = qari.category === 'TR';
            const isHuzur = qari.category === 'HUZUR';
            return (
              <Pressable
                style={[
                  styles.qariChip,
                  isTurkish && styles.qariChipTurkish,
                  isHuzur && styles.qariChipHuzur,
                  isSelected && styles.qariChipActive,
                ]}
                onPress={() => {
                  setSelectedQari(qari);
                  if (currentUrl) {
                    playSurah(qari, selectedSurah);
                  }
                }}
              >
                <View style={styles.qariHeaderRow}>
                  <Text style={[styles.qariChipName, isSelected && styles.qariChipNameActive]}>
                    {qari.name}
                  </Text>
                  {isTurkish && <Text style={styles.flagIcon}>🇹🇷</Text>}
                  {isHuzur && <Text style={styles.flagIcon}>🕊️</Text>}
                </View>
                <Text style={[styles.qariChipTitle, isSelected && styles.qariChipTitleActive]} numberOfLines={2}>
                  {qari.title}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="114 Sure İçinde Ara (Örn: Yasin, Fatiha, 67, Mülk)..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Player Bar (Always accessible if active) */}
      {renderNowPlayingPlayer()}

      {/* DURUM 1: Ana Ekranda Sadece Kategoriler Görünür */}
      {!selectedCategory ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoryMenuContent}
          ListHeaderComponent={
            <View style={styles.categoryMenuHeader}>
              <Text style={styles.categoryMenuTitle}>📑 KÂRİLER & KIRAAT KATEGORİLERİ</Text>
              <Text style={styles.categoryMenuSubtitle}>Dinlemek istediğiniz okuyucu grubu için bir kategori seçin:</Text>
            </View>
          }
          renderItem={({ item: cat }) => {
            return (
              <Pressable
                style={styles.categoryMenuCard}
                onPress={() => {
                  setSelectedCategory(cat.key);
                  const firstInCat = qarisList.find(q => cat.key === 'Tümü' || q.category === cat.key);
                  if (firstInCat) setSelectedQari(firstInCat);
                }}
              >
                <View style={styles.categoryMenuLeft}>
                  <Text style={styles.categoryMenuIcon}>{cat.icon}</Text>
                  <View style={styles.categoryMenuTexts}>
                    <Text style={styles.categoryMenuCardTitle}>{cat.label}</Text>
                    <Text style={styles.categoryMenuCardDesc}>{cat.desc}</Text>
                  </View>
                </View>
                <View style={styles.categoryMenuBadge}>
                  <Text style={styles.categoryMenuBadgeText}>{cat.count} Kâri ›</Text>
                </View>
              </Pressable>
            );
          }}
        />
      ) : (
        /* DURUM 2: Bir Kategoriye Tıklandığında Kâriler ve 114 Sure Görünür */
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => item.code}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isCurrentSurah = selectedSurah.code === item.code;
            return (
              <Pressable
                style={[styles.surahCard, isCurrentSurah && styles.surahCardActive]}
                onPress={() => playSurah(selectedQari, item)}
              >
                <View style={[styles.numberBadge, isCurrentSurah && styles.numberBadgeActive]}>
                  <Text style={[styles.numberText, isCurrentSurah && styles.numberTextActive]}>
                    {item.number}
                  </Text>
                </View>

                <View style={styles.surahDetails}>
                  <Text style={[styles.surahName, isCurrentSurah && styles.surahNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={styles.surahMeta}>
                    {item.ayahCount} Âyet • {selectedQari.name}
                  </Text>
                </View>

                <View style={styles.arabicCol}>
                  <Text style={styles.arabicName}>{item.arabicName}</Text>
                  {isCurrentSurah && (
                    <Text style={[styles.playingBadge, !isPlaying && styles.pausedBadge]}>
                      {isPlaying ? '▶ Çalıyor' : '⏸ Duraklatıldı'}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {/* Quick Sleep Timer Modal on Quran Screen */}
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
              Kur'an tilavetinin otomatik olarak durdurulacağı süreyi seçiniz:
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
                      Alert.alert('Uyku Modu Aktif', `Kur'an yayını ${mins} dakika sonra otomatik kapanacaktır.`);
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
  headerComponentContainer: {
    backgroundColor: '#f8fafc',
  },
  // Mini Bar Styles for Auto-Hide
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
  miniBarSurah: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniBarHint: {
    color: '#c8e6c9',
    fontSize: 11,
    marginTop: 2,
  },
  miniPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayColor: {
    backgroundColor: '#ffffff',
  },
  miniPauseColor: {
    backgroundColor: '#ffebee',
  },
  miniPlayBtnText: {
    fontSize: 16,
    color: '#1b5e20',
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
    marginBottom: 4,
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
  qarisSection: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  qariSelectHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  qarisScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  qariChip: {
    backgroundColor: '#f1f8e9',
    borderColor: '#c8e6c9',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
    maxWidth: 210,
    justifyContent: 'center',
  },
  qariChipTurkish: {
    backgroundColor: '#fbf5f5',
    borderColor: '#ffcdd2',
  },
  qariChipHuzur: {
    backgroundColor: '#f0f4f8',
    borderColor: '#bbdefb',
  },
  qariChipActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#1b5e20',
  },
  qariHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    gap: 4,
  },
  flagIcon: {
    fontSize: 13,
  },
  qariChipName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2e7d32',
    flex: 1,
  },
  qariChipNameActive: {
    color: '#fff',
  },
  qariChipTitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  qariChipTitleActive: {
    color: '#e8f5e9',
  },
  // Full Player Bar
  nowPlayingBar: {
    backgroundColor: '#1b5e20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  nowPlayingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  nowPlayingInfo: {
    flex: 1,
    backgroundColor: 'transparent',
    marginRight: 10,
  },
  nowPlayingSurah: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  nowPlayingQari: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 2,
  },
  modeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modeButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  modeButtonText: {
    color: '#e8f5e9',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: '#1b5e20',
  },
  progressContainer: {
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#81c784',
  },
  progressTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
    backgroundColor: 'transparent',
  },
  timeText: {
    color: '#c8e6c9',
    fontSize: 11,
  },
  playerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  ctrlBtn: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  ctrlIcon: {
    fontSize: 18,
  },
  ctrlText: {
    color: '#e8f5e9',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  ctrlBtnMini: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  ctrlIconMini: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mainPlayButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    elevation: 3,
  },
  mainPlayColor: {
    backgroundColor: '#ffffff',
  },
  mainPauseColor: {
    backgroundColor: '#ffebee',
  },
  mainPlayButtonText: {
    color: '#1b5e20',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  listContent: {
    paddingBottom: 24,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  surahCardActive: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  numberBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  numberText: {
    color: '#475569',
    fontWeight: 'bold',
    fontSize: 13,
  },
  numberTextActive: {
    color: '#15803d',
  },
  surahDetails: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  surahName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  surahNameActive: {
    color: '#15803d',
    fontWeight: 'bold',
  },
  surahMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  arabicCol: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  arabicName: {
    fontSize: 17,
    color: '#15803d',
    fontWeight: 'bold',
  },
  playingBadge: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
  },
  pausedBadge: {
    color: '#d97706',
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
