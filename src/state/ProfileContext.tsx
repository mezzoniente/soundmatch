import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Artist, MediaSample, MY_PROFILE } from '../data/mockData';
import { fetchProfile, upsertProfile } from '../lib/profileRepository';
import { useAuth } from './AuthContext';

/**
 * Dados coletados no onboarding. É um subconjunto editável do `Artist`:
 * campos de sistema (id, connections, matchScore...) não são editáveis pelo usuário.
 */
export type ProfileDraft = Pick<
  Artist,
  | 'name'
  | 'age'
  | 'role'
  | 'instruments'
  | 'level'
  | 'genres'
  | 'influences'
  | 'location'
  | 'schedule'
  | 'goals'
  | 'equipment'
  | 'bandExperience'
  | 'softSkills'
  | 'mediaSamples'
  | 'bio'
  | 'vibeColor'
  | 'vibeColorName'
>;

interface ProfileContextValue {
  /** Perfil completo do usuário atual. */
  profile: Artist;
  /** Indica se o usuário já concluiu o onboarding. */
  isOnboarded: boolean;
  /** `true` enquanto o perfil está sendo carregado do Supabase. */
  isHydrating: boolean;
  /** Mescla campos no perfil (edição parcial). */
  updateProfile: (patch: Partial<Artist>) => void;
  /** Aplica o rascunho do onboarding e marca o perfil como concluído. */
  completeOnboarding: (draft: ProfileDraft) => void;
  /** Adiciona uma amostra de áudio/vídeo ao perfil. */
  addMediaSample: (sample: MediaSample) => void;
  /** Remove uma amostra pelo id. */
  removeMediaSample: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

/** Intervalo de debounce para gravar mudanças no Supabase (ms). */
const SAVE_DEBOUNCE_MS = 800;

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Artist>(MY_PROFILE);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Controla quando é seguro persistir (só após carregar o perfil do usuário).
  const loadedForUserRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) Carrega o perfil do Supabase sempre que o usuário muda (login/logout).
  useEffect(() => {
    let active = true;

    // Toda a sincronização de estado acontece de forma assíncrona para evitar
    // setState síncrono no corpo do effect (que geraria renders em cascata).
    (async () => {
      if (!user) {
        // Deslogado: volta ao estado inicial e não persiste.
        if (!active) return;
        loadedForUserRef.current = null;
        setProfile(MY_PROFILE);
        setIsOnboarded(false);
        setIsHydrating(false);
        return;
      }

      setIsHydrating(true);
      const fetched = await fetchProfile(user.id);
      if (!active) return;

      if (fetched) {
        // Mescla com o mock para garantir campos visuais padrão (avatar, cover...).
        setProfile({ ...MY_PROFILE, ...fetched.artist, id: user.id });
        setIsOnboarded(fetched.isOnboarded);
      } else {
        // Perfil ainda não existe no banco: parte do mock, sem onboarding.
        setProfile({ ...MY_PROFILE, id: user.id });
        setIsOnboarded(false);
      }
      loadedForUserRef.current = user.id;
      setIsHydrating(false);
    })();

    return () => {
      active = false;
    };
  }, [user]);

  // 2) Persiste no Supabase (com debounce) a cada mudança, após o carregamento.
  useEffect(() => {
    if (!user || loadedForUserRef.current !== user.id) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      upsertProfile(user.id, profile, isOnboarded);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [user, profile, isOnboarded]);

  const updateProfile = useCallback((patch: Partial<Artist>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const completeOnboarding = useCallback((draft: ProfileDraft) => {
    setProfile((prev) => ({ ...prev, ...draft }));
    setIsOnboarded(true);
  }, []);

  const addMediaSample = useCallback((sample: MediaSample) => {
    setProfile((prev) => ({
      ...prev,
      mediaSamples: [...(prev.mediaSamples ?? []), sample],
    }));
  }, []);

  const removeMediaSample = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      mediaSamples: (prev.mediaSamples ?? []).filter((s) => s.id !== id),
    }));
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isOnboarded,
      isHydrating,
      updateProfile,
      completeOnboarding,
      addMediaSample,
      removeMediaSample,
    }),
    [
      profile,
      isOnboarded,
      isHydrating,
      updateProfile,
      completeOnboarding,
      addMediaSample,
      removeMediaSample,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

/** Hook de acesso ao perfil. Deve ser usado dentro de <ProfileProvider>. */
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile deve ser usado dentro de <ProfileProvider>');
  }
  return ctx;
}
