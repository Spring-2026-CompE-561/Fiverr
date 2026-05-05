export const SEARCH_PLACEHOLDERS = [
  "Search for logo design...",
  "Search for web development...",
  "Search for video editing...",
  "Search for SEO writing...",
  "Search for social media marketing...",
  "Search for mobile app development...",
  "Search for photo editing...",
  "Search for voiceover...",
  "Search for data analysis...",
  "Search for UI/UX design...",
];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
