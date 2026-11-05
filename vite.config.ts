import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export default defineConfig({
  plugins: [
    {
      name: "post-metadata",
      resolveId(id) {
        if (id === "virtual:post-sources") return "\0virtual:post-sources";
      },
      load(id) {
        if (id === "\0virtual:post-sources") {
          const dir = join(process.cwd(), "src/_posts");
          const data = Object.fromEntries(
            readdirSync(dir)
              .filter((f) => f.endsWith(".mdx"))
              .map((f) => [
                `../_posts/${f}`,
                readFileSync(join(dir, f), "utf8"),
              ]),
          );
          return `export default ${JSON.stringify(data)}`;
        }
      },
    },
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, failOnError: true },
    }),
    react(),
  ],
});
