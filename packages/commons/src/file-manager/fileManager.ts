import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";

import { FileManagerConfig } from "../config/fileManager.config.js";
import { genericInternalError } from "../errors/index.js";
import { Logger } from "../logging/index.js";

export type FileManager = {
  storeBytesByKey: (
    bucket: string,
    key: string,
    fileContent: Buffer,
    logger: Logger
  ) => Promise<string>;
};

export function initFileManager(config: FileManagerConfig): FileManager {
  const client = new S3Client({
    endpoint: config.s3CustomServer
      ? `${config.s3ServerHost}:${config.s3ServerPort}`
      : undefined,
    forcePathStyle: config.s3CustomServer
  });

  return {
    async storeBytesByKey(
      bucket: string,
      key: string,
      fileContent: Buffer,
      logger: Logger
    ): Promise<string> {
      logger.info(`Storing file ${key} in bucket ${bucket}`);
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: fileContent,
            ChecksumSHA256: crypto
              .createHash("sha256")
              .update(fileContent)
              .digest("base64")
          })
        );
        return key;
      } catch (error) {
        throw genericInternalError(
          `Error storing file ${key} in bucket ${bucket}: ${error}`
        );
      }
    }
  };
}
