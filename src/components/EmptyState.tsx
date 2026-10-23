import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ title = '표시할 데이터가 없습니다.', message, action }: EmptyStateProps) {
  return (
    <div className="state state--empty">
      <p className="state__title">{title}</p>
      {message && <p className="state__text">{message}</p>}
      {action}
    </div>
  );
}
