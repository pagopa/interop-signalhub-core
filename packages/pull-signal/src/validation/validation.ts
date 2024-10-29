import { RequestValidationError } from "@ts-rest/express";
import { Request, Response } from "express";
import { Logger } from "pagopa-signalhub-commons";

import { requestValidationError } from "../model/domain/errors.js";

export const validationErrorHandler =
  (logger: Logger) =>
  async (
    err: RequestValidationError,
    _req: Request,
    res: Response,
  ): Promise<Response> => {
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
    logger.warn(
      `Response 400 - error validation message (body, path, query, headers): ${errorMessage}`,
    );
    return res.status(400).json(requestValidationError(errorMessage));
  };
