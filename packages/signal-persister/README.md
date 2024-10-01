## Signal-persister service

### Overview

This service is the "service in the middle" between push-service and pull-service and is responsible to get messages from SQS and saving them within a storage.

### Getting started

If you want to run this service in local you need to execute:

- ElasticMQ (for SQS simulation)
- Postgres

You can launch ElasticMQ and Postgres with this command (**NB**: you need Docker installed into your machine):

```
docker-compose up postgres elasticmq
```

(**NB:** Please remember to configure .env files)

For elastic MQ configuration you can check [here](../../README.md).

### Run services

Now you're able to launch persister service with this:

`pnpm start:persister`

### Test

You can launch test for this project with:

`pnpm test:persister`
