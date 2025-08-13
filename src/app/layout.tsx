import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Risk Documentation Hub",
  description: "Secure, searchable library for risk-related documents with AI-powered insights",
  keywords: ["risk management", "compliance", "documentation", "AI", "security"],
  authors: [{ name: "Risk Documentation Hub" }],
  openGraph: {
    title: "Risk Documentation Hub",
    description: "Secure, searchable library for risk-related documents with AI-powered insights",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased min-h-full bg-gray-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
