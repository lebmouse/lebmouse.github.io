import { PostMeta } from "@/api/posts";
import { css } from "@/styled-system/css";
import { ArticleItem } from "./article-item";

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
        <ArticleItem key={article.title} article={article} />
      ))}
    </div>
  );
}
