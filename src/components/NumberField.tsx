import { useEffect, useId, useState } from 'react';

interface NumberFieldProps {
  label: string;
  hideLabel?: boolean;
  unit?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string | null;
  compact?: boolean;
  placeholder?: string;
  required?: boolean;
}

function parseDecimal(text: string): number | null {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

// Aceita só dígitos e um separador decimal (vírgula ou ponto).
function maskDecimal(text: string): string {
  const cleaned = text.replace(/[^\d.,]/g, '');
  const firstSeparator = cleaned.search(/[.,]/);
  if (firstSeparator === -1) return cleaned;
  return cleaned.slice(0, firstSeparator + 1) + cleaned.slice(firstSeparator + 1).replace(/[.,]/g, '');
}

const toText = (value: number | null) => (value === null ? '' : String(value).replace('.', ','));

export function NumberField({
  label,
  hideLabel = false,
  unit,
  value,
  onChange,
  error,
  compact = false,
  placeholder,
  required = false,
}: NumberFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [text, setText] = useState(toText(value));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (parseDecimal(text) !== value) setText(toText(value));
    // Só sincroniza quando o valor muda por fora do campo.
  }, [value]);

  const showError = Boolean(error) && touched;

  return (
    <div className={`field${compact ? ' field--compact' : ''}`}>
      <label className={hideLabel ? 'visually-hidden' : 'field__label'} htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <input
          id={id}
          className="field__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          placeholder={placeholder}
          required={required}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          onChange={(event) => {
            const masked = maskDecimal(event.target.value);
            setText(masked);
            onChange(parseDecimal(masked));
          }}
          onBlur={() => setTouched(true)}
        />
        {unit ? <span className="field__unit">{unit}</span> : null}
      </div>
      {showError ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
