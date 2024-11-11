import { NextFunction, Request, Response } from "express";

import { logger } from "../logging/index.js";
import { jsonMalformed } from "./index.js";

export const parserErrorMiddlware = (
  err: unknown,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (err instanceof SyntaxError) {
    const log = logger({
      serviceName: request.ctx?.serviceName,
      correlationId: request.ctx?.correlationId,
      eserviceId: request.params.eserviceId
    });
    // eslint-disable-next-line no-console
    console.log(request.ctx);
    log.warn(`Response 400 - JSON error parsing message: ${err.message}`);
    return response.status(400).json(jsonMalformed);
  }
  next();
  return;
};
