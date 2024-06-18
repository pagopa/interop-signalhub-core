import { serviceBuilder } from "./services/service.builder.js";
import { updaterBuilder } from "./updater.js";

const {
  tracingBatchService,
  interopClientService,
  consumerService,
  producerService,
} = await serviceBuilder();

const task = await updaterBuilder(
  tracingBatchService,
  interopClientService,
  consumerService,
  producerService
);

await task.executeTask();
