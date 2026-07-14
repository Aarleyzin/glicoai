import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { spacing } from '../constants/spacing';

export type BottomSpacerProps = {
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function BottomSpacer({ height = spacing.xxxl, style }: BottomSpacerProps) {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ height }, style]} />;
}
