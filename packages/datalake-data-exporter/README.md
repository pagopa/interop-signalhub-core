# Datalake data exporter

### Overview

This job exports all signals to the datalake bucket.

For each run it uploads:

- `signal/dt=yyyy-MM-dd/run=<runId>/part-000001.ndjson`, `part-000002.ndjson`, ...: signals, 100000 per file
- `signal/dt=yyyy-MM-dd/run=<runId>/_manifest.json`: number of exported signals, uploaded after the last file

`runId` is a random UUID generated once per run.

### Getting started

If you want to run this service in local you need to execute:

- Postgres
- An S3 compatible server on the host and port set in `.env`

You can launch Postgres with this command (**NB**: you need Docker installed into your machine):

```
docker-compose up postgres
```

### Run services

`pnpm start:datalake-exporter`

### Test

`pnpm test:datalake-exporter`
