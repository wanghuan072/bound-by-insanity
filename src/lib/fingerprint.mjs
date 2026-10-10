import { createHash } from "node:crypto";
export const fingerprint = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function visiblePageFingerprint({
  content,
  seo,
  navigation,
  legal,
  footer = {},
  cards = [],
  mediaHashes = [],
  schemaVersion = 1,
}) {
  return fingerprint({
    content,
    seo,
    navigation,
    legal,
    footer,
    cards,
    mediaHashes,
    schemaVersion,
  });
}
export function nextContentDate(previous, hash, today) {
  if (previous?.hash === hash) return previous;
  return { hash, date: today };
}
