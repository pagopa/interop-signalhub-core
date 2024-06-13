import { genericLogger, operationForbidden } from "signalhub-commons";
import { describe, expect, it } from "vitest";
import {
  authorizedPurposeId,
  createSignal,
  eserviceIdNotPublished,
  eserviceIdPullSignals,
  writeSignal,
} from "signalhub-commons-test";
import { signalIdDuplicatedForEserviceId } from "../src/model/domain/errors";
import { postgresDB, storeService } from "./utils";

describe("Store service", () => {
  describe("verifySignalDuplicated", () => {
    it("If signal not exist on db should not throw an error", async () => {
      const signalId = 1;
      const eserviceId = "test-eservice-id";
      await expect(
        storeService.verifySignalDuplicated(signalId, eserviceId, genericLogger)
      ).resolves.not.toThrow();
    });
    it("If signal already exist on db should throw a signalIdDuplicatedForEserviceId error", async () => {
      const signalId = 1;
      const eserviceId = "test-eservice-id";
      const signal = createSignal({ signalId, eserviceId });
      await writeSignal(signal, postgresDB);

      await expect(
        storeService.verifySignalDuplicated(signalId, eserviceId, genericLogger)
      ).rejects.toThrowError(
        signalIdDuplicatedForEserviceId(signalId, eserviceId)
      );
    });
  });

  describe("canProducerDepositSignal", () => {
    it("Should producer not be able to deposit signal because he has a valid agreement but e-service is not PUBLISHED", async () => {
      const purposeId = authorizedPurposeId;
      const eserviceId = eserviceIdNotPublished; // Suspended
      await expect(
        storeService.canProducerDepositSignal(
          purposeId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(operationForbidden);
    });

    it("Should producer not be able to deposit signal if he is not the owner of the e-service", async () => {
      const purposeId = "fake-purpose-id";
      const eserviceId = eserviceIdPullSignals;
      await expect(
        storeService.canProducerDepositSignal(
          purposeId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(operationForbidden);
    });
    it("Should producer able to deposit signal if he is the owner of the e-services", async () => {
      const purposeId = authorizedPurposeId;
      const eserviceId = eserviceIdPullSignals;

      await expect(
        storeService.canProducerDepositSignal(
          purposeId,
          eserviceId,
          genericLogger
        )
      ).resolves.not.toThrow();
    });
  });
});
