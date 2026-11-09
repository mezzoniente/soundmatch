import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/colors';

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
  wrapper: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hint: { fontSize: 13, color: Colors.textMuted, marginBottom: 8 },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
});
