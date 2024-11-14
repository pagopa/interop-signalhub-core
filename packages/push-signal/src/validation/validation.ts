import { RequestValidationError } from "@ts-rest/express";
import { Request, Response } from "express";
import { logger } from "pagopa-signalhub-commons";

import { requestValidationError } from "../models/domain/errors.js";

export const validationErrorHandler =
  () => async (err: RequestValidationError, req: Request, res: Response) => {
    const { serviceName, correlationId } = req.ctx;
    const log = logger({ serviceName, correlationId });
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
        []
    };
    const issues = errors.issues.map((e) => e.message).join(" - ");
    const errorMessage = `${errors.context}: ${issues}`;
    log.warn(
      `Response 400 - error validation message (body, path, query, headers): ${errorMessage}`
    );
    return res.status(400).json(requestValidationError(errorMessage));
  };
