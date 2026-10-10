import type { Metadata } from "next";
import { site, canonical } from "@/src/config/site.mjs";
export function pageMetadata(
  seo: { title: string; description: string; keywords: string[] },
  path: string,
  type: "website" | "article" = "website",
): Metadata {
  if (!seo.title || !seo.description)
    return { robots: { index: false, follow: false } };
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: canonical(path) },
    robots: { index: true, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical(path),
      siteName: site.name,
      type,
      locale: "en_US",
      images: [
        {
          url: canonical(site.socialImage),
          width: 1200,
          height: 630,
          type: "image/png",
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [canonical(site.socialImage)],
    },
  };
}
