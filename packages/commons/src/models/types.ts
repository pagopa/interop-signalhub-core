import { AppContext } from "./domain/model.js";

declare global {
  namespace Express {
    interface Request {
      ctx: AppContext;
    }
  }
}
