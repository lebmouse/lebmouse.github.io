import { Noto_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/component/header";
import { css } from "@/styled-system/css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSans.variable} ${notoSansKR.variable} antialiased`}
    >
      <head></head>
      <body
        className={css({
          fontFamily: "var(--font-noto-sans), var(--font-noto-sans-kr)",
        })}
      >
        <Header />
        <main
          className={css({
            w: "full",
            minH: "100vh",
            pt: "6",
            pb: "28",
          })}
        >
          <div className={css({ maxW: "prose", mx: "auto", pt: "16" })}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
