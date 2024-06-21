import { SignalHubStoreConfig, InteropVoucherConfig } from "signalhub-commons";
import { GenericContainer, Wait } from "testcontainers";

export const TEST_POSTGRES_DB_PORT = 5432;
export const TEST_POSTGRES_DB_IMAGE = "postgres:14";

export const TEST_MOCKSERVER_PORT = 1080;
export const TEST_MOCKSERVER_IMAGE = "mockserver/mockserver:5.15.0";

export const TEST_ELASTIC_MQ_IMAGE = "softwaremill/elasticmq-native:1.5.7";
export const TEST_ELASTIC_MQ_PORT = 9324;

export const postgreSQLContainer = (
  config: SignalHubStoreConfig
): GenericContainer =>
  new GenericContainer(TEST_POSTGRES_DB_IMAGE)
    .withEnvironment({
      POSTGRES_DB: config.signalhubStoreDbName,
      POSTGRES_USER: config.signalhubStoreDbUsername,
      POSTGRES_PASSWORD: config.signalhubStoreDbPassword,
    })
    .withCopyFilesToContainer([
      {
        source: "../../docker/postgres/signalhub-store-init.sql",
        target: "/docker-entrypoint-initdb.d/signalhub-store-init.sql",
      },
    ])
    .withExposedPorts(TEST_POSTGRES_DB_PORT);

export const elasticMQContainer = (): GenericContainer =>
  new GenericContainer(TEST_ELASTIC_MQ_IMAGE)
    .withCopyFilesToContainer([
      {
        source: "../../docker/elasticmq/elasticmq.local.conf",
        target: "/opt/elasticmq.conf",
      },
    ])
    .withExposedPorts(TEST_ELASTIC_MQ_PORT);

export const mockserverContainer = (
  _config: InteropVoucherConfig
): GenericContainer =>
  new GenericContainer(TEST_MOCKSERVER_IMAGE)
    .withCopyFilesToContainer([
      {
        source: "../../docker/mockserver/agreements.json",
        target: "/config/agreements.json",
      },
    ])
    .withEnvironment({
      MOCKSERVER_SERVER_PORT: `${TEST_MOCKSERVER_PORT}`,
      MOCKSERVER_INITIALIZATION_JSON_PATH: "/config/agreements.json",
      MOCKSERVER_ENABLE_CORS_FOR_ALL_RESPONSES: "true",
      MOCKSERVER_CORS_ALLOW_ORIGIN: "*",
      MOCKSERVER_CORS_ALLOW_METHODS:
        "CONNECT, DELETE, GET, HEAD, OPTIONS, POST, PUT, PATCH, TRACE",
      MOCKSERVER_CORS_ALLOW_HEADERS:
        "Allow, Content-Encoding, Content-Length, Content-Type, ETag, Expires, Last-Modified, Location, Server, Vary, Authorization",
      MOCKSERVER_CORS_ALLOW_CREDENTIALS: "true",
      MOCKSERVER_CORS_MAX_AGE_IN_SECONDS: "300",
    })
    .withExposedPorts(TEST_MOCKSERVER_PORT)
    .withWaitStrategy(Wait.forLogMessage("started on port"));
