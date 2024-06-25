import { z } from "zod";

export const JWTConfig = z
  .object({
    WELL_KNOWN_URL: z.string(),
    ACCEPTED_AUDIENCE: z.string(),
  })
  .transform((c) => ({
    wellKnownUrl: c.WELL_KNOWN_URL,
    acceptedAudience: c.ACCEPTED_AUDIENCE,
  }));
export type JWTConfig = z.infer<typeof JWTConfig>;

export const jwtConfig: () => JWTConfig = () => process.env as JWTConfig;
