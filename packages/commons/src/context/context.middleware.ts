import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logging/index.js";

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
