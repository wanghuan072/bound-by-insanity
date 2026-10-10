import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { validateEvidenceChain } from "../src/lib/evidence-chain.mjs";
const load = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
export function imageDimensions(b) {
  if (b.toString("ascii", 1, 4) === "PNG")
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"
  ) {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8X")
      return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === "VP8L") {
      const bits = b.readUInt32LE(21);
      return [1 + (bits & 16383), 1 + ((bits >>> 14) & 16383)];
    }
    if (kind === "VP8 ")
      return [b.readUInt16LE(26) & 16383, b.readUInt16LE(28) & 16383];
  }
  throw Error("Unsupported image header");
}
export async function publicationEvidence() {
  const issues = [];
  const claims = await load("research/game-claim-matrix.json"),
    bp = await load("planning/page-content-blueprints.json"),
    video = await load("research/video-analysis.json"),
    media = await load("research/media-ledger.json"),
    evidence = await load("research/evidence.json");
  issues.push(
    ...validateEvidenceChain({
      claims: claims.claims,
      blueprints: bp.pages,
      observations: video.videos,
      media,
      evidence: evidence.evidence,
    }),
  );
  const adopted = media.filter((m) => m.status === "adopted");
  for (const m of adopted.filter((m) => m.localPath)) {
    try {
      const b = await fs.readFile("public" + m.localPath),
        dims = imageDimensions(b),
        hash = createHash("sha256").update(b).digest("hex");
      if (dims[0] !== m.width || dims[1] !== m.height || hash !== m.hash)
        throw Error("Media dimensions/hash changed");
    } catch (e) {
      issues.push({ media: m.id, issue: e.message });
    }
  }
  const main = await load("data/games/main-game.json"),
    topics = await Promise.all(
      ["characters", "endings"].map((id) =>
        load("data/topics/" + id + ".json"),
      ),
    );
  const records = [main, ...topics];
  for (const record of records) {
    const image = record.image ?? record.cover;
    if (!adopted.some((m) => m.localPath === image.src))
      issues.push({ id: record.id, issue: "Cover not adopted" });
    for (const b of (record.content ?? record.sections).flatMap(
      (s) => s.blocks,
    )) {
      if (b.type === "image" && !adopted.some((m) => m.localPath === b.src))
        issues.push({ id: record.id, issue: "Body image not adopted" });
      if (
        b.type === "video" &&
        !adopted.some(
          (m) => m.videoId === b.videoId && m.subjectGameId === main.id,
        )
      )
        issues.push({ id: record.id, issue: "Video not adopted" });
    }
  }
  const gameBrief = (await load("research/game-content-briefs.json")).find(
    (x) => x.game_id === main.id,
  );
  if (
    !gameBrief?.verified_cases?.length ||
    gameBrief?.screenshot_tasks?.length < 3 ||
    gameBrief?.youtube_research?.decision !== "adopted" ||
    gameBrief.youtube_research.adopted.length < 1 ||
    gameBrief.youtube_research.adopted.length > 3
  )
    issues.push({ id: main.id, issue: "Incomplete independent game brief" });
  const shots =
    gameBrief?.screenshot_tasks?.map((id) =>
      adopted.find((m) => m.id === id && m.kind === "game-capture"),
    ) ?? [];
  if (
    shots.some((x) => !x) ||
    new Set(shots.map((x) => x?.hash)).size !== 3 ||
    shots.some(
      (x) =>
        x?.hash === adopted.find((m) => m.localPath === main.image.src)?.hash,
    )
  )
    issues.push({
      id: main.id,
      issue: "Three independently adopted explanatory captures required",
    });
  const slots = await load("planning/media-slots.json");
  for (const s of slots.slots) {
    if (!["adopted", "not-adopted"].includes(s.adoption_status))
      issues.push({ slot: s.slot_id, issue: "Unresolved slot" });
    if (
      s.adoption_status === "adopted" &&
      !s.media_ledger_ids?.every((id) =>
        adopted.some((m) => m.id === id && m.slotId === s.slot_id),
      )
    )
      issues.push({ slot: s.slot_id, issue: "Adoption mismatch" });
  }
  return issues;
}
