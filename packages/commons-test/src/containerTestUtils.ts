import { SignalHubStoreConfig, InteropVoucherConfig } from "signalhub-commons";
import { GenericContainer, Wait } from "testcontainers";
import { SqsConfig } from "./index.js";

export const TEST_POSTGRES_DB_PORT = 5432;
export const TEST_POSTGRES_DB_IMAGE = "postgres:14";

export const TEST_SQS_PORT = 4566;
export const TEST_SQS_IMAGE = "localstack/localstack:3.2.0";

export const TEST_MOCKSERVER_PORT = 1080;
export const TEST_MOCKSERVER_IMAGE = "mockserver/mockserver:5.15.0";

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

export const sqsContainer = (_config: SqsConfig): GenericContainer =>
  new GenericContainer(TEST_SQS_IMAGE)
    .withCopyFilesToContainer([
      {
        source: "aws.config.local",
        target: "/root/.aws/credentials",
      },
    ])
    .withEnvironment({
      SERVICES: "sqs",
    })
    .withExposedPorts(TEST_SQS_PORT);

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
