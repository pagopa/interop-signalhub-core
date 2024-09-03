import { writeFileSync } from "fs";
import { generateOpenApi } from "@ts-rest/open-api";
import * as yaml from "js-yaml";
import { contract } from "../contract/contract.js";

export function generateApi(version: string): void {
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
          name: "API Support",
          url: "http://www.example.com/support",
          email: "support@example.com",
        },
        termsOfService: "http://swagger.io/terms/",
      },
    },
    {
      setOperationId: true,
    }
  );

  const fileOutputDocument = `./src/api/push-signals_${openApiDocument.info.version}_.yaml`;
  writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
}
