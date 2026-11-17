import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { Radius, Elevation } from '../constants/theme';

/**
 * Superfície de vidro reutilizável do Design System V1.
 *
 * Dois modos de renderização (ver DESIGN.md — estratégia de dois níveis de glass):
 *
 * - `variant="blur"` (padrão): vidro REAL via `expo-blur`. Reservado para pontos
 *   de alto impacto (hero, tab bar, modais, badges sobre imagem). Mais caro de
 *   renderizar — evite dezenas simultâneos numa lista.
 * - `variant="translucent"`: vidro "falso" (rgba + borda de luz, sem blur). Barato,
 *   para a maioria dos cards. É o fallback quando não se quer custo de blur.
 *
 * Em ambos os modos a borda de luz e `overflow: 'hidden'` (para o raio recortar o
 * conteúdo) são aplicados aqui, de modo que as telas não repitam esses detalhes.
 *
 * `tintColor` tinge a superfície com a cor adaptativa (vibe do artista); use os
 * valores de `paletteFromVibe` (ex.: `palette.tintedGlass`).
 */

type GlassVariant = 'blur' | 'translucent';

export interface GlassViewProps {
  children?: React.ReactNode;
  /** Modo de renderização. Default: 'blur'. */
  variant?: GlassVariant;
  /** Intensidade do blur (0-100). Só se aplica a `variant="blur"`. Default: 60. */
  intensity?: number;
  /** Raio de borda. Default: Radius.lg. Use Radius.pill para elementos redondos. */
  radius?: number;
  /** Nível de elevação (sombra). Default: 'none'. */
  elevation?: keyof typeof Elevation;
  /** Preenchimento translúcido tingido (ex.: palette.tintedGlass). */
  tintColor?: string;
  /** Cor da borda de luz. Default: Colors.glassBorder. */
  borderColor?: string;
  /** Oculta a borda de luz. */
  noBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GlassView({
  children,
  variant = 'blur',
  intensity = 60,
  radius = Radius.lg,
  elevation = 'none',
  tintColor,
  borderColor,
  noBorder = false,
  style,
}: GlassViewProps) {
  const frame: ViewStyle = {
    borderRadius: radius,
    overflow: 'hidden',
    borderWidth: noBorder ? 0 : 1,
    borderColor: borderColor ?? Colors.glassBorder,
    ...Elevation[elevation],
  };

  if (variant === 'blur') {
    return (
      <BlurView intensity={intensity} tint="dark" style={[frame, style]}>
        {tintColor ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]} />
        ) : null}
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        frame,
        { backgroundColor: tintColor ?? Colors.glass },
        style,
      ]}
    >
      {children}
    </View>
  );
}
