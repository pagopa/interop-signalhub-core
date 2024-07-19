# Status code 200 instead of 204

Date: 2024-07-19

## Status

Accepted

## Context

In order to handle success response of a API `POST /signals` we can choose two approach:

- `status: 200, body: { signalId: 123 }`
- `status 204`

See api [push signal](../../packages/push-signal/src/contract/contract.ts).

The [status code 204](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204), although a perfectly legitimate status consistent with REST, could be misunderstood by the client. 204 status code is less widespread then the 200.

We maintain ***the status code 200*** to return the caller to a **usual** and **familiar** status code, to prevent any doubts or requests for clarification.


