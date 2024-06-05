import { genericLogger, operationForbidden } from "signalhub-commons";
import { describe, expect, it } from "vitest";
import { postgresDB } from "./utils";

describe("Signal Service", () => {
  it("should do something", async () => {
    expect(1).toBe(1);
  });
});
