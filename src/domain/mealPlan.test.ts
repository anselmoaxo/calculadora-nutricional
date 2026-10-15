import { describe, expect, it } from 'vitest';
import { INITIAL_FOODS, createCustomFood, type CustomFoodInput } from './foods';
import {
  MEAL_KEYS,
  addItem,
  emptyDayPlan,
  itemNutrients,
  removeItem,
  samplePlan,
  setItemQuantity,
  summarizeDay,
} from './mealPlan';

const foodsById = new Map(INITIAL_FOODS.map((food) => [food.id, food]));

describe('itemNutrients', () => {
  it('escala os valores pela porção de referência', () => {
    const rice = itemNutrients({ id: 'a', foodId: 'f9', quantity: 200 }, foodsById);
    expect(rice.kcal).toBe(256);
    expect(rice.carbGrams).toBeCloseTo(56.2);
  });

  it('trata unidades como porções inteiras', () => {
    const eggs = itemNutrients({ id: 'a', foodId: 'f4', quantity: 2 }, foodsById);
    expect(eggs.kcal).toBe(148);
    expect(eggs.proteinGrams).toBeCloseTo(12.6);
  });

  it('devolve zero para alimento desconhecido ou quantidade inválida', () => {
    expect(itemNutrients({ id: 'a', foodId: 'x', quantity: 100 }, foodsById).kcal).toBe(0);
    expect(itemNutrients({ id: 'a', foodId: 'f9', quantity: -5 }, foodsById).kcal).toBe(0);
    expect(itemNutrients({ id: 'a', foodId: 'f9', quantity: Number.NaN }, foodsById).kcal).toBe(0);
  });
});

describe('summarizeDay', () => {
  it('soma refeições e total', () => {
    const plan = emptyDayPlan();
    plan.breakfast = [{ id: '1', foodId: 'f4', quantity: 2 }];
    plan.lunch = [
      { id: '2', foodId: 'f1', quantity: 150 },
      { id: '3', foodId: 'f9', quantity: 100 },
    ];
    const summary = summarizeDay(plan, INITIAL_FOODS);
    expect(summary.byMeal.breakfast.kcal).toBe(148);
    expect(summary.byMeal.lunch.kcal).toBe(Math.round(159 * 1.5 + 128));
    expect(summary.total.kcal).toBe(148 + Math.round(159 * 1.5 + 128));
    expect(summary.byMeal.snack.kcal).toBe(0);
  });

  it('retorna zero para o dia vazio', () => {
    expect(summarizeDay(emptyDayPlan(), INITIAL_FOODS).total).toEqual({
      kcal: 0,
      proteinGrams: 0,
      carbGrams: 0,
      fatGrams: 0,
    });
  });
});

describe('edição de itens', () => {
  it('soma a quantidade quando o alimento já existe na refeição', () => {
    const items = addItem([{ id: '1', foodId: 'f9', quantity: 100 }], 'f9', 50, 'novo');
    expect(items).toEqual([{ id: '1', foodId: 'f9', quantity: 150 }]);
  });

  it('adiciona um item novo e ignora quantidade zero', () => {
    expect(addItem([], 'f9', 100, 'novo')).toEqual([{ id: 'novo', foodId: 'f9', quantity: 100 }]);
    expect(addItem([], 'f9', 0, 'novo')).toEqual([]);
  });

  it('não aceita quantidade negativa ou inválida', () => {
    const items = [{ id: '1', foodId: 'f9', quantity: 100 }];
    expect(setItemQuantity(items, '1', -3)[0].quantity).toBe(0);
    expect(setItemQuantity(items, '1', Number.NaN)[0].quantity).toBe(0);
    expect(setItemQuantity(items, '1', 80)[0].quantity).toBe(80);
  });

  it('remove pelo id', () => {
    expect(removeItem([{ id: '1', foodId: 'f9', quantity: 100 }], '1')).toEqual([]);
  });
});

describe('samplePlan', () => {
  it('usa só alimentos do banco e ids únicos', () => {
    (['cut', 'maintain', 'bulk'] as const).forEach((goal) => {
      let counter = 0;
      const plan = samplePlan(goal, () => `id-${counter++}`);
      const items = MEAL_KEYS.flatMap((key) => plan[key]);
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((item) => foodsById.has(item.foodId))).toBe(true);
      expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    });
  });
});

describe('createCustomFood', () => {
  const valid: CustomFoodInput = {
    name: '  Crepioca  ',
    referenceQuantity: 100,
    unit: '',
    kcal: null,
    proteinGrams: 10,
    carbGrams: 20,
    fatGrams: 5,
  };

  it('estima as calorias quando não são informadas', () => {
    const result = createCustomFood(valid, 'custom-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.food.kcal).toBe(165);
      expect(result.food.name).toBe('Crepioca');
      expect(result.food.unit).toBe('g');
    }
  });

  it('respeita as calorias informadas', () => {
    const result = createCustomFood({ ...valid, kcal: 200 }, 'custom-1');
    expect(result.ok && result.food.kcal).toBe(200);
  });

  it('aponta os campos inválidos', () => {
    const result = createCustomFood(
      { ...valid, name: '   ', referenceQuantity: 0, proteinGrams: -1, kcal: -5 },
      'custom-1',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        name: 'required',
        referenceQuantity: 'outOfRange',
        proteinGrams: 'outOfRange',
        kcal: 'outOfRange',
      });
    }
  });

  it('exige a porção de referência', () => {
    const result = createCustomFood({ ...valid, referenceQuantity: null }, 'custom-1');
    expect(!result.ok && result.errors.referenceQuantity).toBe('required');
  });
});
