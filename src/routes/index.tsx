import { createFileRoute, Link } from "@tanstack/react-router";
import { posts } from "../blog/posts";
export const Route = createFileRoute("/")({ component: Home });
function Home() {
  return (
    <div className="article-list">
      {posts.map((post) => (
        <Link
          className="article-item"
          key={post.slug}
          to="/posts/$slug"
          params={{ slug: post.slug }}
        >
          <h2>{post.title}</h2>
          <time>{String(post.date)}</time>
          {post.description && <p>{post.description}</p>}
        </Link>
      ))}
    </div>
  );
}
