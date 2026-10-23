import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
}

export function ErrorState({ title = '요청에 실패했습니다. 다시 시도하세요.', message, onRetry }: ErrorStateProps) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__title">{title}</p>
      {message && <p className="state__text">{message}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
