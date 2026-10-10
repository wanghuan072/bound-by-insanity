import { site, canonical } from "../config/site.mjs";
import { getMainGame, getTopic, getLegal } from "../lib/content-loader.mjs";
import { tdk } from "../../seo/tdk.js";
import dates from "../../seo/page-lastmod.json" with { type: "json" };
export function pageGraph(id, path) {
  const topic = getTopic(id),
    legal = getLegal(id),
    game = id === "home" ? getMainGame() : null;
  const seo = tdk(id),
    url = canonical(path);
  const title = topic?.title ?? legal?.title ?? game?.title;
  const pageType =
    id === "about" ? "AboutPage" : id === "contact" ? "ContactPage" : "WebPage";
  const graph = [
    {
      "@type": pageType,
      "@id": url + "#page",
      url,
      name: seo.title,
      description: seo.description,
      inLanguage: site.language,
      image: canonical(site.socialImage),
      dateModified: game?.updatedAt ?? dates[id]?.date,
      ...(game?.publishedAt ? { datePublished: game.publishedAt } : {}),
      isPartOf: { "@id": canonical("/") + "#website" },
    },
  ];
  if (id !== "home") {
    const crumbs = [
      { name: "Home", item: canonical("/") },
      {
        name: topic ? (id === "characters" ? "Characters" : "Endings") : title,
        item: url,
      },
    ];
    graph.push({
      "@type": "BreadcrumbList",
      "@id": url + "#breadcrumbs",
      itemListElement: crumbs.map((x, i) => ({
        "@type": "ListItem",
        position: i + 1,
        ...x,
      })),
    });
    graph[0].breadcrumb = { "@id": url + "#breadcrumbs" };
  }
  if (game) {
    graph.push(
      {
        "@type": "WebSite",
        "@id": url + "#website",
        url,
        name: site.name,
        inLanguage: site.language,
      },
      {
        "@type": "VideoGame",
        "@id": url + "#game",
        name: game.title,
        url,
        description: game.shortDescription,
        image: canonical(game.image.src),
        genre: game.categories,
      },
    );
    graph[0].mainEntity = { "@id": url + "#game" };
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
