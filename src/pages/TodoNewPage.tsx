import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../contexts/ToastContext';
import { PageHeader } from '../components/PageHeader';
import { TodoForm } from '../components/TodoForm';
import { createTodo } from '../lib/todoApi';
import type { TodoFormValues } from '../lib/types';

export default function TodoNewPage() {
  useDocumentTitle('새 할 일');
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSubmit(values: TodoFormValues) {
    const created = await createTodo(values); // 실패하면 throw → TodoForm 이 에러 표시
    showToast('할 일을 추가했습니다.');
    navigate(`/todos/${created.id}`);
  }

  return (
    <section className="narrow">
      <PageHeader title="새 할 일" description="제목만 적어도 저장할 수 있습니다." />
      <TodoForm submitLabel="할 일 추가" onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
    </section>
  );
}
