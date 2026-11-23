-- Run once with psql -v interop_schema=<target_schema> -f <this_file>, outside a transaction.
\set ON_ERROR_STOP on
CREATE INDEX CONCURRENTLY purpose_pull_lookup_idx
    ON :"interop_schema".purpose (eservice_id, consumer_id, upper(purpose_state));
