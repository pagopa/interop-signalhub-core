import { genericLogger, operationForbidden } from "signalhub-commons";
import { beforeAll, describe, expect, it } from "vitest";
import { postgresDB, storeService } from "./utils";
import { dataPreparation, writeSignal } from "signalhub-commons-test";
import { signalIdDuplicatedForEserviceId } from "../src/model/domain/errors";

describe("Store service", () => {
  beforeAll(async () => {
    await dataPreparation(postgresDB);
  });
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

      await writeSignal(
        {
          signalId,
          eserviceId,
          objectType: "UPDATE",
          correlationId: "1234",
          objectId: "123",
          signalType: "UPDATE",
        },
        postgresDB
      );

      await expect(
        storeService.verifySignalDuplicated(signalId, eserviceId, genericLogger)
      ).rejects.toThrowError(
        signalIdDuplicatedForEserviceId(signalId, eserviceId)
      );
    });
  });

  describe("canProducerDepositSignal", () => {
    it("Should producer not be able to deposit signal because he has a valid agreement but e-service is not PUBLISHED", async () => {
      const purposeId = "881ba6a2-c31b-4613-939f-c9122d555fd7";
      const eserviceId = "1dc2108b-2c5e-4057-a2ae-6ce7aeb96551"; // Suspended
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
      const eserviceId = "31b4e4e6-855d-42fa-9705-28bc7f8545ff";
      await expect(
        storeService.canProducerDepositSignal(
          purposeId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(operationForbidden);
    });
    it("Should producer able to deposit signal if he is the owner of the e-service", async () => {
      const purposeId = "881ba6a2-c31b-4613-939f-c9122d555fd7";
      const eserviceId = "31b4e4e6-855d-42fa-9705-28bc7f8545ff";

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
