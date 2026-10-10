export default function FullscreenControls({
  webpage,
  browser,
  onWebpage,
  onBrowser,
}: {
  webpage: boolean;
  browser: boolean;
  onWebpage: () => void;
  onBrowser: () => void;
}) {
  return (
    <div className="fullscreen-controls">
      <button
        data-webpage-fullscreen
        aria-label={webpage ? "Exit Webpage Fullscreen" : "Webpage Fullscreen"}
        aria-pressed={webpage}
        title={webpage ? "Exit Webpage Fullscreen" : "Webpage Fullscreen"}
        onClick={onWebpage}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h10v13H4zM10 4h10v10M15 9l5-5M15 4h5v5" />
        </svg>
        <span>
          {webpage ? "Exit Webpage Fullscreen" : "Webpage Fullscreen"}
        </span>
      </button>
      <button
        aria-label={browser ? "Exit Browser Fullscreen" : "Browser Fullscreen"}
        aria-pressed={browser}
        title={browser ? "Exit Browser Fullscreen" : "Browser Fullscreen"}
        onClick={onBrowser}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
        </svg>
        <span>
          {browser ? "Exit Browser Fullscreen" : "Browser Fullscreen"}
        </span>
      </button>
    </div>
  );
}
