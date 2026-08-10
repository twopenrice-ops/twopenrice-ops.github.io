import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;
  const title = "金豬食堂包場之夜｜OpenRice × Asia Miles";
  const description = "選擇金豬食堂台北包場場次與桌型，免下載 App、免註冊即可完成訂位。";
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1536, height: 910 }] },
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
