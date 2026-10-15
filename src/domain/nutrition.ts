export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'extreme';
export type Goal = 'cut' | 'maintain' | 'bulk';
export type MacroMode = 'perKg' | 'percent';

export interface BodyProfile {
  sex: Sex;
  ageYears: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
}

export type MeasureField = 'ageYears' | 'weightKg' | 'heightCm';
export type MeasureError = 'required' | 'outOfRange';

export const MEASURE_LIMITS: Record<MeasureField, { min: number; max: number }> = {
  ageYears: { min: 18, max: 100 },
  weightKg: { min: 30, max: 250 },
  heightCm: { min: 120, max: 230 },
};

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  extreme: 1.9,
};

export const MIN_TARGET_KCAL = 1000;
export const CALORIE_DELTA_LIMIT_KCAL = 800;

const KCAL_PER_GRAM = { protein: 4, carb: 4, fat: 9 } as const;

export interface MacroPlan {
  calorieDeltaKcal: number;
  macroMode: MacroMode;
  proteinGramsPerKg: number;
  fatGramsPerKg: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
}

export const GOAL_PRESETS: Record<Goal, Omit<MacroPlan, 'macroMode'>> = {
  cut: {
    calorieDeltaKcal: -450,
    proteinGramsPerKg: 2.1,
    fatGramsPerKg: 0.85,
    proteinPercent: 35,
    carbPercent: 40,
    fatPercent: 25,
  },
  maintain: {
    calorieDeltaKcal: 0,
    proteinGramsPerKg: 1.8,
    fatGramsPerKg: 1.0,
    proteinPercent: 25,
    carbPercent: 50,
    fatPercent: 25,
  },
  bulk: {
    calorieDeltaKcal: 350,
    proteinGramsPerKg: 1.8,
    fatGramsPerKg: 1.0,
    proteinPercent: 25,
    carbPercent: 55,
    fatPercent: 20,
  },
};

export interface DailyTargets {
  bmrKcal: number;
  tdeeKcal: number;
  kcal: number;
  raisedToMinimum: boolean;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
  proteinGramsPerKg: number;
  carbGramsPerKg: number;
  fatGramsPerKg: number;
}

export function validateMeasure(field: MeasureField, value: number | null): MeasureError | null {
  if (value === null || !Number.isFinite(value)) return 'required';
  const { min, max } = MEASURE_LIMITS[field];
  return value < min || value > max ? 'outOfRange' : null;
}

export function validateBodyProfile(
  measures: Record<MeasureField, number | null>,
): Partial<Record<MeasureField, MeasureError>> {
  const errors: Partial<Record<MeasureField, MeasureError>> = {};
  (Object.keys(MEASURE_LIMITS) as MeasureField[]).forEach((field) => {
    const error = validateMeasure(field, measures[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

// Mifflin-St Jeor, em kcal/dia.
export function calculateBasalMetabolicRate(profile: BodyProfile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.ageYears;
  return profile.sex === 'male' ? base + 5 : base - 161;
}

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;
const nonNegative = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

export function calculateTargets(profile: BodyProfile, plan: MacroPlan): DailyTargets {
  const errors = validateBodyProfile(profile);
  if (Object.keys(errors).length > 0) {
    throw new RangeError('Medidas corporais fora dos limites aceitos.');
  }

  const bmr = calculateBasalMetabolicRate(profile);
  const tdeeKcal = Math.round(bmr * ACTIVITY_FACTORS[profile.activity]);
  const adjustedKcal = Math.round(tdeeKcal + (Number.isFinite(plan.calorieDeltaKcal) ? plan.calorieDeltaKcal : 0));
  const kcal = Math.max(MIN_TARGET_KCAL, adjustedKcal);

  let proteinGrams: number;
  let fatGrams: number;
  let carbGrams: number;

  if (plan.macroMode === 'perKg') {
    proteinGrams = Math.round(profile.weightKg * nonNegative(plan.proteinGramsPerKg));
    fatGrams = Math.round(profile.weightKg * nonNegative(plan.fatGramsPerKg));
    const usedKcal = proteinGrams * KCAL_PER_GRAM.protein + fatGrams * KCAL_PER_GRAM.fat;
    carbGrams = Math.round(Math.max(0, kcal - usedKcal) / KCAL_PER_GRAM.carb);
  } else {
    const protein = nonNegative(plan.proteinPercent);
    const carb = nonNegative(plan.carbPercent);
    const fat = nonNegative(plan.fatPercent);
    const total = protein + carb + fat;
    const share = (part: number) => (total > 0 ? part / total : 0);
    proteinGrams = Math.round((kcal * share(protein)) / KCAL_PER_GRAM.protein);
    carbGrams = Math.round((kcal * share(carb)) / KCAL_PER_GRAM.carb);
    fatGrams = Math.round((kcal * share(fat)) / KCAL_PER_GRAM.fat);
  }

  const proteinKcal = proteinGrams * KCAL_PER_GRAM.protein;
  const carbKcal = carbGrams * KCAL_PER_GRAM.carb;
  const fatKcal = fatGrams * KCAL_PER_GRAM.fat;
  const macroKcal = proteinKcal + carbKcal + fatKcal;
  const percentOf = (part: number) => (macroKcal > 0 ? Math.round((part / macroKcal) * 100) : 0);

  return {
    bmrKcal: Math.round(bmr),
    tdeeKcal,
    kcal,
    raisedToMinimum: adjustedKcal < MIN_TARGET_KCAL,
    proteinGrams,
    carbGrams,
    fatGrams,
    proteinPercent: percentOf(proteinKcal),
    carbPercent: percentOf(carbKcal),
    fatPercent: percentOf(fatKcal),
    proteinGramsPerKg: roundToOneDecimal(proteinGrams / profile.weightKg),
    carbGramsPerKg: roundToOneDecimal(carbGrams / profile.weightKg),
    fatGramsPerKg: roundToOneDecimal(fatGrams / profile.weightKg),
  };
}

export type ProgressStatus = 'none' | 'under' | 'ok' | 'over';

export interface Progress {
  status: ProgressStatus;
  ratioPercent: number;
  fillPercent: number;
}

const UNDER_BELOW_PERCENT = 88;
const OK_UP_TO_PERCENT = 107;

export function classifyProgress(consumed: number, target: number): Progress {
  if (!(target > 0)) return { status: 'none', ratioPercent: 0, fillPercent: 0 };
  const ratio = (nonNegative(consumed) / target) * 100;
  const status: ProgressStatus = ratio < UNDER_BELOW_PERCENT ? 'under' : ratio <= OK_UP_TO_PERCENT ? 'ok' : 'over';
  return { status, ratioPercent: Math.round(ratio), fillPercent: Math.min(100, ratio) };
}
