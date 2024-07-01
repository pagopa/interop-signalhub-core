import { beforeAll, describe, expect, it, vi } from "vitest";
import { task } from "../utils";
import { config } from "../../src/config/env";
import {
  getConsumerEserviceTableRows,
  getEserviceTableRows,
  getEventIdFromTracingBatch,
} from "./database.utils";

describe("Updater service", () => {
  beforeAll(async () => {
    vi.spyOn(process, "exit").mockImplementation(
      (value: string | number | null | undefined) => value as never
    );
  });

  describe("Running task with APPLICATION_TYPE = ESERVICE", () => {
    beforeAll(async () => {
      // eslint-disable-next-line functional/immutable-data
      config.applicationType = "ESERVICE";
      await task.executeTask();
    });

    it("Should get 3 rows from eservice table", async () => {
      const eServiceList = await getEserviceTableRows();

      // Mocked API (from mockserver) will get back 4 rows, one of them is just an "UPDATED" event, so we should have 3 rows
      expect(eServiceList.length).toBe(3);
      // From webhook.json eservices with state "SUSPENDED" should be Two, meanwhile should be one with state "PUBLISHED"
      expect(
        eServiceList.filter((it) => it.state === "SUSPENDED")
      ).toHaveLength(2);
      expect(
        eServiceList.filter((it) => it.state === "PUBLISHED")
      ).toHaveLength(1);
    });

    it("Should get 0 rows from consumer_service table", async () => {
      // From webhook.json consumer_eservice table should be an empty array because application TYPE in this case is "E_SERVICE"
      const consumerEserviceList = await getConsumerEserviceTableRows();
      expect(consumerEserviceList.length).toBe(0);
    });

    it("Should get lastEventId = 4 from tracing_batch table", async () => {
      // From webhook.json: events processed should be 4, so should get back  lastEventId = 4 from tracing_batch table
      const lastEventId = await getEventIdFromTracingBatch();
      expect(lastEventId).toBe("4");
    });
  });
});
