import { describe, expect, it } from "vitest";

import {
  arrayToNdjson,
  getManifestBucketKey,
  getNdjsonBucketKey
} from "../src/utils/helperUtils.js";

describe("helperUtils", () => {
  describe("getNdjsonBucketKey", () => {
    it("should return the ndjson path in the run folder with the padded file number", () => {
      const date = new Date("2026-01-02T03:04:05.000Z");

      expect(getNdjsonBucketKey(date, "run-id", 12)).toBe(
        "signal/dt=2026-01-02/run=run-id/part-000012.ndjson"
      );
    });
  });

  describe("getManifestBucketKey", () => {
    it("should return the manifest path in the run folder", () => {
      const date = new Date("2026-01-02T03:04:05.000Z");

      expect(getManifestBucketKey(date, "run-id")).toBe(
        "signal/dt=2026-01-02/run=run-id/_manifest.json"
      );
    });
  });

  describe("arrayToNdjson", () => {
    it("should return one JSON object per line", () => {
      expect(arrayToNdjson([{ a: 1 }, { b: 2 }])).toBe('{"a":1}\n{"b":2}\n');
    });
  });
});
