import { useColorScheme } from 'react-native';

export type AppThemeMode = 'light' | 'dark';

export type AppThemeColors = {
  mode: AppThemeMode;
  background: string;
  groupedBackground: string;
  surface: string;
  elevatedSurface: string;
  secondarySurface: string;
  tertiarySurface: string;
  text: string;
  secondaryText: string;
  tertiaryText: string;
  border: string;
  separator: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  lavenderSoft: string;
  mintSoft: string;
  white: string;
  overlay: string;
};

export const lightThemeColors: AppThemeColors = {
  mode: 'light',
  background: '#F7F7F8',
  groupedBackground: '#F2F2F7',
  surface: '#FFFFFF',
  elevatedSurface: '#FFFFFF',
  secondarySurface: '#F2F2F7',
  tertiarySurface: '#E9E9EE',
  text: '#17172E',
  secondaryText: '#68687F',
  tertiaryText: '#9292A3',
  border: 'rgba(37, 43, 92, 0.08)',
  separator: 'rgba(60, 60, 67, 0.12)',
  accent: '#B80F0A',
  accentPressed: '#920C08',
  accentSoft: '#FBE9E8',
  success: '#2AA889',
  successSoft: '#E8F7F2',
  warning: '#D99022',
  warningSoft: '#FFF5E5',
  danger: '#E5484D',
  dangerSoft: '#FFF0F0',
  lavenderSoft: '#F3F0FC',
  mintSoft: '#ECF8F5',
  white: '#FFFFFF',
  overlay: 'rgba(17, 17, 31, 0.42)',
};

export const darkThemeColors: AppThemeColors = {
  mode: 'dark',
  background: '#000000',
  groupedBackground: '#000000',
  surface: '#1C1C1E',
  elevatedSurface: '#242426',
  secondarySurface: '#2C2C2E',
  tertiarySurface: '#3A3A3C',
  text: '#F7F7FA',
  secondaryText: '#B5B5C2',
  tertiaryText: '#8E8E9A',
  border: 'rgba(255, 255, 255, 0.08)',
  separator: 'rgba(255, 255, 255, 0.12)',
  accent: '#E05A78',
  accentPressed: '#EF7892',
  accentSoft: '#3A141F',
  success: '#58D5B5',
  successSoft: '#16362F',
  warning: '#F4B45B',
  warningSoft: '#3A2E1C',
  danger: '#FF7277',
  dangerSoft: '#3B2022',
  lavenderSoft: '#2D2938',
  mintSoft: '#203631',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.66)',
};

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const colors = systemScheme === 'dark' ? darkThemeColors : lightThemeColors;

  return {
    colors,
    isDark: colors.mode === 'dark',
    shadow: colors.mode === 'dark' ? '0 0 0 rgba(0, 0, 0, 0)' : '0 10px 32px rgba(25, 25, 45, 0.08)',
    floatingShadow:
      colors.mode === 'dark' ? '0 0 0 rgba(0, 0, 0, 0)' : '0 12px 32px rgba(25, 25, 45, 0.1)',
  } as const;
}

