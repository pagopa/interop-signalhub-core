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

export const EserviceV2Entity = z.object({
  eservice_id: z.string(),
  producer_id: z.string(),
  descriptors: z.array(EserviceDescriptorEntity),
  isSignalHubEnabled: z.boolean().optional(),
  event_version_id: z.number(),
  event_stream_id: z.string(),
});

export type EserviceEntity = z.infer<typeof EserviceEntity>;
export type EserviceDescriptorEntity = z.infer<typeof EserviceDescriptorEntity>;
export type EserviceV2Entity = z.infer<typeof EserviceV2Entity>;
