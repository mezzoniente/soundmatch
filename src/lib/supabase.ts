import 'expo-sqlite/localStorage/install';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabasePublishableKey) {
  // Falha cedo e com mensagem clara se o .env.local não estiver carregado.
  console.warn(
    '[supabase] Variáveis EXPO_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY ausentes. ' +
      'Confira o arquivo .env.local e reinicie o servidor com `npx expo start --clear`.'
  );
}

/**
 * Cliente Supabase único do app.
 * A sessão é persistida no dispositivo via `expo-sqlite/localStorage`,
 * mantendo o usuário logado entre aberturas do app.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Em Android/iOS não há URL para ler a sessão, diferente da web.
    detectSessionInUrl: false,
  },
});

// Atrela o refresh automático de token ao ciclo de vida do app,
// conforme recomendado pela documentação do Supabase.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
