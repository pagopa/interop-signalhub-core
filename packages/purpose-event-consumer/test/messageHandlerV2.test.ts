import { beforeEach, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";
import {
  PurposeEventV2,
  PurposeStateV2,
  PurposeV2,
  PurposeVersionV2,
} from "@pagopa/interop-outbound-models";
import { truncatePurposeTable } from "pagopa-signalhub-commons-test";
import { handleMessageV2 } from "../src/handlers/index.js";
import {
  createAndWriteAPurposeEventV2,
  createAPurposeEventV2,
  createAPurposeVersionEventV2,
  fromEventToEntity,
  generateId,
  getMockPurpose,
  getMockPurposeVersion,
  incrementVersion,
  postgresDB,
  purposeService,
} from "./utils.js";
import { getAPurposeEntityBy } from "./databaseUtils.js";

describe("Message Handler for V2 EVENTS", () => {
  beforeEach(() => truncatePurposeTable(postgresDB));
  const mockPurposeV2 = {
    ...getMockPurpose(),
    isFreeOfCharge: false,
  } as PurposeV2;
  const mockPurposeVersionV2 = getMockPurposeVersion() as PurposeVersionV2;

  it("Should ignore these events: PurposeAdded, DraftPurposeUpdated, PurposeWaitingForApproval, DraftPurposeDeleted, WaitingForApprovalPurposeDeleted, NewPurposeVersionWaitingForApproval, WaitingForApprovalPurposeVersionDeleted, PurposeVersionRejected, PurposeCloned", async () => {
    const eventTypes = [
      "PurposeAdded",
      "DraftPurposeUpdated",
      "PurposeWaitingForApproval",
      "DraftPurposeDeleted",
      "WaitingForApprovalPurposeDeleted",
    ] as const;

    const eventVersionTypes = [
      "NewPurposeVersionWaitingForApproval",
      "WaitingForApprovalPurposeVersionDeleted",
      "PurposeVersionRejected",
      "PurposeCloned",
    ] as const;

    const purpose: PurposeV2 = {
      ...mockPurposeV2,
      versions: [mockPurposeVersionV2],
    };

    for (const eventType of eventTypes) {
      const purposeEventV2 = createAPurposeEventV2(eventType, purpose);

      await handleMessageV2(purposeEventV2, purposeService, genericLogger);

      const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
      expect(actualPurpose).toBeNull();
    }

    for (const eventVersionType of eventVersionTypes) {
      const purposeEventV2 = createAPurposeVersionEventV2(
        eventVersionType,
        purpose
      );

      await handleMessageV2(purposeEventV2, purposeService, genericLogger);

      const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
      expect(actualPurpose).toBeNull();
    }
  });

  it("Should activate a purpose for a PurposeVersionActivated, NewPurposeVersionActivated event", async () => {
    const anActiveVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.ACTIVE,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [anActiveVersion],
    };
    const eventVersionTypes = [
      "PurposeVersionActivated",
      "NewPurposeVersionActivated",
    ] as const;
    for (const eventVersionType of eventVersionTypes) {
      const purposeEventV2 = createAPurposeVersionEventV2(
        eventVersionType,
        purposeV2
      );

      await handleMessageV2(purposeEventV2, purposeService, genericLogger);

      const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
      const expectedPurpose = fromEventToEntity(
        purposeV2,
        anActiveVersion,
        purposeEventV2
      );
      expect(actualPurpose).toStrictEqual(expectedPurpose);
    }
  });

  it("Should activate a purpose for a PurposeActivated event, with two version: one ACTIVE, one in DRAFT", async () => {
    const anActiveVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.ACTIVE,
    };
    const aDraftVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.DRAFT,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [anActiveVersion, aDraftVersion],
    };
    const purposeEventV2 = createAPurposeEventV2("PurposeActivated", purposeV2);

    await handleMessageV2(purposeEventV2, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
    const expectedPurpose = fromEventToEntity(
      purposeV2,
      anActiveVersion,
      purposeEventV2
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should activate a purpose for a PurposeVersionOverQuotaUnsuspended event, with two version: one ACTIVE, one in WAITING_FOR_APPROVAL", async () => {
    const anActiveVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.ACTIVE,
    };
    const aWaitingForApprovalVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.WAITING_FOR_APPROVAL,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [anActiveVersion, aWaitingForApprovalVersion],
    };
    const purposeEventV2 = createAPurposeVersionEventV2(
      "PurposeVersionOverQuotaUnsuspended",
      purposeV2
    );

    await handleMessageV2(purposeEventV2, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
    const expectedPurpose = fromEventToEntity(
      purposeV2,
      anActiveVersion,
      purposeEventV2
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });
  it("Should not activate a purpose for a PurposeActivated event without a version in ACTIVE state", async () => {
    const aSuspendedVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.SUSPENDED,
    };
    const aWaitingForApprovalVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.WAITING_FOR_APPROVAL,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [aSuspendedVersion, aWaitingForApprovalVersion],
    };
    const purposeEventV2 = createAPurposeEventV2("PurposeActivated", purposeV2);

    await handleMessageV2(purposeEventV2, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
    const expectedPurpose = fromEventToEntity(
      purposeV2,
      aSuspendedVersion,
      purposeEventV2
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should apply idempotence on a PurposeVersionActivated event", async () => {
    const streamId = generateId();
    const version = 1;
    const anActiveVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.ACTIVE,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [anActiveVersion],
    };
    await createAndWriteAPurposeEventV2(purposeV2, streamId, version);

    const purposeSuspendedV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [
        {
          ...mockPurposeVersionV2,
          state: PurposeStateV2.ACTIVE,
        },
      ],
    };
    const purposeEventV2 = createAPurposeVersionEventV2(
      "PurposeVersionSuspendedByProducer",
      purposeSuspendedV2,
      streamId,
      version
    );
    await handleMessageV2(purposeEventV2, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
    const expectedPurpose = fromEventToEntity(
      purposeV2,
      anActiveVersion,
      purposeEventV2
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });

  it("Should suspend a purpose for a PurposeVersionSuspendedByProducer, PurposeVersionSuspendedByConsumer events, updating purpose from ACTIVE to SUSPENDED", async () => {
    const streamId = generateId();
    const version = 1;
    const anActiveVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.ACTIVE,
    };
    const aSuspendedVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.SUSPENDED,
    };
    const aDraftVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.DRAFT,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [anActiveVersion],
    };
    await createAndWriteAPurposeEventV2(purposeV2, streamId, version);

    const purposeSuspendedV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [aSuspendedVersion, aDraftVersion],
    };

    const eventVersionTypes = [
      "PurposeVersionSuspendedByProducer",
      "PurposeVersionSuspendedByConsumer",
    ] as const;
    for (const eventVersionType of eventVersionTypes) {
      const purposeEventV2 = createAPurposeVersionEventV2(
        eventVersionType,
        purposeSuspendedV2,
        streamId,
        incrementVersion(version)
      );

      await handleMessageV2(purposeEventV2, purposeService, genericLogger);

      const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
      const expectedPurpose = fromEventToEntity(
        purposeSuspendedV2,
        aSuspendedVersion,
        purposeEventV2
      );
      expect(actualPurpose).toStrictEqual(expectedPurpose);
    }
  });

  it("Should not suspend a purpose for a PurposeVersionUnsuspendedByProducer, PurposeVersionUnsuspendedByConsumer events with a version in ACTIVE state", async () => {
    const anActiveVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.ACTIVE,
    };
    const aSuspendedVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.SUSPENDED,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [aSuspendedVersion, anActiveVersion],
    };

    const eventVersionTypes = [
      "PurposeVersionUnsuspendedByProducer",
      "PurposeVersionUnsuspendedByConsumer",
    ] as const;
    for (const eventVersionType of eventVersionTypes) {
      const purposeEventV2 = createAPurposeVersionEventV2(
        eventVersionType,
        purposeV2
      );

      await handleMessageV2(purposeEventV2, purposeService, genericLogger);

      const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
      const expectedPurpose = fromEventToEntity(
        purposeV2,
        anActiveVersion,
        purposeEventV2
      );
      expect(actualPurpose).toStrictEqual(expectedPurpose);
    }
  });

  it("Should archive a purpose for a PurposeArchived event", async () => {
    const streamId = generateId();
    const version = 1;
    const anArchivedVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.ACTIVE,
    };
    const aSuspendedVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.SUSPENDED,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [aSuspendedVersion, anArchivedVersion],
    };
    const purposeEventV2 = createAPurposeVersionEventV2(
      "PurposeArchived",
      purposeV2,
      streamId,
      incrementVersion(version)
    );

    await handleMessageV2(purposeEventV2, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV2.id);
    const expectedPurpose = fromEventToEntity(
      purposeV2,
      anArchivedVersion,
      purposeEventV2
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });
  it("Should throw an error if a purpose (event.data) is missing", async () => {
    const purposeEventV2: PurposeEventV2 = {
      type: "PurposeActivated",
      data: {
        purpose: undefined,
      },
      event_version: 2,
      stream_id: generateId(),
      version: 1,
      timestamp: new Date(),
    };
    await expect(
      handleMessageV2(purposeEventV2, purposeService, genericLogger)
    ).rejects.toThrow("Missing purpose");
  });

  it("Should throw an error if versions[] has no valid state", async () => {
    const aDraftVersion = {
      ...mockPurposeVersionV2,
      state: PurposeStateV2.DRAFT,
    };
    const purposeV2: PurposeV2 = {
      ...mockPurposeV2,
      versions: [aDraftVersion],
    };
    const purposeEventV2 = createAPurposeEventV2("PurposeActivated", purposeV2);

    await expect(
      handleMessageV2(purposeEventV2, purposeService, genericLogger)
    ).rejects.toThrow("No version in a valid state in versions");
  });
});
