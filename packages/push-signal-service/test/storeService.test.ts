import { genericLogger, operationForbidden } from "signalhub-commons";
import { describe, expect, it } from "vitest";
import {
  createSignal,
  eserviceIdPushSignals,
  signalProducer,
  writeSignal,
} from "signalhub-commons-test";
import { signalIdDuplicatedForEserviceId } from "../src/model/domain/errors.js";
import { postgresDB, storeService } from "./utils.js";

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
    it.skip("Should producer not be able to deposit signal because he has a valid agreement but e-service is not PUBLISHED", async () => {
      // TODO: test with other mock interopService
    });

    it("Should producer not be able to deposit signal if he is not the owner of the e-service", async () => {
      const producerId = "fake-producer-id";
      const eserviceId = eserviceIdPushSignals;
      await expect(
        storeService.canProducerDepositSignal(
          producerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(operationForbidden);
    });
    it("Should producer able to deposit signal if he is the owner of the e-services", async () => {
      const producerId = signalProducer.id;
      const eserviceId = eserviceIdPushSignals;

      await expect(
        storeService.canProducerDepositSignal(
          producerId,
          eserviceId,
          genericLogger
        )
      ).resolves.not.toThrow();
    });
  });
});
