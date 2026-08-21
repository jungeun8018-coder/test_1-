# BellaVi Studio Next.js 전환 계획

> 작성일: 2026-08-18  
> 현재 단계: 기존 정적 사이트 분석 및 전환 계획 수립  
> 이번 단계에서 수행한 변경: `plan.md` 작성만 수행. 기존 HTML, CSS, JavaScript, 이미지 및 문서 파일은 수정·이동·삭제하지 않음. Next.js 설치도 수행하지 않음.

## 1. 목표와 전환 원칙

BellaVi Studio의 기존 정적 웹사이트를 최신 안정 버전의 Next.js와 App Router 기반으로 전환한다. 전환 후에도 다음 항목이 빠짐없이 유지되어야 한다.

- 현재 보이는 모든 페이지, 섹션, 메뉴, 문구, 작품 정보, 이미지, 링크, 메일 링크
- 데스크톱·태블릿·모바일 레이아웃과 현재의 색상, 폰트, 여백, 이미지 비율, 반응형 동작
- 모바일 메뉴, 스크롤 헤더, 등장 애니메이션, 맨 위로 버튼, 작품 라이트박스, 홈의 계절 전환 효과
- 접근성 속성, 스킵 링크, 키보드 조작, 모션 감소 설정, 이미지 대체 텍스트
- 기존 `.html` 주소로 들어오는 방문자와 외부 링크를 위한 리디렉션

전환은 다음 원칙을 따른다.

1. **콘텐츠 및 시각적 동등성 우선**: 초기 구현에서는 기존 마크업 구조와 CSS를 최대한 보존한다.
2. **점진적 전환**: 기존 정적 파일은 검수 완료 전까지 삭제하지 않고 비교 기준으로 유지한다.
3. **Server Component 우선**: 정적인 페이지 본문은 Server Component로 만들고, 브라우저 상태나 DOM API가 필요한 최소 영역만 Client Component로 분리한다.
4. **데이터와 표현 분리**: 반복되는 작품, 프로그램, 경력, 내비게이션 데이터는 타입이 있는 데이터 파일로 추출하되, 기존 문구를 임의로 수정하지 않는다.
5. **현재 HTML을 표시 콘텐츠의 기준으로 사용**: `content.md`와 HTML이 다를 경우 현재 실제 화면을 구성하는 HTML을 우선한다. 불일치는 별도 확인 목록으로 관리한다.
6. **검증 전 리팩터링 금지**: CSS 정리, 파일명 변경, 이미지 압축은 먼저 동일 화면을 재현한 뒤 별도 단계에서 진행한다.

## 2. 공식 Next.js 기준

2026-08-18 기준 공식 자료에서 확인한 적용 기준은 다음과 같다.

- 전환 실행 시점에 npm 레지스트리의 `next@latest`와 공식 문서를 다시 확인해 **Next.js 16.3.1**을 적용했다. Preview/Canary 버전은 사용하지 않는다.
- App Router와 TypeScript를 사용한다.
- 애플리케이션 코드는 `src/` 아래에 둔다.
- 최소 Node.js 요구사항은 `20.9` 이상이며, 실제 전환 시 Node.js LTS 버전을 확인한다.
- Turbopack은 개발 및 빌드의 기본 번들러로 사용한다.
- 기존 Google Fonts 링크는 `next/font/google`의 `Cormorant_Garamond`, `Noto_Sans_KR`로 대체하여 자체 호스팅하고 레이아웃 이동을 줄인다.
- 정적 이미지는 `public/images`에 두고 `next/image`를 기본으로 사용한다. 원본의 `object-fit`, `object-position`, 종횡비와 크롭 결과가 바뀌지 않도록 페이지별로 검증한다.
- 페이지별 `<title>`과 description은 App Router Metadata API로 이전한다.

참고 문서:

