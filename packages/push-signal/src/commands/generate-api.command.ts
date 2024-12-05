import { writeFileSync } from "fs";
import * as yaml from "js-yaml";
import { generateOpenAPISpec } from "pagopa-tsrest-openapi-parser";

import { contract, pathPrefix } from "../contract/contract.js";

const headerCommonResponse = {
  "X-Rate-Limit-Limit": {
    schema: {
      type: "integer"
    },
    description: "Max allowed requests within time interval"
  },
  "X-Rate-Limit-Remaining": {
    schema: {
      type: "integer"
    },
    description: "Remaining requests within time interval"
  },
  "X-Rate-Limit-Interval": {
    schema: {
      type: "integer"
    },
    description:
      "Time interval in milliseconds. Allowed requests will be constantly replenished during the interval. At the end of the interval the max allowed requests will be available"
  },

  "X-RateLimit-Reset": {
    schema: {
      type: "integer"
    },
    description:
      "Time at which the rate limit resets, specified in UTC epoch time"
  }
} as const;

const headerResponseRateLimitExcedeed = {
  "Retry-After": {
    schema: {
      type: "integer"
    },
    description: "How long time to wait before making a new request"
  }
} as const;

export function generateApi(version: string): void {
  const document = generateOpenAPISpec(
    contract,
    {
      servers: [
        {
          url: `https://api.signalhub.interop.pagopa.it${pathPrefix}`,
          description: "Push signal Production URL"
        }
      ],
      info: {
        title: "Push signal Service API",
        description: "Exposes the API for Signal-hub push service",
        version,
        license: {
          name: "ISC",
          url: "https://opensource.org/license/isc-license-txt"
        },
        termsOfService:
          "https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti"
      }
    },
    {
      setOperationId: true
    },
    [
      {
        type: "securitySchemes",
        name: "bearerAuth",
        component: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "A bearer token in the format of a JWS and conformed to the specifications included in [RFC8725](https://tools.ietf.org/html/RFC8725)."
        }
      }
    ],
    pathPrefix,
    {
      pushSignal: {
        200: {
          header: headerCommonResponse
        },
        206: {
          header: headerCommonResponse
        },
        400: {
          header: headerCommonResponse
        },
        403: {
          header: headerCommonResponse
        },
        429: {
          header: {
            ...headerCommonResponse,
            ...headerResponseRateLimitExcedeed
          }
        }
      }
    }
  );

  const openApiDocument = {
    openapi: document.openapi,
    info: document.info,
    servers: document.servers,
    tags: document.tags,
    security: document.security,
    paths: document.paths,
    components: document.components
  };

  const fileOutputDocument = `../../docs/openAPI/push-signals.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
}
