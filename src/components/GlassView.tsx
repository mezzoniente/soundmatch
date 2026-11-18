import React, { ComponentRef, RefObject } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { Radius, Elevation } from '../constants/theme';

/**
 * Superfície de vidro reutilizável do Design System.
 *
 * Estratégia (ver DESIGN.md §2) — **dois níveis**, agora consistentes entre
 * plataformas:
 *
 * - `variant="tonal"` (padrão): vidro translúcido em camadas — preenchimento
 *   semitransparente + faixa de luz no topo + borda de luz + sombra. **Sem blur**,
 *   então renderiza igual em iOS e Android e é barato. É o padrão para a maioria
 *   dos cards/controles.
 * - `variant="blur"`: vidro REAL via `expo-blur`. No Android, o blur só acontece
 *   se `blurTarget` (ref de um `BlurTargetView`) for fornecido — caso contrário o
 *   próprio expo-blur cai num painel translúcido. Reservado a poucos pontos de
 *   alto impacto sobre conteúdo rico (ex.: hero sobre a foto).
 *
 * Em ambos os modos a borda de luz e `overflow: 'hidden'` (para o raio recortar o
 * conteúdo) são aplicados aqui, de modo que as telas não repitam esses detalhes.
 *
 * `tintColor` tinge a superfície com a cor adaptativa (vibe do artista); use os
 * valores de `paletteFromVibe` (ex.: `palette.tintedGlass`).
 */

type GlassVariant = 'tonal' | 'blur';

export interface GlassViewProps {
  children?: React.ReactNode;
  /** Modo de renderização. Default: 'tonal'. */
  variant?: GlassVariant;
  /** Intensidade do blur (0-100). Só se aplica a `variant="blur"`. Default: 60. */
  intensity?: number;
  /**
   * Ref de um `BlurTargetView` (de expo-blur) que envolve o conteúdo a desfocar.
   * Necessário para blur real no Android. Só se aplica a `variant="blur"`.
   */
  blurTarget?: RefObject<ComponentRef<typeof View> | null>;
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

/** Camada de "luz" no topo do vidro — faixa clara que dá o brilho de superfície. */
function GlassHighlight() {
  return <View pointerEvents="none" style={styles.highlight} />;
}

export function GlassView({
  children,
  variant = 'tonal',
  intensity = 60,
  blurTarget,
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
      <BlurView
        intensity={intensity}
        tint="dark"
        // Blur real no Android depende do target + método nativo.
        blurTarget={blurTarget}
        blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={[frame, style]}
      >
        {tintColor ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]} />
        ) : null}
        <GlassHighlight />
        {children}
      </BlurView>
    );
  }

  // Vidro tonal (padrão): preenchimento translúcido + faixa de luz no topo.
  return (
    <View style={[frame, { backgroundColor: tintColor ?? Colors.glassStrong }, style]}>
      <GlassHighlight />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
