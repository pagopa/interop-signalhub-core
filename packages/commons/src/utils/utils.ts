import { Request, Response, NextFunction } from "express";

export function getCurrentDate(): string {
  return new Date().toISOString();
}

export function skipForUrl(
  path: string,
  middleware: (
    req: Request,
    response: Response,
    next: NextFunction
  ) => Promise<void | Response>
) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
}
