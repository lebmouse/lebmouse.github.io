const API = "https://api.github.com";
export const repo = "lebmouse/lebmouse.github.io";
type GitFile = {
  name: string;
  path: string;
  sha: string;
  type: string;
  content?: string;
};
export async function request<T>(
  token: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      `${response.status}: ${result.message ?? "GitHub 요청에 실패했습니다."}`,
    );
  }
  return response.json() as Promise<T>;
}
export const getUser = (token: string) =>
  request<{ login: string }>(token, "/user");
export const listPosts = (token: string) =>
  request<GitFile[]>(token, `/repos/${repo}/contents/src/_posts?ref=main`);
export const readPost = (token: string, slug: string) =>
  request<GitFile>(
    token,
    `/repos/${repo}/contents/src/_posts/${encodeURIComponent(slug)}.mdx?ref=main`,
  );
const base64 = (bytes: Uint8Array) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
export const decode = (content: string) =>
  new TextDecoder().decode(
    Uint8Array.from(atob(content.replace(/\s/g, "")), (c) => c.charCodeAt(0)),
  );
export async function publish(
  token: string,
  slug: string,
  content: string,
  originalSha: string | null,
  images: File[],
) {
  const root = `/repos/${repo}`;
  const branch = await request<{ object: { sha: string } }>(
    token,
    `${root}/git/ref/heads/main`,
  );
  const head = branch.object.sha;
  const commit = await request<{ tree: { sha: string } }>(
    token,
    `${root}/git/commits/${head}`,
  );
  let current: GitFile | null = null;
  try {
    current = await request<GitFile>(
      token,
      `${root}/contents/src/_posts/${encodeURIComponent(slug)}.mdx?ref=${head}`,
    );
  } catch (e) {
    if (!(e instanceof Error && e.message.startsWith("404:"))) throw e;
  }
  if ((current?.sha ?? null) !== originalSha)
    throw new Error(
      "다른 곳에서 글이 변경되었거나 같은 이름의 글이 있습니다. 최신 글을 불러와 확인해 주세요.",
    );
  const files = [
    {
      path: `src/_posts/${slug}.mdx`,
      bytes: new TextEncoder().encode(content),
    },
    ...(await Promise.all(
      images.map(async (image) => ({
        path: `public/images/posts/${slug}/${image.name}`,
        bytes: new Uint8Array(await image.arrayBuffer()),
      })),
    )),
  ];
  const entries = [];
  for (const file of files) {
    const blob = await request<{ sha: string }>(token, `${root}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: base64(file.bytes), encoding: "base64" }),
    });
    entries.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }
  const tree = await request<{ sha: string }>(token, `${root}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: entries }),
  });
  const created = await request<{ sha: string }>(token, `${root}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: `${originalSha ? "Update" : "Publish"} post: ${slug}`,
      tree: tree.sha,
      parents: [head],
    }),
  });
  await request(token, `${root}/git/refs/heads/main`, {
    method: "PATCH",
    body: JSON.stringify({ sha: created.sha, force: false }),
  });
  return created.sha;
}
