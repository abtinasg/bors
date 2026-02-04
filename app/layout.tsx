import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "رهگیری قیمت بازار | داشبورد دلار، طلا و رمزارز",
  description: "پلتفرم رهگیری نرخ دلار، یورو، طلا و رمزارزها برای کاربران ایرانی. بدون معامله، فقط اطلاعات شفاف و به‌روز.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazir.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
