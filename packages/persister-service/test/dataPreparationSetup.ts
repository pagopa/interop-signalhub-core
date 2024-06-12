import { afterAll, beforeAll } from "vitest";
import {
  dataPreparation,
  dataPreparationCleanup,
} from "signalhub-commons-test";
import { postgresDB } from "./utils.js";

beforeAll(async () => {
  await dataPreparation(postgresDB);
});

afterAll(async () => {
  await dataPreparationCleanup(postgresDB);
});
