import { writeFileSync } from "fs";
import { generateOpenAPISpec } from "pagopa-tsrest-openapi-parser";
import * as yaml from "js-yaml";
import { contract } from "../contract/contract.js";

export function generateApi(version: string): void {
  const openApiDocument = generateOpenAPISpec(
    contract,
    {
      servers: [
        {
          url: "/signals",
          description: "Pull signal data",
        },
      ],
      info: {
        title: "Pull signal Service API",
        description: "Exposes the API for Signal-hub pull service",

        version,
        termsOfService:
          "https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti",
        license: {
          name: "ISC",
          url: "https://opensource.org/license/isc-license-txt",
        },
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

  const document = {
    openapi: openApiDocument.openapi,
    info: openApiDocument.info,
    servers: openApiDocument.servers,
    tags: openApiDocument.tags,
    security: openApiDocument.security,
    paths: openApiDocument.paths,
    components: openApiDocument.components,
  };
  const fileOutputDocument = `./src/api/pull-signals_${document.info.version}_.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(document));
}
