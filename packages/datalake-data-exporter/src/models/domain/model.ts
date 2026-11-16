import { Signal } from "pagopa-signalhub-commons";
import { z } from "zod";

export const ExportedSignal = Signal.pick({
  signalId: true,
  eserviceId: true,
  signalType: true
}).extend({
  tmstInsert: z.date()
});
export type ExportedSignal = z.infer<typeof ExportedSignal>;
