import { StoryBlock, GuideArticle } from "../types";

const WPM = 220;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Total word count across textual blocks. Images/dividers count as a flat 12 words (caption + view time). */
export function countBlockWords(blocks: StoryBlock[]): number {
  return blocks.reduce((sum, b) => {
    switch (b.type) {
      case "paragraph":
      case "heading":
        return sum + countWords(b.text);
      case "pullquote":
        return sum + countWords(b.text) + countWords(b.attribution || "");
      case "image":
        return sum + 12 + countWords(b.caption || "");
      case "gallery":
        return sum + b.images.length * 12 + b.images.reduce((s, i) => s + countWords(i.caption || ""), 0);
      case "divider":
        return sum;
    }
  }, 0);
}

/**
 * Returns a formatted reading time string for an article.
 * Prefers body_blocks word count when present; falls back to content string;
 * falls back to article.readTime when nothing else available.
 */
export function getReadingTime(article: GuideArticle): string {
  let words = 0;
  if (article.body_blocks && article.body_blocks.length > 0) {
    words = countBlockWords(article.body_blocks);
  } else if (article.content) {
    words = countWords(article.content);
  }
  if (words === 0) return article.readTime || "1 min read";
  const minutes = Math.max(1, Math.ceil(words / WPM));
  return `${minutes} min read`;
}
