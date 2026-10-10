import { notFound } from "next/navigation";
import HomePage from "@/src/page/home/HomePage";
import { getMainGame } from "@/src/lib/content-loader.mjs";
import { tdk } from "@/seo/tdk";
import { pageMetadata } from "@/src/seo/metadata";
import type { Game } from "@/src/types/game";
export function generateMetadata() {
  const game = getMainGame();
  return game ? pageMetadata(tdk("home"), "/") : {};
}
export default function Page() {
  const game = getMainGame();
  if (!game) notFound();
  return <HomePage game={game as unknown as Game} />;
}
