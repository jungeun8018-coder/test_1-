import { NextResponse } from "next/server";
import { Resend } from "resend";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

// 문의를 받을 이메일 주소.
// Resend는 도메인을 인증하기 전(onboarding@resend.dev로 발신하는 테스트 단계)에는
// Resend 가입 이메일로만 발송을 허용합니다. 도메인을 인증한 뒤에는
// 아래 주소를 다시 "jjung8018@naver.com"(스튜디오 대표 메일)으로 바꿔주세요.
const CONTACT_TO_EMAIL = "jungeun8018@gmail.com";

// 도메인 인증 전에는 Resend 발신 주소를 이 값으로 둡니다 (Resend 기본 테스트 도메인).
// 나중에 studio 도메인을 Resend에 인증하면 "no-reply@bellavi-studio.com" 같은 주소로 바꿀 수 있습니다.
const CONTACT_FROM_EMAIL = "BellaVi Studio <onboarding@resend.dev>";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  program?: unknown;
};

const PROGRAM_NAMES = new Set([
  "취향한점",
  "나만의 엽서",
  "나만의 탁상용 캘린더 만들기"
]);

// program_inquiries 테이블의 program 컬럼은 CHECK 제약조건으로
// 'seasonal' | 'postcard' | 'calendar' | 'community' | 'general' 값만 허용합니다.
// 신청폼(site.js)은 화면에 보이는 한글 프로그램명을 그대로 보내오므로,
// Supabase에 저장할 때는 이 슬러그 값으로 변환해서 넣어야 합니다.
const PROGRAM_SLUGS: Record<string, string> = {
  "취향한점": "seasonal",
  "나만의 엽서": "postcard",
  "나만의 탁상용 캘린더 만들기": "calendar"
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
    return NextResponse.json(
      { error: "서버에 이메일 발송 설정이 되어 있지 않습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { name, email, message, program } = payload;

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(message)) {
    return NextResponse.json(
      { error: "이름, 이메일, 문의 내용을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email.trim())) {
    return NextResponse.json({ error: "이메일 주소 형식을 확인해주세요." }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const programName = typeof program === "string" && PROGRAM_NAMES.has(program)
    ? program
    : undefined;
  const subject = programName
    ? `[BellaVi Studio 프로그램 신청] ${programName} - ${name.trim()}님`
    : `[BellaVi Studio 문의] ${name.trim()}님으로부터`;

  try {
    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      replyTo: email.trim(),
      subject,
      text: `이름: ${name.trim()}\n이메일: ${email.trim()}\n\n문의 내용:\n${message.trim()}`
    });

    if (error) {
      console.error("Resend 발송 실패:", error);
      return NextResponse.json(
        { error: "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }

    // 이메일 발송 성공 이후 Supabase 저장을 시도합니다.
    // program_inquiries 테이블은 program 컬럼이 NOT NULL + CHECK 제약(허용 슬러그 값)이므로,
    // 프로그램 신청 폼(program 값이 있는 경우)에서만, 슬러그로 변환해서 저장합니다.
    // 저장이 실패하더라도 이메일은 이미 발송되었으므로 사용자에게는 성공으로 응답하되,
    // 실패 사실이 조용히 묻히지 않도록 응답의 supabaseSaved 플래그와 서버 로그에 남깁니다.
    let supabaseSaved = false;
    if (programName) {
      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        console.error(
          "[program_inquiries] Supabase 클라이언트를 생성하지 못해 INSERT를 건너뜁니다. " +
            "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수를 확인하세요."
        );
      } else {
        const insertPayload = {
          name: name.trim(),
          email: email.trim(),
          program: PROGRAM_SLUGS[programName] ?? programName,
          message: message.trim()
        };

        console.log("[program_inquiries] INSERT 시도:", insertPayload);

        const { data: insertedRow, error: insertError } = await supabase
          .from("program_inquiries")
          .insert(insertPayload)
          .select()
          .single();

        if (insertError) {
          console.error(
            "[program_inquiries] Supabase 저장 실패:",
            JSON.stringify(insertError, null, 2)
          );
        } else {
          supabaseSaved = true;
          console.log("[program_inquiries] Supabase 저장 성공:", insertedRow);
        }
      }
    }

    return NextResponse.json({ ok: true, supabaseSaved });
  } catch (err) {
    console.error("Resend 호출 중 오류:", err);
    return NextResponse.json(
      { error: "이메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
