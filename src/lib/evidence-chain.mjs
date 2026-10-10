export function validateEvidenceChain({
  claims,
  blueprints,
  observations,
  media,
  evidence = [],
}) {
  const issues = [];
  const claimIds = new Set(claims.map((x) => x.id)),
    evidenceIds = new Set(evidence.map((x) => x.id));
  for (const page of blueprints)
    for (const section of page.sections ?? [])
      for (const id of section.claim_ids ?? [])
        if (!claimIds.has(id))
          issues.push({ page: page.page_id, missingClaim: id });
  for (const claim of claims.filter((c) => c.gameId === "bound-by-insanity"))
    for (const id of claim.supportingEvidenceIds ?? [])
      if (!evidenceIds.has(id))
        issues.push({ claim: claim.id, missingEvidence: id });
  for (const item of media.filter((m) => m.status === "adopted")) {
    if (
      item.subjectGameId !== "bound-by-insanity" ||
      item.rightsStatus !== "approved" ||
      !item.rightsBasis ||
      !item.slotId
    )
      issues.push({ media: item.id, issue: "Missing identity/rights/slot" });
    if (item.kind === "video-embed") {
      const video = observations.find(
        (v) =>
          v.id === item.videoAnalysisId &&
          v.videoId === item.videoId &&
          v.gameId === item.subjectGameId,
      );
      if (
        !video?.pageUses?.length ||
        !item.reviewedRangeIds?.length ||
        item.embedStatus !== "verified" ||
        item.ageRestrictionStatus !== "clear" ||
        !item.publisherName
      )
        issues.push({ media: item.id, issue: "Missing verified video use" });
      for (const id of item.reviewedRangeIds ?? []) {
        const range = video?.segments?.find((s) => s.id === id);
        if (
          !range ||
          range.end <= range.start ||
          !range.supports?.length ||
          !range.cannotSupport?.length
        )
          issues.push({ media: item.id, missingRange: id });
      }
    }
  }
  return issues;
}
