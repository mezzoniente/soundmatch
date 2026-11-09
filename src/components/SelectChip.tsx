import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../constants/colors';

interface SelectChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Ícone opcional exibido antes do label. */
  icon?: string;
}

/** Chip selecionável usado nas telas de seleção múltipla/única do onboarding. */
export function SelectChip({ label, selected, onPress, icon }: SelectChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon ? <Text style={styles.icon}>{icon} </Text> : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  icon: { fontSize: 14 },
  label: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  labelSelected: { color: Colors.bg },
});
