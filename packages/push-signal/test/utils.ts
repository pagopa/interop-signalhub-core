import {
  setupTestContainersVitest,
  signalProducer
} from "pagopa-signalhub-commons-test";
import { inject } from "vitest";

import { interopServiceBuilder } from "../src/services/interop.service.js";
import { queueServiceBuilder } from "../src/services/queque.service.js";
import { signalServiceBuilder } from "../src/services/signal.service.js";

export const { cleanup, postgresDB, sqsClient } = setupTestContainersVitest(
  inject("signalHubStoreConfig"),
  inject("sqsConfig")
);

export const signalService = signalServiceBuilder(postgresDB);
export const quequeService = queueServiceBuilder(sqsClient);
export const interopService = interopServiceBuilder(postgresDB);

export const aValidMockAgreement = {
  consumerId: signalProducer.id,
  id: "fake-agreement-id",
  eServiceId: "fake-eservice-id",
  purposeId: "fake-purpose-id",
  descriptorId: "fake-descriptor-id",
  producerId: "fake-producer-id",
  state: "fake-state"
};
