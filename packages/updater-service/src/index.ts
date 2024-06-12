import { serviceBuilder } from "./services/service.builder.js";
import { updaterBuilder } from "./updater.js";

const { tracingBatchService } = serviceBuilder();

const task = await updaterBuilder(tracingBatchService);

task.executeTask();
