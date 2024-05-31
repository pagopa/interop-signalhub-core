# Custom error on Persister service

Date: 2024-05-30

## Status

Accepted

## Context

In order to handle as much as possible error on persister-service, we split up errors in two different definitions:

- Recoverable Message error
- Not Recoverable Message Error

By default persister service, if there is an error, will try to throw a Recoverable Message error in order to not lose message that will be processed again. Persister service will delete messages only if them are un-processable.

### Recoverable Message error

We use this definition when errors generated should be temporary. For instance a problem with db connection. In that case the message just retrieved from queue will not be deleted from queue and could be processed again. That's why the message hasn't problem, but the error depend by external component (like db connection).

### Not Recoverable Message error

We use this definition when errors generated are not temporary and doesn't make sense let message on queue in the hope that a message will be processed again. In that case the message associated to the error will be removed from queue and will be stored on a specific table of DB writing on it why the error occured (for instance if message with signalId and eServiceId is already on DB or a Zod Error).
