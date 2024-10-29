import { writeFileSync } from "fs";
import * as yaml from "js-yaml";
import { generateOpenAPISpec } from "pagopa-tsrest-openapi-parser";

import { contract } from "../contract/contract.js";

export function generateApi(version: string): void {
  const openApiDocument = generateOpenAPISpec(
    contract,
    {
      info: {
        description: "Exposes the API for Signal-hub pull service",
        license: {
          name: "ISC",
          url: "https://opensource.org/license/isc-license-txt",
        },

        termsOfService:
          "https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti",
        title: "Pull signal Service API",
        version,
      },
      servers: [
        {
          description: "Pull signal Production URL",
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

  const document = {
    components: openApiDocument.components,
    info: openApiDocument.info,
    openapi: openApiDocument.openapi,
    paths: openApiDocument.paths,
    security: openApiDocument.security,
    servers: openApiDocument.servers,
    tags: openApiDocument.tags,
  };
  const fileOutputDocument = `../../docs/openAPI/pull-signals_${document.info.version}.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(document));
}
