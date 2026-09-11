import { beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const apiFetch = mock(async <T>(_path: string): Promise<T> => [] as T);

mock.module("@/lib/api", () => ({
  apiFetch,
  getSessionId: () => "session-1",
  SESSION_KEY: "dohnut-session",
}));

const { useShop } = await import("@/store/use-shop");
const checkoutSource = readFileSync(
  resolve("src/components/dohnut/checkout-view.tsx"),
  "utf8",
);

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  apiFetch.mockReset();
  useShop.setState({
    cart: [],
    cartError: null,
    favorites: [],
    favoritesError: null,
    donuts: [],
    donutsError: null,
    loadingDonuts: false,
    search: "",
    filterType: "all",
    sort: "catalog",
  });
});

describe("commerce collection recovery", () => {
  test("preserves the previous cart and exposes a retryable error", async () => {
    const previousCart = [{ id: "cart-1" }] as any;
    apiFetch.mockImplementationOnce(async () => previousCart);
    await useShop.getState().loadCart();

    apiFetch.mockImplementationOnce(async () => {
      throw new Error("Cart service unavailable");
    });
    await useShop.getState().loadCart();

    expect(useShop.getState().cart).toEqual(previousCart);
    expect(useShop.getState().cartError).toBe("Cart service unavailable");
  });

  test("preserves the previous favorites and exposes a retryable error", async () => {
    const previousFavorites = [{ id: "favorite-1" }] as any;
    apiFetch.mockImplementationOnce(async () => previousFavorites);
    await useShop.getState().loadFavorites();

    apiFetch.mockImplementationOnce(async () => {
      throw new Error("Favorites service unavailable");
    });
    await useShop.getState().loadFavorites();

    expect(useShop.getState().favorites).toEqual(previousFavorites);
    expect(useShop.getState().favoritesError).toBe("Favorites service unavailable");
  });
});

describe("catalog request sequencing", () => {
  test("debounces search and keeps the newest response when the older one resolves last", async () => {
    const oldRequest = deferred<any[]>();
    const newRequest = deferred<any[]>();
    apiFetch.mockImplementation((path) =>
      path.includes("search=old") ? oldRequest.promise : newRequest.promise,
    );

    useShop.getState().setSearch("old");
    await Bun.sleep(350);
    useShop.getState().setSearch("new");
    await Bun.sleep(350);

    newRequest.resolve([{ id: "new-result" }] as any);
    await newRequest.promise;
    await Bun.sleep(0);
    oldRequest.resolve([{ id: "old-result" }] as any);
    await oldRequest.promise;
    await Bun.sleep(0);

    expect(useShop.getState().donuts).toEqual([{ id: "new-result" }]);
  });
});

describe("same-order payment retry contract", () => {
  test("reuses the saved order ID and session-scoped payment endpoint", () => {
    expect(checkoutSource).toContain("failedPaymentOrderId");
    expect(checkoutSource).toContain("const startPayment = async (");
    expect(checkoutSource).toContain('"x-session-id": getSessionId()');
    expect(checkoutSource).toContain('body: JSON.stringify({ orderId })');
    expect(checkoutSource).toContain("Retry payment");

    const retryBlock = checkoutSource.slice(
      checkoutSource.indexOf("const onRetryPayment"),
      checkoutSource.indexOf("const onPlace"),
    );
    expect(retryBlock).toContain("failedPaymentOrderId");
    expect(retryBlock).toContain("startPayment(");
    expect(retryBlock).not.toContain("checkout(");
  });
});
