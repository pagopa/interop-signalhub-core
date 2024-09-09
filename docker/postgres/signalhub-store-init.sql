create schema if not exists "dev_interop";
create schema if not exists "dev_signalhub";

CREATE TABLE IF NOT EXISTS "dev_interop"."eservice_producer" (
    eservice_id     VARCHAR (255) PRIMARY KEY,
    producer_id     VARCHAR (255) NOT NULL,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    event_stream_id VARCHAR (255) NOT NULL DEFAULT gen_random_uuid(),
    event_version_id BIGINT NOT NULL DEFAULT -1
);
CREATE UNIQUE INDEX IF NOT EXISTS IDX_ESERVICE_PRODUCER_ON_EVENT_STREAM_ID_VERSION_ID  ON "dev_interop"."eservice_producer"(event_stream_id, event_version_id);
CREATE UNIQUE INDEX IF NOT EXISTS IDX_ESERVICE_PRODUCER_ON_ESERVICE_ID_PRODUCER_ID  ON "dev_interop"."eservice_producer"(eservice_id, producer_id);
	
CREATE TABLE IF NOT EXISTS "dev_interop"."eservice" (
    eservice_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    producer_id     VARCHAR (255) NOT NULL,
    "state"           VARCHAR (255) NOT NULL,
    event_stream_id VARCHAR (255) NOT NULL DEFAULT gen_random_uuid(),
    event_version_id   BIGINT NOT NULL DEFAULT -1,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    PRIMARY KEY (eservice_id, descriptor_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS IDX_ESERVICE_ON_EVENT_STREAM_ID_VERSION_ID_DESCRIPTOR_ID  ON "dev_interop"."eservice"(event_stream_id, event_version_id, descriptor_id);
CREATE UNIQUE INDEX IF NOT EXISTS IDX_ESERVICE_ON_ESERVICE_DESCRIPTOR_PRODUCER ON "dev_interop"."eservice"(eservice_id, descriptor_id, producer_id);
CREATE INDEX IF NOT EXISTS IDX_ESERVICE_ON_ESERVICE_ID_AND_PRODUCER_AND_STATE ON "dev_interop"."eservice"(eservice_id, producer_id, upper(state));

CREATE TABLE IF NOT EXISTS "dev_interop"."agreement" (
    agreement_id    VARCHAR (255) PRIMARY KEY,
    eservice_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    consumer_id     VARCHAR (255) NOT NULL,
    "state"           VARCHAR (255) NOT NULL,
    event_stream_id VARCHAR (255) NOT NULL DEFAULT gen_random_uuid(),
    event_version_id   BIGINT NOT NULL DEFAULT -1,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS IDX_AGREEMENT_ON_EVENT_STREAM_ID_VERSION_ID  ON "dev_interop"."agreement"(event_stream_id, event_version_id);
CREATE INDEX IF NOT EXISTS IDX_AGREEMENT_ON_ESERVICE_CONSUMER_AND_STATE ON "dev_interop"."agreement"(eservice_id, consumer_id, upper(state));

CREATE TABLE IF NOT EXISTS "dev_interop"."purpose" (
    purpose_id       VARCHAR (255) PRIMARY KEY,
    purpose_version_id  VARCHAR (255),
    purpose_state    VARCHAR (255) NOT NULL,
    eservice_id     VARCHAR (255) NOT NULL,
    consumer_id     VARCHAR (255) NOT NULL,
    event_stream_id VARCHAR (255) NOT NULL DEFAULT gen_random_uuid(),
    event_version_id   BIGINT NOT NULL DEFAULT -1,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS IDX_PURPOSE_ON_EVENT_STREAM_ID_VERSION_ID  ON "dev_interop"."purpose"(event_stream_id, event_version_id);
CREATE INDEX IF NOT EXISTS IDX_PURPOSE_ON_PURPOSE_ID_CONSUMER_ID_PURPOSE_STATE_ESERVICE_ID ON "dev_interop"."purpose"(purpose_id, consumer_id, upper(purpose_state), eservice_id);

CREATE TABLE IF NOT EXISTS "dev_signalhub"."signal" (
    id             SERIAL PRIMARY KEY,
    correlation_id VARCHAR(255) NOT NULL,
    signal_id      BIGINT        NOT NULL,
    object_id      VARCHAR (255)  NOT NULL,
    eservice_id    VARCHAR (255)  NOT NULL,
    object_type    VARCHAR (255)  NOT NULL,
    signal_type    VARCHAR (255)  NOT NULL,
    tmst_insert    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS IDX_SIGNAL_ON_SIGNAL_ID ON "dev_signalhub"."signal"(signal_id);
CREATE INDEX IF NOT EXISTS IDX_SIGNAL_ON_ESERVICE_ID on "dev_signalhub"."signal"(eservice_id);
CREATE UNIQUE INDEX IF NOT EXISTS IDX_SIGNAL_ON_SIGNAL_ID_ESERVICE_ID ON "dev_signalhub"."signal"(eservice_id, signal_id);

CREATE TABLE IF NOT EXISTS "dev_signalhub"."dead_signal" (
    id             SERIAL PRIMARY KEY,
    correlation_id VARCHAR(255)   NOT NULL,
    signal_id      BIGINT        NOT NULL,
    object_id      VARCHAR (255)  NOT NULL,
    eservice_id    VARCHAR (255)  NOT NULL,
    object_type    VARCHAR (255)  NOT NULL,
    signal_type    VARCHAR (255)  NOT NULL,
    tmst_insert    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    error_reason   VARCHAR(255)  NOT NULL
);

CREATE TABLE IF NOT EXISTS "dev_signalhub"."tracing_batch_cleanup" (
    batch_id         SERIAL PRIMARY KEY ,
    tmst_start_at    TIMESTAMPTZ,
    tmst_end_at      TIMESTAMPTZ,
    error            VARCHAR (255),
    tmst_delete_from TIMESTAMPTZ,
    count_deleted    BIGINT
);
