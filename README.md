> NOTE: this repo is still a work in progress

# Interop Signal-hub Monorepo

## How to start

To get started, you will need:

- Node.js (https://nodejs.org/en/download/package-manager)
- pnpm (https://pnpm.io/installation)

Then install the dependencies with

```
pnpm install
```

## How to run a single service in watch mode

```
pnpm start:<service-name>
# example: pnpm start:push
```

## How to run services in background (with startup scripts):

```
./script/push-start.sh
```

```
./script/pull-start.sh
```

## Local Environment

### Startup scripts

To start **all** the external services:

```
./script/infra-start.sh
```

To watch status and logs:

```
./script/infra-status.sh
```

### Without startup scripts

### Database

```
docker-compose up postgres
```

Test with:

```
psql -h localhost -p 5432 -U postgres -d signal-hub -c "select 1+1 as result;"
```

To maintain data across restart add this:

```
    volumes:
        - ./postgres/data:/var/lib/postgresql/data
    user: 501:20
```

### ElasticMQ to simulate AWS SQS

```
# There's no need to set env vars
docker-compose up elaticmq
```

Test with:

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

### Mockserver to simulate Interop API m2m

```
docker-compose up mockserver
```

To test:

```
curl -vv http://localhost:1080/1.0/events/eservices?limit=100&lastEventId=0
```

> NOTE: this repo is still a work in progress

# Interop Signal-hub Monorepo

## How to start

To get started, you will need:

- Node.js (https://nodejs.org/en/download/package-manager)
- pnpm (https://pnpm.io/installation)

Then install the dependencies with

```
pnpm install
```

## How to run a single service in watch mode

```
pnpm start:<service-name>
# example: pnpm start:push
```

## How to run services in background (with startup scripts):

```
./script/push-start.sh
```

```
./script/pull-start.sh
```

## Local Environment

### Startup scripts

To start **all** the external services:

```
./script/infra-start.sh
```

To watch status and logs:

```
./script/infra-status.sh
```

### Without startup scripts

### Database

```
docker-compose up postgres
```

Test with:

```
psql -h localhost -p 5432 -U postgres -d signal-hub -c "select 1+1 as result;"
```

To maintain data across restart add this:

```
    volumes:
        - ./postgres/data:/var/lib/postgresql/data
    user: 501:20
```

### ElasticMQ to simulate AWS SQS

```
# There's no need to set env vars
docker-compose up elaticmq
```

Test with:

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

### Mockserver to simulate Interop API m2m

```
docker-compose up mockserver
```

To test:

```
curl -vv http://localhost:1080/1.0/events/eservices?limit=100&lastEventId=0
```

### Generate Open API

If you want to create open API specification you can run

```
pnpm run api:generate:pull --version <version>
```

Latter instruction create openAPI spec for pull-service. It will create a new file under **/packages/pull-signal/src/api** if it doesn't exist yet.

Same you can do for push-service:

```
pnpm run api:generate:push --version <version>
```

You can find new open api spec file (for push-service) under **packages/push-signal/src/api**

**NOTE**: It's important define a version of open API following semantic versioning rules, otherwise cli will throw an error.

## Validate Open API

If you can check if openAPI created before is compliant on openAPI specification can run:

`pnpm run api:validate:<service_name> --version <version>`
