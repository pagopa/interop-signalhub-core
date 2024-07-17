import { writeFileSync } from "fs";
import { Command, Option } from "commander";
import { generateOpenApi } from "@ts-rest/open-api";
import * as yaml from "js-yaml";
import { contract } from "../contract/contract.js";

const semanticVersionRegex = /^([1-9]\d*|0)(\.(([1-9]\d*)|0)){2}$/;

function isValidSemanticVersion(version: string): boolean {
  return semanticVersionRegex.test(version);
}

new Command()
  .addOption(
    new Option(
      "-v, --version <string>",
      "Push signal API version"
    ).makeOptionMandatory()
  )
  .hook("preAction", async (command) => {
    const options = command.opts();

    if (!isValidSemanticVersion(options.version)) {
      throw new Error("Invalid version format. Please use semantic versioning");
    }
  })
  .action(async (options) => {
    const { version } = options;
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
            url: "/push-signal",
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
        },
      },
      {
        setOperationId: true,
      }
    );

    const fileOutputDocument = `./src/api/push-signals_${openApiDocument.info.version}_.yaml`;
    writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
  })
  .parse(process.argv);
