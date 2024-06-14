import {
  dataPreparation,
  dataPreparationCleanup,
  deleteAllSqsMessages,
} from "signalhub-commons-test";
import { afterAll, beforeAll } from "vitest";
import { config } from "../src/config/env.js";
import { postgresDB, sqsClient } from "./utils.js";

beforeAll(async () => {
  await dataPreparation(postgresDB);
  void deleteAllSqsMessages(sqsClient, config.queueUrl);
});

afterAll(async () => {
  await dataPreparationCleanup(postgresDB);
});
