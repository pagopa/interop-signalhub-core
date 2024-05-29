export enum ErrorType {
  DUPLICATE_SIGNAL_ERROR = "DUPLICATE_SIGNAL_ERROR",
}

const errorDetails = new Map<ErrorType, string>([
  [ErrorType.DUPLICATE_SIGNAL_ERROR, "The signal is already saved on database"],
]);

export function getErrorReason(type: ErrorType): string {
  return errorDetails.get(type)!;
}
