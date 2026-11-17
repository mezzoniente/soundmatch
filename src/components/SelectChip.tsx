import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Icon, IconName } from './Icon';

interface SelectChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Ícone vetorial opcional exibido antes do label. */
  icon?: IconName;
}

/** Chip selecionável usado nas telas de seleção múltipla/única do onboarding. */
export function SelectChip({ label, selected, onPress, icon }: SelectChipProps) {
  const contentColor = selected ? Colors.base : Colors.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon ? <Icon name={icon} size={14} color={contentColor} style={styles.icon} /> : null}
      <Text style={[styles.label, { color: contentColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  icon: { marginRight: 0 },
  label: { fontSize: 14, fontWeight: '600' },
});
