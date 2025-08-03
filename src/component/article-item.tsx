import { PostMeta } from "@/api/posts";
import { css } from "@/styled-system/css";
import Link from "next/link";

export function ArticleItem({ article }: { article: PostMeta }) {
  return (
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
  );
}
