import { ConnectionString } from "connection-string";
import pgPromise, { IDatabase } from "pg-promise";
import {
  IClient,
  IConnectionParameters,
} from "pg-promise/typescript/pg-subset.js";

import { logger } from "../logging/index.js";

export type DB = IDatabase<unknown>;

export function createDbInstance({
  database,
  host,
  maxConnectionPool,
  password,
  port,
  useSSL,
  username,
}: {
  database: string;
  host: string;
  maxConnectionPool: number;
  password: string;
  port: number;
  useSSL: boolean;
  username: string;
}): DB {
  // ONLY FOR FOR DEBUGGING
  /*
  const initOptions = {
    query(e: { query: unknown }): void {
      console.log(e.query);
    },
  };
  const pgp = pgPromise(initOptions);
  */
  const pgp = pgPromise();

  const conData = new ConnectionString(
    `postgresql://${username}:${password}@${host}:${port}/${database}`,
  );

  const dbConfig: IConnectionParameters<IClient> = {
    database: conData.path !== undefined ? conData.path[0] : "",
    host: conData.hostname,
    max: maxConnectionPool,
    password: conData.password,
    port: conData.port,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    user: conData.user,
  };

  const loggerInstance = logger({});
  loggerInstance.info("initDB");
  // creating a Database instance
  return pgp(dbConfig);
}
