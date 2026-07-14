import type { ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { Platform, ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';

export type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'style'>;
};

export function AppScreen({
  children,
  scroll = true,
  backgroundColor,
  contentStyle,
  style,
  scrollProps,
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const resolvedBackground = backgroundColor ?? colors.background;
  const containerStyle: ViewStyle = {
    backgroundColor: resolvedBackground,
    flex: 1,
  };
  const webShellStyle: ViewStyle | null =
    Platform.OS === 'web'
      ? {
          alignSelf: 'center',
          boxSizing: 'border-box',
          maxWidth: 480,
          width: '100%',
        }
      : null;
  const sharedContentStyle: ViewStyle = {
    gap: spacing.xl,
    paddingBottom: Math.max(spacing.bottomTabs + spacing.xxl, insets.bottom + spacing.bottomTabs + spacing.lg),
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
  };

  if (!scroll) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[containerStyle, style]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={resolvedBackground} />
        <View
          style={[
            {
              ...sharedContentStyle,
              flex: 1,
              paddingBottom: Math.max(spacing.xxl, insets.bottom + spacing.lg),
            },
            webShellStyle,
            contentStyle,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[containerStyle, style]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={resolvedBackground} />
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...scrollProps}
        contentContainerStyle={[
          {
            ...sharedContentStyle,
            flexGrow: 1,
          },
          webShellStyle,
          contentStyle,
          scrollProps?.contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
