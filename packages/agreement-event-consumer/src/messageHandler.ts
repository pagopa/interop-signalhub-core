/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agreement, Logger } from "pagopa-signalhub-commons";
import { AgreementEvent } from "pagopa-interop-outbound-models";
import { match } from "ts-pattern";
import { AgreementService } from "./services/agreement.service.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AgreementEventV1 = Extract<AgreementEvent, { event_version: 1 }>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AgreementEventV2 = Extract<AgreementEvent, { event_version: 2 }>;

export async function handleMessageV1(
  agreementEvent: AgreementEventV1,
  agreementService: AgreementService,
  logger: Logger
): Promise<any> {
  logger.info(`Processing event version: ${agreementEvent.event_version}`);
  await match(agreementEvent)
    .with(
      { type: "AgreementAdded" },
      async (event) =>
        await agreementService.updateAgreement(event.data.agreement)
    )
    .with({ type: "AgreementDeleted" }, async (event) => {
      await agreementService.updateAgreement(event.data);
    })
    .with(
      { type: "AgreementUpdated" },
      { type: "AgreementActivated" },
      { type: "AgreementSuspended" },
      { type: "AgreementDeactivated" },
      { type: "VerifiedAttributeUpdated" },
      async (event) => {
        await agreementService.updateAgreement(event.data.agreement);
      }
    )
    .with({ type: "AgreementConsumerDocumentAdded" }, async (event) => {
      await agreementService.updateAgreement(event.data.agreement);
    })
    .with({ type: "AgreementConsumerDocumentRemoved" }, async (event) => {
      await agreementService.updateAgreement(event.data.agreement);
    })
    .with({ type: "AgreementContractAdded" }, async (event) => {
      await agreementService.updateAgreement(event.data.agreement);
    })
    .exhaustive();
}

export function handleMessageV2(
  agreementEvent: AgreementEventV2,
  _agreementService: AgreementService,
  logger: Logger
): any {
  logger.info(`Processing event version: ${agreementEvent.event_version}`);
}
