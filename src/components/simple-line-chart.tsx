import { useWindowDimensions, View } from 'react-native';

import { radius } from '../constants/radius';
import { spacing } from '../constants/spacing';
import { useAppTheme } from '../theme/app-theme';
import { AppText } from './app-text';

export type SimpleLineChartPoint = {
  id: string;
  label: string;
  value: number;
};

export type SimpleLineChartProps = {
  points: SimpleLineChartPoint[];
  unit?: string;
  height?: number;
  formatValueLabel?: (value: number) => string;
};

export function SimpleLineChart({
  points,
  unit = 'mg/dL',
  height = 180,
  formatValueLabel = (value) => Math.round(value).toString(),
}: SimpleLineChartProps) {
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();

  if (points.length === 0) {
    return null;
  }

  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const chartWidth = Math.max(width - spacing.screen * 2 - spacing.xl, 220);
  const stepWidth = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;

  const mappedPoints = points.map((point, index) => {
    const normalizedValue = (point.value - minValue) / range;
    return {
      ...point,
      x: index * stepWidth,
      y: height - normalizedValue * (height - 36) - 18,
    };
  });

  return (
    <View style={{ gap: spacing.md }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderCurve: 'continuous',
          borderRadius: radius.lg,
          borderWidth: 1,
          height,
          overflow: 'hidden',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          position: 'relative',
        }}
      >
        {[0, 1, 2].map((index) => (
          <View
            key={`grid-${index}`}
            style={{
              borderTopColor: colors.separator,
              borderTopWidth: 1,
              left: spacing.md,
              position: 'absolute',
              right: spacing.md,
              top: 24 + index * ((height - 48) / 2),
            }}
          />
        ))}

        {mappedPoints.slice(0, -1).map((point, index) => {
          const nextPoint = mappedPoints[index + 1];
          const deltaX = nextPoint.x - point.x;
          const deltaY = nextPoint.y - point.y;
          const lineWidth = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
          const midpointX = (point.x + nextPoint.x) / 2;
          const midpointY = (point.y + nextPoint.y) / 2;

          return (
            <View
              key={`line-${point.id}-${nextPoint.id}`}
              style={{
                backgroundColor: colors.accent,
                height: 3,
                left: midpointX + spacing.md - lineWidth / 2,
                position: 'absolute',
                top: midpointY - 1.5,
                transform: [{ rotate: `${angle}deg` }],
                width: lineWidth,
              }}
            />
          );
        })}

        {mappedPoints.map((point) => (
          <View
            key={point.id}
            style={{
              alignItems: 'center',
              left: point.x + spacing.md - 16,
              position: 'absolute',
              top: point.y - 18,
              width: 32,
            }}
          >
            <View
              style={{
                backgroundColor: colors.accent,
                borderColor: colors.surface,
                borderRadius: radius.pill,
                borderWidth: 3,
                height: 14,
                width: 14,
              }}
            />
            <AppText variant="caption" weight="semibold">
              {formatValueLabel(point.value)}
            </AppText>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {points.map((point) => (
          <View key={`label-${point.id}`} style={{ alignItems: 'center', flex: 1, gap: spacing.xxs }}>
            <AppText variant="caption" tone="muted">
              {point.label}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="caption" tone="muted">
        Tendência visual em {unit}
      </AppText>
    </View>
  );
}

