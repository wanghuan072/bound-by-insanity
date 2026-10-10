import type { MetadataRoute } from "next";
import { canonical } from "@/src/config/site.mjs";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/__preview/" },
    sitemap: canonical("/sitemap.xml"),
  };
}
