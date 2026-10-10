import type { MetadataRoute } from "next";
import { canonical } from "@/src/config/site.mjs";
import {
  getMainGame,
  getPublishedTopics,
  getLegalPages,
} from "@/src/lib/content-loader.mjs";
import dates from "@/seo/page-lastmod.json";
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const game = getMainGame();
  if (game)
    entries.push({
      url: canonical("/"),
      lastModified: game.updatedAt ?? undefined,
    });
  for (const page of [
    ...getPublishedTopics().map((topic) => ({
      id: topic.id,
      path: "/" + topic.slug,
    })),
    ...getLegalPages().map((legal) => ({ id: legal.id, path: "/" + legal.id })),
  ]) {
    const date = (dates as Record<string, { date?: string }>)[page.id]?.date;
    entries.push({ url: canonical(page.path), lastModified: date });
  }
  if (new Set(entries.map((entry) => entry.url)).size !== entries.length)
    throw new Error("Duplicate sitemap canonical URL");
  return entries;
}
