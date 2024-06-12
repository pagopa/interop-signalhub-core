import { Response, NextFunction } from "express";
import { RequestValidationError } from "@ts-rest/express";
import { requestValidationError } from "../model/domain/errors.js";
import { ServerInferRequest } from "@ts-rest/core";
import { contract } from "../contract/contract.js";

type PullRequest = ServerInferRequest<typeof contract.pullSignal>;

export const validationErrorHandler = () => {
  return async (
    err: RequestValidationError,
    _req: PullRequest,
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
};
