import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  writeSignal,
  createSignal,
  createMultipleSignals,
  writeSignals,
} from "signalhub-commons-test";
import { cleanup, ONE_HOUR, postgresDB, signalService } from "./utils.js";

describe("Signal service", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.useFakeTimers(); // tell vitest we use mocked time
  });

  afterEach(() => {
    vi.useRealTimers(); // restoring date after each test run
  });

  it("should clean 0 signals if there's no signals", async () => {
    const periodRetentionSignalsInHours = 1;
    const howManySignalsDeleted = await signalService.cleanup(
      periodRetentionSignalsInHours
    );
    expect(howManySignalsDeleted).toBe(0);
  });

  it("should clean 0 signals if signal has been inserted now, if period retention is 1 hour", async () => {
    const periodRetentionSignalsInHours = 1;
    await writeSignal(createSignal(), postgresDB);
    const howManySignalsDeleted = await signalService.cleanup(
      periodRetentionSignalsInHours
    );
    expect(howManySignalsDeleted).toBe(0);
  });

  it("should clean 1 signals if the signal has exceeded the limit period (one hour)", async () => {
    const periodRetentionSignalsInHours = 1;
    await writeSignal(createSignal(), postgresDB);

    const anHourHasAlreadyPassed = new Date(new Date().getTime() + ONE_HOUR);
    vi.setSystemTime(anHourHasAlreadyPassed);

    const howManySignalsDeleted = await signalService.cleanup(
      periodRetentionSignalsInHours
    );

    expect(howManySignalsDeleted).toBe(1);
  });

  it("should clean multiple signals if the signals has exceeded the limit period (one hour)", async () => {
    const periodRetentionSignalsInHours = 1;
    const batchSignals = createMultipleSignals(10);
    await writeSignals(batchSignals, postgresDB);

    const anHourHasAlreadyPassed = new Date(new Date().getTime() + ONE_HOUR);
    vi.setSystemTime(anHourHasAlreadyPassed);

    const howManySignalsDeleted = await signalService.cleanup(
      periodRetentionSignalsInHours
    );

    expect(howManySignalsDeleted).toBe(10);
  });

  it("should clean 0 signals if the signals has NOT exceeded the limit period (one hour)", async () => {
    const periodRetentionSignalsInHours = 1;
    const batchSignals = createMultipleSignals(10);
    await writeSignals(batchSignals, postgresDB);

    const howManySignalsDeleted = await signalService.cleanup(
      periodRetentionSignalsInHours
    );

    expect(howManySignalsDeleted).toBe(0);
  });
});