import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ナレッジボックス｜未契約・アップセル分析",
  description: "店舗スタッフ向け過去事例検索システム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
