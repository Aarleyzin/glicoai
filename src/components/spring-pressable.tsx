import type { ReactNode } from 'react';
import { useRef } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Animated, Pressable } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type SpringPressableProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

export function SpringPressable({
  children,
  disabled,
  onPressIn,
  onPressOut,
  pressedScale = 0.975,
  style,
  ...props
}: SpringPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue: number) {
    Animated.spring(scale, {
      toValue,
      damping: 18,
      mass: 0.7,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  }

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        animate(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1);
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
