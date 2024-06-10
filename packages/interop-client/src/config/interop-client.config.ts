import { z } from "zod";

export const InteropClientConfig = z
  .object({
    KEY_ID: z.string(),
    SUBJECT: z.string(),
    ISSUER: z.string(),
    AUDIENCE: z.string(),
    PURPOSE_ID: z.string(),
    URL_AUTH_TOKEN: z.string(),
    GRANT_TYPE: z.string(),
    CLIENT_ID: z.string(),
    GATEWAY_URL: z.string(),
    EXPIRES_IN_SEC: z.coerce.number(),
    KMS_KEY_ID: z.string(),
    KMS_REGION: z.string(),
  })
  .transform((c) => ({
    keyId: c.KEY_ID,
    subject: c.SUBJECT,
    issuer: c.ISSUER,
    audience: c.AUDIENCE,
    purposeId: c.PURPOSE_ID,
    urlAuthToken: c.URL_AUTH_TOKEN,
    grantType: c.GRANT_TYPE,
    clientId: c.CLIENT_ID,
    gatewayUrl: c.GATEWAY_URL,
    expiresInSec: c.EXPIRES_IN_SEC,
    kmsKeyId: c.KMS_KEY_ID,
    kmsRegion: c.KMS_REGION,
  }));

const parsedFromEnv = InteropClientConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  console.error(
    "Invalid or missing env vars on Interop-client package: " +
      invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export type InteropClientConfig = z.infer<typeof InteropClientConfig>;

export const config: InteropClientConfig = {
  ...parsedFromEnv.data,
};
