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
            <Text style={styles.headerIcon}>‹</Text>
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
                <Text style={[styles.star, { color: i <= rating ? Colors.gold : Colors.textMuted }]}>
                  ★
                </Text>
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
          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
            onPress={submit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                Enviar avaliação
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 32, color: Colors.textPrimary, lineHeight: 32 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  content: { padding: 20 },
  subtitle: { fontSize: 16, color: Colors.textPrimary, marginBottom: 20, fontWeight: '600' },
  starsPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
  },
  star: { fontSize: 44 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  submitBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: Colors.bgCard },
  submitText: { color: Colors.bg, fontSize: 16, fontWeight: '800' },
  submitTextDisabled: { color: Colors.textMuted },
});
