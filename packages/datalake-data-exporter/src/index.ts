import { logger } from "pagopa-signalhub-commons";

import { serviceBuilder } from "./services/service.builder.js";

const loggerInstance = logger({
  serviceName: "datalake-data-exporter"
});

const { datalakeService, db } = serviceBuilder(loggerInstance);

try {
  loggerInstance.info("Datalake Data Exporter job started");
  await datalakeService.exportData();
  loggerInstance.info("Done!");
} finally {
  await db.$pool.end();
}
