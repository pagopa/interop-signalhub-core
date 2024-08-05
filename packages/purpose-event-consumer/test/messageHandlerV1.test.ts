import { beforeEach, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";
import { PurposeV1 } from "@pagopa/interop-outbound-models";
import { truncatePurposeTable } from "pagopa-signalhub-commons-test";
import { handleMessageV1 } from "../src/handlers/index.js";
import {
  createAPurposeCreatedEventV1,
  fromEventToEntity,
  getMockPurposeV1,
  getMockPurposeVersionV1,
  postgresDB,
  purposeService,
} from "./utils";
import { getAPurposeEntityBy } from "./databaseUtils";

describe("Message Handler for V1 EVENTS", () => {
  beforeEach(() => truncatePurposeTable(postgresDB));
  const mockPurposeV1 = getMockPurposeV1();
  const mockPurposeVersionV1 = getMockPurposeVersionV1();

  it.skip("Should NOT add a purpose for a PurposeCreated event, for a purpose without version", async () => {
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
    // console.log(mockPurposeV1);
    await handleMessageV1(purposeCreatedEventV1, purposeService, genericLogger);

    const actualPurpose = await getAPurposeEntityBy(mockPurposeV1.id);
    const expectedPurpose = fromEventToEntity(
      purposeCreatedWithVersion,
      purposeCreatedEventV1
    );
    expect(actualPurpose).toStrictEqual(expectedPurpose);
  });
});
