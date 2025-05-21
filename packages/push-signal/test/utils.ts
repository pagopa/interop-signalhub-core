import {
  setupTestContainersVitest,
  signalProducer
} from "pagopa-signalhub-commons-test";
import { inject } from "vitest";

import { PushServiceConfig } from "../src/config/env.js";
import { interopServiceBuilder } from "../src/services/interop.service.js";
import { queueServiceBuilder } from "../src/services/queque.service.js";
import { signalServiceBuilder } from "../src/services/signal.service.js";

export const { cleanup, postgresDB, sqsClient } =
  await setupTestContainersVitest(
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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomInt(min = 1, max = 100): number {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

export function outSideTimeWindow(timeWindowInSeconds: number) {
  return timeWindowInSeconds * 1000 + 500;
}

export function withinTimeWindow(timeWindowInSeconds: number) {
  return timeWindowInSeconds * 1000 - 500;
}
