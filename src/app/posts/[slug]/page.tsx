export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { default: Post } = await import(`@/_posts/${slug}.mdx`);

  return <Post />;
}

export function generateStaticParams() {
  return [{ slug: "hello" }, { slug: "about" }];
}

export const dynamicParams = false;
