import { getAllPostsMeta, getPost, getPostBySlug } from "@/api/posts";
import { Metadata } from "next";

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { meta } = getPostBySlug(params.slug);
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

export const dynamicParams = true;

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { Post } = await getPost(slug);

  return <Post />;
}
