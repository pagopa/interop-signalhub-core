import { z } from "zod";

const StandardJWTClaims = z.object({
  // All standard claims except "sub", which is not present in UI tokens
  iss: z.string(),
  aud: z.string(),
  exp: z.number(),
  nbf: z.number(),
  iat: z.number(),
  jti: z.string(),
});

export const AuthToken = StandardJWTClaims.merge(
  z.object({
    purposeId: z.string().uuid(),
    client_id: z.string().uuid(),
    sub: z.string(),
  })
);
export type AuthToken = z.infer<typeof AuthToken>;

export const SessionData = z.object({
  purposeId: z.string().uuid(),
});
export type SessionData = z.infer<typeof SessionData>;
