import { z } from "zod";
export const Agreement = z.object({
  purposeId: z.string(),
  eServiceId: z.string(),
  producerId: z.string(),
  consumerId: z.string(),
  descriptorId: z.string(),
  state: z.string(),
});

export type Agreement = z.infer<typeof Agreement>;
