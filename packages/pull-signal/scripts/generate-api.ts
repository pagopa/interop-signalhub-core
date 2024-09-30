import { Command, Option } from "commander";
import { generateApi } from "../src/commands/generate-api.command.js";

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

    if (!isValidSemanticVersion(options.version)) {
      throw new Error("Invalid version format. Please use semantic versioning");
    }
  })
  .action(async (options) => {
    generateApi(options.version);
  })
  .parse(process.argv);
