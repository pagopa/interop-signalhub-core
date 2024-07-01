import { beforeAll, describe, expect, it, vi } from "vitest";
import { task } from "../utils";
import {
  getEserviceTableRows,
  getEventIdFromTracingBatch,
} from "./database.utils";

describe("Updater service", () => {
  beforeAll(async () => {
    vi.spyOn(process, "exit").mockImplementation(
      (value: string | number | null | undefined) => value as never
    );
  });

  it("WIP", async () => {
    await task.executeTask();

    const response = await getEserviceTableRows();

    // Mocked API (from mockserver) will get back 4 rows, one of them is just an "UPDATED" event, so we should have 3 rows
    expect(response.length).toBe(3);

    // From webhook.json eservices with state "SUSPENDED" should be Two, meanwhile should be one with state "PUBLISHED"
    expect(response.filter((it) => it.state === "SUSPENDED")).toHaveLength(2);
    expect(response.filter((it) => it.state === "PUBLISHED")).toHaveLength(1);

    // From webhook.json: events processed should be 4, so should get back  lastEventId = 4 from tracing_batch table
    const lastEventId = await getEventIdFromTracingBatch();
    expect(lastEventId).toBe("4");
  });
});
