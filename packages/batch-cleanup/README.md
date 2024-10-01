# Batch-cleanup service

### Overview

This service is aim to delete signals retained on storage for several time.

### Getting started

If you want to run this service in local you need to execute:

- Postgres

You can launch Posgtres with this command (**NB**: you need Docker installed into your machine):

```
docker-compose up postgres
```

(**NB:** Please remember to configure .env files)

### Run services

Now you're able to launch cleanup service with this:

`pnpm start:cleaner`

### Test

You can launch test for this project with:

`pnpm test:cleaner`
