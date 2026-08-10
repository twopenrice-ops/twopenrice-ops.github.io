import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;
  const title = "Asia Miles 會員限定｜金豬食堂 OpenRice 專屬保留位";
  const description = "首爾一位難求，今晚為你留位。OpenRice 為 Asia Miles 會員保留四個週五晚間席次。";
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1536, height: 864 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
