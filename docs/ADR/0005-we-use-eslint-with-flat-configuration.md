# ESlint with new flat configuration

Date: 2024-10-30

## Status

Accepted

## Context

Starting from 2024-10-05 ESlint v8.x will no longer mantained. For this reason we switched to 9.13.0 version. Starting from 9.x.x ESLint has changed way to configure rules from "eslintrc" file to flat configuration file. About monorepo we won't have rules for each packages within monorepo but just one which can include different rules for different packages (https://github.com/eslint/eslint/discussions/16960)
