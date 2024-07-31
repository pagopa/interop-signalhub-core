import { beforeEach, describe, expect, it } from "vitest";
import { AgreementStateV1 } from "@pagopa/interop-outbound-models";
import { truncateAgreementTable } from "pagopa-signalhub-commons-test";
import { genericLogger } from "pagopa-signalhub-commons";
import { handleMessageV1 } from "../src/handlers/index.js";
import {
  agreementService,
  createAnAgreement,
  createAnEventAgreementActivated,
  createAnEventAgreementAdded,
  createAnEventAgreementDeleted,
  createAnEventAgreementUpdated,
  generateID,
  incrementVersion,
  postgresDB,
  toAgreementEntity,
  writeAnAgreementOnDatabase,
} from "./utils";
import { getAnAgreementBy } from "./databaseUtils.js";

describe("Message Handler for V1 EVENTS", () => {
  beforeEach(() => truncateAgreementTable(postgresDB));
  it("Should add an agreement for an AgreementAdded event", async () => {
    const id = generateID();
    const agreementV1 = createAnAgreement({ id });
    const agreementEventAddedV1 = createAnEventAgreementAdded(agreementV1, id);

    await handleMessageV1(
      agreementEventAddedV1,
      agreementService,
      genericLogger
    );

    const agreement = await getAnAgreementBy(id);
    expect(agreement).toEqual(
      toAgreementEntity(agreementV1, agreementEventAddedV1)
    );
  });
  it("Should update an agreement for an AgreementUpdated event", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 1;
    const { agreementV1 } = await writeAnAgreementOnDatabase(
      { id: agreementId },
      streamId,
      version
    );
    const agreementUpdated = {
      ...agreementV1,
      state: AgreementStateV1.SUSPENDED,
    };
    const agreementEventUpdatedV1 = createAnEventAgreementUpdated(
      agreementUpdated,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(
      agreementEventUpdatedV1,
      agreementService,
      genericLogger
    );

    const agreement = await getAnAgreementBy(agreementId);
    expect(agreement).toEqual(
      toAgreementEntity(agreementUpdated, agreementEventUpdatedV1)
    );
  });
  it("Should update an agreement for an AgreementActivated event", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 1;
    const { agreementV1 } = await writeAnAgreementOnDatabase(
      { id: agreementId, state: AgreementStateV1.DRAFT },
      streamId,
      version
    );
    const agreementUpdated = {
      ...agreementV1,
      state: AgreementStateV1.ACTIVE,
    };
    const agreementEventActivatedV1 = createAnEventAgreementActivated(
      agreementUpdated,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(
      agreementEventActivatedV1,
      agreementService,
      genericLogger
    );

    const agreement = await getAnAgreementBy(agreementId);
    expect(agreement).toEqual(
      toAgreementEntity(agreementUpdated, agreementEventActivatedV1)
    );
  });
  it("Should delete an agreement for an AgreementDeleted event", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 1;
    const { agreementV1 } = await writeAnAgreementOnDatabase(
      { id: agreementId },
      streamId,
      version
    );
    const agreementEventDeletedV1 = createAnEventAgreementDeleted(
      agreementV1,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(
      agreementEventDeletedV1,
      agreementService,
      genericLogger
    );

    const agreement = await getAnAgreementBy(agreementId);
    expect(agreement).toBeNull();
  });
  it("Should apply idempotence not updatin an event already processed", async () => {
    const agreementId = generateID();
    const streamId = agreementId;
    const version = 5;
    const { agreementV1, agreementEventAddedV1 } =
      await writeAnAgreementOnDatabase(
        { id: agreementId, state: AgreementStateV1.ACTIVE },
        streamId,
        version
      );
    const agreementUpdated = {
      ...agreementV1,
      state: AgreementStateV1.SUSPENDED,
    };
    const agreementEventUpdatedV1 = createAnEventAgreementUpdated(
      agreementUpdated,
      streamId,
      version
    );

    await handleMessageV1(
      agreementEventUpdatedV1,
      agreementService,
      genericLogger
    );

    const agreement = await getAnAgreementBy(agreementId);
    expect(agreement).toEqual(
      toAgreementEntity(agreementV1, agreementEventAddedV1)
    );
  });
});
