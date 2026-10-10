import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  validatePublicScope,
  validateRouteFiles,
  publicPaths,
} from "../src/lib/site-scope.mjs";
import { publicationEvidence } from "../scripts/publication-evidence.mjs";
const load = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const map = await load("planning/content-map.json");
const registry = await load("planning/route-registry.json");

test("Only the approved navigation and five Legal pages can be generated", async () => {
  validatePublicScope(map, registry);
  assert.equal((await validateRouteFiles()).length, 8);
  const generated = await load("data/site/generated-site.json");
  assert.deepEqual(
    generated.routes.map((r) => r.path).sort(),
    [...publicPaths].sort(),
  );
  const stale = structuredClone(map);
  stale.pages.push({ page_id: "guides", path: "/guides" });
  assert.throws(() => validatePublicScope(stale, registry));
  const extra = structuredClone(registry);
  extra.staticPages.push({ id: "other-game", path: "/games/other-game" });
  assert.throws(() => validatePublicScope(map, extra));
});

test("Publication has no dependency on removed Guide or additional-game files", async () => {
  for (const p of [
    "data/guides",
    "data/games/games.json",
    "public/images/guides",
    "src/types/guide.ts",
    "src/components/content/ArticleTOC.tsx",
  ]) {
    await assert.rejects(fs.access(p), { code: "ENOENT" });
  }
  assert.deepEqual(await publicationEvidence(), []);
  const media = await load("research/media-ledger.json");
  assert.ok(
    media.every(
      (m) =>
        !m.slotId.startsWith("guide-") && !m.localPath?.includes("/guides/"),
    ),
  );
});
