import { z } from "zod";

export const EserviceDescriptorEntity = z.object({
  descriptor_id: z.string(),
  state: z.string(),
});

export const EserviceEntity = z.object({
  eservice_id: z.string(),
  descriptors: z.array(EserviceDescriptorEntity),
  event_version_id: z.number(),
  event_stream_id: z.string(),
});

export type EserviceEntity = z.infer<typeof EserviceEntity>;
export type EserviceDescriptorEntity = z.infer<typeof EserviceDescriptorEntity>;
