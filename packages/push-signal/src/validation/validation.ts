import { Response, NextFunction } from "express";
import { RequestValidationError } from "@ts-rest/express";
import { requestValidationError } from "../models/domain/errors.js";

export const validationErrorHandler =
  () =>
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async (
    err: RequestValidationError,
    _req: unknown,
    res: Response,
    _next: NextFunction
  ) => {
    const errors = {
      context: err.body
        ? "body"
        : err.pathParams
        ? "pathParams"
        : err.query
        ? "query"
        : err.headers
        ? "headers"
        : "unknown",
      issues:
        err.body?.issues ||
        err.pathParams?.issues ||
        err.query?.issues ||
        err.headers?.issues ||
        [],
    };
    const issues = errors.issues.map((e) => e.message).join(" - ");
    const errorMessage = `${errors.context}: ${issues}`;
    return res.status(400).json(requestValidationError(errorMessage));
  };
