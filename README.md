# codyssey-tool-b1-2
Codyssey All-in-One &lt;AI 도구 학습 - B1-2> 버튼 누르면 화면이 스르륵 바뀌는 요즘 웹사이트 만들기

# 할 일 노트 (React + Supabase)

할 일을 등록/조회/수정/삭제하는 React 단일 페이지 애플리케이션입니다.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| UI | React 18, TypeScript |
| 라우팅 | React Router v6 |
| 빌드 | Vite 6 |
| 백엔드(BaaS) | Supabase (PostgreSQL, `@supabase/supabase-js` v2) |
| 스타일 | 순수 CSS (CSS 변수) |
| 배포 | Vercel |

## 로컬 실행 방법

Node.js 18 이상이 필요합니다.

```bash
# 1. 설치
npm install

# 2. 환경변수 파일 만들기
cp .env.example .env
# .env 에 Supabase 프로젝트의 URL 과 publishable key 입력

# 3. 개발 서버 실행 → http://localhost:5173
npm run dev

# 프로덕션 빌드 / 미리보기
npm run build
npm run preview
```

### Supabase 테이블 만들기

Supabase 대시보드 > SQL Editor 에서 `supabase/schema.sql` 내용을 실행합니다.  
`todos` 테이블과 RLS 정책(과제용으로 anon 에게 CRUD 허용)이 생성됩니다.

## 배포 (Vercel)

1. GitHub 저장소를 Vercel 에 Import (Framework Preset: Vite)
2. Settings > Environment Variables 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 등록
3. 변수를 추가/수정했다면 **Redeploy** (환경변수가 빌드 시점에 값이 들어가기 때문)
4. `vercel.json` 의 rewrite 설정 덕분에 `/todos/123` 에서 새로고침해도 404 가 나지 않습니다.
   (Netlify 는 `public/_redirects` 가 같은 역할)

## Docker로 실행하기
### 개발 모드 — 코드 수정이 바로 반영

```bash
# 명령줄 =================================
docker compose up dev

# docker compose =================================
   dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: todo-dev
    ports:
      - "5173:5173"
    env_file:
      - .env
    volumes:
      - .:/app
      # 호스트의 node_modules 가 컨테이너 것을 덮어쓰지 않도록 분리합니다.
      # (macOS 에서 설치한 바이너리는 리눅스 컨테이너에서 동작하지 않습니다)
      - /app/node_modules

# Dockerfile.dev =================================
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
# 종속성 파일을 기준으로 의존성 설치하되, 기존 node_modules 폴더 완전 삭제 후 설치
RUN npm ci

# 소스 코드는 compose에서 바인드 마운트를 통해 주입했기 때문에
# 바로 vite를 통한 빌드 실행
EXPOSE 5173
CMD ["npm", "run", "dev"]

```

- 접속: http://localhost:5173 또는 http://todo-dev.orb.local
- 소스가 바인드 마운트(`.:/app`)되어 있어 파일을 저장하면 HMR로 즉시 반영됩니다.
- `package.json`을 바꿨다면 이미지를 다시 만들어야 합니다: `docker compose up dev --build`

### 배포 모드 — 빌드 결과를 nginx로 서빙

```bash
# 명령줄 =================================
docker compose --profile prod up --build web

# docker compose =================================
  web:
    profiles: ["prod"]
    build:
      context: .
      dockerfile: Dockerfile
      args:
        # .env 값을 빌드 인자로 넘깁니다. 값이 바뀌면 --build 로 다시 빌드해야 합니다.
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_PUBLISHABLE_KEY: ${VITE_SUPABASE_PUBLISHABLE_KEY}
    container_name: todo-web
    ports:
      - "8080:80"

# Dockerfile =================================
# ───────── 1단계: 빌드 ─────────
FROM node:22-alpine AS build
WORKDIR /app

# 의존성만 먼저 복사하면, 소스만 바뀌었을 때 npm ci 캐시를 재사용합니다.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# [중요] Vite 는 빌드 시점에 환경변수를 코드에 박아 넣습니다.
# 따라서 런타임 -e 가 아니라 빌드 인자로 받아야 합니다.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# ───────── 2단계: 정적 파일 서빙 ─────────
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

```

