import { randomUUID } from "crypto";
import { genericLogger } from "pagopa-signalhub-commons";
import {
  createEservice,
  dataPreparationForSignalProducers,
  dataResetForSignalProducers
} from "pagopa-signalhub-commons-test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import { operationPushForbidden } from "../src/models/domain/errors.js";
import { interopService, postgresDB } from "./utils.js";

describe("PDND Interoperability service", () => {
  beforeAll(async () => {
    await dataResetForSignalProducers(postgresDB, config.interopSchema);
    await dataPreparationForSignalProducers(postgresDB, config.interopSchema);
  });

  afterAll(async () => {
    await dataResetForSignalProducers(postgresDB, config.interopSchema);
  });

  it("Should give permission to a signal producer authorized to use signal-hub push service", async () => {
    const producerId = randomUUID();
    const eServiceId = randomUUID();
    const descriptorId = randomUUID();

    await createEservice(postgresDB, config.interopSchema, {
      eServiceId,
      descriptorId,
      producerId,
      enabledSH: true,
      state: "PUBLISHED"
    });

    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        producerId,
        eServiceId,
        genericLogger
      )
    ).resolves.not.toThrow();
  });

  it("should deny permission to a signals producer who isn't eservice's owner", async () => {
    const producerId = randomUUID();
    const eServiceId = randomUUID();
    const descriptorId = randomUUID();

    const differentProducerId = "different-producer-id";

    await createEservice(postgresDB, config.interopSchema, {
      eServiceId,
      descriptorId,
      producerId,
      enabledSH: true,
      state: "PUBLISHED"
    });

    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        differentProducerId,
        eServiceId,
        genericLogger
      )
    ).rejects.toThrowError(
      operationPushForbidden({
        producerId: differentProducerId,
        eserviceId: eServiceId
      })
    );
  });

  it("should deny permission to a signals producer who is owner of an e-service with state != PUBLISHED", async () => {
    const producerId = randomUUID();
    const eServiceId = randomUUID();
    const descriptorId = randomUUID();

    await createEservice(postgresDB, config.interopSchema, {
      eServiceId,
      descriptorId,
      producerId,
      enabledSH: true,
      state: "DRAFT"
    });

    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        producerId,
        eServiceId,
        genericLogger
      )
    ).rejects.toThrowError(
      operationPushForbidden({ producerId, eserviceId: eServiceId })
    );
  });

  it("should deny permission to a signals producer who is owner of an e-service with state == PUBLISHED but there is not authorization for signal-hub push service", async () => {
    const producerId = randomUUID();
    const eServiceId = randomUUID();
    const descriptorId = randomUUID();

    await createEservice(postgresDB, config.interopSchema, {
      eServiceId,
      descriptorId,
      producerId,
      enabledSH: false,
      state: "PUBLISHED"
    });

    await expect(
      interopService.producerIsAuthorizedToPushSignals(
        producerId,
        eServiceId,
        genericLogger
      )
    ).rejects.toThrowError(
      operationPushForbidden({ producerId, eserviceId: eServiceId })
    );
  });
});
