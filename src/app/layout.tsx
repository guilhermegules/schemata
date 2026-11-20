import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schemata - Architecture Documentation Platform",
  description: "Personal architecture documentation platform integrating Notion with Excalidraw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased h-screen w-screen overflow-hidden">{children}</body>
    </html>
  );
}
