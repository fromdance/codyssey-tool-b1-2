import type { Priority, Todo } from './types';

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function formatDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function todayString(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function isOverdue(todo: Pick<Todo, 'due_date' | 'completed'>): boolean {
  return !!todo.due_date && !todo.completed && todo.due_date < todayString();
}

export function toErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    if (err.message.includes('Failed to fetch')) {
      return '서버에 연결하지 못했습니다. 네트워크 상태를 확인하세요.';
    }
    return err.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}
