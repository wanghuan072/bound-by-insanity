import StructuredData from "@/src/components/content/StructuredData";
import Link from "@/src/components/layout/SiteLink";
import BoundaryRail from "@/src/components/layout/BoundaryRail";
import GamePlayer from "@/src/components/game/GamePlayer";
import ContentBlocks, { Chapter } from "@/src/components/content/ContentBlocks";
import LocalImage from "@/src/components/content/LocalImage";
import YouTubeVideo from "@/src/components/content/YouTubeVideo";
import { articleCards } from "@/src/lib/content-loader.mjs";
import { pageHref } from "@/src/config/navigation.mjs";
import type { Game, Block } from "@/src/types/game";
export default function HomePage({
  game,
  preview = false,
}: {
  game: Game;
  preview?: boolean;
}) {
  const cards = articleCards(preview);
  const openingWarning = game.content[0]?.blocks.find(
    (block) => block.type === "callout" && block.tone === "warning",
  );
  const videos = game.content
    .flatMap((s) => s.blocks)
    .filter((b): b is Extract<Block, { type: "video" }> => b.type === "video");
  return (
    <main id="main-content" className="container home-page">
      {!preview && <StructuredData id="home" path="/" />}
      <div className="game-layout">
        <div className="game-main">
          <div className="home-heading">
            <p className="eyebrow">A psychological visual novel · 18+</p>
            <h1>Play {game.title} Online</h1>
            {game.shortDescription && (
              <p className="lead">{game.shortDescription}</p>
            )}
          </div>
          <GamePlayer key={game.id} game={game} />
          {openingWarning && (
            <ContentBlocks blocks={[openingWarning as Block]} />
          )}
          <article
            className="game-body"
            aria-label={game.title + " player guide"}
          >
            {game.content.map((s, index) => (
              <Chapter
                key={s.id}
                id={s.id}
                title={s.heading}
                blocks={
                  s.blocks.filter(
                    (block) => block !== openingWarning,
                  ) as Block[]
                }
                index={index + 1}
              />
            ))}
          </article>
          {videos.map((v) => (
            <YouTubeVideo key={v.videoId} video={v} />
          ))}
        </div>
        <BoundaryRail>
          <h2>Follow the story</h2>
          {cards.map((x, index) => (
            <Link
              key={x.id}
              className="task-card"
              href={pageHref(x.path, preview)}
              prefetch={false}
            >
              <h3>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {x.displayTitle}
              </h3>
              <LocalImage image={x.image} className="task-image" />
              <div>
                {x.lead && <p>{x.lead}</p>}
                <span>
                  {x.action} <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
          ))}
        </BoundaryRail>
      </div>
    </main>
  );
}
