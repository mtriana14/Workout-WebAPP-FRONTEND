import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { MemberPortalProvider } from "@/app/lib/memberPortal";
import { GoogleAuthProvider } from "@/app/lib/GoogleAuthProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeraHealth",
  description: "HeraHealth coaching and wellness portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAuthProvider>
          <MemberPortalProvider>{children}</MemberPortalProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
