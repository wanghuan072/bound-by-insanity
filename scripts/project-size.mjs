import fs from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const directories = [],
  files = [],
  links = [];
async function walk(directory) {
  let bytes = 0,
    count = 0;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replaceAll(path.sep, "/");
    if (entry.isSymbolicLink()) {
      links.push(relative);
      continue;
    }
    if (entry.isDirectory()) {
      const size = await walk(absolute);
      bytes += size.bytes;
      count += size.count;
      directories.push({ path: relative, ...size });
    } else if (entry.isFile()) {
      const size = (await fs.stat(absolute)).size;
      bytes += size;
      count++;
      files.push({ path: relative, bytes: size });
    }
  }
  return { bytes, count };
}
const total = await walk(root);
const report = {
  root,
  measuredAt: new Date().toISOString(),
  total,
  topLevel: directories
    .filter((x) => !x.path.includes("/"))
    .sort((a, b) => b.bytes - a.bytes),
  directories: directories.sort((a, b) => b.bytes - a.bytes),
  largestFiles: files.sort((a, b) => b.bytes - a.bytes).slice(0, 80),
  linksNotFollowed: links,
};
const file = process.argv[2] ?? "reports/project-size.json";
const destination = path.resolve(root, file);
if (!destination.startsWith(root + path.sep))
  throw Error("Size report must stay inside this project");
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(file, JSON.stringify(report, null, 2) + "\n");
console.log(
  JSON.stringify(
    {
      total,
      topLevel: report.topLevel,
      largestDirectories: report.directories.slice(0, 25),
    },
    null,
    2,
  ),
);
