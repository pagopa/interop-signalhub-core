import { writeFileSync } from "fs";
// import { generateOpenApi } from "@ts-rest/open-api";
import {
  // generateComponentFromContractOpenApi,
  generateOpenApiSpecification,
} from "pagopa-tsrest-openapi-parser";
import * as yaml from "js-yaml";
import { contract } from "../contract/contract.js";

export function generateApi(version: string): void {
  // const openApiDocument = generateOpenApi(
  //   contract,
  //   {
  //     components: {
  //       securitySchemes: {
  //         bearerAuth: {
  //           type: "http",
  //           scheme: "bearer",
  //           bearerFormat: "JWT",
  //           description:
  //             "A bearer token in the format of a JWS and conformed to the specifications included in [RFC8725](https://tools.ietf.org/html/RFC8725).",
  //         },
  //       },
  //     },

  //     security: [
  //       {
  //         bearerAuth: [],
  //       },
  //     ],
  //     servers: [
  //       {
  //         url: "/signals",
  //         description: "Push signal data",
  //       },
  //     ],
  //     info: {
  //       title: "Push signal Service API",
  //       version,
  //       license: {
  //         name: "ISC",
  //         url: "https://opensource.org/license/isc-license-txt",
  //       },
  //       contact: {
  //         name: "PagoPA support",
  //         url: "https://github.com/pagopa/interop-signalhub-core/issues",
  //         email: "Interop-sprint@pagopa.it",
  //       },
  //       termsOfService:
  //         "https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti",
  //     },
  //   },
  //   {
  //     setOperationId: true,
  //   }
  // );

  const openApiDocumentV2 = generateOpenApiSpecification(
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
        version,
        license: {
          name: "ISC",
          url: "https://opensource.org/license/isc-license-txt",
        },
        contact: {
          name: "PagoPA support",
          url: "https://github.com/pagopa/interop-signalhub-core/issues",
          email: "Interop-sprint@pagopa.it",
        },
        termsOfService:
          "https://docs.pagopa.it/interoperabilita-1/normativa-e-approfondimenti",
      },
    },
    {
      setOperationId: true,
    }
  );
  const fileOutputDocument = `./src/api/push-signals_${openApiDocumentV2.info.version}_.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(openApiDocumentV2));
}
