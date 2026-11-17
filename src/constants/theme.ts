import { Colors } from './colors';

/**
 * Escala de espaçamento (px). Use estes passos para padding, margin e gap.
 * Mantém ritmo visual consistente entre telas.
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Escala de raios de borda. Cantos arredondados generosos são assinatura
 * visual do app. `pill` para elementos totalmente arredondados.
 */
export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

/**
 * Níveis de elevação (sombra). Padronizam a hierarquia de profundidade.
 * No Android, `elevation` aproxima o efeito das sombras do iOS.
 */
export const Elevation = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

/**
 * Preset da superfície de vidro "falsa" (sem blur): translucidez + borda de luz.
 * Base do glassmorphism barato aplicado na maioria dos cards.
 */
export const GlassSurface = {
  backgroundColor: Colors.glass,
  borderWidth: 1,
  borderColor: Colors.glassBorder,
  borderRadius: Radius.lg,
} as const;
