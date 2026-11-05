import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import stylesheet from "../styles.css?url";
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "yg's records" },
    ],
    links: [
      { rel: "stylesheet", href: stylesheet },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: Root,
});
function Root() {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">younggwon's records</Link>
            <div>
              <Link to="/admin">관리자</Link>
              <a href="https://github.com/lebmouse">GitHub</a>
            </div>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}
