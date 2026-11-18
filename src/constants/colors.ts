/**
 * Paleta do SoundMatch — Design System V1.
 *
 * Organizada por papéis: neutros em camadas, superfícies de vidro (glass),
 * acento de identidade e cores semânticas. Pares texto/fundo pensados
 * para contraste WCAG AA.
 *
 * A migração do design system está concluída: toda a UI usa os papéis abaixo.
 * Os antigos aliases (bg, bgCard, teal, etc.) foram removidos.
 */
export const Colors = {
  // ---- Neutros em camadas (profundidade: base -> superfície -> elevado) ----
  /** Fundo base do app (mais escuro). */
  base: '#080B14',
  /** Superfície de card padrão. */
  surface: '#121725',
  /** Superfície elevada (tags, menus, estados ativos). */
  elevated: '#1B2234',
  /** Superfície ainda mais alta / hover. */
  elevatedHigh: '#242D42',

  // ---- Glass (superfícies de vidro translúcidas) ----
  /** Preenchimento de vidro padrão (sobre conteúdo escuro). */
  glass: 'rgba(255, 255, 255, 0.06)',
  /** Preenchimento de vidro mais forte (headers, tab bar). */
  glassStrong: 'rgba(255, 255, 255, 0.10)',
  /** Borda de luz sutil que define a superfície de vidro. */
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  /** Tonalidade escura usada por BlurView (tint dark). */
  glassTintDark: 'rgba(8, 11, 20, 0.6)',

  // ---- Acento de identidade ----
  /** Cor de ação / identidade. */
  accent: '#00D4C8',
  /** Variante escura do acento (pressed, gradientes). */
  accentDark: '#039B92',
  /** Acento translúcido para realces suaves (chips selecionados, halos). */
  accentSoft: 'rgba(0, 212, 200, 0.14)',

  // ---- Semânticos (papéis fixos) ----
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  successSoft: 'rgba(52, 211, 153, 0.14)',
  warningSoft: 'rgba(251, 191, 36, 0.14)',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',

  // ---- Texto ----
  /** Texto principal. */
  textPrimary: '#F2F5FF',
  /** Texto de apoio (contraste AA sobre surface/elevated). */
  textSecondary: '#A6B2CF',
  /** Texto desabilitado / placeholder. */
  textMuted: '#5A6885',

  // ---- Bordas ----
  border: '#232C40',
  borderStrong: '#33405C',

  // ---- Overlays (para legibilidade sobre imagens) ----
  overlay: 'rgba(0, 0, 0, 0.55)',
  overlayHeavy: 'rgba(0, 0, 0, 0.8)',
  /** Gradiente de base usado no rodapé de cartões com foto (cor final). */
  scrim: 'rgba(8, 11, 20, 0.92)',

  // ---- Cor auxiliar ----
  /** Azul de identidade secundária (usado como cor do objetivo "Colaboração Pontual"). */
  blue: '#1A2C8E',
};
