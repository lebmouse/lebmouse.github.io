import { createFileRoute, notFound } from "@tanstack/react-router";
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
  const Content = post.Content;
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{String(post.date)}</time>
      <div className="prose">
        <Content components={{ MainColorTheme }} />
      </div>
    </article>
  );
}
