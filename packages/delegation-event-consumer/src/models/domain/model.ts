import { z } from "zod";

export const DelegationV2Entity = z.object({
  id: z.string(),
  delegate_id: z.string(),
  delegator_id: z.string(),
  e_service_id: z.string(),
  state: z.string(),
  kind: z.string(),
  event_version_id: z.number(),
  event_stream_id: z.string()
});

export type DelegationV2Entity = z.infer<typeof DelegationV2Entity>;
