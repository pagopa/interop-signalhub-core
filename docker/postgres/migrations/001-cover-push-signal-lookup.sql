\set ON_ERROR_STOP on
CREATE UNIQUE INDEX CONCURRENTLY signal_eservice_id_signal_id_covering_idx
    ON :"signalhub_schema".signal (eservice_id, signal_id) INCLUDE (tmst_insert);

DROP INDEX CONCURRENTLY :"signalhub_schema".signal_index_on_signal_id_eservice_id;
