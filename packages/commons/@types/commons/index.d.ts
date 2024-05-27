import { z } from "zod";
import { AppContext, Headers } from "../../src/config/express.config.ts";

export type Headers = z.infer<typeof Headers>;
export type AppContext = z.infer<typeof AppContext>;
