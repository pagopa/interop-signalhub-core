import { genericLogger } from "pagopa-signalhub-commons";
import { createSignal, writeSignal } from "pagopa-signalhub-commons-test";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import {
  signalIdDuplicatedForEserviceId,
  signalStoredWithHigherSignalId
} from "../src/models/domain/errors.js";
import {
  cleanup,
  getRandomInt,
  postgresDB,
  signalService,
  sleep
} from "./utils.js";

describe("Store service", () => {
  describe("verifySignalDuplicated", () => {
    beforeEach(cleanup);
    it("If signal not exist on db should not throw an error", async () => {
      const signalId = 1;
      const eserviceId = "test-eservice-id";
      await expect(
        signalService.verify(signalId, eserviceId, genericLogger)
      ).resolves.not.toThrow();
    });

    it("If signal already exist on db should throw a signalIdDuplicatedForEserviceId error", async () => {
      const signalId = 1;
      const eserviceId = "test-eservice-id";
      const signal = createSignal({ signalId, eserviceId });
      await writeSignal(signal, postgresDB, config.signalHubSchema);

      await expect(
        signalService.verify(signalId, eserviceId, genericLogger)
      ).rejects.toThrowError(
        signalIdDuplicatedForEserviceId(signalId, eserviceId)
      );
    });

    it("Should be able to deposit signal with higher signalId if the signalId is not consolidated yet", async () => {
      const firstSignalId = 3;
      const eserviceId = "test-eservice-id";

      const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
      await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

      const TIME_TO_WAIT_BEFORE_DEPOSIT_SIGNAL =
        config.timeWindowInSeconds * 1000 - 500;

      await sleep(TIME_TO_WAIT_BEFORE_DEPOSIT_SIGNAL);

      const secondSignalId = firstSignalId - 1;
      await expect(
        signalService.verify(secondSignalId, eserviceId, genericLogger)
      ).resolves.not.toThrow();
    });
  });

  describe("Push signal with time windows disabled", () => {
    beforeAll(() => {
      config.featureFlagTimeWindow = false;
    });
    it("Should NOT throw an error if the signalId is already stored on the db and signalId is lower than the last signalId", async () => {
      const firstSignalId = getRandomInt();
      const eserviceId = "test-eservice-id";

      const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
      await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

      const secondSignalId = firstSignalId - 1;
      await expect(
        signalService.verify(secondSignalId, eserviceId, genericLogger)
      ).resolves.not.toThrow();
    });
  });

  describe("Push signal with time windows enabled", () => {
    beforeAll(() => {
      config.featureFlagTimeWindow = true;
      config.timeWindowInSeconds = 5;
    });
    it("Should throw an error if the signalId is already stored on the db and signalId is lower than the last signalId", async () => {
      const firstSignalId = getRandomInt();
      const eserviceId = "test-eservice-id";

      const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
      await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

      const TIME_TO_WAIT_BEFORE_DEPOSIT_SIGNAL =
        config.timeWindowInSeconds * 1000 + 500;
      await sleep(TIME_TO_WAIT_BEFORE_DEPOSIT_SIGNAL);

      const secondSignalId = firstSignalId - 1;
      await expect(
        signalService.verify(secondSignalId, eserviceId, genericLogger)
      ).rejects.toThrowError(
        signalStoredWithHigherSignalId(secondSignalId, eserviceId)
      );
    });
  });
});
