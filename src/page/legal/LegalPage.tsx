import StructuredData from "@/src/components/content/StructuredData";
import Breadcrumbs from "@/src/components/layout/Breadcrumbs";
import ContentBlocks from "@/src/components/content/ContentBlocks";
import { contactEmail } from "@/src/config/site.mjs";
import { Fragment } from "react";
import type { Legal } from "@/src/types/legal";
import dates from "@/seo/page-lastmod.json";
export default function LegalPage({
  page,
  preview = false,
}: {
  page: Legal;
  preview?: boolean;
}) {
  const updated = (dates as Record<string, { date?: string }>)[page.id]?.date;
  return (
    <main id="main-content" className="container legal-page">
      <StructuredData id={page.id} path={"/" + page.id} />
      <Breadcrumbs
        items={[{ label: "Home", path: "/" }, { label: page.title }]}
        preview={preview}
      />
      <h1>{page.title}</h1>
      {updated && (
        <p className="small">
          Last updated: <time dateTime={updated}>{updated}</time>
        </p>
      )}
      <ContentBlocks blocks={page.blocks} />
      {page.id === "contact" && <p className="contact-email">{contactEmail}</p>}
      {page.sections.map((section) => (
        <Fragment key={section.id}>
          <h2 id={section.id}>{section.title}</h2>
          <ContentBlocks blocks={section.blocks} />
        </Fragment>
      ))}
    </main>
  );
}
