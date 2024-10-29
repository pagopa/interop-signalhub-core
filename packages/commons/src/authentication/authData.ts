import { z } from "zod";

const CommaSeparatedStringToArray = <T extends z.ZodType>(t: T) =>
  z
    .string()
    .nonempty()
    .transform((s: string) => s.split(","))
    .pipe(z.array(t));

const StandardJWTClaims = z.object({
  aud: z.union([z.array(z.string()), CommaSeparatedStringToArray(z.string())]),
  exp: z.number(),
  iat: z.number(),
  // All standard claims except "sub", which is not present in UI tokens
  iss: z.string(),
  jti: z.string(),
  nbf: z.number(),
});

export const AuthToken = StandardJWTClaims.merge(
  z.object({
    client_id: z.string().uuid(),
    organizationId: z.string().uuid(),
    sub: z.string(),
  }),
);
export type AuthToken = z.infer<typeof AuthToken>;
