import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Markdown } from "@tanstack/markdown/react";
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
  repo,
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
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) setDraft(JSON.parse(saved));
    } catch {
      /* ignore invalid local draft */
    }
  }, []);
  useEffect(() => {
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
  useEffect(() => { if (!sessionChecked || !login) return; const slug = new URLSearchParams(window.location.search).get("edit"); if (slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) { void load(slug); } }, [sessionChecked, login]);
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
      const f = await readPost(token, slug);
      const text = decode(f.content!);
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
        sha: f.sha,
      });
      setFiles([]);
      setMessage("GitHub에서 글을 불러왔습니다.");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
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
    <section className="admin">
      <h1>글 관리</h1>
      <p className="notice">
        GitHub 토큰은 이 탭을 닫을 때까지 보관됩니다. 초안은 이 브라우저에만 저장되며
        이미지는 포함되지 않습니다.
      </p>
      {!login ? (
        <>
          <label>
            GitHub 토큰
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
            />
          </label>
          <button disabled={!token || busy} onClick={connect}>
            GitHub 연결
          </button>
          <a
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer"
          >
            토큰 만들기
          </a>
        </>
      ) : (
        <>
          <div className="actions">
            <span>{login} 연결됨</span>
            <button
              onClick={() => {
                sessionStorage.removeItem("blog-admin-token");
                setToken("");
                setLogin("");
                setPosts([]);
              }}
            >
              연결 해제
            </button>
          </div>
          <label>
            기존 글 불러오기
            <select defaultValue="" onChange={(e) => load(e.target.value)}>
              <option value="">선택하세요</option>
              {posts.map((p) => (
                <option key={p.sha} value={p.name.replace(/\.mdx$/, "")}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              setDraft(blank());
              setFiles([]);
              setMessage("새 글을 작성합니다.");
            }}
          >
            새 글
          </button>
          <label>
            주소 (slug)
            <input
              value={draft.slug}
              disabled={!!draft.originalSlug || files.length > 0}
              onChange={(e) => change("slug", e.target.value)}
            />
          </label>
          <label>
            제목
            <input
              value={draft.title}
              onChange={(e) => change("title", e.target.value)}
            />
          </label>
          <label>
            날짜
            <input
              type="date"
              value={draft.date}
              onChange={(e) => change("date", e.target.value)}
            />
          </label>
          <label>
            설명
            <input
              value={draft.description}
              onChange={(e) => change("description", e.target.value)}
            />
          </label>
          <label>
            태그 (쉼표로 구분)
            <input
              value={draft.tags}
              onChange={(e) => change("tags", e.target.value)}
            />
          </label>
          <label>
            본문 (Markdown)
            <textarea
              value={draft.body}
              onChange={(e) => change("body", e.target.value)}
            />
          </label>
          <label>
            이미지 추가
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              disabled={
                !draft.slug ||
                (!!draft.originalSlug && draft.slug !== draft.originalSlug)
              }
              onChange={(e) => {
                addImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <div className="actions">
            <button onClick={saveLocal}>초안 저장</button>
            <button onClick={() => setPreview(!preview)}>
              미리보기 {preview ? "닫기" : "열기"}
            </button>
            <button onClick={submit} disabled={busy}>
              발행
            </button>
          </div>
          {files.length > 0 && (
            <p>대기 중인 이미지: {files.map((f) => f.name).join(", ")}</p>
          )}
          {preview && (
            <div className="prose">
              <p className="notice">
                마크다운 미리보기입니다. 기존 색상 컴포넌트와 새 이미지는 발행 후 확인할 수 있습니다.
              </p>
              <Markdown highlighter={markdownHighlighter}>
                {draft.body}
              </Markdown>
            </div>
          )}
          <a
            href={`https://github.com/${repo}/actions`}
            target="_blank"
            rel="noreferrer"
          >
            GitHub Actions에서 배포 상태 확인
          </a>
        </>
      )}
      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
