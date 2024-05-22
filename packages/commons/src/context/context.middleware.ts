import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const contextMiddleware = async (
  req: Request,
  _response: Response,
  next: NextFunction
) => {
  req.ctx = {
    serviceName: "push",
    correlationId: uuidv4(),
  };
  next();
};
