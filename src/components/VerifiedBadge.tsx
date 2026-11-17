import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Icon } from './Icon';

/**
 * Selo de perfil verificado (músico que subiu amostra de áudio/vídeo).
 * `compact` exibe só o ícone; o padrão mostra ícone + texto.
 */
export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <View style={styles.compact}>
        <Icon name="checkmark" size={11} color={Colors.base} />
      </View>
    );
  }
  return (
    <View style={styles.badge}>
      <Icon name="checkmark-circle" size={13} color={Colors.accent} />
      <Text style={styles.text}>Verificado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  text: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  compact: {
    width: 18,
    height: 18,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
