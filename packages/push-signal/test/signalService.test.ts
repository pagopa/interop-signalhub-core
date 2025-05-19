import { genericLogger } from "pagopa-signalhub-commons";
import { createSignal, writeSignal } from "pagopa-signalhub-commons-test";
import { beforeEach, describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import {
  signalIdDuplicatedForEserviceId,
  signalsConsolidatedWithHigherSignalId
} from "../src/models/domain/errors.js";
import { cleanup, postgresDB, signalService, sleep } from "./utils.js";

describe("Store service", () => {
  describe("verifySignalDuplicated", () => {
    beforeEach(cleanup);
    it("If signal not exist on db should not throw an error", async () => {
      const signalId = 1;
      const eserviceId = "test-eservice-id";
      await expect(
        signalService.verifySignalDuplicated(
          signalId,
          eserviceId,
          genericLogger
        )
      ).resolves.not.toThrow();
    });

    it("If signal already exist on db should throw a signalIdDuplicatedForEserviceId error", async () => {
      const signalId = 1;
      const eserviceId = "test-eservice-id";
      const signal = createSignal({ signalId, eserviceId });
      await writeSignal(signal, postgresDB, config.signalHubSchema);

      await expect(
        signalService.verifySignalDuplicated(
          signalId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        signalIdDuplicatedForEserviceId(signalId, eserviceId)
      );
    });

    it("Should be able to deposit signal with higher signalId if the signalId is not consolidated yet", async () => {
      const firstSignalId = 3;
      const eserviceId = "test-eservice-id";

      const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
      await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

      await sleep(config.timeWindowInSeconds * 1000 - 500);

      const secondSignalId = firstSignalId - 1;
      await expect(
        signalService.verifySignalDuplicated(
          secondSignalId,
          eserviceId,
          genericLogger
        )
      ).resolves.not.toThrow();
    });
  });

  it("Should throw an error if the signalId is already consolidated on the db and signalId is lower thant the last signalId", async () => {
    const firstSignalId = 8;
    const eserviceId = "test-eservice-id";

    const firstSignal = createSignal({ signalId: firstSignalId, eserviceId });
    await writeSignal(firstSignal, postgresDB, config.signalHubSchema);

    await sleep(config.timeWindowInSeconds * 1000 + 500);

    const secondSignalId = firstSignalId - 1;
    await expect(
      signalService.verifySignalDuplicated(
        secondSignalId,
        eserviceId,
        genericLogger
      )
    ).rejects.toThrowError(
      signalsConsolidatedWithHigherSignalId(secondSignalId, eserviceId)
    );
  });
});
