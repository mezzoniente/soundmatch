import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { uploadFile } from '../../lib/storage';
import { useAuth } from '../../state/AuthContext';
import { useProfile } from '../../state/ProfileContext';

type Target = 'avatar' | 'cover';

/**
 * Edição de foto de perfil e banner.
 * O upload acontece na hora da escolha (não espera "Salvar"): seleciona da
 * galeria, envia ao Supabase Storage e grava a URL pública no perfil.
 */
export function PhotosForm() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [uploading, setUploading] = useState<Target | null>(null);

  const pickImage = async (target: Target) => {
    if (!user) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: target === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.9,
      });
      if (result.canceled || result.assets.length === 0) return;

      setUploading(target);
      const asset = result.assets[0];
      const upload = await uploadFile('avatars', user.id, asset.uri, target, 'jpg');
      if (upload.error || !upload.publicUrl) {
        Alert.alert('Erro', 'Não foi possível enviar a imagem. Tente novamente.');
        return;
      }

      if (target === 'avatar') {
        updateProfile({ avatarUrl: upload.publicUrl, avatar: upload.publicUrl });
      } else {
        updateProfile({ coverUrl: upload.publicUrl, coverImage: upload.publicUrl });
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a imagem. Tente novamente.');
    } finally {
      setUploading(null);
    }
  };

  return (
    <View>
      {/* Banner */}
      <Text style={styles.label}>Banner</Text>
      <Pressable onPress={() => pickImage('cover')} style={styles.bannerWrap}>
        {profile.coverImage ? (
          <Image source={{ uri: profile.coverImage }} style={styles.banner} resizeMode="cover" />
        ) : null}
        <View style={styles.bannerOverlay}>
          {uploading === 'cover' ? (
            <ActivityIndicator color={Colors.textPrimary} />
          ) : (
            <Text style={styles.overlayText}>🖼️  Trocar banner</Text>
          )}
        </View>
      </Pressable>

      {/* Foto de perfil */}
      <Text style={[styles.label, { marginTop: 24 }]}>Foto de perfil</Text>
      <View style={styles.avatarRow}>
        <Pressable onPress={() => pickImage('avatar')} style={styles.avatarWrap}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} resizeMode="cover" />
          ) : null}
          <View style={styles.avatarOverlay}>
            {uploading === 'avatar' ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <Text style={styles.avatarOverlayText}>📷</Text>
            )}
          </View>
        </Pressable>
        <Text style={styles.hint}>
          Toque na foto para trocar.{'\n'}Recomendado: imagem quadrada.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  bannerWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  banner: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  overlayText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.teal,
  },
  avatar: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  avatarOverlayText: { fontSize: 26 },
  hint: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
