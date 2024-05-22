import { z } from "zod";
import { SessionData } from "../authentication/authentication.data.js";

export const AppContext = z.object({
  serviceName: z.string(),
  correlationId: z.string(),
  sessionData: SessionData,
});

export const Headers = z.object({
  authorization: z.string().nullish(),
  "x-correlation-id": z.string().nullish(),
});
