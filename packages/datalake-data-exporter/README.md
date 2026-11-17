# Datalake data exporter

### Overview

This job exports all signals to the datalake bucket.

For each run it uploads:

- `data/signal/yyyyMMdd/yyyyMMdd_HHmmss_<random_uuid>.ndjson`: signals, 1000 per file
- `count/signal/yyyyMMdd/yyyyMMdd_HHmmss.json`: number of exported signals

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
