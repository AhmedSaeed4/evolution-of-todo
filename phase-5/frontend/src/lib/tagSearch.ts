/**
 * Tag Search Utility
 *
 * Parses search queries containing #tag syntax with PARTIAL MATCHING.
 *
 * Examples:
 *   "meeting #work"           → { search: "meeting", tags: ["work"] }
 *   "#work #urgent"           → { search: "", tags: ["work", "urgent"] }
 *   "meeting #work #urgent"   → { search: "meeting", tags: ["work", "urgent"] }
 *   "just a meeting"          → { search: "just a meeting", tags: [] }
 *   "#tes"                    → { search: "", tags: ["tes"] } → finds "test", "tes", etc.
 *   "#"                       → { search: "", tags: [] } → no filtering (empty tag)
 */

export interface ParsedSearch {
  /** Search text without #tags */
  search: string;
  /** Extracted tag names (without #) */
  tags: string[];
}

/**
 * Extracts #tags from a search query and returns the cleaned search text + tags.
 *
 * @param query - The raw search query (e.g., "meeting #work #urgent")
 * @returns Parsed search with clean search text and extracted tags
 */
export function parseSearchWithTags(query: string): ParsedSearch {
  // Match # followed by word characters (letters, numbers, underscore)
  const tagRegex = /#(\w+)/g;

  const tags: string[] = [];
  let match: RegExpExecArray | null;

  // Extract all tags
  while ((match = tagRegex.exec(query)) !== null) {
    const tag = match[1]; // The captured tag name without #
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  // Remove all #tags from the search query
  let search = query.replace(tagRegex, '').trim();

  // Also remove any incomplete # tags (just # without text) to avoid empty search
  // This handles case where user is typing "#" alone (empty tag)
  const incompleteTagRegex = /#\w*$/;
  search = search.replace(incompleteTagRegex, '').trim();

  return { search, tags };
}

/**
 * Checks if a task matches all the given tags.
 * A task matches if it has tags that START WITH each of the specified tags (partial matching).
 *
 * Example: If user types "#te", tasks with tags like "test", "team", "te" will match.
 *
 * @param task - The task to check
 * @param tags - Tags to match against (partial matching)
 * @returns true if task has all tags (partial match), false otherwise
 */
export function taskMatchesTags(task: { tags?: string[] }, tags: string[]): boolean {
  if (tags.length === 0) return true; // No tags to filter
  if (!task.tags || task.tags.length === 0) return false; // Task has no tags

  // Task must have at least one tag that STARTS WITH each of the specified tags
  return tags.every(searchTag =>
    task.tags?.some(taskTag => taskTag.toLowerCase().startsWith(searchTag.toLowerCase()))
  );
}

/**
 * Formats tags for display (e.g., "#work #urgent")
 */
export function formatTags(tags: string[]): string {
  return tags.map(tag => `#${tag}`).join(' ');
}
