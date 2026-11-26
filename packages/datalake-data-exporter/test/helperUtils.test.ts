import { describe, expect, it, vi } from "vitest";

import {
  arrayToNdjson,
  getDataCountBucketKey,
  getNdjsonBucketKey
} from "../src/utils/helperUtils.js";

vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("1234")
}));

describe("helperUtils", () => {
  describe("getNdjsonBucketKey", () => {
    it("should return the ndjson path for the given date", () => {
      const date = new Date("2026-01-02T03:04:05.000Z");

      expect(getNdjsonBucketKey(date)).toBe(
        "data/signal/20260102/20260102_030405_1234.ndjson"
      );
    });
  });

  describe("getDataCountBucketKey", () => {
    it("should return the count path for the given date", () => {
      const date = new Date("2026-01-02T03:04:05.000Z");

      expect(getDataCountBucketKey(date)).toBe(
        "count/signal/20260102/20260102_030405.json"
      );
    });
  });

  describe("arrayToNdjson", () => {
    it("should return one JSON object per line", () => {
      expect(arrayToNdjson([{ a: 1 }, { b: 2 }])).toBe('{"a":1}\n{"b":2}\n');
    });
  });
});
