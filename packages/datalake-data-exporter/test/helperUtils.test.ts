import { describe, expect, it, vi } from "vitest";

import {
  arrayToNdjson,
  getDataCountBucketKey,
  getNdjsonBucketKey,
  splitArrayIntoChunks
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

  describe("splitArrayIntoChunks", () => {
    it("should split the array into chunks of the given size", () => {
      expect(splitArrayIntoChunks([1, 2, 3, 4, 5], 2)).toEqual([
        [1, 2],
        [3, 4],
        [5]
      ]);
    });

    it("should return one chunk if the array is smaller than the chunk size", () => {
      expect(splitArrayIntoChunks([1, 2], 3)).toEqual([[1, 2]]);
    });

    it("should return no chunks if the array is empty", () => {
      expect(splitArrayIntoChunks([], 3)).toEqual([]);
    });
  });

  describe("arrayToNdjson", () => {
    it("should return one JSON object per line", () => {
      expect(arrayToNdjson([{ a: 1 }, { b: 2 }])).toBe('{"a":1}\n{"b":2}\n');
    });
  });
});
