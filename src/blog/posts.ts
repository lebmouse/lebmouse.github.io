import { parse } from "yaml";
import type { ComponentType } from "react";
export type Post = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  Content: ComponentType<{ components?: Record<string, ComponentType> }>;
};
import raw from "virtual:post-sources";
const modules = import.meta.glob("../_posts/*.mdx", { eager: true }) as Record<
  string,
  { default: Post["Content"] }
>;
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
      Content: modules[path].default,
    };
  })
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));
