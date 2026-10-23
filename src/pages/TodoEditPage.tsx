import { useNavigate, useParams } from 'react-router-dom';
import { useTodoDetail } from '../hooks/useTodoDetail';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../contexts/ToastContext';
import { DataState } from '../components/DataState';
import { EmptyState } from '../components/EmptyState';
import { LinkButton } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { TodoForm } from '../components/TodoForm';
import { updateTodo } from '../lib/todoApi';
import type { TodoFormValues } from '../lib/types';

export default function TodoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { todo, status, error, reload } = useTodoDetail(id);
  useDocumentTitle('할 일 수정');

  async function handleSubmit(values: TodoFormValues) {
    if (!id) return;
    await updateTodo(id, values);
    showToast('변경 사항을 저장했습니다.');
    navigate(`/todos/${id}`);
  }

  return (
    <section className="narrow">
      <PageHeader title="할 일 수정" />
      <DataState
        status={status}
        error={error}
        onRetry={reload}
        isEmpty={!todo}
        empty={
          <EmptyState
            title="수정할 할 일을 찾을 수 없습니다."
            action={<LinkButton to="/todos">목록으로 가기</LinkButton>}
          />
        }
      >
        {todo && (
          <TodoForm
            // 데이터가 도착한 뒤에 폼을 그리므로 initialValues 가 초기 state 로 정확히 들어갑니다.
            key={todo.id}
            initialValues={{
              title: todo.title,
              description: todo.description ?? '',
              priority: todo.priority,
              due_date: todo.due_date ?? '',
              completed: todo.completed,
            }}
            submitLabel="변경 사항 저장"
            showCompleted
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/todos/${todo.id}`)}
          />
        )}
      </DataState>
    </section>
  );
}
