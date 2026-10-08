import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Quest — Reverse-Engineered Career Roadmapper",
  description: "Reverse-engineer your dream technical role into an executable dependency graph with deterministic unlocking and actionable quests.",
  keywords: ["career roadmap", "software engineering", "learning path", "dependency graph", "skill progression"],
};

export const viewport: Viewport = {
  themeColor: "#050607",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#050607] text-[#F2F2EE]">
      <body className="min-h-screen bg-[#050607] text-[#F2F2EE] antialiased selection:bg-[#D8FF5A] selection:text-black">
        {children}
      </body>
    </html>
  );
}
