import { ApiError, makeApiProblemBuilder } from "signalhub-commons";

export const errorCodes = {
  signalDuplicate: "0001",
  signalNotSended: "0002",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export function signalIdDuplicatedForEserviceId(
  signalId: number,
  eserviceId: string
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during Signal creation with signalId ${signalId} and eserviceId ${eserviceId}`,
    code: "signalDuplicate",
    title: "Duplicated signalId for an eserviceId",
  });
}

export function signalNotSendedToQueque(
  signalId: number,
  error: string
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during Signal sending with RequestId ${signalId}, error: ${error}`,
    code: "signalNotSended",
    title: "Signal not sended to queque",
  });
}
