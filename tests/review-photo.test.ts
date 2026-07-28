import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildReviewImageFilename,
  isReviewPhotoOwnedByUser,
  isSafeReviewPhotoPath,
  isAllowedReviewPhotoSubmission,
} from "../lib/uploads/safe-image";

describe("review photo paths", () => {
  it("accepts user-owned local paths", () => {
    const userId = "cluser123abc";
    const filename = buildReviewImageFilename(userId, ".jpg");
    const url = `/uploads/reviews/${filename}`;
    assert.equal(isSafeReviewPhotoPath(url), true);
    assert.equal(isReviewPhotoOwnedByUser(url, userId), true);
    assert.equal(isAllowedReviewPhotoSubmission(url), true);
  });

  it("rejects another user's path", () => {
    const url = "/uploads/reviews/cluser123abc-1-deadbeef.jpg";
    assert.equal(isReviewPhotoOwnedByUser(url, "clother999xyz"), false);
  });

  it("rejects path traversal", () => {
    assert.equal(isSafeReviewPhotoPath("/uploads/reviews/../secrets"), false);
  });

  it("accepts remote URLs when S3_PUBLIC_URL matches", () => {
    const prev = process.env.S3_PUBLIC_URL;
    process.env.S3_PUBLIC_URL = "https://cdn.example.com/assets";
    try {
      const userId = "cluser123abc";
      const filename = buildReviewImageFilename(userId, ".png");
      const url = `https://cdn.example.com/assets/reviews/${filename}`;
      assert.equal(isSafeReviewPhotoPath(url), true);
      assert.equal(isReviewPhotoOwnedByUser(url, userId), true);
      assert.equal(isAllowedReviewPhotoSubmission(url), true);
      assert.equal(
        isAllowedReviewPhotoSubmission(`/uploads/reviews/${filename}`),
        false,
      );
    } finally {
      if (prev === undefined) delete process.env.S3_PUBLIC_URL;
      else process.env.S3_PUBLIC_URL = prev;
    }
  });
});
