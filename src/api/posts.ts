import fs from "fs";
import path from "path";
import matter from "gray-matter";

// _posts 경로 설정
const postsDirectory = path.join(process.cwd(), "src", "_posts");

// 게시물 메타데이터 타입 정의
export interface PostMeta {
  title: string;
  date: string;
  description: string;
  slug: string;
}

/**
 * 모든 게시물의 메타데이터를 날짜 내림차순으로 정렬하여 가져옵니다.
 */
export function getAllPostsMeta(): PostMeta[] {
  // _posts 디렉토리의 모든 파일명을 읽어옵니다.
  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".mdx")) // .mdx 파일만 필터링
    .map((fileName) => {
      // '.mdx' 확장자를 제거하여 slug를 만듭니다.
      const slug = fileName.replace(/\.mdx$/, "");

      // 파일 전체 경로를 만듭니다.
      const fullPath = path.join(postsDirectory, fileName);
      // 파일을 utf8 인코딩으로 읽어옵니다.
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // gray-matter를 사용하여 메타데이터를 파싱합니다.
      const { data } = matter(fileContents);

      // slug와 파싱된 데이터를 합쳐서 반환합니다.
      return {
        slug,
        ...(data as Omit<PostMeta, "slug">),
      };
    });

  // 날짜를 기준으로 최신 글이 위로 오도록 정렬합니다.
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * 주어진 slug에 해당하는 게시물의 데이터와 본문을 가져옵니다.
 * @param slug
 */
export function getPostDataBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // gray-matter를 사용하여 메타데이터(data)와 본문(content)을 분리합니다.
  const { data, content } = matter(fileContents);
  return {
    meta: { slug, ...(data as Omit<PostMeta, "slug">) },
    content,
  };
}
