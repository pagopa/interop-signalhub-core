import { P, match } from "ts-pattern";
import { ZodError, z } from "zod";

export class ApiError<T> extends Error {
  /* TODO consider refactoring how the code property is used:
    From the API point of view, it is an info present only in the single error
    in the errors array - not in the main Problem response.
    However, at the moment we need it because it is used around the codebase to
    map ApiError to a specific HTTP status code.
    */
  public code: T;
  public correlationId?: string;
  public detail: string;
  public errors: { code: T; detail: string }[];
  public title: string;

  constructor({
    code,
    title,
    detail,
    correlationId,
    errors
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

// zod object

export const Problem = z.object({
  type: z.string(),
  status: z.number(),
  title: z.string(),
  correlationId: z.string().nullish(),
  detail: z.string(),
  errors: z.array(
    z.object({
      code: z.string(),
      detail: z.string()
    })
  )
  // toString: z.function(),
});
export type Problem = z.infer<typeof Problem>;

export type MakeApiProblemFn<T extends string> = (
  error: unknown,
  httpMapper: (apiError: ApiError<T | CommonErrorCodes>) => number,
  logger: {
    error: (message: string) => void;
    warn: (message: string) => void;
  },
  correlationId: string
) => Problem;

const makeProblemLogString = (
  problem: Problem,
  originalError: unknown
): string => {
  const errorsString = problem.errors.map((e) => e.detail).join(" - ");
  return `Problem - title: ${problem.title} - detail: ${problem.detail} - errors: ${errorsString} - original error: ${originalError}`;
};

export function makeApiProblemBuilder<T extends string>(errors: {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [K in T]: string;
}): MakeApiProblemFn<T> {
  const allErrors = { ...errorCodes, ...errors };
  return (error, getErrorFromStatus, logger, correlationId) => {
    const makeProblem = (
      httpStatus: number,
      { title, detail, errors }: ApiError<T | CommonErrorCodes>
    ): Problem => ({
      type: "about:blank",
      title,
      status: httpStatus,
      detail,
      correlationId,
      errors: errors.map(({ code, detail }) => ({
        code: allErrors[code],
        detail
      }))
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
  kafkaMessageValueError: "9996",
  kafkaMessageProcessError: "9997",
  kafkaMessageMissingData: "9998",
  badJsonFormat: "9995"
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
  message: string
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "genericError",
    detail: message
  });
}

/* ===== API Error ===== */

export function genericError(details: string): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail: details,
    code: "genericError",
    title: "Unexpected error"
  });
}

export function unauthorizedError(
  details: string
): ApiError<"unauthorizedError"> {
  return new ApiError({
    detail: details,
    code: "unauthorizedError",
    title: "Unauthorized"
  });
}

export function badRequestError(
  detail: string,
  errors: Error[]
): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail,
    code: "badRequestError",
    title: "Bad request",
    errors
  });
}

export function invalidClaim(error: unknown): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail: `Claim not valid or missing: ${parseErrorMessage(error)}`,
    code: "invalidClaim",
    title: "Claim not valid or missing"
  });
}

export function jwtDecodingError(error: unknown): ApiError<CommonErrorCodes> {
  return new ApiError({
    detail: `Unexpected error on JWT decoding: ${parseErrorMessage(error)}`,
    code: "jwtDecodingError",
    title: "JWT decoding error"
  });
}

export function missingHeader(headerName?: string): ApiError<CommonErrorCodes> {
  const title = "Header has not been passed";
  return new ApiError({
    detail: headerName
      ? `Header ${headerName} not existing in this request`
      : title,
    code: "missingHeader",
    title
  });
}

export function kafkaMessageProcessError(
  topic: string,
  partition: number,
  offset: string,
  error?: unknown
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "kafkaMessageProcessError",
    detail: `Error while handling kafka message from topic : ${topic} - partition ${partition} - offset ${offset}. ${
      error ? parseErrorMessage(error) : ""
    }`
  });
}

export function kafkaMissingMessageValue(
  topic: string
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "kafkaMessageValueError",
    detail: `Missing value message in kafka message from topic: ${topic}`
  });
}
export function kafkaMessageMissingData(
  topic: string,
  eventType: string
): InternalError<CommonErrorCodes> {
  return new InternalError({
    code: "kafkaMessageMissingData",
    detail: `Missing data in kafka message from topic: ${topic} and event type: ${eventType}`
  });
}

export const missingBearer = new ApiError<"missingHeader">({
  detail: `Authorization Illegal header key.`,
  code: "missingHeader",
  title: "Bearer token has not been passed"
});

export const jwtNotPresent = new ApiError<"jwtNotPresent">({
  detail: `JWT token has not been passed`,
  code: "jwtNotPresent",
  title: "JWT token has not been passed"
});

export const operationForbidden = new ApiError<"operationForbidden">({
  detail: `Insufficient privileges`,
  code: "operationForbidden",
  title: "Insufficient privileges"
});

export const jsonMalformed = new ApiError<"jsonMalformed">({
  detail: "Json is not formatted correctly",
  code: "jsonMalformed",
  title: "Body malformed"
});

export * from "./parser.middleware.js";
