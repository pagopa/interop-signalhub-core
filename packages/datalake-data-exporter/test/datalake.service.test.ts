import { createSignal, writeSignal } from "pagopa-signalhub-commons-test";
import { afterEach, describe, expect, it, vi } from "vitest";

import { config } from "../src/config/env.js";
import { cleanup, datalakeService, fileManager, postgresDB } from "./utils.js";

const writeOrderedSignals = (howMany: number): Promise<null> =>
  postgresDB.none(
    `INSERT INTO ${config.signalHubSchema}.signal (correlation_id, signal_id, object_id, eservice_id, object_type, signal_type)
     SELECT 'correlation-id-test', g, 'object-id-test', 'eservice-id-test', 'object-type-test', 'CREATE' FROM generate_series(1, $1) g`,
    [howMany]
  );

const getNdjsonCalls = (): [string, Buffer][] =>
  vi
    .mocked(fileManager.storeBytesByKey)
    .mock.calls.filter(([, key]) => key.endsWith(".ndjson"))
    .map(([, key, fileContent]) => [key, fileContent]);

const getManifestKeys = (): string[] =>
  vi
    .mocked(fileManager.storeBytesByKey)
    .mock.calls.map(([, key]) => key)
    .filter((key) => key.endsWith("/_manifest.json"));

const uuidPattern =
  "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

describe("Datalake service", () => {
  afterEach(cleanup);

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should upload the manifest with the number of exported signals", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-02T03:04:05.000Z"));
    await writeSignal(createSignal(), postgresDB, config.signalHubSchema);
    await writeSignal(createSignal(), postgresDB, config.signalHubSchema);

    await datalakeService.exportData();

    expect(fileManager.storeBytesByKey).toHaveBeenCalledWith(
      config.dataLakeStorageBucket,
      expect.stringMatching(
        new RegExp(`^signal/dt=2026-01-02/run=${uuidPattern}/_manifest\\.json$`)
      ),
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

    const [ndjsonCall] = vi.mocked(fileManager.storeBytesByKey).mock.calls;
    expect(ndjsonCall[0]).toBe(config.dataLakeStorageBucket);
    expect(ndjsonCall[1]).toMatch(
      new RegExp(
        `^signal/dt=2026-01-02/run=${uuidPattern}/part-000001\\.ndjson$`
      )
    );
    expect(JSON.parse(ndjsonCall[2].toString())).toEqual({
      signalId: 1,
      eserviceId: "eservice-id-test",
      signalType: "CREATE",
      tmstInsert: tmstInsert.toISOString(),
      exportTimestamp: "2026-01-02T03:04:05.000Z"
    });
  });

  it("should upload 100001 signals in two numbered ndjson files in the run folder of the manifest", async () => {
    await writeOrderedSignals(100001);

    await datalakeService.exportData();

    const [manifestKey] = getManifestKeys();
    const runFolder = manifestKey.replace("_manifest.json", "");
    const ndjsonKeys = getNdjsonCalls().map(([key]) => key);
    expect(ndjsonKeys).toEqual([
      `${runFolder}part-000001.ndjson`,
      `${runFolder}part-000002.ndjson`
    ]);
  });

  it("should use a different run folder for each export", async () => {
    await datalakeService.exportData();
    await datalakeService.exportData();

    const manifestKeys = getManifestKeys();
    expect(manifestKeys).toHaveLength(2);
    expect(manifestKeys[0]).not.toBe(manifestKeys[1]);
  });

  it("should upload each of 100001 signals exactly once", async () => {
    await writeOrderedSignals(100001);

    await datalakeService.exportData();

    const exportedSignalIds = getNdjsonCalls()
      .flatMap(([, fileContent]) => fileContent.toString().trim().split("\n"))
      .map((line) => JSON.parse(line).signalId)
      .sort((a, b) => a - b);
    expect(exportedSignalIds).toEqual(
      Array.from({ length: 100001 }, (_, i) => i + 1)
    );
  });

  it("should upload the manifest after the ndjson files", async () => {
    await writeOrderedSignals(100001);

    await datalakeService.exportData();

    const uploadedKeys = vi
      .mocked(fileManager.storeBytesByKey)
      .mock.calls.map(([, key]) => key);
    expect(uploadedKeys).toHaveLength(3);
    expect(uploadedKeys[2]).toMatch(/\/_manifest\.json$/);
  });

  it("should upload only the manifest if there are no signals", async () => {
    await datalakeService.exportData();

    expect(fileManager.storeBytesByKey).toHaveBeenCalledTimes(1);
  });
});
