## Push-signal service

### Overview

This service is in charge of receive "Signal" sent by user from storage through REST openAPI interface.

### Getting started

If you want to run this service in local you need to execute:

- Postgres

You can launch and Posgtres with this command (**NB**: you need Docker installed into your machine):

```
docker-compose up postgres
```

(**NB:** Please remember to configure .env files)

### Run service

Now you're able to launch push-signal service with this:

`pnpm start:pull`

### Test

You can launch test for this project with:

`pnpm test:pull`
