import { truncateTracingBatchCleanupTable } from "pagopa-signalhub-commons-test";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import { postgresDB, tracingBatchCleanupService } from "./utils.js";

describe("TracingBatchCleanup service", () => {
  it("should write an entry when start", async () => {
    const batchId = await tracingBatchCleanupService.start(
      new Date().toISOString()
    );
    expect(batchId).toBeTypeOf("number");
    expect(batchId).toBeGreaterThan(0);
  });

  beforeEach(() =>
    truncateTracingBatchCleanupTable(postgresDB, config.signalHubSchema)
  );
});
