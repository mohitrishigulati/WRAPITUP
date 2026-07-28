import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeReviewText } from "../lib/sanitize";

describe("sanitizeReviewText", () => {
  it("strips script tags and HTML", () => {
    const input = '<script>alert("xss")</script>Great product';
    assert.equal(sanitizeReviewText(input), "Great product");
  });

  it("returns null for empty strings", () => {
    assert.equal(sanitizeReviewText("   "), null);
    assert.equal(sanitizeReviewText(null), null);
  });

  it("preserves plain text", () => {
    assert.equal(sanitizeReviewText("  Soft and cozy  "), "Soft and cozy");
  });
});
