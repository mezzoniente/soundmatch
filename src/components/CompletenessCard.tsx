import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';
import { Icon } from './Icon';
import { MINIMUM_COMPLETENESS, type CompletenessResult } from '../lib/profileCompleteness';

/**
 * Cartão de gamificação da completude do perfil.
 * Mostra a barra de progresso, destaca se o perfil já aparece no feed
 * (mínimo atingido) e sugere o próximo item a preencher.
 */
export function CompletenessCard({ result }: { result: CompletenessResult }) {
  const router = useRouter();

  // Perfil completo: nada a mostrar.
  if (result.missing.length === 0) return null;

  const next = result.missing[0];
  const barColor = result.meetsMinimum ? Colors.accent : Colors.warning;

  const goToNext = () => {
    if (next.key === 'samples') {
      // Amostras são editadas direto na tela de perfil; apenas informa.
      return;
    }
    if (next.editSection) {
      router.push(`/edit-profile/${next.editSection}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Complete seu perfil</Text>
        <Text style={[styles.percent, { color: barColor }]}>{result.score}%</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${result.score}%`, backgroundColor: barColor }]} />
      </View>

      {!result.meetsMinimum ? (
        <Text style={styles.warning}>
          Chegue a {MINIMUM_COMPLETENESS}% para aparecer nas recomendações de outros músicos.
        </Text>
      ) : (
        <View style={styles.okRow}>
          <Icon name="checkmark-circle" size={14} color={Colors.accent} />
          <Text style={styles.ok}>Seu perfil já aparece nas recomendações.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.nextBtn} onPress={goToNext} activeOpacity={0.8}>
        <Text style={styles.nextLabel}>Próximo: {next.label}</Text>
        <Icon name="arrow-forward" size={18} color={Colors.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm + 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...Typography.h3, fontSize: 15 },
  percent: { fontSize: 15, fontWeight: '900' },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.base, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  warning: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs + 2 },
  ok: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.elevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
    marginTop: 2,
  },
  nextLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
});
