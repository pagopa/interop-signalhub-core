## Purpose event-consumer service

### Overview

This service is intended to keep data synchornized with interop. t's in charge to keep **"purpose"** state sync.

### Getting started

If you want to run this service in local you need to execute:

- Kafka
- KafkaUI
- Postgres

You can launch all of them with following command:

```
  docker-compose up zookeeper
  docker-compose up kafka
  docker-compose up kafka-ui
  docker-compose up postgres
```

Or launch, from monorepo's root:

```
./script/infra-start.sh
```

(**NB:** Please remember to configure .env files)

### Run services

Now you're able to launch this service with:

`pnpm start:event:purpose`

### Test

You can launch test for this project with:

`pnpm test:event:purpose`
