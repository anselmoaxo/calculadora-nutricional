import type { FoodItem } from './foods';
import type { Goal } from './nutrition';

export const MEAL_KEYS = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
export type MealKey = (typeof MEAL_KEYS)[number];

export interface MealItem {
  id: string;
  foodId: string;
  quantity: number;
}

export type DayPlan = Record<MealKey, MealItem[]>;

export interface Nutrients {
  kcal: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

export interface DaySummary {
  byMeal: Record<MealKey, Nutrients>;
  total: Nutrients;
}

const ZERO: Nutrients = { kcal: 0, proteinGrams: 0, carbGrams: 0, fatGrams: 0 };

export function emptyDayPlan(): DayPlan {
  return { breakfast: [], lunch: [], snack: [], dinner: [] };
}

export function itemNutrients(item: MealItem, foodsById: ReadonlyMap<string, FoodItem>): Nutrients {
  const food = foodsById.get(item.foodId);
  if (!food || !(item.quantity > 0)) return ZERO;
  const ratio = item.quantity / food.referenceQuantity;
  return {
    kcal: food.kcal * ratio,
    proteinGrams: food.proteinGrams * ratio,
    carbGrams: food.carbGrams * ratio,
    fatGrams: food.fatGrams * ratio,
  };
}

const add = (a: Nutrients, b: Nutrients): Nutrients => ({
  kcal: a.kcal + b.kcal,
  proteinGrams: a.proteinGrams + b.proteinGrams,
  carbGrams: a.carbGrams + b.carbGrams,
  fatGrams: a.fatGrams + b.fatGrams,
});

const roundTenths = (value: number) => Math.round(value * 10) / 10;

export function summarizeDay(plan: DayPlan, foods: readonly FoodItem[]): DaySummary {
  const foodsById = new Map(foods.map((food) => [food.id, food]));
  const byMeal = {} as Record<MealKey, Nutrients>;
  let total = ZERO;

  MEAL_KEYS.forEach((key) => {
    const mealTotal = plan[key].reduce((sum, item) => add(sum, itemNutrients(item, foodsById)), ZERO);
    total = add(total, mealTotal);
    byMeal[key] = {
      kcal: Math.round(mealTotal.kcal),
      proteinGrams: roundTenths(mealTotal.proteinGrams),
      carbGrams: roundTenths(mealTotal.carbGrams),
      fatGrams: roundTenths(mealTotal.fatGrams),
    };
  });

  return {
    byMeal,
    total: {
      kcal: Math.round(total.kcal),
      proteinGrams: Math.round(total.proteinGrams),
      carbGrams: Math.round(total.carbGrams),
      fatGrams: Math.round(total.fatGrams),
    },
  };
}

export function addItem(items: MealItem[], foodId: string, quantity: number, newId: string): MealItem[] {
  if (!(quantity > 0)) return items;
  const existing = items.find((item) => item.foodId === foodId);
  if (existing) {
    return items.map((item) => (item === existing ? { ...item, quantity: item.quantity + quantity } : item));
  }
  return [...items, { id: newId, foodId, quantity }];
}

export function setItemQuantity(items: MealItem[], itemId: string, quantity: number): MealItem[] {
  const safe = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
  return items.map((item) => (item.id === itemId ? { ...item, quantity: safe } : item));
}

export function removeItem(items: MealItem[], itemId: string): MealItem[] {
  return items.filter((item) => item.id !== itemId);
}

type SampleMeal = ReadonlyArray<readonly [foodId: string, quantity: number]>;

const SAMPLE_PLANS: Record<Goal, Record<MealKey, SampleMeal>> = {
  cut: {
    breakfast: [['f16', 2], ['f4', 2], ['f28', 100]],
    lunch: [['f1', 150], ['f10', 100], ['f11', 80], ['f30', 100]],
    snack: [['f6', 30], ['f26', 1], ['f15', 20]],
    dinner: [['f3', 160], ['f12', 120], ['f31', 100], ['f32', 10]],
  },
  maintain: {
    breakfast: [['f16', 2], ['f4', 3], ['f26', 1], ['f15', 30]],
    lunch: [['f1', 160], ['f9', 160], ['f11', 100], ['f30', 100], ['f32', 10]],
    snack: [['f23', 170], ['f6', 30], ['f33', 15], ['f27', 1]],
    dinner: [['f2', 140], ['f9', 140], ['f31', 100]],
  },
  bulk: {
    breakfast: [['f17', 2], ['f4', 3], ['f21', 30], ['f26', 2], ['f15', 40]],
    lunch: [['f1', 180], ['f9', 250], ['f11', 140], ['f32', 10]],
    snack: [['f6', 30], ['f24', 200], ['f33', 30], ['f15', 30]],
    dinner: [['f2', 160], ['f20', 200], ['f32', 10]],
  },
};

export function samplePlan(goal: Goal, newId: () => string): DayPlan {
  const plan = emptyDayPlan();
  MEAL_KEYS.forEach((key) => {
    plan[key] = SAMPLE_PLANS[goal][key].map(([foodId, quantity]) => ({ id: newId(), foodId, quantity }));
  });
  return plan;
}
