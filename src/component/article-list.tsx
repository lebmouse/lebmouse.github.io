import { PostMeta } from "@/api/posts";
import { css } from "@/styled-system/css";
import Link from "next/link";

export function ArticleList({ articles }: { articles: PostMeta[] }) {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "10",
        px: "2",
        minHeight: "100vh",
      })}
    >
      {articles.map((article) => (
        <Link
          key={article.title}
          className={css({
            _hover: {
              cursor: "pointer",
              textDecoration: "underline",
            },
          })}
          href={`/posts/${article.slug}`}
        >
          <h2
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              color: "gray.900",
            })}
          >
            {article.title}
          </h2>
          <p className={css({ fontSize: "sm", color: "gray.700" })}>
            {article.date}
          </p>
          <p className={css({ fontSize: "md" })}>{article.description}</p>
        </Link>
      ))}
    </div>
  );
}
