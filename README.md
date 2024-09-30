# Interop Signal-hub Core

## Overview

Signal-hub is a platform with the aim to give to [interop-platform](https://github.com/pagopa/interop-be-monorepo) users, the chance to notify and receive a "signal" if data has been updated. More info here:
https://www.interop.pagopa.it/.

## Architecture

The platform has been splitted in several service, each one with its own scope:

- [Push-signal service](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/push-signal) : In charge of signal's storage.
- [Pull-signal service](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/pull-signal): In charge of retrieve signals from storage.
- [Persister service](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/signal-persister) : Actors in the middle between push and pull services.
- [Eservice-event-consumer](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/eservice-event-consumer): Responsible to mantain platform sync with interop-platform (EService state).
- [Purpose-event-consumer](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/purpose-event-consumer): Responsible to mantain platform sync with interop-platform (Purpose state).
- [Agreement-event-consumer](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/agreement-event-consumer): Responsible to mantain platform sync with interop-platform (Purpose state).
- [Clean up](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/batch-cleanup): Responsible to clean storage after a certain amount of time.

Within package folder, there are other libs that provide utils method for the platform like:

- [Commons](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/commons)
- [Kafka-connector](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/kafka-connector)
- [Commons-test](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/commons-test)
- [TS-rest openapi parser](https://github.com/pagopa/interop-signalhub-core/tree/main/packages/tsrest-openapi-parser)

### ADR (Architectural Decision Records)

Throughout developing phases of this project, we make several decisions that we decide to keep track in ADR folder. You cand find it [here](docs/ADR/).

## Getting started

### Prerequisites

If you want run this project you will need:

- Node.js (https://nodejs.org/en/download/package-manager)
- pnpm (https://pnpm.io/installation)

Before run the platform it's necessary install dependecies with this command:

```
pnpm install
```

## Run applications in local environment

### Environment

Before running project you need to set/update envs files which you can find an example for each package.

### Run all services simultaneously

If you want to run entire project on your machine, you need different tools like Postgres, ElasticMQ. If you've Docker available in your host you can run this:

```
./script/infra-start.sh
```

If you want to watch status of applications and logs you can prompt this:

```
./script/infra-status.sh
```

Moreover it's available scripts for stop and destroy containers which has been created with this:

```
./script/infra-stop.sh // Stop containers

./script/infra-destroy.sh
```

If you want to check ststus of single container within docker, you can launch this command:

```
docker-compose -f docker/docker-compose.yml logs -f -t <name-of-service>

# Example:
docker-compose -f docker/docker-compose.yml logs -f -t postgres
```

### Run a single service in watch mode

If you need to run only one service, maybe run every service is not necessary. For instance, if you want to run only "push-service" you need elasticMQ and Posgtres containers only.

If you choose to use docker you can run (**NB**: you need to be inside /docker folder):

```
docker-compose up postgres elasticmq
```

```
pnpm start:<service-name>
# example: pnpm start:push
```

### Run services in background (with startup scripts):

You can also run service in background running followwing script:

- Push-service: `./script/push-start.sh `
- Pull-service: `./script/pull-start.sh`

### Start infrastructure in single mode

- #### Database

  ```
  docker-compose up postgres
  ```

  Test with:

  ```
  psql -h localhost -p 5432 -U postgres -d signal-hub -c "select 1+1 as result;"
  ```

  To maintain data across container restart add this:

  ```
      volumes:
          - ./postgres/data:/var/lib/postgresql/data
      user: 501:20
  ```

- #### ElasticMQ (to simulate AWS SQS)

  ElasticMQ is a message queue system oferring a SQS compatible interface.

  `docker-compose up elasticmq `

  test it with:

  ```

  export AWS_PROFILE=<some aws profile in your ~/.aws/config>
  aws sqs list-queues --endpoint-url http://localhost:9324

  ```

  You can even use a fake profile:

  ```

  [profile FAKE-FOR-TEST]
  aws_access_key_id=test-aws-key
  aws_secret_access_key=test-aws-secret
  region=eu-south-1

  ```

- #### KAFKA and KafkaUI

  This project use Kafka to retrieve mantain data sync with interop. To run what's necessary for kafka you need to run:

  ```

  docker-compose up zookeeper
  docker-compose up kafka
  docker-compose up kafka-ui

  ```

## Generate OpenAPI for PUSH/PULL services

If you want to create OpenAPI specification you can run

```

pnpm run api:generate:pull --version <version>

```

Latter instruction create OpenAPI spec for pull-service. It will create a new file under **/packages/pull-signal/src/api** if it doesn't exist yet.

Same you can do for push-service:

```

pnpm run api:generate:push --version <version>

```

You can find new open api spec file (for push-service) under **packages/push-signal/src/api**

**NOTE**: It's important define a version of open API following semantic versioning rules, otherwise cli will throw an error.

## Validate Open API

If you can check if openAPI created before is compliant on openAPI specification can run:

`pnpm run api:validate:<service_name> --version <version>`
