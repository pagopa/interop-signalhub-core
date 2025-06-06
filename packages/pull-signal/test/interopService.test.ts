import { genericLogger } from "pagopa-signalhub-commons";
import {
  createAdministrativeActsForConsumer,
  createEservice,
  createPurpose,
  dataResetForSignalConsumers,
  getAPurpose,
  getAnEservice,
  getUUID
} from "pagopa-signalhub-commons-test";
import { beforeAll, describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import { operationPullForbidden } from "../src/model/domain/errors.js";
import { interopService, postgresDB } from "./utils.js";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalConsumers(postgresDB, config.interopSchema);
  });

  describe("Authorization flow without delegation", () => {
    it("Should deny permission to a signal consumer without agreement and purpose for a non existent e-service", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId })
      );
    });

    it("Should deny permission to a signal consumer for an unavailable e-service", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = undefined;
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId })
      );
    });

    it("Should deny permission to a signal consumer for an e-service not 'signal-hub enabled'", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId, enabledSH: false };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({
          consumerId,
          eserviceId
        })
      );
    });

    it("Should deny permission to a signal consumer for an e-service in state != 'PUBLISHED'", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId, state: "DRAFT" };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({
          consumerId,
          eserviceId
        })
      );
    });

    it("Should deny permission to a signal consumer without agreement", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = undefined;
      const purpose = { eserviceId, consumerId };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId })
      );
    });

    it("Should deny permission to a signal consumer for an agreement != ACTIVE", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = { eserviceId, consumerId, state: "INACTIVE" };
      const purpose = { eserviceId, consumerId };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );
      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({
          consumerId,
          eserviceId
        })
      );
    });

    it("Should deny permission to a signal consumer without purpose", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = { eserviceId, consumerId };
      const purpose = undefined;
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId })
      );
    });

    it("Should deny permission to a signal consumer with purpose != ACTIVE", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId, state: "INACTIVE" };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId })
      );
    });

    it("Should give permission to a signals consumer to pull a signal", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).resolves.not.toThrow();
    });

    it("Should give permission to a signals consumer to pull a signal when at least one purpose is ACTIVE", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId, state: "INACTIVE" };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );
      await createPurpose(
        postgresDB,
        config.interopSchema,
        getAPurpose({ eserviceId, consumerId, state: "ACTIVE" })
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).resolves.not.toThrow();
    });

    it("Should give permission to a signals consumer to pull a signal when e-service has more the one version and last is PUBLISHED", async () => {
      const consumerId = getUUID();
      const eserviceId = getUUID();
      const eservice = {
        eServiceId: eserviceId,
        descriptorId: "1",
        state: "DRAFT"
      };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId };
      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose
      );
      await createEservice(
        postgresDB,
        config.interopSchema,
        getAnEservice({
          eServiceId: eserviceId,
          descriptorId: "2",
          state: "PUBLISHED"
        })
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          consumerId,
          eserviceId,
          genericLogger
        )
      ).resolves.not.toThrow();
    });
  });

  describe("Authorization flow with delegation", () => {
    it("Should authorize delegated signal consumer to pull signal on behalf of delegator if: delegation is ACTIVE , agreement is ACTIVE  and at least a purpose (created by delegate) is ACTIVE", async () => {
      const consumerId = getUUID();

      const delegationId = getUUID();
      const delegateId = getUUID();

      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId, clientAccessDelegable: true };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId, delegationId };
      const delegation = {
        delegationId,
        delegatorId: consumerId, // delegante
        delegateId: delegateId, // delegato
        eServiceId: eserviceId
      };

      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose,
        delegation
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          delegateId,
          eserviceId,
          genericLogger
        )
      ).resolves.not.toThrow();
    });
    it("Should deny permission to a delegated signal consumer to pull signal without delegation", async () => {
      const consumerId = getUUID();
      const delegateId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId };

      const delegation = undefined;

      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose,
        delegation
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          delegateId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId: delegateId })
      );
    });

    it("Should deny permission to a delegated signal consumer with ACTIVE delegation but without agreement", async () => {
      const consumerId = getUUID();
      const delegateId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = undefined;
      const purpose = { eserviceId, consumerId };
      const delegation = {
        delegatorId: consumerId, // delegante
        delegateId: delegateId, // delegato
        eServiceId: eserviceId
      };

      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose,
        delegation
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          delegateId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId: delegateId })
      );
    });

    it("Should deny permission to a delegated signal consumer with ACTIVE delegation without purpose", async () => {
      const consumerId = getUUID();
      const delegateId = getUUID();
      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId };
      const agreement = { eserviceId, consumerId };
      const purpose = undefined;

      const delegation = {
        delegatorId: consumerId, // delegante
        delegateId: delegateId, // delegato
        eServiceId: eserviceId
      };

      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose,
        delegation
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          delegateId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId: delegateId })
      );
    });

    it("Should deny permission to a delegated signal consumer where a delegation is ACTIVE, agreement is ACTIVE  purpose is ACTIVE but the Eservice is not available for client access by delegate", async () => {
      const consumerId = getUUID();

      const delegationId = getUUID();
      const delegateId = getUUID();

      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId, clientAccessDelegable: false };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId, delegationId };
      const delegation = {
        delegationId,
        delegatorId: consumerId, // delegante
        delegateId: delegateId, // delegato
        eServiceId: eserviceId
      };

      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose,
        delegation
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          delegateId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId: delegateId })
      );
    });

    it("Should deny permission to a delegated signal consumer where a delegation is ACTIVE, agreement is ACTIVE and purpose is ACTIVE but without a delegationId field", async () => {
      const consumerId = getUUID();

      const delegationId = getUUID();
      const delegateId = getUUID();

      const eserviceId = getUUID();
      const eservice = { eServiceId: eserviceId, clientAccessDelegable: true };
      const agreement = { eserviceId, consumerId };
      const purpose = { eserviceId, consumerId, delegationId: undefined };
      const delegation = {
        delegationId,
        delegatorId: consumerId, // delegante
        delegateId: delegateId, // delegato
        eServiceId: eserviceId
      };

      await createAdministrativeActsForConsumer(
        postgresDB,
        config.interopSchema,
        eservice,
        agreement,
        purpose,
        delegation
      );

      await expect(
        interopService.consumerIsAuthorizedToPullSignals(
          delegateId,
          eserviceId,
          genericLogger
        )
      ).rejects.toThrowError(
        operationPullForbidden({ eserviceId, consumerId: delegateId })
      );
    });
  });
});
