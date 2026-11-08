import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  hero: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 60,
    letterSpacing: -1,
  },
  h1: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
