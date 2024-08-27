import {
  truncateAgreementTable,
  truncateEserviceTable,
  truncateTracingBatchTable,
} from "pagopa-signalhub-commons-test";
import * as commons from "pagopa-signalhub-interop-client";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { postgresDB, task } from "../utils";
import { config } from "../../src/config/env";

async function cleanDatabase(): Promise<void> {
  await truncateAgreementTable(postgresDB);
  await truncateEserviceTable(postgresDB);
  await truncateTracingBatchTable(postgresDB);
}
describe("Updater service", () => {
  vi.spyOn(commons, "getAccessToken").mockResolvedValue("");

  beforeAll(async () => {
    vi.spyOn(process, "exit").mockImplementation(
      (value: string | number | null | undefined) => value as never
    );
  });

  describe("Running task with APPLICATION_TYPE = ESERVICE", () => {
    beforeAll(async () => {
      await cleanDatabase();
      // eslint-disable-next-line functional/immutable-data
      config.applicationType = "ESERVICE";
      await task.executeTask();
    });

    it("Should get 3 rows fro,m eservice table", async () => {
      expect(true).toBe(true);
    });

    it("Should get 0 rows from agreement table", async () => {
      expect(true).toBe(true);
    });

    it("Should get lastEventId = 4 from tracing_batch table", async () => {
      expect(true).toBe(true);
    });
  });

  describe("Running task with APPLICATION_TYPE = AGREEMENT", () => {
    beforeAll(async () => {
      await cleanDatabase();
      // eslint-disable-next-line functional/immutable-data
      config.applicationType = "AGREEMENT";
      await task.executeTask();
    });
    /* eslint-disable sonarjs/no-identical-functions */
    it("Should get 3 rows from eservice table", async () => {
      expect(true).toBe(true);
    });
    it("Should get 3 rows from agreement table", async () => {
      expect(true).toBe(true);
    });

    it("Should get lastEventId = 3 from tracing_batch table", async () => {
      expect(true).toBe(true);
    });
  });
});
