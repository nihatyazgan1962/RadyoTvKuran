import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

interface RadioChassisPlayerProps {
  title: string;
  subtitle?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  modeInfo?: { icon: string; label: string; active?: boolean };
  onToggleMode?: () => void;
  isRecording?: boolean;
  recordDurationText?: string;
  onToggleRecord?: () => void;
  sleepSeconds?: number;
  onSleepTimerPress?: () => void;
  frequencyText?: string;
  currentTime?: number;
  duration?: number;
  showControls?: boolean;
  onTap?: () => void;
  type?: 'radio' | 'quran';
}

export default function RadioChassisPlayer({
  title,
  subtitle,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onSeekForward,
  onSeekBackward,
  modeInfo,
  onToggleMode,
  isRecording,
  recordDurationText,
  onToggleRecord,
  sleepSeconds,
  onSleepTimerPress,
  frequencyText = '104.5 MHz FM STEREO',
  currentTime = 0,
  duration = 0,
  showControls = true,
  onTap,
  type = 'radio',
}: RadioChassisPlayerProps) {
  // Animated soundwave equalizer bars
  const [eqHeights, setEqHeights] = useState<number[]>([12, 24, 18, 28, 14, 22, 30, 16, 26, 10]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setEqHeights([
        Math.floor(Math.random() * 22) + 8,
        Math.floor(Math.random() * 26) + 10,
        Math.floor(Math.random() * 24) + 6,
        Math.floor(Math.random() * 28) + 12,
        Math.floor(Math.random() * 20) + 8,
        Math.floor(Math.random() * 26) + 10,
        Math.floor(Math.random() * 30) + 10,
        Math.floor(Math.random() * 22) + 8,
        Math.floor(Math.random() * 28) + 8,
        Math.floor(Math.random() * 18) + 6,
      ]);
    }, 180);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const totalSec = Math.floor(sec);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatSleepTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <Pressable onPress={onTap} style={styles.outerChassis}>
      {/* Wooden / Brushed Titanium Frame Rim */}
      <View style={styles.chassisFrame}>
        {/* Top Handle / Metal Trim */}
        <View style={styles.topMetalTrim}>
          <View style={styles.screwRivet} />
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>
              {type === 'quran' ? '📖 KUR\'AN-I KERİM RADYOSU' : '📻 MOBİL CANLI TR RADYO'}
            </Text>
          </View>
          <View style={styles.screwRivet} />
        </View>

        {/* Main Body with Speaker Grills on Sides & Screen in Center */}
        <View style={styles.radioBodyRow}>
          {/* Left Speaker Grill */}
          <View style={styles.speakerGrill}>
            {[...Array(6)].map((_, i) => (
              <View key={`lg-${i}`} style={styles.grillSlot} />
            ))}
          </View>

          {/* Center Backlit Tuner / LCD Display */}
          <View style={styles.tunerDisplay}>
            {/* Top Display Status Row */}
            <View style={styles.displayStatusRow}>
              <View style={styles.liveIndicator}>
                <View style={[styles.liveDot, isPlaying && styles.liveDotActive]} />
                <Text style={styles.liveIndicatorText}>
                  {isPlaying ? 'CANLI YAYIN' : 'HAZIRDA'}
                </Text>
              </View>

              <Text style={styles.stereoBadge}>STEREO HQ</Text>

              {sleepSeconds !== undefined && sleepSeconds > 0 && (
                <View style={styles.sleepBadgeLcd}>
                  <Text style={styles.sleepBadgeLcdText}>⏳ {formatSleepTime(sleepSeconds)}</Text>
                </View>
              )}

              {isRecording && (
                <View style={styles.recBadge}>
                  <View style={styles.recDot} />
                  <Text style={styles.recBadgeText}>REC {recordDurationText}</Text>
                </View>
              )}
            </View>

            {/* Station / Surah Name (Illuminated Fluorescent) */}
            <View style={styles.stationTitleContainer}>
              <Text style={styles.stationTitle} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.stationSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Vintage Frequency Scale (88-108 MHz) with Red Needle */}
            <View style={styles.freqScaleContainer}>
              <View style={styles.freqMarksRow}>
                <Text style={styles.freqMarkText}>88</Text>
                <Text style={styles.freqMarkText}>92</Text>
                <Text style={styles.freqMarkText}>96</Text>
                <Text style={styles.freqMarkText}>100</Text>
                <Text style={styles.freqMarkText}>104</Text>
                <Text style={styles.freqMarkText}>108</Text>
              </View>
              <View style={styles.freqTrack}>
                <View style={styles.freqTrackLine} />
                {/* Red Tuning Needle */}
                <View 
                  style={[
                    styles.freqNeedle, 
                    { left: `${Math.min(92, Math.max(8, (title.length * 13) % 85 + 8))}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Sound Wave Equalizer Spectrum & Frequency Digital Tag */}
            <View style={styles.eqAndFreqRow}>
              {/* Equalizer Visualizer */}
              <View style={styles.eqContainer}>
                {eqHeights.map((h, i) => (
                  <View 
                    key={`eq-${i}`} 
                    style={[
                      styles.eqBar, 
                      { height: isPlaying ? h : 4, backgroundColor: isPlaying ? '#34D399' : '#065F46' }
                    ]} 
                  />
                ))}
              </View>

              {/* Digital Frequency Display */}
              <Text style={styles.digitalFreqText}>{frequencyText}</Text>
            </View>

            {/* Audio Progress Bar for Kur'an / Recitation */}
            {duration > 0 && (
              <View style={styles.surahProgressWrapper}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{formatSeconds(currentTime)}</Text>
                  <Text style={styles.timeLabel}>{formatSeconds(duration)}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Right Speaker Grill */}
          <View style={styles.speakerGrill}>
            {[...Array(6)].map((_, i) => (
              <View key={`rg-${i}`} style={styles.grillSlot} />
            ))}
          </View>
        </View>

        {/* Physical Controls & Rotary Knobs Panel */}
        {showControls ? (
          <View style={styles.controlsChassisPanel}>
            {/* Left Rotary Knob (SES / VOL) */}
            <View style={styles.knobWrapper}>
              <View style={styles.knobOuter}>
                <View style={styles.knobInner}>
                  <View style={styles.knobIndicator} />
                </View>
              </View>
              <Text style={styles.knobLabel}>SES</Text>
            </View>

            {/* Center Push Buttons */}
            <View style={styles.centerButtonsGroup}>
              {/* Previous Button */}
              {onPrev && (
                <Pressable style={styles.metalButton} onPress={onPrev}>
                  <Text style={styles.metalButtonIcon}>⏮️</Text>
                  <Text style={styles.metalButtonLabel}>ÖNCEKİ</Text>
                </Pressable>
              )}

              {/* Rewind 15s (if provided) */}
              {onSeekBackward && (
                <Pressable style={styles.metalButtonMini} onPress={onSeekBackward}>
                  <Text style={styles.metalButtonMiniText}>-15s</Text>
                </Pressable>
              )}

              {/* Master Play/Pause Chrome Button */}
              <Pressable 
                style={[styles.masterPlayButton, isPlaying ? styles.masterPlayActive : styles.masterPlayInactive]} 
                onPress={onTogglePlay}
              >
                <Text style={styles.masterPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                <Text style={styles.masterPlayLabel}>{isPlaying ? 'DURAKLAT' : 'OYNAT'}</Text>
              </Pressable>

              {/* Fast Forward 15s (if provided) */}
              {onSeekForward && (
                <Pressable style={styles.metalButtonMini} onPress={onSeekForward}>
                  <Text style={styles.metalButtonMiniText}>+15s</Text>
                </Pressable>
              )}

              {/* Next Button */}
              {onNext && (
                <Pressable style={styles.metalButton} onPress={onNext}>
                  <Text style={styles.metalButtonIcon}>⏭️</Text>
                  <Text style={styles.metalButtonLabel}>SONRAKİ</Text>
                </Pressable>
              )}

              {/* Live Audio Record Button */}
              {onToggleRecord && (
                <Pressable 
                  style={[styles.recordButton, isRecording && styles.recordButtonActive]} 
                  onPress={onToggleRecord}
                >
                  <Text style={styles.recordButtonIcon}>{isRecording ? '⏹' : '🔴'}</Text>
                  <Text style={styles.recordButtonLabel}>{isRecording ? 'BİTİR' : 'KAYDET'}</Text>
                </Pressable>
              )}

              {/* Süre Ölçer / Uyku Modu Butonu (Kaydet Düğmesinin Yanında) */}
              {onSleepTimerPress && (
                <Pressable 
                  style={[
                    styles.timerButton, 
                    sleepSeconds !== undefined && sleepSeconds > 0 ? styles.timerButtonActive : null
                  ]} 
                  onPress={onSleepTimerPress}
                >
                  <Text style={styles.timerButtonIcon}>
                    {sleepSeconds !== undefined && sleepSeconds > 0 ? '⏳' : '🌙'}
                  </Text>
                  <Text style={[
                    styles.timerButtonLabel, 
                    sleepSeconds !== undefined && sleepSeconds > 0 ? styles.timerButtonLabelActive : null
                  ]}>
                    {sleepSeconds !== undefined && sleepSeconds > 0 ? formatSleepTime(sleepSeconds) : 'SÜRE ÖLÇER'}
                  </Text>
                </Pressable>
              )}

              {/* Mode Switcher Button */}
              {modeInfo && onToggleMode && (
                <Pressable 
                  style={[styles.modeButton, modeInfo.active && styles.modeButtonActive]} 
                  onPress={onToggleMode}
                >
                  <Text style={styles.modeButtonIcon}>{modeInfo.icon}</Text>
                  <Text style={styles.modeButtonLabel}>{modeInfo.label}</Text>
                </Pressable>
              )}
            </View>

            {/* Right Rotary Knob (TUNING / FREKANS) */}
            <View style={styles.knobWrapper}>
              <View style={styles.knobOuter}>
                <View style={styles.knobInner}>
                  <View style={[styles.knobIndicator, { transform: [{ rotate: '45deg' }] }]} />
                </View>
              </View>
              <Text style={styles.knobLabel}>TUNER</Text>
            </View>
          </View>
        ) : (
          <View style={styles.tapToOpenHintRow}>
            <Text style={styles.tapToOpenHintText}>👆 Ekrana dokunarak tüm düğmeleri ve ayarları açabilirsiniz</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outerChassis: {
    backgroundColor: '#0c0a09',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chassisFrame: {
    backgroundColor: '#1c1917',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#44403c',
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  topMetalTrim: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#292524',
  },
  screwRivet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#78716c',
    borderWidth: 1,
    borderColor: '#44403c',
  },
  brandBadge: {
    backgroundColor: '#292524',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#44403c',
  },
  brandBadgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  radioBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  speakerGrill: {
    width: 22,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 120,
    backgroundColor: '#0c0a09',
    borderRadius: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#292524',
  },
  grillSlot: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#292524',
  },
  tunerDisplay: {
    flex: 1,
    backgroundColor: '#022c22',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#065f46',
    padding: 10,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  displayStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  liveDotActive: {
    backgroundColor: '#34d399',
    shadowColor: '#34d399',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  liveIndicatorText: {
    color: '#6ee7b7',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stereoBadge: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sleepBadgeLcd: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  sleepBadgeLcdText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#991b1b',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    gap: 3,
  },
  recDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ffffff',
  },
  recBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  stationTitleContainer: {
    marginVertical: 4,
  },
  stationTitle: {
    color: '#34d399',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(52, 211, 153, 0.4)',
    textShadowRadius: 6,
  },
  stationSubtitle: {
    color: '#a7f3d0',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  freqScaleContainer: {
    marginVertical: 3,
  },
  freqMarksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  freqMarkText: {
    color: '#059669',
    fontSize: 8,
    fontWeight: '700',
  },
  freqTrack: {
    height: 6,
    backgroundColor: '#064e3b',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  freqTrackLine: {
    height: 1,
    backgroundColor: '#10b981',
    width: '100%',
  },
  freqNeedle: {
    position: 'absolute',
    width: 3,
    height: 12,
    backgroundColor: '#ef4444',
    borderRadius: 1.5,
    top: -3,
    shadowColor: '#ef4444',
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  eqAndFreqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  eqContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 26,
  },
  eqBar: {
    width: 4,
    borderRadius: 2,
  },
  digitalFreqText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  surahProgressWrapper: {
    marginTop: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#064e3b',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34d399',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeLabel: {
    color: '#6ee7b7',
    fontSize: 9,
    fontWeight: '600',
  },
  controlsChassisPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#292524',
    paddingHorizontal: 4,
  },
  knobWrapper: {
    alignItems: 'center',
  },
  knobOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#292524',
    borderWidth: 2,
    borderColor: '#57534e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  knobInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#44403c',
    borderWidth: 1,
    borderColor: '#78716c',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobIndicator: {
    position: 'absolute',
    top: 2,
    width: 2,
    height: 6,
    backgroundColor: '#fbbf24',
    borderRadius: 1,
  },
  knobLabel: {
    color: '#a8a29e',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },
  centerButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  metalButton: {
    backgroundColor: '#292524',
    borderWidth: 1,
    borderColor: '#57534e',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  metalButtonIcon: {
    fontSize: 13,
  },
  metalButtonLabel: {
    color: '#d6d3d1',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 1,
  },
  metalButtonMini: {
    backgroundColor: '#292524',
    borderWidth: 1,
    borderColor: '#57534e',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  metalButtonMiniText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: 'bold',
  },
  masterPlayButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    minWidth: 70,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  masterPlayActive: {
    backgroundColor: '#b91c1c',
    borderColor: '#ef4444',
  },
  masterPlayInactive: {
    backgroundColor: '#15803d',
    borderColor: '#22c55e',
  },
  masterPlayIcon: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  masterPlayLabel: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  modeButton: {
    backgroundColor: '#292524',
    borderWidth: 1,
    borderColor: '#57534e',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#065f46',
    borderColor: '#10b981',
  },
  modeButtonIcon: {
    fontSize: 12,
  },
  modeButtonLabel: {
    color: '#d6d3d1',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 1,
  },
  recordButton: {
    backgroundColor: '#292524',
    borderWidth: 1,
    borderColor: '#57534e',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#dc2626',
  },
  recordButtonIcon: {
    fontSize: 12,
  },
  recordButtonLabel: {
    color: '#d6d3d1',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 1,
  },
  timerButton: {
    backgroundColor: '#292524',
    borderWidth: 1,
    borderColor: '#57534e',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 56,
  },
  timerButtonActive: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
  },
  timerButtonIcon: {
    fontSize: 12,
  },
  timerButtonLabel: {
    color: '#d6d3d1',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 1,
  },
  timerButtonLabelActive: {
    color: '#34d399',
  },
  tapToOpenHintRow: {
    alignItems: 'center',
    paddingVertical: 4,
    marginTop: 4,
  },
  tapToOpenHintText: {
    color: '#78716c',
    fontSize: 10,
    fontWeight: '500',
  },
});
