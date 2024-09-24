import { writeFileSync } from "fs";
import { generateOpenApiSpecification } from "pagopa-tsrest-openapi-parser";
import * as yaml from "js-yaml";
import { contract } from "../contract/contract.js";

export function generateApi(version: string): void {
  const document = generateOpenApiSpecification(
    contract,
    {
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "A bearer token in the format of a JWS and conformed to the specifications included in [RFC8725](https://tools.ietf.org/html/RFC8725).",
          },
        },
      },

      security: [
        {
          bearerAuth: [],
        },
      ],
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
        contact: {
          name: "PagoPA support",
          url: "https://www.interop.pagopa.it/",
          // email: "Interop-sprint@pagopa.it",
        },
        termsOfService:
          "https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti",
      },
    },
    {
      setOperationId: true,
    }
  );

  console.log("openApiDocumentV2", document);

  const openApiDocument = {
    openapi: document.openapi,
    info: document.info,
    servers: document.servers,
    tags: document.tags,
    security: document.security,
    paths: document.paths,
    components: document.components,
  };

  console.log("risultaot dopo", openApiDocument);
  const fileOutputDocument = `./src/api/push-signals_${openApiDocument.info.version}_.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
}
