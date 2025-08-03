import { getAllPostsMeta } from "@/api/posts";
import { ArticleList } from "@/component/article-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "yg's records",
};

export default function Home() {
  const posts = getAllPostsMeta();
  return <ArticleList articles={posts} />;
}
