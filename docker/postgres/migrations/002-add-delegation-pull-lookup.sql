-- Run once with psql -v interop_schema=<target_schema> -f <this_file>, outside a transaction.
\set ON_ERROR_STOP on
CREATE INDEX CONCURRENTLY delegation_pull_lookup_idx
    ON :"interop_schema".delegation (delegate_id, eservice_id, upper(state));
