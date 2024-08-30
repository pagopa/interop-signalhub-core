/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import {
  AgreementV1,
  AgreementEventV1,
  AgreementStateV1,
} from "@pagopa/interop-outbound-models";

import { P, match } from "ts-pattern";
import { AgreementService } from "../services/agreement.service.js";
import { AgreementEntity } from "../models/domain/model.js";
import { config } from "../config/env.js";

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
          toAgreementEntity(
            evt.data.agreement,
            evt.stream_id,
            evt.version,
            event.type
          ),
          logger
        )
    )
    .with(
      {
        type: P.union(
          "AgreementUpdated",
          "AgreementActivated",
          "AgreementSuspended",
          "AgreementDeactivated"
        ),
      },

      async (evt) => {
        await agreementService.update(
          toAgreementEntity(
            evt.data.agreement,
            evt.stream_id,
            evt.version,
            event.type
          ),
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
    .with(
      {
        type: P.union(
          "AgreementContractAdded",
          "AgreementConsumerDocumentAdded",
          "AgreementConsumerDocumentRemoved",
          "VerifiedAttributeUpdated"
        ),
      },
      async () => {
        logger.info(`Skip event (not relevant)`);
      }
    )
    .exhaustive();
}

export const toAgreementEntity = (
  agreement: AgreementV1 | undefined,
  streamId: string,
  version: number,
  eventType: string
): AgreementEntity => {
  if (!agreement) {
    throw kafkaMessageMissingData(config.kafkaTopic, eventType);
  }
  return {
    agreement_id: agreement.id,
    eservice_id: agreement.eserviceId,
    descriptor_id: agreement.descriptorId,
    consumer_id: agreement.consumerId,
    state: AgreementStateV1[agreement.state],
    event_stream_id: streamId,
    event_version_id: version,
  };
};
