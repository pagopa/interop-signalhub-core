import { z } from "zod";

const APIEndpoint = z
  .string()
  .min(1)
  .transform((s) => s.replace(/\/+$/, ""))
  .brand<"APIEndpoint">();

export const JWTConfig = z
  .object({
    ACCEPTED_AUDIENCE: z.string(),
    WELL_KNOWN_URLS: z
      .string()
      .transform((s) => s.split(","))
      .pipe(z.array(APIEndpoint)),
  })
  .transform((c) => ({
    acceptedAudience: c.ACCEPTED_AUDIENCE,
    wellKnownUrls: c.WELL_KNOWN_URLS,
  }));
export type JWTConfig = z.infer<typeof JWTConfig>;
