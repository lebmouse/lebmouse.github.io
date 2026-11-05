# yg's records

공부하고 경험한 내용을 기록하는 개인 블로그입니다. TanStack Start로 글과 관리자 화면을 만들고, GitHub Actions에서 정적 페이지를 생성해 GitHub Pages에 배포합니다.

## 개발

Node.js 24와 pnpm 10.23.0을 사용합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm typecheck
node --test tests/github.test.mjs
```

글은 `src/_posts/*.mdx`에 있습니다. 각 파일의 이름은 `/posts/파일명` 주소가 됩니다. 글 앞부분의 YAML에 `title`, `date`, 선택 사항인 `description`, `tags`를 작성합니다. 글의 코드나 기존 내용은 유지합니다. 본문은 TanStack Markdown으로 렌더링합니다. 기존 `<MainColorTheme />` 외의 MDX JSX와 JavaScript 표현식은 실행되지 않습니다.

## 관리자

[관리자 페이지](https://lebmouse.github.io/admin/)에서 글을 작성하고 발행합니다. 서버는 따로 필요하지 않습니다.

1. GitHub에서 fine-grained personal access token을 만듭니다. 소유자는 `lebmouse`, 저장소는 `lebmouse/lebmouse.github.io`만 선택하고 repository permissions에서 `Contents: Read and write`를 부여합니다. 만료일을 정합니다.
2. 관리자 페이지에 토큰을 입력하고 연결합니다. 로그인 후 글 상세 화면의 오른쪽 아래 편집 버튼으로 해당 글을 바로 열 수 있습니다. 토큰은 현재 탭의 세션 저장소에 보관되어 새로고침해도 유지됩니다. 탭을 닫거나 연결을 해제하면 다시 입력해야 합니다. 토큰을 코드, 글 또는 채팅에 넣지 마세요.
3. 새 글을 작성하거나 기존 글을 불러옵니다. 이미지를 추가하면 본문에 경로가 삽입됩니다. PNG, JPEG, GIF, WebP는 파일당 5MB까지 추가할 수 있습니다.
4. 발행을 누르면 글과 이미지가 한 커밋으로 `main`에 저장됩니다. 커밋 완료와 웹 배포 완료는 다릅니다. GitHub Actions 링크에서 배포 결과를 확인하세요.

토큰이 유출되면 GitHub 설정에서 즉시 폐기하세요. 브라우저 확장 프로그램이나 스크립트가 토큰을 탈취하면 저장소에 부여된 권한을 사용할 수 있습니다. 글을 다른 곳에서 동시에 수정했다면 관리자가 덮어쓰지 않고 충돌을 표시합니다.

초안 저장 버튼은 글을 현재 브라우저에만 저장하며 이미지는 보관하지 않습니다. 다른 기기와 동기화되지 않습니다. 저장소가 공개이므로 업로드된 글과 이미지도 공개됩니다. 미리보기는 Markdown 중심이며 MDX 커스텀 컴포넌트나 아직 발행하지 않은 이미지를 실제 페이지처럼 보여주지 않습니다.

## 배포 및 문제 해결

`main`에 변경이 생기면 `.github/workflows/deploy.yml`이 정적 사이트를 빌드하고 `dist/client`를 GitHub Pages에 배포합니다. GitHub Pages의 Source는 GitHub Actions여야 합니다. 실패하면 저장소의 Actions에서 해당 커밋의 실행 로그를 확인하세요. 이전 배포로 돌아가야 한다면 기존 커밋을 확인하고 변경을 되돌린 뒤 다시 배포합니다.

장기 계획과 검증 이력은 [작업 기록](docs/blog-migration-plan.md)에 있습니다.
