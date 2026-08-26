import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ⚠️ 이 파일은 서버 전용입니다. SUPABASE_SERVICE_ROLE_KEY는 절대 클라이언트(브라우저) 번들에
// 포함되면 안 되므로, "use client" 컴포넌트나 클라이언트에서 import되는 파일에서 이 모듈을
// 불러오지 마세요. (NEXT_PUBLIC_ 접두사가 없는 환경변수는 원래 서버에서만 읽히지만,
// 실수 방지를 위해 이 파일 자체도 API route 등 서버 코드에서만 import 해야 합니다.)

// program_inquiries 테이블 컬럼과 정확히 일치하는 최소 타입 정의입니다.
// (전체 코드젠 대신, 이 프로젝트에서 실제로 쓰는 테이블만 직접 선언합니다.)
type ProgramInquiryRow = {
  id: string;
  name: string;
  email: string;
  program: string;
  message: string;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      program_inquiries: {
        Row: ProgramInquiryRow;
        Insert: Omit<ProgramInquiryRow, "id" | "created_at">;
        Update: Partial<Omit<ProgramInquiryRow, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Service role key를 사용하는 Supabase 서버 클라이언트를 반환합니다.
 * 환경변수가 없으면 null을 반환하고, 호출부에서 에러를 로그로 남기고 처리하도록 합니다.
 */
export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. .env.local(로컬) 또는 Vercel 환경변수를 확인하세요."
    );
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return cachedClient;
}
