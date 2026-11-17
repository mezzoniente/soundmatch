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
- **Tipografia limpa + destaque.** Uma sans neutra e legível (Inter / SF) para a
  interface, combinada com uma fonte de **display** (a definir) para nomes e títulos.
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

---

## 3. Design system

### 3.1 Estado atual (`src/constants/`)

- **Cores:** paleta escura funcional (`bg #0A0E1A`, `bgCard #111827`, acento `teal
  #00D4C8`, + blue/gold/red/green). Alguns tokens definidos e não usados
  (`tealDark`, `blueLight`, `borderLight`).
- **Tipografia:** escala definida (`hero`/`h1`/`h2`/`h3`/`body`/`caption`/`label`), mas
  **quase nenhuma tela a usa** — fontes definidas inline, com divergências. Só fontes de
  sistema; nenhuma fonte customizada carregada.
- **Espaçamento/raios:** sem escala formal; valores ad-hoc por tela.

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
- **Interface/corpo:** Inter (ou SF no iOS) — limpa e altamente legível.
- **Display/destaque:** uma fonte expressiva para nomes de artistas e grandes títulos —
  **a definir na Fase V2** (avaliar opções serifada/condensada/geométrica).
- Escala tipográfica única, aplicada por tokens em todas as telas.

**Espaçamento** — escala fixa (ex: `4 / 8 / 12 / 16 / 24 / 32 / 48`).

**Raios** — escala fixa (ex: `sm 10 / md 16 / lg 24 / pill 999`), com cantos arredondados
generosos como assinatura visual.

**Elevação** — níveis de sombra/translucidez padronizados para a hierarquia de camadas.

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

### Fase V0 — Auditoria
- [ ] Mapear telas e catalogar contraste, sobreposição, espaçamento e alinhamento
- [ ] Rodar em Android e iOS, anotar divergências (especialmente emojis e futuro blur)
- [ ] Capturar o "antes" de cada tela

### Fase V1 — Fundamentos do design system
- [ ] Nova **paleta** com papéis claros (neutros em camadas, glass, acento, semânticos), validada em contraste AA
- [ ] Escala de **espaçamento** em `src/constants/`
- [ ] Escala de **raios** (cantos arredondados como assinatura)
- [ ] Níveis de **elevação** (sombra/translucidez) padronizados
- [ ] Remover/realocar tokens de cor não usados

### Fase V2 — Tipografia
- [ ] Carregar **Inter** (corpo/interface) via `expo-font`
- [ ] Escolher e carregar uma **fonte display** para nomes e títulos (decisão aberta, avaliada nesta fase)
- [ ] Consolidar a escala tipográfica em tokens e **aplicá-la em todas as telas**
- [ ] Ajustar `line-height` e `letter-spacing`

### Fase V3 — Sistema glass
- [ ] Instalar e configurar `expo-blur` (com suporte Android via `BlurTargetView`)
- [ ] Componente **`GlassSurface`** reutilizável (glass real onde vale; fallback translúcido no resto)
- [ ] Aplicar glass real na **tab bar**, **headers** e **modais/paywall**
- [ ] Migrar os cards para o padrão de superfície translúcida consistente

### Fase V4 — Ícones
- [ ] Substituir emojis por ícones vetoriais (`@expo/vector-icons`)
- [ ] Padronizar tamanho, peso e alinhamento na navegação e ações

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

| Pacote | Uso | Observação |
|--------|-----|------------|
| `expo-blur` | Glassmorphism (blur real) | Expo Go; Android requer `BlurTargetView` |
| `expo-font` | Carregar Inter + fonte display | Já disponível no projeto |
| `@expo/vector-icons` | Ícones vetoriais (substituir emojis) | Vem com o Expo |
| `react-native-reanimated` *(a avaliar)* | Animações fluidas | Foi removido antes por incompatibilidade com Expo Go; reavaliar só se o `Animated` nativo não bastar |

---

## 7. Como vamos trabalhar

- Cada fase é implementada e revisada por você antes de seguir, como no roadmap de produto.
- Mudanças partem dos **tokens** em `src/constants/`, nunca de ajustes pontuais soltos.
- Priorizamos fundamentos (cor, tipografia, espaçamento) antes de efeitos (glass, movimento),
  para que o polimento assente sobre uma base consistente.
- Ao final de cada fase, este documento é atualizado marcando o progresso.
