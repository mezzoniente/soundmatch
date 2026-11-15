import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Colors } from '../constants/colors';
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
      <Text style={styles.icon}>{meta.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.provider, mine && styles.providerMine]}>{meta.label}</Text>
        <Text style={[styles.url, mine && styles.urlMine]} numberOfLines={1}>
          {link.url.replace(/^https?:\/\//, '')}
        </Text>
      </View>
      <Text style={[styles.arrow, mine && styles.arrowMine]}>↗</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 10,
    minWidth: 200,
  },
  cardMine: { backgroundColor: 'rgba(10,14,26,0.18)' },
  cardTheirs: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  icon: { fontSize: 20 },
  provider: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  providerMine: { color: Colors.bg },
  url: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  urlMine: { color: 'rgba(10,14,26,0.6)' },
  arrow: { fontSize: 16, color: Colors.textSecondary },
  arrowMine: { color: 'rgba(10,14,26,0.6)' },
});
