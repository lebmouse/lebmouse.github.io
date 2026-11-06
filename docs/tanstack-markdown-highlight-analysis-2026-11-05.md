# TanStack Markdown·Highlight 전환 분석

작성일: 2026-11-05 · 범위: 로컬 분석 및 기록만. 배포, 코드 수정, 커밋, 푸시는 수행하지 않음.

## 비교 대상과 요약

- 이전: `d1360ad` — TanStack Start 위에 MDX 컴파일러, remark-gfm, rehype-pretty-code/Shiki를 사용. 관리자 미리보기는 react-markdown 사용.
- 현재: `dbfb212` — 같은 TanStack Start 위에서 본문과 미리보기에 TanStack Markdown 1.2.0, 강조에 TanStack Highlight 1.2.11 사용.
- 정적 사이트와 GitHub 발행 방식은 그대로다. 변한 것은 주로 콘텐츠를 React 화면으로 변환하는 방식과 코드 강조 방식이다. 같은 커밋에 관리자 세션과 UI 변화도 포함되어 있다.
- 확인된 실제 회귀: 기존 `parse-dont-validate-for-ts.mdx`의 `<br/>`이 줄바꿈이 아닌 문자열로 노출된다. 다른 차이도 있으므로 기존 글별 시각 검증과 호환성 점검이 필요하다.
- MDX JSX 실행은 사라졌다. `MainColorTheme` 한 종류는 별도 분리 로직으로 유지하며, 일반 MDX 컴포넌트와 JS 표현식은 대체되지 않는다.

## 처리 흐름

이전에는 빌드 시 MDX를 React 컴포넌트로 컴파일했다. remark-gfm이 문법을 확장하고 rehype-pretty-code가 Shiki로 코드 블록을 강조했다. 관리자 미리보기는 react-markdown을 썼기 때문에 게시 본문과 별도 경로였다.

현재는 `vite.config.ts`의 가상 모듈이 글의 원문을 모은다. `src/blog/posts.ts`가 YAML과 본문을 분리한다. 글 페이지가 `Markdown` 컴포넌트에 본문을 전달하고, `createTanStackMarkdownHighlighter`로 강조 결과를 연결한다. 관리자도 같은 Markdown·Highlight 조합을 쓴다. 다만 관리자는 `MainColorTheme` 특별 처리를 공유하지 않아 완전히 같은 미리보기는 아니다.

현재 글 내용 전체가 가상 모듈을 통해 클라이언트 번들에 포함된다. 이전 버전도 본문 원문과 MDX 모듈을 함께 묶는 구조였으므로 이것이 새로 생긴 문제라고 단정할 수는 없다. 글이 많아질 때 번들 및 이동 성능을 별도로 확인해야 한다.

## 기능 및 호환성

| 항목 | 이전 | 현재 | 의미 |
| --- | --- | --- | --- |
| 글 파일 | `.mdx` | `.mdx` 확장자 유지 | 확장자는 그대로지만 일반 MDX 엔진은 아니다. |
| JSX·표현식 | MDX 컴파일러가 처리 | TanStack Markdown은 처리하지 않음 | 기존 색상 컴포넌트만 코드에서 직접 분기한다. 새 React 컴포넌트는 자동으로 사용할 수 없다. |
| 일반 HTML | MDX가 `<br/>`를 요소로 처리 | 기본적으로 HTML 이스케이프 | 현재 글 하나에서 `<br/>`이 텍스트로 표시됨. |
| GFM·CommonMark | remark-gfm 기반 | 필요한 일부 기능 제공 | 표·취소선·체크리스트 등은 제공하지만 전부 호환된다고 보장할 수 없다. |
| 코드 강조 | Shiki + rehype-pretty-code | TanStack Highlight | 문법 토큰과 스타일이 다를 수 있다. 모든 언어와 TextMate 호환성이 같은 것은 아니다. |
| 미리보기 | react-markdown | TanStack Markdown | 본문과 기반이 가까워졌다. 커스텀 컴포넌트·미발행 이미지의 미리보기는 여전히 제한된다. |
| 제목 ID | 비교한 이전 글에는 없음 | 생성됨 | 비교한 한글 제목 일부는 `section`, `section-2`처럼 생성된다. URL 앵커의 의미를 확인할 필요가 있다. |

