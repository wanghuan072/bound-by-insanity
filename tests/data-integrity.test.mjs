import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { safeFrameURL, localImagePath } from "../src/lib/url-policy.mjs";
import {
  validateRecord,
  validateBlock,
  validDate,
} from "../src/lib/schema.mjs";
import { contentSecurityPolicy } from "../src/lib/security.mjs";
const main = JSON.parse(await fs.readFile("data/games/main-game.json", "utf8"));
test("Unsafe player addresses never become frame origins", () => {
  for (const url of [
    "",
    "javascript:alert(1)",
    "data:text/html,hi",
    "https://user:password@example.com",
    " https://example.com",
    "http://example.com",
    "https://example.com/\n",
  ])
    assert.equal(safeFrameURL(url), null);
  assert.equal(safeFrameURL(main.player.iframeSrc).href, main.player.iframeSrc);
});
test("Main draft retains identity; unknown fields fail", () => {
  validateRecord(main, "game");
  assert.throws(() =>
    validateRecord({ ...main, fallbackGame: "other" }, "game"),
  );
  assert.throws(() =>
    validateRecord({ ...main, relatedGameIds: ["other"] }, "game"),
  );
});
test("Real calendar dates reject normalized impossible dates", () => {
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-13-01"), false);
});
test("Content refuses raw HTML and arbitrary iframe blocks", () => {
  assert.throws(() =>
    validateBlock({ type: "iframe", src: "https://example.com" }),
  );
  assert.throws(() =>
    validateBlock({ type: "paragraph", text: "<script>unexpected</script>" }),
  );
  assert.throws(() =>
    validateBlock({ type: "table", columns: ["A", "B"], rows: [["one"]] }),
  );
});
test("Production CSP omits eval and derives the one configured origin", () => {
  const policy = contentSecurityPolicy(main, true, false);
  assert.ok(!policy.includes("unsafe-eval"));
  assert.ok(policy.includes(new URL(main.player.iframeSrc).origin));
  assert.ok(policy.includes("https://www.youtube-nocookie.com"));
  assert.ok(contentSecurityPolicy(main, false, true).includes("unsafe-eval"));
});
test("Image paths cannot escape the public image directory", () => {
  assert.equal(localImagePath("/images/../secrets.png"), false);
  assert.equal(localImagePath("https://example.com/image.png"), false);
  assert.equal(localImagePath("/images/games/cover.webp"), true);
});

import { nextContentDate } from "../src/lib/fingerprint.mjs";
test("Unchanged fingerprints preserve dates and changed cards update the parent", () => {
  const previous = { hash: "old", date: "2026-10-01" };
  assert.equal(nextContentDate(previous, "old", "2026-10-08"), previous);
  assert.deepEqual(nextContentDate(previous, "new", "2026-10-08"), {
    hash: "new",
    date: "2026-10-08",
  });
});
