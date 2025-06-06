import { Command, Option } from "commander";
import { generateApi } from "../src/commands/generate-api.command.js";
import { majorMinorRegex } from "pagopa-signalhub-commons";


function isValidSemanticVersion(version: string): boolean {
  return majorMinorRegex.test(version);
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
