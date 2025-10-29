import { css } from "@/styled-system/css";

export const markdownStyles = css.raw({
  color: "gray.900",
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    color: "gray.950",
    fontWeight: "bold",
  },
  "& h1": {
    fontSize: "2xl",
    my: "3",
  },
  "& h2": {
    fontSize: "xl",
    my: "3.5",
  },
  "& h3": {
    fontSize: "lg",
    my: "3",
  },
  "& h4": {
    fontSize: "md",
    my: "2.5",
  },
  "& h5": {
    fontSize: "sm",
    my: "2",
  },
  "& h6": {
    fontSize: "xs",
    my: "1",
  },
  "& p": {
    fontSize: "md",
    my: "3",
    whiteSpace: "pre-wrap",
    letterSpacing: "tight",
  },
  "& a": {
    color: "blue.600",
    textDecoration: "underline",
  },
  "& ul": {
    listStyleType: "disc",
    paddingLeft: "6",
  },
  "& ol": {
    listStyleType: "decimal",
    paddingLeft: "4",
  },
  "& li": {
    marginBottom: "1",
    "& p": {
      margin: "0",
    },
  },
  "& blockquote": {
    borderLeftWidth: "4",
    borderLeftStyle: "solid",
    borderColor: "gray.300",
    paddingLeft: "4",
    marginLeft: "4",
    marginRight: "4",
    color: "gray.500",
  },
  // 인라인 코드 (pre 안에 없는 경우)
  "& code:not(pre code)": {
    fontFamily: "monospace",
    backgroundColor: "gray.100",
    py: "0.5",
    px: "1",
    color: "orange.600",
    borderRadius: "md",
    fontSize: "sm",
  },
  // 코드 블록 스타일 (Shiki/rehype-pretty-code)
  "& pre": {
    overflowX: "auto",
    padding: "1rem",
    borderRadius: "md",
    fontSize: "sm",
    lineHeight: "1.75",
    "& code": {
      fontFamily: "monospace",
      display: "block",
      minWidth: "100%",
      padding: "0",
      backgroundColor: "transparent",
      color: "inherit",
      fontSize: "inherit",
      whiteSpace: "pre",
      wordBreak: "normal",
    },
  },
  // 코드 블록 내부 줄 스타일
  "& pre code .line": {
    display: "block",
    minHeight: "1.5rem",
  },
  // 강조된 줄
  "& pre code .line.highlighted": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    display: "block",
    marginLeft: "-1rem",
    marginRight: "-1rem",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "blue.400",
  },
  // 강조된 단어
  "& pre code .word-highlighted": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "0.125rem 0.25rem",
    borderRadius: "0.25rem",
  },
  "& img": {
    maxWidth: "100%",
  },
  "& hr": {
    borderColor: "gray.300",
    borderWidth: "1px",
    margin: "4",
  },
  "& table": {
    width: "full",
    borderCollapse: "collapse",
    border: "1px solid",
    borderColor: "gray.300",
  },
  "& th, & td": {
    border: "1px solid",
    borderColor: "gray.300",
    padding: "2",
  },
  "& th": {
    backgroundColor: "gray.100",
  },
  "& strong": {
    fontWeight: "bold",
  },
  "& em": {
    fontStyle: "italic",
  },
});
