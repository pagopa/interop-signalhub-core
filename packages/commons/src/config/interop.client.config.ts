import { z } from "zod";

export const InteropClientAssertionConfig = z
  .object({
    KMS_KEY_ID: z.string(),
    KEY_ID: z.string(),
    ISSUER: z.string(),
    SUBJECT: z.string(),
    AUDIENCE: z.string(),
    EXPIRES_IN_SEC: z.coerce.number(),
  })
  .transform((c) => ({
    kmsKeyId: c.KMS_KEY_ID,
    keyId: c.KEY_ID,
    issuer: c.ISSUER,
    subject: c.SUBJECT,
    audience: c.AUDIENCE,
    expiresInSec: c.EXPIRES_IN_SEC,
  }));

export const VoucherClientConfig = z
  .object({
    PURPOSE_ID: z.string(),
    URL_AUTH_TOKEN: z.string(),
    GRANT_TYPE: z.string(),
    CLIENT_ID: z.string(),
    GATEWAY_URL: z.string(),
  })
  .transform((c) => ({
    purposeId: c.PURPOSE_ID,
    urlAuthToken: c.URL_AUTH_TOKEN,
    grantType: c.GRANT_TYPE,
    clientId: c.CLIENT_ID,
    gatewayUrl: c.GATEWAY_URL,
  }));

export const InteropClientConfig =
  InteropClientAssertionConfig.and(VoucherClientConfig);

export type InteropVoucherConfig = z.infer<typeof VoucherClientConfig>;
export type InteropClientAssertionConfig = z.infer<
  typeof InteropClientAssertionConfig
>;
export type InteropClientConfig = z.infer<typeof InteropClientConfig>;
