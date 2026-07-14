import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { spacing } from '../../src/constants';
import { useAppSession } from '../../src/providers/app-session-provider';
import { useAppTheme } from '../../src/theme/app-theme';

type TabIconName = 'home' | 'measure' | 'progress' | 'more';

function TabIcon({ name, color, focused }: { name: TabIconName; color: string; focused: boolean }) {
  const { colors, floatingShadow } = useAppTheme();

  if (name === 'measure') {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.accent,
          borderCurve: 'continuous',
          borderRadius: 19,
          boxShadow: floatingShadow,
          height: 38,
          justifyContent: 'center',
          width: 38,
        }}
      >
        <FontAwesome5 color={colors.white} name="plus" size={14} solid />
      </View>
    );
  }

  const iconName = name === 'home' ? 'home' : name === 'progress' ? 'chart-bar' : 'ellipsis-h';
  const iconSize = name === 'more' ? 15 : 17;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderCurve: 'continuous',
        borderRadius: 12,
        height: 34,
        justifyContent: 'center',
        width: name === 'more' ? 38 : 34,
      }}
    >
      <FontAwesome5 color={color} name={iconName} size={iconSize} solid={focused} />
    </View>
  );
}

function TabLabel({ color, focused, label, measure = false }: { color: string; focused: boolean; label: string; measure?: boolean }) {
  const { colors } = useAppTheme();
  const resolvedColor = measure ? (focused ? colors.accent : colors.text) : focused ? colors.accent : color;

  return (
    <Text
      maxFontSizeMultiplier={1.15}
      style={{
        color: resolvedColor,
        fontFamily: 'System',
        fontSize: 10,
        fontWeight: focused || measure ? '700' : '600',
        marginTop: measure ? 5 : 4,
      }}
    >
      {label}
    </Text>
  );
}

function PremiumTabButton(props: BottomTabBarButtonProps) {
  const { accessibilityLabel, accessibilityState, accessibilityRole, children, onLayout, onLongPress, onPress, style, testID } = props;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityState={accessibilityState}
      hitSlop={4}
      onLayout={onLayout}
      onLongPress={onLongPress}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        { alignItems: 'center', flex: 1, justifyContent: 'center', opacity: pressed ? 0.64 : 1, paddingTop: spacing.xxs },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export default function TabsLayout() {
  const { authReady, hasCompletedHealthProfile, hasSeenOnboarding, isAuthenticated } = useAppSession();
  const { colors, isDark } = useAppTheme();

  if (!authReady) return null;
  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (!hasCompletedHealthProfile) return <Redirect href="/health-profile-setup" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tertiaryText,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.elevatedSurface,
          borderTopColor: colors.separator,
          borderTopWidth: 0.5,
          elevation: isDark ? 0 : 14,
          height: 82,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#000000',
          shadowOffset: { height: -2, width: 0 },
          shadowOpacity: isDark ? 0 : 0.04,
          shadowRadius: 10,
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarButton: PremiumTabButton, tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />, tabBarLabel: ({ color, focused }) => <TabLabel color={color} focused={focused} label="Início" /> }} />
      <Tabs.Screen name="add-measurement" options={{ title: 'Medir', tabBarButton: PremiumTabButton, tabBarIcon: ({ color, focused }) => <TabIcon name="measure" color={color} focused={focused} />, tabBarLabel: ({ color, focused }) => <TabLabel color={color} focused={focused} label="Medir" measure /> }} />
      <Tabs.Screen name="history" options={{ href: null, title: 'Histórico completo' }} />
      <Tabs.Screen name="insights" options={{ title: 'Progresso', tabBarButton: PremiumTabButton, tabBarIcon: ({ color, focused }) => <TabIcon name="progress" color={color} focused={focused} />, tabBarLabel: ({ color, focused }) => <TabLabel color={color} focused={focused} label="Progresso" /> }} />
      <Tabs.Screen name="more" options={{ title: 'Mais', tabBarButton: PremiumTabButton, tabBarIcon: ({ color, focused }) => <TabIcon name="more" color={color} focused={focused} />, tabBarLabel: ({ color, focused }) => <TabLabel color={color} focused={focused} label="Mais" /> }} />
    </Tabs>
  );
}

