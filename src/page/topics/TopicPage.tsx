import { articleCards } from "@/src/lib/content-loader.mjs";
import StructuredData from "@/src/components/content/StructuredData";
import Link from "@/src/components/layout/SiteLink";
import Breadcrumbs from "@/src/components/layout/Breadcrumbs";
import LocalImage from "@/src/components/content/LocalImage";
import { Chapter } from "@/src/components/content/ContentBlocks";
import YouTubeVideo from "@/src/components/content/YouTubeVideo";
import { pageHref } from "@/src/config/navigation.mjs";
import type { Topic } from "@/src/types/topic";
import type { Block } from "@/src/types/game";
export default function TopicPage({
  topic,
  preview = false,
}: {
  topic: Topic;
  preview?: boolean;
}) {
  const related = articleCards(preview).filter((x) =>
    topic.relatedPageIds.includes(x.id),
  );
  const videos = topic.sections
    .flatMap((x) => x.blocks)
    .filter((b): b is Extract<Block, { type: "video" }> => b.type === "video");
  return (
    <main id="main-content" className={"container topic-page " + topic.id}>
      {!preview && <StructuredData id={topic.id} path={"/" + topic.slug} />}
      <Breadcrumbs
        items={[
          { label: "Home", path: "/" },
          { label: topic.id === "characters" ? "Characters" : "Endings" },
        ]}
        preview={preview}
      />
      <header className="article-heading">
        <p className="eyebrow">
          {topic.id === "characters"
            ? "Read the encounters"
            : "Choices in the current demo"}
        </p>
        <h1>{topic.title}</h1>
        {topic.introduction && <p className="lead">{topic.introduction}</p>}
        <LocalImage image={topic.cover} className="article-cover" priority />
      </header>
      <article className="topic-body">
        {topic.sections.map((s, index) => (
          <Chapter
            key={s.id}
            id={s.id}
            title={s.title}
            blocks={s.blocks}
            index={index + 1}
          />
        ))}
      </article>
      {videos.map((v) => (
        <YouTubeVideo key={v.videoId} video={v} />
      ))}
      <nav className="related-links" aria-label="Related reading">
        {related.map((x) => (
          <Link key={x.id} href={pageHref(x.path, preview)}>
            {x.title} →
          </Link>
        ))}
      </nav>
      <Link
        className="text-action"
        href={pageHref("/", preview)}
        prefetch={false}
      >
        Return to Bound By Insanity →
      </Link>
    </main>
  );
}
