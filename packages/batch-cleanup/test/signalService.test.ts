import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  writeSignal,
  createSignal,
  createMultipleSignals,
  writeSignals,
} from "pagopa-signalhub-commons-test";
import {
  cleanup,
  ONE_HOUR,
  ONE_MINUTE,
  postgresDB,
  signalService,
} from "./utils.js";

describe("Signal service", () => {
  afterEach(cleanup);

  afterEach(() => {
    vi.useRealTimers(); // restoring date after each test run
  });

  afterAll(() => {
    vi.useRealTimers(); // use real time
  });

  it("should clean 0 signals if there's no signals", async () => {
    const periodRetentionSignalsInHours = 1;
    const { countDeleted } = await signalService.cleanup(
      periodRetentionSignalsInHours
    );
    expect(countDeleted).toBe(0);
  });

  it("should clean 0 signals if signal has been inserted now, if period retention is 1 hour", async () => {
    const periodRetentionSignalsInHours = 1;
    await writeSignal(createSignal(), postgresDB);
    const { countDeleted } = await signalService.cleanup(
      periodRetentionSignalsInHours
    );
    expect(countDeleted).toBe(0);
  });

  it("should clean 1 signals if the signal has exceeded the limit period (one hour)", async () => {
    const periodRetentionSignalsInHours = 1;
    await writeSignal(createSignal(), postgresDB);
    vi.useFakeTimers(); // tell vitest we use mocked time
    const anHourHasAlreadyPassed = new Date(
      new Date().getTime() + ONE_HOUR + ONE_MINUTE
    );
    vi.setSystemTime(anHourHasAlreadyPassed);

    const { countDeleted } = await signalService.cleanup(
      periodRetentionSignalsInHours
    );

    expect(countDeleted).toBe(1);
  });

  it("should clean multiple signals if the signals has exceeded the limit period (one hour)", async () => {
    const periodRetentionSignalsInHours = 1;
    const batchSignals = createMultipleSignals(10);
    await writeSignals(batchSignals, postgresDB);

    vi.useFakeTimers(); // tell vitest we use mocked time
    const oneHourHasAlreadyPassed = new Date(
      new Date().getTime() + ONE_HOUR + ONE_MINUTE
    );
    vi.setSystemTime(oneHourHasAlreadyPassed);

    const { countDeleted } = await signalService.cleanup(
      periodRetentionSignalsInHours
    );

    expect(countDeleted).toBe(10);
  });

  it("should clean 0 signals if the signals has NOT exceeded the limit period (one hour)", async () => {
    const periodRetentionSignalsInHours = 1;
    const batchSignals = createMultipleSignals(10);
    await writeSignals(batchSignals, postgresDB);

    const { countDeleted } = await signalService.cleanup(
      periodRetentionSignalsInHours
    );

    expect(countDeleted).toBe(0);
  });
});
