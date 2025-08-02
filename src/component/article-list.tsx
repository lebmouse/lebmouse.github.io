import { css } from "@/styled-system/css";
import Image from "next/image";

const articles = [
  {
    title: "My First Mixtape",
    description:
      "The art of the mixtape is a lost one. It was more than just a playlist - it was a carefully curated journey through emotions and memories.",
    date: "August 01, 2025",
    thumbnail: "https://picsum.photos/300/200?random=1",
  },
  {
    title: "Summer Roadtrip '98",
    description:
      "Windows down, volume up. That summer was defined by the soundtrack blasting from the car stereo, creating memories that would last a lifetime.",
    date: "July 28, 2025",
    thumbnail: "https://picsum.photos/300/200?random=2",
  },
  {
    title: "Finding Hidden Gems",
    description:
      "There was a thrill in recording songs from the radio, trying to perfectly time the start and end of each track.",
    date: "July 25, 2025",
    thumbnail: "https://picsum.photos/300/200?random=3",
  },
  {
    title: "The Mix Tape Era",
    description:
      "Creating the perfect mix tape was an art form. Hours spent selecting songs, arranging them in the right order, and crafting the perfect flow.",
    date: "July 20, 2025",
    thumbnail: "https://picsum.photos/300/200?random=4",
  },
  {
    title: "Analog Memories",
    description:
      "The warm sound of cassette tapes, the satisfying click when you pressed play, and the anticipation of what would come next.",
    date: "July 15, 2025",
    thumbnail: "https://picsum.photos/300/200?random=5",
  },
];

export function ArticleList() {
  return (
    <div
      className={css({
        display: "grid",
        gridTemplateColumns: {
          base: "1fr", // 작은 사이즈에서 1개
          md: "repeat(2, 1fr)", // 기본 2개
        },
        gap: "8",
        px: "2",
        minHeight: "100vh",
      })}
    >
      {articles.map((article) => (
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(145deg, #e8e8d8, #f0f0e0)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            // border: "2px solid #d0d0c0",
            position: "relative",
          })}
          key={article.title}
        >
          {/* 카세트테이프 핀/나사 */}
          <div
            className={css({
              position: "absolute",
              top: "8px",
              left: "8px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#8a8a8a",
              border: "1px solid #666",
            })}
          />
          <div
            className={css({
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#8a8a8a",
              border: "1px solid #666",
            })}
          />
          <div
            className={css({
              position: "absolute",
              bottom: "8px",
              left: "8px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#8a8a8a",
              border: "1px solid #666",
            })}
          />
          <div
            className={css({
              position: "absolute",
              bottom: "8px",
              right: "8px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#8a8a8a",
              border: "1px solid #666",
            })}
          />

          {/* 노트 스타일 제목 영역 */}
          <div
            className={css({
              background: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "4",
              borderBottom: "2px solid #e0e0e0",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            })}
          >
            <h2
              className={css({
                fontSize: "18px",
                fontWeight: "600",
                color: "#2c2c2c",
                fontFamily: "Georgia, serif",
                marginBottom: "4px",
                lineHeight: "1.3",
                position: "relative",
              })}
            >
              {article.title}
            </h2>
            <p
              className={css({
                fontSize: "12px",
                color: "#666",
                fontFamily: "Arial, sans-serif",
              })}
            >
              {article.date}
            </p>
          </div>

          {/* 카세트테이프 릴과 썸네일 */}
          <div
            className={css({
              position: "relative",
              background: "#2a2a2a",
              padding: "1",
              borderRadius: "8px",
              border: "2px solid #444",
            })}
          >
            {/* 썸네일 */}
            <div
              className={css({
                width: "100%",
                aspectRatio: "16/9",
                position: "relative",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid #333",
              })}
            >
              <Image
                src={article.thumbnail}
                alt={article.title}
                fill
                className={css({
                  objectFit: "cover",
                  objectPosition: "center",
                  filter:
                    "sepia(0.3) contrast(1.1) brightness(0.9) saturate(0.8)",
                })}
              />
            </div>

            {/* 왼쪽 릴 오버레이 */}
          </div>
        </div>
      ))}
    </div>
  );
}
