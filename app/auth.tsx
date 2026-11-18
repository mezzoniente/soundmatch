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
import { Colors } from '../src/constants/colors';
import { Spacing, Radius } from '../src/constants/theme';
import { Typography } from '../src/constants/typography';
import { Icon } from '../src/components/Icon';
import { PressableScale } from '../src/components/PressableScale';
import { FormField } from '../src/components/FormField';
import { useAuth } from '../src/state/AuthContext';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 6 &&
    (!isSignup || name.trim().length > 0);

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      if (isSignup) {
        const result = await signUp(email.trim(), password, name.trim());
        if (result.error) {
          setError(result.error);
        } else if (result.needsEmailConfirmation) {
          Alert.alert(
            'Confirme seu e-mail',
            'Enviamos um link de confirmação para o seu e-mail. Confirme e depois faça login.',
            [{ text: 'OK', onPress: () => setMode('signin') }]
          );
        }
        // Se não precisa confirmar, a sessão já foi criada e o guard redireciona.
      } else {
        const result = await signIn(email.trim(), password);
        if (result.error) setError(result.error);
        // Em sucesso, o guard de rota redireciona automaticamente.
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoHalo}>
              <Icon name="musical-notes" size={40} color={Colors.accent} />
            </View>
            <Text style={styles.appName}>SoundMatch</Text>
            <Text style={styles.tagline}>Conecte-se com músicos de verdade.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>{isSignup ? 'Criar conta' : 'Entrar'}</Text>

            {isSignup && (
              <FormField
                label="Nome artístico"
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                autoCapitalize="words"
              />
            )}

            <FormField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FormField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              autoCapitalize="none"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <PressableScale
              style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.base} />
              ) : (
                <Text style={styles.submitText}>{isSignup ? 'Criar conta' : 'Entrar'}</Text>
              )}
            </PressableScale>

            <TouchableOpacity onPress={toggleMode} style={styles.toggle}>
              <Text style={styles.toggleText}>
                {isSignup ? 'Já tem conta? ' : 'Não tem conta? '}
                <Text style={styles.toggleLink}>{isSignup ? 'Entrar' : 'Criar conta'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  brand: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoHalo: {
    width: 84,
    height: 84,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: { ...Typography.h1, fontSize: 32 },
  tagline: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.sm },
  form: {},
  title: { ...Typography.h2, marginBottom: Spacing.xl },
  error: {
    color: Colors.danger,
    fontSize: 14,
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnDisabled: { backgroundColor: Colors.surface },
  submitText: { ...Typography.button, fontSize: 16 },
  toggle: { marginTop: Spacing.xl, alignItems: 'center' },
  toggleText: { color: Colors.textSecondary, fontSize: 14 },
  toggleLink: { color: Colors.accent, fontWeight: '700' },
});
