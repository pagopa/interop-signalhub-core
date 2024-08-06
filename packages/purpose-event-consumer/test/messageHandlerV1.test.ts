import { beforeEach, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";
import { PurposeStateV1, PurposeV1 } from "@pagopa/interop-outbound-models";
import { truncatePurposeTable } from "pagopa-signalhub-commons-test";
import { handleMessageV1 } from "../src/handlers/index.js";
import {
  createAndWriteAPurposeEventV1,
  createAPurposeEventV1,
  createAPurposeVersionEventV1,
  fromEventToEntity,
  generateId,
  getMockPurposeV1,
  getMockPurposeVersionV1,
  incrementVersion,
  postgresDB,
  purposeService,
} from "./utils.js";
import { getAPurposeEntityBy } from "./databaseUtils.js";

describe("Message Handler for V1 EVENTS", () => {
  beforeEach(() => truncatePurposeTable(postgresDB));
  const mockPurposeV1 = getMockPurposeV1();
  const mockPurposeVersionV1 = getMockPurposeVersionV1();

  it("Should ignore these events: PurposeCreated, PurposeUpdated, PurposeVersionWaitedForApproval, PurposeVersionCreated, PurposeVersionUpdated, PurposeVersionDeleted, PurposeVersionRejected, PurposeDeleted", async () => {
    const eventTypes = [
      "PurposeCreated",
      "PurposeUpdated",
      "PurposeVersionWaitedForApproval",
    ] as const;

    const eventVersionTypes = [
      "PurposeVersionCreated",
      "PurposeVersionUpdated",
      "PurposeVersionDeleted",
      "PurposeVersionRejected",
      "PurposeDeleted",
    ] as const;

    const purpose: PurposeV1 = {
      ...mockPurposeV1,
      versions: [mockPurposeVersionV1],
    };

    for (const eventType of eventTypes) {
      const purposeEventV1 = createAPurposeEventV1(eventType, purpose);

      await handleMessageV1(purposeEventV1, purposeService, genericLogger);

      const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
      expect(actualPurpose).toBeNull();
    }

    for (const eventVersionType of eventVersionTypes) {
      const purposeEventV1 = createAPurposeVersionEventV1(
        eventVersionType,
        purpose
      );

      await handleMessageV1(purposeEventV1, purposeService, genericLogger);

      const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
      expect(actualPurpose).toBeNull();
    }
  });

  it("Should activate  a purpose for a PurposeVersionActivated event", async () => {
    const anActiveVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.ACTIVE,
    };
    const purposeV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [anActiveVersion],
    };
    const purposeEventV1 = createAPurposeEventV1(
      "PurposeVersionActivated",
      purposeV1
    );

    await handleMessageV1(purposeEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeV1,
      anActiveVersion,
      purposeEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should activate a purpose for a PurposeVersionActivated event, with two version: one ACTIVE, one in DRAFT", async () => {
    const anActiveVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.ACTIVE,
    };
    const aDraftVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.DRAFT,
    };
    const purposeV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [anActiveVersion, aDraftVersion],
    };
    const purposeEventV1 = createAPurposeEventV1(
      "PurposeVersionSuspended",
      purposeV1
    );

    await handleMessageV1(purposeEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeV1,
      anActiveVersion,
      purposeEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should not activate a purpose for a PurposeVersionActivated event without a version in ACTIVE state", async () => {
    const aSuspendedVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.SUSPENDED,
    };
    const aWaitingForApprovalVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.WAITING_FOR_APPROVAL,
    };
    const purposeV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [aSuspendedVersion, aWaitingForApprovalVersion],
    };
    const purposeEventV1 = createAPurposeEventV1(
      "PurposeVersionActivated",
      purposeV1
    );

    await handleMessageV1(purposeEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeV1,
      aSuspendedVersion,
      purposeEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should apply idempotence on a PurposeVersionActivated event", async () => {
    const streamId = generateId();
    const version = 1;
    const anActiveVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.ACTIVE,
    };
    const purposeV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [anActiveVersion],
    };
    await createAndWriteAPurposeEventV1(purposeV1, streamId, version);

    const purposeSuspendedV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [
        {
          ...mockPurposeVersionV1,
          state: PurposeStateV1.ACTIVE,
        },
      ],
    };
    const purposeEventV1 = createAPurposeEventV1(
      "PurposeVersionSuspended",
      purposeSuspendedV1,
      streamId,
      version
    );
    await handleMessageV1(purposeEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeV1,
      anActiveVersion,
      purposeEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should suspend a purpose for a PurposeVersionSuspended event, updating purpose from ACTIVE to SUSPENDED", async () => {
    const streamId = generateId();
    const version = 1;
    const anActiveVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.ACTIVE,
    };
    const aSuspendedVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.SUSPENDED,
    };
    const aDraftVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.DRAFT,
    };
    const purposeV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [anActiveVersion],
    };
    await createAndWriteAPurposeEventV1(purposeV1, streamId, version);

    const purposeSuspendedV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [aSuspendedVersion, aDraftVersion],
    };
    const purposeEventV1 = createAPurposeEventV1(
      "PurposeVersionSuspended",
      purposeSuspendedV1,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(purposeEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeSuspendedV1,
      aSuspendedVersion,
      purposeEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should not suspend a purpose for a PurposeVersionSuspended event with a version in ACTIVE state", async () => {
    const streamId = generateId();
    const version = 1;
    const anActiveVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.ACTIVE,
    };
    const aSuspendedVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.SUSPENDED,
    };
    const purposeV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [aSuspendedVersion, anActiveVersion],
    };
    const purposeEventV1 = createAPurposeEventV1(
      "PurposeVersionSuspended",
      purposeV1,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(purposeEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeV1,
      anActiveVersion,
      purposeEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should archive a purpose for a PurposeVersionArchived event", async () => {
    const streamId = generateId();
    const version = 1;
    const anArchivedVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.ACTIVE,
    };
    const aSuspendedVersion = {
      ...mockPurposeVersionV1,
      state: PurposeStateV1.SUSPENDED,
    };
    const purposeV1: PurposeV1 = {
      ...mockPurposeV1,
      versions: [aSuspendedVersion, anArchivedVersion],
    };
    const purposeEventV1 = createAPurposeEventV1(
      "PurposeVersionArchived",
      purposeV1,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV1(purposeEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeV1,
      anArchivedVersion,
      purposeEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });
});
