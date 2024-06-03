import { SignalHubStoreConfig } from "signalhub-commons";
import { GenericContainer } from "testcontainers";

export const TEST_POSTGRES_DB_PORT = 5432;
export const TEST_POSTGRES_DB_IMAGE = "postgres:14";

console.log("TEST_POSTGRS", TEST_POSTGRES_DB_IMAGE);

export const postgreSQLContainer = (
  config: SignalHubStoreConfig
): GenericContainer =>
  new GenericContainer(TEST_POSTGRES_DB_IMAGE)
    .withEnvironment({
      POSTGRES_DB: config.signalhubStoreDbName,
      POSTGRES_USER: config.signalhubStoreDbUsername,
      POSTGRES_PASSWORD: config.signalhubStoreDbPassword,
    })
    // .withCopyFilesToContainer([
    //   {
    //     source: "../../docker/signalhub-store-init.sql",
    //     target: "/docker-entrypoint-initdb.d/signalhub-store-init.sql",
    //   },
    // ])
    .withExposedPorts(TEST_POSTGRES_DB_PORT);
