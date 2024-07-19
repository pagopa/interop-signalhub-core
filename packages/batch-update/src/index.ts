import { serviceBuilder } from "./services/service.builder.js";
import { updaterBuilder } from "./updater.js";

const {
  tracingBatchService,
  interopClientService,
  agreementService,
  producerService,
  deadEventService,
} = await serviceBuilder();

const task = await updaterBuilder(
  tracingBatchService,
  interopClientService,
  agreementService,
  producerService,
  deadEventService
);

await task.executeTask();
