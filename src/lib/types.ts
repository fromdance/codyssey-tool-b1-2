export type Priority = 'low' | 'medium' | 'high';

/** DB(todos 테이블) 한 행의 모양 */
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null; // 'YYYY-MM-DD'
  completed: boolean;
  created_at: string;
}

/** 폼에서 다루는 값 (controlled input 이라 모두 문자열/불리언) */
export interface TodoFormValues {
  title: string;
  description: string;
  priority: Priority;
  due_date: string;
  completed: boolean;
}

export type TodoFormErrors = Partial<Record<keyof TodoFormValues, string>>;

/** 비동기 요청의 상태. 모든 화면이 이 세 가지 중 하나로 그려지고, '빈 상태'는 success + 데이터 없음으로 판단합니다. */
export type AsyncStatus = 'loading' | 'success' | 'error';

export type StatusFilter = 'all' | 'active' | 'done';
export type SortOrder = 'newest' | 'due' | 'priority';
