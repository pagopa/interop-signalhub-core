import { TypeOf, z } from "zod";

export const Env = z.object({
  PORT: z.coerce.number(),
  WELL_KNOWN_URL: z.coerce.string(),
  ACCEPTED_AUDIENCE: z.coerce.string(),
});

const parsedEnv = Env.safeParse(process.env);

if (!parsedEnv.success) {
  const invalidEnvVars = parsedEnv.error.issues.flatMap((issue) => issue.path);
  console.error("Invalid or missing env vars: " + invalidEnvVars.join(", "));
  process.exit(1);
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof Env> {}
  }
}
