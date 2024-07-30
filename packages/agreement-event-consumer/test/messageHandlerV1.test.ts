import { beforeEach, describe, expect, it } from "vitest";
import { AgreementEventV1, AgreementV1 } from "@pagopa/interop-outbound-models";
import { truncateAgreementTable } from "pagopa-signalhub-commons-test";
import { genericLogger } from "pagopa-signalhub-commons";
import { handleMessageV1 } from "../src/handlers/index.js";
import {
  agreementService,
  createAnAgreement,
  createAnEventAgreement,
  getAnAgreementBy,
  postgresDB,
} from "./utils";

describe("Message Handler for V1 EVENTS", () => {
  beforeEach(() => truncateAgreementTable(postgresDB));
  it("Should add an agreement for an AgreementAdded event", async () => {
    const agreementId = "abc";
    const stream_id = agreementId;
    const version = 1;
    const agreementV1: AgreementV1 = createAnAgreement({
      id: agreementId,
    });
    const agreementEventAddedV1: AgreementEventV1 = createAnEventAgreement(
      agreementV1,
      stream_id,
      version
    );

    await handleMessageV1(
      agreementEventAddedV1,
      agreementService,
      genericLogger
    );

    const agreement = await getAnAgreementBy(agreementId);
    expect(agreement.agreement_id).toBe(agreementV1.id);
    expect(agreement.state).toBe(agreementV1.state.toString());
  });
});
