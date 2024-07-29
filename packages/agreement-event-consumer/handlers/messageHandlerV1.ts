/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "pagopa-signalhub-commons";
import { AgreementEvent, AgreementV1 } from "@pagopa/interop-outbound-models";

import { match } from "ts-pattern";
import { AgreementService } from "../src/services/agreement.service.js";
import { AgreementEntity } from "../src/models/domain/model.js";

// types from pagopa-interop-outbound-models, only TEMPORARY defined here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AgreementEventV1 = Extract<AgreementEvent, { event_version: 1 }>;

export async function handleMessageV1(
  event: AgreementEventV1,
  agreementService: AgreementService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      { type: "AgreementAdded" },
      async (evt) =>
        await agreementService.insert(
          toAgreementEntity(evt.data.agreement, evt.stream_id, evt.version),
          logger
        )
    )
    .with({ type: "AgreementDeleted" }, async (evt) => {
      await agreementService.delete(
        evt.data.agreementId,
        evt.stream_id,
        logger
      );
    })
    .with(
      { type: "AgreementUpdated" },
      { type: "AgreementActivated" },
      { type: "AgreementSuspended" },
      { type: "AgreementDeactivated" },
      async (evt) => {
        await agreementService.update(
          toAgreementEntity(evt.data.agreement, evt.stream_id, evt.version),
          logger
        );
      }
    )
    .otherwise(async () => {
      logger.debug(`Event type ${event.type} not relevant`);
    });
}

export const toAgreementEntity = (
  agreement: AgreementV1 | undefined,
  streamId: string,
  version: number
): AgreementEntity => {
  if (!agreement) {
    throw new Error("Invalid agreement");
  }
  return {
    agreement_id: agreement.id,
    eservice_id: agreement.eserviceId,
    descriptor_id: agreement.descriptorId,
    consumer_id: agreement.consumerId,
    state: agreement.state.toString(),
    event_stream_id: streamId,
    event_version_id: version,
  };
};
