import fs from "node:fs/promises";
import path from "node:path";
export const previewMarker = "// OWNED_LOCAL_DRAFT_PREVIEW";
export async function inspectOwnedPreview(root = process.cwd()) {
  const app = path.resolve(root, "app");
  const directory = path.resolve(app, "%5F_preview");
  if (path.dirname(directory) !== app)
    throw Error("Preview escaped app directory");
  const route = path.join(directory, "[[...segments]]");
  const file = path.join(route, "page.tsx");
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    if (
      entries.length !== 1 ||
      entries[0].name !== "[[...segments]]" ||
      !entries[0].isDirectory()
    )
      throw Error("Unexpected preview contents; refusing cleanup or overwrite");
    const files = await fs.readdir(route, { withFileTypes: true });
    if (
      files.length !== 1 ||
      files[0].name !== "page.tsx" ||
      !files[0].isFile()
    )
      throw Error(
        "Unexpected preview route files; refusing cleanup or overwrite",
      );
    if (!(await fs.readFile(file, "utf8")).startsWith(previewMarker))
      throw Error("Unowned preview page; refusing cleanup or overwrite");
    // Reject a symlinked parent before any mutation, including nested directory junctions.
    if (
      (await fs.realpath(directory)) !== directory ||
      (await fs.realpath(route)) !== route
    )
      throw Error("Linked preview directory; refusing mutation");
    return { directory, route, file, exists: true };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    // A partially present route is unexpected, even if its page is missing.
    try {
      await fs.lstat(directory);
    } catch (missing) {
      if (missing.code === "ENOENT")
        return { directory, route, file, exists: false };
      throw missing;
    }
    throw Error("Incomplete preview route; refusing mutation");
  }
}
export async function removeOwnedPreview(root = process.cwd()) {
  const preview = await inspectOwnedPreview(root);
  if (!preview.exists) return false;
  // Remove only the owned file and now-empty directories. Never recursively delete.
  await fs.unlink(preview.file);
  await fs.rmdir(preview.route);
  await fs.rmdir(preview.directory);
  return true;
}
