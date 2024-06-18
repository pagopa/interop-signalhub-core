import { describe, expect, it } from "vitest";
import { genericLogger } from "signalhub-commons";
import {
  createSignal,
  writeSignal,
  createMultipleSignals,
  writeSignalsInBatch,
  createMultipleOrderedSignals,
} from "signalhub-commons-test";

import {
  postgresDB,
  signalService,
  sortSignalsBySignalId,
  toSignal,
  toSignals,
} from "./utils";

describe("Pull Signal service", () => {
  it("should get an empty signals list for a non existent e-service", async () => {
    const signalId = 0;
    const eserviceId = "non-existent-eservice-id";
    const size = 10;
    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toEqual([]);
  });
  it("should get null lastSignalId for a non existent e-service", async () => {
    const signalId = 0;
    const eserviceId = "non-existent-eservice-id";
    const size = 10;
    const { lastSignalId } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(lastSignalId).toBeNull();
  });
  it("should get an empty signals list for a e-service different than requested", async () => {
    const signalPushed = createSignal({ eserviceId: "an-eservice-id" });
    await writeSignal(signalPushed, postgresDB);

    const eserviceId = "another-eservice-id";
    const signalId = 0;
    const size = 10;
    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toEqual([]);
  });
  it("should get only one signal for an e-service", async () => {
    const eserviceId = "existent-eservice-id";
    const signalId = 0;
    const size = 10;
    const signalPushed = createSignal({ eserviceId });
    await writeSignal(signalPushed, postgresDB);

    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toEqual([toSignal(signalPushed)]);
  });
  it("should get lastSignalId for one signal for an e-service", async () => {
    const eserviceId = "existent-eservice-id";
    const signalId = 0;
    const size = 10;
    const signalPushed = createSignal({ eserviceId });
    await writeSignal(signalPushed, postgresDB);

    const { lastSignalId } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(lastSignalId).toBe(signalPushed.signalId);
  });
  it("should get two signals for an e-service", async () => {
    const eserviceId = "existent-eservice-id";
    const signalId = 0;
    const size = 10;
    const batchSignals = createMultipleSignals(2, { eserviceId });
    await writeSignalsInBatch(batchSignals, postgresDB);

    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toEqual(sortSignalsBySignalId(toSignals(batchSignals)));
  });
  it("should get lastSignalId for the last of the signals for an e-service", async () => {
    const eserviceId = "existent-eservice-id";
    const signalId = 0;
    const size = 10;
    const totalSignals = 5;
    const batchSignals = createMultipleSignals(totalSignals, { eserviceId });

    await writeSignalsInBatch(batchSignals, postgresDB);
    const { lastSignalId } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    const lastSignal = sortSignalsBySignalId(toSignals(batchSignals)).pop();
    expect(lastSignalId).toBe(lastSignal?.signalId);
  });

  it("should get five signals for an e-service, starting from signalId one, when size is five, when total signals is ten", async () => {
    const eserviceId = "existent-eservice-id";
    const signalId = 0;
    const size = 5;
    const totalSignals = 10;
    const batchSignals = createMultipleSignals(totalSignals, { eserviceId });
    await writeSignalsInBatch(batchSignals, postgresDB);

    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toHaveLength(size);
  });
  it("should get two signals for an e-service, starting from signalId ten, when total signal is twelve", async () => {
    const eserviceId = "existent-eservice-id";
    const signalId = 10;
    const size = 10;
    const totalSignals = 12;
    const batchSignals = createMultipleOrderedSignals(totalSignals, {
      eserviceId,
    });
    await writeSignalsInBatch(batchSignals, postgresDB);

    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toHaveLength(2);
  });
  it("should get ten signals for an e-service, starting from signalId ten, when total signal is twenty", async () => {
    const eserviceId = "existent-eservice-id";
    const signalId = 10;
    const size = 10;
    const totalSignals = 20;
    const batchSignals = createMultipleOrderedSignals(totalSignals, {
      eserviceId,
    });
    await writeSignalsInBatch(batchSignals, postgresDB);

    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toHaveLength(10);
  });
});
