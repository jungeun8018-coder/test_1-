import { ImageResponse } from "next/og";

/**
 * 소셜/메신저 링크 공유용 Open Graph 이미지 (1200x630).
 * next/og(ImageResponse)로 빌드 시 정적 생성되며, 사이트 전체 기본 og:image 로 사용됩니다.
 * Satori 기본 폰트에는 한글 글리프가 없어 텍스트는 영문으로만 구성합니다.
 * twitter:image 도 이 이미지를 재사용합니다.
 */
export const alt = "BellaVi Studio — Art for a Beautiful Life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: "#faf6f0",
          color: "#3a2f28"
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#8c4a32"
          }}
        >
          Art for a Beautiful Life
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 132,
            fontWeight: 600,
            letterSpacing: -3
          }}
        >
          BellaVi Studio
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 34, color: "#6b5b4d" }}>
          Fine Art · Illustration · Art &amp; Education
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 60,
            width: 132,
            height: 6,
            background: "#c98a6c"
          }}
        />
      </div>
    ),
    { ...size }
  );
}
