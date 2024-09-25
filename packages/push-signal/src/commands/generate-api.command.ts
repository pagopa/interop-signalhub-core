import { writeFileSync } from "fs";
import { generateOpenAPISpec } from "pagopa-tsrest-openapi-parser";
import * as yaml from "js-yaml";
import { contract } from "../contract/contract.js";

export function generateApi(version: string): void {
  const document = generateOpenAPISpec(
    contract,
    {
      servers: [
        {
          url: "/signals",
          description: "Push signal data",
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
    ]
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

  const fileOutputDocument = `./src/api/push-signals_${openApiDocument.info.version}_.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
}
