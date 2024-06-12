import { getAccessToken } from "signalhub-interop-client";

import { logger } from "signalhub-commons";
import { TracingBatchService } from "./services/tracingBatch.service.js";
import { ApplicationType } from "./utils/index.js";
import { InteropClientService } from "./services/interopClient.service.js";

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

    console.log("events:", events);
  };

  // const updateEvents = async () => {};

  return {
    async executeTask() {
      loggerInstance.info(
        "Scheduler updater started at " + new Date().toString()
      );

      const lastEventId =
        await tracingBatchService.getLastEventIdByTracingBatchAndType(
          ApplicationType.Agreement
        );

      updateAgreementFromLastEventId(lastEventId);
    },
  };
};
