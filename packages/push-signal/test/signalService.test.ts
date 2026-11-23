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
  withinTimeWindow as insideTimeWindow,
  outSideTimeWindow as outsideTimeWindow,
  postgresDB,
  signalService,
  sleep
} from "./utils.js";

describe("Store service", () => {
  beforeEach(cleanup);
  describe("verifySignalDuplicated", () => {
    it("If signal not exist on db should not throw an error", async () => {
      const signalId = 1;
      const eserviceId = "test-eservice-id";

      await expect(
        signalService.verify(signalId, eserviceId, genericLogger)
      ).resolves.not.toThrow();
    });

    it("If signal already exist on db should throw a signalIdDuplicatedForEserviceId error", async () => {
      const signalId = getRandomInt();
      const eserviceId = "test-eservice-id";

      const signal = createSignal({ signalId, eserviceId });
      await writeSignal(signal, postgresDB, config.signalHubSchema);

      await expect(
        signalService.verify(signalId, eserviceId, genericLogger)
      ).rejects.toThrowError(
        signalIdDuplicatedForEserviceId(signalId, eserviceId)
      );
    });
  });

  describe("Push signal with time windows disabled", () => {
    beforeAll(() => {
      config.featureFlagTimeWindow = false;
    });

    it("Should be able to deposit signal if the signalId is higher than the last stored signalId", async () => {
      const firstSignalId = getRandomInt();
      const eserviceId = "test-eservice-id";

      const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
      await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

      const secondSignalId = firstSignalId + 1;
      await expect(
        signalService.verify(secondSignalId, eserviceId, genericLogger)
      ).resolves.not.toThrow();
    });

    it("Should be able to deposit signal if the signalId is lower than the last stored signalId", async () => {
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

    it("Should report a duplicate before an older stored signal with a higher ID", async () => {
      const signalId = 1;
      const eserviceId = "test-eservice-id";
      await writeSignal(
        createSignal({ signalId, eserviceId }),
        postgresDB,
        config.signalHubSchema
      );
      await writeSignal(
        createSignal({ signalId: signalId + 1, eserviceId }),
        postgresDB,
        config.signalHubSchema
      );
      await postgresDB.none(
        `UPDATE ${config.signalHubSchema}.signal
         SET tmst_insert = NOW() - INTERVAL '1 minute'
         WHERE eservice_id = $1 AND signal_id = $2`,
        [eserviceId, signalId + 1]
      );

      await expect(
        signalService.verify(signalId, eserviceId, genericLogger)
      ).rejects.toThrowError(
        signalIdDuplicatedForEserviceId(signalId, eserviceId)
      );
    });

    it("Should distinguish adjacent bigint IDs that round to the same number", async () => {
      const signalId = Number.MAX_SAFE_INTEGER + 1;
      const eserviceId = "test-eservice-id";
      await writeSignal(
        createSignal({ signalId, eserviceId }),
        postgresDB,
        config.signalHubSchema
      );
      await postgresDB.none(
        `UPDATE ${config.signalHubSchema}.signal
         SET signal_id = signal_id + 1, tmst_insert = NOW() - INTERVAL '1 minute'
         WHERE eservice_id = $1 AND signal_id = $2`,
        [eserviceId, signalId]
      );

      await expect(
        signalService.verify(signalId, eserviceId, genericLogger)
      ).rejects.toThrowError(
        signalStoredWithHigherSignalId(signalId, eserviceId)
      );
    });

    it("Should be able to deposit signal if the signalId is higher than the last stored signalId", async () => {
      const firstSignalId = getRandomInt();
      const eserviceId = "test-eservice-id";

      const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
      await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

      const secondSignalId = firstSignalId + 1;
      await expect(
        signalService.verify(secondSignalId, eserviceId, genericLogger)
      ).resolves.not.toThrow();
    });

    it("Should NOT be able to deposit signal if the signalId is lower than the last stored signalI outside the time window", async () => {
      const firstSignalId = getRandomInt();
      const eserviceId = "test-eservice-id";

      const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
      await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

      const TIME_TO_WAIT_BEFORE_DEPOSIT_SIGNAL = outsideTimeWindow(
        config.timeWindowInSeconds
      );
      await sleep(TIME_TO_WAIT_BEFORE_DEPOSIT_SIGNAL);

      const secondSignalId = firstSignalId - 1;
      await expect(
        signalService.verify(secondSignalId, eserviceId, genericLogger)
      ).rejects.toThrowError(
        signalStoredWithHigherSignalId(secondSignalId, eserviceId)
      );
    });

    it("Should be able to deposit signal if the signalId is lower than the last stored signalId inside the time window", async () => {
      const firstSignalId = getRandomInt();
      const eserviceId = "test-eservice-id";

      const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
      await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

      const TIME_TO_WAIT_BEFORE_DEPOSIT_SIGNAL = insideTimeWindow(
        config.timeWindowInSeconds
      );
      await sleep(TIME_TO_WAIT_BEFORE_DEPOSIT_SIGNAL);

      const secondSignalId = firstSignalId - 1;
      await expect(
        signalService.verify(secondSignalId, eserviceId, genericLogger)
      ).resolves.not.toThrow();
    });
  });
});
