import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Moon, PlusCircle, RotateCcw, Sparkles, Sun } from 'lucide-react';
import { CustomFoodDialog } from './components/CustomFoodDialog';
import { FoodPlanner } from './components/FoodPlanner';
import { NutritionLabel } from './components/NutritionLabel';
import { GoalForm, ProfileForm, type PlanDraft, type ProfileDraft } from './components/TargetForm';
import { INITIAL_FOODS, type FoodItem } from './domain/foods';
import {
  addItem,
  emptyDayPlan,
  removeItem,
  samplePlan,
  setItemQuantity,
  summarizeDay,
  type DayPlan,
  type MealKey,
} from './domain/mealPlan';
import {
  GOAL_PRESETS,
  calculateTargets,
  validateBodyProfile,
  type BodyProfile,
  type Goal,
} from './domain/nutrition';
import { ALL_CATEGORIES } from './ui/labels';

type Theme = 'light' | 'dark';

const INITIAL_GOAL: Goal = 'cut';

const INITIAL_PROFILE: ProfileDraft = {
  sex: 'male',
  ageYears: 28,
  weightKg: 76,
  heightCm: 175,
  activity: 'moderate',
};

let idCounter = 0;
const newId = () => `item-${Date.now().toString(36)}-${idCounter++}`;

function initialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Armazenamento indisponível: segue a preferência do sistema.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [profile, setProfile] = useState<ProfileDraft>(INITIAL_PROFILE);
  const [goal, setGoal] = useState<Goal>(INITIAL_GOAL);
  const [plan, setPlan] = useState<PlanDraft>({ ...GOAL_PRESETS[INITIAL_GOAL], macroMode: 'perKg' });

  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOODS);
  const [dayPlan, setDayPlan] = useState<DayPlan>(() => samplePlan(INITIAL_GOAL, newId));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [highlightFoodId, setHighlightFoodId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // Sem armazenamento, o tema vale só nesta visita.
    }
  }, [theme]);

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const targets = useMemo(() => {
    if (Object.keys(validateBodyProfile(profile)).length > 0) return null;
    return calculateTargets(profile as BodyProfile, {
      ...plan,
      proteinPercent: plan.proteinPercent ?? 0,
      carbPercent: plan.carbPercent ?? 0,
      fatPercent: plan.fatPercent ?? 0,
    });
  }, [profile, plan]);

  const summary = useMemo(() => summarizeDay(dayPlan, foods), [dayPlan, foods]);

  const updateMeal = (meal: MealKey, change: (items: DayPlan[MealKey]) => DayPlan[MealKey]) =>
    setDayPlan((current) => ({ ...current, [meal]: change(current[meal]) }));

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__brand">Calculadora nutricional</p>
        <button type="button" className="button button--quiet" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        </button>
      </header>

      <main className="main">
        <div className="intro">
          <h1 className="intro__title">Quanto você precisa comer hoje?</h1>
          <p className="intro__text">
            Informe seus dados e escolha um objetivo. Depois monte o cardápio e veja, na tabela, o que falta para
            fechar a meta do dia.
          </p>
        </div>

        <div className="workspace">
          <div className="workspace__form">
            <ProfileForm profile={profile} onChange={setProfile} />
            <GoalForm
              goal={goal}
              plan={plan}
              targets={targets}
              onGoalChange={(next) => {
                setGoal(next);
                setPlan((current) => ({ ...GOAL_PRESETS[next], macroMode: current.macroMode }));
              }}
              onPlanChange={setPlan}
            />
          </div>
          <div className="workspace__label">
            <NutritionLabel targets={targets} consumed={summary.total} />
          </div>
        </div>

        <FoodPlanner
          foods={foods}
          plan={dayPlan}
          summary={summary}
          search={search}
          category={category}
          highlightFoodId={highlightFoodId}
          actions={
            <>
              <button type="button" className="button" onClick={() => setDialogOpen(true)}>
                <PlusCircle size={18} aria-hidden="true" />
                Novo alimento
              </button>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setDayPlan(samplePlan(goal, newId));
                  showToast('Cardápio de exemplo carregado.');
                }}
              >
                <Sparkles size={18} aria-hidden="true" />
                Usar cardápio de exemplo
              </button>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setDayPlan(emptyDayPlan());
                  showToast('Cardápio do dia limpo.');
                }}
              >
                <RotateCcw size={18} aria-hidden="true" />
                Limpar o dia
              </button>
            </>
          }
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onAdd={(meal, foodId, quantity) => updateMeal(meal, (items) => addItem(items, foodId, quantity, newId()))}
          onQuantityChange={(meal, itemId, quantity) => updateMeal(meal, (items) => setItemQuantity(items, itemId, quantity))}
          onRemove={(meal, itemId) => updateMeal(meal, (items) => removeItem(items, itemId))}
        />
      </main>

      <footer className="footer">
        <p>
          Os valores dos alimentos são aproximados, com base na TACO e na USDA. A calculadora usa a fórmula de
          Mifflin-St Jeor e não substitui a orientação de um nutricionista.
        </p>
      </footer>

      <CustomFoodDialog
        open={dialogOpen}
        nextId={() => `custom-${newId()}`}
        onClose={() => setDialogOpen(false)}
        onCreate={(food) => {
          setFoods((current) => [food, ...current]);
          setHighlightFoodId(food.id);
          setDialogOpen(false);
          showToast(`${food.name} entrou na lista de alimentos.`);
        }}
      />

      <div className="toast" role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
