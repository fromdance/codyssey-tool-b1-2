import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTodoDetail } from '../hooks/useTodoDetail';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../contexts/ToastContext';
import { Badge } from '../components/Badge';
import { Button, LinkButton } from '../components/Button';
import { DataState } from '../components/DataState';
import { EmptyState } from '../components/EmptyState';
import { deleteTodo, setTodoCompleted } from '../lib/todoApi';
import { formatDate, isOverdue, PRIORITY_LABEL, toErrorMessage } from '../lib/format';

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { todo, setTodo, status, error, reload } = useTodoDetail(id);

  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useDocumentTitle(todo?.title ?? '할 일');

  async function handleToggle() {
    if (!todo) return;
    setToggling(true);
    setActionError(null);
    try {
      const updated = await setTodoCompleted(todo.id, !todo.completed);
      setTodo(updated);
      showToast(updated.completed ? '완료로 표시했습니다.' : '완료를 취소했습니다.');
    } catch (err) {
      setActionError(toErrorMessage(err));
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!todo) return;
    if (!window.confirm(`'${todo.title}'을(를) 삭제할까요? 삭제하면 되돌릴 수 없습니다.`)) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteTodo(todo.id);
      showToast('할 일을 삭제했습니다.');
      navigate('/todos', { replace: true }); // 목록 페이지가 마운트되며 새로 조회 → 갱신
    } catch (err) {
      setActionError(toErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <section className="narrow">
      <Link to="/todos" className="back-link">
        목록으로
      </Link>

      <DataState
        status={status}
        error={error}
        onRetry={reload}
        isEmpty={!todo}
        empty={
          <EmptyState
            title="할 일을 찾을 수 없습니다."
            message="삭제되었거나 주소가 잘못되었습니다."
            action={<LinkButton to="/todos">목록으로 가기</LinkButton>}
          />
        }
      >
        {todo && (
          <article className={`detail ${todo.completed ? 'detail--done' : ''}`}>
            <h1 className="detail__title">
              <span className="strike">{todo.title}</span>
            </h1>

            <div className="todo-card__meta">
              <Badge tone={todo.completed ? 'done' : 'neutral'}>{todo.completed ? '완료' : '진행 중'}</Badge>
              <Badge tone={todo.priority}>우선순위 {PRIORITY_LABEL[todo.priority]}</Badge>
              {todo.due_date && (
                <Badge tone={isOverdue(todo) ? 'overdue' : 'neutral'}>마감 {formatDate(todo.due_date)}</Badge>
              )}
            </div>

            {todo.description ? (
              <p className="detail__desc">{todo.description}</p>
            ) : (
              <p className="detail__desc detail__desc--empty">메모가 없습니다.</p>
            )}

            <p className="detail__created">{formatDate(todo.created_at)}에 추가함</p>

            {actionError && (
              <div className="form__banner form__banner--error" role="alert">
                <strong>요청에 실패했습니다.</strong> {actionError}
              </div>
            )}

            <div className="button-row">
              <Button onClick={handleToggle} loading={toggling} disabled={deleting}>
                {todo.completed ? '완료 취소' : '완료로 표시'}
              </Button>
              <LinkButton to={`/todos/${todo.id}/edit`} variant="secondary">
                수정
              </LinkButton>
              <Button variant="danger" onClick={handleDelete} loading={deleting} disabled={toggling}>
                {deleting ? '삭제하는 중' : '삭제'}
              </Button>
            </div>
          </article>
        )}
      </DataState>
    </section>
  );
}
