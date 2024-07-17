import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "../contract/contract.js";
import { writeFileSync } from "fs";
import * as yaml from "js-yaml";

export function generateApi(version: string) {
  const openApiDocument = generateOpenApi(
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
          url: "/pull-signal",
          description: "Pull signal data",
        },
      ],
      info: {
        title: "Pull signal Service API",
        version,
        license: {
          name: "ISC",
          url: "https://opensource.org/license/isc-license-txt",
        },
      },
    },
    {
      setOperationId: true,
    }
  );

  const fileOutputDocument = `./src/api/pull-signals_${openApiDocument.info.version}_.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
}
