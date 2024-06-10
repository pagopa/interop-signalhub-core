import {
  dataPreparation,
  dataPreparationCleanup,
  deleteAllSqsMessages,
} from "signalhub-commons-test";
import { postgresDB, sqsClient } from "./utils";
import { afterAll, beforeAll } from "vitest";
import { config } from "../src/config/env";

beforeAll(() => {
  dataPreparation(postgresDB);
  deleteAllSqsMessages(sqsClient, config.queueUrl);
});

afterAll(() => {
  dataPreparationCleanup(postgresDB);
});
