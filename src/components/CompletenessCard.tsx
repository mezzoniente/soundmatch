import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
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
  const barColor = result.meetsMinimum ? Colors.teal : Colors.gold;

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
        <Text style={styles.ok}>✓ Seu perfil já aparece nas recomendações.</Text>
      )}

      <TouchableOpacity style={styles.nextBtn} onPress={goToNext} activeOpacity={0.8}>
        <Text style={styles.nextLabel}>Próximo: {next.label}</Text>
        <Text style={styles.nextArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  percent: { fontSize: 15, fontWeight: '900' },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.bg, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  warning: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  ok: { fontSize: 13, color: Colors.teal, fontWeight: '600' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 2,
  },
  nextLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  nextArrow: { color: Colors.teal, fontSize: 18, fontWeight: '800' },
});
