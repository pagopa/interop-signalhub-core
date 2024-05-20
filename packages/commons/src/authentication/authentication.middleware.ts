import { Response, Request, NextFunction } from "express";

export const authenticationMiddleware = (
  _req: Request,
  _response: Response,
  next: NextFunction
) => {
  console.log("Passo dal middleware!");
  next();
};
