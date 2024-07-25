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
  kafkaMessage,
  partition,
}: EachMessagePayload): Promise<void> {
  if (!kafkaMessage.value) {
    throw new Error("Invalid message: missing value");
  }
  const message = decodeOutboundAgreementEvent(kafkaMessage.value.toString());

  const logger = buildLoggerInstance(message, correlationId());
  logger.info(
    `Processing message event: ${message.stream_id}/${message.version}`
  );

  await match(message)
    .with({ event_version: 1 }, (msg) => handleMessageV1(msg, agreementService))
    .with({ event_version: 2 }, (msg) => handleMessageV2(msg, agreementService))
    .exhaustive();

  logger.info(
    `Message was processed. Partition number: ${partition}. Offset: ${kafkaMessage.offset}`
  );
}

await runConsumer(config, [config.agreementTopic], processMessage);

function buildLoggerInstance(
  message: AgreementEvent,
  correlationId: string
): Logger {
  return logger({
    serviceName: "agreement-event-consumer",
    eventType: message.type,
    eventVersion: message.event_version,
    streamId: message.stream_id,
    correlationId,
  });
}
