import type { Block } from "@/src/types/game";
export default function YouTubeVideo({
  video,
}: {
  video: Extract<Block, { type: "video" }>;
}) {
  return (
    <section className="video-section">
      <h2>{video.title}</h2>
      <p>{video.description}</p>
      <iframe
        className="video-frame"
        src={
          "https://www.youtube-nocookie.com/embed/" + video.videoId + "?rel=0"
        }
        title={video.title}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <p className="small muted">
        If the video cannot load, the written steps above remain available.
      </p>
    </section>
  );
}
