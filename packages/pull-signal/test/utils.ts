import { SignalMessage, SignalResponse } from "pagopa-signalhub-commons";
import {
  setupTestContainersVitest,
  signalConsumer
} from "pagopa-signalhub-commons-test";
import { inject } from "vitest";

import { interopServiceBuilder } from "../src/services/interop.service.js";
import { signalServiceBuilder } from "../src/services/signal.service.js";

export const { cleanup, postgresDB, sqsClient } =
  await setupTestContainersVitest(
    inject("signalHubStoreConfig"),
    inject("sqsConfig")
  );

export const interopService = interopServiceBuilder(postgresDB);
export const signalService = signalServiceBuilder(postgresDB);

export const toSignal = (signal: SignalMessage): SignalResponse => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correlationId, ...expectedSignal } = signal;
  return expectedSignal;
};

export const waitForSeconds = (seconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });

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
  state: "fake-state"
};
