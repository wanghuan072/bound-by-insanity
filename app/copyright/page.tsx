import { notFound } from "next/navigation";
import LegalPage from "@/src/page/legal/LegalPage";
import { getLegal } from "@/src/lib/content-loader.mjs";
import { tdk } from "@/seo/tdk";
import { pageMetadata } from "@/src/seo/metadata";
import type { Legal } from "@/src/types/legal";
export const metadata = pageMetadata(tdk("copyright"), "/copyright");
export default function Page() {
  const page = getLegal("copyright");
  if (!page) notFound();
  return <LegalPage page={page as Legal} />;
}
