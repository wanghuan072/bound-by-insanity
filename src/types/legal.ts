import type { Block } from "./game";
export interface Legal {
  id: string;
  title: string;
  blocks: Block[];
  sections: { id: string; title: string; blocks: Block[] }[];
}
