import { AppContext } from "../../src/config/express.config.ts";

declare global {
  namespace Express {
    interface Request {
      ctx: AppContext;
    }
  }
}
