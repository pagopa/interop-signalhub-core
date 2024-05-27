import { AppContext } from "../commons";

declare global {
  namespace Express {
    interface Request {
      ctx: AppContext;
    }
  }
}
