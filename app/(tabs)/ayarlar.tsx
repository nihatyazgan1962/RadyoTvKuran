import { StyleSheet, TextInput, ScrollView, Alert, Pressable, View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { useAudioPlayer } from 'expo-audio';
import { sleepTimer } from '@/utils/sleepTimer';

interface CustomChannel {
  id: string;
  name: string;
  url: string;
}

interface SavedRecording {
  id: string;
  name: string;
  uri: string;
  date: string;
  duration: string;
}

export default function AyarlarScreen() {
  const [channelType, setChannelType] = useState<'radio' | 'tv'>('radio');
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');

  const [customRadios, setCustomRadios] = useState<CustomChannel[]>([]);
  const [customTvs, setCustomTvs] = useState<CustomChannel[]>([]);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);

  const [playingUri, setPlayingUri] = useState<string | null>(null);
  const player = useAudioPlayer(playingUri);

  const [sleepSeconds, setSleepSeconds] = useState<number>(sleepTimer.getRemainingSeconds());

  const loadAllData = async () => {
    try {
      const radios = await AsyncStorage.getItem('customChannels');
      if (radios) setCustomRadios(JSON.parse(radios));

      const tvs = await AsyncStorage.getItem('customTvChannels');
      if (tvs) setCustomTvs(JSON.parse(tvs));

      const recs = await AsyncStorage.getItem('savedVoiceRecordings');
      if (recs) setSavedRecordings(JSON.parse(recs));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsub = sleepTimer.subscribe((sec) => {
      setSleepSeconds(sec);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (playingUri && player) {
      player.play();
    }
  }, [playingUri, player]);

  const addChannel = async () => {
    if (!channelName.trim() || !channelUrl.trim()) {
      Alert.alert('Hata', 'Lütfen kanal adı ve yayın linkini giriniz.');
      return;
    }

    const storageKey = channelType === 'radio' ? 'customChannels' : 'customTvChannels';
    const idPrefix = channelType === 'radio' ? 'custom_radio_' : 'custom_tv_';

    try {
      const existing = await AsyncStorage.getItem(storageKey);
      const list: CustomChannel[] = existing ? JSON.parse(existing) : [];
      const newChan: CustomChannel = {
        id: idPrefix + Date.now().toString(),
        name: channelName.trim(),
        url: channelUrl.trim(),
      };
      list.unshift(newChan);
      await AsyncStorage.setItem(storageKey, JSON.stringify(list));

      if (channelType === 'radio') {
        setCustomRadios(list);
      } else {
        setCustomTvs(list);
      }

      Alert.alert('Başarılı', `${channelType === 'radio' ? 'Radyo' : 'TV'} kanalı başarıyla eklendi.`);
      setChannelName('');
      setChannelUrl('');
    } catch (e) {
      Alert.alert('Hata', 'Kanal eklenirken sorun oluştu.');
    }
  };

  const deleteChannel = async (id: string, type: 'radio' | 'tv') => {
    const storageKey = type === 'radio' ? 'customChannels' : 'customTvChannels';
    Alert.alert('Kanalı Sil', 'Bu kanalı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const existing = await AsyncStorage.getItem(storageKey);
            if (existing) {
              const list: CustomChannel[] = JSON.parse(existing).filter((c: CustomChannel) => c.id !== id);
              await AsyncStorage.setItem(storageKey, JSON.stringify(list));
              if (type === 'radio') setCustomRadios(list);
              else setCustomTvs(list);
            }
          } catch (e) {}
        },
      },
    ]);
  };

  const togglePlayRecording = (uri: string) => {
    if (playingUri === uri) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } else {
      setPlayingUri(uri);
    }
  };

  const shareRecording = async (uri: string) => {
    try {
      const isAvail = await Sharing.isAvailableAsync();
      if (isAvail) await Sharing.shareAsync(uri);
      else Alert.alert('Bilgi', 'Paylaşım desteklenmiyor.');
    } catch (e) {
      Alert.alert('Hata', 'Paylaşılamadı.');
    }
  };

  const deleteRecording = async (id: string) => {
    Alert.alert('Kaydı Sil', 'Bu ses kaydını silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const list = savedRecordings.filter((r) => r.id !== id);
          setSavedRecordings(list);
          await AsyncStorage.setItem('savedVoiceRecordings', JSON.stringify(list));
          if (playingUri) setPlayingUri(null);
        },
      },
    ]);
  };

  const formatSleepTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetTimer = (mins: number) => {
    sleepTimer.setTimer(mins);
    Alert.alert('Uyku Modu Aktif', `Uygulama ${mins} dakika sonra yayını otomatik olarak durduracaktır.`);
  };

  const handleCancelTimer = () => {
    sleepTimer.cancelTimer();
    Alert.alert('Uyku Modu İptal Edildi', 'Zamanlayıcı kapatıldı.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>⚙️ Rehber Yönetimi & Ayarlar</Text>

      {/* Live Guide Summary Card */}
      <View style={styles.guideSummaryCard}>
        <View style={styles.guideSummaryHeader}>
          <Text style={styles.guideSummaryTitle}>🇹🇷 MOBİL CANLI TR REHBERİ</Text>
          <View style={styles.guideLiveBadge}>
            <View style={styles.guideLiveDot} />
            <Text style={styles.guideLiveBadgeText}>24/7 CANLI</Text>
          </View>
        </View>
        <Text style={styles.guideSummaryDesc}>
          Türkiye'nin tüm ulusal, haber, dini, bölgesel canlı TV kanalları, kesintisiz radyoları ve Kur'an-ı Kerim tilavetleri tek bir rehberde.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>75+</Text>
            <Text style={styles.statLabel}>Canlı TV</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>120+</Text>
            <Text style={styles.statLabel}>Canlı Radyo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>23+</Text>
            <Text style={styles.statLabel}>Seçkin Kâri</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>114</Text>
            <Text style={styles.statLabel}>Sure-i Şerif</Text>
          </View>
        </View>
      </View>

      {/* Section: Uyku Modu (Sleep Timer) */}
      <View style={[styles.card, styles.sleepCard]}>
        <View style={styles.sleepHeader}>
          <Text style={styles.sleepTitle}>🌙 Uyku Modu (Zamanlayıcı)</Text>
          {sleepSeconds > 0 && (
            <View style={styles.activeTimerBadge}>
              <Text style={styles.activeTimerText}>⏳ {formatSleepTime(sleepSeconds)}</Text>
            </View>
          )}
        </View>

        {/* Prominent Active Countdown Box */}
        {sleepSeconds > 0 && (
          <View style={styles.activeCountdownBox}>
            <View style={styles.activeCountdownLeft}>
              <Text style={styles.activeCountdownIcon}>⏳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeCountdownTitle}>Otomatik Kapanma Sayacı</Text>
                <Text style={styles.activeCountdownDesc}>Yayın {formatSleepTime(sleepSeconds)} sonra durdurulacak</Text>
              </View>
            </View>
            <View style={styles.activeCountdownTimeBadge}>
              <Text style={styles.activeCountdownTimeText}>{formatSleepTime(sleepSeconds)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.cardDesc}>
          Yatarken veya dinlenirken radyo, TV ve Kur'an yayınlarının belirlediğiniz süre sonunda otomatik olarak durmasını sağlar.
        </Text>

        <View style={styles.timerPresetsRow}>
          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((mins) => {
            const isSelected = sleepSeconds > 0 && Math.abs(Math.ceil(sleepSeconds / 60) - mins) <= 1;
            return (
              <Pressable
                key={mins}
                style={[styles.timerPresetBtn, isSelected && styles.timerPresetBtnActive]}
                onPress={() => handleSetTimer(mins)}
              >
                <Text style={[styles.timerPresetText, isSelected && styles.timerPresetTextActive]}>
                  {mins} dk
                </Text>
              </Pressable>
            );
          })}
        </View>

        {sleepSeconds > 0 && (
          <Pressable style={styles.cancelTimerBtn} onPress={handleCancelTimer}>
            <Text style={styles.cancelTimerBtnText}>❌ Uyku Modunu İptal Et</Text>
          </Pressable>
        )}
      </View>
      
      {/* Section 1: Kanal Ekle */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>➕ Yeni Kanal Ekle</Text>
        <Text style={styles.cardDesc}>Uygulamaya kendi canlı radyo veya TV yayın linkinizi ekleyebilirsiniz.</Text>

        {/* Radio / TV Selector */}
        <View style={styles.typeSelector}>
          <Pressable
            style={[styles.typeBtn, channelType === 'radio' && styles.typeBtnActive]}
            onPress={() => setChannelType('radio')}
          >
            <Text style={[styles.typeBtnText, channelType === 'radio' && styles.typeBtnTextActive]}>
              📻 Radyo Kanalı
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typeBtn, channelType === 'tv' && styles.typeBtnActive]}
            onPress={() => setChannelType('tv')}
          >
            <Text style={[styles.typeBtnText, channelType === 'tv' && styles.typeBtnTextActive]}>
              📺 TV Kanalı
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Kanal Adı (Örn: Özel Radyom)"
          placeholderTextColor="#888"
          value={channelName}
          onChangeText={setChannelName}
        />
        <TextInput
          style={styles.input}
          placeholder="Yayın Linki (URL: m3u8 veya mp3)"
          placeholderTextColor="#888"
          value={channelUrl}
          onChangeText={setChannelUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.saveBtn} onPress={addChannel}>
          <Text style={styles.saveBtnText}>Kanalı Kaydet</Text>
        </Pressable>
      </View>

      {/* Section 2: Eklenen Kanallar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Eklediğiniz Özel Kanallar</Text>
        
        <Text style={styles.subHeader}>📻 Özel Radyolar ({customRadios.length})</Text>
        {customRadios.length === 0 ? (
          <Text style={styles.emptyNotice}>Henüz eklenmiş özel radyo kanalı yok.</Text>
        ) : (
          customRadios.map((r) => (
            <View key={r.id} style={styles.customRow}>
              <Text style={styles.customName}>{r.name}</Text>
              <Pressable style={styles.deleteBtn} onPress={() => deleteChannel(r.id, 'radio')}>
                <Text style={styles.deleteBtnText}>Sil</Text>
              </Pressable>
            </View>
          ))
        )}

        <Text style={[styles.subHeader, { marginTop: 15 }]}>📺 Özel TV Kanalları ({customTvs.length})</Text>
        {customTvs.length === 0 ? (
          <Text style={styles.emptyNotice}>Henüz eklenmiş özel TV kanalı yok.</Text>
        ) : (
          customTvs.map((t) => (
            <View key={t.id} style={styles.customRow}>
              <Text style={styles.customName}>{t.name}</Text>
              <Pressable style={styles.deleteBtn} onPress={() => deleteChannel(t.id, 'tv')}>
                <Text style={styles.deleteBtnText}>Sil</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Section 3: Ses Kayıtları */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎙️ Ses Kayıtlarım ({savedRecordings.length})</Text>
        {savedRecordings.length === 0 ? (
          <Text style={styles.emptyNotice}>Kayıtlı ses dosyası bulunamadı. Radyo sekmesinden kayıt yapabilirsiniz.</Text>
        ) : (
          savedRecordings.map((rec) => {
            const isPlayingThis = playingUri === rec.uri && player.playing;
            return (
              <View key={rec.id} style={styles.recCard}>
                <View style={styles.recInfo}>
                  <Text style={styles.recName}>{rec.name}</Text>
                  <Text style={styles.recDate}>{rec.date} • {rec.duration}</Text>
                </View>
                <View style={styles.recActions}>
                  <Pressable style={styles.recBtn} onPress={() => togglePlayRecording(rec.uri)}>
                    <Text style={styles.recBtnText}>{isPlayingThis ? '⏸' : '▶'}</Text>
                  </Pressable>
                  <Pressable style={styles.recBtn} onPress={() => shareRecording(rec.uri)}>
                    <Text style={styles.recBtnText}>Paylaş</Text>
                  </Pressable>
                  <Pressable style={[styles.recBtn, { backgroundColor: '#ffebee' }]} onPress={() => deleteRecording(rec.id)}>
                    <Text style={[styles.recBtnText, { color: '#d32f2f' }]}>Sil</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Section 4: Hakkında */}
      <View style={[styles.card, { alignItems: 'center' }]}>
        <Text style={styles.aboutTitle}>Radyo TV Kur'an</Text>
        <Text style={styles.aboutDeveloper}>Geliştirici: Nihat Yazgan</Text>
        <Text style={styles.aboutVersion}>Sürüm: 1.1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  guideSummaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  guideSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  guideSummaryTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  guideLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E11D48',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  guideLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  guideLiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  guideSummaryDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sleepCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderLeftWidth: 4,
    borderLeftColor: '#0f766e',
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  sleepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  activeTimerBadge: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  activeTimerText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeCountdownBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  activeCountdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    backgroundColor: 'transparent',
  },
  activeCountdownIcon: {
    fontSize: 20,
  },
  activeCountdownTitle: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeCountdownDesc: {
    color: '#A7F3D0',
    fontSize: 10,
    marginTop: 1,
  },
  activeCountdownTimeBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeCountdownTimeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timerPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  timerPresetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    minWidth: 60,
    alignItems: 'center',
  },
  timerPresetBtnActive: {
    borderColor: '#0f766e',
    backgroundColor: '#ccfbf1',
  },
  timerPresetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  timerPresetTextActive: {
    color: '#0f766e',
    fontWeight: 'bold',
  },
  cancelTimerBtn: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  cancelTimerBtnText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  typeBtnActive: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeBtnTextActive: {
    color: '#1b5e20',
    fontWeight: 'bold',
  },
  input: {
    height: 44,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  saveBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  subHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },
  emptyNotice: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  customRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'transparent',
  },
  customName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteBtnText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'transparent',
  },
  recInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  recName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  recDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  recActions: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'transparent',
  },
  recBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  aboutTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  aboutDeveloper: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
