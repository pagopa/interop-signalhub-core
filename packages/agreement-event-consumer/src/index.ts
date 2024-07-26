/* eslint-disable no-console */
import { correlationId, Logger, logger } from "pagopa-signalhub-commons";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { match } from "ts-pattern";
import {
  AgreementEvent,
  decodeOutboundAgreementEvent,
} from "pagopa-interop-outbound-models";
import { config } from "./config/env.js";
import { handleMessageV1, handleMessageV2 } from "./messageHandler.js";
import { serviceBuilder } from "./services/service.builder.js";

const { agreementService } = serviceBuilder();

export async function processMessage({
  message,
  partition,
}: EachMessagePayload): Promise<void> {
  if (!message.value) {
    throw new Error("Invalid message: missing value");
  }
  const agreementEvent = decodeOutboundAgreementEvent(message.value.toString());

  const logger = buildLoggerInstance(agreementEvent, correlationId());
  logger.info(
    `Processing message event: ${agreementEvent.stream_id}/${agreementEvent.version}`
  );

  await match(agreementEvent)
    .with({ event_version: 1 }, (agreement) =>
      handleMessageV1(agreement, agreementService, logger)
    )
    .with({ event_version: 2 }, (agreement) =>
      handleMessageV2(agreement, agreementService, logger)
    )
    .exhaustive();

  logger.info(
    `Message was processed. Partition number: ${partition}. Offset: ${message.offset}`
  );
}

await runConsumer(config, [config.agreementTopic], processMessage);

function buildLoggerInstance(
  agreementEvent: AgreementEvent,
  correlationId: string
): Logger {
  return logger({
    serviceName: "agreement-event-consumer",
    eventType: agreementEvent.type,
    eventVersion: agreementEvent.event_version,
    streamId: agreementEvent.stream_id,
    correlationId,
  });
}
