import type { LocalMedia, Block } from "./game";
export interface Topic {
  id: string;
  slug: string;
  title: string;
  introduction: string;
  tags: string[];
  cover: LocalMedia;
  sections: { id: string; title: string; blocks: Block[] }[];
  relatedPageIds: string[];
}
