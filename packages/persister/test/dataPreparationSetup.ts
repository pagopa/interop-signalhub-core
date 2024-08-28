import { afterAll, beforeAll } from "vitest";
import {
  dataPreparation,
  dataPreparationCleanup,
} from "pagopa-signalhub-commons-test";
import { postgresDB } from "./utils.js";
import { config } from "../src/config/env.js";

beforeAll(async () => {
  await dataPreparation(postgresDB, config.signalhubStoreDbNameNamespace);
});

afterAll(async () => {
  await dataPreparationCleanup(postgresDB);
});
