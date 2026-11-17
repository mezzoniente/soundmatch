import { StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Fonts } from '../lib/fonts';

/**
 * Escala tipográfica do Design System (V2).
 *
 * Famílias:
 * - **Clash Display** nos grandes títulos (`display`, `h1`) — personalidade e
 *   impacto. Usa `fontFamily: Fonts.display` + `fontWeight` para a face.
 * - **Inter** no restante (títulos menores, corpo, rótulos). Como cada peso de
 *   Inter é carregado como uma família própria (ver src/lib/fonts.ts), aqui
 *   referenciamos o peso pelo nome da família (ex.: Fonts.semibold) em vez de
 *   `fontWeight`.
 *
 * Papéis:
 * - `display`: nomes de artistas e grandes títulos (Clash Display).
 * - `h1`: título de destaque (Clash Display).
 * - `h2/h3`: hierarquia de títulos de seção (Inter).
 * - `body/bodyStrong`: corpo de texto (Inter).
 * - `caption`: metadados e textos pequenos (Inter).
 * - `label`: rótulos de seção em maiúsculas (Inter).
 * - `button`: texto de botões (Inter).
 */
export const Typography = StyleSheet.create({
  display: {
    fontFamily: Fonts.display,
    fontWeight: '700',
    fontSize: 48,
    color: Colors.textPrimary,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: Fonts.display,
    fontWeight: '600',
    fontSize: 30,
    color: Colors.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: Fonts.extrabold,
    fontSize: 22,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  h3: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  button: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.base,
    letterSpacing: 0.2,
  },
});
