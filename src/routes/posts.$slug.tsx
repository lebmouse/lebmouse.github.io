import { createFileRoute, notFound } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { Markdown } from "@tanstack/markdown/react";
import { defaultHighlighter } from "@tanstack/highlight";
import { createTanStackMarkdownHighlighter } from "@tanstack/highlight/markdown";
const highlighter = createTanStackMarkdownHighlighter(defaultHighlighter);
import { getUser } from "../admin/github";
import { posts } from "../blog/posts";
export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params }) => {
    const post = posts.find((item) => item.slug === params.slug);
    if (!post) throw notFound();
    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ?? "Post not found" },
      ...(loaderData?.description
        ? [{ name: "description", content: loaderData.description }]
        : []),
    ],
  }),
  component: PostPage,
});
function MainColorTheme() {
  return (
    <div className="colors">
      {[
        ["accent", "#ea580c"],
        ["card", "#eae6da"],
        ["text", "#1b1b1a"],
        ["bg", "#fffdf6"],
      ].map(([name, color]) => (
        <div key={name}>
          <span style={{ backgroundColor: color }} />
          {name}
          <small>{color}</small>
        </div>
      ))}
    </div>
  );
}
function PostPage() {
  const { slug } = Route.useParams();
  const post = posts.find((p) => p.slug === slug)!;
  const sections = post.content.split(/(<MainColorTheme\s*\/>)/g);
  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => { const token = sessionStorage.getItem("blog-admin-token"); if (!token) return; let active = true; getUser(token).then(u => { if(active && u.login.toLowerCase() === "lebmouse") setCanEdit(true); }).catch(() => { if(active) sessionStorage.removeItem("blog-admin-token"); }); return () => { active = false; }; }, []);
  return (
    <article>
      {canEdit && <a className="edit-floating" href={`/admin/?edit=${encodeURIComponent(slug)}`} aria-label="이 글 편집"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></a>}
      <h1>{post.title}</h1>
      <time>{String(post.date)}</time>
      <div className="prose">
        {sections.map((part, index) => <Fragment key={index}>{/^<MainColorTheme\s*\/>$/.test(part) ? <MainColorTheme /> : <Markdown highlighter={highlighter}>{part}</Markdown>}</Fragment>)}
      </div>
    </article>
  );
}
