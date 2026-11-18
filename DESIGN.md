# SoundMatch — Identidade Visual & Roadmap de Design

Documento dedicado à experiência visual do app: a direção estética, o design system
(atual e alvo), os problemas conhecidos e o roadmap para elevar a qualidade da interface.

> Para visão de produto, arquitetura e roadmap de funcionalidades, veja o
> [README.md](./README.md). Este documento trata **apenas** da camada visual.

---

## 1. Direção estética

Uma interface **moderna, escura e translúcida**, com profundidade por camadas de vidro
(glassmorphism), tipografia limpa com toques expressivos, cantos generosamente
arredondados e movimento fluido. A referência é o cruzamento entre apps de música
premium e interfaces "glass" de sistemas modernos.

Pilares:

- **Glassmorphism com propósito.** Superfícies de vidro (blur + translucidez + borda
  sutil de luz) para barras, modais e cards em destaque — dando profundidade sem peso.
- **Tipografia limpa + destaque.** **Inter** para a interface (neutra e legível),
  combinada com **Clash Display** para nomes de artistas e grandes títulos.
- **Paleta pensada, não acumulada.** Um sistema de cores coerente: neutros profundos,
  o **teal** como acento de identidade e acentos semânticos com papéis claros.
- **Cantos arredondados e consistentes.** Uma escala de raios aplicada em todo o app.
- **Movimento suave e fluido.** Transições, gestos e microinterações com curvas de
  animação naturais — nada abrupto.
- **Estrutura intuitiva.** Hierarquia clara, espaçamento respirável, alinhamento e
  justificação corretos; o conteúdo do artista é o herói.

---

## 2. Glassmorphism — abordagem técnica

Glass em React Native **não é CSS**: o blur real depende de `expo-blur` (`BlurView`),
que roda no Expo Go, mas tem comportamento diferente por plataforma:

- **iOS:** blur nativo direto, com `intensity` e `tint`.
- **Android (SDK 55+):** funciona, mas exige envolver o conteúdo desfocado num
  `BlurTargetView` e passar a ref ao `BlurView` (`blurMethod="dimezisBlurView"`). Mais
  trabalhoso e com custo de performance.

Por isso adotamos **dois níveis de "glass"**, aplicados conforme o contexto:

1. **Glass real (`expo-blur`)** — reservado para poucas superfícies de alto impacto onde
   o blur do fundo importa: **tab bar**, **headers flutuantes**, **modais/paywall**.
2. **Glass "falso" (translúcido)** — superfície semi-transparente (`rgba`) + borda clara
   sutil + sombra, **sem blur**. Barato, consistente entre plataformas, para a maioria
   dos **cards** (perfil, vagas, eventos, mensagens). Visualmente coerente com o glass real.

Diretriz: blur é um recurso caro e pontual; a maior parte da sensação "glass" vem da
translucidez + borda de luz + profundidade de sombra, não do blur em si.

**Implementação (`src/components/GlassView.tsx`).** Os dois níveis vivem num só
componente: `variant="blur"` (real, `expo-blur`, `tint="dark"`, `intensity` configurável
— o piloto usa `75`) e `variant="translucent"` (falso, sem blur). O componente aplica a
borda de luz, `overflow: 'hidden'` (para o raio recortar o conteúdo) e a elevação, de
modo que as telas não repitam esses detalhes. Aceita `tintColor` para receber o
tingimento adaptativo da vibe (ver 3.3).

---

## 3. Design system

### 3.1 Estado atual (`src/constants/` + `src/lib/`)

Os fundamentos (V1), a tipografia (V2), o sistema de glass (V3) e os ícones vetoriais
(V4) estão implementados e **aplicados em todo o app**. A tela-piloto foi o **Perfil**
(`app/(tabs)/profile.tsx`), onde a direção foi validada antes de propagar.

- **Cores (`colors.ts`):** paleta em papéis — neutros em camadas (`base`/`surface`/
  `elevated`/`elevatedHigh`), superfícies de vidro (`glass`/`glassStrong`/`glassBorder`/
  `glassTintDark`), acento (`accent #00D4C8` + `accentDark`/`accentSoft`), semânticos
  (`success`/`warning`/`danger` + variantes `*Soft`), texto (`textPrimary`/
  `textSecondary`/`textMuted`), bordas e overlays. Os aliases legados (`bg`, `bgCard`,
  `teal`, etc.) foram removidos após a migração; resta `blue` como cor auxiliar.
