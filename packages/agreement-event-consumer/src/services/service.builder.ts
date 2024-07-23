import { DB, createDbInstance } from "pagopa-signalhub-commons";

export function serviceBuilder() {
  const db: DB = createDbInstance({
    username: "",
    database: "",
    host: "",
    password: "",
    port: 1111,
    useSSL: false,
  });

  console.log("db", db);
}
