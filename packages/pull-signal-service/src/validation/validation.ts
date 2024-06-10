import { Request, Response, NextFunction } from "express";
import { RequestValidationError } from "@ts-rest/express";
import { ZodError } from "zod";
import { requestValidationError } from "../model/domain/errors.js";

export const validationErrorHandler = () => {
  return async (
    err: RequestValidationError,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const error = err.body as ZodError;
    const errorsString = error.issues.map((e) => e.message).join(" - ");
    return res.status(400).json(requestValidationError(errorsString));
  };
};