- [Next.js App Router](https://nextjs.org/docs/app)
- [설치 및 `src` 디렉터리 구성](https://nextjs.org/docs/app/getting-started/installation)
- [프로젝트 구조](https://nextjs.org/docs/app/getting-started/project-structure)
- [Font Module](https://nextjs.org/docs/app/api-reference/components/font)
- [Metadata와 OG 이미지](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [리디렉션](https://nextjs.org/docs/app/guides/redirecting)
- [Next.js 공식 릴리스 및 보안 공지](https://nextjs.org/blog)

## 3. 현재 프로젝트 분석 결과

### 3.1 파일 규모

| 구분 | 현재 상태 |
|---|---:|
| HTML | 20개: 실제 페이지 18개, 메타 리프레시 리디렉션 2개 |
| CSS | `style.css` 1개, 917줄, 약 72 KB |
| JavaScript | `script.js` 1개, 450줄, 약 19 KB |
| 이미지 | 42개, 약 112.37 MiB |
| 콘텐츠/기획 문서 | `content.md`, `bellavi-website-brief.md`, `README.md` |
| 기타 | `hello.txt` |
| 패키지/프레임워크 설정 | 없음 (`package.json`, Next.js 설정, `src` 디렉터리 모두 아직 없음) |

이미지에는 회화 9점, 일러스트 4점, 미술교육 5점, 작가 프로필 2점, 여행·강연 사진 9점, 홈 계절 히어로 및 후보 이미지 10점, 계절 파티클 3점이 포함되어 있다. 큰 원본은 약 12 MB 및 8,978 × 9,776 px까지 있으므로 전환 후 이미지 최적화 효과를 검증하되 원본은 보존한다.

### 3.2 공통 디자인 시스템

- 브랜드 색상 토큰: sage, sage-dark, olive, ivory, beige, brown, ink, white, line
- 폰트: `Cormorant Garamond` 500/600, `Noto Sans KR` 400/500/600
- 공통 구조: 스킵 링크, 고정 헤더, 로고, 8개 주 메뉴, 본문, 공통 푸터, 맨 위로 버튼
- 주 메뉴: Home, About, Artist, Works, Programs, Shop, Beyond the Canvas, Contact
- 대표 반응형 기준: 370, 600, 700, 800, 960px 및 hover/pointer 조건
- 디자인 특성: 최대 폭 중심 레이아웃, 넓은 여백, ivory/beige 배경, 세리프 제목, 얇은 구분선, 절제된 그림자와 모션
- `prefers-reduced-motion` 사용 시 스크롤 및 애니메이션을 최소화하는 스타일이 이미 존재함

현재 `style.css`는 초기 공통 스타일 뒤에 페이지별 개선 스타일이 여러 차례 덧붙은 구조이며 `:root` 토큰도 두 번 정의되어 있다. 첫 전환에서는 cascade 순서를 그대로 유지하고, 화면 동등성이 확보된 뒤 토큰과 페이지 스타일을 정리한다.

### 3.3 페이지 및 라우트 인벤토리

아래의 모든 실제 페이지를 Next.js 페이지로 이전한다. 새 URL은 확장자가 없는 일관된 경로를 사용하고, 기존 URL은 영구 리디렉션으로 보존한다.

| 기존 파일 | 제안 Next.js 경로 | 주요 콘텐츠/역할 |
|---|---|---|
| `index.html` | `/` | 계절 히어로, 4단계 여정, 4개 Portfolio 카드, 브랜드 소개, 작가 소개, Contact CTA |
| `about.html` | `/about` | 브랜드 철학, 3개 가치, 예술과 교육, 서로 다른 감각, 브랜드 마무리 문구 |
| `teacher.html` | `/artist` | 작가 소개, 작업 세계, 학력, 전시·수상 이력, 활동 영역 |
| `works.html` | `/works` | Fine Art 8점, Illustration 4점, 작업 분야·문의, Art & Education 5점 |
| `gallery.html` | `/gallery` | 회화 8점의 상세 메타데이터와 라이트박스가 있는 독립 페이지 |
| `illustration.html` | `/illustration` | 일러스트 4점, 작업 가능 분야, 외부 포트폴리오·문의 CTA |
| `programs.html` | `/programs` | 프로그램 컬렉션, 계절 드로잉·엽서·캘린더, 커뮤니티, 문의 CTA |
| `program-seasonal.html` | `/programs/seasonal` | 계절 드로잉 — 취향한점 상세, 대상·경험·운영 방식, 메일 신청 |
| `program-postcard.html` | `/programs/postcard` | 3개월 엽서 프로그램 단계와 결과물 |
| `program-calendar.html` | `/programs/calendar` | 6개월 캘린더 프로그램 단계와 결과물 |
| `program-community.html` | `/programs/community` | 봄·여름·정기전시·겨울의 연간 커뮤니티 타임라인 |
| `shop.html` | `/shop` | 엽서·캘린더 상품 프리뷰, 준비 중 상태, 프로그램 연결 |
| `beyond.html` | `/beyond` | Journal, Art Journey, People 아카이브 진입점 |
| `journal.html` | `/journal` | 4개 글 카테고리와 네이버 블로그 글 링크 |
| `journey.html` | `/journey` | 여행 사진 6점, 사진별 제목·설명, 블로그 링크 |
| `people.html` | `/people` | 교육과 사람에 관한 2개 기록, 준비 중 항목, Instagram 연결 |
| `notes.html` | `/notes` | 사람과 삶에 관한 3개 기록, 준비 중 항목, Blog·Instagram 연결 |
| `contact.html` | `/contact` | 문의 안내, 이메일, Instagram, Blog, 산그림 포트폴리오 |
| `program-adult-drawing.html` | `/programs/postcard`로 리디렉션 | 현재 `program-postcard.html`로 보내는 레거시 주소 |
| `program-art-class.html` | `/programs/calendar`로 리디렉션 | 현재 `program-calendar.html`로 보내는 레거시 주소 |

`gallery.html`, `illustration.html`, `notes.html`은 현재 내부 진입 링크가 없거나 제한적이지만 직접 접근 가능한 완성 페이지이므로 제거하거나 합치지 않고 그대로 이전한다.

### 3.4 외부 연결

아래 링크와 동작을 원문 및 URL 인코딩까지 유지한다.

- 이메일: `jjung8018@naver.com`
- Instagram: `https://instagram.com/jungeun__illust`
- Naver Blog: `https://blog.naver.com/jungeun__art` 및 개별 글 4개
- 산그림 포트폴리오: `https://www.picturebook-illust.com/author-gallery/room/71600`
- 계절 드로잉 신청 메일의 사전 입력 subject/body
- 일러스트 외주 및 협업 문의 메일의 사전 입력 subject
- 새 창 링크의 `target="_blank"` 및 `rel="noopener noreferrer"`

## 4. JavaScript 기능 이전 명세

### 4.1 공통 헤더와 모바일 메뉴

- 960px 미만에서 햄버거 메뉴 사용
- 열림/닫힘에 따라 `aria-expanded`, `aria-label`, 내비게이션 `open`, 헤더 `menu-active`, body `menu-open` 상태 동기화
- 메뉴 링크 클릭 및 Escape 키 입력 시 닫기
- 스크롤 30px 초과 시 헤더 `scrolled` 상태 적용
- 현재 페이지에 맞는 `aria-current="page"` 또는 섹션 페이지의 적절한 현재 위치 표시

Next.js에서는 현재 경로를 읽는 작은 Client Component로 구현한다. 모바일 메뉴가 열렸을 때 포커스 이동, 포커스 복귀, 배경 스크롤 잠금까지 검증한다.

### 4.2 스크롤 등장 효과와 맨 위로 버튼

- `.reveal` 요소를 `IntersectionObserver` threshold `0.12`로 한 번만 노출
- `prefers-reduced-motion: reduce`에서는 즉시 노출
- 스크롤 500px 초과 시 맨 위로 버튼 노출
- 클릭 시 부드럽게 최상단 이동, 모션 감소 설정에서는 즉시 이동

### 4.3 작품 라이트박스

- `works`, `gallery`, `illustration` 페이지의 작품 버튼에서 사용
- 원본 이미지와 캡션 표시
- 닫기 버튼, 배경 클릭, Escape 키로 닫기
- 작품 이미지 alt를 확대 이미지에도 유지
- `<dialog>` 기반 접근성, 열린 동안 포커스 제한, 닫힌 후 트리거로 포커스 복귀 검증

### 4.4 홈 계절 히어로

현재 홈의 가장 복잡한 기능이므로 별도 Client Component로 그대로 이전한다.

- 계절 순서: spring → summer → autumn → winter
- 쿼리 파라미터 `?season=spring|summer|autumn|winter`로 시작 계절 미리보기
- 계절당 8초, 이미지 전환 1초, 다음 이미지 preload 및 decode
- 히어로 왼쪽 클릭 시 이전 계절, 오른쪽 클릭 시 다음 계절
- 링크·버튼 등 인터랙티브 요소 클릭은 계절 변경에서 제외
- spring: 꽃잎 최대 6개, 낙하·흔들림 효과
- summer: 꽃과 테이블 영역의 고정 반짝임·하이라이트 시퀀스
- autumn: 6개 구역을 순환하는 낙엽 효과
- winter: 최대 8개의 눈송이 효과
- 계절별 이미지와 파티클 에셋, 랜덤 크기·위치·지속시간, CSS 커스텀 속성 유지
- 모션 감소 설정 시 자동 순환과 파티클 중지, 설정 변경 이벤트에 즉시 반응
- 컴포넌트 해제 시 모든 timeout, listener, 생성 요소 정리

### 4.5 기타 현재 상태

- `script.js`에는 FAQ, 카테고리 필터, `[data-year]` 기능 코드가 있으나 현재 HTML에는 대응 요소가 없다.
- 이는 현재 화면에서 실행되는 기능은 아니므로 새 UI를 임의로 만들지 않는다. 전환 시 공통 기능 목록에 기록하고, 향후 해당 UI가 추가될 때 재사용 가능한 컴포넌트로 구현한다.
- Shop의 두 구매 버튼은 `disabled`이고 “준비 중입니다” 상태이므로 결제 기능을 새로 추가하지 않고 현재 상태를 유지한다.

## 5. 이미지와 콘텐츠 이전 계획

1. 42개 이미지를 파일명과 원본 바이트를 유지한 채 `public/images`로 복사한다. 원본 `images` 폴더는 검수 완료 전까지 남긴다.
2. 파일명, 사용 페이지, alt, 원본 크기, 표시 비율, 우선 로딩 여부를 가진 에셋 매니페스트를 만든다.
3. 홈 첫 히어로만 priority/preload 대상으로 두고, 화면 아래 및 갤러리 이미지는 지연 로딩한다.
4. `next/image` 적용 시 현재 CSS의 `object-fit`과 `object-position`을 보존하고 각 화면 크기의 크롭을 비교한다.
5. 이미지 용량 최적화는 Next.js 런타임 최적화를 먼저 사용한다. 원본 리사이즈·재인코딩·파일 삭제는 별도 승인과 시각 검수 없이 하지 않는다.
6. 현재 사용되지 않는 것으로 확인된 8개 이미지도 삭제하지 않는다.
   - `beyond-canvas-art-journey-swiss.jpg`
   - `beyond-canvas-lecture-asc-02.jpg`
   - 여름 히어로 후보 5개
   - `painting-unexpressed-hanji-2019.jpg`
7. 공백이 들어간 여행 이미지 파일 2개는 우선 그대로 유지하고 URL 인코딩을 검증한다. 파일명 정규화가 필요하면 매니페스트를 이용해 모든 참조를 한 번에 변경한다.
8. 작품·일러스트·교육·프로그램·외부 링크 데이터는 `src/content`의 타입이 있는 객체로 추출해 중복을 줄이되 화면 문구는 현재 HTML과 문자 단위로 대조한다.

## 6. 현재 발견된 불일치와 처리 원칙

아래 항목은 Next.js 전환 때문에 생기는 문제가 아니라 현재 복사본에 이미 존재하는 상태다. 전환 작업 중 조용히 덮어쓰지 않고 별도 체크리스트로 관리한다.

1. `index.html`의 `about.html#artist-educator` 링크에 대응하는 ID가 `about.html`에 없다. 현재 의도와 가장 가까운 대상은 Artist 페이지의 `#artist-practice`이므로, 전환 전에 링크 목적을 확인한 뒤 `/artist#artist-practice` 또는 다른 승인된 위치로 수정한다.
2. `content.md`는 `images/gallery1.jpg`부터 `gallery5.jpg`까지 존재하지 않는 파일을 참조한다. 실제 HTML은 현재 존재하는 구체적인 작품 파일명을 사용하므로 HTML을 우선한다.
3. `content.md`의 작품·소개 내용은 현재 HTML보다 오래된 구조다. 자동 변환 소스로 직접 사용하지 말고 비교 자료로만 사용한다.
4. `painting-abstract-breath-ceramic-50x70cm-2019.jpg` 파일명에는 2019가 들어가지만 현재 페이지 표시 연도는 2021이다. 임의로 교정하지 않고 현재 화면의 2021을 유지한 뒤 사실 확인 항목으로 남긴다.
5. 푸터 연도는 모든 실제 페이지에서 2026으로 고정되어 있고 `[data-year]`는 사용되지 않는다. 동일 표시를 우선 재현하고, 동적 연도로 바꿀지는 별도 결정한다.

## 7. 제안 프로젝트 구조

```text
project-root/
├─ public/
│  └─ images/                    # 기존 이미지 42개 보존
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx             # lang, font, 공통 metadata, Header/Footer
│  │  ├─ globals.css            # 초기에는 기존 cascade 순서 보존
│  │  ├─ page.tsx               # Home
│  │  ├─ about/page.tsx
│  │  ├─ artist/page.tsx
│  │  ├─ works/page.tsx
│  │  ├─ gallery/page.tsx
│  │  ├─ illustration/page.tsx
│  │  ├─ programs/
│  │  │  ├─ page.tsx
│  │  │  ├─ seasonal/page.tsx
│  │  │  ├─ postcard/page.tsx
│  │  │  ├─ calendar/page.tsx
│  │  │  └─ community/page.tsx
│  │  ├─ shop/page.tsx
│  │  ├─ beyond/page.tsx
│  │  ├─ journal/page.tsx
│  │  ├─ journey/page.tsx
│  │  ├─ people/page.tsx
│  │  ├─ notes/page.tsx
│  │  ├─ contact/page.tsx
│  │  └─ not-found.tsx
│  ├─ components/
│  │  ├─ layout/                 # SiteHeader, Navigation, Footer, SkipLink
│  │  ├─ ui/                     # Button, SectionHeading, BackToTop, Reveal
│  │  ├─ works/                  # WorkGrid, ArtworkCard, ArtworkLightbox
│  │  ├─ programs/               # ProgramCard, ProgramProcess, Timeline
│  │  └─ seasonal-hero/          # 계절 상태, 효과, 이미지 레이어
│  ├─ content/                   # navigation, works, programs, history, links
│  ├─ hooks/                     # 필요한 클라이언트 전용 훅
│  ├─ lib/                       # URL·메일 링크·공통 유틸리티
│  └─ types/                     # 콘텐츠 및 컴포넌트 타입
├─ next.config.ts
├─ package.json
├─ tsconfig.json
├─ eslint.config.mjs
└─ 기존 정적 파일들              # 최종 승인 전까지 비교 기준으로 유지
```

초기에는 글로벌 CSS 한 파일로 시각적 동등성을 먼저 확보한다. 검증 후에만 공통 토큰, 레이아웃, 페이지별 스타일 또는 CSS Modules로 나눈다. Tailwind CSS는 현재 디자인 시스템과 기존 기획서의 “No Tailwind” 기준을 존중해 사용하지 않는다.

## 8. 단계별 실행 계획

### Phase 0. 전환 직전 기준선 고정

- Git 상태와 현재 파일 체크섬 기록
- 20개 HTML의 title, description, heading, 링크, 이미지, alt, ARIA 인벤토리 생성
- 현재 사이트를 로컬 정적 서버로 실행해 대표 화면 스크린샷 저장
- 화면 폭 1440, 1024, 768, 390, 360px 기준 캡처
- 메뉴, 라이트박스, 계절 전환, 외부 링크, 메일 링크를 영상 또는 체크리스트로 기록
- 42개 이미지 매니페스트와 누락·미사용 목록 확정

### Phase 1. Next.js 기반 구성

- 비어 있지 않은 현재 폴더에 `create-next-app`을 직접 덮어쓰지 않는다.
- 별도 임시 폴더에 최신 안정 버전으로 TypeScript, ESLint, App Router, `src`, npm, `@/*`, no-Tailwind 설정을 생성한 뒤 필요한 설정 파일만 현재 프로젝트에 안전하게 반영한다.
- `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `src/app` 작성
- `next/font/google`로 두 폰트를 설정하고 기존 CSS 변수에 연결
- `public/images`에 원본 이미지 복사
- Metadata 기본값, 한국어 `lang="ko"`, viewport 기본 동작 확인
- 기존 파일은 이 단계에서도 삭제하지 않음

### Phase 2. 공통 셸 및 스타일 이전

- Root Layout, SkipLink, SiteHeader, Navigation, Footer, BackToTop 구현
- 현재 CSS를 cascade 순서 그대로 `globals.css`에 이전
- 내부 링크를 `next/link`로 교체하고 현재 메뉴 표시 구현
- 공통 최대 폭, 배경, 타이포그래피, 버튼, 섹션, 반응형 breakpoint를 비교
- Header와 Footer를 모든 라우트에서 단일 구현으로 공유

### Phase 3. 정적 페이지 및 콘텐츠 이전

- 홈, About, Artist부터 기본 콘텐츠 페이지 구현
- Works, Gallery, Illustration의 작품 데이터를 공통 콘텐츠 모델로 이전
- Programs 목록과 4개 상세 페이지 구현
- Shop의 비활성 상품 상태 구현
- Beyond 및 Journal/Journey/People/Notes 아카이브 구현
- Contact 및 모든 외부·메일 링크 구현
- 각 페이지의 title, description, heading 계층, ID fragment, alt, ARIA를 대조

### Phase 4. 인터랙션 이전

- 모바일 메뉴와 스크롤 헤더
- Reveal observer와 BackToTop
- 접근 가능한 ArtworkLightbox
- SeasonalHero와 4개 계절 효과
- reduced-motion, 이벤트 정리, 타이머 정리, 키보드 동작 검증
- 홈의 `?season=` 미리보기와 좌우 클릭 전환 검증

### Phase 5. URL 호환성과 SEO

- 모든 기존 `.html` URL을 새 canonical URL로 영구 리디렉션
- 두 레거시 프로그램 URL의 기존 목적지 유지
- 기존 fragment 링크를 새 ID로 매핑
- 페이지별 Metadata API 적용
- canonical, robots, sitemap, OG 이미지 필요 여부 결정
- 배포 방식 결정 전에는 `output: 'export'`를 설정하지 않음
- Node/Vercel 배포면 `next.config.ts` redirects를 사용하고, 순수 정적 호스팅이면 호스팅 플랫폼의 redirect 규칙 또는 호환 HTML 스텁을 별도로 제공

### Phase 6. 시각·기능 검증

- 기존/Next.js 동일 viewport 스크린샷 비교
- 텍스트 줄바꿈, 섹션 높이, 여백, 폰트 weight, 이미지 crop, 헤더 상태를 페이지별 검수
- 모든 내부 링크, 외부 링크, mailto, fragment, 리디렉션 자동 검사
- 모든 이미지 200 응답, alt, width/height, lazy loading 검사
- 메뉴, 라이트박스, 계절 순환, reduced-motion, BackToTop E2E 검사
- 키보드 전용 탐색과 focus-visible 검사
- `npm run lint`, `npm run build` 및 브라우저 콘솔 오류 0건 확인
- Chrome, Edge, Firefox, Safari 호환 범위에서 확인
- 모바일 실제 기기 또는 동등한 터치 환경에서 메뉴와 히어로 클릭 영역 확인

### Phase 7. 성능 개선 및 최종 정리

- 시각적 동등성 승인 후에만 중복 CSS와 사용하지 않는 selector 정리
- 큰 이미지의 `sizes`, quality, priority 조정 및 Core Web Vitals 점검
- 불필요한 Client Component 경계를 줄이고 정적 렌더링 결과 확인
- 콘텐츠 데이터 중복 제거
- 레거시 파일의 보관·이동·삭제는 최종 승인 후 별도 커밋에서 수행

## 9. 검수 체크리스트

### 페이지 완전성

- [ ] 실제 페이지 18개가 모두 새 라우트에서 렌더링된다.
- [ ] 레거시 리디렉션 2개와 모든 기존 `.html` 주소가 동작한다.
- [ ] 모든 메뉴, 본문 섹션, 버튼, 문구, 작품 메타데이터가 현재 HTML과 일치한다.
- [ ] 내부 진입 링크가 없는 Gallery, Illustration, Notes도 보존된다.

### 디자인 완전성

- [ ] 색상 토큰, 폰트, 줄간격, 여백, 구분선, 그림자, 배경색이 일치한다.
- [ ] 360px부터 데스크톱까지 현재 breakpoint 동작이 유지된다.
- [ ] 작품, 인물, 여행, 교육 이미지의 비율과 crop이 일치한다.
- [ ] 홈 히어로 텍스트 가독성, 이미지 오버레이, 계절별 이미지 전환이 일치한다.

### 기능 완전성

- [ ] 모바일 메뉴가 클릭, 링크 선택, Escape에 정확히 반응한다.
- [ ] 스크롤 헤더, 등장 효과, 맨 위로 버튼이 동일 임계값으로 작동한다.
- [ ] 작품 12점의 라이트박스가 이미지와 캡션을 정확히 표시한다.
- [ ] 4계절 자동·수동 전환과 계절별 파티클이 동일하게 동작한다.
- [ ] 모션 감소 설정이 모든 애니메이션에 반영된다.
- [ ] Shop 버튼은 현재와 같이 비활성·준비 중 상태다.

### 접근성·품질

- [ ] 스킵 링크, landmark, heading 순서, `aria-current`, alt가 유지된다.
- [ ] 메뉴와 dialog의 포커스가 올바르게 관리된다.
- [ ] 키보드만으로 메뉴, 링크, 작품 확대, 닫기, 맨 위 이동이 가능하다.
- [ ] 빌드, lint, 타입 검사, 링크 검사, E2E 검사가 통과한다.
- [ ] 콘솔 오류, hydration 오류, 이미지 404, 끊어진 fragment가 없다.

## 10. 완료 기준

다음 조건을 모두 충족해야 Next.js 전환이 완료된 것으로 본다.

1. 위 라우트와 리디렉션이 모두 동작한다.
2. 기존 페이지와 새 페이지의 대표 viewport 시각 비교가 승인된다.
3. 현재 표시되는 모든 텍스트, 이미지, 메뉴, 외부 연결, 접근성 정보가 대조 완료된다.
4. 모바일 메뉴, 라이트박스, 계절 히어로, 스크롤 UI가 기능 테스트를 통과한다.
5. lint, type check, production build, 링크·이미지 검사, 핵심 E2E가 통과한다.
6. 기존 정적 파일의 보관 또는 제거 방법을 사용자에게 최종 확인받는다.

이 계획이 승인되기 전에는 Next.js 설치, 기존 파일 이동, 소스 수정, 이미지 최적화 및 삭제를 시작하지 않는다.
