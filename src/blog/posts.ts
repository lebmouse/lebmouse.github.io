import { parse } from "yaml";
export type Post = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  content: string;
};
import raw from "virtual:post-sources";
export const posts: Post[] = Object.entries(raw)
  .map(([path, source]) => {
    const meta =
      parse(source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "") ?? {};
    return {
      ...meta,
      slug: path
        .split("/")
        .pop()!
        .replace(/\.mdx$/, ""),
      content: source.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(\r?\n|$)/, ""),
    };
  })
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));
