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
  "& code": {
    fontFamily: "monospace",
    backgroundColor: "gray.100",
    py: "0.5",
    px: "1",
    color: "orange.600",
    borderRadius: "md",
    fontSize: "sm",
  },
  "& pre": {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    backgroundColor: "gray.100",
    padding: "2",
    borderRadius: "md",
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
