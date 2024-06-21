import {
  setupTestContainersVitest,
  signalConsumer,
} from "signalhub-commons-test";
import { inject } from "vitest";
import { SignalMessage, SignalResponse } from "signalhub-commons";
import { signalServiceBuilder } from "../src/services/signal.service";
import { interopServiceBuilder } from "../src/services/interop.service";
import { interopApiClientServiceBuilder } from "../src/services/interopApiClient.service";

export const { cleanup, postgresDB, sqsClient } = setupTestContainersVitest(
  inject("signalHubStoreConfig"),
  inject("sqsConfig")
);

export const interopApiClient = interopApiClientServiceBuilder();

export const interopService = interopServiceBuilder(
  postgresDB,
  interopApiClient
);
export const signalService = signalServiceBuilder(postgresDB);

export const toSignal = (signal: SignalMessage): SignalResponse => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correlationId, ...expectedSignal } = signal;
  return expectedSignal;
};

export const toSignals = (signals: SignalMessage[]): SignalResponse[] =>
  signals.map(toSignal);

export const sortSignalsBySignalId = (
  signals: SignalResponse[]
): SignalResponse[] => [...signals].sort((a, b) => a.signalId - b.signalId);

export const aValidMockAgreement = {
  consumerId: signalConsumer.id,
  id: "fake-agreement-id",
  eServiceId: "fake-eservice-id",
  purposeId: "fake-purpose-id",
  descriptorId: "fake-descriptor-id",
  producerId: "fake-producer-id",
  state: "fake-state",
};
