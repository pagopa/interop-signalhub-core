import { NextFunction, Request, Response } from "express";

import { correlationId } from "../utils/index.js";

export const contextMiddleware =
  (serviceName: string) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    req.ctx = {
      correlationId: correlationId(),
      serviceName,
      sessionData: { organizationId: "" },
    };
    next();
  };
