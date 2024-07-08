import { Logger } from "signalhub-commons";
import { IDeadEventRepository } from "../repositories/index.js";
import { ApplicationType, config } from "../config/env.js";
import { toEserviceEvent } from "../models/domain/toEserviceEvent.js";
import { toAgreementEvent } from "../models/domain/toAgreementEvent.js";
import { Event } from "signalhub-interop-client";
import { toDeadEvent } from "../models/domain/toDeadEvent.js";
import { TracingBatchService } from "./tracingBatch.service.js";

export function deadServiceBuilder(
  deadEventRepository: IDeadEventRepository,
  tracingBatchService: TracingBatchService,
  logger: Logger
) {
  return {
    saveDeadEvent: async (event: Event, applicationType: ApplicationType) => {
      const deadEvent =
        applicationType === "AGREEMENT"
          ? toDeadEvent(toAgreementEvent(event), applicationType)
          : toDeadEvent(toEserviceEvent(event), applicationType);

      logger.info(`Saving dead event with id: ${event}`);

      const numberOfErrorsWithEqualEventId =
        await tracingBatchService.countBatchInErrorWithLastEventIdAndType(
          deadEvent.eventId - 1,
          applicationType
        );

      if (numberOfErrorsWithEqualEventId >= config.attemptEvent) {
        logger.error(
          `Event with id: ${event} has reached the maximum number of attempts: ${config.attemptEvent} `
        );
        await deadEventRepository.insertDeadEvent(deadEvent);
      }
    },
  };
}

export type DeadEventService = ReturnType<typeof deadServiceBuilder>;
