import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XDCExplorer - Smart AI-Powered Blockchain Explorer",
  description: "AI-powered blockchain explorer for XDC Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
