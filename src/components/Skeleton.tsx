import React, { useEffect, useState } from 'react';
import { Animated, View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';

/**
 * Placeholder de carregamento com pulso suave de opacidade (shimmer barato).
 * Base dos estados de loading do Design System (V6) — substitui os spinners.
 *
 * Usa `Animated` nativo em loop (`useNativeDriver`); o valor animado vive em
 * `useState` com inicializador preguiçoso (não é ref), conforme as regras de
 * hooks do eslint-config-expo.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = Radius.sm,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [pulse] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: Colors.elevated, opacity: pulse },
        style,
      ]}
    />
  );
}

/** Placeholder no formato de um card de feed (vaga/evento). */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Skeleton width={90} height={22} radius={Radius.sm} />
        <Skeleton width={70} height={22} radius={Radius.sm} />
      </View>
      <Skeleton width="70%" height={18} />
      <Skeleton width="100%" height={13} />
      <Skeleton width="85%" height={13} />
      <View style={styles.tagsRow}>
        <Skeleton width={72} height={24} radius={Radius.sm} />
        <Skeleton width={60} height={24} radius={Radius.sm} />
        <Skeleton width={64} height={24} radius={Radius.sm} />
      </View>
    </View>
  );
}

/** Lista de cards-placeholder para preencher o feed enquanto carrega. */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xs, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm + 2,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tagsRow: { flexDirection: 'row', gap: Spacing.xs + 2, marginTop: Spacing.xs },
});

