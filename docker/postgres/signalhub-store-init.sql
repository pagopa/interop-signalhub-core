create schema if not exists "dev_interop";
create schema if not exists "dev_signalhub";



CREATE TABLE IF NOT EXISTS "dev_interop"."eservice_producer" (
    eservice_id     VARCHAR (255) NOT NULL,
    producer_id     VARCHAR (255) NOT NULL,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    event_stream_id VARCHAR (255) NOT NULL DEFAULT gen_random_uuid(),
    event_version_id   BIGINT NOT NULL DEFAULT -1,
    UNIQUE (event_stream_id, event_version_id),
    UNIQUE (eservice_id, producer_id),
    PRIMARY KEY (eservice_id)
); 
	
CREATE TABLE IF NOT EXISTS "dev_interop"."eservice" (
    eservice_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    producer_id     VARCHAR (255) NOT NULL,
    state           VARCHAR (255) NOT NULL,
    event_id        BIGINT DEFAULT -1,
    event_stream_id VARCHAR (255) NOT NULL DEFAULT gen_random_uuid(),
    event_version_id   BIGINT NOT NULL DEFAULT -1,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    UNIQUE (event_stream_id, event_version_id,descriptor_id),
    UNIQUE (eservice_id, descriptor_id, producer_id),
    PRIMARY KEY (eservice_id, descriptor_id)
);
CREATE INDEX IF NOT EXISTS ESERVICE_INDEX_ID_AND_PRODUCER_AND_STATE ON "dev_interop"."eservice"(eservice_id, producer_id, state);

CREATE TABLE IF NOT EXISTS "dev_interop"."agreement" (
    agreement_id    VARCHAR (255) NOT NULL,
    eservice_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    consumer_id     VARCHAR (255) NOT NULL,
    state           VARCHAR (255) NOT NULL,
    event_id        BIGINT DEFAULT -1,
    event_stream_id VARCHAR (255) NOT NULL DEFAULT gen_random_uuid(),
    event_version_id   BIGINT NOT NULL DEFAULT -1,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    UNIQUE (event_stream_id, event_version_id),
    PRIMARY KEY (agreement_id)
);
CREATE INDEX IF NOT EXISTS AGREEMENT_INDEX_ESERVICE_AND_CONSUMER_AND_STATE ON "dev_interop"."agreement"(eservice_id, consumer_id, state);

CREATE TABLE IF NOT EXISTS "dev_interop"."purpose" (
    purpose_id       VARCHAR (255) NOT NULL,
    purpose_version_id  VARCHAR (255),
    purpose_state    VARCHAR (255) NOT NULL,
    eservice_id     VARCHAR (255) NOT NULL,
    consumer_id     VARCHAR (255) NOT NULL,
    event_id        BIGINT DEFAULT -1,
    event_stream_id VARCHAR (255) NOT NULL DEFAULT gen_random_uuid(),
    event_version_id   BIGINT NOT NULL DEFAULT -1,
    tmst_insert     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMPTZ,
    UNIQUE (event_stream_id, event_version_id),
    UNIQUE (purpose_id, eservice_id, consumer_id),
    PRIMARY KEY (purpose_id)
);
CREATE INDEX IF NOT EXISTS PURPOSE_INDEX_ESERVICE_AND_CONSUMER_AND_STATE ON "dev_interop"."purpose"(purpose_id, consumer_id, purpose_state, eservice_id);

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
