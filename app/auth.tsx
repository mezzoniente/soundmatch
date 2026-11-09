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
            <Text style={styles.logo}>🎸</Text>
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

            <TouchableOpacity
              style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <Text style={styles.submitText}>{isSignup ? 'Criar conta' : 'Entrar'}</Text>
              )}
            </TouchableOpacity>

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
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 56, marginBottom: 12 },
  appName: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: Colors.textSecondary, marginTop: 8 },
  form: {},
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 },
  error: {
    color: Colors.red,
    fontSize: 14,
    marginBottom: 12,
    marginTop: -8,
  },
  submitBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: Colors.bgCard },
  submitText: { color: Colors.bg, fontSize: 16, fontWeight: '800' },
  toggle: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: Colors.textSecondary, fontSize: 14 },
  toggleLink: { color: Colors.teal, fontWeight: '700' },
});
