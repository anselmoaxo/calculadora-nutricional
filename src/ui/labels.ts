import type { CustomFoodError, CustomFoodField } from '../domain/foods';
import type { MealKey } from '../domain/mealPlan';
import type { ActivityLevel, Goal, MeasureError, MeasureField, ProgressStatus, Sex } from '../domain/nutrition';
import { MEASURE_LIMITS } from '../domain/nutrition';

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Feminino' },
  { value: 'male', label: 'Masculino' },
];

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: 'sedentary', label: 'Sedentário', hint: 'Pouco ou nenhum exercício' },
  { value: 'light', label: 'Levemente ativo', hint: 'Exercício leve, 1 a 3 dias por semana' },
  { value: 'moderate', label: 'Moderadamente ativo', hint: 'Treino moderado, 3 a 5 dias por semana' },
  { value: 'high', label: 'Muito ativo', hint: 'Treino intenso, 6 a 7 dias por semana' },
  { value: 'extreme', label: 'Extremamente ativo', hint: 'Treino pesado todo dia ou trabalho braçal' },
];

export const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: 'cut', label: 'Emagrecer', hint: 'Déficit calórico' },
  { value: 'maintain', label: 'Manter o peso', hint: 'Sem ajuste' },
  { value: 'bulk', label: 'Ganhar massa', hint: 'Superávit calórico' },
];

export const MEAL_LABELS: Record<MealKey, { title: string; time: string }> = {
  breakfast: { title: 'Café da manhã', time: '7h30' },
  lunch: { title: 'Almoço', time: '12h30' },
  snack: { title: 'Lanche da tarde', time: '16h30' },
  dinner: { title: 'Jantar', time: '20h' },
};

export const ALL_CATEGORIES = 'Todos';

const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export const formatNumber = (value: number) => numberFormat.format(value);

export const formatSigned = (value: number) => (value > 0 ? `+${formatNumber(value)}` : formatNumber(value));

const MEASURE_NAMES: Record<MeasureField, string> = {
  ageYears: 'A idade',
  weightKg: 'O peso',
  heightCm: 'A altura',
};

const MEASURE_UNITS: Record<MeasureField, string> = {
  ageYears: 'anos',
  weightKg: 'kg',
  heightCm: 'cm',
};

export function measureErrorMessage(field: MeasureField, error: MeasureError): string {
  const { min, max } = MEASURE_LIMITS[field];
  if (error === 'required') return `Informe ${MEASURE_NAMES[field].toLowerCase()}.`;
  const range = `${min} a ${max} ${MEASURE_UNITS[field]}`;
  if (field === 'ageYears') return `A calculadora vale para adultos, de ${range}.`;
  return `${MEASURE_NAMES[field]} deve ficar entre ${range}.`;
}

const CUSTOM_FOOD_NAMES: Record<CustomFoodField, string> = {
  name: 'o nome',
  referenceQuantity: 'a porção de referência',
  kcal: 'as calorias',
  proteinGrams: 'as proteínas',
  carbGrams: 'os carboidratos',
  fatGrams: 'as gorduras',
};

export function customFoodErrorMessage(field: CustomFoodField, error: CustomFoodError): string {
  if (error === 'required') return `Informe ${CUSTOM_FOOD_NAMES[field]}.`;
  return field === 'referenceQuantity'
    ? 'A porção de referência deve ser 1 ou mais.'
    : `Use zero ou mais para ${CUSTOM_FOOD_NAMES[field]}.`;
}

export function balanceText(status: ProgressStatus, balance: number, unit: string): string {
  if (status === 'none') return 'Sem meta';
  const amount = `${formatNumber(Math.abs(balance))} ${unit}`;
  if (status === 'ok') return 'Na meta';
  return balance >= 0 ? `Faltam ${amount}` : `Passou ${amount}`;
}
