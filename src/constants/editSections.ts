import type { Artist } from '../data/mockData';
import type { IconName } from '../components/Icon';

/** Chave de cada seção editável (bate com a rota /edit-profile/[section]). */
export type EditSectionKey =
  | 'photos'
  | 'identity'
  | 'instruments'
  | 'style'
  | 'goals'
  | 'availability'
  | 'experience'
  | 'vibe';

export interface EditSection {
  key: EditSectionKey;
  title: string;
  icon: IconName;
  /** Resumo curto do estado atual, exibido no hub. */
  preview: (p: Artist) => string;
}

export const EDIT_SECTIONS: EditSection[] = [
  {
    key: 'photos',
    title: 'Foto e banner',
    icon: 'images',
    preview: (p) => {
      const has = [p.avatarUrl ? 'foto' : null, p.coverUrl ? 'banner' : null].filter(Boolean);
      return has.length ? has.join(' e ') + ' enviados' : 'Enviar foto de perfil e banner';
    },
  },
  {
    key: 'identity',
    title: 'Identidade',
    icon: 'card',
    preview: (p) => [p.name, p.role].filter(Boolean).join(' · ') || 'Nome, idade, localização',
  },
  {
    key: 'instruments',
    title: 'Instrumentos e nível',
    icon: 'musical-notes',
    preview: (p) =>
      p.instruments.length ? `${p.instruments.join(', ')} · ${p.level}` : 'Nenhum instrumento',
  },
  {
    key: 'style',
    title: 'Estilo e influências',
    icon: 'disc',
    preview: (p) => (p.genres.length ? p.genres.join(', ') : 'Nenhum gênero'),
  },
  {
    key: 'goals',
    title: 'Objetivos',
    icon: 'flag',
    preview: (p) => (p.goals.length ? p.goals.join(', ') : 'Nenhum objetivo'),
  },
  {
    key: 'availability',
    title: 'Disponibilidade',
    icon: 'calendar',
    preview: (p) => {
      const days = Object.keys(p.schedule ?? {});
      return days.length ? `${days.length} dia(s) marcados` : 'Sem disponibilidade';
    },
  },
  {
    key: 'experience',
    title: 'Equipamento e experiência',
    icon: 'headset',
    preview: (p) => p.equipment ?? 'Equipamento não informado',
  },
  {
    key: 'vibe',
    title: 'Vibe e bio',
    icon: 'color-palette',
    preview: (p) => p.vibeColorName,
  },
];
