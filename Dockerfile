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
