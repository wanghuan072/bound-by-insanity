import { Suspense } from "react";
import { notFound } from "next/navigation";
import { draftData } from "@/src/lib/content-loader.mjs";
import HomePage from "@/src/page/home/HomePage";
import TopicPage from "@/src/page/topics/TopicPage";
import LegalPage from "@/src/page/legal/LegalPage";
import type { Game } from "@/src/types/game";
import type { Legal } from "@/src/types/legal";
import type { Topic } from "@/src/types/topic";
async function PreviewContent({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const pathname = "/" + ((await params).segments ?? []).join("/");
  const data = draftData();
  let page;
  if (pathname === "/")
    page = <HomePage game={data.main as unknown as Game} preview />;
  else {
    const topic = data.topics.find((x) => "/" + x.slug === pathname);
    const legal = data.legal.find((x) => "/" + x.id === pathname);
    if (topic) page = <TopicPage topic={topic as unknown as Topic} preview />;
    else if (legal) page = <LegalPage page={legal as Legal} preview />;
    else notFound();
  }
  return (
    <>
      <div className="preview-note">Local draft preview · not indexed</div>
      {page}
    </>
  );
}

export default function PreviewPage(props: {
  params: Promise<{ segments?: string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="container">
          Opening local preview…
        </main>
      }
    >
      <PreviewContent {...props} />
    </Suspense>
  );
}