- **Tipografia (`typography.ts` + `src/lib/fonts.ts`):** **Inter** (corpo/UI) via
  `@expo-google-fonts/inter` e **Clash Display** (display) via arquivos locais em
  `assets/fonts/`, carregadas com `useFonts` no layout raiz (funciona no Expo Go). Escala
  por tokens (`display`/`h1`/`h2`/`h3`/`body`/`bodyStrong`/`caption`/`label`/`button`).
- **Espaçamento/raios/elevação (`theme.ts`):** escalas formais `Spacing`
  (4/8/12/16/24/32/48), `Radius` (sm 10 / md 16 / lg 24 / xl 28 / pill 999) e `Elevation`
  (none/sm/md/lg).
- **Glass (`src/components/GlassView.tsx`):** componente único com dois modos — `blur`
  (real, via `expo-blur`) e `translucent` (falso, rgba + borda). Centraliza borda de luz,
  `overflow: 'hidden'`, raio e sombra.
- **Ícones (`src/components/Icon.tsx`):** wrapper do set **Ionicons** de
  `@react-native-vector-icons` (import dinâmico, funciona no Expo Go). Tipo `IconName`
  exportado; tamanho e cor padronizados.
- **Paleta adaptativa (`src/lib/adaptiveColor.ts`):** deriva uma paleta da "cor de vibe"
  do artista (`vibeColor`) — fundo/glass/borda tingidos e cor de texto legível por
  contraste. Ver seção 3.3.

### 3.2 Alvo

**Cores** — uma paleta reorganizada em papéis claros:
- **Neutros:** uma rampa de fundo em camadas (base → superfície → elevado) com passos de
  contraste sutis e intencionais.
- **Glass:** tokens de superfície translúcida (ex: `glass`, `glassBorder`) para o padrão
  de vidro.
- **Acento principal:** o **teal (`#00D4C8`)** é mantido como cor de ação/identidade,
  usado com parcimônia (ações, seleção, destaque — não como decoração).
- **Semânticos:** sucesso / atenção / erro, com papéis fixos (não reaproveitados como
  decoração).
- Todos os pares texto/fundo validados para **contraste WCAG AA**.

**Tipografia** — pares de fonte via `expo-font`:
- **Interface/corpo:** **Inter** — limpa e altamente legível.
- **Display/destaque:** **Clash Display** (grotesca geométrica, expressiva) para nomes de
  artistas e grandes títulos.
- Escala tipográfica única, aplicada por tokens em todas as telas.

**Espaçamento** — escala fixa (ex: `4 / 8 / 12 / 16 / 24 / 32 / 48`).

**Raios** — escala fixa (ex: `sm 10 / md 16 / lg 24 / pill 999`), com cantos arredondados
generosos como assinatura visual.

**Elevação** — níveis de sombra/translucidez padronizados para a hierarquia de camadas.

### 3.3 Paleta adaptativa (a tela segue a cor do artista)

A interface se adapta à identidade cromática do artista em foco: o Perfil tinge o hero e
os realces, e o feed de swipe muda o fundo conforme o card atual, sempre preservando
contraste e legibilidade.

- **Fonte da cor — `vibeColor`, não extração da foto.** Extrair a cor dominante real de
  uma imagem exige um módulo nativo (ex.: `react-native-image-colors`), que **não roda no
  Expo Go** (pede development build). Como cada artista já tem um `vibeColor` que
  representa sua identidade, usamos essa cor como fonte — determinística e com contraste
  controlado. Extração real fica como evolução futura (quando houver dev build).
- **Derivação (`src/lib/adaptiveColor.ts`).** `paletteFromVibe()` produz `tintedBg`,
  `tintedGlass`, `tintedBorder`, `halo` (a vibe em baixa opacidade sobre o fundo escuro) e
  `onBase` (preto/branco por luminância WCAG, para texto legível sobre a cor pura).
- **Intensidade do tingimento:** sutil por design — ~12% no Perfil, ~16% no fundo do
  swipe. O suficiente para "sentir" a cor sem comprometer a leitura.
