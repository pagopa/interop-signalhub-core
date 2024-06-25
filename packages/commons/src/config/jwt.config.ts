import { z } from "zod";

export const JWTConfig = z
  .object({
    WELL_KNOWN_URLS: z.coerce.string(),
    ACCEPTED_AUDIENCE: z.coerce.string(),
  })
  .transform((c) => ({
    wellKnownUrl: c.WELL_KNOWN_URLS,
    acceptedAudience: c.ACCEPTED_AUDIENCE,
  }));
export type JWTConfig = z.infer<typeof JWTConfig>;

export const jwtConfig: () => JWTConfig = () => JWTConfig.parse(process.env);
