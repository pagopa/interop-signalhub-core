import { z } from "zod";
import { AuthData } from "../authentication/authData.js";

export const AppContext = z.object({
  serviceName: z.string(),
  correlationId: z.string(),
  authData: AuthData,
});

export const Headers = z.object({
  authorization: z.string().nullish(),
  "x-correlation-id": z.string().nullish(),
});
