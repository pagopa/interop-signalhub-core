import { decodeOutboundPurposeEvent } from "@pagopa/interop-outbound-models";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { kafkaMissingMessageValue } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";

import { config } from "./config/env.js";
import { handleMessageV1, handleMessageV2 } from "./handlers/index.js";
import { serviceBuilder } from "./services/service.builder.js";
import { buildLoggerInstance } from "./utils/index.js";

const serviceName = "purpose-event-consumer";
const { purposeService } = serviceBuilder();

export async function processMessage({
  message,
  partition
}: EachMessagePayload): Promise<void> {
  if (!message.value) {
    throw kafkaMissingMessageValue(config.kafkaTopic);
  }

  const purposeEvent = decodeOutboundPurposeEvent(message.value.toString());

  const logger = buildLoggerInstance(serviceName, purposeEvent);
  await match(purposeEvent)
    .with({ event_version: 1 }, (event) =>
      handleMessageV1(event, purposeService, logger)
    )
    .with({ event_version: 2 }, (event) =>
      handleMessageV2(event, purposeService, logger)
    )
    .exhaustive();

  logger.info(
    `Message was processed. Partition number: [${partition}] Offset: [${message.offset}]`
  );
}

await runConsumer(config, [config.kafkaTopic], processMessage);
