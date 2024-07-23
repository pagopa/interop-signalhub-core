import { logger } from "pagopa-signalhub-commons";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { config } from "./config/env.js";

console.log("HERE");

export async function processMessage({
  message,
}: EachMessagePayload): Promise<void> {
  //   const _handleMessageToSkip = async (): Promise<void> => {};
  console.log("message", message);
  const loggerInstance = logger({
    serviceName: "agreement-email-sender",
    eventType: "",
    eventVersion: 1,
    streamId: "",
    correlationId: "",
  });

  loggerInstance.info("Processing message");
}

await runConsumer(config, ["test"], processMessage);
