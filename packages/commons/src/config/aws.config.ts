import { z } from "zod";

export const AwsConfig = z
  .object({
    AWS_REGION: z.string(),
  })
  .transform((c) => ({
    awsRegion: c.AWS_REGION,
  }));

export type AwsConfig = z.infer<typeof AwsConfig>;
