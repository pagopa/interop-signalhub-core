/* eslint-disable max-classes-per-file */
import { P, match } from "ts-pattern";
import { ZodError } from "zod";
// import { fromZodError } from "zod-validation-error";

export class ApiError<T> extends Error {
  /* TODO consider refactoring how the code property is used:
    From the API point of view, it is an info present only in the single error
    in the errors array - not in the main Problem response.
    However, at the moment we need it because it is used around the codebase to
    map ApiError to a specific HTTP status code.
    */
  public code: T;
  public title: string;
  public detail: string;
  public errors: Array<{ code: T; detail: string }>;
  public correlationId?: string;

  constructor({
    code,
    title,
    detail,
    correlationId,
    errors,
  }: {
    code: T;
    title: string;
    detail: string;
    correlationId?: string;
    errors?: Error[];
  }) {
    super(detail);
    this.code = code;
    this.title = title;
    this.detail = detail;
    this.correlationId = correlationId;
    this.errors =
      errors && errors.length > 0
        ? errors.map((e) => ({ code, detail: e.message }))
        : [{ code, detail }];
  }
}

export class InternalError<T> extends Error {
  public code: T;
  public detail: string;

  constructor({ code, detail }: { code: T; detail: string }) {
    super(detail);
    this.code = code;
    this.detail = detail;
  }
}

export type ProblemError = {
  code: string;
  detail: string;
};

export type Problem = {
  type: string;
  status: number;
  title: string;
  correlationId?: string;
  detail: string;
  errors: ProblemError[];
  toString: () => string;
};

export type MakeApiProblemFn<T extends string> = (
  error: unknown,
  httpMapper: (apiError: ApiError<T | CommonErrorCodes>) => number,
  logger: {
    error: (message: string) => void;
    warn: (message: string) => void;
  },
  correlationId: string,
) => Problem;

const makeProblemLogString = (
  problem: Problem,
  originalError: unknown,
): string => {
  const errorsString = problem.errors.map((e) => e.detail).join(" - ");
  return `ERROR - title: ${problem.title} - detail: ${problem.detail} - errors: ${errorsString} - original error: ${originalError}`;
};

export function makeApiProblemBuilder<T extends string>(errors: {
  [K in T]: string;
}): MakeApiProblemFn<T> {
  const allErrors = { ...errorCodes, ...errors };
  return (error, getErrorFromStatus, logger, correlationId) => {
    const makeProblem = (
      httpStatus: number,
      { title, detail, errors }: ApiError<T | CommonErrorCodes>,
    ): Problem => ({
      type: "about:blank",
      title,
      status: httpStatus,
      detail,
      correlationId,
      errors: errors.map(({ code, detail }) => ({
        code: allErrors[code],
        detail,
      })),
    });

    return match<unknown, Problem>(error)
      .with(P.instanceOf(ApiError<T | CommonErrorCodes>), (error) => {
        const problem = makeProblem(getErrorFromStatus(error), error);

        logger.warn(makeProblemLogString(problem, error));
        return problem;
      })
      .otherwise((error: unknown) => {
        const problem = makeProblem(500, genericError("Unexpected error"));
        logger.error(makeProblemLogString(problem, error));
        return problem;
      });
  };
}

const errorCodes = {
  jwtDecodingError: "9001",
  operationForbidden: "9989",
  invalidClaim: "9990",
  genericError: "9991",
  unauthorizedError: "9993",
  missingHeader: "9994",
  badRequestError: "9999",
  jwtNotPresent: "10000",
} as const;

export type CommonErrorCodes = keyof typeof errorCodes;

export function parseErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.message;
    // return fromZodError(error).message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return `${JSON.stringify(error)}`;
}

/* ===== Internal Error ===== */

export function genericInternalError(
  message: string,
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "genericError",
    detail: message,
  });
}

/* ===== API Error ===== */

export function genericError(details: string): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail: details,
    code: "genericError",
    title: "Unexpected error",
  });
}

export function unauthorizedError(
  details: string,
): ApiError<"unauthorizedError"> {
  return new ApiError({
    detail: details,
    code: "unauthorizedError",
    title: "Unauthorized",
  });
}

export function badRequestError(
  detail: string,
  errors: Error[],
): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail,
    code: "badRequestError",
    title: "Bad request",
    errors,
  });
}

export function invalidClaim(error: unknown): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail: `Claim not valid or missing: ${parseErrorMessage(error)}`,
    code: "invalidClaim",
    title: "Claim not valid or missing",
  });
}

export function jwtDecodingError(error: unknown): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail: `Unexpected error on JWT decoding: ${parseErrorMessage(error)}`,
    code: "jwtDecodingError",
    title: "JWT decoding error",
  });
}

export function missingHeader(headerName?: string): ApiError<CommonErrorCodes> {
  const title = "Header has not been passed";
  return new ApiError({
    detail: headerName
      ? `Header ${headerName} not existing in this request`
      : title,
    code: "missingHeader",
    title,
  });
}

export const missingBearer: ApiError<"missingHeader"> = new ApiError({
  detail: `Authorization Illegal header key.`,
  code: "missingHeader",
  title: "Bearer token has not been passed",
});

export const jwtNotPresent: ApiError<"jwtNotPresent"> = new ApiError({
  detail: `JWT token has not been passed`,
  code: "jwtNotPresent",
  title: "JWT token has not been passed",
});

export const operationForbidden: ApiError<"operationForbidden"> = new ApiError({
  detail: `Insufficient privileges`,
  code: "operationForbidden",
  title: "Insufficient privileges",
});
