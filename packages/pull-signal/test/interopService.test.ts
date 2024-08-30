import { beforeAll, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";

import {
  authorizedPurposeIdForPullSignals,
  consumerAgreementDraftState,
  dataPreparationForSignalConsumers,
  dataResetForSignalConsumers,
  eserviceIdPushSignals,
  signalConsumer,
} from "pagopa-signalhub-commons-test";
import {
  operationPullForbidden,
  operationPullForbiddenWithWrongAgreement,
} from "../src/model/domain/errors";

import { config } from "../src/config/env.js";
import { interopService, postgresDB } from "./utils";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalConsumers(postgresDB, config.interopSchema);
    await dataPreparationForSignalConsumers(postgresDB, config.interopSchema);
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
    const eserviceId = eserviceIdPushSignals;

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationPullForbidden({ eserviceId, purposeId }));
  });

  it("should deny permission to a signal consumer with purpose != ACTIVE", async () => {
    const purposeId = "purpose-id-not-active";
    const eserviceId = eserviceIdPushSignals;
    // const consumerId = signalConsumer.id;

    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(operationPullForbidden({ purposeId, eserviceId }));
  });

  it("should deny permission to a signal consumer for an agreement != ACTIVE", async () => {
    const purposeId = authorizedPurposeIdForPullSignals;
    const eserviceId = consumerAgreementDraftState.eservice;
    const agreement = {
      id: consumerAgreementDraftState.id,
      state: consumerAgreementDraftState.state,
      consumerId: signalConsumer.id,
    };
    await expect(
      interopService.verifyAuthorization(purposeId, eserviceId, genericLogger)
    ).rejects.toThrowError(
      operationPullForbiddenWithWrongAgreement({
        eservice: { id: eserviceId },
        agreement,
      })
    );
  });
});
