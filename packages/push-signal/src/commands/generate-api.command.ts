import { writeFileSync } from "fs";
import * as yaml from "js-yaml";
import { generateOpenAPISpec } from "pagopa-tsrest-openapi-parser";

import { contract } from "../contract/contract.js";

export function generateApi(version: string): void {
  const document = generateOpenAPISpec(
    contract,
    {
      info: {
        description: "Exposes the API for Signal-hub push service",
        license: {
          name: "ISC",
          url: "https://opensource.org/license/isc-license-txt",
        },
        termsOfService:
          "https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti",
        title: "Push signal Service API",
        version,
      },
      servers: [
        {
          description: "Push signal Production URL",
          url: `https://api.signalhub.interop.pagopa.it`,
        },
      ],
    },
    {
      setOperationId: true,
    },
    [
      {
        component: {
          bearerFormat: "JWT",
          description:
            "A bearer token in the format of a JWS and conformed to the specifications included in [RFC8725](https://tools.ietf.org/html/RFC8725).",
          scheme: "bearer",
          type: "http",
        },
        name: "bearerAuth",
        type: "securitySchemes",
      },
    ],
  );

  const openApiDocument = {
    components: document.components,
    info: document.info,
    openapi: document.openapi,
    paths: document.paths,
    security: document.security,
    servers: document.servers,
    tags: document.tags,
  };

  const fileOutputDocument = `../../docs/openAPI/push-signals_${openApiDocument.info.version}.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
}