- **Transição no swipe:** o fundo faz fade-in via `Animated` + `key={vibe}` a cada card
  (sem guardar estado de cor no render, respeitando as regras estritas do
  eslint-config-expo).

---

## 4. Problemas conhecidos

Levantados na auditoria (V0). A maioria foi resolvida na propagação do design system;
o que resta está marcado como **pendente**.

### Contraste e legibilidade
- ✅ Cartões de swipe (`app/(tabs)/index.tsx`): o overlay transparente virou um scrim em
  camadas, garantindo contraste do texto/badges sobre qualquer foto.
- ✅ Texto de apoio: `textSecondary` foi reajustado (`#A6B2CF`) para contraste AA.

### Sobreposição e posicionamento
- ✅ Hero do perfil do artista (`app/profile/[id].tsx`): reestruturado numa coluna única
  (avatar com halo, nome em Clash Display), sem posicionamento absoluto concorrente.
- ✅ **Emojis como ícones**: substituídos por ícones vetoriais (`@react-native-vector-icons`,
  set Ionicons) em todo o app — navegação, ações, badges, marcadores do mapa.

### Consistência
- ✅ Escala `Typography` aplicada em todas as telas; fontes inline eliminadas.
- ✅ Tokens de cor/espaçamento/raio usados em todo o app; aliases legados removidos.

### Movimento (pendente — Fase V6)
- Fora o swipe (`Animated`) e o fade do fundo adaptativo, ainda não há transições de tela
  nem feedback de toque animado.

---

## 5. Roadmap de refinamento visual

Fases incrementais, dos fundamentos ao polimento. Cada fase é revisável de forma
independente; mudanças partem sempre dos **tokens** (`src/constants/`) para propagar com
consistência.

> **Ordem de execução adotada:** V1 (fundamentos) → V3 (sistema glass) → V2 (tipografia)
> → V4 (ícones) → propagação para o resto do app → V5+ (layout, movimento, polimento).
> V3 veio antes de V2 para que o componente de glass já existisse quando a propagação
> começasse. A validação ocorreu na tela-piloto (Perfil) antes de espalhar.
>
> **Propagação concluída ✅** — V1–V4 foram aplicadas a todo o app: as 4 abas (Discover,
> Map, Chat, Perfil), o perfil público, os modais (filtros, upgrade, post-opening,
> post-event, estúdios), as telas de entrada (auth, onboarding), o bloco de edição de
> perfil, a tela de avaliar e toda a camada de componentes compartilhados. Os aliases
> legados de cor foram removidos de `colors.ts`.

### Fase V0 — Auditoria
- [x] Mapear telas e catalogar contraste, sobreposição, espaçamento e alinhamento (ver seção 4)
- [ ] Rodar em Android e iOS, anotar divergências (especialmente emojis e futuro blur)
- [ ] Capturar o "antes" de cada tela

### Fase V1 — Fundamentos do design system ✅
- [x] Nova **paleta** com papéis claros (neutros em camadas, glass, acento, semânticos) — `colors.ts`
- [x] Escala de **espaçamento** (`Spacing` em `theme.ts`)
- [x] Escala de **raios** (`Radius` em `theme.ts`)
- [x] Níveis de **elevação** (`Elevation` em `theme.ts`)
- [x] Aplicados em todo o app; aliases legados removidos
- [x] **Paleta adaptativa** por vibe do artista (`adaptiveColor.ts`) — hero do Perfil/perfil público e fundo do swipe

### Fase V2 — Tipografia ✅
- [x] Carregar **Inter** (corpo/interface) via `@expo-google-fonts/inter` + `useFonts`
- [x] **Fonte display escolhida: Clash Display** (Fontshare / ITF Free Font License), arquivos locais em `assets/fonts/` (pesos Medium/Semibold/Bold)
- [x] Carregamento com `SplashScreen` no layout raiz (segura a UI até as fontes prontas) — funciona no Expo Go
- [x] Escala tipográfica consolidada em tokens (`typography.ts`) com `line-height`/`letter-spacing`; display = Clash, resto = Inter
- [x] Escala aplicada em **todas as telas**

