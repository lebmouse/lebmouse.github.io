# yg's records

개인적으로 공부하거나 경험한 내용을 기록하는 블로그 저장소입니다.

## 기술 스택

- [Next.js](https://nextjs.org) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [PandaCSS](https://panda-css.com/) (CSS-in-JS)
- [MDX](https://mdxjs.com/) (블로그 포스트 작성)
- [remark-gfm](https://github.com/remarkjs/remark-gfm) (GFM 지원)

## 배포

이 블로그는 GitHub Pages를 통해 자동으로 배포됩니다.

### 배포 과정

1. `main` 브랜치에 푸시하면 자동으로 GitHub Actions가 실행됩니다
2. Next.js 정적 사이트 생성 (`next build`)
3. GitHub Pages에 자동 배포

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 정적 사이트 빌드 (로컬 테스트용)
npm run build
```

### 배포 URL

- GitHub Pages: `https://[username].github.io/my-blog/`
