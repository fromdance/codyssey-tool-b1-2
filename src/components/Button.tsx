import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** true 이면 스피너를 보여주고 버튼을 비활성화합니다. */
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', loading = false, disabled, children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`btn btn--${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <span className="spinner spinner--sm" aria-hidden="true" />}
      {children}
    </button>
  );
}

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
}

/** 버튼처럼 보이는 링크 (페이지 이동용) */
export function LinkButton({ variant = 'primary', className = '', ...rest }: LinkButtonProps) {
  return <Link {...rest} className={`btn btn--${variant} ${className}`} />;
}
