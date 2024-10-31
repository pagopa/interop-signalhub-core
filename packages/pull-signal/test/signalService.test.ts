import { genericLogger } from "pagopa-signalhub-commons";
import {
  createMultipleOrderedSignals,
  createMultipleSignals,
  createSignal,
  writeSignals
} from "pagopa-signalhub-commons-test";
import { afterEach, describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import {
  cleanup,
  postgresDB,
  signalService,
  sortSignalsBySignalId,
  toSignal,
  toSignals
} from "./utils.js";

describe("Pull Signal service", () => {
  afterEach(cleanup);

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
    await writeSignals(
      [createSignal({ eserviceId: "an-eservice-id" })],
      postgresDB,
      config.signalHubSchema
    );

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
    const eserviceId = "an-eservice-id";
    const signalPushed = createSignal({ eserviceId });
    await writeSignals([signalPushed], postgresDB, config.signalHubSchema);

    const signalId = 0;
    const size = 10;
    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toEqual([toSignal(signalPushed)]);
  });

  it("should get lastSignalId for one signal for an e-service", async () => {
    const eserviceId = "an-eservice-id";
    const signalPushed = createSignal({ eserviceId });
    await writeSignals([signalPushed], postgresDB, config.signalHubSchema);

    const signalId = 0;
    const size = 10;
    const { lastSignalId } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(lastSignalId).toBe(signalPushed.signalId);
  });

  it("should get two signals for an e-service", async () => {
    const eserviceId = "an-eservice-id";
    const batchSignals = createMultipleSignals(2, { eserviceId });
    await writeSignals(batchSignals, postgresDB, config.signalHubSchema);

    const signalId = 0;
    const size = 10;
    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toEqual(sortSignalsBySignalId(toSignals(batchSignals)));
  });

  it("should get lastSignalId for the last of the signals for an e-service", async () => {
    const eserviceId = "an-eservice-id";
    const totalSignals = 5;
    const batchSignals = createMultipleSignals(totalSignals, { eserviceId });
    await writeSignals(batchSignals, postgresDB, config.signalHubSchema);

    const signalId = 0;
    const size = 10;
    const { lastSignalId } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );
    const sortedSignals = sortSignalsBySignalId(toSignals(batchSignals));
    const lastSignal = sortedSignals.at(-1);

    expect(lastSignalId).toBe(lastSignal?.signalId);
  });

  it("should get five signals for an e-service, starting from signalId one, when size is five, when total signals is ten", async () => {
    const eserviceId = "an-eservice-id";
    const totalSignals = 10;
    const batchSignals = createMultipleSignals(totalSignals, { eserviceId });
    await writeSignals(batchSignals, postgresDB, config.signalHubSchema);

    const signalId = 0;
    const size = 5;
    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toHaveLength(size);
  });

  it("should get two signals for an e-service, starting from signalId ten, when total signal is twelve", async () => {
    const eserviceId = "an-eservice-id";
    const totalSignals = 12;
    const batchSignals = createMultipleOrderedSignals(totalSignals, {
      eserviceId
    });
    await writeSignals(batchSignals, postgresDB, config.signalHubSchema);

    const signalId = 10;
    const size = 10;
    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toHaveLength(2);
  });

  it("should get ten signals for an e-service, starting from signalId ten, when total signal is twenty", async () => {
    const eserviceId = "an-eservice-id";
    const totalSignals = 20;
    const batchSignals = createMultipleOrderedSignals(totalSignals, {
      eserviceId
    });
    await writeSignals(batchSignals, postgresDB, config.signalHubSchema);

    const signalId = 10;
    const size = 10;
    const { signals } = await signalService.getSignal(
      eserviceId,
      signalId,
      size,
      genericLogger
    );

    expect(signals).toHaveLength(10);
  });
});
