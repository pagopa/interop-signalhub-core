import { DB, FileManager, Logger } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { toExportedSignal } from "../models/domain/toExportedSignal.js";
import { signalRepository } from "../repositories/signal.repository.js";
import {
  arrayToNdjson,
  getDataCountBucketKey,
  getNdjsonBucketKey
} from "../utils/helperUtils.js";

export type DatalakeService = ReturnType<typeof datalakeServiceBuilder>;
interface IDatalakeService {
  readonly exportData: () => Promise<void>;
}

export function datalakeServiceBuilder(
  db: DB,
  fileManager: FileManager,
  logger: Logger
): IDatalakeService {
  return {
    async exportData(): Promise<void> {
      logger.info(
        `DatalakeService::exportData uploading signals to ${config.dataLakeStorageBucket} bucket`
      );
      const exportTimestamp = new Date();
      let count = 0;

      await signalRepository(db).forEachChunk(100000, async (records) => {
        const signals = records.map((record) => ({
          ...toExportedSignal(record),
          exportTimestamp
        }));
        await fileManager.storeBytesByKey(
          config.dataLakeStorageBucket,
          getNdjsonBucketKey(exportTimestamp),
          Buffer.from(arrayToNdjson(signals)),
          logger
        );
        count += signals.length;
      });

      logger.info(`DatalakeService::exportData uploaded ${count} signals`);
      await fileManager.storeBytesByKey(
        config.dataLakeStorageBucket,
        getDataCountBucketKey(exportTimestamp),
        Buffer.from(JSON.stringify({ count, exportTimestamp })),
        logger
      );
    }
  };
}
