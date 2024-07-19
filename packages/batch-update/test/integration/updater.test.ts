import {
  truncateAgreementTable,
  truncateEserviceTable,
  truncateTracingBatchTable,
} from "pagopa-signalhub-commons-test";
import * as commons from "pagopa-signalhub-interop-client";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { postgresDB, task } from "../utils";
import { config } from "../../src/config/env";
import {
  getAgreementTableRows,
  getEserviceTableRows,
  getEventIdFromTracingBatch,
} from "./database.utils";

/**
 * This test suite has as goal to put togheter each components of the system and test the integration between them.
 * Data will retrieved from mockserver instance container (which response is based on webhook.json file that you can find on
 * on /docker folder) .In order to running this test has been created several utilities that allow to interact with the database
 */

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

    it("Should get 3 rows from eservice table", async () => {
      const eServiceList = await getEserviceTableRows();

      // Mocked API (from mockserver) will get back 4 rows, one of them is just an "UPDATED" event, so we should have 3 rows on eservice table
      expect(eServiceList.length).toBe(3);
      // From webhook.json eservices with state "SUSPENDED" should be equal to 2, meanwhile should be one with state "PUBLISHED"
      expect(
        eServiceList.filter((it) => it.state === "SUSPENDED")
      ).toHaveLength(2);
      expect(
        eServiceList.filter((it) => it.state === "PUBLISHED")
      ).toHaveLength(1);
    });

    it("Should get 0 rows from agreement table", async () => {
      // From webhook.json: agreement table should be an empty array because application TYPE in this case is "ESERVICE"
      const agreementList = await getAgreementTableRows();
      expect(agreementList.length).toBe(0);
    });

    it("Should get lastEventId = 4 from tracing_batch table", async () => {
      // From webhook.json: events processed should be 4, so should get back lastEventId = 4 from tracing_batch table
      const lastEventId = await getEventIdFromTracingBatch();
      expect(lastEventId).toBe("4");
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
      const eServiceList = await getEserviceTableRows();

      // Mocked API (from mockserver) will get back 3 rows, one of them is just an "UPDATED" event, so we should have 3 rows on eservice table
      expect(eServiceList.length).toBe(3);
      // From webhook.json eservices with state "SUSPENDED" should be equal to 2, meanwhile should be one with state "PUBLISHED"
      expect(
        eServiceList.filter((it) => it.state === "SUSPENDED")
      ).toHaveLength(2);
      expect(
        eServiceList.filter((it) => it.state === "PUBLISHED")
      ).toHaveLength(1);
    });
    it("Should get 3 rows from agreement table", async () => {
      // From webhook.json agreement table should be an arra with 3 elements"
      const agreementList = await getAgreementTableRows();
      expect(agreementList.length).toBe(3);
    });

    it("Should get lastEventId = 3 from tracing_batch table", async () => {
      // From webhook.json: events processed should be 3, so should get back  lastEventId = 3 from tracing_batch table
      const lastEventId = await getEventIdFromTracingBatch();
      expect(lastEventId).toBe("3");
    });
  });
});
