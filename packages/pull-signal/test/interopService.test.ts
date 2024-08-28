import { beforeAll, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";

import {
  authorizedPurposeIdForPullSignals,
  dataPreparationForSignalConsumers,
  dataResetForSignalConsumers,
  eserviceIdPushSignals,
  eServiceWithNotActiveAgreement,
  signalConsumer,
} from "pagopa-signalhub-commons-test";
import { operationPullForbidden } from "../src/model/domain/errors";
import { interopService, postgresDB } from "./utils";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalConsumers(postgresDB);
    await dataPreparationForSignalConsumers(postgresDB);
  });

  it("should give permission to a signals consumer to pull a signal", async () => {
    const purposeId = authorizedPurposeIdForPullSignals;
    const eserviceId = eserviceIdPushSignals;

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).resolves.not.toThrow();
  });

  it("Should deny permission to a signal consumer without purpose available", async () => {
    const purposeId = "wrong-purpose-id";
    const eServiceId = eserviceIdPushSignals;

    await expect(
      interopService.verifyAuthorization(purposeId, eServiceId, genericLogger)
    ).rejects.toThrowError(operationPullForbidden({ purposeId }));
  });

  it("should deny permission to a signal consumer with purpose != ACTIVE", async () => {
    const purposeId = "purpose-id-not-active";
    const eServiceId = eserviceIdPushSignals;
    // const consumerId = signalConsumer.id;

    await expect(
      interopService.verifyAuthorization(purposeId, eServiceId, genericLogger)
    ).rejects.toThrowError(operationPullForbidden({ purposeId }));
  });

  it("should deny permission to a signal consumer for an agreement != ACTIVE", async () => {
    const purposeId = authorizedPurposeIdForPullSignals;
    const eServiceId = eServiceWithNotActiveAgreement;
    const consumerId = signalConsumer.id;
    await expect(
      interopService.verifyAuthorization(purposeId, eServiceId, genericLogger)
    ).rejects.toThrowError(operationPullForbidden({ consumerId }));
  });
});
