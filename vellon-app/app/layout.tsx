import type { Metadata } from "next";
import type { Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAFA",
};

export const metadata: Metadata = {
  title: "Vellon.photos — Every angle, one gallery",
  description:
    "For weddings, debuts & celebrations. Guests scan a QR code and upload instantly — no app needed.",
  openGraph: {
    title: "Vellon.photos — Every angle, one gallery",
    description: "For weddings, debuts & celebrations. No app needed.",
    siteName: "Vellon.photos",
    url: "https://vellon.photos",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://oyxmgoqddnywnekogpdf.supabase.co" />
        <link rel="dns-prefetch" href="https://oyxmgoqddnywnekogpdf.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col bg-navy text-slate-100">
        {children}
      </body>
    </html>
  );
}
