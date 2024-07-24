import { logger } from "pagopa-signalhub-commons";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { config } from "./config/env.js";
import { decodeOutboundAgreementEvent } from "@pagopa/interop-outbound-models";

export async function processMessage({
  message,
}: EachMessagePayload): Promise<void> {
  console.log("message:", message);

  const decodedMessage = decodeOutboundAgreementEvent(
    message.value!.toString()
  );

  console.log("decodedMessage", decodedMessage);

  const loggerInstance = logger({
    serviceName: "agreement-event-consumer",
    eventType: "",
    eventVersion: 1,
    streamId: "",
    correlationId: "",
  });

  loggerInstance.info("Processing message");
}

await runConsumer(config, ["agreement"], processMessage);
