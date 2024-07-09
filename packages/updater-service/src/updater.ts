import { Event, Events } from "signalhub-interop-client";

import { logger } from "signalhub-commons";
import { TracingBatchService } from "./services/tracingBatch.service.js";
import { InteropClientService } from "./services/interopClient.service.js";
import { ApplicationType, config } from "./config/env.js";
import { ConsumerService } from "./services/consumer.service.js";
import { ProducerService } from "./services/producerService.service.js";
import { toAgreementEvent } from "./models/domain/toAgreementEvent.js";
import { toEserviceEvent } from "./models/domain/toEserviceEvent.js";
import { TracingBatchStateEnum } from "./models/domain/model.js";
import { EmptyQueueEventsError } from "./models/domain/errors.js";
import { getCurrentDate } from "./utils.js";
import { DeadEventService } from "./services/deadEvent.service.js";

const loggerInstance = logger({
  serviceName: "updater-service",
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const updaterBuilder = async (
  tracingBatchService: TracingBatchService,
  interopClientService: InteropClientService,
  consumerService: ConsumerService,
  producerService: ProducerService,
  deadEventService: DeadEventService
) => {
  const getEvents = async (
    applicationType: ApplicationType,
    lastEventId: number
  ): Promise<Events> =>
    applicationType === "AGREEMENT"
      ? await interopClientService.getAgreementsEvents(lastEventId)
      : await interopClientService.getEservicesEvents(lastEventId);

  const recursiveUpdate = async (lastEventId: number): Promise<void> => {
    // eslint-disable-next-line functional/no-let
    let lastEventIdUpdated = lastEventId;
    try {
      const { events, lastEventId: lastEventIdResponse } = await getEvents(
        config.applicationType,
        lastEventIdUpdated
      );

      lastEventIdUpdated = await updateEvents(events, config.applicationType);

      if (lastEventIdResponse) {
        await recursiveUpdate(lastEventIdResponse);
      }
    } catch (error) {
      if (error instanceof EmptyQueueEventsError) {
        loggerInstance.info(
          `There aren't events to process: lastEventId: ${lastEventIdUpdated}`
        );

        await tracingBatchService.terminateTracingBatch(
          TracingBatchStateEnum.ENDED,
          lastEventIdUpdated,
          config.applicationType
        );
      } else {
        loggerInstance.error(
          `UpdaterServiceError: lastEventId: ${lastEventIdUpdated} - ${error}`
        );

        await tracingBatchService.terminateTracingBatch(
          TracingBatchStateEnum.ENDED_WITH_ERROR,
          lastEventIdUpdated,
          config.applicationType
        );
      }

      loggerInstance.info(
        `Scheduler updater with applicationType: ${
          config.applicationType
        }  completed at: ${getCurrentDate()}`
      );
      process.exit(0);
    }
  };

  const updateEvents = async (
    events: Event[],
    applicationType: ApplicationType
  ): Promise<number> => {
    // eslint-disable-next-line functional/no-let
    let lastEventId = 0;
    for (const event of events) {
      try {
        if (applicationType === "AGREEMENT") {
          lastEventId = await updateAgreementEvent(event);
          loggerInstance.info(
            `\n ---- Event with eventId: ${event.eventId} ---- \n`
          );
        } else {
          lastEventId = await updateEserviceEvent(event, lastEventId);
        }
      } catch (error) {
        loggerInstance.error(
          `Error processing event with eventId: ${event.eventId} - ${error}`
        );

        const err = error as Error;

        await deadEventService.saveDeadEvent(
          event,
          config.applicationType,
          err.message
        );
        throw error;
      }
    }
    return lastEventId;
  };

  const updateAgreementEvent = async (event: Event): Promise<number> => {
    const agreementEvent = toAgreementEvent(event);
    return await consumerService.updateConsumer(agreementEvent);
  };

  const updateEserviceEvent = async (
    event: Event,
    lastEventId: number
  ): Promise<number> => {
    const eServiceEvent = toEserviceEvent(event);
    const eService = await producerService.updateEservice(eServiceEvent);

    if (eService) {
      return eService.eventId;
    }

    return lastEventId;
  };

  return {
    async executeTask(): Promise<void> {
      loggerInstance.info(
        `Scheduler updater with applicationType: ${
          config.applicationType
        }  started at: ${getCurrentDate()}`
      );

      const lastEventId =
        await tracingBatchService.getLastEventIdByTracingBatchAndType(
          config.applicationType
        );

      await recursiveUpdate(lastEventId);
    },
  };
};
