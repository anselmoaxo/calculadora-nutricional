import { classifyProgress, type DailyTargets } from '../domain/nutrition';
import type { Nutrients } from '../domain/mealPlan';
import { balanceText, formatNumber } from '../ui/labels';

interface NutritionLabelProps {
  targets: DailyTargets | null;
  consumed: Nutrients;
}

interface Row {
  key: 'kcal' | 'carb' | 'protein' | 'fat';
  name: string;
  unit: string;
  target: number | null;
  consumed: number;
  detail: string | null;
}

function buildRows(targets: DailyTargets | null, consumed: Nutrients): Row[] {
  return [
    {
      key: 'kcal',
      name: 'Valor energético',
      unit: 'kcal',
      target: targets?.kcal ?? null,
      consumed: consumed.kcal,
      detail: null,
    },
    {
      key: 'carb',
      name: 'Carboidratos',
      unit: 'g',
      target: targets?.carbGrams ?? null,
      consumed: consumed.carbGrams,
      detail: targets ? `${formatNumber(targets.carbPercent)}% das calorias` : null,
    },
    {
      key: 'protein',
      name: 'Proteínas',
      unit: 'g',
      target: targets?.proteinGrams ?? null,
      consumed: consumed.proteinGrams,
      detail: targets
        ? `${formatNumber(targets.proteinGramsPerKg)} g por kg, ${formatNumber(targets.proteinPercent)}% das calorias`
        : null,
    },
    {
      key: 'fat',
      name: 'Gorduras',
      unit: 'g',
      target: targets?.fatGrams ?? null,
      consumed: consumed.fatGrams,
      detail: targets ? `${formatNumber(targets.fatPercent)}% das calorias` : null,
    },
  ];
}

export function NutritionLabel({ targets, consumed }: NutritionLabelProps) {
  const rows = buildRows(targets, consumed);

  return (
    <section className="label" aria-labelledby="label-title">
      <h2 className="label__title" id="label-title">
        Informação nutricional
      </h2>
      <p className="label__portion">Porção: o seu dia inteiro</p>

      <div className="label__rule label__rule--heavy" aria-hidden="true" />

      <div className="label__grid label__grid--head" aria-hidden="true">
        <span />
        <span className="label__col">Meta</span>
        <span className="label__col">No cardápio</span>
        <span className="label__col">Saldo</span>
      </div>

      <ul className="label__rows">
        {rows.map((row) => {
          const progress = row.target === null ? null : classifyProgress(row.consumed, row.target);
          const status = progress?.status ?? 'none';
          const balance = row.target === null ? 0 : row.target - row.consumed;
          return (
            <li key={row.key} className={`label__row label__row--${row.key}`}>
              <div className="label__grid">
                <span className="label__name">
                  <span className="label__swatch" aria-hidden="true" />
                  <span>
                    {row.name}
                    {row.detail ? <small className="label__detail">{row.detail}</small> : null}
                  </span>
                </span>
                <span className="label__num">
                  {row.target === null ? '—' : formatNumber(row.target)}
                  <small className="label__unit">{row.unit}</small>
                </span>
                <span className="label__num">
                  {formatNumber(row.consumed)}
                  <small className="label__unit">{row.unit}</small>
                </span>
                <span className={`label__balance label__balance--${status}`}>
                  {balanceText(status, balance, row.unit)}
                </span>
              </div>
              <div
                className="label__bar"
                role="progressbar"
                aria-label={`${row.name} no cardápio`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress ? Math.min(progress.ratioPercent, 100) : 0}
                aria-valuetext={progress ? `${progress.ratioPercent}% da meta` : 'Sem meta'}
              >
                <div
                  className={`label__fill label__fill--${status}`}
                  style={{ width: `${progress?.fillPercent ?? 0}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="label__rule" aria-hidden="true" />

      {targets ? (
        <dl className="label__foot">
          <div>
            <dt>Taxa metabólica basal</dt>
            <dd>{formatNumber(targets.bmrKcal)} kcal</dd>
          </div>
          <div>
            <dt>Gasto total com atividade</dt>
            <dd>{formatNumber(targets.tdeeKcal)} kcal</dd>
          </div>
        </dl>
      ) : (
        <p className="label__empty">Corrija os campos em destaque para ver a sua meta diária.</p>
      )}

      {targets?.raisedToMinimum ? (
        <p className="label__note" role="status">
          A meta foi elevada para o mínimo de {formatNumber(targets.kcal)} kcal por dia. Abaixo disso, procure
          acompanhamento profissional.
        </p>
      ) : null}
    </section>
  );
}
