import { serviceBuilder } from "./services/service.builder.js";
import { updaterBuilder } from "./updater.js";

const { tracingBatchService, interopClientService, consumerService } =
  await serviceBuilder();

const task = await updaterBuilder(
  tracingBatchService,
  interopClientService,
  consumerService
);

await task.executeTask();
