import { getAllPostsMeta, getPostDataBySlug } from "@/api/posts";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { css } from "@/styled-system/css";
import { markdownStyles } from "./markdown-styles";
import remarkGfm from "remark-gfm";

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { meta } = getPostDataBySlug(slug);
    return {
      title: meta.title,
      description: meta.description,
    };
  } catch (e: unknown) {
    console.error(e);
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }
}

// 빌드 타임에 정적 경로 생성
export async function generateStaticParams() {
  const posts = getAllPostsMeta();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  let post;
  try {
    post = getPostDataBySlug(slug);
  } catch (e) {
    console.error(e);
    notFound(); // 404 페이지를 보여줍니다.
  }

  return (
    <article
      className={css({
        w: "full",
        maxW: "prose",
        px: "2",
      })}
    >
      <h1
        className={css({
          fontSize: "2xl",
          fontWeight: "bold",
          color: "gray.900",
        })}
      >
        {post.meta.title}
      </h1>
      <p className={css({ fontSize: "sm", color: "gray.700" })}>
        {post.meta.date}
      </p>
      <div className={css(markdownStyles, { mt: "4" })}>
        <MDXRemote
          source={post.content}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
    </article>
  );
}
