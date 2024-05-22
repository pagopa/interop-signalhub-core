import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logging/index.js";

export const contextMiddleware = async (
  req: Request,
  _response: Response,
  next: NextFunction
) => {
  req.ctx = {
    serviceName: "push",
    correlationId: uuidv4(),
  };
  const loggerInstance = logger({
    serviceName: req.ctx.serviceName,
    correlationId: req.ctx.correlationId,
  });
  loggerInstance.info("Context init");
  next();
};
