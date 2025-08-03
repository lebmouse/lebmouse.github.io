import { css } from "@/styled-system/css";
import { hstack } from "@/styled-system/patterns";
import Link from "next/link";
import { GithubIcon } from "./github-icon";

export function Header() {
  return (
    <header
      className={css({
        position: "fixed",
        top: "2",
        left: 0,
        right: 0,
        w: "full",
        maxW: "prose",
        mx: "auto",
        borderRadius: "2xl",
        overflow: "hidden",
        zIndex: "1000 ",
      })}
    >
      <nav
        className={hstack({
          justify: "space-between",
          p: "4",
          bg: "#EAE6DA",
          borderRadius: "xl",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "md",
        })}
      >
        <Link
          href="/"
          className={css({
            color: "orange.600",
            fontWeight: "bold",
            fontSize: "lg",
            _hover: {
              textDecoration: "underline",
            },
          })}
        >
          younggwon&apos;s records
        </Link>
        <Link
          href="https://github.com/lebmouse"
          className={css({
            display: "flex",
            alignItems: "center",
            _hover: {
              transform: "scale(1.05)",
            },
            transition: "transform 0.2s ease-in-out",
          })}
        >
          <GithubIcon />
        </Link>
      </nav>
    </header>
  );
}
