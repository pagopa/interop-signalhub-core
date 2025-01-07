import { decodeOutboundDelegationEvent } from "@pagopa/interop-outbound-models";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { kafkaMissingMessageValue } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";

import { config } from "./config/env.js";
import { handleMessageV2 } from "./handlers/index.js";
import { serviceBuilder } from "./services/index.js";
import { buildLoggerInstance } from "./utils/index.js";

const { delegationService } = serviceBuilder();

const serviceName = "delegation-event-consumer";

export async function processMessage({
  message,
  partition
}: EachMessagePayload): Promise<void> {
  if (!message.value) {
    throw kafkaMissingMessageValue(config.kafkaTopic);
  }

  const delegationEvent = decodeOutboundDelegationEvent(
    message.value.toString()
  );

  const logger = buildLoggerInstance(serviceName, delegationEvent);
  await match(delegationEvent)
    .with({ event_version: 2 }, (event) =>
      handleMessageV2(event, delegationService, logger)
    )
    .exhaustive();

  logger.info(
    `Message was processed. Partition number: [${partition}] Offset: [${message.offset}]`
  );
}

await runConsumer(config, [config.kafkaTopic], processMessage);
