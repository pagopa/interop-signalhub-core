/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "pagopa-signalhub-commons";
import { AgreementV1, AgreementEventV1 } from "@pagopa/interop-outbound-models";

import { P, match } from "ts-pattern";
import { AgreementService } from "../services/agreement.service.js";
import { AgreementEntity } from "../models/domain/model.js";

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
    .with(
      {
        type: P.union(
          "AgreementUpdated",
          "AgreementActivated",
          "AgreementSuspended",
          "AgreementDeactivated",
          "AgreementDeactivated"
        ),
      },

      async (evt) => {
        await agreementService.update(
          toAgreementEntity(evt.data.agreement, evt.stream_id, evt.version),
          logger
        );
      }
    )
    .with({ type: "AgreementDeleted" }, async (evt) => {
      await agreementService.delete(
        evt.data.agreementId,
        evt.stream_id,
        logger
      );
    })
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
