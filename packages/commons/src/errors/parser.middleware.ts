import { NextFunction, Request, Response } from "express";

import { Logger } from "../logging/index.js";
import { jsonMalformed } from "./index.js";

export const parserErrorMiddlware =
  (logger: Logger) =>
  (err: unknown, _request: Request, response: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
      logger.warn(`Response 400 - JSON error parsing message: ${err.message}`);
      return response.status(400).json(jsonMalformed);
    }
    next();
    return;
  };
