import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FoodItem } from '../domain/foods';
import { MEAL_KEYS, itemNutrients, type DayPlan, type DaySummary, type MealKey } from '../domain/mealPlan';
import { ALL_CATEGORIES, MEAL_LABELS, formatNumber } from '../ui/labels';
import { NumberField } from './NumberField';

interface FoodPlannerProps {
  foods: FoodItem[];
  plan: DayPlan;
  summary: DaySummary;
  search: string;
  category: string;
  highlightFoodId: string | null;
  actions: ReactNode;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onAdd: (meal: MealKey, foodId: string, quantity: number) => void;
  onQuantityChange: (meal: MealKey, itemId: string, quantity: number) => void;
  onRemove: (meal: MealKey, itemId: string) => void;
}

export function FoodPlanner({
  foods,
  plan,
  summary,
  search,
  category,
  highlightFoodId,
  actions,
  onSearchChange,
  onCategoryChange,
  onAdd,
  onQuantityChange,
  onRemove,
}: FoodPlannerProps) {
  const foodsById = useMemo(() => new Map(foods.map((food) => [food.id, food])), [foods]);
  const categories = useMemo(() => [ALL_CATEGORIES, ...Array.from(new Set(foods.map((food) => food.category)))], [foods]);
  const visibleFoods = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = foods.filter(
      (food) =>
        (category === ALL_CATEGORIES || food.category === category) && food.name.toLowerCase().includes(term),
    );
    return matches.length > 0 ? matches : foods;
  }, [foods, search, category]);
  const hasMatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return foods.some(
      (food) => (category === ALL_CATEGORIES || food.category === category) && food.name.toLowerCase().includes(term),
    );
  }, [foods, search, category]);

  return (
    <section className="planner" aria-labelledby="planner-title">
      <div className="planner__head">
        <h2 className="planner__title" id="planner-title">
          Cardápio do dia
        </h2>
        <div className="planner__actions">{actions}</div>
      </div>

      <div className="planner__filters">
        <div className="field field--search">
          <label className="field__label" htmlFor="food-search">
            Buscar alimento
          </label>
          <input
            id="food-search"
            className="field__input"
            type="search"
            value={search}
            placeholder="Frango, arroz, aveia"
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {!hasMatches ? <p className="field__error">Nenhum alimento encontrado. A lista mostra todos.</p> : null}
        </div>
        <div className="chips" role="group" aria-label="Categoria de alimento">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={name === category}
              onClick={() => onCategoryChange(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="meals">
        {MEAL_KEYS.map((key) => (
          <MealSection
            key={key}
            meal={key}
            items={plan[key]}
            foodsById={foodsById}
            options={visibleFoods}
            totals={summary.byMeal[key]}
            highlightFoodId={highlightFoodId}
            onAdd={onAdd}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}

interface MealSectionProps {
  meal: MealKey;
  items: DayPlan[MealKey];
  foodsById: ReadonlyMap<string, FoodItem>;
  options: FoodItem[];
  totals: DaySummary['byMeal'][MealKey];
  highlightFoodId: string | null;
  onAdd: FoodPlannerProps['onAdd'];
  onQuantityChange: FoodPlannerProps['onQuantityChange'];
  onRemove: FoodPlannerProps['onRemove'];
}

function MealSection({
  meal,
  items,
  foodsById,
  options,
  totals,
  highlightFoodId,
  onAdd,
  onQuantityChange,
  onRemove,
}: MealSectionProps) {
  const { title, time } = MEAL_LABELS[meal];
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? '');
  const [quantity, setQuantity] = useState<number | null>(options[0]?.referenceQuantity ?? null);

  const selected = options.find((food) => food.id === selectedId) ?? options[0];

  useEffect(() => {
    if (highlightFoodId && foodsById.has(highlightFoodId)) setSelectedId(highlightFoodId);
  }, [highlightFoodId, foodsById]);

  useEffect(() => {
    if (selected) setQuantity(selected.referenceQuantity);
  }, [selected?.id]);

  const canAdd = Boolean(selected) && quantity !== null && quantity > 0;
  const headingId = `meal-${meal}`;

  return (
    <section className="meal" aria-labelledby={headingId}>
      <header className="meal__head">
        <h3 className="meal__title" id={headingId}>
          {title}
          <span className="meal__time">{time}</span>
        </h3>
        <dl className="meal__totals">
          <div>
            <dt>Calorias</dt>
            <dd>{formatNumber(totals.kcal)} kcal</dd>
          </div>
          <div className="meal__total--carb">
            <dt>Carboidratos</dt>
            <dd>{formatNumber(totals.carbGrams)} g</dd>
          </div>
          <div className="meal__total--protein">
            <dt>Proteínas</dt>
            <dd>{formatNumber(totals.proteinGrams)} g</dd>
          </div>
          <div className="meal__total--fat">
            <dt>Gorduras</dt>
            <dd>{formatNumber(totals.fatGrams)} g</dd>
          </div>
        </dl>
      </header>

      {items.length === 0 ? (
        <p className="meal__empty">Nada aqui ainda. Escolha um alimento abaixo e adicione.</p>
      ) : (
        <ul className="meal__items">
          {items.map((item) => {
            const food = foodsById.get(item.foodId);
            if (!food) return null;
            const nutrients = itemNutrients(item, foodsById);
            return (
              <li key={item.id} className="item">
                <div className="item__name">
                  <span>{food.name}</span>
                  <small>
                    Referência: {formatNumber(food.referenceQuantity)} {food.unit}, {formatNumber(food.kcal)} kcal
                  </small>
                </div>
                <div className="item__qty">
                  <NumberField
                    compact
                    hideLabel
                    label={`Quantidade de ${food.name}`}
                    value={item.quantity}
                    onChange={(value) => onQuantityChange(meal, item.id, value ?? 0)}
                  />
                  <span className="item__unit">{food.unit}</span>
                </div>
                <dl className="item__macros">
                  <div>
                    <dt>Calorias</dt>
                    <dd>{formatNumber(Math.round(nutrients.kcal))} kcal</dd>
                  </div>
                  <div>
                    <dt>Carboidratos</dt>
                    <dd>{formatNumber(Math.round(nutrients.carbGrams * 10) / 10)} g</dd>
                  </div>
                  <div>
                    <dt>Proteínas</dt>
                    <dd>{formatNumber(Math.round(nutrients.proteinGrams * 10) / 10)} g</dd>
                  </div>
                  <div>
                    <dt>Gorduras</dt>
                    <dd>{formatNumber(Math.round(nutrients.fatGrams * 10) / 10)} g</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remover ${food.name} de ${title.toLowerCase()}`}
                  onClick={() => onRemove(meal, item.id)}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form
        className="adder"
        onSubmit={(event) => {
          event.preventDefault();
          if (selected && quantity !== null && quantity > 0) onAdd(meal, selected.id, quantity);
        }}
      >
        <div className="field adder__food">
          <label className="field__label" htmlFor={`${headingId}-food`}>
            Alimento
          </label>
          <select
            id={`${headingId}-food`}
            className="field__input"
            value={selected?.id ?? ''}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {options.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name} ({formatNumber(food.kcal)} kcal por {formatNumber(food.referenceQuantity)} {food.unit})
              </option>
            ))}
          </select>
        </div>
        <NumberField
          label="Quantidade"
          unit={selected?.unit}
          value={quantity}
          onChange={setQuantity}
          error={quantity === null || quantity <= 0 ? 'Informe uma quantidade maior que zero.' : null}
        />
        <button type="submit" className="button button--primary" disabled={!canAdd}>
          <Plus size={18} aria-hidden="true" />
          Adicionar
        </button>
      </form>
    </section>
  );
}
