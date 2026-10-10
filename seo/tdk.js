// All public page titles, descriptions and keywords are defined here.
export const staticTDK = {
  home: {
    title: "Play Bound By Insanity Online - Visual Novel Demo",
    description:
      "Play Bound By Insanity online, meet Miles and Adrien, and follow the dark visual novel demo. Learn dialogue controls, save habits and how to revisit text.",
    keywords: [
      "Bound By Insanity",
      "Bound By Insanity online",
      "Bound By Insanity demo",
    ],
  },
  characters: {
    title: "Bound By Insanity Characters - Miles and Adrien",
    description:
      "Meet the protagonist, Miles and Adrien in Bound By Insanity. Explore their personalities, relationships and dialogue cues without revealing hidden twists.",
    keywords: [
      "Bound By Insanity",
      "Bound By Insanity characters",
      "Miles Falken",
      "Adrien Lockhart",
    ],
  },
  endings: {
    title: "Bound By Insanity Endings - Demo Choices and Routes",
    description:
      "Explore Bound By Insanity endings, Act 1 choices and replay tips. See what the demo lets us change and how its shared story differs from planned routes.",
    keywords: [
      "Bound By Insanity",
      "Bound By Insanity endings",
      "Bound By Insanity choices",
    ],
  },
  privacy: {
    title: "Privacy Policy for the Bound By Insanity Website",
    description:
      "Read the Bound By Insanity website privacy policy for game and YouTube embeds, browser storage and contact emails, including third-party privacy limits.",
    keywords: ["Bound By Insanity", "Bound By Insanity privacy policy"],
  },
  terms: {
    title: "Bound By Insanity Website - Terms of Service",
    description:
      "Read the Bound By Insanity website terms for personal use, mature story content and third-party games, including availability and browser save limitations.",
    keywords: ["Bound By Insanity", "Bound By Insanity terms of service"],
  },
  copyright: {
    title: "Bound By Insanity Copyright - Artwork and Site Content",
    description:
      "Read the Bound By Insanity copyright policy covering game artwork, original site writing and embedded videos, and learn how to report a rights concern.",
    keywords: ["Bound By Insanity", "Bound By Insanity copyright"],
  },
  about: {
    title: "About the Independent Bound By Insanity Website",
    description:
      "Learn about this independent Bound By Insanity website, where we explore the visual novel demo, its characters and choices, with practical help for players.",
    keywords: ["Bound By Insanity", "About Bound By Insanity website"],
  },
  contact: {
    title: "Contact Bound By Insanity About Website Issues",
    description:
      "Contact the Bound By Insanity website about page corrections, player or accessibility problems and rights concerns. Find the email and useful details to send.",
    keywords: ["Bound By Insanity", "Bound By Insanity website contact"],
  },
};

export function tdk(id) {
  if (!Object.hasOwn(staticTDK, id)) throw new Error("Missing page TDK: " + id);
  return staticTDK[id];
}
