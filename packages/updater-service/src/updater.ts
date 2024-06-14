import { Event } from "signalhub-interop-client";

import { logger } from "signalhub-commons";
import { TracingBatchService } from "./services/tracingBatch.service.js";
import { InteropClientService } from "./services/interopClient.service.js";
import { ApplicationType, config } from "./config/env.js";
import { ConsumerService } from "./services/consumer.service.js";
import { ProducerService } from "./services/producerService.service.js";
import { toAgreementEvent } from "./models/domain/toAgreementEvent.js";
import { toEserviceEvent } from "./models/domain/toEserviceEvent.js";

const loggerInstance = logger({
  serviceName: "updater-service",
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const updaterBuilder = async (
  tracingBatchService: TracingBatchService,
  interopClientService: InteropClientService,
  consumerService: ConsumerService,
  producerService: ProducerService
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
      try {
        if (applicationType === "AGREEMENT") {
          // Update Consumer

          const agreementEvent = toAgreementEvent(event);
          await consumerService.updateConsumer(agreementEvent);
        } else {
          const eServiceEvent = toEserviceEvent(event);
          await producerService.updateEservice(eServiceEvent);
        }
      } catch (error) {
        console.error(error);
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
          config.applicationType
        );

      await updateAgreementFromLastEventId(lastEventId);
    },
  };
};
