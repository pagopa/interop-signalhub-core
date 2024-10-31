import { genericLogger } from "pagopa-signalhub-commons";
import { createSignal, writeSignal } from "pagopa-signalhub-commons-test";
import { beforeEach, describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import { signalIdDuplicatedForEserviceId } from "../src/models/domain/errors.js";
import { cleanup, postgresDB, signalService } from "./utils.js";

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
  });
});
