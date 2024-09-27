## Push-signal service

### Overview

This service is in charge of receive "Signal" from user through REST openAPI interface.

### Getting started

If you want to run this service in local you need to execute:

- ElasticMQ (for SQS simulation)
- Postgres

You can launch ElasticMQ and Posgtres with this command (**NB**: you need Docker installed into your machine):

```
docker-compose up postgres elasticmq
```

(**NB:** Please remember to configure .env files)

For elastic MQ configuration you can check [here](../../README.md).

### Run services

Now you're able to launch push-signal service with this:

`pnpm start:push`

### Test

You can launch test for this project with:

`pnpm test:push`
