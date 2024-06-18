import { setupTestContainersVitest } from "signalhub-commons-test";
import { afterEach, inject } from "vitest";
import { SignalMessage, SignalResponse } from "signalhub-commons";
import { signalServiceBuilder } from "../src/services/signal.service";
import { interopServiceBuilder } from "../src/services/interop.service";
import { InteropApiClientService } from "../src/services/interopApiClient.service";

export const { cleanup, postgresDB, sqsClient } = setupTestContainersVitest(
  inject("signalHubStoreConfig"),
  inject("sqsConfig")
);

afterEach(cleanup);

function fakeInteropApiClientServiceBuilder(): InteropApiClientService {
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async getAgreementByPurposeId(_purposeId: string) {
      const agreement = {
        consumerId: "fake-consumer-id",
        id: "fake-agreement-id",
        eServiceId: "fake-eservice-id",
        purposeId: "fake-purpose-id",
        descriptorId: "fake-descriptor-id",
        producerId: "fake-producer-id",
        state: "ACTIVE",
      };
      return Promise.resolve(agreement);
    },
  };
}

export const interopService = interopServiceBuilder(
  postgresDB,
  fakeInteropApiClientServiceBuilder()
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
