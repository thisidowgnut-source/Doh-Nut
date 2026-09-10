import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { isAdminRequest } from "@/lib/admin-auth";

describe("admin security & auth helpers", () => {
  const originalKey = process.env.ADMIN_API_KEY;

  afterEach(() => {
    if (originalKey !== undefined) {
      process.env.ADMIN_API_KEY = originalKey;
    } else {
      delete process.env.ADMIN_API_KEY;
    }
  });

  test("isAdminRequest returns false when ADMIN_API_KEY is unset", () => {
    delete process.env.ADMIN_API_KEY;
    const req = new Request("http://localhost/api/orders/123", {
      headers: { "x-admin-key": "some-key" },
    });
    expect(isAdminRequest(req)).toBe(false);
  });

  test("isAdminRequest returns false when x-admin-key header is missing", () => {
    process.env.ADMIN_API_KEY = "valid-secret-key";
    const req = new Request("http://localhost/api/orders/123");
    expect(isAdminRequest(req)).toBe(false);
  });

  test("isAdminRequest returns false when x-admin-key is incorrect", () => {
    process.env.ADMIN_API_KEY = "valid-secret-key";
    const req = new Request("http://localhost/api/orders/123", {
      headers: { "x-admin-key": "wrong-secret-key" },
    });
    expect(isAdminRequest(req)).toBe(false);
  });

  test("isAdminRequest returns true when x-admin-key strictly matches", () => {
    process.env.ADMIN_API_KEY = "valid-secret-key";
    const req = new Request("http://localhost/api/orders/123", {
      headers: { "x-admin-key": "valid-secret-key" },
    });
    expect(isAdminRequest(req)).toBe(true);
  });
});
