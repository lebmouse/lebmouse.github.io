import { css } from "@/styled-system/css";
import { MDXComponents } from "next-mdx-remote-client";

export const MainColorTheme = () => {
  const colorData = [
    { name: "accent", hex: "#ea580c" },
    { name: "card", hex: "#eae6da" },
    { name: "text", hex: "#1b1b1aff" },
    { name: "bg", hex: "#fffdf6" },
  ];

  return (
    <div
      className={css({
        display: "flex",
        flexWrap: "wrap",
        gap: "4",
        my: "2",
      })}
    >
      {colorData.map((color) => (
        <div
          key={color.hex}
          className={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          })}
        >
          <div
            style={{
              backgroundColor: color.hex,
            }}
            className={css({
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
            })}
          />
          <span
            className={css({
              fontSize: "0.875rem",
              fontWeight: "600",
            })}
          >
            {color.name}
          </span>
          <span
            className={css({
              fontSize: "0.75rem",
              color: "#666",
            })}
          >
            {color.hex}
          </span>
        </div>
      ))}
    </div>
  );
};

export const components: MDXComponents = {
  MainColorTheme,
};
