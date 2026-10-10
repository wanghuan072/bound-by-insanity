import { publicationEvidence } from "./publication-evidence.mjs";
import fs from "node:fs/promises";
import {
  validateRecord,
  validateLegal,
  bodyCount,
  validateSEO,
} from "../src/lib/schema.mjs";
import { staticTDK } from "../seo/tdk.js";
import {
  validatePublicScope,
  validateRouteFiles,
} from "../src/lib/site-scope.mjs";
const mode = process.argv[2] ?? "dev";
const files = [
  ["data/games/main-game.json", "game"],
  ["data/topics/characters.json", "topic"],
  ["data/topics/endings.json", "topic"],
];
const issues = [];
try {
  const pages = JSON.parse(await fs.readFile("data/legal/pages.json", "utf8"));
  if (pages.length !== 5 || new Set(pages.map((page) => page.id)).size !== 5)
    throw Error("Five unique Legal pages required");
  pages.forEach(validateLegal);
  const config = JSON.parse(
    await fs.readFile("data/site/generated-site.json", "utf8"),
  );
  if (
    config.origin !== "https://boundbyinsanity.org" ||
    config.contactEmail !== "support@boundbyinsanity.org" ||
    !config.fanNotice
  )
    throw Error("Site identity and support contact mismatch");
} catch (e) {
  issues.push({ file: "data/legal/pages.json", message: e.message });
}
try {
  const map = JSON.parse(
    await fs.readFile("planning/content-map.json", "utf8"),
  );
  const registry = JSON.parse(
    await fs.readFile("planning/route-registry.json", "utf8"),
  );
  validatePublicScope(map, registry);
  await validateRouteFiles(mode);
} catch (e) {
  issues.push({ file: "planning/route-registry.json", message: e.message });
}
for (const [file, kind] of files) {
  try {
    const value = JSON.parse(await fs.readFile(file, "utf8"));
    validateRecord(value, kind, mode);
    if (mode !== "dev" && kind === "game") {
      if (bodyCount(value.content) < 4000)
        throw Error("Main independent visible body below 4000 characters");
      const blocks = value.content.flatMap((s) => s.blocks);
      if (blocks.filter((b) => b.type === "image").length < 3)
        throw Error("Three distinct game screenshots required");
      if (blocks.filter((b) => b.type === "video").length < 1)
        throw Error("Approved game video required");
    }
    if (mode === "publish" && value.status !== "published")
      throw Error("Draft record is not public");
  } catch (e) {
    issues.push({ file, message: e.message });
  }
}
if (mode !== "dev") issues.push(...(await publicationEvidence()));
try {
  const ids = [
    "home",
    "characters",
    "endings",
    "privacy",
    "terms",
    "copyright",
    "about",
    "contact",
  ];
  if (
    Object.keys(staticTDK).length !== ids.length ||
    !ids.every((id) => Object.hasOwn(staticTDK, id))
  )
    throw Error("TDK must cover exactly the eight public pages");
  for (const field of ["title", "description"])
    if (
      new Set(Object.values(staticTDK).map((seo) => seo[field])).size !==
      ids.length
    )
      throw Error("Duplicate page " + field);
  for (const seo of Object.values(staticTDK))
    if (!Array.isArray(seo.keywords)) throw Error("Page keywords are required");
} catch (e) {
  issues.push({ file: "seo/tdk.js", message: e.message });
}
for (const [id, seo] of Object.entries(staticTDK))
  try {
    validateSEO(seo, "Bound By Insanity");
  } catch (e) {
    issues.push({ file: "seo/tdk.js", id, message: e.message });
  }
console.log(JSON.stringify({ mode, records: files.length, issues }, null, 2));
process.exitCode = issues.length ? 1 : 0;
