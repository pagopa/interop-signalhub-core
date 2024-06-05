import { SignalHubStoreConfig } from "signalhub-commons";
import { GenericContainer } from "testcontainers";
import { SqsConfig } from "./index.js";

export const TEST_POSTGRES_DB_PORT = 5432;
export const TEST_POSTGRES_DB_IMAGE = "postgres:14";

export const TEST_SQS_PORT = 4566;
export const TEST_SQS_IMAGE = "localstack/localstack:latest";

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
        source: "../../docker/signalhub-store-init.sql",
        target: "/docker-entrypoint-initdb.d/signalhub-store-init.sql",
      },
    ])
    .withExposedPorts(TEST_POSTGRES_DB_PORT);

export const sqsContainer = (config: SqsConfig): GenericContainer =>
  new GenericContainer(TEST_SQS_IMAGE)
    .withEnvironment({
      AWS_ACCESS_KEY_ID: "AWS-DUMMY-ID",
      AWS_SECRET_ACCESS_KEY: "AWS-DUMMY",
      AWS_DEFAULT_REGION: config.awsRegion,
      SERVICES: "sqs",
    })
    .withExposedPorts(TEST_SQS_PORT);
