import {
  dataPreparation,
  dataPreparationCleanup
} from "pagopa-signalhub-commons-test";
import { afterAll, beforeAll } from "vitest";

import { config } from "../src/config/env.js";
import { postgresDB } from "./utils.js";

beforeAll(async () => {
  await dataPreparation(postgresDB, config.interopSchema);
});

afterAll(async () => {
  await dataPreparationCleanup(postgresDB, config.interopSchema);
});
