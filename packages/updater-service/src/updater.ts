import {
  getAccessToken,
  getAgreementsEventsFromId,
} from "signalhub-interop-client";

import { logger } from "signalhub-commons";

const loggerInstance = logger({
  serviceName: "updater-service",
});

export const updaterBuilder = async () => {
  const voucher = await getAccessToken();

  return {
    async executeTask() {
      loggerInstance.info(
        "Scheduler updater started at " + new Date().toString()
      );

      const lasEventId = 1;
      const response = await getAgreementsEventsFromId(voucher, lasEventId);
      console.log("response events", response);
    },
  };
};
