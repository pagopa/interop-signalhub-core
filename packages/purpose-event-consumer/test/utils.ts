import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { inject } from "vitest";
import { purposeRepository } from "../src/repositories/purpose.repository.js";
import { purposeServiceBuilder } from "../src/services/purpose.service.js";
export const { postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const purposeService = purposeServiceBuilder(
  purposeRepository(postgresDB)
);
