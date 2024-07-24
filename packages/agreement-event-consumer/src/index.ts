/* eslint-disable no-console */
import { logger } from "pagopa-signalhub-commons";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import {
  decodeOutboundAgreementEvent,
  AgreementAddedV2,
} from "pagopa-interop-outbound-models";
import { config } from "./config/env.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replacer(_key: string, value: { toString: () => any }): any {
  if (typeof value === "bigint") {
    return {
      __type: "bigint",
      __value: value.toString(),
    };
  } else {
    return value;
  }
}

export async function processMessage({
  message,
}: EachMessagePayload): Promise<void> {
  console.log("message:", message);

  const decodedMessage = decodeOutboundAgreementEvent(
    message.value!.toString()
  );

  console.log("decodedMessage", JSON.stringify(decodedMessage, replacer, 2));
  console.log("event version", decodedMessage.event_version);
  console.log("agreement data", decodedMessage.data);

  const consumerId = (decodedMessage.data as AgreementAddedV2).agreement!
    .consumerId;

  console.log("agreement consumerId", consumerId);
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
