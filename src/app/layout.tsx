import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus ERP Suite — Modular Business Operations Platform",
  description:
    "Enterprise-grade modular ERP SaaS for sales, inventory, CRM, and analytics. Built for both large enterprises and growing SMEs with an interactive, user-friendly interface.",
  keywords: ["ERP", "SaaS", "Inventory", "CRM", "Analytics", "Sales", "Business Operations", "Next.js"],
  authors: [{ name: "Nexus ERP" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Nexus ERP Suite",
    description: "Modular Business Operations Platform for modern enterprises",
    siteName: "Nexus ERP Suite",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
