import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hidden Supply — Private Reseller Network",
  description: "Private access to trusted inventory.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#F6F1E6]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#F6F1E6] font-sans antialiased text-[#050608]`}
      >
        {children}
      </body>
    </html>
  );
}
