import { beforeAll, describe, expect, it } from "vitest";
import { genericLogger, operationForbidden } from "pagopa-signalhub-commons";
import {
  dataPreparationForSignalProducers,
  dataResetForSignalProducers,
  eserviceIdPushSignals,
  authorizedPurposeIdForPushSignals,
} from "pagopa-signalhub-commons-test";
import { interopService, postgresDB } from "./utils.js";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalProducers(postgresDB);
    await dataPreparationForSignalProducers(postgresDB);
  });

  it("should give permission to a signals producer for pushing a signal", async () => {
    const purposeId = authorizedPurposeIdForPushSignals;
    const eserviceId = eserviceIdPushSignals;
    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).resolves.not.toThrow();
  });

  it("should deny permission to a signal producer without a purpose and for e-service push", async () => {
    const purposeId = "some-non-existent-purpose-id";
    const eserviceId = "some-eservice-id";

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationForbidden);
  });

  it.skip("should deny permission to a signal producer with a valid purpose but without a valid agreement for e-service push", async () => {
    expect(true).toBe(true);
  });

  it.skip("should deny permission to a signal producer that is not owner of the e-service", async () => {
    expect(true).toBe(true);
  });
});
