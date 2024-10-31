import { AgreementStateV1 } from "@pagopa/interop-outbound-models";
import { genericLogger } from "pagopa-signalhub-commons";
import { truncateAgreementTable } from "pagopa-signalhub-commons-test";
import { beforeEach, describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import { handleMessageV1 } from "../src/handlers/index.js";
import { getAnAgreementEntityBy } from "./databaseUtils.js";
import {
  agreementService,
  createAnAgreementActivatedEventV1,
  createAnAgreementAddedEventV1,
  createAnAgreementContractAddedEventV1,
  createAnAgreementDeletedEventV1,
  createAnAgreementUpdatedEventV1,
  createAnAgreementV1,
  createAndWriteAnAgreementEventV1,
  fromEventToEntity,
  generateID,
  incrementVersion,
  postgresDB
} from "./utils.js";

describe("Message Handler for V1 EVENTS", () => {
  beforeEach(() => truncateAgreementTable(postgresDB, config.interopSchema));

  it("Should add an agreement for an AgreementAdded event", async () => {
    const id = generateID();
    const agreementV1 = createAnAgreementV1({ id });
    const agreementEventV1 = createAnAgreementAddedEventV1(agreementV1, id);

    await handleMessageV1(agreementEventV1, agreementService, genericLogger);

    const actualAgreement = await getAnAgreementEntityBy(id);
    const expectedAgreement = fromEventToEntity(agreementV1, agreementEventV1);
    expect(actualAgreement).toEqual(expectedAgreement);
  });

  it("Should update an agreement for an AgreementUpdated event", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 1;
    const { agreementV1 } = await createAndWriteAnAgreementEventV1(
      { id: agreementId },
      streamId,
      version
    );
    const agreementUpdatedV1 = {
      ...agreementV1,
      state: AgreementStateV1.SUSPENDED
    };
    const agreementUpdateEventV1 = createAnAgreementUpdatedEventV1(
      agreementUpdatedV1,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(
      agreementUpdateEventV1,
      agreementService,
      genericLogger
    );

    const actualAgreement = await getAnAgreementEntityBy(agreementId);
    const expectedAgreement = fromEventToEntity(
      agreementUpdatedV1,
      agreementUpdateEventV1
    );
    expect(actualAgreement).toEqual(expectedAgreement);
  });

  it("Should update an agreement for an AgreementActivated event", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 1;
    const { agreementV1 } = await createAndWriteAnAgreementEventV1(
      { id: agreementId, state: AgreementStateV1.DRAFT },
      streamId,
      version
    );
    const agreementActivatedV1 = {
      ...agreementV1,
      state: AgreementStateV1.ACTIVE
    };
    const agreementActivatedEventV1 = createAnAgreementActivatedEventV1(
      agreementActivatedV1,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(
      agreementActivatedEventV1,
      agreementService,
      genericLogger
    );

    const actualAgreement = await getAnAgreementEntityBy(agreementId);
    const expectedAgreement = fromEventToEntity(
      agreementActivatedV1,
      agreementActivatedEventV1
    );
    expect(actualAgreement).toEqual(expectedAgreement);
  });

  it("Should delete an agreement for an AgreementDeleted event", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 1;
    const { agreementV1 } = await createAndWriteAnAgreementEventV1(
      { id: agreementId },
      streamId,
      version
    );
    const agreementDeletedEventV1 = createAnAgreementDeletedEventV1(
      agreementV1,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(
      agreementDeletedEventV1,
      agreementService,
      genericLogger
    );

    const actualAgreement = await getAnAgreementEntityBy(agreementId);
    expect(actualAgreement).toBeNull();
  });

  it("Should apply idempotence not updating an event already processed", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 5;
    const { agreementV1, agreementAddedEventV1: agreementEventAddedV1 } =
      await createAndWriteAnAgreementEventV1(
        { id: agreementId, state: AgreementStateV1.ACTIVE },
        streamId,
        version
      );
    const agreementUpdatedV1 = {
      ...agreementV1,
      state: AgreementStateV1.SUSPENDED
    };
    const agreementUpdatedEventV1 = createAnAgreementUpdatedEventV1(
      agreementUpdatedV1,
      streamId,
      version
    );

    await handleMessageV1(
      agreementUpdatedEventV1,
      agreementService,
      genericLogger
    );

    const actualAgreement = await getAnAgreementEntityBy(agreementId);
    const expectedAgreement = fromEventToEntity(
      agreementV1,
      agreementEventAddedV1
    );
    expect(actualAgreement).toEqual(expectedAgreement);
  });

  it("Should ignore an AgreementContractAdded event", async () => {
    const id = generateID();
    const agreementV1 = createAnAgreementV1({ id });
    const agreementEventV1 = createAnAgreementContractAddedEventV1(
      agreementV1,
      id
    );

    await handleMessageV1(agreementEventV1, agreementService, genericLogger);

    const actualAgreement = await getAnAgreementEntityBy(id);
    expect(actualAgreement).toBeNull();
  });
});
