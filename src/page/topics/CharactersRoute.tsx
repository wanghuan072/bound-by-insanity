import { notFound } from "next/navigation";
import TopicPage from "@/src/page/topics/TopicPage";
import { getTopic } from "@/src/lib/content-loader.mjs";
import { tdk } from "@/seo/tdk";
import { pageMetadata } from "@/src/seo/metadata";
import type { Topic } from "@/src/types/topic";
export const metadata = pageMetadata(tdk("characters"), "/characters");
export default function Page() {
  const topic = getTopic("characters");
  if (!topic) notFound();
  return <TopicPage topic={topic as unknown as Topic} />;
}
