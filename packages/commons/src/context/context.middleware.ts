import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logging/index.js";

export const contextMiddleware = (serviceName: string) => {
  return async (req: Request, _response: Response, next: NextFunction) => {
    req.ctx = {
      serviceName,
      correlationId: uuidv4(),
      sessionData: { purposeId: "" },
    };

    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    loggerInstance.info("Context init");
    loggerInstance.info(`request ${req.method} ${req.url}`);
    next();
  };
};
