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
# example: pnpm start:push-signals
```

## Local Environment (docker-compose)

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
docker-compose up elaticmq
```

Test with:

```
export AWS_REGION=us-east-1
aws sqs list-queues --endpoint-url http://localhost:9324
```


### Mockserver to simulate Interop API m2m

```
docker-compose up mockserver
```

To test:

```
curl -vv http://localhost:1080/1.0/events/eservices?limit=100&lastEventId=0
```


