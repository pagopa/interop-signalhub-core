import { beforeEach, describe, expect, it } from "vitest";
import { AgreementStateV2 } from "@pagopa/interop-outbound-models";
import { truncateAgreementTable } from "pagopa-signalhub-commons-test";
import { genericLogger } from "pagopa-signalhub-commons";
import { handleMessageV2 } from "../src/handlers/index.js";
import { config } from "../src/config/env.js";
import {
  agreementService,
  createAnAgreementV2,
  createAnAgreementEventV2,
  generateID,
  incrementVersion,
  postgresDB,
  fromEventToEntity,
  createAndWriteAnAgreementEventV2,
  createAnAgreementConsumerDocumentAddedEventV2,
} from "./utils.js";
import { getAnAgreementEntityBy } from "./databaseUtils.js";

describe("Message Handler for V2 EVENTS", () => {
  beforeEach(() => truncateAgreementTable(postgresDB, config.interopSchema));

  it("Should add an agreement for an AgreementAdded event", async () => {
    const id = generateID();
    const agreementV2 = createAnAgreementV2({ id });
    const agreementEventV2 = createAnAgreementEventV2(
      "AgreementAdded",
      agreementV2,
      id
    );

    await handleMessageV2(agreementEventV2, agreementService, genericLogger);

    const actualAgreement = await getAnAgreementEntityBy(id);
    const expectedAgreement = fromEventToEntity(agreementV2, agreementEventV2);
    expect(actualAgreement).toEqual(expectedAgreement);
  });

  it("Should update an agreement for all Agreement events that updating agreement state", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 1;
    const { agreementV2 } = await createAndWriteAnAgreementEventV2(
      { id: agreementId, state: AgreementStateV2.DRAFT },
      streamId,
      version
    );

    const eventTypes = [
      "AgreementActivated",
      "AgreementArchivedByConsumer",
      "AgreementArchivedByUpgrade",
      "AgreementSetDraftByPlatform",
      "AgreementSetMissingCertifiedAttributesByPlatform",
      "AgreementSuspendedByConsumer",
      "AgreementSuspendedByProducer",
      "AgreementSuspendedByPlatform",
      "AgreementUnsuspendedByConsumer",
      "AgreementUnsuspendedByProducer",
      "AgreementUnsuspendedByPlatform",
      "AgreementUpgraded",
      "AgreementRejected",
      "DraftAgreementUpdated",
      "AgreementSubmitted",
    ] as const;

    const agreementUpdatedV2 = {
      ...agreementV2,
      state: AgreementStateV2.ACTIVE,
    };

    for (const eventType of eventTypes) {
      const agreementEventV2 = createAnAgreementEventV2(
        eventType,
        agreementUpdatedV2,
        streamId,
        incrementVersion(version)
      );

      await handleMessageV2(agreementEventV2, agreementService, genericLogger);

      const actualAgreement = await getAnAgreementEntityBy(agreementId);
      const expectedAgreement = fromEventToEntity(
        agreementUpdatedV2,
        agreementEventV2
      );
      expect(actualAgreement).toEqual(expectedAgreement);
    }
  });

  it("Should delete an agreement for an AgreementDeleted event", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 1;
    const { agreementV2 } = await createAndWriteAnAgreementEventV2(
      { id: agreementId, state: AgreementStateV2.ACTIVE },
      streamId,
      version
    );
    const agreementEventV2 = createAnAgreementEventV2(
      "AgreementDeleted",
      agreementV2,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV2(agreementEventV2, agreementService, genericLogger);

    const actualAgreement = await getAnAgreementEntityBy(agreementId);
    expect(actualAgreement).toBeNull();
  });

  it("Should apply idempotence not updating an event already processed", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 5;
    const { agreementV2, agreementEventV2 } =
      await createAndWriteAnAgreementEventV2(
        { id: agreementId },
        streamId,
        version
      );
    const agreementUpdated = {
      ...agreementV2,
      state: AgreementStateV2.ACTIVE,
    };
    const agreementEventUpdatedV2 = createAnAgreementEventV2(
      "AgreementActivated",
      agreementUpdated,
      streamId,
      version
    );

    await handleMessageV2(
      agreementEventUpdatedV2,
      agreementService,
      genericLogger
    );

    const actualAgreement = await getAnAgreementEntityBy(agreementId);
    const expectedAgreement = fromEventToEntity(agreementV2, agreementEventV2);
    expect(actualAgreement).toEqual(expectedAgreement);
  });

  it("Should ignore all AgreementEvent not managed", async () => {
    const id = generateID();
    const agreementV2 = createAnAgreementV2({ id });
    const agreementEventV2 = createAnAgreementConsumerDocumentAddedEventV2(
      agreementV2,
      id
    );

    await handleMessageV2(agreementEventV2, agreementService, genericLogger);

    const actualAgreement = await getAnAgreementEntityBy(id);
    expect(actualAgreement).toBeNull();
  });
});
