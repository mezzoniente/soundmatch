import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@soundmatch/swipeUsage';

/** Data de hoje no formato aaaa-mm-dd (local). */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface UsageContextValue {
  /** Swipes feitos hoje. */
  swipesToday: number;
  /** Registra um swipe (incrementa o contador do dia). */
  recordSwipe: () => void;
}

const UsageContext = createContext<UsageContextValue | undefined>(undefined);

/** Rastreia o uso diário (swipes) para aplicar o limite do plano gratuito. */
export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [swipesToday, setSwipesToday] = useState(0);
  const loadedRef = useRef(false);

  // Carrega o contador do dia ao montar; zera se a data virou.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) {
          const saved = JSON.parse(raw) as { date: string; count: number };
          if (saved.date === today()) setSwipesToday(saved.count);
        }
      } catch {
        // ignora erro de leitura
      } finally {
        if (active) loadedRef.current = true;
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const recordSwipe = useCallback(() => {
    setSwipesToday((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today(), count: next })).catch(
        () => {}
      );
      return next;
    });
  }, []);

  const value = useMemo(() => ({ swipesToday, recordSwipe }), [swipesToday, recordSwipe]);

  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>;
}

export function useUsage(): UsageContextValue {
  const ctx = useContext(UsageContext);
  if (!ctx) {
    throw new Error('useUsage deve ser usado dentro de <UsageProvider>');
  }
  return ctx;
}
