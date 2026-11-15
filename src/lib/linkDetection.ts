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

/** Rótulo e ícone amigáveis por provedor. */
export function providerMeta(provider: LinkProvider): { label: string; icon: string } {
  switch (provider) {
    case 'spotify':
      return { label: 'Spotify', icon: '🟢' };
    case 'youtube':
      return { label: 'YouTube', icon: '▶️' };
    case 'soundcloud':
      return { label: 'SoundCloud', icon: '🟠' };
    default:
      return { label: 'Link', icon: '🔗' };
  }
}
