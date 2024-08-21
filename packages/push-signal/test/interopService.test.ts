import { beforeAll, describe, expect, it } from "vitest";
import { genericLogger, operationForbidden } from "pagopa-signalhub-commons";
import {
  dataPreparationForSignalProducers,
  dataResetForSignalProducers,
  eserviceIdPushSignals,
  authorizedPurposeIdForPushSignals,
  eserviceIdPublishedByAnotherOrganization,
  eserviceIdNotPublished,
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

  it("should deny permission to a signals producer without a purpose for e-service push", async () => {
    const purposeId = "some-non-existent-purpose-id";
    const eserviceId = "";

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationForbidden);
  });

  it("should deny permission to a signals producer with a valid purpose and non existent e-service", async () => {
    const purposeId = authorizedPurposeIdForPushSignals;
    const eserviceId = "some-non-existent-eservice-id";

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationForbidden);
  });

  it("should deny permission to a signals producer with a valid purpose and e-service state != PUBLISHED", async () => {
    const purposeId = authorizedPurposeIdForPushSignals;
    const eserviceId = eserviceIdNotPublished;

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationForbidden);
  });

  it("should deny permission to a signals producer that is not owner of the e-service", async () => {
    const purposeId = authorizedPurposeIdForPushSignals;
    const eserviceId = eserviceIdPublishedByAnotherOrganization;

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationForbidden);
  });
});
