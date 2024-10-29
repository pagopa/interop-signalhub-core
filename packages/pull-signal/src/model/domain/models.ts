import { z } from "zod";
export const Agreement = z.object({
  consumerId: z.string(),
  descriptorId: z.string(),
  eServiceId: z.string(),
  producerId: z.string(),
  purposeId: z.string(),
  state: z.string(),
});

export type Agreement = z.infer<typeof Agreement>;
