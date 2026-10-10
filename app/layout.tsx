import { Suspense } from "react";
import {
  StaticHeader,
  StaticFooter,
} from "@/src/components/layout/StaticShell";
import type { Metadata, Viewport } from "next";
import SiteHeader from "@/src/components/layout/SiteHeader";
import SiteFooter from "@/src/components/layout/SiteFooter";
import { site } from "@/src/config/site.mjs";
import { displayFont, bodyFont, accentFont } from "@/src/config/fonts";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: site.name,
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0d",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={site.language}
      className={`${displayFont.variable} ${bodyFont.variable} ${accentFont.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Suspense fallback={<StaticHeader />}>
          <SiteHeader />
        </Suspense>
        {children}
        <Suspense fallback={<StaticFooter />}>
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
