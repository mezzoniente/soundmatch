import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';

interface FormFieldProps extends TextInputProps {
  label: string;
  /** Texto de ajuda exibido abaixo do label. */
  hint?: string;
}

/** Campo de texto rotulado, padronizado para os formulários do app. */
export function FormField({ label, hint, style, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.textMuted}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.xl },
  label: { ...Typography.label, fontSize: 13, letterSpacing: 0.8, marginBottom: Spacing.xs + 2 },
  hint: { fontSize: 13, color: Colors.textMuted, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
  },
});
