import type { Todo } from '../lib/types';
import { TodoCard } from './TodoCard';

interface TodoListProps {
  todos: Todo[];
  onToggle: (todo: Todo) => void;
}

export function TodoList({ todos, onToggle }: TodoListProps) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  );
}
