import { EServiceId } from "pagopa-signalhub-commons";
import { z } from "zod";

import { DelegateId, DelegationId, DelegatorId } from "../brandedIds.js";

export const DelegationV2Entity = z.object({
  delegation_id: DelegationId,
  delegate_id: DelegateId,
  delegator_id: DelegatorId,
  e_service_id: EServiceId,
  state: z.string(),
  kind: z.string(),
  event_version_id: z.number(),
  event_stream_id: z.string()
});

export type DelegationV2Entity = z.infer<typeof DelegationV2Entity>;
