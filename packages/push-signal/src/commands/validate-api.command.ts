import { exec } from "child_process";

export function validateApi(version: string): void {
  const fileOutputDocument = `./src/api/push-signals_${version}_.yaml`;
  exec(`npx @redocly/cli lint  ${fileOutputDocument}`, (error, stdout) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      throw error;
    }
    // eslint-disable-next-line no-console
    console.log(`Stdout: ${stdout}`);
  });
}
