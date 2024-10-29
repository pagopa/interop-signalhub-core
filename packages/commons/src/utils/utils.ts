import { NextFunction, Request, Response } from "express";

export function getCurrentDate(): string {
  return new Date().toISOString();
}

type MiddlewareFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export function skipForUrl(
  path: string,
  middleware: MiddlewareFn,
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req: Request, res: Response, next: NextFunction) {
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
}
