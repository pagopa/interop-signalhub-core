create schema if not exists "dev_interop";
create schema if not exists "dev_interop_by_api";
create schema if not exists "dev_signalhub";
	
CREATE TABLE IF NOT EXISTS "dev_interop"."eservice" (
    eservice_id     VARCHAR (255) NOT NULL,
    producer_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    event_id        BIGINT DEFAULT -1,
    event_stream_id VARCHAR (255) NOT NULL,
    event_version_id   BIGINT,
    state           VARCHAR (255) NOT NULL,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    UNIQUE (eservice_id, producer_id, descriptor_id),
    PRIMARY KEY (eservice_id, producer_id, descriptor_id)
);

CREATE INDEX IF NOT EXISTS ESERVICE_INDEX_ID ON "dev_interop"."eservice" USING hash (eservice_id);
CREATE INDEX IF NOT EXISTS ESERVICE_INDEX_PRODUCER_ID ON "dev_interop"."eservice" USING hash (producer_id);

CREATE TABLE IF NOT EXISTS "dev_interop"."agreement" (
    agreement_id    VARCHAR (255) NOT NULL,
    eservice_id     VARCHAR (255) NOT NULL,
    consumer_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    event_id        BIGINT DEFAULT -1,
    event_stream_id VARCHAR (255) NOT NULL,
    event_version_id   BIGINT,    
    state           VARCHAR (255) NOT NULL,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    UNIQUE (eservice_id, consumer_id, descriptor_id),
    PRIMARY KEY (eservice_id, consumer_id, descriptor_id)
);

CREATE INDEX IF NOT EXISTS agreement_INDEX_ID ON "dev_interop"."agreement" USING hash (eservice_id);
CREATE INDEX IF NOT EXISTS agreement_INDEX_CONSUMER_ID ON "dev_interop"."agreement" USING hash (consumer_id);
CREATE INDEX IF NOT EXISTS agreement_INDEX_DESCRIPTOR_ID ON "dev_interop"."agreement" USING hash (descriptor_id);

CREATE TABLE IF NOT EXISTS "dev_interop"."purpose" (
    purpose_id       VARCHAR (255) NOT NULL,
    purpose_version_id  VARCHAR (255) NOT NULL,
    purpose_state    VARCHAR (255) NOT NULL,
    eservice_id     VARCHAR (255) NOT NULL,
    consumer_id     VARCHAR (255) NOT NULL,
    event_id        BIGINT DEFAULT -1,
    event_stream_id VARCHAR (255) NOT NULL,
    event_version_id   BIGINT,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    UNIQUE (event_stream_id, event_order),
    UNIQUE (purpose_id, eservice_id, consumer_id),
    PRIMARY KEY (purpose_id)
);

CREATE TABLE IF NOT EXISTS "dev_interop"."tracing_batch" (
    batch_id         SERIAL PRIMARY KEY,
    state            VARCHAR (255) NOT NULL,
    type             VARCHAR (50) NOT NULL,
    last_event_id    BIGINT,
    tmst_created     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "dev_interop"."dead_event" (
    event_tmp_id        SERIAL PRIMARY KEY,
    tmst_insert         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    error_reason        VARCHAR(255) NOT NULL,
    event_id            BIGINT NOT NULL,
    event_type          VARCHAR (255) NOT NULL,
    object_type         VARCHAR (255) NOT NULL,
    descriptor_id       VARCHAR (255),
    eservice_id         VARCHAR (255),
    agreement_id        VARCHAR (255)
);

CREATE TABLE IF NOT EXISTS "dev_signalhub"."signal" (
    id             SERIAL PRIMARY KEY,
    correlation_id VARCHAR(255) NOT NULL,
    signal_id      BIGINT        NOT NULL,
    object_id      VARCHAR (255)  NOT NULL,
    eservice_id    VARCHAR (255)  NOT NULL,
    object_type    VARCHAR (255)  NOT NULL,
    signal_type    VARCHAR (255)  NOT NULL,
    tmst_insert    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (signal_id, eservice_id)
);

CREATE INDEX IF NOT EXISTS SIGNAL_INDEX_SIGNAL_ID ON "dev_signalhub"."signal" USING hash (signal_id);
CREATE INDEX IF NOT EXISTS SIGNAL_INDEX_ESERVICE_ID on "dev_signalhub"."signal" USING hash (eservice_id);

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
    batch_id         SERIAL PRIMARY KEY,
    tmst_start_at    TIMESTAMPTZ,
    tmst_end_at      TIMESTAMPTZ,
    error            VARCHAR (255),
    tmst_delete_from TIMESTAMPTZ,
    count_deleted    BIGINT
);

-- DEV_INTEROP_BY_API

/*
CREATE TABLE IF NOT EXISTS "dev_interop_by_api"."eservice" (
    eservice_id     VARCHAR (255) NOT NULL,
    producer_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    event_id        BIGINT,
    state           VARCHAR (255) NOT NULL,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    UNIQUE (eservice_id, producer_id, descriptor_id),
    PRIMARY KEY (eservice_id, producer_id, descriptor_id)
);

CREATE INDEX IF NOT EXISTS ESERVICE_INDEX_ID ON "dev_interop_by_api"."eservice" USING hash (eservice_id);
CREATE INDEX IF NOT EXISTS ESERVICE_INDEX_PRODUCER_ID ON "dev_interop_by_api"."eservice" USING hash (producer_id);

CREATE TABLE IF NOT EXISTS "dev_interop_by_api"."agreement" (
    agreement_id    VARCHAR (255) NOT NULL,
    eservice_id     VARCHAR (255) NOT NULL,
    consumer_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    event_id        BIGINT,
    state           VARCHAR (255) NOT NULL,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    UNIQUE (eservice_id, consumer_id, descriptor_id),
    PRIMARY KEY (eservice_id, consumer_id, descriptor_id)
);

CREATE INDEX IF NOT EXISTS agreement_INDEX_ID ON "dev_interop_by_api"."agreement" USING hash (eservice_id);
CREATE INDEX IF NOT EXISTS agreement_INDEX_CONSUMER_ID ON "dev_interop_by_api"."agreement" USING hash (consumer_id);
CREATE INDEX IF NOT EXISTS agreement_INDEX_DESCRIPTOR_ID ON "dev_interop_by_api"."agreement" USING hash (descriptor_id);

CREATE TABLE IF NOT EXISTS "dev_interop_by_api"."tracing_batch" (
    batch_id         SERIAL PRIMARY KEY,
    state            VARCHAR (255) NOT NULL,
    type             VARCHAR (50) NOT NULL,
    last_event_id    BIGINT,
    tmst_created     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "dev_interop_by_api"."dead_event" (
    event_tmp_id        SERIAL PRIMARY KEY,
    tmst_insert         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    error_reason        VARCHAR(255) NOT NULL,
    event_id            BIGINT NOT NULL,
    event_type          VARCHAR (255) NOT NULL,
    object_type         VARCHAR (255) NOT NULL,
    descriptor_id       VARCHAR (255),
    eservice_id         VARCHAR (255),
    agreement_id        VARCHAR (255)
);
*/