import { useCallback, useEffect, useState } from 'react';
import { fetchTodo } from '../lib/todoApi';
import { toErrorMessage } from '../lib/format';
import type { AsyncStatus, Todo } from '../lib/types';

/**
 * 할 일 하나 조회 훅. 라우트 파라미터 id 가 바뀌면(의존성) 다시 요청합니다.
 * todo 가 null 이고 status 가 success 이면 "존재하지 않는 항목"입니다.
 */
export function useTodoDetail(id: string | undefined) {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    setStatus('loading');
    setError(null);

    fetchTodo(id)
      .then((data) => {
        if (ignore) return;
        setTodo(data);
        setStatus('success');
      })
      .catch((err) => {
        if (ignore) return;
        setError(toErrorMessage(err));
        setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { todo, setTodo, status, error, reload };
}
