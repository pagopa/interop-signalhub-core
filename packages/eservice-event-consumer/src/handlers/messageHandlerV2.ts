import { EServiceEventV2 } from "@pagopa/interop-outbound-models";
import { Logger } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";

export async function handleMessageV2(
  event: EServiceEventV2,
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
        type: P.union(
          "EServiceDescriptorAdded",
          "EServiceDescriptorActivated",
          "EServiceDescriptorArchived",
          "EServiceDescriptorPublished",
          "EServiceDescriptorSuspended",
          "EServiceDraftDescriptorUpdated",
          "DraftEServiceUpdated",
          "EServiceDraftDescriptorDeleted" // ??
        ),
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceCloned", //?? ,
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

    .otherwise(async () => {
      logger.debug(`Event type ${event.type} not relevant`);
    });
}
