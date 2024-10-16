import { beforeAll, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";

import {
  createEservice,
  createInteropContext,
  createPurpose,
  dataResetForSignalConsumers,
  getAnEservice,
  getAPurpose,
  getUUID,
} from "pagopa-signalhub-commons-test";
import { operationPullForbidden } from "../src/model/domain/errors";
import { config } from "../src/config/env.js";
import { interopService, postgresDB } from "./utils";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalConsumers(postgresDB, config.interopSchema);
  });

  it("Should deny permission to a signal consumer without agreement and purpose for a non existent e-service", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();

    await expect(
      interopService.consumerIsAuthorizedToPullSignals(
        consumerId,
        eserviceId,
        genericLogger
      )
    ).rejects.toThrowError(operationPullForbidden({ eserviceId, consumerId }));
  });

  it("Should deny permission to a signal consumer for an unavailable e-service", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = undefined;
    const agreement = { eserviceId, consumerId };
    const purpose = { eserviceId, consumerId };
    await createInteropContext(
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
    ).rejects.toThrowError(operationPullForbidden({ eserviceId, consumerId }));
  });

  it("should deny permission to a signal consumer for an e-service not 'signal-hub enabled'", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId, enabledSH: false };
    const agreement = { eserviceId, consumerId };
    const purpose = { eserviceId, consumerId };
    await createInteropContext(
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
        eserviceId,
      })
    );
  });

  it("should deny permission to a signal consumer for an e-service in state != 'PUBLISHED'", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId, state: "DRAFT" };
    const agreement = { eserviceId, consumerId };
    const purpose = { eserviceId, consumerId };
    await createInteropContext(
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
        eserviceId,
      })
    );
  });

  it("Should deny permission to a signal consumer without agreement", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId };
    const agreement = undefined;
    const purpose = { eserviceId, consumerId };
    await createInteropContext(
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
    ).rejects.toThrowError(operationPullForbidden({ eserviceId, consumerId }));
  });

  it("should deny permission to a signal consumer for an agreement != ACTIVE", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId };
    const agreement = { eserviceId, consumerId, state: "INACTIVE" };
    const purpose = { eserviceId, consumerId };
    await createInteropContext(
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
        eserviceId,
      })
    );
  });

  it("Should deny permission to a signal consumer without purpose", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId };
    const agreement = { eserviceId, consumerId };
    const purpose = undefined;
    await createInteropContext(
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
    ).rejects.toThrowError(operationPullForbidden({ eserviceId, consumerId }));
  });

  it("should deny permission to a signal consumer with purpose != ACTIVE", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId };
    const agreement = { eserviceId, consumerId };
    const purpose = { eserviceId, consumerId, state: "INACTIVE" };
    await createInteropContext(
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
    ).rejects.toThrowError(operationPullForbidden({ eserviceId, consumerId }));
  });

  it("should give permission to a signals consumer to pull a signal", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId };
    const agreement = { eserviceId, consumerId };
    const purpose = { eserviceId, consumerId };
    await createInteropContext(
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

  it("should give permission to a signals consumer to pull a signal when at least one purpose is ACTIVE", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId };
    const agreement = { eserviceId, consumerId };
    const purpose = { eserviceId, consumerId, state: "INACTIVE" };
    await createInteropContext(
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

  it("should give permission to a signals consumer to pull a signal when e-service has more the one version and last is PUBLISHED", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = {
      eServiceId: eserviceId,
      descriptorId: "1",
      state: "DRAFT",
    };
    const agreement = { eserviceId, consumerId };
    const purpose = { eserviceId, consumerId };
    await createInteropContext(
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
        state: "PUBLISHED",
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
