import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../constants/colors';
import { AudioSamplePlayer } from './AudioSamplePlayer';
import { VideoSamplePlayer } from './VideoSamplePlayer';
import { uploadFile } from '../lib/storage';
import { useAuth } from '../state/AuthContext';
import type { MediaSample } from '../data/mockData';

interface MediaSamplesSectionProps {
  samples: MediaSample[];
  /**
   * Quando fornecidos, a seção entra em "modo edição":
   * exibe botão de adicionar e permite remover amostras.
   */
  onAdd?: (sample: MediaSample) => void;
  onRemove?: (id: string) => void;
}

/**
 * Seção de amostras artísticas (áudio/vídeo).
 * Em modo leitura, apenas lista os players.
 * Em modo edição (onAdd/onRemove), permite escolher vídeo da galeria via expo-image-picker.
 */
export function MediaSamplesSection({ samples, onAdd, onRemove }: MediaSamplesSectionProps) {
  const { user } = useAuth();
  // Indica qual seletor está aberto / enviando (desabilita os botões).
  const [picking, setPicking] = useState<null | 'audio' | 'video'>(null);
  const editable = Boolean(onAdd);

  const pickVideo = async () => {
    if (!onAdd || !user) return;
    try {
      setPicking('video');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso à sua galeria para adicionar amostras.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 1,
        videoMaxDuration: 90,
      });
      if (result.canceled || result.assets.length === 0) return;

      const asset = result.assets[0];
      // Sobe o vídeo para o storage e usa a URL pública (funciona em qualquer dispositivo).
      const upload = await uploadFile('media-samples', user.id, asset.uri, 'video', 'mp4');
      if (upload.error || !upload.publicUrl) {
        Alert.alert('Erro', 'Não foi possível enviar o vídeo. Tente novamente.');
        return;
      }

      const sample: MediaSample = {
        id: `sample-${Date.now()}`,
        type: 'video',
        uri: upload.publicUrl,
        title: asset.fileName ?? 'Nova amostra',
        durationSec: asset.duration ? Math.round(asset.duration / 1000) : undefined,
      };
      onAdd(sample);
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar a amostra. Tente novamente.');
    } finally {
      setPicking(null);
    }
  };

  const pickAudio = async () => {
    if (!onAdd || !user) return;
    try {
      setPicking('audio');
      // Áudio não vive na galeria; usamos o seletor de documentos filtrando por audio/*.
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const asset = result.assets[0];
      const upload = await uploadFile('media-samples', user.id, asset.uri, 'audio', 'mp3');
      if (upload.error || !upload.publicUrl) {
        Alert.alert('Erro', 'Não foi possível enviar o áudio. Tente novamente.');
        return;
      }

      const sample: MediaSample = {
        id: `sample-${Date.now()}`,
        type: 'audio',
        uri: upload.publicUrl,
        title: asset.name ?? 'Nova amostra',
      };
      onAdd(sample);
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o áudio. Tente novamente.');
    } finally {
      setPicking(null);
    }
  };

  const hasSamples = samples.length > 0;

  if (!editable && !hasSamples) {
    // Modo leitura sem amostras: não renderiza a seção.
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>AMOSTRAS</Text>
        {editable ? (
          <View style={styles.addButtons}>
            <Pressable
              onPress={pickAudio}
              disabled={picking !== null}
              style={[styles.addBtn, picking !== null && styles.addBtnDisabled]}
            >
              <Text style={styles.addText}>{picking === 'audio' ? '...' : '＋ Áudio'}</Text>
            </Pressable>
            <Pressable
              onPress={pickVideo}
              disabled={picking !== null}
              style={[styles.addBtn, picking !== null && styles.addBtnDisabled]}
            >
              <Text style={styles.addText}>{picking === 'video' ? '...' : '＋ Vídeo'}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {!hasSamples ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nenhuma amostra ainda. Adicione um áudio ou vídeo tocando para validar seu nível.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {samples.map((sample) =>
            sample.type === 'audio' ? (
              <AudioSamplePlayer
                key={sample.id}
                sample={sample}
                onRemove={onRemove ? () => onRemove(sample.id) : undefined}
              />
            ) : (
              <VideoSamplePlayer
                key={sample.id}
                sample={sample}
                onRemove={onRemove ? () => onRemove(sample.id) : undefined}
              />
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingTop: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  addButtons: { flexDirection: 'row', gap: 8 },
  addBtn: {
    backgroundColor: Colors.teal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addBtnDisabled: { opacity: 0.5 },
  addText: { color: Colors.bg, fontSize: 12, fontWeight: '700' },
  list: { gap: 10 },
  empty: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
});
