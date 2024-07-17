import { exec } from "child_process";
import { Command, Option } from "commander";

const semanticVersionRegex = /^([1-9]\d*|0)(\.(([1-9]\d*)|0)){2}$/;

function isValidSemanticVersion(version: string): boolean {
  return semanticVersionRegex.test(version);
}

new Command()
  .addOption(
    new Option(
      "-v, --version <string>",
      "Pull signal validate openAPI"
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
    const fileOutputDocument = `./src/api/pull-signals_${version}_.yaml`;
    exec(`npx @redocly/cli lint ${fileOutputDocument}`, (error, stdout) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        throw error;
      }
      console.log(`Stdout: ${stdout}`);
    });
  })
  .parse(process.argv);
