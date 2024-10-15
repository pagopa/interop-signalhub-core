import { beforeAll, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";

import {
  createInteropContext,
  dataResetForSignalConsumers,
  getUUID,
} from "pagopa-signalhub-commons-test";
import { operationPullForbidden } from "../src/model/domain/errors";
import { config } from "../src/config/env.js";
import { interopService, postgresDB } from "./utils";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalConsumers(postgresDB, config.interopSchema);
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

  it("Should deny permission to a signal consumer without purpose available", async () => {
    const consumerId = getUUID();
    const eserviceId = getUUID();
    const eservice = { eServiceId: eserviceId };
    const agreement = { eserviceId, consumerId };
    await createInteropContext(
      postgresDB,
      config.interopSchema,
      eservice,
      agreement,
      undefined
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
});
