import { useCallback, useEffect, useState } from 'react';
import { fetchTodos, setTodoCompleted } from '../lib/todoApi';
import { toErrorMessage } from '../lib/format';
import type { AsyncStatus, Todo } from '../lib/types';

/**
 * 할 일 목록 조회 훅.
 * - 마운트 시, 그리고 reload() 호출 시(reloadKey 변경) useEffect 가 다시 실행되어 데이터를 요청합니다.
 * - ignore 플래그로 "이미 사라진 화면"에 늦게 도착한 응답이 상태를 덮어쓰지 않게 막습니다.
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    setError(null);

    fetchTodos()
      .then((data) => {
        if (ignore) return;
        setTodos(data);
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
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  /** 완료 토글: 화면을 먼저 바꾸고(낙관적 업데이트), 실패하면 원래대로 되돌립니다. */
  const toggleCompleted = useCallback(async (todo: Todo) => {
    const next = !todo.completed;
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, completed: next } : t)));
    try {
      await setTodoCompleted(todo.id, next);
    } catch (err) {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, completed: todo.completed } : t)));
      throw new Error(toErrorMessage(err));
    }
  }, []);

  return { todos, status, error, reload, toggleCompleted };
}
