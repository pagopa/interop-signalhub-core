import { z } from "zod";

const CommaSeparatedStringToArray = <T extends z.ZodType>(t: T) =>
  z
    .string()
    .nonempty()
    .transform((s: string) => s.split(","))
    .pipe(z.array(t));

const StandardJWTClaims = z.object({
  // All standard claims except "sub", which is not present in UI tokens
  iss: z.string(),
  aud: z.union([z.array(z.string()), CommaSeparatedStringToArray(z.string())]),
  exp: z.number(),
  nbf: z.number(),
  iat: z.number(),
  jti: z.string()
});

export const AuthToken = StandardJWTClaims.merge(
  z.object({
    organizationId: z.string().uuid(),
    client_id: z.string().uuid(),
    sub: z.string()
  })
);
export type AuthToken = z.infer<typeof AuthToken>;
