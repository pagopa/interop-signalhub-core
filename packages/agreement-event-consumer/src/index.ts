/* eslint-disable no-console */
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { match } from "ts-pattern";
import { decodeOutboundAgreementEvent } from "@pagopa/interop-outbound-models";
import { kafkaMissingMessageValue } from "pagopa-signalhub-commons";
import { config } from "./config/env.js";
import { handleMessageV1, handleMessageV2 } from "./handlers/index.js";
import { serviceBuilder } from "./services/service.builder.js";
import { buildLoggerInstance } from "./utils/index.js";

const serviceName = "agreement-event-consumer";
const { agreementService } = serviceBuilder();

export async function processMessage({
  message,
  partition,
}: EachMessagePayload): Promise<void> {
  if (!message.value) {
    throw kafkaMissingMessageValue(config.kafkaTopic);
  }
  const agreementEvent = decodeOutboundAgreementEvent(message.value.toString());

  const logger = buildLoggerInstance(serviceName, agreementEvent);

  await match(agreementEvent)
    .with({ event_version: 1 }, (event) =>
      handleMessageV1(event, agreementService, logger)
    )
    .with({ event_version: 2 }, (event) =>
      handleMessageV2(event, agreementService, logger)
    )
    .exhaustive();

  logger.info(
    `Message was processed. Partition number: [${partition}] Offset: [$${message.offset}]`
  );
}

await runConsumer(config, [config.kafkaTopic], processMessage);
