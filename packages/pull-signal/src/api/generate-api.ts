import { writeFileSync } from "fs";
import { Command, Option } from "@commander-js/extra-typings";
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
      "Pull signal API version"
    ).makeOptionMandatory()
  )
  .hook("preAction", async (command) => {
    const options = command.opts();

    if (!isValidSemanticVersion(options.version!)) {
      throw new Error("Invalid version format. Please use semantic versioning");
    }
  })
  .action(async (options) => {
    const { version } = options;
    const openApiDocument = generateOpenApi(contract, {
      info: {
        title: "Pull signal Service API",
        version: version!,
      },
    });

    const fileOutputDocument = `./src/api/pull-signals_${openApiDocument.info.version}_.yaml`;
    writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
  })
  .parse(process.argv);
