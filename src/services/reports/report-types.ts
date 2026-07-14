import type { GlucoseReading, GlucoseUnit } from '../../features/glucose/glucose-types';
import type { TargetRange } from '../../features/profile/profile-types';

export type ReportPeriodPreset = 7 | 30 | 90 | 'custom';

export type ReportPeriodSelection = {
  preset: ReportPeriodPreset;
  startDate?: string;
  endDate?: string;
};

export type ReportSummary = {
  averageMgDl: number | null;
  highestReading: GlucoseReading | null;
  lowestReading: GlucoseReading | null;
  timeInRange: number;
  totalReadings: number;
};

export type ReportPreview = {
  generatedAt: string;
  periodLabel: string;
  readings: GlucoseReading[];
  summary: ReportSummary;
};

export type ReportUserContext = {
  appName: string;
  userName: string;
  unitPreference: GlucoseUnit;
  targetRange: TargetRange;
};

export type ReportDocumentInput = {
  preview: ReportPreview;
  context: ReportUserContext;
};

export type GeneratedReportFile = {
  uri: string | null;
  mode: 'file' | 'print-dialog';
  message: string;
};
