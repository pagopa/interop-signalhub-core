import { z } from "zod";

export const DelegationId = z.string().uuid().brand("DelegationId");
export type DelegationId = z.infer<typeof DelegationId>;

export const DelegateId = z.string().uuid().brand("DelegateId");
export type DelegateId = z.infer<typeof DelegateId>;

export const DelegatorId = z.string().uuid().brand("DelegatorId");
export type DelegatorId = z.infer<typeof DelegatorId>;
