import type { IconName } from '../components/Icon';

export type LinkProvider = 'spotify' | 'youtube' | 'soundcloud' | 'generic';

export interface DetectedLink {
  url: string;
  provider: LinkProvider;
}

/** Regex simples para capturar URLs http(s). */
const URL_REGEX = /(https?:\/\/[^\s]+)/i;

/** Identifica o provedor musical a partir do domínio da URL. */
export function providerFor(url: string): LinkProvider {
  const u = url.toLowerCase();
  if (u.includes('spotify.com') || u.includes('spotify.link')) return 'spotify';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('soundcloud.com')) return 'soundcloud';
  return 'generic';
}

/**
 * Extrai o primeiro link de um texto, se houver, junto com o texto restante
 * (sem a URL). Usado para renderizar um cartão de link abaixo da mensagem.
 */
export function extractLink(text: string): { text: string; link: DetectedLink | null } {
  const match = URL_REGEX.exec(text);
  if (!match) return { text, link: null };
  const url = match[1];
  const stripped = text.replace(url, '').trim();
  return { text: stripped, link: { url, provider: providerFor(url) } };
}

/** Rótulo, ícone (Ionicons) e cor de acento por provedor. */
export function providerMeta(provider: LinkProvider): { label: string; icon: IconName; color: string } {
  switch (provider) {
    case 'spotify':
      return { label: 'Spotify', icon: 'musical-note', color: '#1DB954' };
    case 'youtube':
      return { label: 'YouTube', icon: 'logo-youtube', color: '#FF0000' };
    case 'soundcloud':
      return { label: 'SoundCloud', icon: 'cloud', color: '#FF7700' };
    default:
      return { label: 'Link', icon: 'link', color: '#00D4C8' };
  }
}