TanStack 공식 문서는 [MDX 미지원 및 CommonMark/GFM 범위](https://tanstack.com/markdown/latest/docs/project/faq), [Highlight와 Shiki의 적용 범위](https://tanstack.com/highlight/latest/docs/faq), [HTML·URL 기본 보안 정책](https://tanstack.com/markdown/latest/docs/core-concepts/security)을 설명한다. 기본 안전 정책은 범용 sanitizer 전체를 대체한다는 뜻은 아니다.

### 현재 구현에서 주의할 점

- `src/routes/posts.$slug.tsx`는 `<MainColorTheme />` 문자열로 본문을 먼저 분리한다. 일반적인 MDX 컴포넌트 처리 기능은 아니다. 코드 블록 안에 같은 문자열을 쓰는 경우에도 분리될 수 있으므로 검증이 필요하다.
- 편집기는 여전히 `.mdx`에 저장하지만 본문을 Markdown으로 렌더링한다. 새로운 JSX가 조용히 의도와 다르게 표시될 수 있다.
- 글 발행은 HTML 렌더링 차이나 미지원 문법을 별도로 경고하지 않는다. 기존 테스트는 GitHub 커밋 및 충돌 위주이며 Markdown 렌더링 회귀를 검사하지 않는다.
- 세션 저장, 숨겨진 관리자 링크, 편집 플로팅 버튼은 같은 커밋에 포함된 별도의 UI 변경이다. Markdown 라이브러리 교체의 효과와 구분한다.

## 로컬 빌드 비교

이전 커밋은 `/private/tmp/blog-before-tanstack-analysis`에 `git archive`로 별도 복사해 lockfile 설치 후 빌드했다. 현재는 작업공간의 `dist/client` 빌드 결과를 사용했다. 네 글의 정적 HTML이 양쪽에 생성됐다. 수치는 단일 빌드 결과이며 전송량·LCP·런타임 속도 측정이 아니다.

| 측정 | 이전 | 현재 | 변화 |
| --- | ---: | ---: | ---: |
| `dist/client/assets` 내 전체 JS 파일 크기 합 | 640,832 B | 532,597 B | −108,235 B (약 16.9%) |
| 각 JS 파일을 gzip 압축한 크기 합 | 194,632 B | 177,535 B | −17,097 B (약 8.8%) |
| `parse-dont-validate-for-ts` 정적 HTML | 20,258 B | 14,434 B | −5,824 B |
| `about-blog` 정적 HTML | 6,895 B | 7,289 B | +394 B |

JS 수치는 빌드 산출물에 있는 모든 JS 파일의 합이다. 방문자가 한 페이지에서 실제로 내려받는 양과 다르며, 브라우저 캐시나 CDN 압축도 반영하지 않았다. 관리자·세션 코드가 동시에 변경되고 청크 분할도 달라졌으므로 이 감소분을 Markdown/Highlight 단독 효과로 해석할 수 없다. 성능 향상 여부는 실제 페이지별 네트워크와 런타임 측정이 필요하다.

정적 HTML을 파싱해 글의 주요 요소를 비교했다. 네 글의 링크 목록은 동일했다. 단순 텍스트 비교에서는 HTML 직렬화 시 요소 사이 공백이 달라 동일 문자열이 아니었으므로, 이 결과만으로 본문 내용이 모두 동일하다고 주장할 수 없다. `parse-dont-validate-for-ts`는 이전 `<br/>` 요소가 현재 `&lt;br/&gt;` 텍스트 문단으로 바뀐 것이 직접 확인됐다. 두 빌드에서 코드 강조용 span 구조도 달랐다. 스크린샷 비교나 전체 Markdown 문법에 대한 회귀 테스트는 하지 않았다.

## 판단과 다음 점검

TanStack으로 통일하면 게시 글과 관리자 미리보기가 같은 렌더러를 공유하고, 현재 빌드의 전체 JS 산출물 합은 줄었다. 반면 MDX의 표현력과 일부 기존 HTML 문법은 잃었다. 기존 글의 `<br/>` 회귀가 있어 호환성 검증 없이 그대로 동등하다고 볼 수 없다.

1. 기존 네 글의 텍스트, 코드 블록, 링크, 줄바꿈 및 제목을 전후 화면으로 비교한다.
2. `<br/>`을 Markdown 문법으로 바꿀지, 제한된 호환 처리를 추가할지 정한다. 이 분석에서는 원본을 수정하지 않았다.
3. 표, 체크리스트, 취소선, 각주, 자동 링크, 중첩 목록, 코드 펜스 등 실제로 쓰려는 문법을 각각 테스트한다.
4. `MainColorTheme` 문자열이 코드 블록에 포함된 경우와 미지원 JSX 입력 시 동작을 테스트한다.
5. 페이지별 다운로드 JS, gzip/Brotli, 로딩 및 모바일 화면을 동일 조건에서 측정한다.
