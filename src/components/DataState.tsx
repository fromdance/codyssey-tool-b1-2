import type { ReactNode } from 'react';
import type { AsyncStatus } from '../lib/types';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Loading } from './Loading';

interface DataStateProps {
  status: AsyncStatus;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  empty?: ReactNode;
  children: ReactNode;
}

/**
 * 로딩 → 에러 → 빈 상태 → 성공 순서로 분기하는 공통 컴포넌트.
 * 모든 페이지가 이 컴포넌트를 거쳐 그려지므로 세 가지 상태가 어디서나 같은 모습입니다.
 */
export function DataState({ status, error, isEmpty = false, onRetry, loadingMessage, empty, children }: DataStateProps) {
  if (status === 'loading') return <Loading message={loadingMessage} />;
  if (status === 'error') return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return <>{empty ?? <EmptyState />}</>;
  return <>{children}</>;
}
