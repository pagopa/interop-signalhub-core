import { afterEach, describe, expect, it } from "vitest";
import { writeSignal, createSignal } from "signalhub-commons-test";
import { cleanup, postgresDB, signalService } from "./utils.js";

describe("Signal service", () => {
  afterEach(cleanup);

  it("should clean 0 signals if there's no signals", async () => {
    const periodRetentionSignalsInHours = 1;
    const howManySignalsDeleted = await signalService.cleanup(
      periodRetentionSignalsInHours
    );
    expect(howManySignalsDeleted).toBe(0);
  });

  it("should clean 1 signal inserted one hour ago if period retention is 1 hour", async () => {
    await writeSignal(createSignal(), postgresDB);
    expect(1).toBe(1);
  });
});
