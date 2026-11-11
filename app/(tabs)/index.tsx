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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { MOCK_ARTISTS, MOCK_OPENINGS, Artist, Opening } from '../../src/data/mockData';
import { useProfile } from '../../src/state/ProfileContext';
import { useFilters } from '../../src/state/FilterContext';
import {
  rankCandidates,
  applyFilters,
  activeFilterCount,
  rankOpenings,
} from '../../src/lib/matchEngine';
import { fetchOpenings } from '../../src/lib/openingsRepository';
import { OpeningCard } from '../../src/components/OpeningCard';

const { width: W, height: H } = Dimensions.get('window');
const SWIPE_THRESHOLD = W * 0.35;

const GOAL_COLORS: Record<string, string> = {
  'Banda Fixa': Colors.teal,
  'Colaboração Pontual': Colors.blue,
  'Jam Session': Colors.gold,
  'Trabalho Remunerado': Colors.green,
  'Substituição Temporária': '#E67E22',
};

function MatchReasonPill({ reason }: { reason: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>✓ {reason}</Text>
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
      <View style={styles.cardOverlay} />

      {/* Top bar */}
      <View style={styles.cardTop}>
        <View style={[styles.goalBadge, { backgroundColor: GOAL_COLORS[artist.goals[0]] ?? Colors.teal }]}>
          <Text style={styles.goalText}>
            {artist.goals[0]}
            {artist.goals.length > 1 ? ` +${artist.goals.length - 1}` : ''}
          </Text>
        </View>
        {artist.matchScore !== undefined && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{artist.matchScore}% match</Text>
          </View>
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
          <View style={[styles.instrumentTag, { backgroundColor: Colors.blueMid }]}>
            <Text style={styles.instrumentText}>{artist.level}</Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.locationText}>📍 {artist.location}</Text>

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
type SearchMode = 'people' | 'openings';

export default function DiscoverScreen() {
  const { profile } = useProfile();
  const { filters } = useFilters();
  const [mode, setMode] = useState<SearchMode>('people');

  const recommended = useMemo(() => {
    const pool = MOCK_ARTISTS.filter((a) => a.id !== profile.id);
    const filtered = applyFilters(profile, pool, filters);
    return rankCandidates(profile, filtered, { radiusKm: filters.radiusKm });
  }, [profile, filters]);

  const filterCount = activeFilterCount(filters);
  // Muda sempre que o perfil ou os filtros mudam → remonta o feed.
  const feedKey = `${profile.id}|${JSON.stringify(filters)}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Toggle Pessoas / Vagas */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'people' && styles.modeBtnActive]}
          onPress={() => setMode('people')}
        >
          <Text style={[styles.modeText, mode === 'people' && styles.modeTextActive]}>
            👤 Pessoas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'openings' && styles.modeBtnActive]}
          onPress={() => setMode('openings')}
        >
          <Text style={[styles.modeText, mode === 'openings' && styles.modeTextActive]}>
            📋 Vagas
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'people' ? (
        <DiscoverFeed key={feedKey} recommended={recommended} filterCount={filterCount} />
      ) : (
        <OpeningsFeed />
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
          <Text style={styles.postBtnText}>+ Postar vaga</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.openingsLoading}>
          <ActivityIndicator color={Colors.teal} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.openingsList}
          showsVerticalScrollIndicator={false}
        >
          {openings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
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

function DiscoverFeed({
  recommended,
  filterCount,
}: {
  recommended: Artist[];
  filterCount: number;
}) {
  const router = useRouter();

  const [queue, setQueue] = useState<Artist[]>(recommended);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<'accept' | 'pass' | null>(null);

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
    const current = queue[0];
    setActionFeedback('accept');
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
    setActionFeedback('pass');
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={styles.headerIcon}>⋯</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/filters')}>
          <Text style={styles.searchText}>
            🔍  {filterCount > 0 ? `${filterCount} filtro(s) ativo(s)` : 'Buscar e filtrar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/filters')}>
          <Text style={styles.headerIcon}>⚙</Text>
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Cards area */}
      <View style={styles.cardsArea}>
        {queue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{filterCount > 0 ? '🔍' : '🎵'}</Text>
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
                <View style={styles.cardOverlay} />
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
          <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={swipeLeft}>
            <Text style={styles.actionIcon}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]}>
            <Text style={styles.actionIcon}>🔖</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={swipeRight}>
            <Text style={styles.actionIcon}>✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feedback overlay */}
      {actionFeedback === 'accept' && (
        <View style={[styles.feedbackOverlay, { borderColor: Colors.green }]}>
          <Text style={[styles.feedbackText, { color: Colors.green }]}>ACEITO ✓</Text>
        </View>
      )}
      {actionFeedback === 'pass' && (
        <View style={[styles.feedbackOverlay, { borderColor: Colors.red }]}>
          <Text style={[styles.feedbackText, { color: Colors.red }]}>PASSA ✕</Text>
        </View>
      )}
    </View>
  );
}

const CARD_H = H * 0.68;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  feedBody: { flex: 1 },

  // Toggle Pessoas/Vagas
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: Colors.teal },
  modeText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  modeTextActive: { color: Colors.bg },

  // Vagas
  openingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  openingsTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  postBtn: {
    backgroundColor: Colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  postBtnText: { color: Colors.bg, fontSize: 13, fontWeight: '700' },
  openingsLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  openingsList: { paddingHorizontal: 20, paddingTop: 4, gap: 12 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 18, color: Colors.textPrimary },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: Colors.bg, fontSize: 10, fontWeight: '800' },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  searchText: { color: Colors.textSecondary, fontSize: 14 },

  cardsArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    position: 'absolute',
    width: W - 32,
    height: CARD_H,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    top: 12,
  },
  cardCover: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  cardTop: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  matchBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  matchText: { color: Colors.teal, fontSize: 12, fontWeight: '700' },

  cardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.teal,
  },
  artistName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  artistRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  instrumentTag: {
    backgroundColor: 'rgba(0, 212, 200, 0.2)',
    borderWidth: 1,
    borderColor: Colors.teal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  instrumentText: { color: Colors.teal, fontSize: 12, fontWeight: '600' },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderWidth: 1,
    borderColor: Colors.green,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: { color: Colors.green, fontSize: 11, fontWeight: '600' },

  stamp: {
    position: 'absolute',
    zIndex: 10,
    top: 60,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 4,
  },
  stampLike: {
    left: 20,
    borderColor: Colors.green,
    transform: [{ rotate: '-20deg' }],
  },
  stampNope: {
    right: 20,
    borderColor: Colors.red,
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
    gap: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  passBtn: { backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.red },
  saveBtn: { backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.textMuted },
  acceptBtn: { backgroundColor: Colors.teal },
  actionIcon: { fontSize: 22 },

  emptyState: {
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  resetBtn: {
    marginTop: 8,
    backgroundColor: Colors.teal,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resetText: { color: Colors.bg, fontWeight: '700', fontSize: 15 },

  feedbackOverlay: {
    position: 'absolute',
    top: H * 0.35,
    alignSelf: 'center',
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  feedbackText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
