import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Colors } from '../constants/colors';
import type { MessageAudio } from '../data/mockData';

/**
 * Preview de áudio compacto embutido num balão de chat.
 * Usa `expo-audio`; cores adaptáveis ao lado da bolha (minha/deles).
 */
export function ChatAudioPreview({ audio, mine }: { audio: MessageAudio; mine: boolean }) {
  const player = useAudioPlayer(audio.uri);
  const status = useAudioPlayerStatus(player);
  const [hasError, setHasError] = useState(false);

  const isPlaying = status.playing;
  const duration = status.duration || 0;
  const position = status.currentTime || 0;
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0);
      player.pause();
    }
  }, [status.didJustFinish, player]);

  const toggle = () => {
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

  const fg = mine ? Colors.bg : Colors.teal;
  const track = mine ? 'rgba(10,14,26,0.25)' : Colors.bg;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggle}
        style={[styles.playBtn, { borderColor: fg }]}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pausar áudio' : 'Tocar áudio'}
      >
        <Text style={[styles.playIcon, { color: fg }]}>{isPlaying ? '❚❚' : '▶'}</Text>
      </Pressable>
      <View style={styles.info}>
        <Text style={[styles.title, { color: mine ? Colors.bg : Colors.textPrimary }]} numberOfLines={1}>
          🎵 {audio.title}
        </Text>
        {hasError ? (
          <Text style={styles.error}>Não foi possível tocar</Text>
        ) : (
          <View style={[styles.track, { backgroundColor: track }]}>
            <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: fg }]} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 180, paddingVertical: 2 },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 12, fontWeight: '900' },
  info: { flex: 1, gap: 5 },
  title: { fontSize: 13, fontWeight: '600' },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  error: { fontSize: 11, color: Colors.red },
});
