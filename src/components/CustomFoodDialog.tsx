import { useEffect, useRef, useState } from 'react';
import { createCustomFood, type CustomFoodError, type CustomFoodField, type FoodItem } from '../domain/foods';
import { customFoodErrorMessage } from '../ui/labels';
import { NumberField } from './NumberField';

interface CustomFoodDialogProps {
  open: boolean;
  nextId: () => string;
  onCreate: (food: FoodItem) => void;
  onClose: () => void;
}

interface Draft {
  name: string;
  referenceQuantity: number | null;
  unit: string;
  kcal: number | null;
  proteinGrams: number | null;
  carbGrams: number | null;
  fatGrams: number | null;
}

const EMPTY_DRAFT: Draft = {
  name: '',
  referenceQuantity: 100,
  unit: 'g',
  kcal: null,
  proteinGrams: null,
  carbGrams: null,
  fatGrams: null,
};

type Errors = Partial<Record<CustomFoodField, CustomFoodError>>;

export function CustomFoodDialog({ open, nextId, onCreate, onClose }: CustomFoodDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setDraft(EMPTY_DRAFT);
      setErrors({});
      setSubmitted(false);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const message = (field: CustomFoodField) => {
    const error = errors[field];
    return submitted && error ? customFoodErrorMessage(field, error) : null;
  };

  const estimatedKcal = Math.round(
    (draft.proteinGrams ?? 0) * 4 + (draft.carbGrams ?? 0) * 4 + (draft.fatGrams ?? 0) * 9,
  );

  const update = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    const result = createCustomFood(next, 'check');
    setErrors(result.ok ? {} : result.errors);
  };

  return (
    <dialog ref={dialogRef} className="dialog" aria-labelledby="custom-food-title" onClose={onClose}>
      <form
        className="dialog__form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          const result = createCustomFood(draft, nextId());
          if (result.ok) onCreate(result.food);
          else setErrors(result.errors);
        }}
      >
        <h2 className="dialog__title" id="custom-food-title">
          Novo alimento
        </h2>

        <div className="field">
          <label className="field__label" htmlFor="custom-food-name">
            Nome
          </label>
          <input
            id="custom-food-name"
            className="field__input"
            type="text"
            value={draft.name}
            placeholder="Pão de queijo caseiro"
            aria-invalid={Boolean(message('name'))}
            onChange={(event) => update({ name: event.target.value })}
          />
          {message('name') ? <p className="field__error">{message('name')}</p> : null}
        </div>

        <div className="dialog__pair">
          <NumberField
            label="Porção de referência"
            value={draft.referenceQuantity}
            onChange={(referenceQuantity) => update({ referenceQuantity })}
            error={message('referenceQuantity')}
          />
          <div className="field">
            <label className="field__label" htmlFor="custom-food-unit">
              Unidade
            </label>
            <input
              id="custom-food-unit"
              className="field__input"
              type="text"
              value={draft.unit}
              placeholder="g, ml, fatia"
              onChange={(event) => update({ unit: event.target.value })}
            />
          </div>
        </div>

        <p className="dialog__hint">Informe os valores da porção de referência.</p>

        <div className="dialog__triple">
          <NumberField
            label="Proteínas"
            unit="g"
            value={draft.proteinGrams}
            placeholder="0"
            onChange={(proteinGrams) => update({ proteinGrams })}
            error={message('proteinGrams')}
          />
          <NumberField
            label="Carboidratos"
            unit="g"
            value={draft.carbGrams}
            placeholder="0"
            onChange={(carbGrams) => update({ carbGrams })}
            error={message('carbGrams')}
          />
          <NumberField
            label="Gorduras"
            unit="g"
            value={draft.fatGrams}
            placeholder="0"
            onChange={(fatGrams) => update({ fatGrams })}
            error={message('fatGrams')}
          />
        </div>

        <NumberField
          label="Calorias"
          unit="kcal"
          value={draft.kcal}
          placeholder={`Automático: ${estimatedKcal}`}
          onChange={(kcal) => update({ kcal })}
          error={message('kcal')}
        />

        <div className="dialog__actions">
          <button type="button" className="button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button button--primary">
            Salvar alimento
          </button>
        </div>
      </form>
    </dialog>
  );
}
