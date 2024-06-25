import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

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
    next();
  };
