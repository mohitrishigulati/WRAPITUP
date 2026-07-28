import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateAdminAccess } from "../lib/auth/admin-access";

describe("admin route access", () => {
  it("rejects unauthenticated users", () => {
    const result = evaluateAdminAccess({ isAuthenticated: false, role: undefined });
    assert.equal(result.allowed, false);
    if (!result.allowed) assert.equal(result.reason, "unauthenticated");
  });

  it("rejects logged-in customers (user B) with forbidden", () => {
    const result = evaluateAdminAccess({ isAuthenticated: true, role: "CUSTOMER" });
    assert.equal(result.allowed, false);
    if (!result.allowed) assert.equal(result.reason, "forbidden");
  });

  it("allows admin role", () => {
    const result = evaluateAdminAccess({ isAuthenticated: true, role: "ADMIN" });
    assert.equal(result.allowed, true);
  });
});
