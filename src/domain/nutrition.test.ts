import { describe, expect, it } from 'vitest';
import {
  GOAL_PRESETS,
  calculateBasalMetabolicRate,
  calculateTargets,
  classifyProgress,
  validateBodyProfile,
  validateMeasure,
  type BodyProfile,
  type MacroPlan,
} from './nutrition';

const man: BodyProfile = { sex: 'male', ageYears: 28, weightKg: 76, heightCm: 175, activity: 'moderate' };
const woman: BodyProfile = { sex: 'female', ageYears: 30, weightKg: 60, heightCm: 165, activity: 'sedentary' };

const perKgPlan = (goal: keyof typeof GOAL_PRESETS): MacroPlan => ({ ...GOAL_PRESETS[goal], macroMode: 'perKg' });
const percentPlan = (goal: keyof typeof GOAL_PRESETS): MacroPlan => ({ ...GOAL_PRESETS[goal], macroMode: 'percent' });

describe('calculateBasalMetabolicRate', () => {
  it('usa Mifflin-St Jeor para homens', () => {
    expect(calculateBasalMetabolicRate(man)).toBeCloseTo(1718.75);
  });

  it('usa Mifflin-St Jeor para mulheres', () => {
    expect(calculateBasalMetabolicRate(woman)).toBeCloseTo(1320.25);
  });
});

describe('calculateTargets', () => {
  it('calcula gasto e metas em gramas por quilo', () => {
    const targets = calculateTargets(man, perKgPlan('cut'));
    expect(targets.bmrKcal).toBe(1719);
    expect(targets.tdeeKcal).toBe(2664);
    expect(targets.kcal).toBe(2214);
    expect(targets.proteinGrams).toBe(160);
    expect(targets.fatGrams).toBe(65);
    expect(targets.carbGrams).toBe(247);
    expect(targets.proteinPercent + targets.carbPercent + targets.fatPercent).toBeGreaterThanOrEqual(99);
    expect(targets.proteinGramsPerKg).toBe(2.1);
    expect(targets.raisedToMinimum).toBe(false);
  });

  it('divide as calorias por porcentagem', () => {
    const targets = calculateTargets(man, percentPlan('maintain'));
    expect(targets.kcal).toBe(2664);
    expect(targets.proteinGrams).toBe(167);
    expect(targets.carbGrams).toBe(333);
    expect(targets.fatGrams).toBe(74);
  });

  it('normaliza porcentagens que não somam 100', () => {
    const plan: MacroPlan = { ...percentPlan('maintain'), proteinPercent: 50, carbPercent: 100, fatPercent: 50 };
    const targets = calculateTargets(man, plan);
    expect(targets.proteinGrams).toBe(167);
    expect(targets.carbGrams).toBe(333);
  });

  it('devolve macros zerados quando todas as porcentagens são zero', () => {
    const plan: MacroPlan = { ...percentPlan('maintain'), proteinPercent: 0, carbPercent: 0, fatPercent: 0 };
    const targets = calculateTargets(man, plan);
    expect(targets.proteinGrams).toBe(0);
    expect(targets.carbGrams).toBe(0);
    expect(targets.fatGrams).toBe(0);
  });

  it('não deixa a meta cair abaixo do mínimo', () => {
    const small: BodyProfile = { sex: 'female', ageYears: 60, weightKg: 45, heightCm: 150, activity: 'sedentary' };
    const targets = calculateTargets(small, { ...perKgPlan('cut'), calorieDeltaKcal: -800 });
    expect(targets.kcal).toBe(1000);
    expect(targets.raisedToMinimum).toBe(true);
  });

  it('zera os carboidratos quando proteína e gordura já passam da meta', () => {
    const plan: MacroPlan = { ...perKgPlan('cut'), proteinGramsPerKg: 3, fatGramsPerKg: 1.6, calorieDeltaKcal: -800 };
    const lean: BodyProfile = { ...woman, weightKg: 100, activity: 'sedentary' };
    expect(calculateTargets(lean, plan).carbGrams).toBe(0);
  });

  it('recusa medidas fora dos limites', () => {
    expect(() => calculateTargets({ ...man, ageYears: 10 }, perKgPlan('cut'))).toThrow(RangeError);
    expect(() => calculateTargets({ ...man, weightKg: Number.NaN }, perKgPlan('cut'))).toThrow(RangeError);
  });
});

describe('validateMeasure', () => {
  it('aceita os limites', () => {
    expect(validateMeasure('ageYears', 18)).toBeNull();
    expect(validateMeasure('ageYears', 100)).toBeNull();
    expect(validateMeasure('heightCm', 120)).toBeNull();
    expect(validateMeasure('weightKg', 250)).toBeNull();
  });

  it('rejeita valores fora da faixa', () => {
    expect(validateMeasure('ageYears', 17)).toBe('outOfRange');
    expect(validateMeasure('ageYears', 101)).toBe('outOfRange');
    expect(validateMeasure('weightKg', 29.9)).toBe('outOfRange');
    expect(validateMeasure('heightCm', 231)).toBe('outOfRange');
  });

  it('rejeita vazio e não numérico', () => {
    expect(validateMeasure('weightKg', null)).toBe('required');
    expect(validateMeasure('weightKg', Number.POSITIVE_INFINITY)).toBe('required');
  });

  it('agrupa os erros por campo', () => {
    expect(validateBodyProfile({ ageYears: 30, weightKg: null, heightCm: 300 })).toEqual({
      weightKg: 'required',
      heightCm: 'outOfRange',
    });
  });
});

describe('classifyProgress', () => {
  it('classifica abaixo, na meta e acima', () => {
    expect(classifyProgress(87, 100).status).toBe('under');
    expect(classifyProgress(88, 100).status).toBe('ok');
    expect(classifyProgress(107, 100).status).toBe('ok');
    expect(classifyProgress(108, 100).status).toBe('over');
  });

  it('limita o preenchimento da barra a 100%', () => {
    const progress = classifyProgress(150, 100);
    expect(progress.fillPercent).toBe(100);
    expect(progress.ratioPercent).toBe(150);
  });

  it('indica ausência de meta', () => {
    expect(classifyProgress(50, 0).status).toBe('none');
  });
});
