import { ApiError, makeApiProblemBuilder } from "signalhub-commons";

export const errorCodes = {
  dbError: "0001",
};

export const makeProblem = makeApiProblemBuilder(errorCodes);
export type ErrorCodes = keyof typeof errorCodes;

export function databaseError(): ApiError<ErrorCodes> {
  return new ApiError({
    detail: "Database error",
    code: "dbError",
    title: "Database error",
  });
}
