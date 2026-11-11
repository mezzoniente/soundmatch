# SoundMatch 🎸

> Plataforma de matchmaking musical que conecta músicos, bandas e contratantes por meio de um sistema de recomendação multicritério.

---

## Sobre o projeto

A formação de bandas e parcerias musicais ainda depende, em grande parte, de redes informais de contato, grupos em redes sociais e indicações pessoais. Esse processo é ineficiente e gera frustrações recorrentes por incompatibilidade de nível técnico, gênero musical, localização, disponibilidade de agenda e comprometimento.

O **SoundMatch** propõe uma solução: uma plataforma de matchmaking musical que combina complementaridade de instrumentos, proximidade geográfica, afinidade de gêneros e influências, compatibilidade de nível e histórico de colaborações para conectar músicos independentes de forma relevante e explicável.

### Diferenciais

- Compatibilidade multicritério pensada para o contexto musical (não apenas busca genérica ou popularidade)
- Objetivos de colaboração explícitos: **Banda Fixa**, **Colaboração Pontual**, **Jam Session**, **Trabalho Remunerado** e **Substituição Temporária**
- Recomendações com explicação do match (por que esse artista foi sugerido)
- Mapa de calor para descoberta de artistas, vagas e eventos por proximidade geográfica

---

## Telas do MVP

| Tela | Descrição |
|------|-----------|
| **Discover (Swipe)** | Feed de artistas recomendados com swipe horizontal para aceitar/recusar e navegação vertical entre perfis |
| **Profile / Personal Traits** | Perfil do artista com informações bite-sized (instrumento, nível, gênero) e elementos de vibe (cor favorita, álbum, influências) |
| **HeatMap** | Mapa escuro interativo com artistas, vagas e eventos agrupados por proximidade, com efeito de calor por popularidade |
| **Chat** | Lista de conversas dividida entre **Jams** (salas colaborativas multi-artista) e **DMs** (mensagens diretas) |

---

## Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| [React Native](https://reactnative.dev/) | 0.88 | Framework mobile cross-platform |
| [Expo](https://expo.dev/) | ~58 | Toolchain e runtime |
| [Expo Router](https://expo.github.io/router/) | ^58 | Navegação baseada em arquivos (file-based routing) |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 | Tipagem estática |
| [React Native Maps](https://github.com/react-native-maps/react-native-maps) | ^1.29 | Mapa interativo com heatmap |
| [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context) | ^5.11 | Margens seguras em diferentes dispositivos |
| [React Native Screens](https://github.com/software-mansion/react-native-screens) | ^4.30 | Otimização de navegação nativa |

> O swipe de cartões é implementado com `Animated` + `PanResponder` nativos do React Native, sem dependências externas de animação.

---

## Estrutura de pastas

```
soundmatch/
│
├── app/                          # Rotas da aplicação (expo-router)
│   ├── _layout.tsx               # Layout raiz: Stack Navigator
│   │
│   ├── (tabs)/                   # Grupo de rotas com tab bar
│   │   ├── _layout.tsx           # Configuração da bottom tab bar
│   │   ├── index.tsx             # Tela Discover (swipe de artistas)
│   │   ├── map.tsx               # Tela HeatMap (mapa de descoberta)
│   │   ├── chat.tsx              # Tela Chat (Jams + DMs)
│   │   └── profile.tsx           # Tela Meu Perfil
│   │
│   └── profile/
│       └── [id].tsx              # Modal de perfil de artista (detalhe)
│
├── src/
│   ├── constants/
│   │   ├── colors.ts             # Paleta de cores do design system
│   │   └── typography.ts         # Estilos tipográficos reutilizáveis
│   │
│   └── data/
│       └── mockData.ts           # Dados fictícios: artistas, jams, DMs, marcadores do mapa
│
├── assets/                       # Ícones e imagens estáticas
├── babel.config.js               # Configuração Babel (babel-preset-expo)
├── index.ts                      # Entry point (expo-router/entry)
├── app.json                      # Configuração do Expo (scheme, plugins, tema)
├── tsconfig.json                 # Configuração do TypeScript
└── package.json                  # Dependências e scripts
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) v9 ou superior (ou yarn/pnpm equivalentes)
- [Expo Go](https://expo.dev/go) instalado no celular (iOS ou Android) **ou** um emulador configurado

> Para rodar no emulador Android é necessário o Android Studio com um AVD configurado.
> Para iOS em simulador é necessário macOS com Xcode.

---

## Como rodar

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd soundmatch
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o backend (Supabase)

O app usa o Supabase para autenticação, banco de dados e storage de mídia.

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode os scripts desta ordem:
   - `supabase/schema.sql` — tabela `profiles`, Row Level Security e triggers.
   - `supabase/storage.sql` — buckets de mídia (`avatars`, `media-samples`) e policies.
   - `supabase/openings.sql` — tabela `openings` (vagas abertas) e policies.
3. Em **Authentication → Sign In / Providers → Email**, desative **Confirm email** para testar em desenvolvimento.
4. Crie um arquivo **`.env.local`** na raiz com as credenciais do projeto (encontradas em **Project Settings → API**):

```
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

> As duas chaves são públicas e seguras para o app cliente. O que protege os dados é a Row Level Security. Nunca coloque a chave `service_role` no app.

### 4. Inicie o servidor de desenvolvimento

```bash
npx expo start --clear
```

O terminal exibirá um QR code. Escaneie com o **Expo Go** no celular para abrir o app instantaneamente.

> Use sempre `--clear` para evitar problemas de cache do Metro bundler.

### Atalhos no terminal do Expo

| Tecla | Ação |
|-------|------|
| `a` | Abrir no emulador Android |
| `i` | Abrir no simulador iOS (requer macOS) |
| `w` | Abrir no navegador (web) |
| `r` | Recarregar o app |

---

## Dados fictícios (MVP)

O MVP utiliza dados simulados definidos em `src/data/mockData.ts`, sem necessidade de backend. Estão incluídos:

- **5 artistas** com perfis completos (instrumentos, gênero, nível, vibe, influências, localização)
- **3 Jams** (salas colaborativas com múltiplos participantes)
- **3 DMs** (conversas diretas)
- **8 marcadores** no mapa (artistas, eventos, vagas) na região de São Paulo

---

## Design system

As cores e tipografia estão centralizadas em `src/constants/` para facilitar a evolução do design:

```
Fundo principal:   #0A0E1A
Cards:             #111827
Teal (destaque):   #00D4C8
Azul (brand):      #1A2C8E
Dourado:           #F0B429
```

O tema é inteiramente escuro, com identidade visual inspirada em painéis de estúdio e interfaces de música.

---

## Roadmap de desenvolvimento

O roadmap está organizado em três fases. Cada fase pressupõe a anterior como estável.

---

### Fase 1 — Perfil rico e onboarding

Objetivo: transformar o perfil de músico em uma representação confiável e diferenciada do artista.

**Perfil expandido**
- [x] Tela de criação/edição de perfil guiada (onboarding step-by-step)
- [x] Upload de amostras de áudio — trechos tocando para validar nível real além do autodeclarado
- [x] Upload de clipes de vídeo curtos (estilo reel) como vitrine artística
- [x] Campo de disponibilidade semanal — dias e horários fixos, formato calendário
- [x] Campo de equipamento — estúdio próprio, equipamento portátil ou só instrumento
- [x] Campo de experiência de banda — tocou ao vivo, gravou, tempo de banda anterior
- [x] Soft skills declaradas — pontualidade, compromisso, abertura a novos estilos

**Objetivo de colaboração**
- [x] Seleção explícita do objetivo ao criar o perfil, com descrição de cada modalidade:
  - Banda fixa (longo prazo)
  - Colaboração pontual (uma música, um cover, um projeto)
  - Jam session casual
  - Session / gravação remunerada
  - Substituição temporária (dependência de show)
- [x] Possibilidade de marcar múltiplos objetivos simultaneamente

**Infraestrutura**
- [x] Autenticação por e-mail e senha (Supabase Auth, sessão persistente)
- [ ] Autenticação via login social (Google / Apple)
- [x] Backend inicial com Supabase (Postgres) para persistência de perfis, com Row Level Security
- [x] Storage de mídia (áudio, vídeo, foto de perfil e banner) com URLs públicas (CDN do Supabase)

---

### Fase 2 — Algoritmo de recomendação e busca avançada

Objetivo: fazer o motor de match trabalhar com critérios musicais reais.

**Motor de recomendação multicritério**
- [x] Complementaridade de instrumento — banda que precisa de baixista não recebe mais baixistas
- [x] Proximidade geográfica com raio ajustável pelo usuário
- [x] Sobreposição de gêneros e influências declaradas
- [x] Compatibilidade de nível — evitar frustração entre iniciante e avançado sem ser restritivo
- [x] Overlap de disponibilidade semanal entre os dois perfis
- [ ] Histórico de avaliações de colaborações anteriores como fator de confiança (depende da Fase 3)
- [x] Explicação do match visível no cartão — "por que esse artista apareceu para você"

**Busca por vaga vs busca por pessoa**
- [x] Bandas podem postar vagas abertas ("procuramos baterista para projeto de indie rock")
- [x] Músicos solo postam disponibilidade e são encontrados pelas vagas
- [x] Filtros de busca: instrumento, nível, gênero, localização, objetivo, disponibilidade

**Resolução do cold start**
- [ ] Perfil mínimo viável para entrar no feed de recomendações
- [ ] Boost inicial para novos perfis aparecerem nas primeiras sessões de outros usuários
- [ ] Sugestão de completar o perfil com gamificação (barra de progresso, pontos)

---

### Fase 3 — Confiança, comunidade e monetização

Objetivo: transformar o primeiro match em uma colaboração real e sustentável.

**Sistema de confiança**
- [ ] Avaliação pós-colaboração (modelo Uber / Airbnb) — nota e comentário após cada parceria
- [ ] Badge de "perfil verificado" para quem subiu amostra de áudio ou vídeo
- [ ] Histórico público de colaborações concluídas no perfil

**Chat aprimorado**
- [ ] Tela interna de conversa com mensagens em tempo real
- [ ] Preview de áudio embutido no chat — trocar referências musicais direto na conversa
- [ ] Compartilhamento de links do Spotify / YouTube / SoundCloud inline
- [ ] Notificações push para novos matches e mensagens

**Match para oportunidades e eventos**
- [ ] Contratantes postam demandas: "preciso de banda cover para casamento no dia X"
- [ ] Match de músicos com eventos por disponibilidade, estilo e localização
- [ ] Espaços e estúdios parceiros sugeridos próximos ao match geográfico

**Monetização**
- [ ] Plano gratuito com limite de swipes diários
- [ ] Plano pago com recomendações ilimitadas, destaque no feed e acesso a vagas pagas
- [ ] Comissão sobre sessões remuneradas mediadas pela plataforma

---

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais informações.
