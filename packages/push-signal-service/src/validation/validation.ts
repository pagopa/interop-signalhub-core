import { Response, NextFunction } from "express";
import { RequestValidationError } from "@ts-rest/express";
import { ZodError } from "zod";
import { requestValidationError } from "../model/domain/errors.js";
import { ServerInferRequest } from "@ts-rest/core";
import { contract } from "../contract/contract.js";

type PushRequest = ServerInferRequest<typeof contract.pushSignal>;

export const validationErrorHandler = () => {
  return async (
    err: RequestValidationError,
    _req: PushRequest,
    res: Response,
    _next: NextFunction
  ) => {
    _req;
    const error = err.body as ZodError;
    const errorsString = error.issues.map((e) => e.message).join(" - ");
    return res.status(400).json(requestValidationError(errorsString));
  };
};
