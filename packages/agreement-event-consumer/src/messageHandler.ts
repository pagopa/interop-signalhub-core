/* eslint-disable @typescript-eslint/no-empty-function */
import { Agreement, Logger } from "pagopa-signalhub-commons";
import { AgreementEvent, AgreementV1 } from "pagopa-interop-outbound-models";

import { match } from "ts-pattern";
import { AgreementService } from "./services/agreement.service.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AgreementEventV1 = Extract<AgreementEvent, { event_version: 1 }>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AgreementEventV2 = Extract<AgreementEvent, { event_version: 2 }>;

export async function handleMessageV1(
  event: AgreementEventV1,
  agreementService: AgreementService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      { type: "AgreementAdded" },
      async (evt) =>
        await agreementService.update(toAgreement(evt.data.agreement!), logger)
    )
    .with({ type: "AgreementDeleted" }, async (evt) => {
      await agreementService.delete(evt.data.agreementId, logger);
    })
    .with(
      { type: "AgreementUpdated" },
      { type: "AgreementActivated" },
      { type: "AgreementSuspended" },
      { type: "AgreementDeactivated" },
      async (evt) => {
        await agreementService.update(toAgreement(evt.data.agreement!), logger);
      }
    )
    .with({ type: "VerifiedAttributeUpdated" }, async () => {})
    .with({ type: "AgreementConsumerDocumentAdded" }, async () => {})
    .with({ type: "AgreementConsumerDocumentRemoved" }, async () => {})
    .with({ type: "AgreementContractAdded" }, async () => {})
    .exhaustive();
}

export function handleMessageV2(
  event: AgreementEventV2,
  _agreementService: AgreementService,
  logger: Logger
): void {
  logger.info(`Processing event version: ${event.event_version}`);
}

export const toAgreement = (agreement: AgreementV1): Agreement => ({
  eventId: -1,
  eserviceId: agreement.eserviceId,
  producerId: agreement.producerId,
  consumerId: agreement.consumerId,
  agreementId: agreement.id,
  descriptorId: agreement.descriptorId,
  state: agreement.state.toString(),
});
