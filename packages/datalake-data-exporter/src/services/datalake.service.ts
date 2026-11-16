import { DB, FileManager, Logger } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { toExportedSignal } from "../models/domain/toExportedSignal.js";
import { signalRepository } from "../repositories/signal.repository.js";
import {
  arrayToNdjson,
  getDataCountBucketKey,
  getNdjsonBucketKey,
  splitArrayIntoChunks
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
      logger.info("DatalakeService::exportData fetching signals");
      const signals = (await signalRepository(db).getAll()).map(
        toExportedSignal
      );

      const exportTimestamp = new Date();
      const ndjsonFiles = splitArrayIntoChunks(
        signals.map((signal) => ({ ...signal, exportTimestamp })),
        1000
      ).map(arrayToNdjson);

      logger.info(
        `DatalakeService::exportData uploading ${signals.length} signals to ${config.dataLakeStorageBucket} bucket`
      );
      await fileManager.storeBytesByKey(
        config.dataLakeStorageBucket,
        getDataCountBucketKey(exportTimestamp),
        Buffer.from(JSON.stringify({ count: signals.length, exportTimestamp })),
        logger
      );
      for (const ndjson of ndjsonFiles) {
        await fileManager.storeBytesByKey(
          config.dataLakeStorageBucket,
          getNdjsonBucketKey(exportTimestamp),
          Buffer.from(ndjson),
          logger
        );
      }
    }
  };
}
