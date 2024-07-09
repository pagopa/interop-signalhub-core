import { Logger } from "signalhub-commons";
import { Event } from "signalhub-interop-client";
import { IDeadEventRepository } from "../repositories/index.js";
import { ApplicationType, config } from "../config/env.js";
import { toEserviceEvent } from "../models/domain/toEserviceEvent.js";
import { toAgreementEvent } from "../models/domain/toAgreementEvent.js";
import { toDeadEvent } from "../models/domain/toDeadEvent.js";
import { TracingBatchService } from "./tracingBatch.service.js";

interface IDeadEventService {
  // eslint-disable-next-line functional/no-method-signature
  saveDeadEvent(
    event: Event,
    applicationType: ApplicationType,
    errorReason: string
  ): Promise<void>;
}
export function deadServiceBuilder(
  deadEventRepository: IDeadEventRepository,
  tracingBatchService: TracingBatchService,
  logger: Logger
): IDeadEventService {
  return {
    saveDeadEvent: async (
      event: Event,
      applicationType: ApplicationType,
      errorReason: string
    ): Promise<void> => {
      const deadEvent =
        applicationType === "AGREEMENT"
          ? toDeadEvent(toAgreementEvent(event), applicationType, errorReason)
          : toDeadEvent(toEserviceEvent(event), applicationType, errorReason);

      logger.info(`Saving dead event with id: ${deadEvent}`);

      const numberOfErrorsWithEqualEventId =
        await tracingBatchService.countBatchInErrorWithLastEventIdAndType(
          deadEvent.eventId - 1, // Put "-1" because TRACING_BATCH save lastEventId not processed
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
