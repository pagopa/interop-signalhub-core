import { decodeOutboundEServiceEvent } from "@pagopa/interop-outbound-models";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { kafkaMissingMessageValue } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";

import { config } from "./config/env.js";
import { handleMessageV1, handleMessageV2 } from "./handlers/index.js";
import { serviceBuilder } from "./services/serviceBuilder.js";
import { buildLoggerInstance } from "./utils/index.js";

const serviceName = "eservice-event-consumer";
const { eServiceService } = serviceBuilder();

export async function processMessage({
  message,
  partition
}: EachMessagePayload): Promise<void> {
  if (!message.value) {
    throw kafkaMissingMessageValue(config.kafkaTopic);
  }
  const eserviceEvent = decodeOutboundEServiceEvent(message.value.toString());

  const logger = buildLoggerInstance(serviceName, eserviceEvent);
  await match(eserviceEvent)
    .with({ event_version: 1 }, (event) =>
      handleMessageV1(event, eServiceService, logger)
    )
    .with({ event_version: 2 }, (event) =>
      handleMessageV2(event, eServiceService, logger)
    )
    .exhaustive();

  logger.info(
    `Message was processed. Partition number: ${partition}. Offset: ${message.offset}`
  );
}

await runConsumer(config, [config.kafkaTopic], processMessage);
