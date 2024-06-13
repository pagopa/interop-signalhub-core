import { AppContext } from "./domain/model.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      ctx: AppContext;
    }
  }
}
