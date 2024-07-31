import { z } from "zod";

export const EserviceEntity = z.object({
  eservice_id: z.string(),
  producer_id: z.string(),
  descriptor_id: z.string(),
  eservice_version: z.number().nullable(),
  event_version_id: z.number(),
  state: z.number(),
  event_stream_id: z.string(),
});

export type EserviceEntity = z.infer<typeof EserviceEntity>;
