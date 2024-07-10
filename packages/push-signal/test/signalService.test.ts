import { genericLogger } from "signalhub-commons";
import { describe, expect, it } from "vitest";
import { createSignal, writeSignal } from "signalhub-commons-test";
import { signalIdDuplicatedForEserviceId } from "../src/models/domain/errors.js";
import { postgresDB, signalService } from "./utils.js";

describe("Store service", () => {
  describe("verifySignalDuplicated", () => {
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
      await writeSignal(signal, postgresDB);

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
