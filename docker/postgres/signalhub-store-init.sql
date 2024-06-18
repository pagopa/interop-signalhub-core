create schema if not exists "dev_interop";
create schema if not exists "dev_signalhub";
	
CREATE TABLE IF NOT EXISTS "dev_interop"."eservice" (
    eservice_id     VARCHAR (255) NOT NULL,
    producer_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    event_id        BIGINT,
    state           VARCHAR (255) NOT NULL,
    tmst_insert     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMP,
    UNIQUE (eservice_id, producer_id, descriptor_id),
    PRIMARY KEY (eservice_id, producer_id, descriptor_id)
);

CREATE INDEX IF NOT EXISTS ESERVICE_INDEX_ID ON "dev_interop"."eservice" USING hash (eservice_id);
CREATE INDEX IF NOT EXISTS ESERVICE_INDEX_PRODUCER_ID ON "dev_interop"."eservice" USING hash (producer_id);

CREATE TABLE IF NOT EXISTS "dev_interop"."consumer_eservice" (
    agreement_id    VARCHAR (255) NOT NULL,
    eservice_id     VARCHAR (255) NOT NULL,
    consumer_id     VARCHAR (255) NOT NULL,
    descriptor_id   VARCHAR (255) NOT NULL,
    event_id        BIGINT,
    state           VARCHAR (255) NOT NULL,
    tmst_insert     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tmst_last_edit  TIMESTAMP,
    UNIQUE (eservice_id, consumer_id, descriptor_id),
    PRIMARY KEY (eservice_id, consumer_id, descriptor_id)
);

CREATE INDEX IF NOT EXISTS CONSUMER_ESERVICE_INDEX_ID ON "dev_interop"."consumer_eservice" USING hash (eservice_id);
CREATE INDEX IF NOT EXISTS CONSUMER_ESERVICE_INDEX_CONSUMER_ID ON "dev_interop"."consumer_eservice" USING hash (consumer_id);
CREATE INDEX IF NOT EXISTS CONSUMER_ESERVICE_INDEX_DESCRIPTOR_ID ON "dev_interop"."consumer_eservice" USING hash (descriptor_id);

CREATE TABLE IF NOT EXISTS "dev_signalhub"."signal" (
    id             SERIAL PRIMARY KEY,
    correlation_id VARCHAR(255) NOT NULL,
    signal_id      BIGINT        NOT NULL,
    object_id      VARCHAR (255)  NOT NULL,
    eservice_id    VARCHAR (255)  NOT NULL,
    object_type    VARCHAR (255)  NOT NULL,
    signal_type    VARCHAR (255)  NOT NULL,
    tmst_insert    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    tmst_insert    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_reason   VARCHAR(255)  NOT NULL
);

CREATE TABLE IF NOT EXISTS "dev_interop"."tracing_batch" (
    batch_id         SERIAL PRIMARY KEY,
    state            VARCHAR (255) NOT NULL,
    type             VARCHAR (50) NOT NULL,
    last_event_id    BIGINT,
    tmst_created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "dev_interop"."dead_event" (
    event_tmp_id        SERIAL PRIMARY KEY,
    tmst_insert         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_reason        VARCHAR(255) NOT NULL,
    event_id            BIGINT NOT NULL,
    event_type          VARCHAR (255) NOT NULL,
    object_type         VARCHAR (255) NOT NULL,
    descriptor_id       VARCHAR (255),
    eservice_id         VARCHAR (255),
    agreement_id        VARCHAR (255)
);