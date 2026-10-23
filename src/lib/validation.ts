import type { TodoFormErrors, TodoFormValues } from './types';

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 500;

export function validateTodo(values: TodoFormValues): TodoFormErrors {
  const errors: TodoFormErrors = {};
  const title = values.title.trim();

  if (!title) errors.title = '제목을 입력하세요.';
  else if (title.length > TITLE_MAX) errors.title = `제목은 ${TITLE_MAX}자 이하로 입력하세요.`;

  if (values.description.length > DESCRIPTION_MAX) {
    errors.description = `메모는 ${DESCRIPTION_MAX}자 이하로 입력하세요.`;
  }

  if (values.due_date && Number.isNaN(Date.parse(values.due_date))) {
    errors.due_date = '올바른 날짜를 입력하세요.';
  }
  return errors;
}
