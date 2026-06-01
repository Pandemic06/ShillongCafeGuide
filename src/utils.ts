/**
 * Computes the Levenshtein distance between two strings.
 */
export function getLevenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[len1][len2];
}

/**
 * Checks if a search query matches a target text, with high tolerance for typos.
 */
export function isFuzzyMatch(query: string, targetText: string): boolean {
  if (!query) return true;
  if (!targetText) return false;

  const queryLower = query.toLowerCase().trim();
  const targetLower = targetText.toLowerCase().trim();

  // If query is a direct substring of the target, it's a match!
  if (targetLower.includes(queryLower)) return true;

  // Split query into individual words/tokens
  const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 0);
  if (queryTokens.length === 0) return true;

  // Split target into words
  const targetWords = targetLower.split(/[^a-zA-Z0-9]+/).filter((w) => w.length > 0);

  // We want ALL query tokens to match something in the target.
  // E.g., if search is "cozy dylan", both "cozy" and "dylan" must match some word/part in target.
  return queryTokens.every((qToken) => {
    // 1. Direct substring check
    if (targetLower.includes(qToken)) return true;

    // 2. Check against each target word with Levenshtein distance
    return targetWords.some((tWord) => {
      // Direct substring match within words
      if (tWord.includes(qToken) || qToken.includes(tWord)) return true;

      const qLen = qToken.length;
      const tLen = tWord.length;

      // Determine threshold based on token length
      let threshold = 0;
      if (qLen <= 3) {
        threshold = 1; // permit 1 typo for short words
      } else if (qLen <= 6) {
        threshold = 2; // permit up to 2 typos for medium
      } else {
        threshold = 3; // permit up to 3 typos for long words
      }

      // Check full word distance
      const distance = getLevenshteinDistance(qToken, tWord);
      if (distance <= threshold) return true;

      // If we are looking at a prefix/substring match, check if prefix is similar
      if (tLen > qLen) {
        const prefix = tWord.substring(0, qLen);
        if (getLevenshteinDistance(qToken, prefix) <= Math.max(1, threshold - 1)) {
          return true;
        }
      }

      return false;
    });
  });
}
