import { describe, it, expect } from "vitest";
import { generateSecureToken, hashToken, calculateReadingTime } from "../src/lib/utils";

describe("Cryptographic Token & Utility Tests", () => {
  it("generates a random secure token with expected hex length", () => {
    const token = generateSecureToken(32);
    expect(token).toHaveLength(64); // 32 bytes in hex is 64 characters
    expect(typeof token).toBe("string");
  });

  it("produces deterministic SHA-256 hashes", () => {
    const token = "my-secret-invitation-token-123";
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toEqual(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("calculates accurate reading time", () => {
    expect(calculateReadingTime(100)).toBe(1);
    expect(calculateReadingTime(450)).toBe(3);
    expect(calculateReadingTime(1000)).toBe(5);
  });
});
