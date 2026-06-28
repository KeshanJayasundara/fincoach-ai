import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinCoach AI — Your Money, Finally Under Control",
  description: "AI-powered finance coach for doctors, freelancers, students & more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Exact viewport fix for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

        {/* Exact fonts from your original HTML */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0D0B1A] text-white min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}