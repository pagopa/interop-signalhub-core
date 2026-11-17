import {
  createMultipleOrderedSignals,
  createSignal,
  writeSignal,
  writeSignals
} from "pagopa-signalhub-commons-test";
import { afterEach, describe, expect, it, vi } from "vitest";

import { config } from "../src/config/env.js";
import { cleanup, datalakeService, fileManager, postgresDB } from "./utils.js";

const getNdjsonCalls = (): [string, Buffer][] =>
  vi
    .mocked(fileManager.storeBytesByKey)
    .mock.calls.filter(([, key]) => key.startsWith("data/"))
    .map(([, key, fileContent]) => [key, fileContent]);

describe("Datalake service", () => {
  afterEach(cleanup);

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should upload the count file with the number of exported signals", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-02T03:04:05.000Z"));
    await writeSignal(createSignal(), postgresDB, config.signalHubSchema);
    await writeSignal(createSignal(), postgresDB, config.signalHubSchema);

    await datalakeService.exportData();

    expect(fileManager.storeBytesByKey).toHaveBeenCalledWith(
      config.dataLakeStorageBucket,
      "count/signal/20260102/20260102_030405.json",
      Buffer.from(
        JSON.stringify({
          count: 2,
          exportTimestamp: new Date("2026-01-02T03:04:05.000Z")
        })
      ),
      expect.anything()
    );
  });

  it("should upload the signals as ndjson with only the exported fields", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-02T03:04:05.000Z"));
    const id = await writeSignal(
      createSignal({
        signalId: 1,
        eserviceId: "eservice-id-test",
        signalType: "CREATE",
        objectId: "object-id-test",
        objectType: "object-type-test",
        correlationId: "correlation-id-test"
      }),
      postgresDB,
      config.signalHubSchema
    );
    const tmstInsert: Date = await postgresDB.one(
      `SELECT tmst_insert FROM ${config.signalHubSchema}.signal WHERE id = $1`,
      [id],
      (record) => record.tmst_insert
    );

    await datalakeService.exportData();

    const [, ndjsonCall] = vi.mocked(fileManager.storeBytesByKey).mock.calls;
    expect(ndjsonCall[0]).toBe(config.dataLakeStorageBucket);
    expect(ndjsonCall[1]).toMatch(
      /^data\/signal\/20260102\/20260102_030405_[0-9a-f-]{36}\.ndjson$/
    );
    expect(JSON.parse(ndjsonCall[2].toString())).toEqual({
      signalId: 1,
      eserviceId: "eservice-id-test",
      signalType: "CREATE",
      tmstInsert: tmstInsert.toISOString(),
      exportTimestamp: "2026-01-02T03:04:05.000Z"
    });
  });

  it("should upload 1001 signals in two ndjson files with different keys", async () => {
    await writeSignals(
      createMultipleOrderedSignals(1001),
      postgresDB,
      config.signalHubSchema
    );

    await datalakeService.exportData();

    const ndjsonKeys = getNdjsonCalls().map(([key]) => key);
    expect(ndjsonKeys).toHaveLength(2);
    expect(new Set(ndjsonKeys).size).toBe(2);
  });

  it("should upload each of 1001 signals exactly once", async () => {
    await writeSignals(
      createMultipleOrderedSignals(1001),
      postgresDB,
      config.signalHubSchema
    );

    await datalakeService.exportData();

    const exportedSignalIds = getNdjsonCalls()
      .flatMap(([, fileContent]) => fileContent.toString().trim().split("\n"))
      .map((line) => JSON.parse(line).signalId)
      .sort((a, b) => a - b);
    expect(exportedSignalIds).toEqual(
      Array.from({ length: 1001 }, (_, i) => i + 1)
    );
  });

  it("should upload only the count file if there are no signals", async () => {
    await datalakeService.exportData();

    expect(fileManager.storeBytesByKey).toHaveBeenCalledTimes(1);
  });
});
