import { describe, it, expect } from "vitest";
import { cacheService } from "../src/lib/redis/redis";

describe("Redis Cache & Rate Limiting Service Tests", () => {
  it("stores and retrieves cached data correctly", async () => {
    const key = "test:unit:key1";
    const payload = { templateId: "123", title: "Test Template" };

    await cacheService.set(key, payload, 60);
    const retrieved = await cacheService.get<typeof payload>(key);

    expect(retrieved).toEqual(payload);
  });

  it("deletes cached keys on demand", async () => {
    const key = "test:unit:delKey";
    await cacheService.set(key, "data", 60);
    await cacheService.del(key);

    const retrieved = await cacheService.get(key);
    expect(retrieved).toBeNull();
  });

  it("invalidates cache keys by prefix pattern", async () => {
    await cacheService.set("templates:public:all:1", "item1", 60);
    await cacheService.set("templates:public:proposals:2", "item2", 60);
    await cacheService.set("other:key:3", "item3", 60);

    await cacheService.invalidatePrefix("templates:public:");

    expect(await cacheService.get("templates:public:all:1")).toBeNull();
    expect(await cacheService.get("templates:public:proposals:2")).toBeNull();
    expect(await cacheService.get("other:key:3")).toEqual("item3");
  });

  it("enforces rate limits accurately", async () => {
    const id = "user-ratelimit-test";
    const limit = 3;

    const r1 = await cacheService.checkRateLimit(id, limit, 10);
    expect(r1.allowed).toBe(true);

    const r2 = await cacheService.checkRateLimit(id, limit, 10);
    expect(r2.allowed).toBe(true);

    const r3 = await cacheService.checkRateLimit(id, limit, 10);
    expect(r3.allowed).toBe(true);

    const r4 = await cacheService.checkRateLimit(id, limit, 10);
    expect(r4.allowed).toBe(false);
  });
});
