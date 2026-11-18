import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { Spacing, Radius, Elevation } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { Icon, IconName } from '../../src/components/Icon';
import { GlassView } from '../../src/components/GlassView';
import { PressableScale } from '../../src/components/PressableScale';
import { SkeletonList } from '../../src/components/Skeleton';
import {
  MOCK_ARTISTS,
  MOCK_OPENINGS,
  MOCK_EVENTS,
  Artist,
  Opening,
  MusicEvent,
} from '../../src/data/mockData';
import { useProfile } from '../../src/state/ProfileContext';
import { useFilters } from '../../src/state/FilterContext';
import { useUsage } from '../../src/state/UsageContext';
import { canSwipe, FREE_DAILY_SWIPES } from '../../src/lib/monetization';
import { withAlpha } from '../../src/lib/adaptiveColor';
import {
  rankCandidates,
  applyFilters,
  activeFilterCount,
  rankOpenings,
  rankEvents,
} from '../../src/lib/matchEngine';
import { fetchOpenings } from '../../src/lib/openingsRepository';
import { fetchEvents } from '../../src/lib/eventsRepository';
import { OpeningCard } from '../../src/components/OpeningCard';
import { EventCard } from '../../src/components/EventCard';
import { evaluateCompleteness } from '../../src/lib/profileCompleteness';

const { width: W, height: H } = Dimensions.get('window');
const SWIPE_THRESHOLD = W * 0.35;

const GOAL_COLORS: Record<string, string> = {
  'Banda Fixa': Colors.accent,
  'Colaboração Pontual': Colors.blue,
  'Jam Session': Colors.warning,
  'Trabalho Remunerado': Colors.success,
  'Substituição Temporária': '#E67E22',
};

function MatchReasonPill({ reason }: { reason: string }) {
  return (
    <View style={styles.pill}>
      <Icon name="checkmark" size={12} color={Colors.success} />
      <Text style={styles.pillText}>{reason}</Text>
    </View>
  );
}

