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
import {
  EmptyQueueEventsError,
  QueueEventsGenericError,
} from "./models/domain/errors.js";

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
  const updateAgrements = async (events: Event[]): Promise<number> =>
    await updateEvents(events, "AGREEMENT");

  const updateAgreementsRecursive = async (lastId: number): Promise<void> => {
    // eslint-disable-next-line functional/no-let
    let lastEventIdUpdated = lastId;
    try {
      const { events, lastEventIdResponse } =
        await interopClientService.getAgreementsEvents(lastEventIdUpdated);

      lastEventIdUpdated = await updateAgrements(events);

      if (lastEventIdResponse) {
        await updateAgreementsRecursive(lastEventIdResponse);
      }
    } catch (error) {
      if (error instanceof EmptyQueueEventsError) {
        await tracingBatchService.terminateTracingBatch(
          TracingBatchStateEnum.ENDED,
          lastEventIdUpdated,
          config.applicationType
        );
      }

      if (error instanceof QueueEventsGenericError) {
        await tracingBatchService.terminateTracingBatch(
          TracingBatchStateEnum.ENDED_WITH_ERROR,
          lastEventIdUpdated,
          config.applicationType
        );
      }
    }
  };

  const updateEvents = async (
    events: Event[],
    applicationType: ApplicationType
  ): Promise<number> => {
    try {
      // eslint-disable-next-line functional/no-let
      let lastEventId;
      for (const event of events) {
        if (applicationType === "AGREEMENT") {
          // Update Consumer

          loggerInstance.info("\n");
          const agreementEvent = toAgreementEvent(event);
          lastEventId = await consumerService.updateConsumer(agreementEvent);
        } else {
          const eServiceEvent = toEserviceEvent(event);
          await producerService.updateEservice(eServiceEvent);
          lastEventId = -1; // TODO: WIP
        }
      }

      return lastEventId as number;
    } catch (error) {
      loggerInstance.error(error);
      throw error;
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

      await updateAgreementsRecursive(lastEventId);
    },
  };
};
