import { z } from "zod";

const APIEndpoint = z
  .string()
  .min(1)
  .transform((s) => s.replace(/\/+$/, ""))
  .brand<"APIEndpoint">();

export const JWTConfig = z
  .object({
    WELL_KNOWN_URLS: z
      .string()
      .transform((s) => s.split(","))
      .pipe(z.array(APIEndpoint)),
    ACCEPTED_AUDIENCE: z.string()
  })
  .transform((c) => ({
    wellKnownUrls: c.WELL_KNOWN_URLS,
    acceptedAudience: c.ACCEPTED_AUDIENCE
  }));
export type JWTConfig = z.infer<typeof JWTConfig>;
