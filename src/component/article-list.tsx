import { css } from "@/styled-system/css";

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
        display: "flex",
        flexDirection: "column",
        gap: "10",
        px: "2",
        minHeight: "100vh",
      })}
    >
      {articles.map((article) => (
        <div
          key={article.title}
          className={css({
            _hover: {
              cursor: "pointer",
              textDecoration: "underline",
            },
          })}
        >
          <h2
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              color: "gray.900",
            })}
          >
            {article.title}
          </h2>
          <p className={css({ fontSize: "sm", color: "gray.700" })}>
            {article.date}
          </p>
          <p className={css({ fontSize: "md" })}>{article.description}</p>
        </div>
      ))}
    </div>
  );
}
