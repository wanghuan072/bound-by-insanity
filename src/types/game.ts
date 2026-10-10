export interface LocalMedia {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
}
export type Block =
  | { type: "paragraph"; text: string }
  | ({ type: "image"; caption?: string } & LocalMedia)
  | { type: "list"; style: "ordered" | "unordered"; items: string[] }
  | { type: "steps"; items: { title: string; body: string }[] }
  | {
      type: "callout";
      tone: "info" | "tip" | "warning";
      label?: string;
      body: string;
    }
  | { type: "table"; columns: string[]; rows: string[][] }
  | {
      type: "video";
      provider: "youtube";
      videoId: string;
      title: string;
      description: string;
      poster?: LocalMedia;
    }
  | { type: "faq"; items: { question: string; answer: string }[] };
export interface Game {
  id: string;
  title: string;
  shortDescription: string;
  image: LocalMedia;
  player: {
    iframeSrc: string;
    aspectRatio: number | null;
    orientation: string;
    permissionsPolicy: string[];
    referrerPolicy: string | null;
    sandbox: string | null;
    loadTimeoutMs: number;
  };
  content: { id: string; heading: string; blocks: Block[] }[];
  publishedAt: string | null;
  updatedAt: string | null;
}
