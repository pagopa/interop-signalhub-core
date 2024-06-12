import { z } from "zod";

export const TracingBatchEntity = z.object({
  batch_id: z.string(),
  last_event_id: z.string(),
  type: z.string(),
  state: z.string(),
  tmst_created: z.string(),
});

export type TracingBatchEntity = z.infer<typeof TracingBatchEntity>;

export enum TracingBatchStateEnum {
  ENDED = "ENDED",
  ENDED_WITH_ERROR = "ENDED_WITH_ERROR",
}
