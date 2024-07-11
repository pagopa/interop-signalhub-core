import { Signal, SignalMessage } from "pagopa-signalhub-commons";

export function toSignal(signalMessage: SignalMessage): Signal {
  return {
    correlationId: signalMessage.correlationId,
    signalId: signalMessage.signalId,
    signalType: signalMessage.signalType,
    objectId: signalMessage.objectId,
    eserviceId: signalMessage.eserviceId,
    objectType: signalMessage.objectType,
  };
}
