import { z } from "zod";
import { Signal } from "signalhub-commons";

export const SignalDeleted = Signal.extend({
  tmstInsert: z.date().default(new Date()),
});
export type SignalDeleted = z.infer<typeof SignalDeleted>;
