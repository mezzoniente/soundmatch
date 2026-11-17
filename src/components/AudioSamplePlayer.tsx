import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Icon } from './Icon';
import type { MediaSample } from '../data/mockData';

interface AudioSamplePlayerProps {
  sample: MediaSample;
  /** Callback opcional para remover a amostra (modo edição). */
  onRemove?: () => void;
}

/**
 * Player compacto de uma amostra de áudio.
 * Usa `expo-audio` (useAudioPlayer) — reprodução play/pause com barra de progresso.
 */
export function AudioSamplePlayer({ sample, onRemove }: AudioSamplePlayerProps) {
  const player = useAudioPlayer(sample.uri);
  const status = useAudioPlayerStatus(player);
  const [hasError, setHasError] = useState(false);

  const isPlaying = status.playing;
  const duration = status.duration || sample.durationSec || 0;
  const position = status.currentTime || 0;
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  useEffect(() => {
    // Quando a reprodução termina, volta ao início para poder tocar de novo.
    if (status.didJustFinish) {
      player.seekTo(0);
      player.pause();
    }
  }, [status.didJustFinish, player]);

  const togglePlay = () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch {
      setHasError(true);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={togglePlay}
        style={styles.playBtn}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pausar amostra' : 'Tocar amostra'}
      >
        <Icon name={isPlaying ? 'pause' : 'play'} size={16} color={Colors.base} />
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {sample.title}
        </Text>
        {hasError ? (
          <Text style={styles.errorText}>Não foi possível reproduzir</Text>
        ) : (
          <>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.time}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </>
        )}
      </View>

      {onRemove ? (
        <Pressable onPress={onRemove} style={styles.removeBtn} accessibilityLabel="Remover amostra">
          <Icon name="close" size={14} color={Colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: Spacing.xs + 2 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.base,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  time: { color: Colors.textSecondary, fontSize: 11, marginTop: Spacing.xs },
  errorText: { color: Colors.danger, fontSize: 12 },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
