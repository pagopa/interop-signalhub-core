import { logger } from "pagopa-signalhub-commons";
import { serviceBuilder } from "./services/service.builder.js";
import { cleanupBuilder } from "./cleanup.js";

const loggerInstance = logger({
  serviceName: "batch-cleanup",
});

const { signalService } = await serviceBuilder(loggerInstance);

const task = await cleanupBuilder(signalService, loggerInstance);

await task.executeTask();
