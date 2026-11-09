import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '../constants/colors';
import type { MediaSample } from '../data/mockData';

interface VideoSamplePlayerProps {
  sample: MediaSample;
  /** Callback opcional para remover a amostra (modo edição). */
  onRemove?: () => void;
}

/**
 * Player de uma amostra de vídeo.
 * Usa `expo-video` (useVideoPlayer + VideoView) com controles nativos.
 */
export function VideoSamplePlayer({ sample, onRemove }: VideoSamplePlayerProps) {
  const player = useVideoPlayer(sample.uri, (p) => {
    p.loop = false;
  });

  return (
    <View style={styles.card}>
      <View style={styles.videoWrapper}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.title} numberOfLines={1}>
          🎬 {sample.title}
        </Text>
        {onRemove ? (
          <Pressable onPress={onRemove} style={styles.removeBtn} accessibilityLabel="Remover amostra">
            <Text style={styles.removeIcon}>✕</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: { width: '100%', height: '100%' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: { color: Colors.textSecondary, fontSize: 14 },
});
