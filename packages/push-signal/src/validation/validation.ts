import { Response, NextFunction } from "express";
import { RequestValidationError } from "@ts-rest/express";
import { ServerInferRequest } from "@ts-rest/core";
import { requestValidationError } from "../models/domain/errors.js";
import { contract } from "../contract/contract.js";

type PushRequest = ServerInferRequest<typeof contract.pushSignal>;

export const validationErrorHandler =
  () =>
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async (
    err: RequestValidationError,
    _req: PushRequest,
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
