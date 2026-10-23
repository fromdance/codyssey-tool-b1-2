import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Todo } from '../lib/types';
import { formatDate, isOverdue, PRIORITY_LABEL } from '../lib/format';
import { Badge } from './Badge';

interface TodoCardProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
}

/**
 * React.memo(보너스 2): 한 항목을 토글해도 props 가 바뀌지 않은 다른 카드는 다시 그리지 않습니다.
 * (onToggle 이 useCallback 으로 고정되어 있어야 효과가 있습니다)
 */
export const TodoCard = memo(function TodoCard({ todo, onToggle }: TodoCardProps) {
  const overdue = isOverdue(todo);

  return (
    <li className={`todo-card ${todo.completed ? 'todo-card--done' : ''} todo-card--${todo.priority}`}>
      <input
        type="checkbox"
        className="todo-card__check"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        aria-label={`${todo.title} ${todo.completed ? '완료 취소' : '완료로 표시'}`}
      />
      <div className="todo-card__body">
        <Link to={`/todos/${todo.id}`} className="todo-card__title">
          <span className="strike">{todo.title}</span>
        </Link>
        <div className="todo-card__meta">
          <Badge tone={todo.priority}>우선순위 {PRIORITY_LABEL[todo.priority]}</Badge>
          {todo.due_date && (
            <Badge tone={overdue ? 'overdue' : 'neutral'}>
              {overdue ? '기한 지남: ' : '마감 '}
              {formatDate(todo.due_date)}
            </Badge>
          )}
        </div>
      </div>
    </li>
  );
});
