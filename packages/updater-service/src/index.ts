import { serviceBuilder } from "./services/service.builder.js";
import { updaterBuilder } from "./updater.js";

const { tracingBatchService, interopClientService } = serviceBuilder();

const task = await updaterBuilder(tracingBatchService, interopClientService);

task.executeTask();
