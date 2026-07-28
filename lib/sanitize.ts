import sanitizeHtml from "sanitize-html";

const REVIEW_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

/** Strip HTML; safe for storing and rendering as React text nodes. */
export function sanitizeReviewText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return sanitizeHtml(trimmed, REVIEW_SANITIZE_OPTIONS);
}
