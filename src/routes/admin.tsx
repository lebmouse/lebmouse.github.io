import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Markdown } from "@tanstack/markdown/react";
import { MarkdownEditor } from "../admin/markdown-editor";
import { TagEditor } from "../admin/tag-editor";
import localSources from "virtual:post-sources";
import { defaultHighlighter } from "@tanstack/highlight";
import { createTanStackMarkdownHighlighter } from "@tanstack/highlight/markdown";
const markdownHighlighter = createTanStackMarkdownHighlighter(defaultHighlighter);
import { parse, stringify } from "yaml";
import {
  decode,
  getUser,
  listPosts,
  publish,
  readPost,
} from "../admin/github";
export const Route = createFileRoute("/admin")({ component: Admin });
type Entry = { name: string; sha: string };
type Draft = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string;
  body: string;
  extra: Record<string, unknown>;
  sha: string | null;
  originalSlug: string;
};
const blank = (): Draft => ({
  slug: "",
  title: "",
  date: "",
  description: "",
  tags: "",
  body: "",
  extra: {},
  sha: null,
  originalSlug: "",
});
const draftKey = "blog-editor-draft-v1";
function Admin() {
  const [token, setToken] = useState("");
  const [login, setLogin] = useState("");
  const [posts, setPosts] = useState<Entry[]>([]);
  const [draft, setDraft] = useState<Draft>(blank);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [initialPostLoaded, setInitialPostLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) setDraft(JSON.parse(saved));
    } catch {
      /* ignore invalid local draft */
    }
  }, []);
  useEffect(() => {
    if (import.meta.env.DEV) {
      setLogin("로컬 개발 모드");
      setPosts(Object.keys(localSources).map((path) => ({ name: path.split("/").pop()!, sha: path })));
      setSessionChecked(true);
      return;
    }
    const saved = sessionStorage.getItem("blog-admin-token");
    if (!saved) { setSessionChecked(true); return; }
    let cancelled = false;
    Promise.all([getUser(saved), listPosts(saved)]).then(([u, list]) => {
      if (cancelled) return;
      if (u.login.toLowerCase() !== "lebmouse") throw new Error("저장소 소유자 계정이 아닙니다.");
      setToken(saved); setLogin(u.login); setPosts(list.filter(x => x.name.endsWith(".mdx")));
    }).catch(() => { if (!cancelled) { sessionStorage.removeItem("blog-admin-token"); setError("세션이 만료됐습니다. 다시 연결해 주세요."); } }).finally(() => { if (!cancelled) setSessionChecked(true); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!sessionChecked || !login) return;
    const slug = new URLSearchParams(window.location.search).get("edit");
    if (slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      void load(slug).finally(() => setInitialPostLoaded(true));
    } else {
      setInitialPostLoaded(true);
    }
  }, [sessionChecked, login]);
  const change = (field: keyof Draft, value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));
  function saveLocal() {
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setMessage(
      "이 브라우저에 초안을 저장했습니다. 이미지는 저장되지 않습니다.",
    );
    setError("");
  }
  async function connect() {
    setBusy(true);
    setError("");
    try {
      const u = await getUser(token.trim());
      if (u.login.toLowerCase() !== "lebmouse")
        throw new Error("저장소 소유자 계정의 토큰이 필요합니다.");
      const list = await listPosts(token.trim());
      setPosts(list.filter((x) => x.name.endsWith(".mdx")));
      setToken(token.trim());
      sessionStorage.setItem("blog-admin-token", token.trim());
      setLogin(u.login);
      setMessage(
        "GitHub에 연결했습니다. 토큰은 이 탭의 세션에 보관됩니다.",
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function load(slug: string) {
    if (!slug) return;
    setBusy(true);
    setError("");
    try {
      const f = import.meta.env.DEV ? null : await readPost(token, slug);
      const text = import.meta.env.DEV ? localSources[`../_posts/${slug}.mdx`] : decode(f!.content!);
      if (text === undefined) throw new Error("로컬 글을 찾을 수 없습니다.");
      const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
      if (!match) throw new Error("frontmatter를 찾을 수 없습니다.");
      const meta = parse(match[1]) ?? {};
      const { title, date, description, tags, ...extra } = meta;
      setDraft({
        slug,
        originalSlug: slug,
        title: String(title ?? ""),
        date: String(date ?? ""),
        description: String(description ?? ""),
        tags: Array.isArray(tags) ? tags.join(", ") : "",
        body: text.slice(match[0].length),
        extra,
        sha: f?.sha ?? null,
      });
      setFiles([]);
      setMessage(import.meta.env.DEV ? "로컬 파일에서 글을 불러왔습니다. 변경 내용은 초안으로 저장할 수 있습니다." : "GitHub에서 글을 불러왔습니다.");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (import.meta.env.DEV) return;
    setError("");
    setMessage("");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
      setError("주소는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.");
      return;
    }
    if (!draft.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
      setError("제목과 날짜를 확인해 주세요.");
      return;
    }
    if (draft.originalSlug && draft.slug !== draft.originalSlug) {
      setError("기존 글의 주소는 변경할 수 없습니다.");
      return;
    }
    setBusy(true);
    try {
      const metadata = {
        ...draft.extra,
        title: draft.title,
        date: draft.date,
        ...(draft.description ? { description: draft.description } : {}),
        ...(draft.tags
          ? {
              tags: draft.tags
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            }
          : {}),
      };
      const content = `---\n${stringify(metadata)}---\n\n${draft.body}`;
      const sha = await publish(token, draft.slug, content, draft.sha, files);
      localStorage.removeItem(draftKey);
      setFiles([]);
      setMessage(
        `커밋 완료: ${sha.slice(0, 7)}. 배포는 GitHub Actions에서 확인하세요.`,
      );
      try {
        const f = await readPost(token, draft.slug);
        setDraft((d) => ({ ...d, sha: f.sha, originalSlug: d.slug }));
        setPosts(
          (await listPosts(token)).filter((x) => x.name.endsWith(".mdx")),
        );
      } catch {
        setError(
          "커밋은 완료됐지만 글 목록을 갱신하지 못했습니다. 다시 불러와 주세요.",
        );
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  function addImage(file: File | undefined) {
    if (!file) return;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
      setError("이미지를 추가하기 전에 올바른 주소를 입력해 주세요.");
      return;
    }
    if (
      !/^image\/(png|jpeg|webp|gif)$/.test(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(
        "PNG, JPEG, WebP, GIF 이미지만 가능하며 파일당 5MB 이하여야 합니다.",
      );
      return;
    }
    const name = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
    const safe = new File([file], `${Date.now()}-${name}`, { type: file.type });
    setFiles((v) => [...v, safe]);
    setDraft((d) => ({
      ...d,
      body: d.body + `\n![이미지 설명](/images/posts/${d.slug}/${safe.name})\n`,
    }));
    setMessage(
      "이미지가 임시로 추가되었습니다. 글을 발행할 때 함께 저장됩니다.",
    );
  }
  return (
    <section className="compact-editor">
      {!sessionChecked || (login && !initialPostLoaded) ? (
        <p className="admin-loading" role="status">편집 화면을 불러오는 중입니다.</p>
      ) : !login ? (
        <div className="admin-login">
          <label>GitHub 토큰<input type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" /></label>
          <button disabled={!token || busy} onClick={connect}>GitHub 연결</button>
          <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">토큰 만들기</a>
        </div>
      ) : (
        <>
          {!draft.originalSlug && <details className="post-picker"><summary>글 선택 또는 새 글 주소</summary><label>기존 글 <select defaultValue="" onChange={(e) => load(e.target.value)}><option value="">선택하세요</option>{posts.map(p => <option key={p.sha} value={p.name.replace(/\.mdx$/, "")}>{p.name}</option>)}</select></label><label>주소 <input value={draft.slug} disabled={files.length > 0} onChange={(e) => change("slug", e.target.value)} placeholder="new-post" /></label></details>}
          <input className="compact-title" aria-label="제목" value={draft.title} onChange={(e) => change("title", e.target.value)} placeholder="제목 없음" />
          <div className="compact-date-row">
            <time>{draft.date}</time>
            <details className="metadata-menu">
              <summary>메타데이터</summary>
              <div className="compact-meta" aria-label="글 메타데이터">
                <label>날짜<input type="date" aria-label="날짜" value={draft.date} onChange={(e) => change("date", e.target.value)} /></label>
                <label>설명<input aria-label="설명" value={draft.description} onChange={(e) => change("description", e.target.value)} placeholder="설명 추가" /></label>
                <div><span id="tag-label">태그</span><TagEditor value={draft.tags} onChange={(value) => change("tags", value)} /><small>쉼표로 태그를 구분해 주세요.</small></div>
              </div>
            </details>
          </div>
          <div className="compact-body" hidden={preview}><MarkdownEditor value={draft.body} onChange={(value) => change("body", value)} /></div>
          {preview && <div className="prose compact-preview"><Markdown highlighter={markdownHighlighter}>{draft.body}</Markdown></div>}
          <div className="compact-footer">
            <label className="image-button">이미지 추가<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" disabled={!draft.slug} onChange={(e) => { addImage(e.target.files?.[0]); e.target.value = ""; }} /></label>
            {files.length > 0 && <span>발행 대기 이미지 {files.length}개</span>}
          </div>
          <div className="compact-actions">
            <button type="button" onClick={() => setPreview((v) => !v)}>{preview ? "편집" : "미리보기"}</button>
            <button type="button" onClick={saveLocal}>초안 저장</button>
            <button type="button" className="publish-button" onClick={submit} disabled={busy || import.meta.env.DEV} title={import.meta.env.DEV ? "로컬에서는 발행이 비활성화됩니다" : undefined}>발행</button>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          {message && !message.includes("불러왔습니다") && <p className="compact-status" role="status">{message}</p>}
        </>
      )}
    </section>
  );
}
