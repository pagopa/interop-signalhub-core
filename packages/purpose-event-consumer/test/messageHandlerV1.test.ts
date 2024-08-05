import { beforeEach, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";
import { truncatePurposeTable } from "pagopa-signalhub-commons-test";
import { PurposeStateV1, PurposeV1 } from "@pagopa/interop-outbound-models";
import { handleMessageV1 } from "../src/handlers/index.js";
import {
  createAndWriteAPurposeEventV1,
  createAPurposeCreatedEventV1,
  createAPurposeDeletedEventV1,
  createAPurposeUpdatedEventV1,
  createAPurposeVersionActivatedEventV1,
  createAPurposeVersionASupendedEventV1,
  fromEventToEntity,
  generateId,
  getMockPurposeV1,
  getMockPurposeVersionV1,
  incrementVersion,
  postgresDB,
  purposeService,
} from "./utils";
import { getAPurposeEntityBy } from "./databaseUtils";

describe("Message Handler for V1 EVENTS", () => {
  beforeEach(() => truncatePurposeTable(postgresDB));
  const mockPurposeV1 = getMockPurposeV1();
  const mockPurposeVersionV1 = getMockPurposeVersionV1();

  it("Should NOT add a purpose for a PurposeCreated event, for a purpose without version", async () => {
    const agreementEventV1 = createAPurposeCreatedEventV1(mockPurposeV1);
    await handleMessageV1(agreementEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    expect(actualPurpose).toBeNull();
  });

  it("Should add a purpose for a PurposeCreated event, for a purpose with version", async () => {
    const purposeCreatedWithVersion: PurposeV1 = {
      ...mockPurposeV1,
      versions: [mockPurposeVersionV1],
    };
    const purposeCreatedEventV1 = createAPurposeCreatedEventV1(
      purposeCreatedWithVersion
    );
    await handleMessageV1(purposeCreatedEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeCreatedWithVersion,
      purposeCreatedEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should apply idempotence for a PurposeCreated event just processed", async () => {
    const streamId = generateId();
    const version = 1;
    const { purposeV1, purposeEventV1 } = await createAndWriteAPurposeEventV1(
      { ...mockPurposeV1, versions: [mockPurposeVersionV1] },
      streamId,
      version
    );
    const purposeUpdated: PurposeV1 = {
      ...mockPurposeV1,
      versions: [mockPurposeVersionV1],
    };
    const purposeCreatedEventV1 = createAPurposeCreatedEventV1(
      purposeUpdated,
      streamId,
      version
    );
    await handleMessageV1(purposeCreatedEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(purposeV1, purposeEventV1);
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should update a Purpose for a PurposeUpdated event", async () => {
    const streamId = generateId();
    const version = incrementVersion();
    const { purposeV1 } = await createAndWriteAPurposeEventV1(
      {
        ...mockPurposeV1,
        versions: [mockPurposeVersionV1],
      },
      streamId,
      version
    );
    const purposeUpdated: PurposeV1 = {
      ...purposeV1,
      eserviceId: generateId(), // should not change in production
    };
    const purposeUpdatedEventV1 = createAPurposeUpdatedEventV1(
      purposeUpdated,
      streamId,
      incrementVersion(version)
    );
    await handleMessageV1(purposeUpdatedEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeUpdated,
      purposeUpdatedEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should update a Purpose for a PurposeVersionActivated event", async () => {
    const streamId = generateId();
    const version = incrementVersion();
    const { purposeV1 } = await createAndWriteAPurposeEventV1(
      {
        ...mockPurposeV1,
        versions: [mockPurposeVersionV1],
      },
      streamId,
      version
    );
    const purposeVersionActivated = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.ACTIVE,
    };
    const purposeActivated: PurposeV1 = {
      ...purposeV1,
      versions: [purposeVersionActivated],
    };
    const purposeactivatedEventV1 = createAPurposeVersionActivatedEventV1(
      purposeActivated,
      streamId,
      incrementVersion(version)
    );
    await handleMessageV1(
      purposeactivatedEventV1,
      purposeService,
      genericLogger
    );

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeActivated,
      purposeactivatedEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should update a Purpose for a PurposeVersionSuspended event", async () => {
    const streamId = generateId();
    const version = incrementVersion();
    const { purposeV1 } = await createAndWriteAPurposeEventV1(
      {
        ...mockPurposeV1,
        versions: [{ ...mockPurposeVersionV1, state: PurposeStateV1.ACTIVE }],
      },
      streamId,
      version
    );
    const purposeVersionSuspended = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.SUSPENDED,
    };
    const purposeSuspended: PurposeV1 = {
      ...purposeV1,
      versions: [purposeVersionSuspended],
    };
    const purposeSuspendedEventV1 = createAPurposeVersionASupendedEventV1(
      purposeSuspended,
      streamId,
      incrementVersion(version)
    );
    await handleMessageV1(
      purposeSuspendedEventV1,
      purposeService,
      genericLogger
    );

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeSuspended,
      purposeSuspendedEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should delete a Purpose for a PurposeDeleted event", async () => {
    const streamId = generateId();
    const version = incrementVersion();
    await createAndWriteAPurposeEventV1(
      {
        ...mockPurposeV1,
        versions: [mockPurposeVersionV1],
      },
      streamId,
      version
    );

    const purposeDeletedEventV1 = createAPurposeDeletedEventV1(
      mockPurposeV1.id,
      streamId,
      incrementVersion(version)
    );
    await handleMessageV1(purposeDeletedEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    expect(actualPurpose).toBeNull();
  });
});
