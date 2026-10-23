import { getSupabase } from './supabase';
import type { Todo, TodoFormValues } from './types';

const TABLE = 'todos';

/** 폼 값 → DB 저장 형태 (빈 문자열은 null 로) */
function toPayload(values: TodoFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    priority: values.priority,
    due_date: values.due_date || null,
    completed: values.completed,
  };
}

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Todo[];
}

/** 없으면 null 을 돌려줍니다 (→ 화면에서 '찾을 수 없음' 처리) */
export async function fetchTodo(id: string): Promise<Todo | null> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Todo | null;
}

export async function createTodo(values: TodoFormValues): Promise<Todo> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .insert(toPayload(values))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Todo;
}

export async function updateTodo(id: string, values: TodoFormValues): Promise<Todo> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .update(toPayload(values))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Todo;
}

export async function setTodoCompleted(id: string, completed: boolean): Promise<Todo> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .update({ completed })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw new Error(error.message);
  // RLS 정책이 없으면 에러 없이 0건 삭제되므로 직접 확인합니다.
  if (!data || data.length === 0) {
    throw new Error('삭제된 항목이 없습니다. 이미 삭제되었거나 삭제 권한이 없습니다.');
  }
}
