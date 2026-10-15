import { useId } from 'react';

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layout?: 'row' | 'list';
}

export function ChoiceGroup<T extends string>({ legend, options, value, onChange, layout = 'row' }: ChoiceGroupProps<T>) {
  const name = useId();
  return (
    <fieldset className="choices">
      <legend className="choices__legend">{legend}</legend>
      <div className={`choices__options choices__options--${layout}`}>
        {options.map((option) => (
          <label key={option.value} className="choice">
            <input
              className="choice__input"
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className="choice__body">
              <span className="choice__label">{option.label}</span>
              {option.hint ? <span className="choice__hint">{option.hint}</span> : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
