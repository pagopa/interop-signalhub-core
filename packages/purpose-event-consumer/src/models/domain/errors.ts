import { InternalError } from "pagopa-signalhub-commons";

const errorCodes = {
  noVersionsInValidState: "0001"
} as const;

export type PurposeErrorCodes = keyof typeof errorCodes;

export function kafkaInvalidVersion(): InternalError<PurposeErrorCodes> {
  return new InternalError({
    code: "noVersionsInValidState",
    detail: `Missing valid version within versions Array`
  });
}
