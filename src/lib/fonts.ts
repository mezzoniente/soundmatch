/**
 * Carregamento de fontes do Design System V2.
 *
 * Duas famílias:
 * - **Inter** (corpo e UI) via `@expo-google-fonts/inter`. Cada peso é um módulo
 *   próprio; no React Native cada módulo vira uma `fontFamily` independente, então
 *   referenciamos pelo nome do peso (ex.: `Inter_600SemiBold`) em vez de confiar
 *   em `fontWeight` sobre uma família única.
 * - **Clash Display** (títulos e nome do artista) via arquivos locais em
 *   `assets/fonts`. Carregada como uma família multi-peso usando o array de
 *   `FontFamilyDefinition` do expo-font (SDK 58+), de modo que `fontWeight`
 *   seleciona a face certa sob a família `ClashDisplay`.
 *
 * `useFonts` funciona no Expo Go (diferente do config plugin, que exigiria
 * development build). Ver docs: https://docs.expo.dev/develop/user-interface/fonts/
 */
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

/**
 * Nomes de `fontFamily` para usar nos estilos. Centralizados aqui para que a
 * escala tipográfica (typography.ts) e telas avulsas referenciem um só lugar.
 */
export const Fonts = {
  // Corpo / UI (Inter, por peso)
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  // Display (Clash Display, família multi-peso: use com fontWeight 500/600/700)
  display: 'ClashDisplay',
} as const;

/**
 * Carrega todas as fontes do app. Deve ser chamado no layout raiz; enquanto
 * `loaded` for falso o app segura a splash screen.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts([
    // Inter — um módulo por peso (viram famílias próprias)
    { fontFamily: Fonts.regular, fontDefinitions: [{ path: Inter_400Regular, weight: 400 }] },
    { fontFamily: Fonts.medium, fontDefinitions: [{ path: Inter_500Medium, weight: 500 }] },
    { fontFamily: Fonts.semibold, fontDefinitions: [{ path: Inter_600SemiBold, weight: 600 }] },
    { fontFamily: Fonts.bold, fontDefinitions: [{ path: Inter_700Bold, weight: 700 }] },
    { fontFamily: Fonts.extrabold, fontDefinitions: [{ path: Inter_800ExtraBold, weight: 800 }] },
    // Clash Display — família única com múltiplos pesos (fontWeight seleciona a face)
    {
      fontFamily: Fonts.display,
      fontDefinitions: [
        { path: require('../../assets/fonts/ClashDisplay-Medium.ttf'), weight: 500 },
        { path: require('../../assets/fonts/ClashDisplay-Semibold.ttf'), weight: 600 },
        { path: require('../../assets/fonts/ClashDisplay-Bold.ttf'), weight: 700 },
      ],
    },
  ]);

  return loaded;
}
