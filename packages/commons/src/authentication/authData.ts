import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  jti: z.string(),
});

export const AuthToken = StandardJWTClaims.merge(
  z.object({
    purposeId: z.string().uuid(),
    client_id: z.string().uuid(),
    sub: z.string(),
  }),
);
export type AuthToken = z.infer<typeof AuthToken>;

export const AuthData = z.object({
  purposeId: z.string().uuid(),
  aud: z.union([z.array(z.string()), CommaSeparatedStringToArray(z.string())]),
});
export type AuthData = z.infer<typeof AuthData>;

export const getAuthDataFromToken = (token: AuthToken): AuthData => ({
  purposeId: token.purposeId,
  aud: token.aud,
});
