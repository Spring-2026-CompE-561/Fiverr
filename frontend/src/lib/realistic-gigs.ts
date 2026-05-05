export const SEARCH_PLACEHOLDERS = [
  "Search plumbing, tutoring, logo design...",
  "Try tech support or yard work",
  "Find help for moving, cleaning, repairs...",
  "Search by service, skill, or keyword",
] as const;

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
