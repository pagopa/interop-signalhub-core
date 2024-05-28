import { SignalEvent } from "../models/domain/models.js";
// import { config } from "../config/index.js";
// import { DB, createDbInstance } from "../repositories/db.js";

// const _db: DB = createDbInstance({
//   username: config.signalhubStoreDbUsername,
//   password: config.signalhubStoreDbPassword,
//   host: config.signalhubStoreDbHost,
//   port: config.signalhubStoreDbPort,
//   database: config.signalhubStoreDbName,
//   schema: config.signalhubStoreDbSchema,
//   useSSL: config.signalhubStoreDbUseSSL,
// });

export function storeSignalServiceBuilder() {
  return {
    async storeSignal(signalEvent: SignalEvent) {
      try {
        console.log("Store signal", signalEvent);
      } catch (error) {
        console.error(error);
      }
    },
  };
}
