import { useToast } from '../contexts/ToastContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`} role={t.tone === 'error' ? 'alert' : 'status'}>
          <span>{t.message}</span>
          <button type="button" className="toast__close" onClick={() => dismissToast(t.id)} aria-label="알림 닫기">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
