import { Event } from "signalhub-interop-client";

import { logger } from "signalhub-commons";
import { TracingBatchService } from "./services/tracingBatch.service.js";
import { InteropClientService } from "./services/interopClient.service.js";
import { ApplicationType, config } from "./config/env.js";
import { ConsumerService } from "./services/consumer.service.js";
import { ProducerService } from "./services/producerService.service.js";
import { toAgreementEvent } from "./models/domain/toAgreementEvent.js";
import { toEserviceEvent } from "./models/domain/toEserviceEvent.js";
import { TracingBatchStateEnum } from "./models/domain/model.js";

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
  const updateAgrements = async (events: Event[]): Promise<void> => {
    await updateEvents(events, "AGREEMENT");
  };

  const updateAgreementsRecursive = async (lastId: number): Promise<void> => {
    try {
      const { events, lastEventId } =
        await interopClientService.getAgreementsEvents(lastId);

      await updateAgrements(events);

      if (lastEventId && lastEventId < 1580) {
        await updateAgreementsRecursive(lastEventId);
      }

      console.log("Chiudo esecuzione", lastId);

      await tracingBatchService.terminateTracingBatch(
        TracingBatchStateEnum.ENDED,
        lastId,
        config.applicationType
      );
    } catch (error) {
      await tracingBatchService.terminateTracingBatch(
        TracingBatchStateEnum.ENDED_WITH_ERROR,
        lastId,
        config.applicationType
      );
    }
  };

  const updateEvents = async (
    events: Event[],
    applicationType: ApplicationType
  ): Promise<void> => {
    try {
      for (const event of events) {
        if (applicationType === "AGREEMENT") {
          // Update Consumer

          loggerInstance.info("\n");
          const agreementEvent = toAgreementEvent(event);
          await consumerService.updateConsumer(agreementEvent);
        } else {
          const eServiceEvent = toEserviceEvent(event);
          await producerService.updateEservice(eServiceEvent);
        }
      }
    } catch (error) {
      loggerInstance.error(error);
    }
  };

  return {
    async executeTask(): Promise<void> {
      loggerInstance.info(
        "Scheduler updater started at " + new Date().toString()
      );

      // const lastEventId =
      //   await tracingBatchService.getLastEventIdByTracingBatchAndType(
      //     config.applicationType
      //   );

      await updateAgreementsRecursive(1501);
    },
  };
};
