import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldWrapperProps {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

/** 라벨 + 입력 + 에러/힌트 배치를 통일하는 틀 */
function FieldWrapper({ id, label, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required"> (필수)</span>}
      </label>
      {children}
      <div className="field__meta">
        {error ? (
          <p id={`${id}-error`} className="field__error" role="alert">
            {error}
          </p>
        ) : (
          <span />
        )}
        {hint && <span className="field__hint">{hint}</span>}
      </div>
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function Input({ id, label, error, hint, required, ...rest }: InputProps) {
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        className="field__control"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </FieldWrapper>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function TextArea({ id, label, error, hint, required, ...rest }: TextAreaProps) {
  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        className="field__control field__control--textarea"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </FieldWrapper>
  );
}

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  id: string;
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
}

export function Select<T extends string>({ id, label, value, options, onChange, error, required, ...rest }: SelectProps<T>) {
  return (
    <FieldWrapper id={id} label={label} error={error} required={required}>
      <select
        id={id}
        className="field__control"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
