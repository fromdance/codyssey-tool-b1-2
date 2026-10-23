import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Priority, TodoFormErrors, TodoFormValues } from '../lib/types';
import { DESCRIPTION_MAX, TITLE_MAX, validateTodo } from '../lib/validation';
import { toErrorMessage } from '../lib/format';
import { Button } from './Button';
import { Input, Select, TextArea, type SelectOption } from './FormField';

export const EMPTY_TODO: TodoFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
  completed: false,
};

const PRIORITY_OPTIONS: SelectOption<Priority>[] = [
  { value: 'high', label: '높음' },
  { value: 'medium', label: '보통' },
  { value: 'low', label: '낮음' },
];

interface TodoFormProps {
  initialValues?: TodoFormValues;
  submitLabel: string;
  /** 저장 요청. 실패하면 throw 해야 폼이 에러를 보여줍니다. */
  onSubmit: (values: TodoFormValues) => Promise<void>;
  onCancel?: () => void;
  showCompleted?: boolean;
}

/**
 * 등록/수정 공용 폼.
 * - 입력값은 모두 state 로 관리하는 controlled input 입니다.
 * - 입력 → setValues → 리렌더링 → 글자 수·에러 메시지가 즉시 바뀝니다.
 */
export function TodoForm({ initialValues = EMPTY_TODO, submitLabel, onSubmit, onCancel, showCompleted = false }: TodoFormProps) {
  const [values, setValues] = useState<TodoFormValues>(initialValues);
  const [errors, setErrors] = useState<TodoFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof TodoFormValues>(key: K, value: TodoFormValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    // 한 번 제출을 시도한 뒤부터는 입력할 때마다 다시 검증해서 에러가 바로 사라지게 합니다.
    if (submitted) setErrors(validateTodo(next));
  }

  const handleText =
    (key: 'title' | 'description' | 'due_date') =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(key, e.target.value);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setSubmitError(null);

    const nextErrors = validateTodo(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="form__banner form__banner--error" role="alert">
          <strong>저장하지 못했습니다.</strong> {submitError}
        </div>
      )}
      {errorCount > 0 && (
        <div className="form__banner form__banner--warn" role="alert">
          입력 내용을 확인하세요. 수정이 필요한 항목이 {errorCount}개 있습니다.
        </div>
      )}

      <fieldset className="form__fields" disabled={submitting}>
        <Input
          id="title"
          label="제목"
          required
          value={values.title}
          onChange={handleText('title')}
          error={errors.title}
          hint={`${values.title.trim().length} / ${TITLE_MAX}`}
          placeholder="예: 장보기 목록 정리하기"
          autoFocus
        />

        <TextArea
          id="description"
          label="메모"
          rows={5}
          value={values.description}
          onChange={handleText('description')}
          error={errors.description}
          hint={`${values.description.length} / ${DESCRIPTION_MAX}`}
          placeholder="필요한 준비물이나 참고할 내용을 적어 두세요."
        />

        <div className="form__row">
          <Select
            id="priority"
            label="우선순위"
            value={values.priority}
            options={PRIORITY_OPTIONS}
            onChange={(v) => update('priority', v)}
          />
          <Input
            id="due_date"
            label="마감일"
            type="date"
            value={values.due_date}
            onChange={handleText('due_date')}
            error={errors.due_date}
          />
        </div>

        {showCompleted && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={values.completed}
              onChange={(e) => update('completed', e.target.checked)}
            />
            완료한 일로 표시
          </label>
        )}
      </fieldset>

      <div className="form__actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            취소
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitting ? '저장하는 중' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
