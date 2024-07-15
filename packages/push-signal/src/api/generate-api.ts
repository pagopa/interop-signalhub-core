import { Command, Option } from "@commander-js/extra-typings";
import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "../contract/contract.js";
import { writeFileSync } from "fs";
import * as yaml from "js-yaml";

const semanticVersionRegex = /^([1-9]\d*|0)(\.(([1-9]\d*)|0)){2}$/;

function isValidSemanticVersion(version: string): boolean {
  const res = semanticVersionRegex.test(version);
  return res;
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

    if (!isValidSemanticVersion(options.version!)) {
      throw new Error("Invalid version format. Please use semantic versioning");
    }
  })
  .action(async (options) => {
    const { version } = options;
    const openApiDocument = generateOpenApi(contract, {
      info: {
        title: "Push signal Service API",
        version: version!,
      },
    });

    const fileOutputDocument = `./src/api/push-signals_${openApiDocument.info.version}_.yaml`;
    writeFileSync(fileOutputDocument, yaml.dump(openApiDocument));
  })
  .parse(process.argv);
