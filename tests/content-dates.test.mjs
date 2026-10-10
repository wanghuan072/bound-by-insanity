import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { contentSnapshots } from "../src/lib/content-snapshots.mjs";
import { staticTDK } from "../seo/tdk.js";
import { topicCard } from "../src/lib/article-cards.mjs";
const load = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const fixture = async () => ({
  main: await load("data/games/main-game.json"),
  topics: await Promise.all(
    ["characters", "endings"].map((id) => load("data/topics/" + id + ".json")),
  ),
  legal: await load("data/legal/pages.json"),
  site: await load("data/site/generated-site.json"),
  staticTDK,
  mediaHashes: Object.fromEntries(
    (await load("research/media-ledger.json"))
      .filter((x) => x.localPath)
      .map((x) => [x.localPath, x.hash]),
  ),
});
const changed = (a, b) =>
  Object.keys(b)
    .filter((k) => a[k]?.hash !== b[k].hash)
    .sort();

test("Visible topic cards derive their identity and presentation once", async () => {
  const d = await fixture();
  const cards = d.topics.map(topicCard);
  assert.deepEqual(
    cards.map((x) => x.displayTitle),
    ["Characters", "Choices & endings"],
  );
  assert.deepEqual(
    cards.map((x) => x.image.src),
    d.topics.map((x) => x.cover.src),
  );
  assert.deepEqual(
    cards.map((x) => x.path),
    ["/characters", "/endings"],
  );
  assert.throws(() => topicCard({ ...d.topics[0], id: "unknown" }));
});
test("content dates follow only affected visible pages in project-local isolated fixture", async () => {
  const dir = path.resolve("reports/.date-test-fixture");
  assert.ok(dir.startsWith(path.resolve("reports") + path.sep));
  await fs.mkdir(dir, { recursive: true });
  try {
    const original = await fixture();
    await fs.writeFile(path.join(dir, "data.json"), JSON.stringify(original));
    const baseline = contentSnapshots(original);
    assert.deepEqual(
      changed(baseline, contentSnapshots(structuredClone(original))),
      [],
    );
    assert.equal(baseline.guides, undefined);
    assert.equal(baseline["reading-controls"], undefined);
    let d = structuredClone(original);
    d.legal.find((x) => x.id === "privacy").blocks[0].text +=
      " A distinct policy clarification.";
    assert.deepEqual(changed(baseline, contentSnapshots(d)), ["privacy"]);
    d = structuredClone(original);
    d.site.contactEmail = "another@boundbyinsanity.org";
    assert.deepEqual(changed(baseline, contentSnapshots(d)), ["contact"]);
    d = structuredClone(original);
    d.site.fanNotice += " A revised visible notice.";
    assert.deepEqual(
      changed(baseline, contentSnapshots(d)),
      Object.keys(baseline).sort(),
    );
    d = structuredClone(original);
    d.main.content[0].blocks[0].text += " A distinct opening explanation.";
    assert.deepEqual(changed(baseline, contentSnapshots(d)), [
      "bound-by-insanity",
    ]);
    d = structuredClone(original);
    d.topics.find((x) => x.id === "endings").title += " Carefully";
    assert.deepEqual(changed(baseline, contentSnapshots(d)), [
      "bound-by-insanity",
      "characters",
      "endings",
    ]);
    d = structuredClone(original);
    const endings = d.topics.find((x) => x.id === "endings");
    d.mediaHashes[endings.cover.src] = "changed-image-bytes";
    assert.deepEqual(changed(baseline, contentSnapshots(d)), [
      "bound-by-insanity",
      "endings",
    ]);
    d = structuredClone(original);
    d.staticTDK.home.description += " Changed metadata.";
    assert.deepEqual(changed(baseline, contentSnapshots(d)), [
      "bound-by-insanity",
    ]);
    d = structuredClone(original);
    d.main.updatedAt = "2026-10-09";
    assert.deepEqual(changed(baseline, contentSnapshots(d)), []);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
