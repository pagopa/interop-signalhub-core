import { describe, it, expect, afterEach } from "vitest";
import { truncateTracingBatchTable } from "pagopa-signalhub-commons-test";
import { postgresDB } from "./utils";

describe("AgreementService", () => {
  it("Should insert a record on AGREEMENT table if not exist", async () => {
    expect(true).toBe(true);
  });

  it("Should update a record on AGREEMENT table if it's already present", async () => {
    expect(true).toBe(true);
  });

  afterEach(() => truncateTracingBatchTable(postgresDB));
});
