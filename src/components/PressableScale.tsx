import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

/**
 * Botão/área tocável com microinteração de "pressão": encolhe e esmaece
 * suavemente ao toque e volta com mola ao soltar. Base do feedback de toque
 * do Design System (V6).
 *
 * Usa `Animated` nativo com `useNativeDriver` (sem react-native-reanimated, que
 * é incompatível com o Expo Go neste projeto). O valor animado vive em `useState`
 * com inicializador preguiçoso — não é um ref — para respeitar as regras de
 * hooks do eslint-config-expo.
 */

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  /** Escala no estado pressionado. Default: 0.96. */
  activeScale?: number;
  /** Opacidade no estado pressionado. Default: 0.9. */
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  activeScale = 0.96,
  activeOpacity = 0.9,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(1));

  const handlePressIn = (e: GestureResponderEvent) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: activeScale,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
      Animated.timing(opacity, {
        toValue: activeOpacity,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...rest}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale }], opacity: disabled ? 0.5 : opacity },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
