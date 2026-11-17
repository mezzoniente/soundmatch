import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ProfileProvider, useProfile } from '../src/state/ProfileContext';
import { AuthProvider, useAuth } from '../src/state/AuthContext';
import { FilterProvider } from '../src/state/FilterContext';
import { UsageProvider } from '../src/state/UsageContext';
import { Colors } from '../src/constants/colors';
import { configureNotificationHandler, registerPushToken } from '../src/lib/notifications';
import { useAppFonts } from '../src/lib/fonts';

// Define como as notificações aparecem com o app aberto (executa uma vez).
configureNotificationHandler();

// Segura a splash screen nativa até as fontes do Design System carregarem.
SplashScreen.preventAutoHideAsync();

/**
 * Redireciona com base na sessão e no estado de onboarding:
 * - sem sessão -> tela de auth
 * - logado mas sem perfil concluído -> onboarding (criação guiada)
 * - logado e com perfil -> app (tabs)
 */
function AuthGate() {
  const { session, user, isLoading } = useAuth();
  const { isOnboarded, isHydrating } = useProfile();
  const segments = useSegments();
  const router = useRouter();

  // Registra o push token ao logar (tolerante ao Expo Go: no-op se indisponível).
  useEffect(() => {
    if (user) registerPushToken(user.id);
  }, [user]);

  useEffect(() => {
    // Aguarda tanto a sessão quanto o perfil carregarem antes de decidir a rota.
    if (isLoading) return;

    const onAuthScreen = segments[0] === 'auth';
    const onOnboarding = segments[0] === 'onboarding';

    if (!session) {
      if (!onAuthScreen) router.replace('/auth');
      return;
    }

    // Logado: espera o perfil hidratar para saber se já fez onboarding.
    if (isHydrating) return;

    if (!isOnboarded && !onOnboarding) {
      // Novo usuário (ou perfil incompleto): leva direto para a criação guiada.
      router.replace('/onboarding');
    } else if (isOnboarded && (onAuthScreen || onOnboarding)) {
      router.replace('/(tabs)');
    } else if (onAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, isOnboarded, isHydrating, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.teal} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile/[id]"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit-profile"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="filters"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="post-opening"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="post-event"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="studios"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="upgrade"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="review/[id]"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  // Esconde a splash assim que as fontes carregarem (ou falharem).
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Mantém a splash nativa visível até as fontes estarem prontas.
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ProfileProvider>
        <FilterProvider>
          <UsageProvider>
            <View style={styles.root}>
              <StatusBar style="light" />
              <AuthGate />
            </View>
          </UsageProvider>
        </FilterProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
});
