import { EServiceEventV1 } from "@pagopa/interop-outbound-models";
import { Logger } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";

export async function handleMessageV1(
  event: EServiceEventV1,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      {
        type: "EServiceAdded",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceUpdated",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceDescriptorAdded",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceDescriptorUpdated",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceDeleted",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceDocumentDeleted",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .otherwise(async () => {
      logger.debug(`Event type ${event.type} not relevant`);
    });
}
