# openAPI documentation with "major.minor" semantic

Date: 2024-11-28

## Status

Accepted

## Context

OpenAPI file generated starting from an "implementation first" approach need to be versioned. It's important separate definition of the "openAPI" version from "release" version . If for some reason business logic of service has been updated it doesn't mean that need to update openAPI version (if it doesn't change contracts). **"Major"** version of openAPI will be updated only if there is an important change within contract (es. new route has been added or request body's change) while **"Minor"** version will be changed when it's not required that user update its client (es. route's description changed ).
