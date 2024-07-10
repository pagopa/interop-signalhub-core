import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { genericLogger, operationForbidden } from "signalhub-commons";
import {
  dataPreparationForSignalConsumers,
  dataResetForSignalConsumers,
  eserviceIdPushSignals,
} from "signalhub-commons-test";
import {
  aValidMockAgreement,
  interopApiClient,
  interopService,
  postgresDB,
} from "./utils";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalConsumers(postgresDB);
    await dataPreparationForSignalConsumers(postgresDB);
  });

  beforeEach(() => {
    vi.clearAllMocks(); // clear the mock to avoid side effects and start the count with 0 for every test
  });

  it("should give permission to a signals consumer for pull signals", async () => {
    vi.spyOn(interopApiClient, "getAgreementByPurposeId").mockResolvedValue(
      aValidMockAgreement
    );
    const purposeId = "some-purpose-id";
    const eserviceId = eserviceIdPushSignals;

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).resolves.not.toThrow();
    expect(interopApiClient.getAgreementByPurposeId).toHaveBeenCalledWith(
      purposeId
    );
  });

  it("should deny permission to a signal consumer with no agreement for e-service pull", async () => {
    const anInvalidMockAgreement = null;
    vi.spyOn(interopApiClient, "getAgreementByPurposeId").mockResolvedValue(
      anInvalidMockAgreement
    );
    const purposeId = "some-purpose-id";
    const eserviceId = "some-eservice-id";

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationForbidden);
    expect(interopApiClient.getAgreementByPurposeId).toHaveBeenCalledWith(
      purposeId
    );
  });
  it.skip("should deny permission to a signal consumer that is not a consumer of the e-service", async () => {
    vi.spyOn(interopApiClient, "getAgreementByPurposeId").mockResolvedValue(
      aValidMockAgreement
    );
    const purposeId = "some-purpose-id";
    const eserviceId = "e-service-not-valid";

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationForbidden);
    expect(interopApiClient.getAgreementByPurposeId).toHaveBeenCalledWith(
      purposeId
    );
  });
});