- 접속: http://localhost:8080 또는 http://todo-web.orb.local
- Vercel에 올라가는 것과 같은 형태(정적 파일 + SPA fallback)로 확인할 수 있습니다.

OrbStack은 컨테이너마다 `<컨테이너명>.orb.local` 도메인을 자동으로 만들어 주고, `https://`로 바꿔 접속하면 인증서까지 처리해 줍니다. 포트 번호 없이 접속할 수 있습니다.

### 알아 둘 점

**Vite 환경변수는 빌드 시점에 코드에 박힙니다.** 런타임에 `-e`로 넘기면 반영되지 않기 때문에, 배포 모드에서는 `.env` 값을 빌드 인자(`args`)로 전달합니다. Supabase 키를 바꾸면 `--build`를 붙여 다시 빌드해야 합니다. 개발 모드는 Vite 개발 서버가 직접 `.env`를 읽으므로 `env_file`만으로 충분합니다.

**node_modules는 익명 볼륨으로 분리했습니다.** `.:/app` 하나만 마운트하면 macOS에서 설치한 `node_modules`가 컨테이너 것을 덮어써서, 플랫폼이 다른 바이너리(esbuild 등) 때문에 실행이 실패합니다.

**파일 감시는 폴링으로 설정했습니다.** 바인드 마운트에서는 파일 변경 이벤트가 컨테이너까지 전달되지 않는 경우가 있어 `vite.config.ts`에 `usePolling`을 켜 두었습니다. CPU 사용이 거슬리면 끄고 테스트해 보세요.

**nginx의 `try_files`가 SPA fallback입니다.** `vercel.json`의 rewrite와 같은 역할로, `/todos/123`에서 새로고침해도 404가 나지 않게 합니다.

### 자주 쓰는 명령

```bash
docker compose logs -f dev     # 로그 보기
docker compose exec dev sh     # 컨테이너 안으로 들어가기
docker compose down            # 정리
docker compose down -v         # 익명 볼륨까지 삭제 (node_modules 재설치)
```

