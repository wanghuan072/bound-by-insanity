import main from "../../data/games/main-game.json" with { type: "json" };
import characters from "../../data/topics/characters.json" with { type: "json" };
import endings from "../../data/topics/endings.json" with { type: "json" };
import legal from "../../data/legal/pages.json" with { type: "json" };
import { validateRecord, validateLegal } from "./schema.mjs";
import { topicCard } from "./article-cards.mjs";
const records = {
  main: validateRecord(main, "game"),
  topics: [characters, endings].map((x) => validateRecord(x, "topic")),
  legal: legal.map(validateLegal),
};
export const getMainGame = () =>
  records.main.status === "published" ? records.main : null;
export const getTopic = (id) =>
  records.topics.find((x) => x.id === id && x.status === "published") ?? null;
export const getLegal = (id) => records.legal.find((x) => x.id === id) ?? null;
export const getPublishedTopics = () =>
  records.topics.filter((x) => x.status === "published");
export const getLegalPages = () => records.legal;
export function draftData() {
  if (process.env.NODE_ENV !== "development")
    throw new Error("Draft preview is development-only");
  return records;
}
export function articleCards(preview = false) {
  const topics = preview
    ? draftData().topics
    : records.topics.filter((x) => x.status === "published");
  return topics.map(topicCard);
}
