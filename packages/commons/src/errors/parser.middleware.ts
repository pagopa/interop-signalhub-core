import { NextFunction, Request, Response } from "express";

import { correlationId } from "../index.js";
import { logger } from "../logging/index.js";
import { jsonMalformed } from "./index.js";

export const parserErrorMiddlware =
  (serviceName: string) =>
  (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const log = logger({
      serviceName: serviceName,
      correlationId: correlationId()
    });
    log.info(`Request ${req.method} ${req.url}`);

    if (err instanceof SyntaxError) {
      log.warn(`Response 400 - JSON error parsing message: ${err.message}`);
      return res.status(400).json(jsonMalformed);
    }
    next();
    return;
  };
