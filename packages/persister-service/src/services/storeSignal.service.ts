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
    async storeSignal(message: string) {
      try {
        console.log("Store signal", message);
      } catch (error) {
        console.error(error);
      }
    },
  };
}
