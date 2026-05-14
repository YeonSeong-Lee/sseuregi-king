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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sseuregi-king.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Trash Dex — sseuregi-killer",
    template: "%s · sseuregi-killer",
  },
  description: "Scan your trash and learn how to dispose of it correctly in Korea.",
  applicationName: "sseuregi-killer",
  openGraph: {
    type: "website",
    siteName: "sseuregi-killer",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Trash Dex — a trash-bag mascot peers through a telescope at the night sky" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.ico" },
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