### Fase V3 — Sistema glass ✅
- [x] `expo-blur` instalado e validado no Expo Go (iOS direto; Android funciona com `tint="dark"`)
- [x] Componente **`GlassView`** reutilizável (`variant="blur"` real / `variant="translucent"` fallback)
- [x] Glass real aplicado nos pontos de alto impacto (hero do Perfil/perfil público, badge de match no swipe, fechar do paywall)
- [ ] Glass real na **tab bar** (hoje superfície sólida — opcional; exige `BlurTargetView` no Android)

### Fase V4 — Ícones ✅
- [x] Emojis substituídos por ícones vetoriais — escolhido **`@react-native-vector-icons`** (set Ionicons) no lugar de `@expo/vector-icons`, que está sendo descontinuado e tem pior suporte a Expo Go
- [x] Wrapper **`Icon`** (`src/components/Icon.tsx`) padroniza set, tamanho e cor
- [x] Tamanho/peso/alinhamento padronizados na navegação e ações
- [x] Carregamento dinâmico do set (registra no 1º render; sem passo nativo no Expo Go)

### Fase V5 — Correção de layout e estrutura
- [x] Corrigir sobreposições: hero do perfil público reestruturado; overlays dos cartões de swipe com scrim
- [x] Escalas de espaçamento/raios aplicadas em todas as telas
- [ ] Revisão fina de `SafeArea`, alinhamento e justificação em telas densas
- [ ] Reestruturar telas densas remanescentes para mais respiro e hierarquia

### Fase V6 — Movimento e microinterações ✅ (essencial)
- [x] **Feedback de toque** em botões e cards — `PressableScale` (scale + opacity com mola,
  `Animated` nativo). Aplicado nos botões de ação, CTAs primários e cards tocáveis.
- [x] **Skeletons** de carregamento — `Skeleton`/`SkeletonCard`/`SkeletonList` (pulso de
  opacidade) no lugar dos spinners nos feeds de Vagas/Eventos.
- [~] Suavizar o gesto de swipe — já usa `Animated`+`PanResponder`; ajuste fino adiado
  (baixo retorno, risco de regressão).
- [~] Transições de tela — o expo-router já aplica as nativas; customização profunda
  renderia pouco sem `react-native-reanimated` (incompatível com Expo Go). Adiado.

> Sem `react-native-reanimated` (ver §6), o movimento usa `Animated` nativo com
> `useNativeDriver`. Isso cobre bem feedback de toque, pulsos e fades; animações
> baseadas em gesto/layout mais complexas ficam fora de escopo até haver dev build.

### Fase V7 — Polimento final
- [ ] Revisão tela a tela comparando com o "antes" da V0
- [ ] Acessibilidade (tamanhos de toque, labels, alto contraste opcional)
- [ ] Ícone do app e splash alinhados à identidade glass

---

## 6. Dependências visuais previstas

| Pacote | Uso | Status |
|--------|-----|--------|
| `expo-blur` | Glassmorphism (blur real) | ✅ Instalado; usado no `GlassView` (Expo Go) |
| `expo-font` | Carregar fontes customizadas | ✅ Instalado |
| `expo-splash-screen` | Segurar a UI até as fontes carregarem | ✅ Instalado |
| `@expo-google-fonts/inter` | Fonte de corpo/UI (Inter) | ✅ Instalado |
| Clash Display (Fontshare / ITF Free Font) | Fonte display (títulos, nomes) | ✅ Arquivos locais em `assets/fonts/` |
| `@react-native-vector-icons/ionicons` | Ícones vetoriais (set Ionicons) | ✅ Instalado; usado no `Icon` (Expo Go via import dinâmico) |
| `react-native-image-colors` *(futuro)* | Extração de cor real da foto | Exige development build; hoje usamos `vibeColor` |
| `react-native-reanimated` *(a avaliar)* | Animações fluidas | Removido antes por incompatibilidade com Expo Go; reavaliar só se o `Animated` nativo não bastar |

---

## 7. Como vamos trabalhar

- Cada fase é implementada e revisada por você antes de seguir, como no roadmap de produto.
- Mudanças partem dos **tokens** em `src/constants/`, nunca de ajustes pontuais soltos.
- Priorizamos fundamentos (cor, tipografia, espaçamento) antes de efeitos (glass, movimento),
  para que o polimento assente sobre uma base consistente.
- Ao final de cada fase, este documento é atualizado marcando o progresso.
