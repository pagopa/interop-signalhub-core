import { SignalRequest } from "signalhub-commons";

const signalRequestToSignalMessage = (
  signalRequest: SignalRequest,
  correlationId: string
) => {
  const { signalId, eserviceId, signalType, objectId, objectType } =
    signalRequest;
  return {
    signalId,
    eserviceId,
    signalType,
    objectId,
    objectType,
    correlationId,
  };
};

export default signalRequestToSignalMessage;
