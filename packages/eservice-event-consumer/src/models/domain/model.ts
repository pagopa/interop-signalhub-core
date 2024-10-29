import { z } from "zod";

export const EserviceDescriptorEntity = z.object({
  descriptor_id: z.string(),
  state: z.string(),
});

export const EserviceEntity = z.object({
  descriptors: z.array(EserviceDescriptorEntity),
  eservice_id: z.string(),
  event_stream_id: z.string(),
  event_version_id: z.number(),
});

export const EserviceV2Entity = z.object({
  descriptors: z.array(EserviceDescriptorEntity),
  eservice_id: z.string(),
  event_stream_id: z.string(),
  event_version_id: z.number(),
  isSignalHubEnabled: z.boolean().optional(),
  producer_id: z.string(),
});

export type EserviceEntity = z.infer<typeof EserviceEntity>;
export type EserviceDescriptorEntity = z.infer<typeof EserviceDescriptorEntity>;
export type EserviceV2Entity = z.infer<typeof EserviceV2Entity>;
