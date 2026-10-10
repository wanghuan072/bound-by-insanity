import localFont from "next/font/local";

export const displayFont = localFont({
  src: "../../public/fonts/kalam-bold.woff2",
  weight: "700",
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: "Arial",
});
export const bodyFont = localFont({
  src: "../../public/fonts/source-sans-3.woff2",
  weight: "400 700",
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: "Arial",
});
export const accentFont = localFont({
  src: "../../public/fonts/caveat-semibold.woff2",
  weight: "600",
  variable: "--font-hand",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});
