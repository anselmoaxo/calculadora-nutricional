export interface FoodItem {
  id: string;
  name: string;
  category: string;
  referenceQuantity: number;
  unit: string;
  kcal: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

export const CUSTOM_CATEGORY = 'Personalizados';

const food = (
  id: string,
  name: string,
  category: string,
  referenceQuantity: number,
  unit: string,
  kcal: number,
  proteinGrams: number,
  carbGrams: number,
  fatGrams: number,
): FoodItem => ({ id, name, category, referenceQuantity, unit, kcal, proteinGrams, carbGrams, fatGrams });

// Valores aproximados por porção de referência, com base na TACO e na USDA.
export const INITIAL_FOODS: FoodItem[] = [
  food('f1', 'Peito de frango grelhado', 'Proteínas', 100, 'g', 159, 32, 0, 2.5),
  food('f2', 'Patinho bovino moído cozido', 'Proteínas', 100, 'g', 219, 35.9, 0, 7.3),
  food('f3', 'Filé de tilápia grelhado', 'Proteínas', 100, 'g', 128, 26, 0, 2.7),
  food('f4', 'Ovo de galinha inteiro', 'Proteínas', 1, 'unid (50 g)', 74, 6.3, 0.6, 5.0),
  food('f5', 'Clara de ovo', 'Proteínas', 1, 'unid (33 g)', 17, 3.6, 0.2, 0.1),
  food('f6', 'Whey protein concentrado', 'Suplementos', 30, 'g (1 scoop)', 120, 24, 3, 1.5),
  food('f7', 'Atum sólido em água, drenado', 'Proteínas', 100, 'g', 116, 26, 0, 1),
  food('f8', 'Lombo suíno assado', 'Proteínas', 100, 'g', 210, 35.7, 0, 6.4),

  food('f9', 'Arroz branco cozido', 'Carboidratos', 100, 'g', 128, 2.5, 28.1, 0.2),
  food('f10', 'Arroz integral cozido', 'Carboidratos', 100, 'g', 124, 2.6, 25.8, 1.0),
  food('f11', 'Feijão carioca cozido', 'Carboidratos', 100, 'g', 76, 4.8, 13.6, 0.5),
  food('f12', 'Batata-doce cozida', 'Carboidratos', 100, 'g', 77, 0.6, 18.4, 0.1),
  food('f13', 'Batata inglesa cozida', 'Carboidratos', 100, 'g', 52, 1.2, 11.9, 0),
  food('f14', 'Mandioca cozida', 'Carboidratos', 100, 'g', 125, 0.6, 30.1, 0.3),
  food('f15', 'Aveia em flocos', 'Carboidratos', 30, 'g', 118, 4.2, 20.0, 2.5),
  food('f16', 'Pão de forma integral', 'Carboidratos', 1, 'fatia (25 g)', 63, 2.8, 11.0, 0.9),
  food('f17', 'Pão francês', 'Carboidratos', 1, 'unid (50 g)', 150, 4.0, 29.3, 1.5),
  food('f18', 'Goma de tapioca hidratada', 'Carboidratos', 50, 'g', 120, 0, 30.0, 0),
  food('f19', 'Cuscuz de milho cozido', 'Carboidratos', 100, 'g', 113, 2.2, 25.3, 0.7),
  food('f20', 'Macarrão cozido', 'Carboidratos', 100, 'g', 157, 5.8, 30.9, 0.9),

  food('f21', 'Queijo minas frescal', 'Laticínios', 30, 'g (1 fatia)', 79, 5.2, 1.0, 6.1),
  food('f22', 'Queijo muçarela', 'Laticínios', 20, 'g (1 fatia)', 66, 4.5, 0.6, 5.0),
  food('f23', 'Iogurte natural desnatado', 'Laticínios', 170, 'g (1 pote)', 70, 6.8, 9.8, 0.3),
  food('f24', 'Leite desnatado', 'Laticínios', 200, 'ml (1 copo)', 68, 6.6, 10.0, 0.2),
  food('f25', 'Requeijão light', 'Laticínios', 30, 'g (1 col. sopa)', 54, 3.8, 1.2, 3.9),

  food('f26', 'Banana prata', 'Frutas', 1, 'unid (70 g)', 68, 0.9, 18.2, 0.1),
  food('f27', 'Maçã', 'Frutas', 1, 'unid (130 g)', 73, 0.4, 19.8, 0),
  food('f28', 'Mamão formosa', 'Frutas', 100, 'g', 45, 0.8, 11.6, 0.1),
  food('f29', 'Morango', 'Frutas', 100, 'g', 30, 0.9, 6.8, 0.3),
  food('f30', 'Brócolis cozido', 'Vegetais', 100, 'g', 25, 2.1, 4.4, 0.5),
  food('f31', 'Salada de folhas e tomate', 'Vegetais', 100, 'g', 18, 1.0, 3.5, 0.2),

  food('f32', 'Azeite de oliva extra virgem', 'Gorduras', 10, 'ml (1 col. sopa)', 88, 0, 0, 10.0),
  food('f33', 'Pasta de amendoim integral', 'Gorduras', 15, 'g (1 col. sopa)', 90, 4.2, 3.0, 7.5),
  food('f34', 'Abacate', 'Gorduras', 100, 'g', 96, 1.2, 6.0, 8.4),
  food('f35', 'Castanha-do-pará', 'Gorduras', 10, 'g (2 unid)', 64, 1.4, 1.5, 6.3),
];

export interface CustomFoodInput {
  name: string;
  referenceQuantity: number | null;
  unit: string;
  kcal: number | null;
  proteinGrams: number | null;
  carbGrams: number | null;
  fatGrams: number | null;
}

export type CustomFoodField = 'name' | 'referenceQuantity' | 'kcal' | 'proteinGrams' | 'carbGrams' | 'fatGrams';
export type CustomFoodError = 'required' | 'outOfRange';

export type CustomFoodResult =
  | { ok: true; food: FoodItem }
  | { ok: false; errors: Partial<Record<CustomFoodField, CustomFoodError>> };

const isNonNegative = (value: number) => Number.isFinite(value) && value >= 0;

export function createCustomFood(input: CustomFoodInput, id: string): CustomFoodResult {
  const errors: Partial<Record<CustomFoodField, CustomFoodError>> = {};
  const name = input.name.trim();
  if (!name) errors.name = 'required';

  if (input.referenceQuantity === null) errors.referenceQuantity = 'required';
  else if (!Number.isFinite(input.referenceQuantity) || input.referenceQuantity < 1) {
    errors.referenceQuantity = 'outOfRange';
  }

  const macroFields = ['proteinGrams', 'carbGrams', 'fatGrams'] as const;
  macroFields.forEach((field) => {
    const value = input[field];
    if (value !== null && !isNonNegative(value)) errors[field] = 'outOfRange';
  });
  if (input.kcal !== null && !isNonNegative(input.kcal)) errors.kcal = 'outOfRange';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const proteinGrams = input.proteinGrams ?? 0;
  const carbGrams = input.carbGrams ?? 0;
  const fatGrams = input.fatGrams ?? 0;
  const estimatedKcal = Math.round(proteinGrams * 4 + carbGrams * 4 + fatGrams * 9);

  return {
    ok: true,
    food: {
      id,
      name,
      category: CUSTOM_CATEGORY,
      referenceQuantity: input.referenceQuantity as number,
      unit: input.unit.trim() || 'g',
      kcal: input.kcal ?? estimatedKcal,
      proteinGrams,
      carbGrams,
      fatGrams,
    },
  };
}
