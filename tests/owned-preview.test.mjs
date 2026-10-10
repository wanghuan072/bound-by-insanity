import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  inspectOwnedPreview,
  removeOwnedPreview,
  previewMarker,
} from "../scripts/owned-preview.mjs";

test("Preview cleanup removes only the owned page and preserves unexpected files", async () => {
  const root = await fs.mkdtemp(path.resolve("tests/.preview-fixture-"));
  const app = path.join(root, "app");
  const directory = path.join(app, "%5F_preview");
  const route = path.join(directory, "[[...segments]]");
  const page = path.join(route, "page.tsx");
  const extra = path.join(route, "user-notes.txt");
  try {
    assert.equal((await inspectOwnedPreview(root)).exists, false);
    await fs.mkdir(route, { recursive: true });
    await fs.writeFile(
      page,
      previewMarker + "\nexport default function Page(){}",
    );
    await fs.writeFile(extra, "Keep this user file");
    await assert.rejects(removeOwnedPreview(root), /Unexpected/);
    assert.equal(await fs.readFile(extra, "utf8"), "Keep this user file");
    assert.ok((await fs.readFile(page, "utf8")).startsWith(previewMarker));
    await fs.unlink(extra);
    await fs.writeFile(page, "Unowned page");
    await assert.rejects(removeOwnedPreview(root), /Unowned/);
    assert.equal(await fs.readFile(page, "utf8"), "Unowned page");
    await fs.writeFile(page, previewMarker);
    assert.equal(await removeOwnedPreview(root), true);
    assert.equal(await removeOwnedPreview(root), false);
  } finally {
    // Each known fixture is removed individually; unknown contents make rmdir fail.
    for (const file of [extra, page])
      await fs.unlink(file).catch((e) => {
        if (e.code !== "ENOENT") throw e;
      });
    for (const dir of [route, directory, app, root])
      await fs.rmdir(dir).catch((e) => {
        if (e.code !== "ENOENT") throw e;
      });
  }
});
