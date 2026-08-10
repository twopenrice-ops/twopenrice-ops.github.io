import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;
  const title = "Asia Miles 會員限定｜金豬食堂台北包場";
  const description = "不用飛首爾，也不用排兩小時。四個週五晚上，Asia Miles 為會員保留金豬食堂台北包場席次。";
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
