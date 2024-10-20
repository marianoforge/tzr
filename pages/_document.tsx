import { Html, Head, Main, NextScript } from "next/document";
import { SpeedInsights } from "@vercel/speed-insights/next";
export default function Document() {
  return (
    <Html lang="en">
      <Head />

      <SpeedInsights />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
