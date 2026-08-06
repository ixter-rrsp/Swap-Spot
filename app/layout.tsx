import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "./components/Layout/Navbar/ConditionalNavBar";
import Providers from "./components/Providers/Providers";
import { getUnreadActivityCount } from "@/lib/services/ServerNotificationService";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwapSpot",
  description: "A barter system for trading items.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const unreadCount = await getUnreadActivityCount();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{
        height: "100%",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      </head>

      <body
        style={{
          margin: 0,
          padding: 0,
          height: "100dvh",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Providers>
          <ConditionalNavbar unreadCount={unreadCount} />

          <main
            id="main-scroll"
            style={{
              flex: 1,
              overflow: "auto",
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {children}
          </main>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}