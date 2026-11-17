import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { StyleProp, TextStyle } from 'react-native';
import { Colors } from '../constants/colors';

/**
 * Ícone vetorial padrão do Design System (V4).
 *
 * Encapsula o set **Ionicons** de `@react-native-vector-icons` (import dinâmico,
 * funciona no Expo Go sem config plugin — ver DESIGN.md §6). O carregamento dinâmico
 * registra a fonte do set no primeiro render, sem passo nativo. Centralizar o set e os
 * defaults aqui mantém tamanho/cor consistentes e facilita trocar de set no futuro.
 *
 * Catálogo de nomes: https://icons.expo.fyi (set Ionicons) ou o glyphmap do pacote.
 */

/** Nome de um ícone Ionicons. */
export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface IconProps {
  name: IconName;
  /** Tamanho em px. Default: 22 (tamanho de ação/nav padrão). */
  size?: number;
  /** Cor do ícone. Default: textPrimary. */
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 22, color = Colors.textPrimary, style }: IconProps) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
