import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(file), "utf8");
const cardSource = read("src/components/dohnut/donut-card.tsx");
const detailSource = read("src/components/dohnut/detail-modal.tsx");
const checkoutSource = read("src/components/dohnut/checkout-view.tsx");
const headerSource = read("src/components/dohnut/dohnut-header.tsx");
const splashSource = read("src/components/dohnut/splash-screen.tsx");

describe("customer accessibility and stock contracts", () => {
  test("keeps card detail semantics separate from favorite and add actions", () => {
    expect(cardSource).not.toContain('role="button"');
    expect(cardSource).not.toContain("tabIndex={0}");
    expect(cardSource).toContain('aria-label={"View details for " + donut.name}');
    expect(cardSource).toContain("disabled={donut.stock <= 0}");
    expect(cardSource).toContain("if (donut.stock <= 0)");
  });

  test("bounds detail quantity and guards add-to-cart requests", () => {
    expect(detailSource).toContain("Math.min(1, donut.stock)");
    expect(detailSource).toContain("Math.min(donut.stock, q + 1)");
    expect(detailSource).toContain("qty > donut.stock");
    expect(detailSource).toContain("disabled={donut.stock <= 0 || qty >= donut.stock}");
  });

  test("uses a semantic checkout form with field-level validation feedback", () => {
    expect(checkoutSource).toContain("<form onSubmit={onPlace} noValidate>");
    expect(checkoutSource).toContain("event.preventDefault()");
    expect(checkoutSource).toContain("fieldRefs.current[firstInvalid]?.focus()");
    expect(checkoutSource).toContain("aria-describedby");
    expect(checkoutSource).toContain("aria-invalid");
    expect(checkoutSource).toContain("required");
  });

  test("observes the active scroll container and exposes an accessible splash bypass", () => {
    expect(headerSource).toContain("scrollContainer");
    expect(headerSource).toContain('target.addEventListener(\"scroll\"');
    expect(headerSource).toContain('target.removeEventListener(\"scroll\"');
    expect(splashSource).toContain("Skip intro");
    expect(splashSource).toContain('type="button"');
    expect(existsSync(resolve("public/brand/dohnut-mascot.png"))).toBe(true);
  });
});
