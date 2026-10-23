import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;

// 새 키 체계: publishable key (sb_publishable_...) 를 씁니다.
// 레거시 anon key(eyJ... 로 시작하는 JWT)도 당분간 동작하므로 fallback 으로 둡니다.
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * secret key(sb_secret_...) 는 service_role 로 매핑되어 RLS 를 우회합니다.
 * 브라우저 번들에 그대로 박히므로 클라이언트에서는 절대 쓰면 안 됩니다.
 *
 * 여기서 바로 throw 하면 앱 전체가 흰 화면으로 죽어 원인을 알 수 없으므로,
 * 메시지만 담아 두고 요청 시점(getSupabase)에 에러 화면으로 보여 줍니다.
 */
const configError: string | null = publishableKey?.startsWith('sb_secret_')
  ? 'secret key 는 브라우저에서 사용할 수 없습니다. RLS 를 우회하는 키라 번들에 노출되면 위험합니다. publishable key(sb_publishable_...) 로 바꾸세요.'
  : !url || !publishableKey
    ? 'Supabase 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)가 설정되지 않았습니다.'
    : null;

// 설정이 잘못되면 클라이언트를 만들지 않습니다. (잘못된 키로 요청이 나가지 않도록)
export const supabase: SupabaseClient | null =
  configError === null ? createClient(url!, publishableKey!) : null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(configError ?? 'Supabase 클라이언트를 만들 수 없습니다.');
  }
  return supabase;
}
