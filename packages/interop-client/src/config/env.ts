import { InteropClientConfig } from "signalhub-commons";

const parsedFromEnv = InteropClientConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  // eslint-disable-next-line no-console
  console.error(
    "Invalid or missing env vars on Interop-client package: " +
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: InteropClientConfig = {
  ...parsedFromEnv.data,
};
