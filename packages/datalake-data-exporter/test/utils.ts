import { FileManager, genericLogger } from "pagopa-signalhub-commons";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { inject, vi } from "vitest";

import { datalakeServiceBuilder } from "../src/services/datalake.service.js";

export const { cleanup, postgresDB } = await setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const fileManager: FileManager = {
  storeBytesByKey: vi.fn(async (_bucket: string, key: string) => key)
};

export const datalakeService = datalakeServiceBuilder(
  postgresDB,
  fileManager,
  genericLogger
);
