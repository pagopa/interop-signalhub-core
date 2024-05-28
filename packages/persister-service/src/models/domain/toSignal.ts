import { Signal, SignalEvent } from "./models.js";

export function toSignal(
  signalEvent: SignalEvent,
  correlationId: string
): Signal {
  return {
    correlationId,
    signalId: signalEvent.signalId,
    signalType: signalEvent.signalType,
    objectId: signalEvent.objectId,
    eserviceId: signalEvent.eserviceId,
    objectType: signalEvent.objectType,
    tmstInsert: new Date().toISOString(),
  };
}
