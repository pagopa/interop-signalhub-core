import { afterEach, inject } from "vitest";
import {
  setupTestContainersVitest,
  truncateTracingBatchTable,
} from "signalhub-commons-test";
import { tracingBatchServiceBuilder } from "../src/services/tracingBatch.service.js";

export const { cleanup, postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

afterEach(cleanup);
afterEach(() => truncateTracingBatchTable(postgresDB));

export const tracingBatchService = tracingBatchServiceBuilder(postgresDB);
