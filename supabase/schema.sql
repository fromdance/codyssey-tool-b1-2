-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.

create table if not exists public.todos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 100),
  description text check (char_length(description) <= 500),
  priority    text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date    date,
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- RLS 를 켜고, 과제용으로 anon 키에 CRUD 를 허용합니다.
-- (정책이 없으면 조회는 빈 배열, 삭제는 "성공처럼 보이지만 아무것도 안 지워지는" 현상이 생깁니다.)
-- 주의: 누구나 읽고 쓸 수 있는 설정입니다. 인증(보너스)을 붙이면 user_id 기준 정책으로 바꾸세요.
alter table public.todos enable row level security;

drop policy if exists "todos_select" on public.todos;
drop policy if exists "todos_insert" on public.todos;
drop policy if exists "todos_update" on public.todos;
drop policy if exists "todos_delete" on public.todos;

create policy "todos_select" on public.todos for select to anon, authenticated using (true);
create policy "todos_insert" on public.todos for insert to anon, authenticated with check (true);
create policy "todos_update" on public.todos for update to anon, authenticated using (true) with check (true);
create policy "todos_delete" on public.todos for delete to anon, authenticated using (true);
