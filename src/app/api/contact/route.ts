import { NextResponse } from "next/server";
import { Resend } from "resend";

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend 호출 중 오류:", err);
    return NextResponse.json(
      { error: "이메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