## 라우트

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/` | HomePage | 남은 일/끝낸 일 요약, 먼저 볼 일 |
| `/todos` | TodoListPage | 목록, 완료 토글, 필터·검색·정렬 |
| `/todos/new` | TodoNewPage | 등록 폼 |
| `/todos/:id` | TodoDetailPage | 상세, 완료 토글, 삭제 |
| `/todos/:id/edit` | TodoEditPage | 수정 폼 |
| `*` | NotFoundPage | 잘못된 주소 |

## 폴더 구조

```
src/
├── pages/        라우트 단위 화면 (데이터를 가져오고 상태를 조합)
├── components/   재사용 UI (props 로 표시·동작이 달라짐)
│   ├── Layout, PageHeader
│   ├── Button / LinkButton, Input / TextArea / Select, Badge
│   ├── Loading, ErrorState, EmptyState, DataState
│   └── TodoCard, TodoList, TodoForm, FilterBar, ToastContainer
├── hooks/        useTodos, useTodoDetail, useDocumentTitle
├── contexts/     ToastContext (전역 알림 상태)
└── lib/          supabase 클라이언트, todoApi(CRUD), 검증, 포맷, 타입
```

## 기능 요구 사항
1. 프로젝트 기본 구성
   - [x] `pages`(라우트 단위 화면), `components`(재사용 컴포넌트), `hooks` 또는 `lib` (커스텀 훅/유틸)로 폴더 구조 분리
   - [x] 공통 레이아웃(헤더/네비게이션)이 주요 페이지에 적용 (`components/Layout.tsx`, `App.tsx` 참고)
   - [x] 단일 핵심 데이터(`할 일`) CRUD가 가능한 수준으로 서비스 주제 선정
2. 라우팅 (`react-router-dom` 사용)
   - [x] 최소 5개 이상 라우트 동작
      - 홈페이지 (`/`)
      - 할일 목록 페이지 (`/todos`)
      - 새 할일 추가 페이지 (`/todos/new`)
      - 특정 할일의 세부 내용 조회 페이지 (`/todos/:id`)
      - 특정 할일의 내용 수정 페이지 (`/todos/:id/edit`)
      - 이외의 페이지는 페이지 찾을수 없음 페이지 (`*`)
   - [x] 목록/상세 라우트 포함
   - [x] 잘못된 주소 Not Found 페이지 포함
   - [x] 네비게이션 통해 주요 라우트 이동 가능한 링크 제공 (`components/Layout.tsx`)
3. 컴포넌트 설계
   - [x] 최소 8개 이상의 `재사용 컴포넌트` 존재 (`components/` 안에 있는 모든 컴포넌트가 재사용 가능함)
   - [x] 페이지 컴포넌트 - UI 컴포넌트 분리(`components/`, `pages/`)
   - [x] 동일한 UI 패턴은 재사용 가능 컴포넌트로 통일 (`DataState.tsx`)
4. 상태 관리
   - 다음 상태들을 React 방식으로 관리
      - [x] 폼 입력 상태 (`TodoNewPage.tsx`의 `TodoFormValues`)
      - [x] 목록/상세 데이터 상태 (`useTodos.ts`, `useTodoDetail.ts`)
      - [x] 로딩/에러 상태 (`ErrorState.tsx`, `Loading.tsx`)
   - [x] 데이터 조회/갱신 흐름 중 하나 이상 커스텀 훅으로 분리
      - `useTodoDetail.ts`, `useTodos.ts`
5. CRUD
   - [x] CRUD는 Supabase의 원격 데이터 기준으로 동작
      - 목록 조회
      - 상세 조회
      - 등록/수정
      - 삭제
6. 폼 UX
   - [x] 등록/수정 폼에 필수값 검증 존재 (`lib/validiation.ts`)
   - [x] 에러 메시지가 입력 필드 근처에 표시 (`TodoForm.errors`)
   - [x] 제출 중에는 진행중 상태 표시 (`TodoForm.tsx`)
   - [x] 요청 실패시 실패 사실 화면에 표시 (`TodoForm.submitError`)
7. React 이벤트 & 렌더링
   - [x] 사용자 이벤트(클릭/입력/제출 등)가 상태 변경으로 이어지고, 렌더링이 변하는 흐름 명확
   - [x] 상태 변경이 렌더링 변화로 이어지는 지점 최소 3군데
      1. 필터 탭/검색어/정렬 변경 → `useMemo` 로 `visibleTodos` 재계산 → 목록 변경
      2. 제목/메모 입력 → 글자 수 표시 즉시 변경, 제출 후에는 에러 메시지가 실시간으로 사라짐
      3. 체크박스 클릭 → 낙관적 업데이트로 줄긋기/개수 변경, 실패 시 원래대로 복구
      4. 저장/삭제 성공 → 전역 알림 표시 + 페이지 이동
8. 배포
   - [x] 배포된 URL에서 아래 흐름 모두 동작
      - 목록/상세 조회
      - 등록/수정/삭제
## 과제 목표
### React에서 컴포넌트가 왜 필요한지, 그리고 본인이 어떤 기준으로 컴포넌트를 쪼갰는지 설명할 수 있다.
- 컴포넌트가 왜 필요한지
   - UI를 구성하는 요소들을 각각의 책임을 처리하는 단일 요소로 분리하여, 코드베이스를 깔끔하고 유지보수하기 쉽게 만들기 위해
   - 단일 책임을 처리하는 컴포넌트를 애플리케이션의 여러 부분, 또는 다른 프로젝트에서 재사용할 수 있기 때문에
   - 컴포넌트 트리 구조로 설계하면, 관련 없는 부분에 영향을 주지 않고도 기능을 쉽게 추가/수정/제거할 수 있기 때문에
- 어떤 기준으로 쪼갰는지
   - 먼저, 큰 기틀을 잡을 **페이지 컴포넌트**(`pages/`)와 페이지를 구성할 **UI 컴포넌트**(`components/`)로 구분.
   - 이후, *UI 컴포넌트중에서* 두 번 이상 쓰이는 표준적인 요소들(`Button`, `Badge`), 모든 화면에서 동일해야 하는 요소들(`Loading`, `ErrorState`, `EmptyState`)을 분리함.
   - 특히, 틍록/수정의 경우 폼을 사용하는 것은 동일하기 때문에 `TodoForm`을 공유하되, `initialValues`(Form 내부 Input에 미리 채워놓을 값), `submitLabel`, `onSubmit` props만 다르게 주입함.

### props와 state의 차이, 그리고 상태를 어디에 두었는지(상향/하향 흐름) 설명할 수 있다.
- `props`와 `state`의 차이
   - 공통점
      - 둘 모두 Javascript 객체
      - 둘 모두 렌더링 업데이트를 유발함
   - `props`: `부모 컴포넌트`로부터 주입받는 값 (`함수 매개변수`와 유사)
      - 수신한 컴포넌트 입장에서는 `불변`임
      - 부모 컴포넌트에서 새 `props`를 내려주면 자식이 리렌더링
   - `state`: 해당 state를 `선언한 컴포넌트`에서 관리하는 값 (`함수 내에 선언된 변수`와 유사)
      - 선언한 컴포넌트내에서 자유롭게 수정할 수 있음
      - `setState()`등을 이용해 값 변경시 해당 컴포넌트 리렌더링
- 상태를 어디에 두었는지(상/하향 흐름)
   - `TodoForm`
      - 폼에 채운 값들(`values`), 검증 에러 메시지들(`errors`), 제출 여부(`submitted`), 제출 진행중인지 여부(`submitting`), 제출시 발생한 에러 메시지(`submitError`)
         - 하위 `FormField` 컴포넌트들에게 `values`, `onChange`(상태 업데이트 함수인 `handleText`), `error`, `hint` 와 같은 `props` 내려줌
   - `ToastContext`
      - 할일 등록/삭제 결과를 알려주는 토스트 객체 배열(`ToastItem[]`)
      - `ToastItem[]`를 비롯해 `showToast`, `dismissToast` 함수를 함께 `ContextProvider`의 value로 넘김
         - 해당 Provider가 `<App />`의 부모 컴포넌트이기 때문에, 전역변수로 역할함 (알림은 페이지를 이동해도 남아야하기 때문에 앱 최상단에 둠)
   - `useTodoDetail`
      - 조회한 할일(`todo`), 불러오기 상태(`status`), 에러메시지(`error`), 재조회를 위한 키(`reloadKey`)
      - 할일 상세조회 페이지(`TodoDetailPage`), 할일 수정 페이지(`TodoEditPage`)에서 단일 할일 객체 조회를 위해 사용
   - `useTodos`
      - 조회한 할일 목록(`todos`), 불러오기 상태(`status`), 에러메시지(`error`), 재조회를 위한 키(`reloadKey`)
      - 홈페이지(`HomePage`)와 할일 목록 조회 페이지(`TodoListPage`)에서 할일 목록 조회를 위해 사용
   - `TodoDetailPage`
      - 삭제중인지 상태(`deleting`), 완료처리중인지 상태(`toggling`), 요청중 발생한 에러(`actionError`)
      - 전역에서 토스트 보여주는 함수(`showToast`), 페이지 제목 바꾸는 함수(`useDocumentTitle`), 단일 할일 조회 결과(`useTodoDetail`)를 외부로부터 받음
   - `TodoListPage`
      - 필터 상태(`statusFilter`), 검색할 단어(`query`), 정렬 기준(`sort`)
      - 할일 목록 기능(`useTodos`), 토스트 보여주는 함수(`showToast`) 를 외부로부터 받음
### useEffect가 언제 실행되고, 어떤 의존성으로 동작하며, 데이터 요청과 어떤 관계가 있는지 설명할 수 있다.
- `useEffect`가 실행되는 시점
   - 컴포넌트가 `처음 렌더링될 때` 실행되며, `의존성 배열`에 *특정 값이 있을 경우,* 해당 값이 `이전과 다를때마다` 다시 실행됨
   - 의존성을 생략할 경우, 컴포넌트가 리렌더링될 때마다 실행됨
- `useEffect`의 의존성
   - `useDocumentTitle`: 훅의 인자로 주어지는 `title`이 바뀔때마다 재실행
   - `useTodoDetail`: 훅의 인자로 주어지는 할일의 `id`와, `reload` 호출 횟수를 나타내는 `reloadKey`가 바뀔때마다 재실행
   - `useTodos`: `reload` 호출 횟수를 나타내는 `reloadKey`가 바뀔때마다 재실행
- 데이터 요청과의 관계
   - `useTodoDetail`와 `useTodos`의 경우, 할일(목록) 조회를 다시 시도하는 케이스와 연관이 있음
   - 할일(목록)에 대응되는 `<DataState>`에서 로딩이 실패할경우, 재시도 버튼을 표시하는 `<ErrorState>`를 렌더링하는데, 이때 재시도 버튼 클릭시 호출되는 함수가 `reloadKey`를 증가시키는 `reload` 함수임
   - 훅에서는 `reloadKey`가 증가했으니, 할일(목록) 조회를 재시도하게 됨
### 비동기 흐름에서 로딩/성공/실패/빈 상태를 React UI로 어떻게 표현했는지 설명할 수 있다.
### “하나의 기능”을 만들기 위해 라우팅 → 컴포넌트 → 상태 → 이벤트 → 렌더링이 어떻게 연결되는지 설명할 수 있다.

### 로딩/성공/실패/빈 상태
- 훅은 `status: 'loading' | 'success' | 'error'` 와 `error` 를 돌려주고, 모든 페이지는 `DataState` 에 넘깁니다.
- `DataState` 가 로딩 → 에러(다시 시도 버튼) → 빈 상태 → 내용 순으로 분기합니다.
- 등록·수정·삭제 실패는 폼 상단/상세 하단 배너로, 목록 토글 실패는 에러 알림으로 표시합니다.

### 상태 변경 → 렌더링 변화 지점
1. 필터 탭·검색어·정렬 변경 → `useMemo` 로 `visibleTodos` 재계산 → 목록 변경
2. 제목·메모 입력 → 글자 수 표시 즉시 변경, 제출 후에는 에러 메시지가 실시간으로 사라짐
3. 체크박스 클릭 → 낙관적 업데이트로 줄긋기·개수 변경, 실패 시 원래대로 복구
4. 저장/삭제 성공 → 전역 알림 표시 + 페이지 이동

### 한 기능의 흐름 (예: 할 일 수정)
`/todos/:id/edit` 라우트 → `TodoEditPage` 가 `useTodoDetail(id)` 로 조회 → `DataState` 가 로딩 표시 → 성공하면 `TodoForm` 에 초기값 전달 → 입력 이벤트로 state 변경 → 제출 이벤트에서 검증 후 `updateTodo` 호출(버튼 스피너) → 성공 시 알림 + 상세로 이동, 실패 시 배너 표시.

## 보너스 구현
- **전역 상태**: `ToastContext` 로 알림 관리
- **성능 최적화**: `TodoCard` 에 `React.memo`, 핸들러에 `useCallback`, 목록 계산과 Context value 에 `useMemo`