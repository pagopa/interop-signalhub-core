import { NextFunction, Request, Response } from "express";
import { correlationId } from "../utils/index.js";

export const contextMiddleware =
  (serviceName: string) =>
  async (
    req: Request,
    _response: Response,
    next: NextFunction
  ): Promise<void> => {
    // eslint-disable-next-line functional/immutable-data
    req.ctx = {
      serviceName,
      correlationId: correlationId(),
      sessionData: { purposeId: "" },
    };
    next();
  };
