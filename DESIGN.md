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

Os fundamentos (V1), a tipografia (V2) e o sistema de glass (V3) já estão implementados.
A tela-piloto é o **Perfil** (`app/(tabs)/profile.tsx`), onde a direção foi validada
antes de propagar para o resto do app.

- **Cores (`colors.ts`):** paleta em papéis — neutros em camadas (`base`/`surface`/
  `elevated`/`elevatedHigh`), superfícies de vidro (`glass`/`glassStrong`/`glassBorder`/
  `glassTintDark`), acento (`accent #00D4C8` + `accentDark`/`accentSoft`), semânticos
  (`success`/`warning`/`danger` + variantes `*Soft`), texto (`textPrimary`/
  `textSecondary`/`textMuted`), bordas e overlays. Os nomes antigos (`bg`, `bgCard`,
  `teal`, etc.) permanecem como **aliases** para as telas ainda não migradas.
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

Levantados na auditoria do código atual; a confirmar/expandir na Fase V0.

### Contraste e legibilidade
- Cartões de swipe (`app/(tabs)/index.tsx`): `cardOverlay` é transparente — texto/badges
  claros sobre a foto sem escurecimento, baixo contraste em imagens claras.
- `textSecondary` (`#8899BB`) sobre `bgCard` pode ficar abaixo do WCAG AA em texto pequeno.

### Sobreposição e posicionamento
- Hero do perfil do artista (`app/profile/[id].tsx`): nome grande, foto em card e linha de
  conexões disputam a mesma região com posicionamento misto — risco de sobreposição em
  telas menores.
- **Emojis como ícones** em navegação e ações (⚡ 🗺 💬 👤, ⚙, ➤, ✓): renderização,
  tamanho e alinhamento inconsistentes entre Android/iOS.

### Consistência
- Escala `Typography` praticamente não usada; fontes inline divergentes.
- Tokens de cor não usados; espaçamentos e raios ad-hoc.

### Movimento
- Fora o swipe (`Animated`), não há transições de tela nem feedback de toque animado.

---

## 5. Roadmap de refinamento visual

Fases incrementais, dos fundamentos ao polimento. Cada fase é revisável de forma
independente; mudanças partem sempre dos **tokens** (`src/constants/`) para propagar com
consistência.

> **Ordem de execução adotada:** V1 (fundamentos) → V3 (sistema glass) → V2 (tipografia)
> → V4 (ícones) → propagação para o resto do app → V5+ (layout, movimento, polimento).
> V3 veio antes de V2 para que o componente de glass já existisse quando a propagação
> começasse. A validação ocorre na tela-piloto (Perfil) antes de espalhar.

### Fase V0 — Auditoria
- [x] Mapear telas e catalogar contraste, sobreposição, espaçamento e alinhamento (ver seção 4)
- [ ] Rodar em Android e iOS, anotar divergências (especialmente emojis e futuro blur)
- [ ] Capturar o "antes" de cada tela

### Fase V1 — Fundamentos do design system ✅
- [x] Nova **paleta** com papéis claros (neutros em camadas, glass, acento, semânticos) — `colors.ts`, com aliases legados
- [x] Escala de **espaçamento** (`Spacing` em `theme.ts`)
- [x] Escala de **raios** (`Radius` em `theme.ts`)
- [x] Níveis de **elevação** (`Elevation` em `theme.ts`)
- [x] Aplicados na tela-piloto (Perfil); tokens antigos mantidos como aliases até a propagação
- [x] **Paleta adaptativa** por vibe do artista (`adaptiveColor.ts`) — hero do Perfil e fundo do swipe

### Fase V2 — Tipografia ✅
- [x] Carregar **Inter** (corpo/interface) via `@expo-google-fonts/inter` + `useFonts`
- [x] **Fonte display escolhida: Clash Display** (Fontshare / ITF Free Font License), arquivos locais em `assets/fonts/` (pesos Medium/Semibold/Bold)
- [x] Carregamento com `SplashScreen` no layout raiz (segura a UI até as fontes prontas) — funciona no Expo Go
- [x] Escala tipográfica consolidada em tokens (`typography.ts`) com `line-height`/`letter-spacing`; display = Clash, resto = Inter
- [ ] Aplicar a escala em **todas as telas** (parte da propagação pós-V4)

### Fase V3 — Sistema glass ✅
- [x] `expo-blur` instalado e validado no Expo Go (iOS direto; Android funciona com `tint="dark"`)
- [x] Componente **`GlassView`** reutilizável (`variant="blur"` real / `variant="translucent"` fallback)
- [x] Aplicado na tela-piloto (controles e badges do hero do Perfil)
- [ ] Aplicar glass real na **tab bar**, **headers** e **modais/paywall** (parte da propagação)
- [ ] Migrar os cards para o padrão translúcido consistente (parte da propagação)

### Fase V4 — Ícones
- [ ] Substituir emojis por ícones vetoriais (`@expo/vector-icons`)
- [ ] Padronizar tamanho, peso e alinhamento na navegação e ações
- [ ] Pré-carregar a fonte de ícones no layout raiz (evitar "ícone invisível" no primeiro load)

### Fase V5 — Correção de layout e estrutura
- [ ] Corrigir sobreposições (hero do perfil, overlays dos cartões de swipe)
- [ ] Aplicar as escalas de espaçamento/raios em todas as telas
- [ ] Revisar `SafeArea`, alinhamento e justificação de textos e grupos de botões
- [ ] Reestruturar telas densas para respiro e hierarquia intuitiva

### Fase V6 — Movimento e microinterações
- [ ] Suavizar o gesto de swipe (curvas, resistência, feedback visual)
- [ ] Transições fluidas de entrada/saída entre telas e modais
- [ ] Feedback de toque em botões e cards (scale/opacity com spring)
- [ ] Animar estados vazios e carregamento (skeletons)

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
| `@expo/vector-icons` | Ícones vetoriais (substituir emojis) | Vem com o Expo — usar na V4 |
| `react-native-image-colors` *(futuro)* | Extração de cor real da foto | Exige development build; hoje usamos `vibeColor` |
| `react-native-reanimated` *(a avaliar)* | Animações fluidas | Removido antes por incompatibilidade com Expo Go; reavaliar só se o `Animated` nativo não bastar |

---

## 7. Como vamos trabalhar

- Cada fase é implementada e revisada por você antes de seguir, como no roadmap de produto.
- Mudanças partem dos **tokens** em `src/constants/`, nunca de ajustes pontuais soltos.
- Priorizamos fundamentos (cor, tipografia, espaçamento) antes de efeitos (glass, movimento),
  para que o polimento assente sobre uma base consistente.
- Ao final de cada fase, este documento é atualizado marcando o progresso.
