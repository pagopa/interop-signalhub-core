import { z } from "zod";

export const InteropClientConfig = z
  .object({
    KEY_ID: z.string(),
    SUBJECT: z.string(),
    ISSUER: z.string(),
    AUDIENCE: z.string(),
    PURPOSE_ID: z.string(),
    PRIVATE_KEY: z.string(),
    URL_AUTH_TOKEN: z.string(),
    GRANT_TYPE: z.string(),
    CLIENT_ID: z.string(),
  })
  .transform((c) => ({
    keyId: c.KEY_ID,
    subject: c.SUBJECT,
    issuer: c.ISSUER,
    audience: c.AUDIENCE,
    purposeId: c.PURPOSE_ID,
    privateKey: c.PRIVATE_KEY,
    urlAuthToken: c.URL_AUTH_TOKEN,
    grantType: c.GRANT_TYPE,
    clientId: c.CLIENT_ID,
  }));

export type InteropClientConfig = z.infer<typeof InteropClientConfig>;

export const config: InteropClientConfig = {
  ...InteropClientConfig.parse(process.env),
};