function ArtistCard({
  artist,
  onPress,
}: {
  artist: Artist;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95} style={styles.card}>
      {/* Cover hero */}
      <Image source={{ uri: artist.coverImage }} style={styles.cardCover} resizeMode="cover" />
      {/* Scrim em camadas: garante contraste do texto claro sobre fotos claras */}
      <View style={styles.cardScrimTop} />
      <View style={styles.cardScrimBottom} />

      {/* Top bar */}
      <View style={styles.cardTop}>
        <View style={[styles.goalBadge, { backgroundColor: GOAL_COLORS[artist.goals[0]] ?? Colors.accent }]}>
          <Text style={styles.goalText}>
            {artist.goals[0]}
            {artist.goals.length > 1 ? ` +${artist.goals.length - 1}` : ''}
          </Text>
        </View>
        {artist.matchScore !== undefined && (
          <GlassView intensity={60} radius={Radius.md} borderColor={Colors.accent} style={styles.matchBadge}>
            <Text style={styles.matchText}>{artist.matchScore}% match</Text>
          </GlassView>
        )}
      </View>

      {/* Name + role */}
      <View style={styles.cardBottom}>
        <View style={styles.artistRow}>
          <Image source={{ uri: artist.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.artistName}>{artist.name}</Text>
            <Text style={styles.artistRole}>{artist.role} · {artist.age} anos</Text>
          </View>
        </View>

        {/* Instruments */}
        <View style={styles.tagsRow}>
          {artist.instruments.map((inst) => (
            <View key={inst} style={styles.instrumentTag}>
              <Text style={styles.instrumentText}>{inst}</Text>
            </View>
          ))}
          <View style={[styles.instrumentTag, styles.levelTag]}>
            <Text style={styles.levelText}>{artist.level}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Icon name="location" size={13} color={Colors.textSecondary} />
          <Text style={styles.locationText}>{artist.location}</Text>
        </View>

        {/* Match reasons */}
        {artist.matchReasons && (
          <View style={styles.pillsRow}>
            {artist.matchReasons.slice(0, 2).map((r) => (
              <MatchReasonPill key={r} reason={r} />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Wrapper que calcula a lista recomendada a partir do perfil + filtros.
 * Usa uma `key` derivada dos filtros para remontar o feed (fila nova) quando
 * os filtros mudam, evitando sincronizar estado via setState em effect.
 */
type SearchMode = 'people' | 'openings' | 'events';

function ModeButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: IconName;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.modeBtn, active && styles.modeBtnActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon name={icon} size={16} color={active ? Colors.base : Colors.textSecondary} />
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DiscoverScreen() {
  const { profile } = useProfile();
  const { filters } = useFilters();
  const [mode, setMode] = useState<SearchMode>('people');

  const recommended = useMemo(() => {
    const pool = MOCK_ARTISTS.filter(
      (a) =>
        // Exclui o próprio perfil e perfis incompletos (cold start).
        a.id !== profile.id && evaluateCompleteness(a).meetsMinimum
    );
    const filtered = applyFilters(profile, pool, filters);
    return rankCandidates(profile, filtered, { radiusKm: filters.radiusKm });
  }, [profile, filters]);

  const filterCount = activeFilterCount(filters);
  // Muda sempre que o perfil ou os filtros mudam → remonta o feed.
  const feedKey = `${profile.id}|${JSON.stringify(filters)}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Toggle Pessoas / Vagas / Eventos */}
      <View style={styles.modeToggle}>
        <ModeButton
          icon="people-outline"
          label="Pessoas"
          active={mode === 'people'}
          onPress={() => setMode('people')}
        />
        <ModeButton
          icon="clipboard-outline"
          label="Vagas"
          active={mode === 'openings'}
          onPress={() => setMode('openings')}
        />
        <ModeButton
          icon="calendar-outline"
          label="Eventos"
          active={mode === 'events'}
          onPress={() => setMode('events')}
        />
      </View>

      {mode === 'people' ? (
        <DiscoverFeed key={feedKey} recommended={recommended} filterCount={filterCount} />
      ) : mode === 'openings' ? (
        <OpeningsFeed />
      ) : (
        <EventsFeed />
      )}
    </SafeAreaView>
  );
}

/** Feed de vagas abertas, ordenadas por relevância ao usuário. */
function OpeningsFeed() {
  const router = useRouter();
  const { profile } = useProfile();
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOpenings = useCallback(async () => {
    setLoading(true);
    const fetched = await fetchOpenings();
    // Fallback para mocks enquanto não há vagas reais cadastradas.
    const source = fetched.length > 0 ? fetched : MOCK_OPENINGS;
    setOpenings(rankOpenings(profile, source));
    setLoading(false);
  }, [profile]);

  // Recarrega sempre que a aba de vagas é focada.
  useFocusEffect(
    useCallback(() => {
      loadOpenings();
    }, [loadOpenings])
  );

  return (
    <View style={styles.feedBody}>
      <View style={styles.openingsHeader}>
        <Text style={styles.openingsTitle}>Vagas abertas</Text>
        <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/post-opening')}>
          <Icon name="add" size={16} color={Colors.base} />
          <Text style={styles.postBtnText}>Postar vaga</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <SkeletonList />
      ) : (
        <ScrollView
          contentContainerStyle={styles.openingsList}
          showsVerticalScrollIndicator={false}
        >
          {openings.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="clipboard-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhuma vaga ainda</Text>
              <Text style={styles.emptySubtitle}>Seja o primeiro a postar uma vaga.</Text>
            </View>
          ) : (
            openings.map((o) => <OpeningCard key={o.id} opening={o} />)
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

/** Feed de eventos/demandas, ordenados por relevância ao usuário. */
function EventsFeed() {
  const router = useRouter();
  const { profile } = useProfile();
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const fetched = await fetchEvents();
    const source = fetched.length > 0 ? fetched : MOCK_EVENTS;
    setEvents(rankEvents(profile, source));
    setLoading(false);
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  return (
    <View style={styles.feedBody}>
      <View style={styles.openingsHeader}>
        <Text style={styles.openingsTitle}>Eventos</Text>
        <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/post-event')}>
          <Icon name="add" size={16} color={Colors.base} />
          <Text style={styles.postBtnText}>Postar evento</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <SkeletonList />
      ) : (
        <ScrollView
          contentContainerStyle={styles.openingsList}
          showsVerticalScrollIndicator={false}
        >
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhum evento ainda</Text>
              <Text style={styles.emptySubtitle}>Poste uma demanda para encontrar músicos.</Text>
            </View>
          ) : (
            events.map((e) => <EventCard key={e.id} event={e} />)
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

/**
 * Camada de fundo tingida pela vibe do artista. Faz fade-in ao montar; usada
 * com `key={color}` para criar uma transição suave entre cards sem guardar a
 * cor anterior em estado (evita setState/ref no render).
 */
function VibeBackdrop({ color }: { color: string }) {
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [opacity]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(color, 0.16), opacity }]}
    />
  );
}

function DiscoverFeed({
  recommended,
  filterCount,
}: {
  recommended: Artist[];
  filterCount: number;
}) {
  const router = useRouter();
  const { profile } = useProfile();
  const { swipesToday, recordSwipe } = useUsage();

  const plan = profile.plan ?? 'free';
  const limitReached = !canSwipe(plan, swipesToday);

  const [queue, setQueue] = useState<Artist[]>(recommended);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<'accept' | 'pass' | null>(null);

  // Fundo adaptativo: tinge a tela com a vibe do artista no topo da fila.
  // A camada de fundo remonta a cada vibe nova (via key) e faz fade-in,
  // criando a transição suave sem guardar a cor anterior em ref/state.
  const currentVibe = queue[0]?.vibeColor ?? Colors.accent;

  // Valor animado da posição do cartão. Guardado em state com inicializador
  // preguiçoso (não é um ref) para que as interpolações derivadas possam ser
  // criadas no render sem violar as regras de hooks.
  const [position] = useState(() => new Animated.ValueXY());
  const { rotate, likeOpacity, nopeOpacity } = useMemo(
    () => ({
      rotate: position.x.interpolate({
        inputRange: [-W / 2, 0, W / 2],
        outputRange: ['-12deg', '0deg', '12deg'],
      }),
      likeOpacity: position.x.interpolate({
        inputRange: [0, W * 0.2],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      nopeOpacity: position.x.interpolate({
        inputRange: [-W * 0.2, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      }),
    }),
    [position]
  );

  // Mantém as ações de swipe num ref para o PanResponder (criado uma vez)
  // sempre enxergar a versão mais recente, sem recriar os handlers.
  const actionsRef = useRef({ swipeRight: () => {}, swipeLeft: () => {} });

  // actionsRef só é lido dentro dos callbacks (em tempo de interação), nunca
  // durante o render; a leitura aqui é segura — por isso a regra é suprimida.
  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_e, g) => {
        position.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          actionsRef.current.swipeRight();
        } else if (g.dx < -SWIPE_THRESHOLD) {
          actionsRef.current.swipeLeft();
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  );

  const swipeRight = () => {
    if (limitReached) return;
    const current = queue[0];
    setActionFeedback('accept');
    recordSwipe();
    Animated.timing(position, {
      toValue: { x: W * 1.5, y: 0 },
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setAccepted((prev) => [...prev, current.id]);
      setQueue((prev) => prev.slice(1));
      position.setValue({ x: 0, y: 0 });
      setTimeout(() => setActionFeedback(null), 600);
    });
  };

  const swipeLeft = () => {
    if (limitReached) return;
    setActionFeedback('pass');
    recordSwipe();
    Animated.timing(position, {
      toValue: { x: -W * 1.5, y: 0 },
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setQueue((prev) => prev.slice(1));
      position.setValue({ x: 0, y: 0 });
      setTimeout(() => setActionFeedback(null), 600);
    });
  };

  const resetQueue = () => {
    setQueue(recommended);
    setAccepted([]);
  };

  // Mantém o ref de ações apontando para as versões atuais (feito em effect,
  // não no corpo do render, conforme as regras de hooks).
  useEffect(() => {
    actionsRef.current.swipeRight = swipeRight;
    actionsRef.current.swipeLeft = swipeLeft;
  });

  const currentArtist = queue[0];

  return (
    <View style={styles.feedBody}>
      {/* Fundo adaptativo tingido pela vibe; remonta e faz fade a cada card */}
      <VibeBackdrop key={currentVibe} color={currentVibe} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Mais opções">
          <Icon name="ellipsis-horizontal" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => router.push('/filters')}
          accessibilityRole="button"
          accessibilityLabel="Buscar e filtrar"
        >
          <Icon name="search" size={16} color={Colors.textSecondary} />
          <Text style={styles.searchText}>
            {filterCount > 0 ? `${filterCount} filtro(s) ativo(s)` : 'Buscar e filtrar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.push('/filters')}
          accessibilityRole="button"
          accessibilityLabel={filterCount > 0 ? `Filtros, ${filterCount} ativos` : 'Filtros'}
        >
          <Icon name="options" size={18} color={Colors.textPrimary} />
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Cards area */}
      <View style={styles.cardsArea}>
        {limitReached ? (
          <View style={styles.emptyState}>
            <Icon name="hourglass-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Limite diário atingido</Text>
            <Text style={styles.emptySubtitle}>
              Você usou seus {FREE_DAILY_SWIPES} swipes de hoje. Assine o Pro para
              recomendações ilimitadas.
            </Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => router.push('/upgrade')}>
              <Text style={styles.resetText}>Conhecer o Pro</Text>
            </TouchableOpacity>
          </View>
        ) : queue.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name={filterCount > 0 ? 'search-outline' : 'musical-notes'}
              size={56}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {filterCount > 0 && recommended.length === 0
                ? 'Nenhum resultado'
                : 'Você viu todos!'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filterCount > 0 && recommended.length === 0
                ? 'Nenhum músico corresponde aos filtros. Tente afrouxá-los.'
                : accepted.length > 0
                  ? `Você conectou com ${accepted.length} músico(s).`
                  : 'Nenhuma conexão ainda.'}
            </Text>
            {filterCount > 0 ? (
              <TouchableOpacity style={styles.resetBtn} onPress={() => router.push('/filters')}>
                <Text style={styles.resetText}>Ajustar filtros</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.resetBtn} onPress={resetQueue}>
                <Text style={styles.resetText}>Ver novamente</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Next card (static, behind) */}
            {queue[1] && (
              <View style={[styles.card, styles.cardBehind]}>
                <Image
                  source={{ uri: queue[1].coverImage }}
                  style={styles.cardCover}
                  resizeMode="cover"
                />
                <View style={styles.cardScrimBottom} />
                <View style={styles.cardBottom}>
                  <Text style={styles.artistName}>{queue[1].name}</Text>
                </View>
              </View>
            )}

            {/* Current card (draggable) */}
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                  ],
                },
              ]}
              {...panResponder.panHandlers}
            >
              {/* LIKE stamp */}
              <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
                <Text style={styles.stampText}>ACEITO</Text>
              </Animated.View>
              {/* NOPE stamp */}
              <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}>
                <Text style={styles.stampText}>PASSA</Text>
              </Animated.View>

              <ArtistCard
                artist={currentArtist}
                onPress={() =>
                  router.push({ pathname: '/profile/[id]', params: { id: currentArtist.id } })
                }
              />
            </Animated.View>
          </>
        )}
      </View>

      {/* Action buttons */}
      {queue.length > 0 && (
        <View style={styles.actions}>
          <PressableScale
            style={[styles.actionBtn, styles.passBtn]}
            onPress={swipeLeft}
            activeScale={0.88}
            accessibilityRole="button"
            accessibilityLabel="Passar"
          >
            <Icon name="close" size={26} color={Colors.danger} />
          </PressableScale>
          <PressableScale
            style={[styles.actionBtn, styles.saveBtn]}
            activeScale={0.88}
            accessibilityRole="button"
            accessibilityLabel="Salvar"
          >
            <Icon name="bookmark-outline" size={22} color={Colors.textMuted} />
          </PressableScale>
          <PressableScale
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={swipeRight}
            activeScale={0.88}
            accessibilityRole="button"
            accessibilityLabel="Aceitar"
          >
            <Icon name="checkmark" size={26} color={Colors.base} />
          </PressableScale>
        </View>
      )}

      {/* Feedback overlay */}
      {actionFeedback === 'accept' && (
        <View style={[styles.feedbackOverlay, { borderColor: Colors.success }]}>
          <Icon name="checkmark-circle" size={30} color={Colors.success} />
          <Text style={[styles.feedbackText, { color: Colors.success }]}>ACEITO</Text>
        </View>
      )}
      {actionFeedback === 'pass' && (
        <View style={[styles.feedbackOverlay, { borderColor: Colors.danger }]}>
          <Icon name="close-circle" size={30} color={Colors.danger} />
          <Text style={[styles.feedbackText, { color: Colors.danger }]}>PASSA</Text>
        </View>
      )}
    </View>
  );
}

const CARD_H = H * 0.68;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  feedBody: { flex: 1 },

  // Toggle Pessoas/Vagas/Eventos
  modeToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xs,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnActive: { backgroundColor: Colors.accent },
  modeText: { ...Typography.bodyStrong, fontSize: 14, color: Colors.textSecondary },
  modeTextActive: { color: Colors.base },

  // Vagas / Eventos
  openingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  openingsTitle: { ...Typography.h2 },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  postBtnText: { ...Typography.bodyStrong, fontSize: 13, color: Colors.base },
  openingsList: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xs, gap: Spacing.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: Colors.base, fontSize: 10, fontWeight: '800' },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.pill,
  },
  searchText: { ...Typography.body, fontSize: 14, color: Colors.textSecondary },

  cardsArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    position: 'absolute',
    width: W - Spacing.xl * 2,
    height: CARD_H,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    ...Elevation.lg,
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    top: Spacing.md,
  },
  cardCover: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  // Scrim superior: escurece o topo para os badges lerem bem
  cardScrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(8,11,20,0.45)',
  },
  // Scrim inferior: base escura garantindo contraste de nome/tags
  cardScrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(8,11,20,0.55)',
  },
  cardTop: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
  },
  goalText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  matchBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  matchText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },

  cardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm + 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  artistName: {
    ...Typography.display,
    fontSize: 24,
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  artistRole: {
    ...Typography.caption,
    marginTop: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  instrumentTag: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm - 2,
  },
  instrumentText: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  levelTag: {
    backgroundColor: Colors.glass,
    borderColor: Colors.glassBorder,
  },
  levelText: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.successSoft,
    borderWidth: 1,
    borderColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm - 4,
  },
  pillText: { color: Colors.success, fontSize: 11, fontWeight: '600' },

  stamp: {
    position: 'absolute',
    zIndex: 10,
    top: 60,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 4,
  },
  stampLike: {
    left: Spacing.xl,
    borderColor: Colors.success,
    transform: [{ rotate: '-20deg' }],
  },
  stampNope: {
    right: Spacing.xl,
    borderColor: Colors.danger,
    transform: [{ rotate: '20deg' }],
  },
  stampText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.md,
  },
  passBtn: { backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.danger },
  saveBtn: { backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.textMuted },
  acceptBtn: { backgroundColor: Colors.accent },

  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xxl,
  },
  emptyTitle: { ...Typography.h2, textAlign: 'center' },
  emptySubtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  resetBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  resetText: { ...Typography.button, fontSize: 15 },

  feedbackOverlay: {
    position: 'absolute',
    top: H * 0.35,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 4,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.overlay,
  },
  feedbackText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
