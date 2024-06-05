import { z } from "zod";

export const InteropClientConfig = z
  .object({
    KEY_ID: z.string(),
    SUBJECT: z.string(),
    ISSUER: z.string(),
    AUDIENCE: z.string(),
    PURPOSE_ID: z.string(),
    PRIVATE_KEY: z.string(),
  })
  .transform((c) => ({
    keyId: c.KEY_ID,
    subject: c.SUBJECT,
    issuer: c.ISSUER,
    audience: c.AUDIENCE,
    purposeId: c.PURPOSE_ID,
  }));

export type InteropClientConfig = z.infer<typeof InteropClientConfig>;
