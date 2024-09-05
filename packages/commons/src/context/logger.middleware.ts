import { NextFunction, Request, Response } from "express";
import { logger } from "../index.js";

export const loggerMiddleware =
  () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const log = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });

    log.info(`Request ${req.method} ${req.url}`);

    res.on("finish", () => {
      log.info(`Response ${res.statusCode} ${res.statusMessage}`);
    });

    next();
  };
