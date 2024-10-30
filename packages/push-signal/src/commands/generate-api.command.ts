import { writeFileSync } from "fs";
import * as yaml from "js-yaml";
import { generateOpenAPISpec } from "pagopa-tsrest-openapi-parser";

import { contract } from "../contract/contract.js";

export function generateApi(version: string): void {
  const document = generateOpenAPISpec(
    contract,
    {
      servers: [
        {
          url: `https://api.signalhub.interop.pagopa.it`,
          description: "Push signal Production URL",
        },
      ],
      info: {
        title: "Push signal Service API",
        description: "Exposes the API for Signal-hub push service",
        version,
        license: {
          name: "ISC",
          url: "https://opensource.org/license/isc-license-txt",
        },
        termsOfService:
          "https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti",
      },
    },
    {
      setOperationId: true,
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
            "A bearer token in the format of a JWS and conformed to the specifications included in [RFC8725](https://tools.ietf.org/html/RFC8725).",
        },
      },
    ],
  );

  const openApiDocument = {
    openapi: document.openapi,
    info: document.info,
    servers: document.servers,
    tags: document.tags,
    security: document.security,
    paths: document.paths,
    components: document.components,
  };

  const fileOutputDocument = `../../docs/openAPI/push-signals_${openApiDocument.info.version}.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
}
