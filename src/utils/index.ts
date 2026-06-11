// Barrel export for src/utils
export * from "./cafeSchema";
export * from "./readingTime";

/**
 * Simple fuzzy/partial match helper used by App.tsx to filter cafes.
 * Returns true if the query is empty OR every space-separated token
 * appears somewhere in the target string (case-insensitive).
 */
export function isFuzzyMatch(query: string, target: string): boolean {
  if (!query || query.trim() === "") return true;
  const normalizedTarget = target.toLowerCase();
  const tokens = query.toLowerCase().trim().split(/\s+/);
  return tokens.every((token) => normalizedTarget.includes(token));
}
