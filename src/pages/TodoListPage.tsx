import { useCallback, useMemo, useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../contexts/ToastContext';
import { DataState } from '../components/DataState';
import { EmptyState } from '../components/EmptyState';
import { FilterBar } from '../components/FilterBar';
import { LinkButton, Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { TodoList } from '../components/TodoList';
import { PRIORITY_RANK } from '../lib/format';
import type { SortOrder, StatusFilter, Todo } from '../lib/types';

export default function TodoListPage() {
  useDocumentTitle('할 일 목록');
  const { todos, status, error, reload, toggleCompleted } = useTodos();
  const { showToast } = useToast();

  // 필터 상태는 이 페이지에만 필요하므로 페이지에 둡니다.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');

  const counts = useMemo(() => {
    const done = todos.filter((t) => t.completed).length;
    return { all: todos.length, active: todos.length - done, done };
  }, [todos]);

  // 필터/검색/정렬 변경 → 이 값이 다시 계산 → 목록 렌더링이 바뀝니다. (보너스 2: useMemo)
  const visibleTodos = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = todos.filter((t) => {
      if (statusFilter === 'active' && t.completed) return false;
      if (statusFilter === 'done' && !t.completed) return false;
      return !q || t.title.toLowerCase().includes(q);
    });

    const sorted = [...filtered];
    if (sort === 'due') {
      sorted.sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'));
    } else if (sort === 'priority') {
      sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    }
    return sorted;
  }, [todos, statusFilter, query, sort]);

  const handleToggle = useCallback(
    async (todo: Todo) => {
      try {
        await toggleCompleted(todo);
        showToast(todo.completed ? '완료를 취소했습니다.' : '완료로 표시했습니다.');
      } catch (err) {
        showToast(`상태를 바꾸지 못했습니다. ${(err as Error).message}`, 'error');
      }
    },
    [toggleCompleted, showToast],
  );

  function resetFilters() {
    setStatusFilter('all');
    setQuery('');
  }

  return (
    <section>
      <PageHeader
        title="할 일 목록"
        description="체크박스를 누르면 바로 완료로 저장됩니다."
        actions={<LinkButton to="/todos/new">할 일 추가</LinkButton>}
      />

      <DataState
        status={status}
        error={error}
        onRetry={reload}
        loadingMessage="할 일 목록을 불러오는 중입니다."
        isEmpty={todos.length === 0}
        empty={
          <EmptyState
            title="표시할 데이터가 없습니다."
            message="첫 번째 할 일을 추가해 보세요."
            action={<LinkButton to="/todos/new">할 일 추가</LinkButton>}
          />
        }
      >
        <FilterBar
          status={statusFilter}
          onStatusChange={setStatusFilter}
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          counts={counts}
        />

        {visibleTodos.length === 0 ? (
          <EmptyState
            title="조건에 맞는 할 일이 없습니다."
            message="검색어나 필터를 바꿔 보세요."
            action={
              <Button variant="secondary" onClick={resetFilters}>
                필터 초기화
              </Button>
            }
          />
        ) : (
          <TodoList todos={visibleTodos} onToggle={handleToggle} />
        )}
      </DataState>
    </section>
  );
}
