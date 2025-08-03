import { getAllPostsMeta } from "@/api/posts";
import { ArticleList } from "@/component/article-list";

export default function Home() {
  const posts = getAllPostsMeta();
  return <ArticleList articles={posts} />;
}
