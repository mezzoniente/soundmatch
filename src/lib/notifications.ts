import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { supabase } from './supabase';

/**
 * Define como uma notificação é exibida quando o app está em primeiro plano.
 * Chamado uma vez no boot do app.
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Dispara uma notificação LOCAL imediatamente.
 * Funciona no Expo Go — não depende de push remoto nem de credenciais.
 */
export async function notifyLocal(title: string, body: string, data?: Record<string, unknown>) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {} },
      trigger: null, // null = imediato
    });
  } catch {
    // Silencioso: ambiente sem suporte a notificações não deve quebrar o app.
  }
}

/** Solicita permissão para notificações. Retorna se foi concedida. */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  return status === 'granted';
}

/**
 * Registra o Expo push token do dispositivo na tabela push_tokens.
 *
 * NOTA: push remoto NÃO funciona no Expo Go (precisa de development build +
 * credenciais FCM/APNs). Esta função é tolerante a isso: se não conseguir o
 * token (ex: rodando no Expo Go), apenas retorna null sem erro. A estrutura
 * fica pronta para quando o app migrar para development build.
 */
export async function registerPushToken(userId: string): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Padrão',
        importance: AndroidImportance.DEFAULT,
      });
    }

    // projectId vem da config EAS; ausente no Expo Go sem EAS configurado.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      // Sem projectId não há como obter um Expo push token válido (Expo Go/local).
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;

    await supabase.from('push_tokens').upsert(
      { user_id: userId, token, platform: Platform.OS, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,token' }
    );
    return token;
  } catch {
    // Ambiente sem suporte (ex: Expo Go) — não é erro fatal.
    return null;
  }
}
