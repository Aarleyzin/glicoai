import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { AppButton, AppCard, AppChip, AppInput, AppScreen, AppText, ScreenHeader } from '../src/components';
import { spacing } from '../src/constants';
import { glucoseUnits } from '../src/features/glucose/glucose-types';
import { convertFromMgDl, convertToMgDl, DEFAULT_TARGET_RANGE } from '../src/features/glucose/glucose-utils';
import { formatGlucoseValue } from '../src/features/glucose/glucose-presenters';
import { trackingTypes, yesNoUnknownOptions } from '../src/features/profile/profile-types';
import { useAppSession } from '../src/providers/app-session-provider';
import { useAppSettingsStore } from '../src/stores/app-settings-store';
import { useGlucoseStore } from '../src/stores/glucose-store';

function formatTargetInput(valueMgDl: number, unit: (typeof glucoseUnits)[number]) {
  return formatGlucoseValue(convertFromMgDl(valueMgDl, unit), unit);
}

export default function HealthProfileSetupScreen() {
  const router = useRouter();
  const { completeHealthProfile } = useAppSession();

  const healthProfile = useAppSettingsStore((state) => state.healthProfile);
  const unitPreference = useAppSettingsStore((state) => state.unitPreference);
  const targetRange = useAppSettingsStore((state) => state.targetRange);
  const updateHealthProfile = useAppSettingsStore((state) => state.updateHealthProfile);
  const setUnitPreference = useAppSettingsStore((state) => state.setUnitPreference);
  const setTargetRange = useAppSettingsStore((state) => state.setTargetRange);
  const recalculateStatuses = useGlucoseStore((state) => state.recalculateStatuses);
  const hasCompletedHealthProfile = useAppSettingsStore((state) => state.hasCompletedHealthProfile);

  const [name, setName] = useState(healthProfile.name);
  const [birthDate, setBirthDate] = useState(healthProfile.birthDate);
  const [trackingType, setTrackingType] = useState(healthProfile.trackingType);
  const [usesInsulin, setUsesInsulin] = useState(healthProfile.usesInsulin);
  const [usesMedication, setUsesMedication] = useState(healthProfile.usesMedication);
  const [selectedUnit, setSelectedUnit] = useState(unitPreference);
  const [isCustomRange, setIsCustomRange] = useState(targetRange.isCustom);
  const [targetMin, setTargetMin] = useState(formatTargetInput(targetRange.min, unitPreference));
  const [targetMax, setTargetMax] = useState(formatTargetInput(targetRange.max, unitPreference));
  const [error, setError] = useState('');
  const previousUnitRef = useRef(selectedUnit);

  useEffect(() => {
    if (previousUnitRef.current === selectedUnit) {
      return;
    }

    const currentMin = Number(targetMin.replace(',', '.'));
    const currentMax = Number(targetMax.replace(',', '.'));

    if (!Number.isNaN(currentMin) && !Number.isNaN(currentMax)) {
      const minMgDl = convertToMgDl(currentMin, previousUnitRef.current);
      const maxMgDl = convertToMgDl(currentMax, previousUnitRef.current);
      setTargetMin(formatTargetInput(minMgDl, selectedUnit));
      setTargetMax(formatTargetInput(maxMgDl, selectedUnit));
    }

    previousUnitRef.current = selectedUnit;
  }, [selectedUnit, targetMax, targetMin]);

  useEffect(() => {
    if (!isCustomRange) {
      setTargetMin(formatTargetInput(DEFAULT_TARGET_RANGE.min, selectedUnit));
      setTargetMax(formatTargetInput(DEFAULT_TARGET_RANGE.max, selectedUnit));
    }
  }, [isCustomRange, selectedUnit]);

  function handleSaveProfile() {
    const normalizedName = name.trim();
    const trimmedBirthDate = birthDate.trim();
    const minValue = Number(targetMin.replace(',', '.'));
    const maxValue = Number(targetMax.replace(',', '.'));

    if (!normalizedName) {
      setError('Digite seu nome para concluir o perfil.');
      return;
    }

    if (trimmedBirthDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedBirthDate)) {
      setError('Use a data no formato DD/MM/AAAA.');
      return;
    }

    if (
      isCustomRange &&
      (Number.isNaN(minValue) || Number.isNaN(maxValue) || minValue <= 0 || maxValue <= 0 || minValue >= maxValue)
    ) {
      setError('Revise a faixa alvo para usar valores válidos.');
      return;
    }

    const nextTargetRange = isCustomRange
      ? {
          min: convertToMgDl(minValue, selectedUnit),
          max: convertToMgDl(maxValue, selectedUnit),
          isCustom: true,
        }
      : {
          min: DEFAULT_TARGET_RANGE.min,
          max: DEFAULT_TARGET_RANGE.max,
          isCustom: false,
        };

    updateHealthProfile({
      name: normalizedName,
      birthDate: trimmedBirthDate,
      trackingType,
      usesInsulin,
      usesMedication,
    });
    setUnitPreference(selectedUnit);
    setTargetRange(nextTargetRange);
    recalculateStatuses(nextTargetRange);
    completeHealthProfile();
    setError('');
    router.replace('/(tabs)');
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Perfil de saúde"
        subtitle="Defina suas preferências para personalizar o acompanhamento."
        eyebrow="Seu cuidado"
      />

      <AppCard>
        <View style={{ gap: spacing.md }}>
          <AppInput label="Nome" placeholder="Camila" value={name} onChangeText={setName} />
          <AppInput label="Data de nascimento" placeholder="DD/MM/AAAA" value={birthDate} onChangeText={setBirthDate} />

          <View style={{ gap: spacing.sm }}>
            <AppText variant="label">Tipo de acompanhamento</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {trackingTypes.map((item) => (
                <AppChip key={item} label={item} selected={trackingType === item} onPress={() => setTrackingType(item)} />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <AppText variant="label">Unidade preferida</AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {glucoseUnits.map((unit) => (
                <AppChip key={unit} label={unit} selected={selectedUnit === unit} onPress={() => setSelectedUnit(unit)} />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <AppText variant="label">Faixa alvo</AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <AppChip label="Usar padrão do app" selected={!isCustomRange} onPress={() => setIsCustomRange(false)} />
              <AppChip label="Personalizar" selected={isCustomRange} onPress={() => setIsCustomRange(true)} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <AppInput
              label="Mínimo"
              value={targetMin}
              onChangeText={setTargetMin}
              keyboardType="numeric"
              containerStyle={{ flex: 1 }}
              editable={isCustomRange}
            />
            <AppInput
              label="Máximo"
              value={targetMax}
              onChangeText={setTargetMax}
              keyboardType="numeric"
              containerStyle={{ flex: 1 }}
              editable={isCustomRange}
            />
          </View>

          <View style={{ gap: spacing.sm }}>
            <AppText variant="label">Usa insulina?</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {yesNoUnknownOptions.map((item) => (
                <AppChip key={item} label={item} selected={usesInsulin === item} onPress={() => setUsesInsulin(item)} />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <AppText variant="label">Usa medicação?</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {yesNoUnknownOptions.map((item) => (
                <AppChip
                  key={item}
                  label={item}
                  selected={usesMedication === item}
                  onPress={() => setUsesMedication(item)}
                />
              ))}
            </View>
          </View>

          <AppText variant="caption" tone="muted">
            Defina sua faixa alvo junto com um profissional de saúde.
          </AppText>

          {error ? (
            <AppText selectable variant="caption" tone="danger">
              {error}
            </AppText>
          ) : null}

          <AppButton title={hasCompletedHealthProfile ? 'Salvar alterações' : 'Entrar no app'} onPress={handleSaveProfile} />
        </View>
      </AppCard>
    </AppScreen>
  );
}
