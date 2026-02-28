import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VyapaarAI - AI for your Business",
  description: "Enhance your products with AI-generated visuals and captions.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 text-slate-900 min-h-screen pb-16 pt-16`}>
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
          <Navbar />
          <main className="flex-1 w-full overflow-y-auto no-scrollbar relative animate-in fade-in duration-500 pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
