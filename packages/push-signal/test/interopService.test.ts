import { beforeAll, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";
import {
  dataPreparationForSignalProducers,
  dataResetForSignalProducers,
  eserviceIdPushSignals,
  authorizedPurposeIdForPushSignals,
  eserviceIdPublishedByAnotherOrganization,
  eserviceNotPublished,
} from "pagopa-signalhub-commons-test";
import { config } from "../src/config/env.js";
import { operationPushForbidden } from "../src/models/domain/errors.js";
import { interopService, postgresDB } from "./utils.js";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalProducers(postgresDB, config.interopSchema);
    await dataPreparationForSignalProducers(postgresDB, config.interopSchema);
  });

  it("should give permission to a signals producer for pushing a signal", async () => {
    const purposeId = authorizedPurposeIdForPushSignals;
    const eserviceId = eserviceIdPushSignals;
    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        purposeId,
        eserviceId,
        genericLogger
      )
    ).resolves.not.toThrow();
  });

  it("should deny permission to a signals producer without a purpose for e-service push", async () => {
    const purposeId = "some-non-existent-purpose-id";
    const eserviceId = "";

    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        purposeId,
        eserviceId,
        genericLogger
      )
    ).rejects.toThrowError(operationPushForbidden({ purposeId, eserviceId }));
  });

  it("should deny permission to a signals producer with a valid purpose and non existent e-service", async () => {
    const purposeId = authorizedPurposeIdForPushSignals;
    const eserviceId = "some-non-existent-eservice-id";

    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        purposeId,
        eserviceId,
        genericLogger
      )
    ).rejects.toThrowError(operationPushForbidden({ purposeId, eserviceId }));
  });

  it("should deny permission to a signals producer with a valid purpose and e-service state != PUBLISHED", async () => {
    const purposeId = authorizedPurposeIdForPushSignals;
    const eserviceId = eserviceNotPublished.id;

    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        purposeId,
        eserviceId,
        genericLogger
      )
    ).rejects.toThrowError(operationPushForbidden({ purposeId, eserviceId }));
  });

  it("should deny permission to a signals producer that is not owner of the e-service", async () => {
    const purposeId = authorizedPurposeIdForPushSignals;
    const eserviceId = eserviceIdPublishedByAnotherOrganization;

    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        purposeId,
        eserviceId,
        genericLogger
      )
    ).rejects.toThrowError(operationPushForbidden({ purposeId, eserviceId }));
  });
});
