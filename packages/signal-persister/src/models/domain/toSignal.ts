import { Signal, SignalMessage } from "pagopa-signalhub-commons";

export function toSignal(signalMessage: SignalMessage): Signal {
  return {
    correlationId: signalMessage.correlationId,
    eserviceId: signalMessage.eserviceId,
    objectId: signalMessage.objectId,
    objectType: signalMessage.objectType,
    signalId: signalMessage.signalId,
    signalType: signalMessage.signalType,
  };
}
