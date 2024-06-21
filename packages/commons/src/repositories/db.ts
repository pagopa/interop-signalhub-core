import { ConnectionString } from "connection-string";
import pgPromise, { IDatabase } from "pg-promise";
import {
  IClient,
  IConnectionParameters,
} from "pg-promise/typescript/pg-subset.js";
import { logger } from "../logging/index.js";

export type DB = IDatabase<unknown>;

export function createDbInstance({
  username,
  password,
  host,
  port,
  database,
  useSSL,
}: {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
  useSSL: boolean;
}): DB {
  const pgp = pgPromise();

  const conData = new ConnectionString(
    `postgresql://${username}:${password}@${host}:${port}/${database}`
  );

  const dbConfig: IConnectionParameters<IClient> = {
    database: conData.path !== undefined ? conData.path[0] : "",
    host: conData.hostname,
    password: conData.password,
    port: conData.port,
    user: conData.user,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  };

  const loggerInstance = logger({});
  loggerInstance.info("initDB");
  // createding a Database instance
  return pgp(dbConfig);
}
