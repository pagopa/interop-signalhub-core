import { SignalHubStoreConfig } from "pagopa-signalhub-commons";
import { GenericContainer } from "testcontainers";

export const TEST_POSTGRES_DB_PORT = 5432;
export const TEST_POSTGRES_DB_IMAGE =
  "postgres:14@sha256:2f7365d1f574dba34f6332978169afe60af9de9608fffbbfecb7d04cc5233698";

export const TEST_ELASTIC_MQ_IMAGE =
  "softwaremill/elasticmq-native:1.5.7@sha256:0cb5bcc04638c80af1631e8cf5da9b96b9fb6f46a4164462231065dc516c102f";
export const TEST_ELASTIC_MQ_PORT = 9324;

export const TEST_REDIS_IMAGE = "redis:7.2.5-alpine3.20";
export const TEST_REDIS_PORT = 6379;

export const postgreSQLContainer = (
  config: SignalHubStoreConfig
): GenericContainer =>
  new GenericContainer(TEST_POSTGRES_DB_IMAGE)
    .withEnvironment({
      POSTGRES_DB: config.signalhubStoreDbName,
      POSTGRES_USER: config.signalhubStoreDbUsername,
      POSTGRES_PASSWORD: config.signalhubStoreDbPassword
    })
    .withCopyFilesToContainer([
      {
        source: "../../docker/postgres/signalhub-store-init.sql",
        target: "/docker-entrypoint-initdb.d/signalhub-store-init.sql"
      }
    ])
    .withExposedPorts(TEST_POSTGRES_DB_PORT);

export const elasticMQContainer = (): GenericContainer =>
  new GenericContainer(TEST_ELASTIC_MQ_IMAGE)
    .withCopyFilesToContainer([
      {
        source: "../../docker/elasticmq/elasticmq.local.conf",
        target: "/opt/elasticmq.conf"
      }
    ])
    .withExposedPorts(TEST_ELASTIC_MQ_PORT);

export const redisContainer = (): GenericContainer =>
  new GenericContainer(TEST_REDIS_IMAGE).withExposedPorts(TEST_REDIS_PORT);
