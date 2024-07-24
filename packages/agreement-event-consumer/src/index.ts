import { logger } from "pagopa-signalhub-commons";
import { runConsumer } from "kafka-connector";
import { EachMessagePayload } from "kafkajs";
import { config } from "./config/env.js";
import {
  AgreementEvent,
  agreementEventToBinaryData,
} from "@pagopa/interop-outbound-models";

const generateMessage = (message: any): any => {
  return Buffer.from(agreementEventToBinaryData(message));
};

const agreementEvent: AgreementEvent = {
  event_version: 2,
  type: "AgreementAdded",
  data: generateMessage({
    event_version: 2,
    type: "AgreementAdded",
    data: {
      agreement: {
        id: "1234",
        certifiedAttributes: [],
        consumerDocuments: [],
        consumerId: "",
        createdAt: 1n,
        declaredAttributes: [],
        descriptorId: "",
        eserviceId: "",
        producerId: "",
        verifiedAttributes: [],
        consumerNotes: "",
        contract: {
          contentType: "application/json",
          createdAt: 1n,
          id: "",
          name: "",
          prettyName: "",
        },
        rejectionReason: "",
        state: 1,
      },
    },
  }),
};

export async function processMessage({
  message,
}: EachMessagePayload): Promise<void> {
  console.log("message:", message);
  const result = AgreementEvent.safeParse(agreementEvent);

  if (!result.success) {
    console.log("Error parsing message", result.error);
  }

  console.log("result:", result.data);

  const loggerInstance = logger({
    serviceName: "agreement-event-consumer",
    eventType: "",
    eventVersion: 1,
    streamId: "",
    correlationId: "",
  });

  loggerInstance.info("Processing message");
}

await runConsumer(config, ["test"], processMessage);
