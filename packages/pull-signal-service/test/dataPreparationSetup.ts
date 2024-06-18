import {
  dataPreparation,
  dataPreparationCleanup,
} from "signalhub-commons-test";
import { afterAll, beforeAll } from "vitest";
import { postgresDB } from "./utils.js";

beforeAll(async () => {
  await dataPreparation(postgresDB);
});

afterAll(async () => {
  await dataPreparationCleanup(postgresDB);
});
