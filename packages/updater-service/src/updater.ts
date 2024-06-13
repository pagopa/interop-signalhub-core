import { Event } from "signalhub-interop-client";

import { logger } from "signalhub-commons";
import { TracingBatchService } from "./services/tracingBatch.service.js";
import { InteropClientService } from "./services/interopClient.service.js";
import { ApplicationType, config } from "./config/env.js";
import { ConsumerService } from "./services/consumer.service.js";
import { AgreementDto } from "./models/domain/model.js";

const loggerInstance = logger({
  serviceName: "updater-service",
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const updaterBuilder = async (
  tracingBatchService: TracingBatchService,
  interopClientService: InteropClientService,
  consumerService: ConsumerService
) => {
  const updateAgreementFromLastEventId = async (
    lastEventId: number
  ): Promise<void> => {
    const events = await interopClientService.getAgreementsEvents(lastEventId);

    await updateEvents(events, config.applicationType);
  };

  const updateEvents = async (
    events: Event[],
    applicationType: ApplicationType
  ): Promise<void> => {
    for (const event of events) {
      if (applicationType === "AGREEMENT") {
        // Update Consumer
        await consumerService.updateConsumer(event as AgreementDto);
      } else {
        // TODO
      }
    }
  };

  return {
    async executeTask(): Promise<void> {
      loggerInstance.info(
        "Scheduler updater started at " + new Date().toString()
      );

      const lastEventId =
        await tracingBatchService.getLastEventIdByTracingBatchAndType(
          "AGREEMENT"
        );

      await updateAgreementFromLastEventId(lastEventId);
    },
  };
};
