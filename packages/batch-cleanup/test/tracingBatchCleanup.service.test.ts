import { beforeEach } from "node:test";
import { truncateTracingBatchCleanupTable } from "pagopa-signalhub-commons-test";
import { describe, it, expect } from "vitest";
import { postgresDB, tracingBatchCleanupService } from "./utils";

describe("TracingBatchCleanup service", () => {
  it("should write an entry when start", async () => {
    const batchId = await tracingBatchCleanupService.start(
      new Date().toISOString()
    );
    expect(batchId).toBeTypeOf("number");
    expect(batchId).toBeGreaterThan(0);
  });

  beforeEach(() => truncateTracingBatchCleanupTable(postgresDB));
});
