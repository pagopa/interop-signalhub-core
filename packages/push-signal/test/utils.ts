import {
  setupTestContainersVitest,
  signalProducer,
} from "pagopa-signalhub-commons-test";
import { inject } from "vitest";

import { quequeServiceBuilder } from "../src/services/queque.service.js";
import { signalServiceBuilder } from "../src/services/signal.service.js";
import { interopServiceBuilder } from "../src/services/interop.service.js";
import { interopApiClientServiceBuilder } from "../src/services/interopApiClient.service.js";

export const { cleanup, postgresDB, sqsClient } = setupTestContainersVitest(
  inject("signalHubStoreConfig"),
  inject("sqsConfig")
);

export const signalService = signalServiceBuilder(postgresDB);
export const quequeService = quequeServiceBuilder(sqsClient);
export const interopApiClient = interopApiClientServiceBuilder();
export const interopService = interopServiceBuilder(
  postgresDB,
  interopApiClient
);

export const aValidMockAgreement = {
  consumerId: signalProducer.id,
  id: "fake-agreement-id",
  eServiceId: "fake-eservice-id",
  purposeId: "fake-purpose-id",
  descriptorId: "fake-descriptor-id",
  producerId: "fake-producer-id",
  state: "fake-state",
};
