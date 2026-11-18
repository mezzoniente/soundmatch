import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { Spacing, Radius } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { Icon } from '../../src/components/Icon';
import { PressableScale } from '../../src/components/PressableScale';
import { FormField } from '../../src/components/FormField';
import { useAuth } from '../../src/state/AuthContext';
import { submitReview } from '../../src/lib/reviewsRepository';
import { MOCK_ARTISTS } from '../../src/data/mockData';

export default function ReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const target = MOCK_ARTISTS.find((a) => a.id === id);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = rating > 0;

  const submit = async () => {
    if (!canSubmit || !user || !id) return;
    setSubmitting(true);
    const { error } = await submitReview(user.id, {
      revieweeId: id,
      rating,
      comment: comment.trim(),
      context: context.trim(),
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação. Tente novamente.');
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Avaliar</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Como foi colaborar com {target?.name ?? 'esse músico'}?
          </Text>

          {/* Seletor de estrelas */}
          <View style={styles.starsPicker}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} hitSlop={8}>
                <Icon
                  name={i <= rating ? 'star' : 'star-outline'}
                  size={44}
                  color={i <= rating ? Colors.warning : Colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>

          <FormField
            label="Contexto (opcional)"
            value={context}
            onChangeText={setContext}
            placeholder="Ex: Gravação de EP, show no bar X"
          />
          <FormField
            label="Comentário (opcional)"
            value={comment}
            onChangeText={setComment}
            placeholder="Conte como foi a experiência..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PressableScale
            style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
            onPress={submit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.base} />
            ) : (
              <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                Enviar avaliação
              </Text>
            )}
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.h3, fontSize: 18 },

  content: { padding: Spacing.xl },
  subtitle: { fontSize: 16, color: Colors.textPrimary, marginBottom: Spacing.xl, fontWeight: '600' },
  starsPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm + 2,
    marginBottom: Spacing.xxl,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.base,
  },
  submitBtn: {
    backgroundColor: Colors.warning,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: Colors.surface },
  submitText: { ...Typography.button, fontSize: 16 },
  submitTextDisabled: { color: Colors.textMuted },
});
