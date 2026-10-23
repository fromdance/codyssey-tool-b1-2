/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** 새 키 체계: sb_publishable_... */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** 레거시 anon key (2026년 말 지원 종료 예정) */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
