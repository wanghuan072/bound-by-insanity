import { visiblePageFingerprint } from "./fingerprint.mjs";
import { topicCard } from "./article-cards.mjs";
export function contentSnapshots({
  main,
  topics,
  legal,
  staticTDK,
  site,
  mediaHashes,
}) {
  const clean = (record) =>
    Object.fromEntries(
      Object.entries(record).filter(
        ([k]) => !["publishedAt", "updatedAt", "status"].includes(k),
      ),
    );
  const assets = (value) => {
    const text = JSON.stringify(value);
    return Object.entries(mediaHashes).filter(
      ([src]) =>
        text.includes(src) ||
        [site.logo, site.socialImage, "/images/icon.png"].includes(src),
    );
  };
  const cards = topics.filter((x) => x.status === "published").map(topicCard);
  const all = {};
  const add = (id, path, kind, content, seo, visibleCards = []) => {
    all[id] = {
      id,
      path,
      kind,
      hash: visiblePageFingerprint({
        content,
        seo,
        navigation: site.navigation,
        legal: site.legal,
        footer: {
          siteName: site.name,
          copyrightYear: site.copyrightYear,
          fanNotice: site.fanNotice,
        },
        cards: visibleCards,
        mediaHashes: assets([content, visibleCards]),
        schemaVersion: 1,
      }),
    };
  };
  if (main.status === "published")
    add(main.id, "/", "game", clean(main), staticTDK.home, cards);
  for (const topic of topics.filter((x) => x.status === "published"))
    add(
      topic.id,
      "/" + topic.slug,
      "static",
      clean(topic),
      staticTDK[topic.id],
      cards
        .filter((x) => topic.relatedPageIds.includes(x.id))
        .map(({ title, path }) => ({ title, path })),
    );
  for (const page of legal)
    add(
      page.id,
      "/" + page.id,
      "static",
      {
        ...page,
        contact: page.id === "contact" ? site.contactEmail : null,
      },
      staticTDK[page.id],
    );
  if (
    new Set(Object.values(all).map((x) => x.path)).size !==
    Object.keys(all).length
  )
    throw Error("Duplicate canonical path");
  return all;
}
