import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Icon } from './Icon';
import { DetectedLink, providerMeta } from '../lib/linkDetection';

/** Cartão clicável para um link musical dentro de uma mensagem. */
export function ChatLinkCard({ link, mine }: { link: DetectedLink; mine: boolean }) {
  const meta = providerMeta(link.provider);

  const open = () => {
    Linking.openURL(link.url).catch(() => {
      // Falha silenciosa: URL inválida ou sem app para abrir.
    });
  };

  return (
    <Pressable
      onPress={open}
      style={[styles.card, mine ? styles.cardMine : styles.cardTheirs]}
      accessibilityRole="link"
    >
      <Icon name={meta.icon} size={20} color={mine ? Colors.base : meta.color} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.provider, mine && styles.providerMine]}>{meta.label}</Text>
        <Text style={[styles.url, mine && styles.urlMine]} numberOfLines={1}>
          {link.url.replace(/^https?:\/\//, '')}
        </Text>
      </View>
      <Icon
        name="open-outline"
        size={16}
        color={mine ? 'rgba(8,11,20,0.6)' : Colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    borderRadius: Radius.sm,
    padding: Spacing.sm + 2,
    minWidth: 200,
  },
  cardMine: { backgroundColor: 'rgba(8,11,20,0.18)' },
  cardTheirs: { backgroundColor: Colors.base, borderWidth: 1, borderColor: Colors.border },
  provider: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  providerMine: { color: Colors.base },
  url: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  urlMine: { color: 'rgba(8,11,20,0.6)' },
});
