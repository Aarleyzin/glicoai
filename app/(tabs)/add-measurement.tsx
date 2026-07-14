import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppButton, AppChip, AppInput, AppScreen, AppText } from '../../src/components';
import { spacing } from '../../src/constants';
import { glucoseContexts, glucoseMoods } from '../../src/features/glucose/glucose-types';
import { useAppSettingsStore } from '../../src/stores/app-settings-store';
import { useGlucoseStore } from '../../src/stores/glucose-store';
import { useAppTheme } from '../../src/theme/app-theme';

type ContextOption = (typeof glucoseContexts)[number];
type MoodOption = (typeof glucoseMoods)[number];

function StepButton({ label, icon, onPress }: { label: string; icon: 'minus' | 'plus'; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: colors.secondarySurface,
        borderCurve: 'continuous',
        borderRadius: 18,
        height: 44,
        justifyContent: 'center',
        opacity: pressed ? 0.55 : 1,
        width: 52,
      })}
    >
      <FontAwesome5 color={colors.text} name={icon} size={14} solid />
    </Pressable>
  );
}

function ChoiceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <AppText variant="subtitle" weight="bold">{title}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{children}</View>
    </View>
  );
}

export default function AddMeasurementScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const addReading = useGlucoseStore((state) => state.addReading);
  const unitPreference = useAppSettingsStore((state) => state.unitPreference);
  const [value, setValue] = useState('');
  const [context, setContext] = useState<ContextOption>('Agora');
  const [mood, setMood] = useState<MoodOption>('Bem');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function normalizeValue(nextValue: string) {
    return nextValue.replace(/[^0-9,.\-]/g, '');
  }

  function adjustValue(step: number) {
    const current = Number(value.replace(',', '.'));
    const next = Number.isNaN(current) ? Math.max(0, step) : Math.max(0, current + step);
    setValue(String(next));
    if (error) setError('');
  }

  function handleSaveReading() {
    const trimmedValue = value.trim();
    if (!trimmedValue) { setError('Digite um valor para salvar sua medição.'); return; }
    const numericValue = Number(trimmedValue.replace(',', '.'));
    if (Number.isNaN(numericValue)) { setError('Use um número válido para a glicose.'); return; }
    if (numericValue <= 0) { setError('O valor da glicose precisa ser maior que zero.'); return; }

    addReading({ value: numericValue, unit: unitPreference, context, mood, note });
    setError('');
    router.push('/measurement-result');
  }

  return (
    <AppScreen scrollProps={{ keyboardShouldPersistTaps: 'handled' }} contentStyle={{ gap: spacing.xxxl }}>
      <View style={{ gap: spacing.lg, paddingTop: spacing.sm }}>
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => ({ alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.secondarySurface, borderRadius: 18, height: 44, justifyContent: 'center', opacity: pressed ? 0.55 : 1, width: 44 })}
        >
          <FontAwesome5 color={colors.text} name="chevron-left" size={15} solid />
        </Pressable>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="caption" tone="muted" weight="semibold">Medir</AppText>
          <AppText accessibilityRole="header" weight="bold" style={{ fontSize: 34, letterSpacing: 0, lineHeight: 41 }}>Nova medição</AppText>
          <AppText variant="body" tone="muted">Registre sua glicose e o contexto da leitura.</AppText>
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <AppText variant="subtitle" weight="bold">Valor da glicose</AppText>
        <View style={{ backgroundColor: colors.surface, borderCurve: 'continuous', borderRadius: 20, gap: spacing.xl, padding: spacing.xl }}>
          <View style={{ alignItems: 'baseline', flexDirection: 'row', justifyContent: 'center' }}>
            <TextInput
              accessibilityLabel="Valor da glicose"
              inputMode="decimal"
              keyboardType="decimal-pad"
              maxLength={5}
              onChangeText={(nextValue) => { setValue(normalizeValue(nextValue)); if (error) setError(''); }}
              placeholder="112"
              placeholderTextColor={colors.tertiaryText}
              selectionColor={colors.accent}
              style={{ color: colors.text, fontFamily: 'System', fontSize: 68, fontVariant: ['tabular-nums'], fontWeight: '700', letterSpacing: 0, lineHeight: 76, minWidth: 180, padding: 0, textAlign: 'center' }}
              value={value}
            />
            <AppText variant="subtitle" tone="muted">{unitPreference}</AppText>
          </View>
          <View style={{ alignItems: 'center', borderTopColor: colors.separator, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.lg }}>
            <StepButton label="Diminuir valor" icon="minus" onPress={() => adjustValue(-1)} />
            <AppText variant="caption" tone="muted">Ajuste de 1 em 1</AppText>
            <StepButton label="Aumentar valor" icon="plus" onPress={() => adjustValue(1)} />
          </View>
        </View>
        {error ? <AppText variant="caption" tone="danger" weight="semibold">{error}</AppText> : null}
      </View>

      <ChoiceSection title="Quando foi a medição?">
        {glucoseContexts.map((item) => <AppChip key={item} label={item} selected={context === item} onPress={() => setContext(item)} />)}
      </ChoiceSection>

      <ChoiceSection title="Como você está se sentindo?">
        {glucoseMoods.map((item) => <AppChip key={item} label={item} selected={mood === item} onPress={() => setMood(item)} />)}
      </ChoiceSection>

      <AppInput label="Observação" helperText="Opcional" multiline onChangeText={setNote} placeholder="Ex.: após o almoço ou uma caminhada" style={{ minHeight: 96, textAlignVertical: 'top' }} value={note} />

      <AppButton title="Salvar medição" size="lg" onPress={handleSaveReading} />
    </AppScreen>
  );
}
