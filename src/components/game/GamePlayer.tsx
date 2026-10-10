"use client";
import { useEffect, useRef, useState } from "react";
import { safeFrameURL } from "@/src/lib/url-policy.mjs";
import type { Game } from "@/src/types/game";
import LocalImage from "@/src/components/content/LocalImage";
import FullscreenControls from "./FullscreenControls";
type PlayerState = "ready" | "loading" | "opened" | "timeout" | "failed";
export default function GamePlayer({ game }: { game: Game }) {
  const [state, setState] = useState<PlayerState>("ready");
  const [attempt, setAttempt] = useState(0);
  const [webpage, setWebpage] = useState(false);
  const [browser, setBrowser] = useState(false);
  const [feedback, setFeedback] = useState("");
  const wrapper = useRef<HTMLDivElement>(null);
  const play = useRef<HTMLButtonElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullscreenControl = () =>
    wrapper.current?.querySelector<HTMLButtonElement>(
      "button[data-webpage-fullscreen]",
    );
  useEffect(() => {
    if (state === "loading") fullscreenControl()?.focus();
  }, [state, attempt]);
  const clear = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  };
  useEffect(() => {
    if (state !== "loading") return;
    timeout.current = setTimeout(
      () => setState("timeout"),
      game.player.loadTimeoutMs,
    );
    return clear;
  }, [state, attempt, game.player.loadTimeoutMs]);
  useEffect(() => {
    const el = wrapper.current;
    const sync = () => setBrowser(document.fullscreenElement === el);
    document.addEventListener("fullscreenchange", sync);
    return () => {
      clear();
      document.removeEventListener("fullscreenchange", sync);
      if (document.fullscreenElement === el)
        void document.exitFullscreen().catch(() => {});
    };
  }, []);
  useEffect(() => {
    if (!webpage) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const disabled: { element: HTMLElement; wasInert: boolean }[] = [];
    let branch: HTMLElement | null = wrapper.current;
    while (branch?.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          disabled.push({ element: sibling, wasInert: sibling.inert });
          sibling.setAttribute("inert", "");
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
    const previous = document.body.style.overflow;
    const scroll = window.scrollY;
    document.body.style.overflow = "hidden";
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setWebpage(false);
        fullscreenControl()?.focus();
      }
      if (e.key === "Tab" && wrapper.current) {
        const controls = Array.from(
          wrapper.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), iframe, [tabindex="0"]',
          ),
        ).filter((el) => el.getClientRects().length > 0);
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
      for (const { element, wasInert } of disabled)
        if (wasInert) element.setAttribute("inert", "");
        else element.removeAttribute("inert");
      window.scrollTo(0, scroll);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [webpage]);
  useEffect(() => {
    if (!browser) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        void document.exitFullscreen().catch(() => {});
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [browser]);
  const start = () => {
    clear();
    setFeedback("");
    if (!safeFrameURL(game.player.iframeSrc)) {
      setState("failed");
      return;
    }
    setAttempt((x) => x + 1);
    setState("loading");
  };
  const toggleBrowser = async () => {
    setFeedback("");
    try {
      if (browser) {
        await document.exitFullscreen();
        return;
      }
      setWebpage(false);
      if (document.fullscreenElement) await document.exitFullscreen();
      if (!wrapper.current?.requestFullscreen) throw new Error("unavailable");
      await wrapper.current.requestFullscreen();
    } catch {
      setFeedback(
        "Browser fullscreen is unavailable here. We can use Webpage Fullscreen instead.",
      );
    }
  };
  const toggleWebpage = async () => {
    if (document.fullscreenElement)
      await document.exitFullscreen().catch(() => {});
    setWebpage((x) => !x);
  };
  const active = state === "loading" || state === "opened";
  const message =
    state === "timeout"
      ? "The game did not respond in time. Retry to open a fresh window."
      : state === "failed"
        ? "This game address cannot be opened safely. Retry after the address is updated."
        : "";
  return (
    <div
      className={"game-player" + (webpage ? " webpage-fullscreen" : "")}
      ref={wrapper}
      role={webpage ? "dialog" : undefined}
      aria-modal={webpage || undefined}
      aria-label={webpage ? game.title + " fullscreen player" : undefined}
      data-game-id={game.id}
      data-player-state={state}
      aria-busy={state === "loading"}
    >
      <div
        className="player-stage"
        style={{ aspectRatio: game.player.aspectRatio ?? 16 / 9 }}
      >
        {active ? (
          <iframe
            key={attempt}
            data-game-frame
            title={game.title + " game"}
            src={game.player.iframeSrc}
            sandbox={game.player.sandbox ?? "allow-scripts allow-same-origin"}
            allow={game.player.permissionsPolicy.join("; ")}
            referrerPolicy={
              (game.player.referrerPolicy ??
                "no-referrer") as React.HTMLAttributeReferrerPolicy
            }
            allowFullScreen
            onLoad={() => {
              clear();
              setState("opened");
            }}
            onError={() => {
              clear();
              setState("failed");
            }}
          />
        ) : (
          <>
            <LocalImage image={game.image} priority className="player-cover" />
            <div className="player-prompt">
              {state === "ready" ? (
                <button ref={play} className="play-button" onClick={start}>
                  <span aria-hidden="true">▶</span> Play Now
                </button>
              ) : (
                <div className="player-failure">
                  <p>{message}</p>
                  <button ref={play} className="play-button" onClick={start}>
                    Retry
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="player-status">
        <div className="player-identity">
          <strong>{game.title}</strong>
          <span role="status" aria-live="polite">
            {state === "ready"
              ? "Ready to play"
              : state === "loading"
                ? "Opening game…"
                : state === "opened"
                  ? "Game window opened"
                  : state === "timeout"
                    ? "Opening timed out"
                    : "Unable to open"}
          </span>
        </div>
        <FullscreenControls
          webpage={webpage}
          browser={browser}
          onWebpage={() => void toggleWebpage()}
          onBrowser={() => void toggleBrowser()}
        />
      </div>
      {feedback && (
        <div className="player-feedback">
          <p role="alert">{feedback}</p>
        </div>
      )}
    </div>
  );
}
