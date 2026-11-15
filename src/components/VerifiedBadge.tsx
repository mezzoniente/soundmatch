import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

/**
 * Selo de perfil verificado (músico que subiu amostra de áudio/vídeo).
 * `compact` exibe só o ícone; o padrão mostra ícone + texto.
 */
export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <View style={styles.compact}>
        <Text style={styles.compactIcon}>✓</Text>
      </View>
    );
  }
  return (
    <View style={styles.badge}>
      <Text style={styles.icon}>✓</Text>
      <Text style={styles.text}>Verificado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 212, 200, 0.15)',
    borderWidth: 1,
    borderColor: Colors.teal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  icon: { color: Colors.teal, fontSize: 12, fontWeight: '900' },
  text: { color: Colors.teal, fontSize: 12, fontWeight: '700' },
  compact: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIcon: { color: Colors.bg, fontSize: 11, fontWeight: '900' },
});
