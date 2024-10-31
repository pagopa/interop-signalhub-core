import { logger } from "pagopa-signalhub-commons";

import { cleanupBuilder } from "./cleanup.js";
import { serviceBuilder } from "./services/service.builder.js";

const loggerInstance = logger({
  serviceName: "batch-cleanup"
});

const { signalService, tracingBatchCleanupService } =
  await serviceBuilder(loggerInstance);

const task = await cleanupBuilder(
  signalService,
  tracingBatchCleanupService,
  loggerInstance
);

await task.executeTask();
