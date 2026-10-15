import type { ReactNode } from 'react';
import {
  CALORIE_DELTA_LIMIT_KCAL,
  validateMeasure,
  type ActivityLevel,
  type DailyTargets,
  type Goal,
  type MacroMode,
  type MacroPlan,
  type MeasureField,
  type Sex,
} from '../domain/nutrition';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS, SEX_OPTIONS, formatNumber, formatSigned, measureErrorMessage } from '../ui/labels';
import { ChoiceGroup } from './ChoiceGroup';
import { NumberField } from './NumberField';

export interface ProfileDraft {
  sex: Sex;
  ageYears: number | null;
  weightKg: number | null;
  heightCm: number | null;
  activity: ActivityLevel;
}

export type PlanDraft = Omit<MacroPlan, 'proteinPercent' | 'carbPercent' | 'fatPercent'> & {
  proteinPercent: number | null;
  carbPercent: number | null;
  fatPercent: number | null;
};

const MACRO_MODE_OPTIONS: { value: MacroMode; label: string }[] = [
  { value: 'perKg', label: 'Gramas por kg' },
  { value: 'percent', label: 'Porcentagem' },
];

interface ProfileFormProps {
  profile: ProfileDraft;
  onChange: (profile: ProfileDraft) => void;
}

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const measureError = (field: MeasureField) => {
    const error = validateMeasure(field, profile[field]);
    return error ? measureErrorMessage(field, error) : null;
  };

  return (
    <section className="form-block" aria-labelledby="profile-title">
      <h2 className="form-block__title" id="profile-title">
        Seu corpo e sua rotina
      </h2>

      <ChoiceGroup
        legend="Sexo usado na fórmula"
        options={SEX_OPTIONS}
        value={profile.sex}
        onChange={(sex) => onChange({ ...profile, sex })}
      />

      <div className="measures">
        <NumberField
          label="Idade"
          unit="anos"
          value={profile.ageYears}
          onChange={(ageYears) => onChange({ ...profile, ageYears })}
          error={measureError('ageYears')}
        />
        <NumberField
          label="Peso"
          unit="kg"
          value={profile.weightKg}
          onChange={(weightKg) => onChange({ ...profile, weightKg })}
          error={measureError('weightKg')}
        />
        <NumberField
          label="Altura"
          unit="cm"
          value={profile.heightCm}
          onChange={(heightCm) => onChange({ ...profile, heightCm })}
          error={measureError('heightCm')}
        />
      </div>

      <ChoiceGroup
        legend="Nível de atividade física"
        layout="list"
        options={ACTIVITY_OPTIONS}
        value={profile.activity}
        onChange={(activity) => onChange({ ...profile, activity })}
      />
    </section>
  );
}

interface RangeFieldProps {
  label: string;
  valueText: ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  tone?: 'protein' | 'fat' | 'neutral';
  minText?: string;
  maxText?: string;
}

function RangeField({ label, valueText, min, max, step, value, onChange, tone = 'neutral', minText, maxText }: RangeFieldProps) {
  return (
    <label className={`range range--${tone}`}>
      <span className="range__head">
        <span className="range__label">{label}</span>
        <span className="range__value">{valueText}</span>
      </span>
      <input
        className="range__input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {minText || maxText ? (
        <span className="range__ends">
          <span>{minText}</span>
          <span>{maxText}</span>
        </span>
      ) : null}
    </label>
  );
}

interface GoalFormProps {
  goal: Goal;
  plan: PlanDraft;
  targets: DailyTargets | null;
  onGoalChange: (goal: Goal) => void;
  onPlanChange: (plan: PlanDraft) => void;
}

export function GoalForm({ goal, plan, targets, onGoalChange, onPlanChange }: GoalFormProps) {
  const percentSum = (plan.proteinPercent ?? 0) + (plan.carbPercent ?? 0) + (plan.fatPercent ?? 0);

  return (
    <section className="form-block" aria-labelledby="goal-title">
      <h2 className="form-block__title" id="goal-title">
        Seu objetivo
      </h2>

      <ChoiceGroup legend="O que você quer fazer" options={GOAL_OPTIONS} value={goal} onChange={onGoalChange} />

      <RangeField
        label="Ajuste sobre o gasto total"
        valueText={`${formatSigned(plan.calorieDeltaKcal)} kcal`}
        min={-CALORIE_DELTA_LIMIT_KCAL}
        max={CALORIE_DELTA_LIMIT_KCAL}
        step={50}
        value={plan.calorieDeltaKcal}
        onChange={(calorieDeltaKcal) => onPlanChange({ ...plan, calorieDeltaKcal })}
        minText="Déficit alto"
        maxText="Superávit alto"
      />

      <ChoiceGroup
        legend="Como dividir os macronutrientes"
        options={MACRO_MODE_OPTIONS}
        value={plan.macroMode}
        onChange={(macroMode) => onPlanChange({ ...plan, macroMode })}
      />

      {plan.macroMode === 'perKg' ? (
        <div className="ranges">
          <RangeField
            label="Proteínas"
            tone="protein"
            valueText={`${formatNumber(plan.proteinGramsPerKg)} g por kg`}
            min={1.2}
            max={3}
            step={0.1}
            value={plan.proteinGramsPerKg}
            onChange={(proteinGramsPerKg) => onPlanChange({ ...plan, proteinGramsPerKg })}
          />
          <RangeField
            label="Gorduras"
            tone="fat"
            valueText={`${formatNumber(plan.fatGramsPerKg)} g por kg`}
            min={0.5}
            max={1.6}
            step={0.05}
            value={plan.fatGramsPerKg}
            onChange={(fatGramsPerKg) => onPlanChange({ ...plan, fatGramsPerKg })}
          />
          <p className="form-note">
            Os carboidratos ficam com o que sobra das calorias
            {targets ? `: ${formatNumber(targets.carbGramsPerKg)} g por kg.` : '.'}
          </p>
        </div>
      ) : (
        <div className="ranges">
          <div className="measures">
            <NumberField
              label="Proteínas"
              unit="%"
              value={plan.proteinPercent}
              onChange={(proteinPercent) => onPlanChange({ ...plan, proteinPercent })}
            />
            <NumberField
              label="Carboidratos"
              unit="%"
              value={plan.carbPercent}
              onChange={(carbPercent) => onPlanChange({ ...plan, carbPercent })}
            />
            <NumberField
              label="Gorduras"
              unit="%"
              value={plan.fatPercent}
              onChange={(fatPercent) => onPlanChange({ ...plan, fatPercent })}
            />
          </div>
          {percentSum !== 100 ? (
            <p className="form-note">
              As porcentagens somam {formatNumber(percentSum)}%. A calculadora ajusta os valores para fechar em 100%.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
