import { Logger } from "signalhub-commons";
import { IDeadEventRepository } from "../repositories/index.js";
import { ApplicationType } from "../config/env.js";
import { toEserviceEvent } from "../models/domain/toEserviceEvent.js";
import { toAgreementEvent } from "../models/domain/toAgreementEvent.js";
import { Event } from "signalhub-interop-client";
import { toDeadEvent } from "../models/domain/toDeadEvent.js";

export function deadServiceBuilder(
  deadEventRepository: IDeadEventRepository,
  logger: Logger
) {
  return {
    saveDeadEvent: async (event: Event, applicationType: ApplicationType) => {
      const deadEvent =
        applicationType === "AGREEMENT"
          ? toDeadEvent(toAgreementEvent(event), applicationType)
          : toDeadEvent(toEserviceEvent(event), applicationType);

      logger.info(`Saving dead event with id: ${event}`);

      await deadEventRepository.insertDeadEvent(deadEvent);
    },
  };
}

export type DeadEventService = ReturnType<typeof deadServiceBuilder>;
