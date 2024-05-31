import { Signal, SignalMessage } from "signalhub-commons";

export function toSignal(signalEvent: SignalMessage): Signal {
  return {
    correlationId: signalEvent.correlationId,
    signalId: signalEvent.signalId,
    signalType: signalEvent.signalType,
    objectId: signalEvent.objectId,
    eserviceId: signalEvent.eserviceId,
    objectType: signalEvent.objectType,
  };
}
