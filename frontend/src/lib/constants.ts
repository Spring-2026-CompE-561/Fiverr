export const GIG_CATEGORIES = [
  "Design",
  "Development",
  "Writing",
  "Marketing",
  "Video",
  "Music",
  "Photography",
  "Business",
  "Data",
  "Lifestyle",
] as const;

export type GigCategory = (typeof GIG_CATEGORIES)[number];
