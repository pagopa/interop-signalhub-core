/* eslint-disable no-console */
import { correlationId } from "pagopa-signalhub-commons";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { match } from "ts-pattern";
import { decodeOutboundEServiceEvent } from "@pagopa/interop-outbound-models";
import { config } from "./config/env.js";
import { handleMessageV1, handleMessageV2 } from "./handlers/index.js";
import { buildLoggerInstance } from "./utils/index.js";

const serviceName = "eservice-event-consumer";
// const {} = serviceBuilder();

export async function processMessage({
  message,
  partition,
}: EachMessagePayload): Promise<void> {
  if (!message.value) {
    throw new Error("Invalid message: missing value");
  }
  const eserviceEvent = decodeOutboundEServiceEvent(message.value.toString());

  const logger = buildLoggerInstance(
    serviceName,
    eserviceEvent,
    correlationId()
  );
  logger.info(
    `Processing message event: ${eserviceEvent.stream_id}/${eserviceEvent.version}`
  );

  await match(eserviceEvent)
    .with(
      { event_version: 1 },
      (event) => handleMessageV1(event, logger)
      // handleMessageV1(event, agreementService, logger)
    )
    .with(
      { event_version: 2 },
      (_event) => handleMessageV2
      //handleMessageV2(event, agreementService, logger)
    )
    .exhaustive();

  logger.info(
    `Message was processed. Partition number: ${partition}. Offset: ${message.offset}`
  );
}

await runConsumer(config, [config.kafkaTopic], processMessage);
