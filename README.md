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

To start __all__ the external services: 
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
````
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
