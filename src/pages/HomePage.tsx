import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTodos } from '../hooks/useTodos';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { DataState } from '../components/DataState';
import { EmptyState } from '../components/EmptyState';
import { LinkButton } from '../components/Button';
import { isOverdue, PRIORITY_RANK } from '../lib/format';

export default function HomePage() {
  useDocumentTitle('');
  const { todos, status, error, reload } = useTodos();

  const summary = useMemo(() => {
    const active = todos.filter((t) => !t.completed);
    const next = [...active]
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
      .slice(0, 3);
    return {
      active: active.length,
      done: todos.length - active.length,
      overdue: active.filter(isOverdue).length,
      next,
    };
  }, [todos]);

  return (
    <section className="home">
      <h1 className="home__title">오늘 할 일부터 적어 두세요.</h1>
      <p className="home__lead">적어 둔 일은 목록에서 체크하고, 마감이 지난 일은 따로 표시됩니다.</p>

      <DataState
        status={status}
        error={error}
        onRetry={reload}
        isEmpty={todos.length === 0}
        empty={
          <EmptyState
            title="아직 적어 둔 일이 없습니다."
            message="첫 번째 할 일을 추가하면 여기에 요약이 나타납니다."
            action={<LinkButton to="/todos/new">할 일 추가</LinkButton>}
          />
        }
      >
        <p className="home__summary">
          남은 일 <strong>{summary.active}</strong>개, 끝낸 일 <strong>{summary.done}</strong>개
          {summary.overdue > 0 && (
            <>
              {' '}
              중 <strong className="text-danger">{summary.overdue}</strong>개는 마감이 지났습니다
            </>
          )}
          .
        </p>

        {summary.next.length > 0 && (
          <div className="home__next">
            <h2 className="section-title">먼저 볼 일</h2>
            <ul className="plain-list">
              {summary.next.map((t) => (
                <li key={t.id}>
                  <Link to={`/todos/${t.id}`}>{t.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="button-row">
          <LinkButton to="/todos">목록 보기</LinkButton>
          <LinkButton to="/todos/new" variant="secondary">
            할 일 추가
          </LinkButton>
        </div>
      </DataState>
    </section>
  );
}
