import { Analytics } from "@vercel/analytics/react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <Analytics />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
