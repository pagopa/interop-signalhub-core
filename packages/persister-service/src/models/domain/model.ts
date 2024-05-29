import { Signal } from "signalhub-commons";
import { z } from "zod";

export const DeadSignal = Signal.merge(
  z.object({
    errorReason: z.string(),
  })
);

export type DeadSignal = z.infer<typeof DeadSignal>;
