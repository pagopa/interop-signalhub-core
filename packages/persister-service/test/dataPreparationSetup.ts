import {
  dataPreparation,
  dataPreparationCleanup,
} from "signalhub-commons-test";
import { postgresDB } from "./utils";
import { afterAll, beforeAll } from "vitest";

beforeAll(() => {
  dataPreparation(postgresDB);
});

afterAll(() => {
  dataPreparationCleanup(postgresDB);
});
