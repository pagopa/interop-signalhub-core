import { Signal } from "pagopa-signalhub-commons";
import { z } from "zod";

export const SignalDeleted = Signal.extend({
  tmstInsert: z.date().default(new Date()),
});
export type SignalDeleted = z.infer<typeof SignalDeleted>;
