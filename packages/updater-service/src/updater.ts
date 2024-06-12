import { Event, getAccessToken } from "signalhub-interop-client";

import { logger } from "signalhub-commons";
import { TracingBatchService } from "./services/tracingBatch.service.js";
import { InteropClientService } from "./services/interopClient.service.js";
import { ApplicationType, config } from "./config/env.js";

const loggerInstance = logger({
  serviceName: "updater-service",
});

export const updaterBuilder = async (
  tracingBatchService: TracingBatchService,
  interopClientService: InteropClientService
) => {
  const voucher = await getAccessToken();

  const updateAgreementFromLastEventId = async (lastEventId: number) => {
    const events = await interopClientService.getAgreementsEvents(
      voucher,
      lastEventId
    );

    updateEvents(events, config.applicationType);
  };

  const updateEvents = async (
    events: Event[],
    applicationType: ApplicationType
  ) => {
    for (const event of events) {
      console.log("Event:", event);
      if (applicationType === "AGREEMENT") {
        //Update Consumer
      } else {
        //TODO
      }
    }
  };

  return {
    async executeTask() {
      loggerInstance.info(
        "Scheduler updater started at " + new Date().toString()
      );

      const lastEventId =
        await tracingBatchService.getLastEventIdByTracingBatchAndType(
          "AGREEMENT"
        );

      updateAgreementFromLastEventId(lastEventId);
    },
  };
};
