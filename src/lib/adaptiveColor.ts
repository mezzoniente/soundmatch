/**
 * Paleta adaptativa derivada da "cor de vibe" do artista (`vibeColor`).
 *
 * No Expo Go não há como extrair a cor dominante real de uma imagem sem um
 * módulo nativo (ex: react-native-image-colors exige development build). Como
 * cada artista já possui um `vibeColor` que representa sua identidade, usamos
 * essa cor como fonte da paleta adaptativa — determinística e com contraste
 * controlado.
 */

export interface AdaptivePalette {
  /** Cor base (a vibe do artista). */
  base: string;
  /** Fundo escuro tingido com a vibe (para a tela). */
  tintedBg: string;
  /** Superfície de vidro tingida. */
  tintedGlass: string;
  /** Borda de luz tingida. */
  tintedBorder: string;
  /** Cor de texto legível sobre a cor base (preto ou branco por contraste). */
  onBase: string;
  /** Halo/realce translúcido da vibe. */
  halo: string;
}

/** Converte hex (#rrggbb) em {r,g,b}. Aceita também #rgb. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  const int = parseInt(h, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

/** Luminância relativa (WCAG) de uma cor, 0 (escuro) a 1 (claro). */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Cor de texto (preto/branco) com melhor contraste sobre o fundo informado.
 * Garante legibilidade independentemente da vibe escolhida.
 */
export function readableTextOn(hex: string): string {
  return luminance(hex) > 0.5 ? '#0A0E17' : '#FFFFFF';
}

/** Monta uma cor rgba a partir de hex + alpha. */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Deriva a paleta adaptativa de uma vibe. Os tons tingidos são a vibe com
 * baixa opacidade sobre o fundo escuro, mantendo a tela legível.
 */
export function paletteFromVibe(vibeColor: string): AdaptivePalette {
  return {
    base: vibeColor,
    tintedBg: withAlpha(vibeColor, 0.12),
    tintedGlass: withAlpha(vibeColor, 0.14),
    tintedBorder: withAlpha(vibeColor, 0.35),
    onBase: readableTextOn(vibeColor),
    halo: withAlpha(vibeColor, 0.22),
  };
}
