import {
  getAccessToken,
  getAgreementsEventsFromId,
} from "signalhub-interop-client";

import { logger } from "signalhub-commons";
import { TracingBatchService } from "./services/tracingBatch.service.js";
import { ApplicationType } from "./utils/index.js";

const loggerInstance = logger({
  serviceName: "updater-service",
});

export const updaterBuilder = async (
  tracingBatchService: TracingBatchService
) => {
  const voucher = await getAccessToken();

  return {
    async executeTask() {
      loggerInstance.info(
        "Scheduler updater started at " + new Date().toString()
      );

      const lastEventId =
        await tracingBatchService.getLastEventIdByTracingBatchAndType(
          ApplicationType.Agreement
        );

      const response = await getAgreementsEventsFromId(voucher, lastEventId);
      console.log("response events", response);
    },
  };
};
