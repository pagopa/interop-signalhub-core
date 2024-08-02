# Managing `.env` file with [`dotenv-flow`](https://github.com/kerimdzhanov/dotenv-flow)

Date: 2024-07-30

## Status

Accepted

## Context

In order to handle `.env` file and avoid to commit production database passwords, API keys and other sensitive things we have the following approach:

- `.env` – contains *all variables* needed for application, **tracked** by VCS
- `.env.test` – contains variables for test environment: does not introduce other variables: overwrites those in ``.env``, **tracked** by VCS
- `.env.local` - contains variables with all the sensitive data on local machine, **ignored** by VCS

See [this explanation](https://github.com/kerimdzhanov/dotenv-flow/tree/master?tab=readme-ov-file#files-under-version-control).
